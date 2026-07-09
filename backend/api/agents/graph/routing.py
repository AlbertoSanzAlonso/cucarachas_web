"""Enrutado determinista (sin LLM) para ahorrar tokens y latencia."""
from ..chat_intake import get_missing_mandatory_fields
from ..diagnostic_merge import has_wizard_diagnostic
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
PRICING_KEYWORDS = ("pressupost", "presupuesto", "precio", "preu", "cuánto", "cuanto", "quanto")
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
SCHEDULING_PHRASES = (
    "agendar",
    "reservar",
    "cita gratuïta",
    "cita gratuita",
    "visita gratuïta",
    "visita gratuita",
    "inspecció gratuïta",
    "inspección gratuita",
)
GREETING_ONLY = (
    "hola",
    "bon dia",
    "buenos días",
    "buenos dias",
    "buenas",
    "hey",
    "ei",
    "hello",
    "salut",
    "què tal",
    "que tal",
)
SCHEDULING_AFFIRMATIVES = frozenset({
    "si",
    "sí",
    "ok",
    "vale",
    "venga",
    "claro",
    "perfecto",
    "genial",
    "endavant",
    "adelante",
    "d'acord",
    "de acuerdo",
    "sí, por favor",
    "si, por favor",
    "sí por favor",
    "si por favor",
})


def accepts_scheduling_affirmative(msg_lower: str) -> bool:
    """Respostes curtes que confirmen agendar després d'una oferta de cita."""
    text = msg_lower.strip().rstrip("!?.…")
    if len(text) > 30:
        return False
    return text in SCHEDULING_AFFIRMATIVES


def should_offer_slots(agent: AgentState, msg_lower: str) -> bool:
    """True quan cal mostrar horaris Cal.com (petició explícita o confirmació)."""
    if wants_scheduling(msg_lower):
        return True
    return accepts_scheduling_affirmative(msg_lower) and bool(agent.pest_type)


def wants_scheduling(msg_lower: str) -> bool:
    """True solo si el mensaje actual pide cita/visita explícitamente."""
    if any(kw in msg_lower for kw in SCHEDULING_KEYWORDS):
        return True
    return any(p in msg_lower for p in SCHEDULING_PHRASES)


def is_simple_greeting(msg_lower: str) -> bool:
    text = msg_lower.strip().rstrip("!?.…")
    if len(text) > 40:
        return False
    return text in GREETING_ONLY


def mentions_pest(msg_lower: str) -> bool:
    return any(kw in msg_lower for kw in PEST_KEYWORDS)


def is_case_follow_up(msg_lower: str) -> bool:
    """Respostes curtes o detalls d'un cas en curs (ubicació, descripció…)."""
    follow_up_hints = (
        "baño",
        "bano",
        "bany",
        "cocina",
        "cuina",
        "dormitorio",
        "dormitori",
        "salon",
        "saló",
        "garaje",
        "garatge",
        "marron",
        "marrón",
        "marró",
        "grand",
        "grande",
        "grans",
        "petit",
        "pequeñ",
        "moltes",
        "muchas",
        "n'he vist",
        "he visto",
        "sota",
        "debajo",
        "nevera",
        "des de",
        "desde",
        "en el",
        "en la",
        "al ",
        "a la ",
        "color",
        "nits",
        "noche",
        "nit",
    )
    return any(h in msg_lower for h in follow_up_hints)


def is_rich_pest_report(msg_lower: str) -> bool:
    """Mención de plaga con ubicación o detalles (p. ej. «cucarachas en el baño»)."""
    return mentions_pest(msg_lower) and is_case_follow_up(msg_lower)


def is_bare_pest_mention(msg_lower: str) -> bool:
    """Solo nombra la plaga sin ubicación ni detalles (p. ej. «de cucarachas»)."""
    return mentions_pest(msg_lower) and not is_case_follow_up(msg_lower)


