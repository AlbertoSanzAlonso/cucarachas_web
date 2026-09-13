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
PRICING_KEYWORDS = (
    "pressupost",
    "presupuesto",
    "precio",
    "precios",
    "preu",
    "preus",
    "presu",  # abrev. «presupuesto»
    "presup",
    "pressu",
    "cuesta",
)
# «cuánto/cuanto» solo como token exacto (no «cuántos artículos»)
_PRICING_HOW_MUCH = frozenset({"cuanto", "cuánto", "quanto"})

# Tokens cortos: solo coincidencia exacta (evitar «presidente» ⊃ «presi»)
_PRICING_EXACT_TOKENS = frozenset({"presi", "presu", "presup", "pressu", "preu", "preus"})
_PRICING_STEMS = ("presupuest", "pressupost", "presup", "presu", "pressu", "preci", "preu")
_PRICING_STEM_EXCLUDE = frozenset(
    {
        "presion",
        "presión",
        "presiones",
        "presunto",
        "presunta",
        "presidente",
        "presidenta",
        "presidencia",
        "presidencial",
        "presidenciales",
    }
)


def wants_pricing_message(message: str) -> bool:
    """Detecta petición de precio/presupuesto, incluidas abreviaturas (presu, presi…)."""
    import re

    low = (message or "").lower()
    tokens = re.findall(r"[a-záéíóúüñ]+", low)
    if any(t in _PRICING_EXACT_TOKENS for t in tokens):
        return True
    if any(t in _PRICING_HOW_MUCH for t in tokens):
        return True
    if any(kw in low for kw in PRICING_KEYWORDS):
        return True
    return any(
        t.startswith(_PRICING_STEMS) and t not in _PRICING_STEM_EXCLUDE
        for t in tokens
    )


def asks_price_of_appointment(msg_lower: str) -> bool:
    """«¿Cuánto cuesta la cita/visita?» = precio, no mostrar slots."""
    if not wants_pricing_message(msg_lower):
        return False
    return any(
        w in msg_lower
        for w in (
            "cita",
            "visita",
            "inspecci",
            "primera",
            "desplazamiento",
            "desplaçament",
        )
    )


def is_informational_query(msg_lower: str) -> bool:
    """
    Pregunta educativa (blog/FAQ): cómo identificar, signos, prevención…
    No debe lanzar el embudo vivienda/negocio/comunidad.
    """
    low = (msg_lower or "").lower()
    if not low.strip():
        return False
    if wants_pricing_message(low) or wants_scheduling(low):
        return False
    # Caso propio activo («tengo cucarachas») → intake, salvo si pregunta explícitamente por identificar
    ownership = any(
        o in low
        for o in (
            "tengo cucarach",
            "tenemos cucarach",
            "tinc panerol",
            "tenim panerol",
            "tengo panerol",
            "he visto cucarach",
            "he vist panerol",
            "hay cucarachas en mi",
            "hi ha paneroles a casa",
        )
    )
    info_markers = (
        "identific",
        "reconoce",
        "reconèixer",
        "reconeixer",
        "distingu",
        "detectar",
        "cómo sé",
        "como se si",
        "cómo se si",
        "como sé",
        "com sé",
        "com se si",
        "qué aspecto",
        "quin aspecte",
        "cómo son",
        "como son",
        "com són",
        "com son",
        "signos de",
        "signes de",
        "indicios",
        "indicis",
        "consejo",
        "consell",
        "artículo",
        "articulo",
        "artículos",
        "articulos",
        "article",
        "articles",
        "del blog",
        "en el blog",
        "el blog",
        "al blog",
        "cuántos artículo",
        "cuantos articulo",
        "quants article",
        "prevención de",
        "prevenció de",
        "cómo evitar",
        "como evitar",
        "com evitar",
        "cómo saber",
        "como saber",
        "com saber",
        "nidos de cucarach",
        "nius de panerol",
        "diferencia entre",
        "diferència entre",
        "cómo reconocer",
        "como reconocer",
        "com reconèixer",
        "com reconeixer",
    )
    if any(m in low for m in info_markers):
        # «tengo cucarachas, cómo las identifico» sigue siendo informativa
        return True
    if ownership:
        return False
    # «¿cómo… cucarachas…?» sin reportar infestación propia
    how_what = any(
        h in low
        for h in (
            "cómo ",
            "como ",
            "com ",
            "qué hacer",
            "que hacer",
            "què fer",
            "que fer",
            "qué son",
            "que son",
            "què són",
        )
    )
    return bool(how_what and mentions_pest(low))


