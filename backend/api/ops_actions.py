"""Ejecución de acciones ops ya confirmadas por el operario (sin LLM)."""

from __future__ import annotations

from typing import Any

from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.payloads import build_cliente_potencial
from api.igeo.sync import publish_entity
from api.openwa import OpenWaClient, OpenWaError, human_whatsapp_dest
from api.ops_email import send_ops_email


ALLOWED_KINDS = frozenset({"whatsapp", "email", "igeo_lead", "batch"})
SINGLE_KINDS = frozenset({"whatsapp", "email", "igeo_lead"})
MAX_PENDING_ITEMS = 10


def _normalize_single(data: dict[str, Any]) -> dict[str, Any] | None:
    kind = str(data.get("kind") or "").strip().lower()
    if kind not in SINGLE_KINDS:
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


def _batch_summary(items: list[dict[str, Any]]) -> str:
    n = len(items)
    counts: dict[str, int] = {}
    for item in items:
        k = str(item.get("kind") or "")
        counts[k] = counts.get(k, 0) + 1
    parts: list[str] = []
    if counts.get("whatsapp"):
        parts.append(f"{counts['whatsapp']} WhatsApp")
    if counts.get("email"):
        parts.append(f"{counts['email']} correu(s)")
    if counts.get("igeo_lead"):
        parts.append(f"{counts['igeo_lead']} lead(s)")
    detail = ", ".join(parts) if parts else f"{n} accions"
    return f"Lot de {n}: {detail}"[:500]


def coalesce_pending_actions(actions: list[Any]) -> dict[str, Any] | None:
    """1 acció → objecte simple; 2+ → kind=batch. Cap a MAX_PENDING_ITEMS."""
    items: list[dict[str, Any]] = []
    for raw in actions or []:
        normalized = pending_action_dict(raw)
        if not normalized:
            continue
        if normalized["kind"] == "batch":
            items.extend(pending_items(normalized))
        else:
            items.append(normalized)
        if len(items) >= MAX_PENDING_ITEMS:
            items = items[:MAX_PENDING_ITEMS]
            break
    if not items:
        return None
    if len(items) == 1:
        return items[0]
    return {
        "kind": "batch",
        "summary": _batch_summary(items),
        "items": items,
        "telefono": "",
        "mensaje": "",
        "to_email": "",
        "subject": "",
        "body": "",
        "cc": "",
        "nombre": "",
        "email": "",
        "direccion": "",
        "observaciones": "",
    }


def enqueue_pending_action(
    existing: Any,
    new_action: Any,
) -> tuple[dict[str, Any] | None, str]:
    """Afegeix una acció a la cua pendent (o la crea). Retorna (pending, error)."""
    new_item = pending_action_dict(new_action)
    if not new_item or new_item["kind"] == "batch":
        return None, "Acció nova no vàlida."
    current_items = pending_items(existing)
    if len(current_items) >= MAX_PENDING_ITEMS:
        return None, f"Ja hi ha {MAX_PENDING_ITEMS} accions pendents. Confirma o cancel·la abans."
    return coalesce_pending_actions([*current_items, new_item]), ""


def pending_items(action: Any) -> list[dict[str, Any]]:
    """Llista plana d'accions individuals (batch → items)."""
    normalized = pending_action_dict(action)
    if not normalized:
        return []
    if normalized["kind"] == "batch":
        return list(normalized.get("items") or [])
    return [normalized]


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
    if kind == "batch":
        raw_items = data.get("items") or []
        if not isinstance(raw_items, list):
            return None
        items: list[dict[str, Any]] = []
        for raw in raw_items[:MAX_PENDING_ITEMS]:
            item = _normalize_single(raw if isinstance(raw, dict) else {})
            if item:
                items.append(item)
        if not items:
            return None
        summary = (data.get("summary") or "").strip() or _batch_summary(items)
        return {
            "kind": "batch",
            "summary": summary[:500],
            "items": items,
            "telefono": "",
            "mensaje": "",
            "to_email": "",
            "subject": "",
            "body": "",
            "cc": "",
            "nombre": "",
            "email": "",
            "direccion": "",
            "observaciones": "",
        }
    return _normalize_single(data)


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


