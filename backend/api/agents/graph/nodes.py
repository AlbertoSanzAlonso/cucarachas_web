import asyncio
from typing import Any

from pydantic_ai.messages import ModelMessage

from ..config import AGENT_TIMEOUTS, HISTORY_MAX_TURNS
from ..models import AgentDeps, AgentState, Intent
from ..prompts import ORCHESTRATOR_MESSAGES
from ..serialization import dump_message_history, messages_adapter
from ..receptionist import receptionist_agent
from ..diagnostician import diagnostician_agent
from ..pricer import pricer_agent
from ..scheduler import scheduler_agent
from ..crm_agent import crm_agent
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


async def receptionist_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    try:
        context = (
            f"Idioma: {lang}. Ciudad actual: {agent.city or 'Desconocida'}. "
            f"Intención: {agent.intent or 'Desconocida'}."
        )
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

        payload: dict[str, Any] = {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": output.message},
        }
        if next_route:
            payload["route"] = next_route
        return payload
    except Exception as e:
        print(f"ERROR receptionist_node: {e}")
        return {"result": {"message": ORCHESTRATOR_MESSAGES[lang]["fallback"]}}


async def scheduler_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
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
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {
                "message": output.message,
                "slots": output.available_slots,
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


async def diagnostician_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language
    try:
        context = f"Ciudad: {agent.city}. Datos previo: {state['message']}"
        agent, output = await _run_agent(
            diagnostician_agent,
            f"Resum dades: {context}",
            state,
            timeout_key="diagnostician",
            use_full_history=False,
        )
        updates: dict[str, Any] = {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": output.explanation},
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
    agent = _agent_state(state)
    return {"result": {"message": ORCHESTRATOR_MESSAGES[agent.language]["fallback"]}}
