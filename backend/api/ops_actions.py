"""Ejecución de acciones ops ya confirmadas por el operario (sin LLM)."""

from __future__ import annotations

from typing import Any

from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.payloads import build_cliente_potencial
from api.igeo.sync import publish_entity
from api.openwa import OpenWaClient, OpenWaError, human_whatsapp_dest
from api.ops_email import send_ops_email


ALLOWED_KINDS = frozenset({"whatsapp", "email", "igeo_lead"})


def pending_action_dict(action: Any) -> dict[str, Any] | None:
    """Serializa OpsPendingAction / dict a JSON seguro para el frontend."""
    if action is None:
        return None
    if hasattr(action, "model_dump"):
        data = action.model_dump()
    elif isinstance(action, dict):
        data = dict(action)
    else:
        return None
    kind = str(data.get("kind") or "").strip().lower()
    if kind not in ALLOWED_KINDS:
        return None
    summary = (data.get("summary") or "").strip()
    if not summary:
        return None
    return {
        "kind": kind,
        "summary": summary[:500],
        # chatId @lid pot ser llarg; el mantenim intern (no es mostra al xat).
        "telefono": str(data.get("telefono") or "").strip()[:80],
        "mensaje": str(data.get("mensaje") or "").strip()[:3500],
        "to_email": str(data.get("to_email") or "").strip()[:200],
        "subject": str(data.get("subject") or "").strip()[:200],
        "body": str(data.get("body") or "").strip()[:8000],
        "cc": str(data.get("cc") or "").strip()[:400],
        "nombre": str(data.get("nombre") or "").strip()[:200],
        "email": str(data.get("email") or "").strip()[:200],
        "direccion": str(data.get("direccion") or "").strip()[:400],
        "observaciones": str(data.get("observaciones") or "").strip()[:1000],
    }


def human_pending_dest(action: dict[str, Any] | None) -> str:
    """Nom + telèfon per al xat; amaga @lid."""
    if not action:
        return "el contacte"
    name = str(action.get("nombre") or "").strip()
    if not name:
        # Fallback: «WhatsApp a Mauro Montenegro: …» / «Salut Mauro».
        summary = str(action.get("summary") or "").strip()
        for prefix in ("WhatsApp a ", "WhatsApp a", "Salut a ", "Saludo a ", "Salut ", "a "):
            if summary.lower().startswith(prefix.lower()):
                rest = summary[len(prefix) :].strip()
                name = rest.split(":")[0].strip()
                break
        if name and ("@" in name or len(name) > 80):
            name = ""
    return human_whatsapp_dest(
        str(action.get("telefono") or ""),
        name=name,
    )


def execute_confirmed_action(action: dict[str, Any], *, conversation_id: int | None = None) -> str:
    """Ejecuta whatsapp / email / igeo_lead tras confirmación UI. Devuelve texto para el xat."""
    normalized = pending_action_dict(action)
    if not normalized:
        return "Acció no vàlida o incompleta. No s'ha executat res."

    kind = normalized["kind"]
    if kind == "whatsapp":
        return _exec_whatsapp(normalized)
    if kind == "email":
        return _exec_email(normalized)
    if kind == "igeo_lead":
        return _exec_igeo_lead(normalized, conversation_id=conversation_id)
    return f"Tipus d'acció desconegut: {kind}"


def _exec_whatsapp(action: dict[str, Any]) -> str:
    telefono = (action.get("telefono") or "").strip()
    mensaje = (action.get("mensaje") or "").strip()
    if not telefono or not mensaje:
        missing = []
        if not telefono:
            missing.append("destinatari (id/@lid o mòbil)")
        if not mensaje:
            missing.append("text del missatge")
        return (
            f"Falten {', '.join(missing)}. No s'ha enviat el WhatsApp. "
            "Escriu el text a enviar i després «sí» per confirmar."
        )
    try:
        result = OpenWaClient().send_text(telefono, mensaje)
    except OpenWaError as exc:
        return f"No enviat: {exc}"
    except Exception as exc:
        return f"Error OpenWA: {exc}"
    if not result.ok:
        return f"No enviat: {result.message}"
    dest = human_pending_dest(action)
    if result.dry_run:
        return f"DRY-RUN (no enviat de veritat) a {dest}: {result.message}"
    return f"WhatsApp enviat a {dest}."


def _exec_email(action: dict[str, Any]) -> str:
    result = send_ops_email(
        to_email=action["to_email"],
        subject=action["subject"],
        body=action["body"],
        cc=action["cc"],
    )
    if not result.ok:
        return f"No enviat: {result.message}"
    if result.dry_run:
        return f"DRY-RUN (no enviat de veritat): {result.message}"
    return f"Correu enviat. {result.message}"


def _exec_igeo_lead(action: dict[str, Any], *, conversation_id: int | None = None) -> str:
    if not is_igeo_enabled():
        return "iGEO PDI deshabilitat. El lead NO s'ha enviat a iGEO."
    settings = get_igeo_settings()
    if not settings.default_delegacion or not settings.default_gestor:
        return "Falten IGEO_DEFAULT_DELEGACION / IGEO_DEFAULT_GESTOR."
    nombre = action["nombre"]
    if len(nombre) < 2:
        return "Cal un nom vàlid per al lead iGEO."
    try:
        payload = build_cliente_potencial(
            nombre=nombre,
            codigo_delegacion=settings.default_delegacion,
            codigo_gestionado_por=settings.default_gestor,
            telefono=action["telefono"],
            movil=action["telefono"],
            email=action["email"],
            direccion=action["direccion"],
            observaciones=action["observaciones"],
            codigo_idioma=settings.default_idioma,
            codigo_actividad=settings.default_actividad,
            codigo_zona_comercial=settings.default_zona_comercial,
            remote_operation_id=f"ops-confirm-{conversation_id}" if conversation_id else None,
        )
    except ValueError as exc:
        return f"Error payload: {exc}"
    result = publish_entity(payload)
    return f"ok={result.ok} dry_run={result.dry_run} — {result.message}"