def format_pending_preview(action: dict[str, Any] | None) -> str:
    """Text curt per al xat: què queda pendent d'enviar."""
    items = pending_items(action)
    if not items:
        return ""
    if len(items) == 1:
        item = items[0]
        kind = item["kind"]
        if kind == "whatsapp":
            dest = human_pending_dest(item)
            msg = (item.get("mensaje") or "").strip()
            if msg:
                preview = msg if len(msg) <= 280 else msg[:277] + "…"
                return (
                    f"Pendents d'enviar a WhatsApp ({dest}):\n«{preview}»\n"
                    "Escriu «sí» per confirmar o «cancel·la»."
                )
            return (
                f"Escriu ara el text del WhatsApp per a {dest}. "
                "Després digues «sí» per enviar."
            )
        if kind == "email":
            return (
                f"Correu pendent a {item.get('to_email')}: «{item.get('subject')}».\n"
                "Escriu «sí» per enviar o «cancel·la»."
            )
        return (
            f"Lead iGEO pendent: {item.get('nombre') or item.get('summary')}.\n"
            "Escriu «sí» per enviar o «cancel·la»."
        )

    lines = [f"Pendents d'enviar ({len(items)}). Un sol «sí» ho envia tot:"]
    for i, item in enumerate(items, start=1):
        kind = item["kind"]
        if kind == "whatsapp":
            dest = human_pending_dest(item)
            msg = (item.get("mensaje") or "").strip()
            snippet = f"«{msg[:80]}»" if msg else "(falta el text)"
            lines.append(f"{i}. WhatsApp → {dest}: {snippet}")
        elif kind == "email":
            lines.append(
                f"{i}. Email → {item.get('to_email')}: «{(item.get('subject') or '')[:60]}»"
            )
        else:
            lines.append(f"{i}. Lead iGEO → {item.get('nombre') or item.get('summary')}")
    lines.append("Escriu «sí» per confirmar o «cancel·la».")
    return "\n".join(lines)


def first_incomplete_whatsapp(action: dict[str, Any] | None) -> tuple[int, dict[str, Any]] | None:
    """Índex + item del primer WhatsApp sense cos de missatge."""
    for idx, item in enumerate(pending_items(action)):
        if item.get("kind") == "whatsapp" and not (item.get("mensaje") or "").strip():
            return idx, item
    return None


def set_item_mensaje(action: dict[str, Any], index: int, mensaje: str) -> dict[str, Any] | None:
    """Actualitza el missatge d'un ítem WhatsApp i re-coalesce."""
    items = pending_items(action)
    if index < 0 or index >= len(items):
        return pending_action_dict(action)
    body = (mensaje or "").strip()[:3500]
    items[index] = dict(items[index])
    items[index]["mensaje"] = body
    dest = human_pending_dest(items[index])
    items[index]["summary"] = f"WhatsApp a {dest}: {body[:80]}"
    return coalesce_pending_actions(items)


def execute_confirmed_action(action: dict[str, Any], *, conversation_id: int | None = None) -> str:
    """Ejecuta whatsapp / email / igeo_lead / batch tras confirmación. Devuelve texto para el xat."""
    normalized = pending_action_dict(action)
    if not normalized:
        return "Acció no vàlida o incompleta. No s'ha executat res."

    if normalized["kind"] == "batch":
        items = pending_items(normalized)
        if not items:
            return "Lot buit. No s'ha executat res."
        incomplete = first_incomplete_whatsapp(normalized)
        if incomplete is not None:
            dest = human_pending_dest(incomplete[1])
            return (
                f"Encara falta el text d'un WhatsApp ({dest}). "
                "Escriu el missatge i després «sí»."
            )
        results: list[str] = []
        ok = 0
        for i, item in enumerate(items, start=1):
            result = _execute_single(item, conversation_id=conversation_id)
            results.append(f"{i}/{len(items)} {result}")
            low = result.casefold()
            if "no enviat" in low or low.startswith("error ") or "falt" in low or "deshabilitat" in low:
                continue
            ok += 1
        header = f"Lot: {ok}/{len(items)} enviats amb èxit."
        return header + "\n" + "\n".join(results)

    return _execute_single(normalized, conversation_id=conversation_id)


def _execute_single(action: dict[str, Any], *, conversation_id: int | None = None) -> str:
    kind = action["kind"]
    if kind == "whatsapp":
        return _exec_whatsapp(action)
    if kind == "email":
        return _exec_email(action)
    if kind == "igeo_lead":
        return _exec_igeo_lead(action, conversation_id=conversation_id)
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
