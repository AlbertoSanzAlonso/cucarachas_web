import asyncio
from typing import Any

from pydantic_ai.messages import ModelMessage

from ..config import AGENT_TIMEOUTS, HISTORY_MAX_TURNS
from ..models import AgentDeps, AgentState, DiagnosisOutput, Intent
from ..prompts import ORCHESTRATOR_MESSAGES
from ..serialization import dump_message_history, messages_adapter
from ..receptionist import receptionist_agent
from ..diagnostician import diagnostician_agent
from ..pricer import pricer_agent
from ..scheduler import scheduler_agent
from ..crm_agent import crm_agent
from ..text_utils import limit_one_question
from .routing import is_simple_greeting, mentions_pest
from .state import CECSAGraphState


def _agent_state(state: CECSAGraphState) -> AgentState:
    return AgentState.model_validate(state.get("agent_state") or {})


def _deps(state: CECSAGraphState) -> AgentDeps:
    agent = _agent_state(state)
    return AgentDeps(language=agent.language)


def _trim_history(history: list) -> list[ModelMessage]:
    if not history:
        return []
    try:
        messages = messages_adapter.validate_python(history)
        max_messages = HISTORY_MAX_TURNS * 2
        if len(messages) > max_messages:
            messages = messages[-max_messages:]
        return messages
    except Exception as e:
        print(f"DEBUG: historial inválido, se omite: {e}")
        return []


async def _run_agent(
    agent,
    prompt: str,
    state: CECSAGraphState,
    *,
    timeout_key: str,
    use_full_history: bool = True,
) -> tuple[AgentState, Any]:
    deps = _deps(state)
    agent_state = _agent_state(state)
    history = _trim_history(agent_state.history) if use_full_history else []
    timeout = AGENT_TIMEOUTS.get(timeout_key, 20.0)

    response = await asyncio.wait_for(
        agent.run(prompt, deps=deps, message_history=history),
        timeout=timeout,
    )
    agent_state.history = dump_message_history(response.all_messages())
    return agent_state, response.output


async def preprocess_node(state: CECSAGraphState) -> dict:
    from .routing import apply_preprocess

    return apply_preprocess(state)


def _is_home_chat(state: CECSAGraphState) -> bool:
    return state.get("source") == "home"


def _home_vague_problem(msg_lower: str) -> bool:
    vague = ("problema", "probleme", "ajuda", "ayuda", "help", "plaga", "incidència", "incidencia")
    return any(kw in msg_lower for kw in vague) and not mentions_pest(msg_lower)


def _home_fast_reply(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """Respuestas deterministas para el chat home: una pregunta, sin LLM."""
    if not _is_home_chat(state):
        return None

    msg_lower = state["message"].lower()
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])

    if is_simple_greeting(msg_lower):
        return {"result": {"message": msgs["home_greeting_reply"]}}

    if _home_vague_problem(msg_lower):
        return {"result": {"message": msgs["home_ask_pest"]}}

    return None


async def receptionist_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    try:
        fast = _home_fast_reply(state, agent, lang)
        if fast:
            return fast

        context = (
            f"Idioma: {lang}. Ciudad actual: {agent.city or 'Desconocida'}. "
            f"Intención: {agent.intent or 'Desconocida'}."
        )
        if _is_home_chat(state):
            context += " Modo: chat home (widget). Máximo UNA pregunta. Respuesta breve."
        updated, output = await _run_agent(
            receptionist_agent,
            f"Context: {context}\nUsuario: {state['message']}",
            state,
            timeout_key="receptionist",
        )
        agent = output.collected_data
        agent.history = updated.history

        next_route = None
        if output.next_agent == "scheduler":
            agent.intent = Intent.APPOINTMENT
            next_route = "scheduler"
        elif output.next_agent in ("diagnostician", "pricer"):
            next_route = output.next_agent

        reply = limit_one_question(output.message)
        payload: dict[str, Any] = {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": reply},
        }
        if next_route:
            payload["route"] = next_route
        return payload
    except Exception as e:
        import traceback

        print(f"ERROR receptionist_node: {traceback.format_exc()}")
        msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
        return {"result": {"message": msgs.get("intake_fallback", msgs["fallback"])}}


def _is_slot_booking_step(message: str) -> bool:
    """El usuario ya eligió un horario (p. ej. desde el widget de slots)."""
    return message.strip().lower().startswith("reserva:")


def _is_initial_scheduling_request(message: str, agent: AgentState) -> bool:
    """Primera petición de cita (CTA o texto explícito), no datos de contacto posteriores."""
    from .routing import wants_scheduling

    if _is_slot_booking_step(message):
        return False
    return wants_scheduling(message.lower())


async def _scheduler_slots_fast_path(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """Lista horarios vía Cal.com sin LLM (evita timeout y ahorra tokens)."""
    from api.cal_client import CAL_API_KEY, fetch_available_slots

    if not CAL_API_KEY:
        msg = (
            "L'agenda no està configurada al servidor (falta CAL_API_KEY a Coolify)."
            if lang == "ca"
            else "La agenda no está configurada en el servidor (falta CAL_API_KEY en Coolify)."
        )
        return {"result": {"message": msg, "slots": []}}

    ok, result = fetch_available_slots(days_ahead=7)
    if ok:
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {
                "message": ORCHESTRATOR_MESSAGES[lang]["scheduler_slots_intro"],
                "slots": result,
                "booking_confirmed": False,
                "booking_uid": None,
            },
        }
    err_msg = result if isinstance(result, str) else ORCHESTRATOR_MESSAGES[lang]["error_scheduler"]
    return {"result": {"message": err_msg, "slots": []}}


