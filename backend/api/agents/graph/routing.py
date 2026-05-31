"""Enrutado determinista (sin LLM) para ahorrar tokens y latencia."""
from ..models import AgentState, Intent
from .state import CECSAGraphState

DIAGNOSTIC_KEYWORDS = (
    "diagnòstic interactiu",
    "diagnóstico interactivo",
    "veredicte personalitzat",
)
SCHEDULING_KEYWORDS = (
    "cita",
    "visita",
    "agendar",
    "reservar",
    "quan podeu",
    "cuando",
    "agendar la meva",
    "agendar mi",
)
PRICING_KEYWORDS = ("pressupost", "presupuesto")
PEST_KEYWORDS = (
    "cucarach",
    "panerol",
    "cucaracha",
    "plaga",
    "insect",
    "roedor",
    "rat",
    "rata",
    "termit",
)
CA_HINTS = ("tinc", "hi ha", "on", "vull", "pressupost", "quan", "gratuïta", "meva")
ES_HINTS = ("tengo", "hay", "donde", "quiero", "presupuesto", "gratuita", "mi cita")


def mentions_pest(msg_lower: str) -> bool:
    return any(kw in msg_lower for kw in PEST_KEYWORDS)


def should_diagnose(agent: AgentState, msg_lower: str) -> bool:
    if agent.pest_type:
        return False
    if mentions_pest(msg_lower):
        return True
    return agent.intent in (Intent.QUOTE, Intent.URGENCY, Intent.DOUBT) and bool(agent.city)


def apply_preprocess(state: CECSAGraphState) -> dict:
    """Actualiza idioma e intención por keywords antes de elegir nodo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()

    session_lang = state.get("language")
    if session_lang in ("ca", "es"):
        agent.language = session_lang
    elif "idioma: es" in msg_lower:
        agent.language = "es"
    elif "idioma: ca" in msg_lower:
        agent.language = "ca"
    elif any(w in msg_lower for w in CA_HINTS):
        agent.language = "ca"
    elif any(w in msg_lower for w in ES_HINTS):
        agent.language = "es"

    if any(kw in msg_lower for kw in DIAGNOSTIC_KEYWORDS):
        agent.intent = Intent.QUOTE
        if "barcelona" in msg_lower:
            agent.city = "Barcelona"

    if any(kw in msg_lower for kw in SCHEDULING_KEYWORDS):
        agent.intent = Intent.APPOINTMENT

    if mentions_pest(msg_lower) and not agent.intent:
        agent.intent = Intent.QUOTE

    return {
        "language": agent.language,
        "agent_state": agent.model_dump(mode="json"),
    }


def choose_agent_route(state: CECSAGraphState) -> str:
    """Decide el siguiente nodo del grafo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()

    if agent.intent == Intent.APPOINTMENT or any(
        kw in msg_lower for kw in SCHEDULING_KEYWORDS
    ):
        return "scheduler"

    if agent.pest_type and (
        agent.intent == Intent.QUOTE or any(kw in msg_lower for kw in PRICING_KEYWORDS)
    ):
        return "pricer"

    if should_diagnose(agent, msg_lower):
        return "diagnostician"

    # Mensajes sin plaga concreta (p. ej. "tengo un problema") → recepcionista, no fallback
    if not mentions_pest(msg_lower):
        return "receptionist"

    if not agent.city or not agent.property_type:
        return "receptionist"

    return "fallback"


def after_receptionist(state: CECSAGraphState) -> str:
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = state.get("message", "").lower()
    pending = state.get("route")

    if pending == "scheduler" or agent.intent == Intent.APPOINTMENT:
        return "scheduler"
    if pending == "diagnostician" or should_diagnose(agent, msg_lower):
        return "diagnostician"
    if pending == "pricer" or (
        agent.pest_type and agent.intent in (Intent.QUOTE, Intent.URGENCY)
    ):
        return "pricer"
    return "done"


def after_diagnostician(state: CECSAGraphState) -> str:
    from ..config import ENABLE_CRM_SYNTHESIS

    agent = AgentState.model_validate(state.get("agent_state") or {})
    if ENABLE_CRM_SYNTHESIS and agent.pest_type:
        return "crm"
    return "done"
