"""Guion del chat home: intake fijo, veredicto con ficha, LLM solo con datos del caso."""
from __future__ import annotations

from ..chat_intake import parse_field_value
from ..models import AgentState, Intent, PestType
from ..prompts import BIO_TIPS, ORCHESTRATOR_MESSAGES
from .routing import (
    is_clear_own_pest_report,
    is_greeting_followup,
    is_greeting_opener,
    is_simple_greeting,
    mentions_pest,
)
from .state import CECSAGraphState

HomeAction = str  # greet | ask_pest | ask_property | ask_where | ask_qty | company_info | out_of_area | in_area | knowledge | verdict | llm

_WHERE_LABEL = {
    "bano": {"es": "baño", "ca": "bany"},
    "cocina": {"es": "cocina", "ca": "cuina"},
    "dormitorio": {"es": "dormitorio", "ca": "dormitori"},
    "salon": {"es": "salón", "ca": "saló"},
    "garaje": {"es": "garaje", "ca": "garatge"},
    "entrada": {"es": "entrada", "ca": "entrada"},
    "almacen": {"es": "almacén", "ca": "magatzem"},
}
_QTY_LABEL = {
    "one": {"es": "pocos avistamientos", "ca": "pocs albiraments"},
    "several": {"es": "varios avistamientos", "ca": "diversos albiraments"},
    "many": {"es": "muchos avistamientos", "ca": "molts albiraments"},
    "nests": {"es": "indicios de nidos", "ca": "indicis de nius"},
}
_PEST_LABEL = {
    PestType.GERMAN_COCKROACH: {"es": "cucaracha alemana", "ca": "panerola alemanya"},
    PestType.AMERICAN_COCKROACH: {"es": "cucaracha americana", "ca": "panerola americana"},
    PestType.ORIENTAL_COCKROACH: {"es": "cucaracha oriental", "ca": "panerola oriental"},
    PestType.BROWN_BANDED_COCKROACH: {"es": "cucaracha bandeada", "ca": "panerola bandada"},
}
_SEV_LABEL = {
    "low": {"es": "bajo", "ca": "baix"},
    "medium": {"es": "medio", "ca": "mitjà"},
    "high": {"es": "alto", "ca": "alt"},
    "critical": {"es": "crítico", "ca": "crític"},
}


def reset_stale_home_case(agent: AgentState, message: str) -> AgentState:
    """Un saludo, un 'tengo un problema' vago o un caso nuevo no hereda plaga/comunidad de otro chat."""
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    msg_lower = (message or "").lower()
    if is_greeting_opener(msg_lower) or _is_vague_problem_opener(msg_lower):
        return AgentState(language=lang, intent=Intent.DOUBT)
    if mentions_pest(msg_lower):
        # Caso ya abierto (zona/inmueble/plaga): NUNCA borrar al confirmar plaga
        if (
            agent.pest_type
            or agent.property_type
            or (agent.chat_diagnostic or {}).get("where")
            or (agent.chat_diagnostic or {}).get("quantity")
        ):
            return agent
        return AgentState(language=lang, intent=Intent.DOUBT)
    if _declares_client_type(msg_lower):
        # Respuesta piso/negocio/comunidad: conservar plaga, zona y notas
        return agent.model_copy(update={"intent": Intent.DOUBT})
    return agent


def _normalize_problem_typos(text: str) -> str:
    """Typos frecuentes: tyengo → tengo, probleme → problema."""
    return (
        text.replace("tyengo", "tengo")
        .replace("tene problemat", "tengo problemas")
        .replace("probleme", "problema")
    )


def _is_vague_problem_opener(msg_lower: str) -> bool:
    """Inicio genérico sin nombrar plaga (no heredar cucarachas de otra sesión)."""
    if mentions_pest(msg_lower):
        return False
    text = _normalize_problem_typos(" ".join(msg_lower.strip().rstrip("!?.…,").split()))
    for starter in (
        "hola ",
        "buenas ",
        "buen dia ",
        "buen día ",
        "buenos dias ",
        "buenos días ",
        "bon dia ",
    ):
        if text.startswith(starter):
            text = text[len(starter) :].lstrip(" ,.-")
            break
    vague = (
        "tengo un problema",
        "tinc un problema",
        "tengo problemas",
        "tinc problemes",
        "tengo un problemita",
        "necesito ayuda",
        "necessito ajuda",
        "me puedes ayudar",
        "em pots ajudar",
        "puedes ayudarme",
        "pots ajudar-me",
        "quisiera ayuda",
        "querría ayuda",
        "queria ayuda",
        "vull ajuda",
        "volia ajuda",
        "tengo un problema en casa",
        "tinc un problema a casa",
        "necesito que me ayuden",
        "ayuda para una plaga",
        "ajuda per una plaga",
        "ayuda con una plaga",
        "ajuda amb una plaga",
        "tengo una plaga",
        "tinc una plaga",
        "hay una plaga",
        "hi ha una plaga",
    )
    if any(text == v or text.startswith(v + " ") or text.startswith(v + ",") for v in vague):
        return True
    # «… plaga …» sin nombrar especie concreta
    from api.agents.graph.routing import VAGUE_PEST_WORDS

    if any(w in text for w in VAGUE_PEST_WORDS) and not mentions_pest(text):
        return True
    return False