PEST_KEYWORDS = (
    "cucarach",
    "cucurach",  # typo habitual
    "cucas",  # coloquial
    "cuca",  # coloquial (también cubre «cucaracha»)
    "panerol",
    "cucaracha",
    "insect",
    "roedor",
    "rat",
    "rata",
    "termit",
)
# "plaga" sola es demasiado vaga: no cuenta como especie confirmada
VAGUE_PEST_WORDS = ("plaga", "plagas")
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
    "buenas tardes",
    "buenas noches",
    "hey",
    "ei",
    "hello",
    "salut",
    "què tal",
    "que tal",
    "qué tal",
)
GREETING_FOLLOWUPS = (
    "que tal",
    "qué tal",
    "què tal",
    "como estas",
    "cómo estás",
    "cómo estas",
    "com estas",
    "com va",
    "qué hay",
    "que hay",
)
GREETING_STARTERS = (
    "hola",
    "buenas",
    "buen dia",
    "buen día",
    "buenos dias",
    "buenos días",
    "bon dia",
    "hey",
    "hello",
    "ei",
    "salut",
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


def affirms_pest_presence(msg_lower: str) -> bool:
    """«sí», «sí, cucarachas», «si pero quiero presupuesto» tras preguntar la plaga."""
    text = " ".join((msg_lower or "").strip().rstrip("!?.…,").split())
    if not text:
        return False
    if text in SCHEDULING_AFFIRMATIVES or text in ("exacto", "exacte", "eso es", "això"):
        return True
    starters = ("si ", "sí ", "si,", "sí,", "yes ", "vale ", "claro ", "clar ")
    if any(text.startswith(s) for s in starters):
        return True
    return False


def has_scheduling_ready_case(agent: AgentState) -> bool:
    """Caso avanzado: un «sí» puede significar agendar, no confirmar plaga."""
    if not agent.pest_type:
        return False
    chat = agent.chat_diagnostic or {}
    if chat.get("where") and chat.get("quantity"):
        return True
    wizard_where = any(
        chat.get(k) for k in ("where", "where_empresa", "where_admin", "where_comunidad")
    )
    wizard_level = any(
        chat.get(k) for k in ("quantity", "level", "sanitary_risk", "urgency")
    )
    return bool(wizard_where and wizard_level)


def should_offer_slots(agent: AgentState, msg_lower: str) -> bool:
    """True cuando hay petición explícita de cita, o «sí» tras un caso ya listo."""
    if wants_scheduling(msg_lower):
        return True
    # «sí» tras «¿has visto plaga?» confirma plaga; no saltar a agenda
    if not accepts_scheduling_affirmative(msg_lower):
        return False
    return has_scheduling_ready_case(agent)


def wants_scheduling(msg_lower: str) -> bool:
    """True solo si el mensaje actual pide cita/visita explícitamente."""
    # Precio de la cita/visita → recepcionista (inspección gratuita), no slots
    if asks_price_of_appointment(msg_lower):
        return False
    if any(kw in msg_lower for kw in SCHEDULING_KEYWORDS):
        return True
    return any(p in msg_lower for p in SCHEDULING_PHRASES)


def is_simple_greeting(msg_lower: str) -> bool:
    """Saludo corto, incl. 'hola que tal'. No traga un caso ('hola, tengo cucarachas')."""
    text = msg_lower.strip().rstrip("!?.…,")
    text = " ".join(text.split())
    if not text or len(text) > 50:
        return False
    if text in GREETING_ONLY:
        return True
    if mentions_pest(text):
        return False
    if any(kw in text for kw in SCHEDULING_KEYWORDS) or any(p in text for p in SCHEDULING_PHRASES):
        return False
    if any(kw in text for kw in PRICING_KEYWORDS):
        return False
    if any(kw in text for kw in ("problema", "plaga", "ayuda", "ajuda", "cucarach", "panerol")):
        return False
    return any(
        text == starter or text.startswith(starter + " ") or text.startswith(starter + ",")
        for starter in GREETING_STARTERS
    )


def is_greeting_followup(msg_lower: str) -> bool:
    text = msg_lower.strip().rstrip("!?.…,")
    text = " ".join(text.split())
    return text in GREETING_FOLLOWUPS


def is_greeting_opener(msg_lower: str) -> bool:
    """Inicio de conversación (hola/buenas), no un 'qué tal' de cortesía."""
    return is_simple_greeting(msg_lower) and not is_greeting_followup(msg_lower)


def mentions_pest(msg_lower: str) -> bool:
    return any(kw in msg_lower for kw in PEST_KEYWORDS)


def is_third_party_pest_mention(msg_lower: str) -> bool:
    """Plaga atribuida a otro (vecino, el de al lado…), no al inmueble del cliente."""
    if not mentions_pest(msg_lower):
        return False
    third_party = (
        "mi vecino",
        "mi vecina",
        "mis vecinos",
        "mis vecinas",
        "el vecino",
        "la vecina",
        "un vecino",
        "una vecina",
        "su vecino",
        "su vecina",
        "el veí",
        "la veïna",
        "el veina",
        "la veina",
        "el meu veí",
        "la meva veïna",
        "els veïns",
        "els veins",
        "les veïnes",
        "el de al lado",
        "el del lado",
        "la de al lado",
        "el del costat",
        "la del costat",
        "en casa del vecino",
        "en casa de mi vecino",
        "a casa del veí",
        "a casa del veina",
    )
    return any(p in msg_lower for p in third_party)


def is_building_community_context(msg_lower: str) -> bool:
    """Plaga a escala de edificio/comunidad (no plantilla cocina/baño)."""
    keys = (
        "edificio",
        "edifici",
        "comunidad",
        "comunitat",
        "vecinos",
        "veïns",
        "veins",
        "escalera",
        "escala",
        "portal",
        "finca",
        "bloque",
        "rellano",
        "replanell",
        "varias viviendas",
        "diversos pisos",
        "varios pisos",
        "todo el edificio",
        "tot l'edifici",
        "en mi edificio",
        "al meu edifici",
        "en el edificio",
        "a l'edifici",
        "zonas comunes",
        "zones comunes",
        "zona comunitaria",
    )
    return any(k in msg_lower for k in keys)


def is_clear_own_pest_report(msg_lower: str) -> bool:
    """El cliente habla de plaga en SU vivienda/local (plantilla ask_where de habitación)."""
    if not mentions_pest(msg_lower):
        return False
    if is_informational_query(msg_lower):
        return False
    if is_third_party_pest_mention(msg_lower):
        return False
    # Edificio/comunidad → lo juzga el agente, no la plantilla de cocina/baño
    if is_building_community_context(msg_lower):
        return False
    own_markers = (
        "tengo",
        "tenemos",
        "tinc",
        "tenim",
        "he visto",
        "hemos visto",
        "he vist",
        "hem vist",
        "hay en mi",
        "en mi casa",
        "en mi piso",
        "en mi local",
        "en mi negocio",
        "en nuestro",
        "en el nostre",
        "a casa meva",
        "problema de cucarach",
        "problema de panerol",
        "problema con cucarach",
        "problema amb panerol",
        "problema de plaga",
    )
    if any(m in msg_lower for m in own_markers):
        return True
    return is_rich_pest_report(msg_lower)


def is_case_follow_up(msg_lower: str) -> bool:
    """Respostes curtes o detalls d'un cas en curs (ubicació, descripció…)."""
    return is_location_answer(msg_lower) or is_pest_description(msg_lower) or is_quantity_hint(msg_lower)


def is_location_answer(msg_lower: str) -> bool:
    """El mensaje indica una zona del inmueble (no color/tamaño)."""
    if is_informational_query(msg_lower):
        return False
    location_hints = (
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
        "nevera",
        "fregadero",
        "aigüera",
        "desagüe",
        "desague",
        "desguàs",
        "sota",
        "debajo",
        "entrada",
        "portal",
        "acceso",
        "accés",
        "almacen",
        "almacén",
        "magatzem",
        "escalera",
        "escala",
        "patio",
        "pati",
        "terraza",
        "terrassa",
    )
    if any(h in msg_lower for h in location_hints):
        return True
    # «en el / en la / a la» + algo, sin ser solo descripción de color
    if any(p in msg_lower for p in ("en el ", "en la ", "al ", "a la ", "a el ")) and not is_pest_description(
        msg_lower
    ):
        return True
    return False


def is_pest_description(msg_lower: str) -> bool:
    """Color, tamaño u otros rasgos (no sustituye la ubicación)."""
    return any(
        h in msg_lower
        for h in (
            "marron",
            "marrón",
            "marró",
            "negr",
            "negra",
            "blanc",
            "blanca",
            "clara",
            "grand",
            "grande",
            "grans",
            "gros",
            "petit",
            "pequeñ",
            "color",
            "volador",
            "volen",
            "vuelan",
            "alas",
            "ales",
        )
    )


def is_quantity_hint(msg_lower: str) -> bool:
    return any(
        h in msg_lower
        for h in (
            "moltes",
            "muchas",
            "muchos",
            "pocas",
            "poques",
            "varias",
            "diverses",
            "n'he vist",
            "he visto",
            "he vist",
            "una sola",
            "un par",
            "nido",
            "niu",
            "ooteca",
        )
    )


def is_rich_pest_report(msg_lower: str) -> bool:
    """Mención de plaga con ubicación o detalles (p. ej. «cucarachas en el baño»)."""
    if is_informational_query(msg_lower):
        return False
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

    from api.agents.serialization import normalize_language

    session_lang = state.get("language")
    if session_lang in ("ca", "es"):
        agent.language = normalize_language(session_lang)
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
    elif accepts_scheduling_affirmative(msg_lower) and has_scheduling_ready_case(agent):
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
        agent.language = normalize_language(session_lang)

    return {
        "language": agent.language,
        "agent_state": agent.model_dump(mode="json"),
    }


def _wants_pricing(agent: AgentState, diagnostic: dict | None, msg_lower: str) -> bool:
    if not wants_pricing_message(msg_lower):
        return False
    # Path/who del wizard no basta: hace falta detalle real del caso
    from api.agents.chat_intake import has_pricing_case_details

    return has_pricing_case_details(agent, diagnostic)


def _pricing_flow_route(
    agent: AgentState,
    diagnostic: dict | None,
    missing: list[str] | None,
    msg_lower: str = "",
) -> str | None:
    """Intake → pricer cuando pide precio, o tras completar intake de presupuesto."""
    from api.agents.chat_intake import has_pricing_case_details

    if not agent.pest_type:
        return None
    if agent.pending_intake_field:
        return "intake"

    asking_price = wants_pricing_message(msg_lower or "")
    fields_missing = missing
    if asking_price and fields_missing is None:
        fields_missing = get_missing_mandatory_fields(agent, diagnostic)

    if asking_price:
        if fields_missing:
            return "intake"
        if not has_pricing_case_details(agent, diagnostic):
            return "intake"
        return "pricer"

    # Turno de respuesta a intake (el grafo ya pasó missing_intake_fields)
    if (
        missing is not None
        and not missing
        and agent.intent in (Intent.QUOTE, Intent.URGENCY)
        and not is_simple_greeting(msg_lower)
        and has_pricing_case_details(agent, diagnostic)
    ):
        return "pricer"

    return None


def choose_agent_route(state: CECSAGraphState) -> str:
    """Decide el siguiente nodo del grafo."""
    message = state["message"]
    agent = AgentState.model_validate(state.get("agent_state") or {})
    msg_lower = message.lower()
    diagnostic = state.get("diagnostic")
    missing = state.get("missing_intake_fields")

    if should_offer_slots(agent, msg_lower):
        return "scheduler"

    # Widget home: presupuesto con caso listo → pricer; si no, recepcionista / diagnóstico
    if state.get("source") == "home":
        from .home_flow import home_case_ready, home_should_diagnose

        if _wants_pricing(agent, diagnostic, msg_lower) and home_case_ready(agent):
            pricing_route = _pricing_flow_route(agent, diagnostic, missing, msg_lower)
            if pricing_route:
                return pricing_route
            return "pricer"
        if home_should_diagnose(agent, message):
            return "diagnostician"
        return "receptionist"

    pricing_route = _pricing_flow_route(agent, diagnostic, missing, msg_lower)
    if pricing_route:
        return pricing_route

    if _wants_pricing(agent, diagnostic, msg_lower):
        return "pricer"

    # Diagnóstico de seguimiento (ubicación/descripción) antes que intake de ficha
    if should_diagnose(agent, msg_lower):
        return "diagnostician"

    if should_run_intake(agent, diagnostic, msg_lower, missing):
        return "intake"

    # Mensajes sin plaga concreta (p. ej. "tengo un problema") → recepcionista, no fallback
    if not mentions_pest(msg_lower):
        return "receptionist"

    # Solo nombra la plaga (p. ej. "tengo un problema con cucarachas") → pedir ubicación,
    # aunque la sesión tenga city/property_type de un chat o modal anterior.
    if is_bare_pest_mention(msg_lower):
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

    # Home: plantillas/recepcionista; encadenar pricer solo con caso listo
    if state.get("source") == "home":
        if pending == "diagnostician":
            return "diagnostician"
        from api.agents.chat_intake import has_pricing_case_details

        if pending == "pricer" and has_pricing_case_details(agent, diagnostic):
            return "pricer"
        return "done"

    pricing_route = _pricing_flow_route(agent, diagnostic, missing, msg_lower)
    if pricing_route:
        return pricing_route

    if pending == "intake" or should_run_intake(agent, diagnostic, msg_lower, missing):
        return "intake"
    if pending == "diagnostician" or should_diagnose(agent, msg_lower):
        return "diagnostician"
    # Nunca presupuestar sin plaga + detalle de caso (ubicación/cantidad…)
    from api.agents.chat_intake import has_pricing_case_details

    if not has_pricing_case_details(agent, diagnostic):
        if pending == "pricer" and agent.pest_type:
            return "intake"
        return "done"
    if pending == "pricer" or (
        agent.intent in (Intent.QUOTE, Intent.URGENCY)
        and not needs_ficha_intake(agent, diagnostic, missing)
    ):
        return "pricer"
    return "done"


def after_diagnostician(state: CECSAGraphState) -> str:
    from ..config import ENABLE_CRM_SYNTHESIS

    if has_wizard_diagnostic(state.get("diagnostic")):
        return "done"

    # Chat home: no gastar un LLM extra ni sustituir la respuesta al cliente
    if state.get("source") == "home":
        return "done"

    agent = AgentState.model_validate(state.get("agent_state") or {})
    if ENABLE_CRM_SYNTHESIS and agent.pest_type:
        return "crm"
    return "done"