async def scheduler_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language if agent.language in ("ca", "es") else state.get("language", "ca")
    if lang not in ("ca", "es"):
        lang = "ca"
    agent.language = lang

    if _is_slot_booking_step(state["message"]):
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {
                "message": ORCHESTRATOR_MESSAGES[lang]["scheduler_collect_data"],
                "slots": [],
                "booking_confirmed": False,
                "booking_uid": None,
            },
        }

    if _is_initial_scheduling_request(state["message"], agent):
        fast = await _scheduler_slots_fast_path(state, agent, lang)
        if fast:
            return fast

    try:
        context = (
            f"Context del client: Plaga identificada: {agent.pest_type or 'no especificada'}, "
            f"Severitat: {agent.severity}, Ciutat: {agent.city or 'Barcelona'}. "
            f"Missatge: {state['message']}"
        )
        agent, output = await _run_agent(
            scheduler_agent,
            context,
            {**state, "agent_state": agent.model_dump(mode="json")},
            timeout_key="scheduler",
        )
        slots = output.available_slots or []
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {
                "message": output.message,
                "slots": slots,
                "booking_confirmed": output.booking_confirmed,
                "booking_uid": output.booking_uid,
            },
        }
    except Exception as e:
        import traceback

        print(f"ERROR scheduler_node: {traceback.format_exc()}")
        from api.cal_client import CAL_API_KEY

        if not CAL_API_KEY:
            msg = (
                "L'agenda no està configurada al servidor (falta CAL_API_KEY a Coolify)."
                if lang == "ca"
                else "La agenda no está configurada en el servidor (falta CAL_API_KEY en Coolify)."
            )
        else:
            msg = ORCHESTRATOR_MESSAGES[lang]["error_scheduler"]
        return {"result": {"message": msg, "slots": []}}


async def pricer_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    try:
        context = (
            f"Plaga: {agent.pest_type}. Gravedad: {agent.severity}. Ciudad: {agent.city}."
        )
        agent, output = await _run_agent(
            pricer_agent,
            f"Context: {context}",
            state,
            timeout_key="pricer",
            use_full_history=False,
        )
        msg = ORCHESTRATOR_MESSAGES[lang]["pricing_template"].format(
            min=output.price_range_min,
            max=output.price_range_max,
            breakdown=", ".join(output.breakdown),
            months=output.guarantee_months,
        )
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msg},
        }
    except Exception as e:
        print(f"ERROR pricer_node: {e}")
        return {"result": {"message": ORCHESTRATOR_MESSAGES[lang]["fallback"]}}


def _format_diagnosis_message(output: DiagnosisOutput, *, home: bool = False, lang: str = "ca") -> str:
    """Combina empatía breve con una pregunta al cliente."""
    parts: list[str] = []
    if output.explanation and output.explanation.strip():
        parts.append(output.explanation.strip())
    questions = [q.strip() for q in output.questions if q and q.strip()]
    if home and questions:
        questions = questions[:1]
    elif questions:
        questions = questions[:1]
    if questions:
        parts.append(questions[0])
    message = "\n\n".join(parts)
    if home:
        msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
        offer = msgs.get("home_cta_offer", "")
        if offer and offer not in message:
            message = f"{message}\n\n{offer}" if message else offer
    return message


async def diagnostician_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    home = _is_home_chat(state)
    try:
        context = (
            f"Missatge del client: {state['message']}\n"
            f"Ciutat: {agent.city or 'desconeguda'}. "
            "Respon en segona persona i fes UNA sola pregunta concreta sobre el seu cas."
        )
        if home:
            context += " Modo chat home: máximo 1 pregunta, sin listas."
        agent, output = await _run_agent(
            diagnostician_agent,
            context,
            state,
            timeout_key="diagnostician",
            use_full_history=False,
        )
        message = _format_diagnosis_message(output, home=home, lang=lang) or ORCHESTRATOR_MESSAGES[lang]["fallback"]
        message = limit_one_question(message)
        updates: dict[str, Any] = {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": message},
        }
        if output.identified_pest:
            agent.pest_type = output.identified_pest
            agent.severity = output.severity
            updates["agent_state"] = agent.model_dump(mode="json")
        return updates
    except Exception as e:
        print(f"ERROR diagnostician_node: {e}")
        return {"result": {"message": ORCHESTRATOR_MESSAGES[lang]["error_diagnosis"]}}


async def crm_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    try:
        agent, output = await _run_agent(
            crm_agent,
            (
                f"Dades identificades: {agent.pest_type}, Severitat: {agent.severity}. "
                f"Usuari diu: {state['message']}"
            ),
            state,
            timeout_key="crm",
            use_full_history=False,
        )
        agent.summary = output.summary
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": output.summary},
        }
    except Exception as e:
        print(f"WARNING crm_node: {e}")
        prior = state.get("result") or {}
        return {"result": prior}


async def fallback_node(state: CECSAGraphState) -> dict:
    from .routing import mentions_pest

    agent = _agent_state(state)
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    msg_lower = state.get("message", "").lower()
    if _is_home_chat(state) and not mentions_pest(msg_lower):
        return {"result": {"message": msgs.get("home_ask_pest", msgs["intake_fallback"])}}
    if not mentions_pest(msg_lower):
        return {"result": {"message": msgs.get("intake_fallback", msgs["fallback"])}}
    return {"result": {"message": msgs["fallback"]}}