def _declares_client_type(msg_lower: str) -> bool:
    from api.agents.company_knowledge import is_company_info_query
    from api.agents.diagnostic_merge import _declares_own_business

    if is_company_info_query(msg_lower):
        return False
    if _declares_own_business(msg_lower):
        return True
    return any(
        k in msg_lower
        for k in (
            "comunidad",
            "comunitat",
            "vivienda",
            "habitatge",
            "particular",
            "casa",
            "piso",
            "pis ",
            "apartament",
            "apartamento",
            "hogar",
        )
    )


def _has_where(agent: AgentState) -> bool:
    return bool((agent.chat_diagnostic or {}).get("where"))


def _has_quantity(agent: AgentState) -> bool:
    return bool((agent.chat_diagnostic or {}).get("quantity"))


def _looks_like_quantity(message: str) -> bool:
    return parse_field_value("quantity", message) is not None


def home_case_ready(agent: AgentState) -> bool:
    return bool(agent.pest_type) and _has_where(agent) and _has_quantity(agent)


def home_next_action(agent: AgentState, message: str) -> HomeAction:
    """Plantillas solo para hechos claros. Descripción / ambiguo → LLM (conversación natural)."""
    from api.agents.company_knowledge import (
        find_outside_place,
        is_company_info_query,
        is_outside_service_area,
        wants_onsite_service,
    )
    from api.agents.graph.routing import (
        PRICING_KEYWORDS,
        affirms_pest_presence,
        is_location_answer,
        is_pest_description,
    )

    msg_lower = (message or "").lower()
    from api.agents.company_knowledge import find_coverage_place

    # Fuera de Catalunya: plantilla (no si el mensaje nombra un sitio cubierto)
    if find_outside_place(msg_lower) and not find_coverage_place(msg_lower):
        return "out_of_area"
    outside_city, _ = is_outside_service_area(message=msg_lower, city=agent.city)
    if outside_city and wants_onsite_service(msg_lower):
        return "out_of_area"
    # «estoy en Cornellà» (u otra zona cubierta): confirmar que sí hay servicio
    covered = find_coverage_place(msg_lower)
    if covered and any(
        k in msg_lower
        for k in (
            "estoy en",
            "estic a",
            "estic en",
            "vivo en",
            "visc a",
            "soy de",
            "sóc de",
            "desde ",
            "des de ",
        )
    ):
        return "in_area"

    if is_company_info_query(msg_lower):
        return "company_info"

    from api.agents.graph.routing import is_informational_query

    # Preguntas de blog/FAQ (identificar, signos, prevención): no embudo de intake
    if is_informational_query(msg_lower):
        return "knowledge"

    if is_simple_greeting(msg_lower):
        return "greet"
    if _is_vague_problem_opener(msg_lower) and not agent.pest_type:
        return "ask_pest"
    # «he visto una pequeña / son marrones» sin plaga aún → pedir especie, no LLM
    if is_pest_description(msg_lower) and not agent.pest_type:
        return "ask_pest"
    if _wants_diagnosis(msg_lower) and not agent.pest_type:
        return "ask_pest"

    # Presupuesto: guiar solo lo imprescindible; el resto al agente
    from .routing import asks_price_of_appointment, wants_pricing_message

    if asks_price_of_appointment(msg_lower):
        # «¿Cuánto cuesta la cita?» → LLM explica gratuita; no intake de cantidad
        return "llm"
    if wants_pricing_message(msg_lower) or any(k in msg_lower for k in PRICING_KEYWORDS):
        if not agent.pest_type:
            return "ask_pest"
        if not agent.property_type:
            return "ask_property"
        if not _has_where(agent):
            return "ask_where"
        if not _has_quantity(agent):
            return "llm"  # criterio del agente (no plantilla ask_qty)
        return "llm"

    if mentions_pest(msg_lower) and not agent.property_type:
        from .routing import (
            is_bare_pest_mention,
            is_building_community_context,
            is_third_party_pest_mention,
        )

        if is_third_party_pest_mention(msg_lower):
            return "llm"
        if is_building_community_context(msg_lower):
            return "llm"
        if is_clear_own_pest_report(msg_lower) or is_bare_pest_mention(msg_lower):
            return "ask_property"
        return "llm"

    if mentions_pest(msg_lower) and not _has_where(agent):
        from .routing import (
            is_bare_pest_mention,
            is_building_community_context,
            is_third_party_pest_mention,
        )

        if is_third_party_pest_mention(msg_lower):
            return "llm"
        # Edificio/comunidad: el agente pregunta con criterio (no cocina/baño)
        if is_building_community_context(msg_lower):
            return "llm"
        # Ya sabemos tipo de inmueble → zona concreta
        if is_clear_own_pest_report(msg_lower) or is_bare_pest_mention(msg_lower):
            return "ask_where"
        return "llm"

    # Tipo de inmueble: pedir antes de zona, pero no bloquear un caso ya listo (where+qty)
    if agent.pest_type and not agent.property_type and not home_case_ready(agent):
        return "ask_property"

    # Cliente dijo piso/negocio/comunidad sin nombrar plaga → plantilla (no LLM)
    # PROHIBIDO: si pest_type ya está, NUNCA ask_pest (aunque el mensaje sea «vivienda»)
    if agent.property_type and not agent.pest_type:
        return "ask_pest"

    if agent.pest_type and not _has_where(agent):
        # Ya hay plaga (+ tipo de inmueble): pedir zona; si ya indican habitación → LLM/intake
        if is_location_answer(msg_lower) and not _declares_client_type(msg_lower):
            return "llm"
        return "ask_where"

    if agent.pest_type and _has_where(agent) and not _has_quantity(agent):
        if _looks_like_quantity(message):
            return "verdict"
        # Sin cantidad: seguir recogiendo (color/tamaño también → preguntar cuántas)
        return "ask_qty"

    if home_case_ready(agent):
        return "verdict" if _looks_like_quantity(message) else "llm"
    return "llm"


