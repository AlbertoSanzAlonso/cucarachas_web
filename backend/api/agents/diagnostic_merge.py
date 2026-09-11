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


def _resolve_wizard_path(diagnostic: dict | None) -> str | None:
    if not isinstance(diagnostic, dict):
        return None
    path = _clean(diagnostic.get("path"))
    if path in _WIZARD_PATHS:
        return path
    who = _clean(diagnostic.get("who"))
    if who in _WIZARD_PATHS:
        return who
    return None


def has_wizard_diagnostic(diagnostic: dict | None) -> bool:
    return _resolve_wizard_path(diagnostic) is not None


def merge_diagnostic_into_state(state: AgentState, diagnostic: dict | None) -> AgentState:
    """Aplica respuestas del wizard; suficiente para agendar sin volver a preguntar."""
    if not diagnostic:
        return state

    path = _resolve_wizard_path(diagnostic)
    if path:
        diagnostic = {**diagnostic, "path": path}

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
        # No asumir cucarachas solo por path/who: hace falta algún detalle del caso
        detail_keys = (
            "where",
            "where_empresa",
            "where_admin",
            "where_comunidad",
            "quantity",
            "level",
            "since",
            "since_admin",
            "since_comunidad",
            "urgency",
            "sanitary_risk",
            "business_type",
            "metros_cuadrados",
            "codigo_postal",
            "extra_info",
        )
        if any(_clean(diagnostic.get(k)) for k in detail_keys):
            state.pest_type = PestType.GERMAN_COCKROACH
            _apply_severity_from_wizard(state, diagnostic)
        chat = dict(state.chat_diagnostic or {})
        for key, val in diagnostic.items():
            cleaned = _clean(val) if not isinstance(val, (int, float)) else val
            if cleaned is not None and cleaned != "":
                chat[key] = cleaned
        state.chat_diagnostic = chat

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
        ("business_type", "Tipus negoci"),
        ("where_empresa", "Zona"),
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
    # Typos habituales de «cucarachas»
    low_norm = low.replace("cucurach", "cucarach")

    if any(k in low_norm for k in ("cucarach", "panerol", "cucaracha", "cucas")) or re.search(
        r"\bcuca\b", low_norm
    ):
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
        ("entrada", "entrada"),
        ("portal", "entrada"),
        ("almacén", "magatzem"),
        ("almacen", "magatzem"),
    )
    for needle, label in location_map:
        if needle in low:
            _append_note(state, f"Ubicació: {label}")
            break

    if any(k in low for k in ("casa", "pis", "piso", "apartament", "habitatge", "hogar", "vivienda", "particular")):
        if not state.property_type:
            state.property_type = "particular"

    # «en la calle / exterior» tras pedir vivienda/negocio → particular + zona exterior
    outdoor = (
        "en la calle",
        "a la calle",
        "en el carrer",
        "al carrer",
        "en el exterior",
        "al exterior",
        "vía pública",
        "via publica",
        "via pública",
        "fuera de casa",
        "fora de casa",
        "en la via",
    )
    text_outdoor = " ".join(low.strip().rstrip("!?.…,").split())
    if any(o in low for o in outdoor) or text_outdoor in ("calle", "carrer", "exterior", "fuera", "fora"):
        if not state.property_type:
            state.property_type = "particular"
        _append_note(state, "Ubicació: exterior/calle")

    # «información de la empresa» = pregunta sobre CECSA, no cliente negocio
    try:
        from api.agents.company_knowledge import is_company_info_query
        company_q = is_company_info_query(low)
    except Exception:
        company_q = False
    if not company_q and _declares_own_business(low):
        state.property_type = "negoci"
    elif not company_q:
        # Respuestas cortas tras «¿vivienda, negocio o comunidad?»
        text = " ".join(low.strip().rstrip("!?.…,").split())
        if text in (
            "negocio",
            "negoci",
            "local",
            "bar",
            "empresa",
            "restaurante",
            "restaurant",
            "oficina",
            "hotel",
            "es un negocio",
            "és un negoci",
            "es un local",
            "és un local",
            "es un bar",
            "mi negocio",
            "el meu negoci",
        ):
            state.property_type = "negoci"
        elif text in (
            "vivienda",
            "habitatge",
            "piso",
            "pis",
            "casa",
            "particular",
            "hogar",
            "apartamento",
            "apartament",
        ):
            state.property_type = "particular"
        elif text in (
            "comunidad",
            "comunitat",
            "vecinos",
            "veins",
            "veïns",
            "edificio",
            "edifici",
            "finca",
            "bloque",
        ):
            state.property_type = "comunitat"

    if any(
        k in low
        for k in (
            "comunidad",
            "comunitat",
            "vecinos",
            "veïns",
            "escalera",
            "escala",
            "edificio",
            "edifici",
            "bloque",
            "finca",
            "portal",
        )
    ):
        state.property_type = "comunitat"

    if ("marron" in low or "marrón" in low or "marró" in low) and any(
        k in low for k in ("grand", "grande", "grans", "gros", "grossa")
    ):
        _append_note(state, "Descripció: grans i marrons (possible panerola americana)")
        if not state.pest_type:
            state.pest_type = PestType.AMERICAN_COCKROACH

    if any(k in low for k in ("negr", "negra", "negras", "negres", "oscuro", "fosca")):
        _append_note(state, "Descripció: color negre/fosc (possible oriental o americana)")

    if any(k in low for k in ("marron", "marrón", "marró", "brown")):
        _append_note(state, "Descripció: color marró")

    if any(k in low for k in ("blanc", "blanca", "blancas", "blanques", "blanquecin", "clara", "claras")):
        _append_note(state, "Descripció: color blanc/clar (sovint muda o ninfa)")

    if any(k in low for k in ("grand", "grande", "grandes", "grans", "gros", "grossa")):
        _append_note(state, "Descripció: mida gran")

    if any(k in low for k in ("pequeñ", "petit", "petita", "small", "chiquit")):
        _append_note(state, "Descripció: mida petita")
        if any(k in low_norm for k in ("cucarach", "panerol", "cucaracha")) and not state.pest_type:
            state.pest_type = PestType.GERMAN_COCKROACH

    if any(k in low for k in ("vuelan", "volen", "alas", "ales", "volador")):
        _append_note(state, "Descripció: amb capacitat de vol / ales")

    if "barcelona" in low and not state.city:
        state.city = "Barcelona"

    try:
        from api.agents.company_knowledge import find_coverage_place, find_outside_place

        covered = find_coverage_place(low)
        outside = find_outside_place(low)
        if covered:
            # Siempre actualizar: corrige Valencia → Cornellà, etc.
            state.city = covered.title()
        elif outside:
            state.city = outside.title()
    except Exception:
        pass

    _capture_phone_from_message(state, message)
    return state


