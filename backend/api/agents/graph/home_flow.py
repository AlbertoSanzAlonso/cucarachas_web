"""Guion del chat home: intake fijo, veredicto con ficha, LLM solo con datos del caso."""
from __future__ import annotations

from ..chat_intake import parse_field_value
from ..models import AgentState, Intent, PestType
from ..prompts import BIO_TIPS, ORCHESTRATOR_MESSAGES
from .routing import (
    is_case_follow_up,
    is_greeting_followup,
    is_greeting_opener,
    is_simple_greeting,
    mentions_pest,
)
from .state import CECSAGraphState

HomeAction = str  # greet | ask_pest | ask_where | ask_qty | verdict | llm

_WHERE_LABEL = {
    "bano": {"es": "baño", "ca": "bany"},
    "cocina": {"es": "cocina", "ca": "cuina"},
    "dormitorio": {"es": "dormitorio", "ca": "dormitori"},
    "salon": {"es": "salón", "ca": "saló"},
    "garaje": {"es": "garaje", "ca": "garatge"},
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
    """Un saludo de apertura o un caso nuevo no hereda comunidad/dirección de otro chat."""
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    msg_lower = (message or "").lower()
    if is_greeting_opener(msg_lower):
        return AgentState(language=lang)
    if mentions_pest(msg_lower):
        keep_prop = agent.property_type if not (agent.chat_diagnostic or {}).get("where") else None
        return AgentState(language=lang, property_type=keep_prop, intent=Intent.DOUBT)
    if _declares_client_type(msg_lower):
        return AgentState(language=lang, intent=Intent.DOUBT)
    return agent


def _declares_client_type(msg_lower: str) -> bool:
    return any(
        k in msg_lower
        for k in (
            "empresa",
            "negoci",
            "negocio",
            "restaurant",
            "local",
            "oficina",
            "comunidad",
            "comunitat",
            "casa",
            "piso",
            "pis ",
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
    """Plantillas solo para saludo e intake de plaga. El resto lo decide el agente."""
    msg_lower = (message or "").lower()
    if is_simple_greeting(msg_lower):
        return "greet"
    if mentions_pest(msg_lower) and not _has_where(agent):
        return "ask_where"
    if agent.pest_type and not _has_where(agent):
        if is_case_follow_up(msg_lower):
            return "ask_qty"
        return "llm"
    if agent.pest_type and _has_where(agent) and not _has_quantity(agent):
        if _looks_like_quantity(message):
            return "verdict"
        if is_case_follow_up(msg_lower):
            return "ask_qty"
        return "llm"
    if home_case_ready(agent):
        return "verdict" if _looks_like_quantity(message) else "llm"
    return "llm"


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
    if action == "ask_where":
        if agent.property_type == "negoci":
            return msgs.get("home_ask_location_business") or msgs["home_ask_location"]
        return msgs["home_ask_location"]
    if action == "ask_qty":
        return msgs.get("home_location_ack") or msgs["home_ask_location"]
    return msgs["home_ask_pest"]


def home_scripted_reply(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """Plantillas de intake. None = veredicto ficha o LLM (lo decide el nodo)."""
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    agent.language = lang
    message = state.get("message") or ""
    action = home_next_action(agent, message)
    if action in ("verdict", "llm"):
        return None
    return _reply(agent, _scripted_message(agent, action, msgs, lang, message))


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
            "Puedo agendarte una **inspección gratuita** o preparar un **presupuesto** orientativo."
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
            "Et puc agendar una **inspecció gratuïta** o preparar un **pressupost** orientatiu."
        )
    return agent, " ".join(parts)


def home_receptionist_context(agent: AgentState, lang: str, message: str) -> str:
    """Contexto para el recepcionista: responde al mensaje, no fuerces el intake."""
    lang_rule = (
        "Responde SIEMPRE en castellano."
        if lang == "es"
        else "Respon SEMPRE en català."
    )
    chat = agent.chat_diagnostic or {}
    pest = agent.pest_type.value if agent.pest_type else "ninguna mencionada"
    prop = agent.property_type or "no indicado"
    return (
        f"Idioma de la web: {lang}\n"
        f"Tipo de cliente en este chat: {prop}\n"
        f"Plaga mencionada en este chat: {pest}\n"
        f"Ubicación: {chat.get('where') or 'no indicada'}\n"
        f"Mensaje actual: {message}\n"
        "INSTRUCCIONES DE ESTE TURNO (tienen prioridad sobre recoger plaga/ciudad):\n"
        "- Responde de forma natural a LO QUE EL CLIENTE ACABA DE DECIR.\n"
        "- Si pregunta si eres un robot o una IA, dilo con claridad: eres el asistente de CECSA "
        "y puedes ayudarle con control de cucarachas, presupuesto o cita.\n"
        "- NO preguntes por cucarachas, zona ni cantidad si el cliente no ha hablado de una plaga.\n"
        "- NO inventes calles, comunidades ni datos que no haya dicho.\n"
        "- No vuelvas a saludar con 'Hola' si la conversación ya está en marcha.\n"
        "- Máximo UNA pregunta. 2-4 frases.\n"
        f"{lang_rule}"
    )


def home_llm_context(agent: AgentState, lang: str, message: str) -> str:
    """Contexto cerrado: hechos del chat + ficha. El LLM redacta, no inventa."""
    facts = collect_home_case_facts(agent, lang, message)
    lang_rule = (
        "Responde SIEMPRE en castellano."
        if lang == "es"
        else "Respon SEMPRE en català."
    )
    lines = [
        f"Idioma: {lang}",
        f"Plaga: {facts['pest']}",
        f"Ubicación dicha por el cliente: {facts['where'] or 'no indicada'}",
        f"Cantidad: {facts['quantity'] or 'no indicada'}",
        f"Severidad según ficha: {facts['severity_label']}",
    ]
    if facts["ficha_codigo"]:
        lines.append(f"Ficha: {facts['ficha_codigo']}")
    if facts["recommended"]:
        lines.append(f"Protocolo recomendado: {facts['recommended']}")
    if facts["tip"]:
        lines.append(f"Bio-tip: {facts['tip']}")
    if facts["copy"]:
        lines.append(f"Copy de ficha: {facts['copy']}")
    lines.append(f"Mensaje actual del cliente: {message}")
    lines.append(
        "Redacta UNA respuesta propia (2-4 frases), empática, en segunda persona. "
        "Basa el contenido SOLO en los hechos anteriores. "
        "Prohibido inventar calles, comunidades, nombres de inmueble o datos no listados. "
        "Al final ofrece inspección gratuita o presupuesto. Máximo 1 pregunta."
    )
    lines.append(lang_rule)
    return "\n".join(lines)


def _home_vague_problem(msg_lower: str) -> bool:
    vague = ("problema", "probleme", "ajuda", "ayuda", "help", "plaga", "incidència", "incidencia")
    return any(kw in msg_lower for kw in vague) and not mentions_pest(msg_lower)