def _wants_diagnosis(msg_lower: str) -> bool:
    return any(
        k in msg_lower
        for k in (
            "diagnost",
            "diagnòst",
            "diagnóst",
            "veredicto",
            "veredicte",
        )
    )


def home_should_use_llm(agent: AgentState, message: str) -> bool:
    return home_next_action(agent, message) in ("verdict", "llm")


def home_should_diagnose(agent: AgentState, message: str) -> bool:
    """LLM del diagnosticador solo con caso de plaga ya orientado."""
    action = home_next_action(agent, message)
    if action == "verdict":
        return True
    return action == "llm" and home_case_ready(agent)


def _reply(agent: AgentState, message: str) -> dict:
    return {
        "agent_state": agent.model_dump(mode="json"),
        "result": {"message": message},
    }


def _strip_rag_noise(text: str) -> str:
    """Limpia cabeceras RAG y deja un extracto legible."""
    lines = []
    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line or line.startswith("---"):
            continue
        if line.lower().startswith(("título:", "titulo:", "categoría", "categoria", "meta:", "contenido:", "resumen:")):
            # Mantener el valor tras el prefijo cuando aporta
            if ":" in line:
                _, _, rest = line.partition(":")
                rest = rest.strip()
                if rest and not rest.lower().startswith("blog"):
                    lines.append(rest)
            continue
        lines.append(line)
    body = "\n".join(lines).strip()
    if len(body) > 900:
        body = body[:880].rsplit(" ", 1)[0] + "…"
    return body