def _capture_phone_from_message(state: AgentState, message: str) -> None:
    """Guarda un móvil ES (9 dígitos) en chat_diagnostic si el cliente lo escribe."""
    import re

    from api.phone_utils import normalize_phone

    if (state.chat_diagnostic or {}).get("telefono"):
        return
    digits = re.sub(r"\D", "", message or "")
    # +34XXXXXXXXX o 9 dígitos nacionales (6/7…)
    candidates = []
    if len(digits) >= 11 and digits.startswith("34"):
        candidates.append(digits[-9:])
    if len(digits) >= 9:
        candidates.append(digits[-9:])
    for cand in candidates:
        norm = normalize_phone(cand)
        if len(norm) == 9 and norm[0] in "6789":
            diag = dict(state.chat_diagnostic or {})
            diag["telefono"] = norm
            state.chat_diagnostic = diag
            _append_note(state, f"Telèfon: {norm}")
            return


def _declares_own_business(msg_lower: str) -> bool:
    """El cliente habla de SU negocio, no de CECSA."""
    self_phrases = (
        "tengo una empresa",
        "tengo un negocio",
        "tengo un negoci",
        "tinc una empresa",
        "tinc un negoci",
        "mi empresa",
        "mi negocio",
        "mi negoci",
        "nuestra empresa",
        "nuestro negocio",
        "soy empresa",
        "somos empresa",
        "tengo un local",
        "tinc un local",
        "mi local",
        "el meu local",
        "restaurant",
        "restaurante",
        "hotel",
        "oficina",
        "bar ",
        " bar",
    )
    if any(k in msg_lower for k in self_phrases):
        return True
    # «negocio/negoci» sueltos (pero no «empresa» sola → choca con info CECSA)
    return any(k in msg_lower for k in ("negocio", "negoci")) and "empresa" not in msg_lower


def build_case_context(agent: AgentState, lang: str, message: str = "") -> str:
    """Resum del cas conegut per als prompts (sense repetir preguntes)."""
    from api.agents.case_context import build_shared_case_context

    return build_shared_case_context(agent, lang, message, role="general")


def merge_agent_updates(base: AgentState, updates: AgentState) -> AgentState:
    """Fusiona camps recollits per l'agent sense perdre historial ni fets confirmats."""
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
        # language: lo fija la UI / petición; el LLM no debe cambiarlo
        "pending_intake_field",
        "estimated_price",
        "last_presupuesto_id",
    ):
        val = getattr(updates, field, None)
        if val is None:
            continue
        # No borrar plaga/inmueble ya confirmados con un valor vacío/genérico del LLM
        if field == "pest_type" and base.pest_type and val == base.pest_type:
            continue
        if field == "property_type" and base.property_type and not val:
            continue
        setattr(merged, field, val)

    # Plaga ya confirmada: el LLM no la puede borrar ni sustituir por OTHER sin evidencia
    if base.pest_type and not merged.pest_type:
        merged.pest_type = base.pest_type
    if base.property_type and not merged.property_type:
        merged.property_type = base.property_type
    if base.city and not merged.city:
        merged.city = base.city

    if updates.technical_notes:
        merged.technical_notes = list(
            dict.fromkeys([*merged.technical_notes, *updates.technical_notes])
        )[:25]

    # chat_diagnostic: unión; nunca borrar claves ya rellenadas con vacío
    base_chat = dict(base.chat_diagnostic or {})
    upd_chat = dict(updates.chat_diagnostic or {})
    for key, val in upd_chat.items():
        if val is None or str(val).strip() == "":
            continue
        base_chat[key] = val
    merged.chat_diagnostic = base_chat

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
