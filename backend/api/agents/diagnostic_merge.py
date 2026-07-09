"""Fusiona datos del formulario de diagnóstico en AgentState (sesión)."""
from __future__ import annotations

import re
from typing import Any

from .models import AgentState, Intent, PestType, Severity

_EMPTY = frozenset({"no especificat", "no especificado", "cap", "ninguna", "-", ""})
_WIZARD_PATHS = frozenset({"particular", "empresa", "admin", "comunidad"})


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if text.lower() in _EMPTY:
        return None
    return text


def _tier_particular(diagnostic: dict) -> str:
    urgency = _clean(diagnostic.get("urgency"))
    quantity = _clean(diagnostic.get("quantity"))
    if urgency == "yes_urgent" or quantity in ("many", "nests"):
        return "urgent"
    if urgency == "this_week" or quantity == "several":
        return "moderate"
    return "info"


def _tier_empresa(diagnostic: dict) -> str:
    risk = _clean(diagnostic.get("sanitary_risk"))
    level = _clean(diagnostic.get("level"))
    if risk == "urgent" or level in ("grave", "closure"):
        return "urgent"
    if risk == "soon" or level == "frequent":
        return "moderate"
    return "info"


def _tier_admin(diagnostic: dict) -> str:
    priority = _clean(diagnostic.get("priority_admin"))
    volume = _clean(diagnostic.get("volume_admin"))
    escalate = _clean(diagnostic.get("escalate_admin"))
    if priority in ("alta", "prioritaria_urgente") or volume == "constante" or escalate == "prioritario_evitar":
        return "urgent"
    if priority == "media" or volume == "bastantes_incidencias":
        return "moderate"
    return "info"


def _tier_comunidad(diagnostic: dict) -> str:
    concern = _clean(diagnostic.get("what_if_not"))
    where = _clean(diagnostic.get("where_comunidad"))
    if concern in ("extendera", "problema_serio") or where in ("varias_viviendas", "todo_edificio"):
        return "urgent"
    if concern == "puede_molestar" or where == "zonas_comunes":
        return "moderate"
    return "info"


def _wizard_tier(diagnostic: dict) -> str:
    path = _clean(diagnostic.get("path")) or "particular"
    if path == "empresa":
        return _tier_empresa(diagnostic)
    if path == "admin":
        return _tier_admin(diagnostic)
    if path == "comunidad":
        return _tier_comunidad(diagnostic)
    return _tier_particular(diagnostic)


def _apply_severity_from_wizard(state: AgentState, diagnostic: dict) -> None:
    tier = _wizard_tier(diagnostic)
    if tier == "urgent":
        state.severity = Severity.HIGH
        state.is_urgent = True
        state.intent = Intent.URGENCY
    elif tier == "moderate":
        state.severity = Severity.MEDIUM
        state.intent = Intent.QUOTE
    else:
        state.severity = Severity.LOW
        if not state.intent:
            state.intent = Intent.DOUBT


def _apply_property_type(state: AgentState, path: str | None, who: str | None) -> None:
    if path == "empresa":
        state.property_type = "negoci"
    elif path in ("comunidad", "admin"):
        state.property_type = "comunitat"
    elif path == "particular":
        state.property_type = "particular"
    elif who:
        low = who.lower()
        if "empresa" in low or "negoci" in low:
            state.property_type = "negoci"
        elif "comunitat" in low or "admin" in low:
            state.property_type = "comunitat"
        else:
            state.property_type = "particular"


def has_wizard_diagnostic(diagnostic: dict | None) -> bool:
    if not isinstance(diagnostic, dict):
        return False
    path = _clean(diagnostic.get("path"))
    return path in _WIZARD_PATHS


def merge_diagnostic_into_state(state: AgentState, diagnostic: dict | None) -> AgentState:
    """Aplica respuestas del wizard; suficiente para agendar sin volver a preguntar."""
    if not diagnostic:
        return state

    path = _clean(diagnostic.get("path"))
    where = (
        _clean(diagnostic.get("where"))
        or _clean(diagnostic.get("where_empresa"))
        or _clean(diagnostic.get("where_admin"))
        or _clean(diagnostic.get("where_comunidad"))
    )
    if where:
        state.city = where.split(",")[0].strip()

    who = _clean(diagnostic.get("who"))
    _apply_property_type(state, path, who)

    if has_wizard_diagnostic(diagnostic):
        state.pest_type = PestType.GERMAN_COCKROACH
        _apply_severity_from_wizard(state, diagnostic)

    notes: list[str] = []
    for key, label in (
        ("path", "Flux"),
        ("who", "Client"),
        ("quantity", "Freqüència"),
        ("level", "Nivell"),
        ("since", "Des de"),
        ("since_admin", "Des de"),
        ("since_comunidad", "Des de"),
        ("urgency", "Urgència"),
        ("sanitary_risk", "Risc sanitari"),
        ("sensitive", "Sensibilitat"),
        ("certificate", "Certificat"),
        ("gestion_tipo", "Gestió"),
        ("volume_admin", "Volum"),
        ("priority_admin", "Prioritat"),
        ("advance_admin", "Avanç"),
        ("role_comunidad", "Rol"),
        ("what_if_not", "Risc"),
        ("codigo_postal", "CP"),
        ("metros_cuadrados", "m²"),
        ("extra_info", "Extra"),
    ):
        val = _clean(diagnostic.get(key))
        if val:
            notes.append(f"{label}: {val}")

    if notes:
        merged = list(dict.fromkeys([*state.technical_notes, *notes]))
        state.technical_notes = merged[:25]

    if not state.city:
        state.city = "Barcelona"

    return state


