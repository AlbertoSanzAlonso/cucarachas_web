import asyncio
from typing import Any

from asgiref.sync import sync_to_async
from pydantic_ai.messages import ModelMessage

from ..config import AGENT_TIMEOUTS, HISTORY_MAX_TURNS
from ..chat_intake import get_missing_mandatory_fields, get_intake_question, parse_field_value, build_unified_diagnostic
from ..models import AgentState, DiagnosisOutput, Intent
from ..prompts import ORCHESTRATOR_MESSAGES
from .routing import PRICING_KEYWORDS
from ..serialization import dump_message_history, messages_adapter
from ..receptionist import receptionist_agent
from ..diagnostician import diagnostician_agent
from ..pricer import pricer_agent
from ..scheduler import scheduler_agent
from ..crm_agent import crm_agent
from ..diagnostic_merge import build_case_context, merge_agent_updates
from ..text_utils import limit_one_question
from .routing import is_simple_greeting, mentions_pest, is_case_follow_up, is_bare_pest_mention
from .state import CECSAGraphState


def _persist_pricing_to_crm(
    agent: AgentState,
    raw_diagnostic: dict | None,
    *,
    price_min: float,
    price_max: float,
    final_price: float | None,
    breakdown: list[str],
    guarantee_months: int,
    ficha_codigo: str = "",
) -> None:
    """Guarda o actualitza el pressupost al CRM (best-effort)."""
    try:
        from api.models import Presupuesto
        from api.presupuesto_agent import persist_agent_presupuesto, refresh_agent_presupuesto

        diagnostic = raw_diagnostic or {}
        if agent.last_presupuesto_id:
            try:
                pres = Presupuesto.objects.get(
                    pk=agent.last_presupuesto_id,
                    origen="agent",
                    estado=Presupuesto.Estado.BORRADOR,
                )
                refresh_agent_presupuesto(
                    pres,
                    agent,
                    diagnostic,
                    price_min=price_min,
                    price_max=price_max,
                    final_price=final_price,
                    breakdown=breakdown,
                    guarantee_months=guarantee_months,
                    ficha_codigo=ficha_codigo,
                )
                return
            except Presupuesto.DoesNotExist:
                pass

        pres = persist_agent_presupuesto(
            agent,
            diagnostic,
            price_min=price_min,
            price_max=price_max,
            final_price=final_price,
            breakdown=breakdown,
            guarantee_months=guarantee_months,
            ficha_codigo=ficha_codigo,
        )
        if pres:
            agent.last_presupuesto_id = pres.id
    except Exception as exc:
        import traceback

        print(f"WARN persist presupuesto CRM: {exc}\n{traceback.format_exc()}")


def _agent_state(state: CECSAGraphState) -> AgentState:
    return AgentState.model_validate(state.get("agent_state") or {})


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
    agent_state = _agent_state(state)
    history = _trim_history(agent_state.history) if use_full_history else []
    timeout = AGENT_TIMEOUTS.get(timeout_key, 20.0)

    response = await asyncio.wait_for(
        agent.run(prompt, deps=agent_state, message_history=history),
        timeout=timeout,
    )
    agent_state.history = dump_message_history(response.all_messages())
    return agent_state, response.output


async def preprocess_node(state: CECSAGraphState) -> dict:
    from .routing import apply_preprocess

    updates = apply_preprocess(state)
    agent = AgentState.model_validate(updates.get("agent_state") or {})
    missing = await sync_to_async(get_missing_mandatory_fields)(
        agent,
        state.get("diagnostic"),
    )
    updates["missing_intake_fields"] = missing
    return updates


def _is_home_chat(state: CECSAGraphState) -> bool:
    return state.get("source") == "home"


def _home_vague_problem(msg_lower: str) -> bool:
    vague = ("problema", "probleme", "ajuda", "ayuda", "help", "plaga", "incidència", "incidencia")
    return any(kw in msg_lower for kw in vague) and not mentions_pest(msg_lower)


def _resolve_lang(agent: AgentState, state: CECSAGraphState) -> str:
    """Idioma efectivo: estado del agente o petición (UI)."""
    lang = agent.language if agent.language in ("ca", "es") else state.get("language", "ca")
    return lang if lang in ("ca", "es") else "ca"


def _home_fast_reply(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """Respuestas deterministas para el chat home: una pregunta, sin LLM."""
    if not _is_home_chat(state):
        return None

    msg_lower = state["message"].lower()
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    agent.language = lang

    if is_simple_greeting(msg_lower):
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msgs["home_greeting_reply"]},
        }

    if _home_vague_problem(msg_lower):
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msgs["home_ask_pest"]},
        }

    if is_bare_pest_mention(msg_lower):
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msgs["home_ask_location"]},
        }

    return None