def build_knowledge_reply(message: str, lang: str) -> str:
    """Respuesta educativa desde RAG (blog/FAQ/especies), sin pedir tipo de inmueble."""
    from knowledge.retriever import retrieve_relevant_knowledge

    lang = lang if lang in ("ca", "es") else "ca"
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])

    def _empty(rag: str) -> bool:
        return (
            "No s'han trobat" in (rag or "")
            or "No s'ha pogut" in (rag or "")
            or not (rag or "").strip()
        )

    # Priorizar blog; si no hay hit, FAQ/especies
    rag = retrieve_relevant_knowledge(message, limit=2, category="blog")
    if _empty(rag):
        rag = retrieve_relevant_knowledge(
            message,
            limit=2,
            category=["faq", "species", "general"],
        )

    cta = msgs.get("home_knowledge_cta") or ""
    if _empty(rag):
        fallback = msgs.get("home_knowledge_fallback") or (
            "Puedo orientarte con consejos prácticos del blog CECSA."
            if lang == "es"
            else "Et puc orientar amb consells pràctics del blog CECSA."
        )
        return f"{fallback}\n\n{cta}".strip()
    body = _strip_rag_noise(rag)
    if not body:
        body = rag.strip()[:900]
    intro = msgs.get("home_knowledge_intro") or (
        "Según nuestra guía técnica:" if lang == "es" else "Segons la nostra guia tècnica:"
    )
    return f"{intro}\n\n{body}\n\n{cta}".strip()


def _scripted_message(agent: AgentState, action: str, msgs: dict, lang: str, message: str) -> str:
    if action == "greet":
        if is_greeting_followup(message.lower()):
            return msgs.get("home_greeting_followup") or msgs["home_greeting_reply"]
        return msgs["home_greeting_reply"]
    if action == "ask_pest":
        if agent.property_type == "negoci":
            return msgs.get("home_ask_pest_business") or msgs["home_ask_pest"]
        if agent.property_type == "comunitat":
            return msgs.get("home_ask_pest_community") or msgs["home_ask_pest"]
        return msgs["home_ask_pest"]
    if action == "ask_property":
        return msgs.get("home_ask_property") or msgs["home_ask_pest"]
    if action == "ask_where":
        if agent.property_type == "negoci":
            return msgs.get("home_ask_location_business") or msgs["home_ask_location"]
        if agent.property_type == "comunitat":
            return msgs.get("home_ask_location_community") or msgs["home_ask_location"]
        return msgs["home_ask_location"]
    if action == "ask_qty":
        from api.agents.graph.routing import is_pest_description

        if is_pest_description((message or "").lower()):
            return msgs.get("home_ask_qty_after_desc") or msgs.get("home_location_ack") or msgs["home_ask_location"]
        return msgs.get("home_location_ack") or msgs["home_ask_location"]
    return msgs["home_ask_pest"]