def should_diagnose(agent: AgentState, msg_lower: str) -> bool:
    if agent.pest_type and is_case_follow_up(msg_lower):
        return True
    if is_rich_pest_report(msg_lower):
        return True
    if agent.pest_type:
        return False
    return (
        agent.intent in (Intent.QUOTE, Intent.URGENCY, Intent.DOUBT)
        and bool(agent.city)
        and is_rich_pest_report(msg_lower)
    )


def needs_ficha_intake(
    agent: AgentState,
    diagnostic: dict | None,
    missing_fields: list[str] | None = None,
) -> bool:
    """True si la ficha activa tiene campos obligatorios sin rellenar."""
    if not agent.pest_type:
        return False
    if missing_fields is not None:
        return bool(missing_fields)
    return bool(get_missing_mandatory_fields(agent, diagnostic))


def should_run_intake(
    agent: AgentState,
    diagnostic: dict | None,
    msg_lower: str,
    missing_fields: list[str] | None = None,
) -> bool:
    """Chat libre: recoger datos de ficha con preguntas de texto."""
    if agent.pending_intake_field:
        return True
    if not needs_ficha_intake(agent, diagnostic, missing_fields):
        return False
    if any(kw in msg_lower for kw in PRICING_KEYWORDS):
        return True
    if agent.intent in (Intent.QUOTE, Intent.URGENCY):
        return True
    if agent.pest_type and agent.property_type and not is_simple_greeting(msg_lower):
        return True
    return False


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

    if wants_scheduling(msg_lower):
        agent.intent = Intent.APPOINTMENT
    elif accepts_scheduling_affirmative(msg_lower) and agent.pest_type:
        agent.intent = Intent.APPOINTMENT
    elif agent.intent == Intent.APPOINTMENT and not should_offer_slots(agent, msg_lower):
        # Sesión anterior (p. ej. modal): no arrastrar cita a un "hola" genérico
        agent.intent = Intent.DOUBT

    if is_simple_greeting(msg_lower) and not wants_scheduling(msg_lower):
        agent.intent = Intent.DOUBT

    if mentions_pest(msg_lower) and not agent.intent:
        agent.intent = Intent.QUOTE

    if any(kw in msg_lower for kw in PRICING_KEYWORDS):
        agent.intent = Intent.QUOTE

    # El idioma de la petición (UI) tiene prioridad sobre heurísticas del mensaje
    if session_lang in ("ca", "es"):
        agent.language = session_lang

    return {
        "language": agent.language,
        "agent_state": agent.model_dump(mode="json"),
    }


def _wants_pricing(agent: AgentState, diagnostic: dict | None, msg_lower: str) -> bool:
    if not any(kw in msg_lower for kw in PRICING_KEYWORDS):
        return False
    return bool(agent.pest_type) or has_wizard_diagnostic(diagnostic)


def choose_agent_route(state: CECSAGraphState) -> str:
    """Decide el siguiente nodo del grafo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()
    diagnostic = state.get("diagnostic")
    missing = state.get("missing_intake_fields")

    if should_offer_slots(agent, msg_lower):
        return "scheduler"

    if should_run_intake(agent, diagnostic, msg_lower, missing):
        return "intake"

    if _wants_pricing(agent, diagnostic, msg_lower):
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
    diagnostic = state.get("diagnostic")
    missing = state.get("missing_intake_fields")

    if pending == "scheduler" or should_offer_slots(agent, msg_lower):
        return "scheduler"
    if pending == "intake" or should_run_intake(agent, diagnostic, msg_lower, missing):
        return "intake"
    if pending == "diagnostician" or should_diagnose(agent, msg_lower):
        return "diagnostician"
    if pending == "pricer" or (
        agent.pest_type
        and agent.intent in (Intent.QUOTE, Intent.URGENCY)
        and not needs_ficha_intake(agent, diagnostic, missing)
    ):
        return "pricer"
    return "done"


def after_diagnostician(state: CECSAGraphState) -> str:
    from ..config import ENABLE_CRM_SYNTHESIS

    if has_wizard_diagnostic(state.get("diagnostic")):
        return "done"

    agent = AgentState.model_validate(state.get("agent_state") or {})
    if ENABLE_CRM_SYNTHESIS and agent.pest_type:
        return "crm"
    return "done"