def _append_note(state: AgentState, note: str) -> None:
    if not note:
        return
    merged = list(dict.fromkeys([*state.technical_notes, note]))
    state.technical_notes = merged[:25]


def apply_facts_from_message(state: AgentState, message: str) -> AgentState:
    """Extreu dades clau del missatge lliure per evitar repreguntar el mateix."""
    low = message.lower()

    if any(k in low for k in ("cucarach", "panerol", "cucaracha")):
        _append_note(state, "Plaga: cucaraches/paneroles")
        if not state.pest_type:
            state.pest_type = PestType.GERMAN_COCKROACH
        if not state.intent:
            state.intent = Intent.QUOTE

    location_map = (
        ("baño", "bany"),
        ("bano", "bany"),
        ("cocina", "cuina"),
        ("dormitorio", "dormitori"),
        ("salón", "saló"),
        ("salon", "saló"),
        ("garaje", "garatge"),
        ("nevera", "nevera"),
        ("desagüe", "desguàs"),
        ("desague", "desguàs"),
    )
    for needle, label in location_map:
        if needle in low:
            _append_note(state, f"Ubicació: {label}")
            break

    if any(k in low for k in ("casa", "pis", "apartament", "habitatge", "hogar")):
        if not state.property_type:
            state.property_type = "particular"

    if any(k in low for k in ("empresa", "negoci", "restaurant", "local", "oficina")):
        state.property_type = "negoci"

    if ("marron" in low or "marrón" in low or "marró" in low) and any(
        k in low for k in ("grand", "grande", "grans", "gros", "grossa")
    ):
        _append_note(state, "Descripció: grans i marrons (possible panerola americana)")
        if not state.pest_type:
            state.pest_type = PestType.AMERICAN_COCKROACH

    if any(k in low for k in ("pequeñ", "petit", "petita", "small")) and any(
        k in low for k in ("cucarach", "panerol", "cucaracha")
    ):
        _append_note(state, "Descripció: petites (possible panerola alemanya)")
        if not state.pest_type:
            state.pest_type = PestType.GERMAN_COCKROACH

    if "barcelona" in low and not state.city:
        state.city = "Barcelona"

    return state


def build_case_context(agent: AgentState, lang: str) -> str:
    """Resum del cas conegut per als prompts (sense repetir preguntes)."""
    lines = [f"Idioma: {lang}"]
    if agent.pest_type:
        lines.append(f"Plaga identificada: {agent.pest_type.value}")
    if agent.city:
        lines.append(f"Zona/ciutat: {agent.city}")
    if agent.property_type:
        lines.append(f"Tipus immoble: {agent.property_type}")
    if agent.severity:
        lines.append(f"Severitat: {agent.severity.value}")
    if agent.intent:
        lines.append(f"Intenció: {agent.intent.value}")
    if agent.technical_notes:
        lines.append("Dades ja recollides: " + "; ".join(agent.technical_notes[-10:]))
    if lang == "es":
        lines.append(
            "REGLAS: Revisa el historial. NO repitas consejos ni preguntas ya respondidas. "
            "Evita empezar cada mensaje con 'Entiendo que'. "
            "Si ya tienes plaga + ubicación, ofrece el siguiente paso (inspección gratuita, presupuesto o 933 309 169)."
        )
    else:
        lines.append(
            "REGLES: Revisa l'historial. NO repeteixis consells ni preguntes ja respostes. "
            "Evita començar cada missatge amb 'Entenc que'. "
            "Si ja tens plaga + ubicació, ofereix el següent pas (inspecció gratuïta, pressupost o 933 309 169)."
        )
    return "\n".join(lines)


def merge_agent_updates(base: AgentState, updates: AgentState) -> AgentState:
    """Fusiona camps recollits per l'agent sense perdre historial ni notes."""
    merged = base.model_copy(deep=True)
    for field in (
        "customer_name",
        "city",
        "property_type",
        "pest_type",
        "intent",
        "severity",
        "is_urgent",
        "summary",
        "language",
        "chat_diagnostic",
        "pending_intake_field",
    ):
        val = getattr(updates, field, None)
        if val is None:
            continue
        setattr(merged, field, val)
    if updates.technical_notes:
        merged.technical_notes = list(
            dict.fromkeys([*merged.technical_notes, *updates.technical_notes])
        )[:25]
    if updates.chat_diagnostic:
        merged.chat_diagnostic = {**(merged.chat_diagnostic or {}), **updates.chat_diagnostic}
    if updates.pending_intake_field is not None:
        merged.pending_intake_field = updates.pending_intake_field
    return merged


def apply_diagnostic_from_message(state: AgentState, message: str) -> AgentState:
    """Parseja prefix [Diagnòstic: ...] o bloc del prompt de veredicte."""
    block = re.search(r"\[Diagnòstic:[^\]]+\]", message, re.IGNORECASE)
    if block:
        text = block.group(0)
        zm = re.search(r"zona:\s*([^,\]]+)", text, re.IGNORECASE)
        if zm:
            zone = _clean(zm.group(1))
            if zone:
                state.city = zone.split(",")[0].strip()

    if "he completat el diagnòstic" in message.lower() or "he completado el diagnóstico" in message.lower():
        for line in message.splitlines():
            low = line.lower()
            if "localització:" in low or "localización:" in low:
                loc = _clean(line.split(":", 1)[-1])
                if loc:
                    state.city = loc.split(",")[0].strip()
            elif "tipus de client:" in low or "tipo de cliente:" in low:
                merge_diagnostic_into_state(state, {"who": line.split(":", 1)[-1].strip()})
        if not state.pest_type:
            state.pest_type = PestType.GERMAN_COCKROACH
        if not state.city:
            state.city = "Barcelona"

    return state
