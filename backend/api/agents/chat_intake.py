"""Recolección de datos de Ficha Maestra vía chat libre (sin wizard)."""
from __future__ import annotations

import re
from typing import Any

from api.agents.models import AgentState, PestType
from api.ficha_engine import CaseContext, find_ficha

_PROPERTY_TO_PATH = {
    "particular": "particular",
    "negoci": "empresa",
    "comunitat": "comunidad",
}

_INTAKE_QUESTIONS = {
    "ca": {
        "codigo_postal": "Per preparar-te un pressupost precís, em pots dir el **codi postal** de l'immoble?",
        "metros_cuadrados": "Quants **metres quadrats** té el pis o local?",
        "where": "On has vist la plaga? (cuina, bany, garatge…)",
        "quantity": "Quantes n'has vist aproximadament? (una, diverses, moltes…)",
        "banos": "Quants banys té l'immoble?",
        "cocinas": "Quantes cuines té l'immoble?",
        "habitaciones": "Quantes habitacions té el pis?",
        "terraza": "Té terrassa o pati exterior?",
        "mascotas": "Hi ha mascotes a casa?",
        "ninos": "Hi ha nens a casa?",
        "business_type": "Quin tipus de negoci és? (restaurant, hotel, oficina…)",
    },
    "es": {
        "codigo_postal": "Para prepararte un presupuesto preciso, ¿me puedes decir el **código postal** del inmueble?",
        "metros_cuadrados": "¿Cuántos **metros cuadrados** tiene el piso o local?",
        "where": "¿Dónde has visto la plaga? (cocina, baño, garaje…)",
        "quantity": "¿Cuántas has visto aproximadamente? (una, varias, muchas…)",
        "banos": "¿Cuántos baños tiene el inmueble?",
        "cocinas": "¿Cuántas cocinas tiene el inmueble?",
        "habitaciones": "¿Cuántas habitaciones tiene el piso?",
        "terraza": "¿Tiene terraza o patio exterior?",
        "mascotas": "¿Hay mascotas en casa?",
        "ninos": "¿Hay niños en casa?",
        "business_type": "¿Qué tipo de negocio es? (restaurante, hotel, oficina…)",
    },
}

_CP_RE = re.compile(r"\b(\d{5})\b")
_M2_RE = re.compile(
    r"(\d{2,4})\s*(?:m²|m2|metros?\s+cuadrados?|metres?\s+quadrats?)",
    re.IGNORECASE,
)
_M2_BARE_RE = re.compile(r"^\s*(\d{2,4})\s*$")

_WHERE_MAP = {
    "cocina": "cocina",
    "cuina": "cocina",
    "bano": "bano",
    "baño": "bano",
    "bany": "bano",
    "dormitorio": "dormitorio",
    "dormitori": "dormitorio",
    "salon": "salon",
    "saló": "salon",
    "garaje": "garaje",
    "garatge": "garaje",
}


def build_unified_diagnostic(agent: AgentState, diagnostic: dict | None = None) -> dict[str, Any]:
    """Fusiona wizard, chat libre y notas técnicas en un único dict para la ficha."""
    merged: dict[str, Any] = dict(diagnostic or {})
    chat = agent.chat_diagnostic or {}
    for key, val in chat.items():
        if val is not None and str(val).strip():
            merged[key] = val

    if not merged.get("path") and agent.property_type:
        merged["path"] = _PROPERTY_TO_PATH.get(agent.property_type, "particular")

    return merged


def get_missing_mandatory_fields(agent: AgentState, diagnostic: dict | None = None) -> list[str]:
    """Campos obligatorios de la ficha activa que aún faltan."""
    unified = build_unified_diagnostic(agent, diagnostic)
    ficha = find_ficha(agent, unified)
    if not ficha:
        return []

    ctx = CaseContext(agent=agent, diagnostic=unified)
    mandatory = (ficha.preguntas_obligatorias or {}).get(ctx.client_type, [])
    return [field for field in mandatory if ctx.get_field(field) is None]


def get_intake_question(field: str, lang: str = "ca") -> str:
    questions = _INTAKE_QUESTIONS.get(lang, _INTAKE_QUESTIONS["ca"])
    return questions.get(field, questions.get("where", ""))


def parse_field_value(field: str, message: str) -> Any:
    text = message.strip()
    if not text:
        return None

    if field == "codigo_postal":
        match = _CP_RE.search(text)
        return match.group(1) if match else None

    if field == "metros_cuadrados":
        match = _M2_RE.search(text) or _M2_BARE_RE.match(text)
        if match:
            value = int(match.group(1))
            return value if 10 <= value <= 5000 else None
        return None

    if field == "where":
        low = text.lower()
        for needle, canonical in _WHERE_MAP.items():
            if needle in low:
                return canonical
        if len(text) >= 3:
            return text[:120]
        return None

    if field in ("banos", "cocinas", "habitaciones"):
        match = re.search(r"\b(\d{1,2})\b", text)
        return int(match.group(1)) if match else None

    if field in ("terraza", "mascotas", "ninos"):
        low = text.lower()
        if any(w in low for w in ("si", "sí", "yes", "sí,", "si,")):
            return "yes"
        if any(w in low for w in ("no", "cap", "ningun", "ningún")):
            return "no"
        return None

    if field == "quantity":
        low = text.lower()
        if any(w in low for w in ("ooteca", "cápsula", "capsula", "niu", "nido")):
            return "nests"
        if any(w in low for w in ("moltes", "muchas", "moltas", "infest")):
            return "many"
        if any(w in low for w in ("diverses", "varias", "algunes", "algunas", "several")):
            return "several"
        if any(w in low for w in ("una", "one", "1 ", "1,")):
            return "one"
        return None

    return text[:200]


def extract_fields_from_message(message: str) -> dict[str, Any]:
    """Intenta extraer campos de ficha del mensaje libre."""
    found: dict[str, Any] = {}
    low = message.lower()

    cp = _CP_RE.search(message)
    if cp:
        found["codigo_postal"] = cp.group(1)

    m2 = _M2_RE.search(message)
    if m2:
        found["metros_cuadrados"] = int(m2.group(1))

    for needle, canonical in _WHERE_MAP.items():
        if needle in low:
            found["where"] = canonical
            break

    qty = parse_field_value("quantity", message)
    if qty:
        found["quantity"] = qty

    return found


def apply_chat_intake_from_message(agent: AgentState, message: str) -> AgentState:
    """Persiste respuestas del chat en agent.chat_diagnostic."""
    chat = dict(agent.chat_diagnostic or {})
    updated = agent.model_copy(deep=True)

    if updated.pending_intake_field:
        parsed = parse_field_value(updated.pending_intake_field, message)
        if parsed is not None:
            chat[updated.pending_intake_field] = parsed
            updated.pending_intake_field = None

    for key, val in extract_fields_from_message(message).items():
        if key not in chat or not chat.get(key):
            chat[key] = val

    updated.chat_diagnostic = chat
    return updated


def ensure_pest_from_message(agent: AgentState, message: str) -> AgentState:
    """Nicho cucarachas: asumir alemana si mencionan plaga sin especificar."""
    low = message.lower()
    if agent.pest_type:
        return agent
    if any(k in low for k in ("cucarach", "panerol", "cucaracha", "paneroles")):
        return agent.model_copy(update={"pest_type": PestType.GERMAN_COCKROACH})
    return agent