async def receptionist_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = _resolve_lang(agent, state)
    agent.language = lang
    try:
        fast = _home_fast_reply(state, agent, lang)
        if fast:
            return fast

        context = build_case_context(agent, lang)
        if _is_home_chat(state):
            context += "\nModo: chat home (widget). Máximo UNA pregunta. Respuesta breve."
        updated, output = await _run_agent(
            receptionist_agent,
            f"Context actual:\n{context}\n\nMissatge del client: {state['message']}",
            state,
            timeout_key="receptionist",
        )
        agent = merge_agent_updates(_agent_state(state), output.collected_data)
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
    from api.cal_client import CAL_API_KEY, CAL_DAYS_AHEAD, fetch_available_slots

    if not CAL_API_KEY:
        msg = (
            "L'agenda no està configurada al servidor (falta CAL_API_KEY a Coolify)."
            if lang == "ca"
            else "La agenda no está configurada en el servidor (falta CAL_API_KEY en Coolify)."
        )
        return {"result": {"message": msg, "slots": []}}

    ok, result = fetch_available_slots(days_ahead=CAL_DAYS_AHEAD)
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

    msg_lower = state["message"].lower()
    from .routing import should_offer_slots

    if should_offer_slots(agent, msg_lower):
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


async def intake_node(state: CECSAGraphState) -> dict:
    """Recoge datos de Ficha Maestra por chat (una pregunta por turno, sin LLM)."""
    agent = _agent_state(state)
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    diagnostic = state.get("diagnostic")
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    msg_lower = state.get("message", "").lower()

    missing = state.get("missing_intake_fields")
    if missing is None:
        missing = await sync_to_async(get_missing_mandatory_fields)(agent, diagnostic)
    wants_price = any(kw in msg_lower for kw in PRICING_KEYWORDS) or agent.intent in (
        Intent.QUOTE,
        Intent.URGENCY,
    )

    if not missing:
        agent.pending_intake_field = None
        if wants_price:
            return await pricer_node({**state, "agent_state": agent.model_dump(mode="json")})
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msgs["intake_complete"]},
        }

    field = missing[0]
    if agent.pending_intake_field == field and state.get("message", "").strip():
        if parse_field_value(field, state["message"]) is None:
            question = get_intake_question(field, lang)
            retry = msgs.get("intake_retry", "")
            text = f"{retry}\n\n{question}" if retry else question
            return {
                "agent_state": agent.model_dump(mode="json"),
                "result": {"message": text},
            }

    agent.pending_intake_field = field
    question = get_intake_question(field, lang)
    return {
        "agent_state": agent.model_dump(mode="json"),
        "result": {"message": question},
    }


