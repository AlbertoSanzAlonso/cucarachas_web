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
CA_HINTS = ("tinc", "hi ha", "on", "vull", "pressupost", "quan")
ES_HINTS = ("tengo", "hay", "donde", "quiero", "cita", "presupuesto")


def apply_preprocess(state: CECSAGraphState) -> dict:
    """Actualiza idioma e intención por keywords antes de elegir nodo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()

    if "idioma: es" in msg_lower or any(w in msg_lower for w in ES_HINTS):
        agent.language = "es"
    elif "idioma: ca" in msg_lower or any(w in msg_lower for w in CA_HINTS):
        agent.language = "ca"

    if any(kw in msg_lower for kw in DIAGNOSTIC_KEYWORDS):
        agent.intent = Intent.QUOTE
        if "barcelona" in msg_lower:
            agent.city = "Barcelona"

    if any(kw in msg_lower for kw in SCHEDULING_KEYWORDS) and agent.intent != Intent.QUOTE:
        agent.intent = Intent.APPOINTMENT

    return {
        "language": agent.language,
        "agent_state": agent.model_dump(mode="json"),
    }


def choose_agent_route(state: CECSAGraphState) -> str:
    """Decide el siguiente nodo del grafo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()

    if agent.intent == Intent.APPOINTMENT:
        return "scheduler"

    if (not agent.intent or not agent.city) and agent.intent != Intent.QUOTE:
        return "receptionist"

    if agent.pest_type and (
        agent.intent == Intent.QUOTE or any(kw in msg_lower for kw in PRICING_KEYWORDS)
    ):
        return "pricer"

    if agent.intent in (Intent.QUOTE, Intent.URGENCY) and not agent.pest_type:
        return "diagnostician"

    return "fallback"


def after_receptionist(state: CECSAGraphState) -> str:
    agent = AgentState.model_validate(state.get("agent_state") or {})
    if agent.intent == Intent.APPOINTMENT:
        return "scheduler"
    return "done"


def after_diagnostician(state: CECSAGraphState) -> str:
    from ..config import ENABLE_CRM_SYNTHESIS

    agent = AgentState.model_validate(state.get("agent_state") or {})
    if ENABLE_CRM_SYNTHESIS and agent.pest_type:
        return "crm"
    return "done"
