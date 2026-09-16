"""Hooks de alto nivel: reserva chat → CLIENTE_POTENCIAL en iGEO."""

from __future__ import annotations

import logging
from typing import Any

from .client import IgeoPdiClient, PublishResult
from .config import get_igeo_settings, is_igeo_enabled
from .mirror import log_sync_result
from .payloads import build_cliente_potencial, split_person_name

logger = logging.getLogger(__name__)


def _infer_tipo_cliente(property_type: str | None, chat_diagnostic: dict | None) -> str:
    raw = (property_type or "").strip().lower()
    diag = chat_diagnostic or {}
    path = str(diag.get("path") or diag.get("who") or "").strip().lower()
    blob = f"{raw} {path}"
    if any(k in blob for k in ("empresa", "negoci", "negocio", "business")):
        return "EMPRESA"
    if any(k in blob for k in ("admin", "ajuntament", "ayuntamiento", "publica")):
        return "ADMINISTRACION PUBLICA"
    return "PARTICULAR"


def publish_lead_from_booking(
    *,
    name: str,
    phone: str,
    email: str = "",
    address: str = "",
    notes: str = "",
    booking_uid: str | None = None,
    property_type: str | None = None,
    chat_diagnostic: dict | None = None,
    client: IgeoPdiClient | None = None,
) -> PublishResult | None:
    """
    Tras confirmar cita: publica CLIENTE_POTENCIAL si IGEO_PDI_ENABLED.
    remoteOperationId = uid de la cita CECSA para correlacionar resultados.
    """
    if not is_igeo_enabled():
        return None

    settings = get_igeo_settings()
    if not settings.default_delegacion or not settings.default_gestor:
        logger.warning(
            "iGEO PDI enabled but IGEO_DEFAULT_DELEGACION / IGEO_DEFAULT_GESTOR missing; skip"
        )
        return PublishResult(
            ok=False,
            dry_run=True,
            remote_operation_id=booking_uid,
            message="Faltan IGEO_DEFAULT_DELEGACION o IGEO_DEFAULT_GESTOR",
            payload={},
        )

    first, surname = split_person_name(name)
    tipo = _infer_tipo_cliente(property_type, chat_diagnostic)
    localidad = ""
    if address and "," in address:
        localidad = address.split(",")[-1].strip()[:100]

    try:
        payload = build_cliente_potencial(
            nombre=first or name,
            apellidos=surname,
            codigo_delegacion=settings.default_delegacion,
            codigo_gestionado_por=settings.default_gestor,
            telefono=phone,
            movil=phone,
            email=email,
            direccion=address,
            localidad=localidad or "Barcelona",
            tipo_cliente=tipo,
            observaciones=notes,
            codigo_idioma=settings.default_idioma,
            codigo_actividad=settings.default_actividad,
            codigo_zona_comercial=settings.default_zona_comercial,
            remote_operation_id=str(booking_uid) if booking_uid else None,
            comando="CREATE",
        )
    except ValueError as exc:
        logger.warning("iGEO lead payload invalid: %s", exc)
        return PublishResult(
            ok=False,
            dry_run=True,
            remote_operation_id=booking_uid,
            message=str(exc),
            payload={},
        )

    pdi = client or IgeoPdiClient(settings)
    result = pdi.publish(payload)

    telefono_norm = None
    try:
        from api.phone_utils import normalize_phone

        telefono_norm = normalize_phone(phone)
    except Exception:
        pass

    log_sync_result(
        entity_type="CLIENTE_POTENCIAL",
        comando="CREATE",
        remote_operation_id=result.remote_operation_id,
        ok=result.ok,
        dry_run=result.dry_run,
        message=result.message,
        payload=result.payload,
        telefono_norm=telefono_norm,
    )
    return result


def publish_entity(
    payload: dict[str, Any],
    *,
    client: IgeoPdiClient | None = None,
) -> PublishResult:
    if not is_igeo_enabled():
        return PublishResult(
            ok=False,
            dry_run=True,
            remote_operation_id=payload.get("remoteOperationId"),
            message="IGEO_PDI_ENABLED=false",
            payload=payload,
        )
    pdi = client or IgeoPdiClient()
    result = pdi.publish(payload)
    log_sync_result(
        entity_type=str(payload.get("tipoEntidadIgeo") or ""),
        comando=str(payload.get("comando") or ""),
        remote_operation_id=result.remote_operation_id,
        ok=result.ok,
        dry_run=result.dry_run,
        message=result.message,
        payload=result.payload,
    )
    return result