def home_scripted_reply(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """
    Plantillas del chat home: DESACTIVADAS.

    Las respuestas automáticas solo viven en el cuestionario del modal
    (DiagnosticFlow / opciones). Si el usuario escribe en el chat libre,
    siempre responde el LLM (recepcionista/diagnosticador) con herramientas.
    """
    return None


def collect_home_case_facts(agent: AgentState, lang: str, message: str = "") -> dict:
    """Hechos de este chat + ficha. Nada de sesión ajena (calle, comunidad…)."""
    from api.agents.chat_intake import build_unified_diagnostic
    from api.ficha_engine import CaseContext, evaluate_diagnosis_rules, find_ficha, severity_to_agent

    lang = lang if lang in ("ca", "es") else "ca"
    chat = agent.chat_diagnostic or {}
    where_key = str(chat.get("where") or "")
    qty_key = str(chat.get("quantity") or "")
    facts = {
        "lang": lang,
        "where": _WHERE_LABEL.get(where_key, {}).get(lang) or where_key,
        "quantity": _QTY_LABEL.get(qty_key, {}).get(lang) or qty_key,
        "quantity_key": qty_key,
        "pest": _PEST_LABEL.get(agent.pest_type, {}).get(lang) if agent.pest_type else (
            "cucarachas" if lang == "es" else "paneroles"
        ),
        "severity": "medium",
        "severity_label": _SEV_LABEL["medium"][lang],
        "copy": "",
        "recommended": "",
        "tip": "",
        "ficha_codigo": "",
    }
    unified = build_unified_diagnostic(agent)
    if not unified.get("path"):
        unified["path"] = "particular"
    ficha = find_ficha(agent, unified)
    if ficha:
        ctx = CaseContext(agent=agent, diagnostic=unified, message=message)
        facts["severity"] = evaluate_diagnosis_rules(ficha, ctx) or "medium"
        facts["copy"] = (ficha.copy_comercial or {}).get(lang) or ""
        rec = (ficha.sistema_recomendado or {}).get("recomendar") or []
        facts["recommended"] = ", ".join(str(x) for x in rec[:3])
        facts["ficha_codigo"] = ficha.codigo or ""
    facts["severity_label"] = _SEV_LABEL.get(facts["severity"], _SEV_LABEL["medium"])[lang]
    sev_agent = severity_to_agent(facts["severity"])
    if sev_agent:
        agent.severity = sev_agent
    tips = BIO_TIPS.get(lang, BIO_TIPS["ca"])
    pest_key = agent.pest_type.value if agent.pest_type else "default"
    facts["tip"] = tips.get(pest_key, tips["default"])
    return facts


def build_home_verdict(agent: AgentState, lang: str, message: str = "") -> tuple[AgentState, str]:
    """Plantilla de respaldo si el LLM falla. Solo hechos de este chat."""
    from api.agents.company_knowledge import is_outside_service_area, out_of_area_message

    outside, place = is_outside_service_area(message=message, city=agent.city)
    if outside:
        return agent, out_of_area_message(lang, place)

    facts = collect_home_case_facts(agent, lang, message)
    where = facts["where"] or ("la zona indicada" if lang == "es" else "la zona indicada")
    qty = facts["quantity"]
    pest = facts["pest"]
    sev_label = facts["severity_label"]
    if lang == "es":
        parts = [
            f"En el {where}, {qty} encajan con **{pest}** a un nivel **{sev_label}**.",
        ]
        if facts["recommended"]:
            parts.append(f"El protocolo habitual es {facts['recommended']} (sin pulverizar a ciegas).")
        if facts["tip"]:
            parts.append(facts["tip"])
        if facts["copy"]:
            parts.append(facts["copy"])
        parts.append(
            "Puedo agendarte una **inspección gratuita** o preparar un **presupuesto** orientativo. "
            "Si quieres cita, dime tu **teléfono**."
        )
    else:
        parts = [
            f"Al {where}, {qty} encaixen amb **{pest}** a un nivell **{sev_label}**.",
        ]
        if facts["recommended"]:
            parts.append(f"El protocol habitual és {facts['recommended']} (sense polvoritzar a cegues).")
        if facts["tip"]:
            parts.append(facts["tip"])
        if facts["copy"]:
            parts.append(facts["copy"])
        parts.append(
            "Et puc agendar una **inspecció gratuïta** o preparar un **pressupost** orientatiu. "
            "Si vols cita, digue'm el teu **telèfon**."
        )
    return agent, " ".join(parts)


def home_receptionist_context(agent: AgentState, lang: str, message: str) -> str:
    """Contexto recepcionista home: memoria compartida + reglas de cobertura."""
    from api.agents.case_context import build_shared_case_context
    from api.agents.company_knowledge import is_outside_service_area

    base = build_shared_case_context(agent, lang, message, role="receptionist")
    outside, place = is_outside_service_area(message=message, city=agent.city)
    if outside:
        rule = (
            f"\nCOBERTURA: fuera de zona ({place or agent.city}). NO ofrezcas visita."
            if lang == "es"
            else f"\nCOBERTURA: fora de zona ({place or agent.city}). NO ofereixis visita."
        )
        return base + rule
    return base


def home_llm_context(agent: AgentState, lang: str, message: str) -> str:
    """Contexto diagnosticador home: misma memoria compartida + tarea de orientación."""
    from api.agents.case_context import build_shared_case_context, case_memory
    from api.agents.company_knowledge import is_outside_service_area

    base = build_shared_case_context(agent, lang, message, role="diagnostician")
    mem = case_memory(agent, lang)
    outside, place = is_outside_service_area(message=message, city=agent.city)
    extra: list[str] = []
    if outside:
        extra.append(
            f"FUERA DE COBERTURA ({place or agent.city}): explica Catalunya; sin visita."
            if lang == "es"
            else f"FORA DE COBERTURA ({place or agent.city}): explica Catalunya; sense visita."
        )
    notes_txt = "; ".join(mem["notes"]) if mem["notes"] else ""
    if "blanc" in notes_txt.lower() or "clar" in notes_txt.lower():
        extra.append(
            "Color blanco/claro en notas: suele ser muda/ninfa; no inventes otra especie."
        )
    if mem["case_ready"] and notes_txt:
        extra.append(
            "Hay descriptores en notas: intégralos en una orientación breve; "
            "cierra con inspección gratuita o presupuesto."
        )
    if extra:
        return base + "\n" + "\n".join(extra)
    return base


def _home_vague_problem(msg_lower: str) -> bool:
    vague = ("problema", "probleme", "ajuda", "ayuda", "help", "plaga", "incidència", "incidencia")
    return any(kw in msg_lower for kw in vague) and not mentions_pest(msg_lower)