async def pricer_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    diagnostic = build_unified_diagnostic(agent, state.get("diagnostic") or {})
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])

    def _confidence_badge(confidence: float) -> str:
        if confidence >= 95:
            return msgs["confidence_green"].format(pct=int(confidence))
        if confidence >= 70:
            return msgs["confidence_yellow"].format(pct=int(confidence))
        return msgs["confidence_red"].format(pct=int(confidence))

    try:
        from api.ficha_engine import evaluate_ficha_pricing, severity_to_agent

        ficha_result = await sync_to_async(evaluate_ficha_pricing)(
            agent,
            diagnostic,
            message=state.get("message", ""),
            lang=lang,
        )

        if ficha_result and not ficha_result.use_llm:
            if ficha_result.severity:
                sev = severity_to_agent(ficha_result.severity)
                if sev:
                    agent.severity = sev

            breakdown_text = ", ".join(ficha_result.breakdown) if ficha_result.breakdown else ""
            badge = _confidence_badge(ficha_result.confidence)

            if not ficha_result.can_quote or ficha_result.schedule_inspection:
                msg = msgs["pricing_inspection_only"].format(
                    confidence_badge=badge,
                    commercial_copy=ficha_result.commercial_copy or "",
                )
                return {
                    "agent_state": agent.model_dump(mode="json"),
                    "result": {"message": msg},
                    "route": "scheduler",
                }

            if ficha_result.final_price and ficha_result.confidence >= 95:
                msg = msgs["pricing_closed_template"].format(
                    confidence_badge=badge,
                    price=f"{ficha_result.final_price:.0f}",
                    breakdown=breakdown_text,
                    months=ficha_result.guarantee_months,
                    commercial_copy=ficha_result.commercial_copy or "",
                )
            else:
                pmin = ficha_result.price_range_min or ficha_result.final_price or 0
                pmax = ficha_result.price_range_max or ficha_result.final_price or pmin
                msg = msgs["pricing_template"].format(
                    confidence_badge=badge,
                    min=f"{pmin:.0f}",
                    max=f"{pmax:.0f}",
                    breakdown=breakdown_text,
                    months=ficha_result.guarantee_months,
                    commercial_copy=ficha_result.commercial_copy or "",
                )

            agent.estimated_price = ficha_result.final_price or ficha_result.price_range_max
            pmin = ficha_result.price_range_min or ficha_result.final_price or 0
            pmax = ficha_result.price_range_max or ficha_result.final_price or pmin
            await sync_to_async(_persist_pricing_to_crm)(
                agent,
                state.get("diagnostic"),
                price_min=pmin,
                price_max=pmax,
                final_price=ficha_result.final_price,
                breakdown=list(ficha_result.breakdown or []),
                guarantee_months=ficha_result.guarantee_months,
                ficha_codigo=ficha_result.ficha_codigo or "",
            )
            return {
                "agent_state": agent.model_dump(mode="json"),
                "result": {"message": msg},
            }

        context = f"Plaga: {agent.pest_type}. Gravedad: {agent.severity}. Ciudad: {agent.city}."
        if ficha_result:
            from api.ficha_engine import find_ficha, format_ficha_context

            ficha = await sync_to_async(find_ficha)(agent, diagnostic)
            if ficha:
                context += f"\n\n{format_ficha_context(ficha, lang)}"
                context += f"\nConfianza ficha: {ficha_result.confidence}%"

        from api.pricing_fallback import estimate_price_deterministic

        estimate = await sync_to_async(estimate_price_deterministic)(agent, lang)
        if estimate:
            badge = _confidence_badge(estimate["confidence"])
            msg = msgs["pricing_template"].format(
                confidence_badge=badge,
                min=f"{estimate['min']:.0f}",
                max=f"{estimate['max']:.0f}",
                breakdown=", ".join(estimate["breakdown"]),
                months=estimate["months"],
                commercial_copy="",
            )
            agent.estimated_price = estimate["max"]
            await sync_to_async(_persist_pricing_to_crm)(
                agent,
                state.get("diagnostic"),
                price_min=estimate["min"],
                price_max=estimate["max"],
                final_price=None,
                breakdown=list(estimate.get("breakdown") or []),
                guarantee_months=estimate.get("months", 12),
            )
            return {
                "agent_state": agent.model_dump(mode="json"),
                "result": {"message": msg},
            }

        agent, output = await _run_agent(
            pricer_agent,
            f"Context: {context}",
            state,
            timeout_key="pricer",
            use_full_history=False,
        )
        msg = msgs["pricing_template"].format(
            confidence_badge=msgs["confidence_yellow"].format(pct=80),
            min=output.price_range_min,
            max=output.price_range_max,
            breakdown=", ".join(output.breakdown),
            months=output.guarantee_months,
            commercial_copy="",
        )
        agent.estimated_price = output.price_range_max
        await sync_to_async(_persist_pricing_to_crm)(
            agent,
            state.get("diagnostic"),
            price_min=float(output.price_range_min),
            price_max=float(output.price_range_max),
            final_price=float(output.final_price) if output.final_price else None,
            breakdown=list(output.breakdown or []),
            guarantee_months=output.guarantee_months,
        )
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": msg},
        }
    except Exception as e:
        import traceback

        print(f"ERROR pricer_node: {traceback.format_exc()}")
        from api.pricing_fallback import estimate_price_deterministic

        estimate = await sync_to_async(estimate_price_deterministic)(agent, lang)
        if estimate:
            badge = _confidence_badge(estimate["confidence"])
            msg = msgs["pricing_template"].format(
                confidence_badge=badge,
                min=f"{estimate['min']:.0f}",
                max=f"{estimate['max']:.0f}",
                breakdown=", ".join(estimate["breakdown"]),
                months=estimate["months"],
                commercial_copy="",
            )
            agent.estimated_price = estimate["max"]
            await sync_to_async(_persist_pricing_to_crm)(
                agent,
                state.get("diagnostic"),
                price_min=estimate["min"],
                price_max=estimate["max"],
                final_price=None,
                breakdown=list(estimate.get("breakdown") or []),
                guarantee_months=estimate.get("months", 12),
            )
            return {
                "agent_state": agent.model_dump(mode="json"),
                "result": {"message": msg},
            }
        return {"result": {"message": msgs["pricing_inspection_only"].format(
            confidence_badge=msgs["confidence_red"].format(pct=50),
            commercial_copy="",
        )}}


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
    lang = _resolve_lang(agent, state)
    agent.language = lang
    home = _is_home_chat(state)
    try:
        context = build_case_context(agent, lang)
        msg_label = "Mensaje actual del cliente" if lang == "es" else "Missatge actual del client"
        context += f"\n\n{msg_label}: {state['message']}"
        if home:
            context += "\nModo chat home: máximo 1 pregunta, sin listas."
        lang_rule = "Responde SIEMPRE en castellano." if lang == "es" else "Respon SEMPRE en català."
        context += f"\n{lang_rule}"
        agent, output = await _run_agent(
            diagnostician_agent,
            context,
            state,
            timeout_key="diagnostician",
            use_full_history=True,
        )
        message = _format_diagnosis_message(output, home=home, lang=lang) or ORCHESTRATOR_MESSAGES[lang]["fallback"]
        message = limit_one_question(message)
        if output.identified_pest:
            agent.pest_type = output.identified_pest
        if output.severity:
            agent.severity = output.severity
        updates: dict[str, Any] = {
            "agent_state": agent.model_dump(mode="json"),
            "result": {"message": message},
        }
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
