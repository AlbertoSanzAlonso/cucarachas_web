"""Ingesta de exportaciones PDI → espejo SQL (funciona sin RabbitMQ)."""

from __future__ import annotations

import logging
from typing import Any

from api.phone_utils import normalize_phone

logger = logging.getLogger(__name__)

_TIPO_ALIASES = {
    "ORDEN_DE_TRABAJO": "ORDEN_DE_TRABAJO",
    "ORDENDETRABAJO": "ORDEN_DE_TRABAJO",
    "ORDEN DE TRABAJO": "ORDEN_DE_TRABAJO",
}


def normalize_entity_type(raw: str) -> str:
    value = (raw or "").strip()
    if not value:
        return ""
    compact = value.upper().replace(" ", "_")
    if compact in _TIPO_ALIASES:
        return _TIPO_ALIASES[compact]
    if compact.replace("_", "") == "ORDENDETRABAJO":
        return "ORDEN_DE_TRABAJO"
    return compact


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _str(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def extract_fields(payload: dict[str, Any]) -> dict[str, Any]:
    """Normaliza un mensaje PDI (export o import) a campos de búsqueda."""
    envelope = payload if isinstance(payload, dict) else {}
    datos = _as_dict(envelope.get("datos") or envelope.get("data"))
    contacto = _as_dict(datos.get("datosContacto"))
    postal = _as_dict(datos.get("datosPostales"))

    entity_type = normalize_entity_type(
        _str(envelope.get("tipoEntidadIgeo") or envelope.get("claseEntidadIgeo") or datos.get("tipoEntidadIgeo"))
    )
    comando = _str(envelope.get("comando") or envelope.get("comandoEntidad")).upper()
    codigo = _str(
        envelope.get("codigoEntidadIgeo")
        or datos.get("codigo")
        or datos.get("codigoEntidadIgeo")
        or datos.get("codigoCliente")
        or datos.get("numero")
    )
    remote_id = _str(envelope.get("remoteOperationId") or envelope.get("remote_operation_id"))

    nombre = _str(
        datos.get("nombre")
        or datos.get("razonSocial")
        or datos.get("descripcion")
        or datos.get("numero")
    )
    apellidos = _str(datos.get("apellidos"))
    display = f"{nombre} {apellidos}".strip() or _str(datos.get("titulo")) or codigo or remote_id

    telefono = _str(contacto.get("movil") or contacto.get("telefono") or datos.get("telefono") or datos.get("movil"))
    email = _str(contacto.get("email") or datos.get("email"))
    direccion = _str(postal.get("direccion") or datos.get("direccion"))
    localidad = _str(postal.get("localidad") or datos.get("localidad") or datos.get("poblacion"))
    estado = _str(datos.get("estado") or envelope.get("estado"))

    return {
        "entity_type": entity_type,
        "comando": comando,
        "igeo_codigo": codigo[:64],
        "remote_operation_id": remote_id[:128],
        "display_name": display[:255],
        "telefono": telefono[:32],
        "telefono_norm": normalize_phone(telefono),
        "email": email[:254],
        "direccion": direccion[:255],
        "localidad": localidad[:120],
        "estado": estado[:64],
        "is_deleted": comando == "DELETE",
    }


def make_source_key(*, entity_type: str, igeo_codigo: str, remote_operation_id: str) -> str:
    tipo = (entity_type or "ENTIDAD").strip() or "ENTIDAD"
    if igeo_codigo:
        return f"{tipo}:{igeo_codigo}"[:180]
    if remote_operation_id:
        return f"{tipo}:remote:{remote_operation_id}"[:180]
    raise ValueError("El payload no tiene codigoEntidadIgeo ni remoteOperationId")


def ingest_export_payload(payload: dict[str, Any], *, source: str = "export"):
    """Crea o actualiza una fila del espejo. Devuelve (entity, created)."""
    from api.models import Cliente, IgeoMirrorEntity

    fields = extract_fields(payload)
    if not fields["entity_type"]:
        raise ValueError("tipoEntidadIgeo vacío")
    source_key = make_source_key(
        entity_type=fields["entity_type"],
        igeo_codigo=fields["igeo_codigo"],
        remote_operation_id=fields["remote_operation_id"],
    )
    cliente = None
    if fields["telefono_norm"]:
        cliente = Cliente.objects.filter(telefono_norm=fields["telefono_norm"]).first()
        if cliente and fields["igeo_codigo"] and not cliente.igeo_codigo:
            cliente.igeo_codigo = fields["igeo_codigo"]
            cliente.save(update_fields=["igeo_codigo"])

    defaults = {
        "entity_type": fields["entity_type"],
        "igeo_codigo": fields["igeo_codigo"],
        "remote_operation_id": fields["remote_operation_id"],
        "comando": fields["comando"],
        "display_name": fields["display_name"],
        "telefono": fields["telefono"],
        "telefono_norm": fields["telefono_norm"],
        "email": fields["email"],
        "direccion": fields["direccion"],
        "localidad": fields["localidad"],
        "estado": fields["estado"],
        "is_deleted": fields["is_deleted"],
        "payload": payload,
        "source": (source or "export")[:16],
        "cliente": cliente,
    }
    entity, created = IgeoMirrorEntity.objects.update_or_create(
        source_key=source_key,
        defaults=defaults,
    )
    logger.info(
        "iGEO mirror %s key=%s tipo=%s codigo=%s",
        "create" if created else "update",
        source_key,
        fields["entity_type"],
        fields["igeo_codigo"] or "—",
    )
    return entity, created


def ingest_export_batch(payloads: list[dict[str, Any]], *, source: str = "export") -> dict[str, int]:
    created = updated = errors = 0
    for item in payloads:
        if not isinstance(item, dict):
            errors += 1
            continue
        try:
            _, was_created = ingest_export_payload(item, source=source)
        except Exception as exc:
            logger.warning("iGEO mirror skip: %s", exc)
            errors += 1
            continue
        if was_created:
            created += 1
        else:
            updated += 1
    return {"created": created, "updated": updated, "errors": errors, "total": len(payloads)}


def search_mirror(query: str, *, entity_type: str | None = None, include_deleted: bool = False, limit: int = 8):
    """Búsqueda exacta / icontains sobre el espejo (no embeddings)."""
    from django.db.models import Q

    from api.models import IgeoMirrorEntity

    q = (query or "").strip()
    if len(q) < 2:
        return []
    qs = IgeoMirrorEntity.objects.all()
    if not include_deleted:
        qs = qs.filter(is_deleted=False)
    tipo = normalize_entity_type(entity_type or "")
    if tipo:
        qs = qs.filter(entity_type=tipo)
    digits = normalize_phone(q)
    tokens = [t for t in q.split() if len(t) >= 2]
    filt = (
        Q(display_name__icontains=q)
        | Q(email__icontains=q)
        | Q(telefono__icontains=q)
        | Q(direccion__icontains=q)
        | Q(localidad__icontains=q)
        | Q(igeo_codigo__icontains=q)
        | Q(source_key__icontains=q)
    )
    if len(tokens) >= 2:
        token_filt = Q()
        for tok in tokens:
            token_filt &= Q(display_name__icontains=tok)
        filt = filt | token_filt
    if digits:
        filt = filt | Q(telefono_norm=digits)
    return list(qs.filter(filt).order_by("-updated_at")[: max(1, min(limit, 20))])


def format_mirror_hits(rows) -> str:
    if not rows:
        return "Cap coincidència a l'espill iGEO."
    lines = []
    for row in rows:
        deleted = " [BAIXA]" if row.is_deleted else ""
        lines.append(
            f"{row.entity_type}{deleted} | codi={row.igeo_codigo or '—'} | {row.display_name or '—'} "
            f"| tel={row.telefono or '—'} | email={row.email or '—'} "
            f"| {row.direccion or '—'} {row.localidad or ''} | estat={row.estado or '—'}"
        )
    return "\n".join(lines)


def mirror_counts() -> str:
    from django.db.models import Count

    from api.models import IgeoMirrorEntity

    total = IgeoMirrorEntity.objects.filter(is_deleted=False).count()
    by_type = (
        IgeoMirrorEntity.objects.filter(is_deleted=False)
        .values("entity_type")
        .annotate(n=Count("id"))
        .order_by("entity_type")
    )
    parts = [f"{row['entity_type']}={row['n']}" for row in by_type]
    return f"actius={total}" + (f" ({', '.join(parts)})" if parts else " (buit)")
