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
from ..diagnostic_merge import merge_agent_updates
from ..text_utils import limit_one_question
from .routing import mentions_pest
from .state import CECSAGraphState
from .home_flow import home_scripted_reply


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


def _resolve_lang(agent: AgentState, state: CECSAGraphState):
    """Idioma efectivo: estado del agente o petición (UI)."""
    from api.agents.serialization import normalize_language

    raw = agent.language if agent.language in ("ca", "es") else state.get("language", "ca")
    return normalize_language(raw if isinstance(raw, str) else "ca")


def _home_fast_reply(state: CECSAGraphState, agent: AgentState, lang: str) -> dict | None:
    """Respuestas deterministas para el chat home: una pregunta, sin LLM."""
    if not _is_home_chat(state):
        return None
    return home_scripted_reply(state, agent, lang)


async def receptionist_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = _resolve_lang(agent, state)
    agent.language = lang
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    try:
        fast = _home_fast_reply(state, agent, lang)
        if fast:
            return fast

        if _is_home_chat(state):
            from .home_flow import home_next_action, home_receptionist_context, home_should_diagnose
            from api.agents.chat_intake import has_pricing_case_details, next_pricing_intake_field
            from .routing import wants_pricing_message

            message = state.get("message") or ""
            action = home_next_action(agent, message)
            if home_should_diagnose(agent, message) or action == "verdict":
                return {
                    "agent_state": agent.model_dump(mode="json"),
                    "route": "diagnostician",
                }
            if wants_pricing_message(message):
                agent.intent = Intent.QUOTE
                needed = next_pricing_intake_field(agent, state.get("diagnostic"))
                if needed:
                    agent.pending_intake_field = needed if needed != "pest" else "pest"
            context = home_receptionist_context(agent, lang, message)
            updated, output = await _run_agent(
                receptionist_agent,
                context,
                state,
                timeout_key="receptionist",
                use_full_history=True,
            )
            pest_before = agent.pest_type
            pending_before = agent.pending_intake_field
            agent = merge_agent_updates(agent, output.collected_data)
            agent.history = updated.history
            if agent.pest_type and not pest_before:
                from .routing import affirms_pest_presence, mentions_pest

                msg_lower = message.lower()
                if not (
                    mentions_pest(msg_lower)
                    or (pending_before == "pest" and affirms_pest_presence(msg_lower))
                ):
                    agent.pest_type = None
            reply = limit_one_question(output.message)
            payload: dict[str, Any] = {
                "agent_state": agent.model_dump(mode="json"),
                "result": {"message": reply},
            }
            if output.next_agent == "pricer" and has_pricing_case_details(
                agent, state.get("diagnostic")
            ):
                payload["route"] = "pricer"
            elif output.next_agent == "pricer":
                field = next_pricing_intake_field(agent, state.get("diagnostic")) or "pest"
                agent.pending_intake_field = field if field != "pest" else "pest"
                payload["agent_state"] = agent.model_dump(mode="json")
            return payload

        from api.agents.chat_intake import has_pricing_case_details, next_pricing_intake_field
        from .routing import wants_pricing_message

        message = state.get("message") or ""
        if wants_pricing_message(message):
            agent.intent = Intent.QUOTE
        from api.agents.case_context import build_shared_case_context

        context = build_shared_case_context(agent, lang, message, role="receptionist")
        pest_before = agent.pest_type
        pending_before = agent.pending_intake_field
        updated, output = await _run_agent(
            receptionist_agent,
            context,
            state,
            timeout_key="receptionist",
        )
        agent = merge_agent_updates(_agent_state(state), output.collected_data)
        agent.history = updated.history

        # No aceptar plaga inventada por el LLM si el usuario no la ha confirmado
        if agent.pest_type and not pest_before:
            msg_lower = message.lower()
            from .routing import affirms_pest_presence, mentions_pest

            confirmed = mentions_pest(msg_lower) or (
                pending_before == "pest" and affirms_pest_presence(msg_lower)
            )
            if not confirmed:
                agent.pest_type = None

        next_route = None
        if output.next_agent == "scheduler":
            agent.intent = Intent.APPOINTMENT
            next_route = "scheduler"
        elif output.next_agent == "diagnostician":
            next_route = "diagnostician"
        elif output.next_agent == "pricer":
            if has_pricing_case_details(agent, state.get("diagnostic")):
                next_route = "pricer"
            else:
                # Criterio del LLM: conservar su pregunta; no plantilla ni pricer
                field = next_pricing_intake_field(agent, state.get("diagnostic")) or "pest"
                agent.pending_intake_field = field if field != "pest" else "pest"
                agent.intent = Intent.QUOTE

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
    """Lista horarios de la agenda propia sin LLM (evita timeout y ahorra tokens)."""
    from api.agenda.config import AGENDA_DAYS_AHEAD
    from api.agenda.engine import fetch_available_slots

    ok, result = await sync_to_async(fetch_available_slots)(days_ahead=AGENDA_DAYS_AHEAD)
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
        from api.agents.case_context import build_shared_case_context

        context = build_shared_case_context(
            agent, lang, state.get("message") or "", role="scheduler"
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
        msg = ORCHESTRATOR_MESSAGES[lang]["error_scheduler"]
        return {"result": {"message": msg, "slots": []}}


async def intake_node(state: CECSAGraphState) -> dict:
    """Recoge datos de Ficha Maestra por chat (una pregunta por turno, sin LLM)."""
    agent = _agent_state(state)
    lang = _resolve_lang(agent, state)
    agent.language = lang
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
        from api.agents.chat_intake import next_pricing_intake_field

        needed = next_pricing_intake_field(agent, diagnostic)
        if needed:
            # Criterio del recepcionista en lugar de plantilla fija
            agent.pending_intake_field = needed if needed != "pest" else "pest"
            agent.intent = Intent.QUOTE
            return await receptionist_node({**state, "agent_state": agent.model_dump(mode="json")})
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
    lang = _resolve_lang(agent, state)
    agent.language = lang
    diagnostic = build_unified_diagnostic(agent, state.get("diagnostic") or {})
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])

    # Sin detalle de caso: el recepcionista orquesta con criterio (no plantilla)
    from api.agents.chat_intake import next_pricing_intake_field

    missing_field = next_pricing_intake_field(agent, state.get("diagnostic"))
    if missing_field:
        agent.pending_intake_field = missing_field if missing_field != "pest" else "pest"
        agent.intent = Intent.QUOTE
        return await receptionist_node({**state, "agent_state": agent.model_dump(mode="json")})

    def _confidence_badge(confidence: float) -> str:
        if confidence >= 95:
            return msgs["confidence_green"]
        if confidence >= 70:
            return msgs["confidence_yellow"]
        return msgs["confidence_red"]

    try:
        from api.ficha_engine import evaluate_ficha_pricing, find_ficha, match_objection, severity_to_agent

        ficha_for_obj = await sync_to_async(find_ficha)(agent, diagnostic)
        if ficha_for_obj:
            objection = await sync_to_async(match_objection)(
                ficha_for_obj,
                state.get("message", ""),
                lang,
            )
            if objection:
                return {
                    "agent_state": agent.model_dump(mode="json"),
                    "result": {"message": objection},
                }

        ficha_result = await sync_to_async(evaluate_ficha_pricing)(
            agent,
            diagnostic,
            message=state.get("message", ""),
            lang=lang,
        )

        # Ficha con precio fiable: cotizar. Si falta confianza o datos → pedir info, no inventar €
        if ficha_result:
            if ficha_result.severity:
                sev = severity_to_agent(ficha_result.severity)
                if sev:
                    agent.severity = sev

            if (
                ficha_result.can_quote
                and not ficha_result.schedule_inspection
                and ficha_result.confidence >= 70
            ):
                breakdown_text = ", ".join(ficha_result.breakdown) if ficha_result.breakdown else ""
                badge = _confidence_badge(ficha_result.confidence)

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

            # Visita técnica obligatoria (bloqueo / m² extremos): sin cifras inventadas
            if ficha_result.schedule_inspection and ficha_result.block_reason in (
                "visita_tecnica",
                "metros_excesivos",
            ):
                badge = _confidence_badge(ficha_result.confidence)
                msg = msgs["pricing_inspection_only"].format(
                    confidence_badge=badge,
                    commercial_copy=ficha_result.commercial_copy or "",
                )
                return {
                    "agent_state": agent.model_dump(mode="json"),
                    "result": {"message": msg},
                    "route": "scheduler",
                }

            # Baja confianza: pedir el siguiente dato (m², CP…) vía recepcionista
            from api.agents.chat_intake import get_missing_mandatory_fields

            needed = next_pricing_intake_field(agent, state.get("diagnostic"))
            if not needed:
                missing_mandatory = await sync_to_async(get_missing_mandatory_fields)(
                    agent, state.get("diagnostic")
                )
                needed = missing_mandatory[0] if missing_mandatory else "metros_cuadrados"
            agent.pending_intake_field = needed if needed != "pest" else "pest"
            agent.intent = Intent.QUOTE
            return await receptionist_node({**state, "agent_state": agent.model_dump(mode="json")})

        from api.pricing_fallback import estimate_price_deterministic

        estimate = await sync_to_async(estimate_price_deterministic)(agent, lang)
        if estimate and estimate.get("confidence", 0) >= 70:
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

        # Sin ficha ni histórico fiable: recopilar datos, no soltar plantilla
        needed = next_pricing_intake_field(agent, state.get("diagnostic")) or "metros_cuadrados"
        agent.pending_intake_field = needed if needed != "pest" else "pest"
        agent.intent = Intent.QUOTE
        return await receptionist_node({**state, "agent_state": agent.model_dump(mode="json")})
    except Exception as e:
        import traceback

        print(f"ERROR pricer_node: {traceback.format_exc()}")
        from api.pricing_fallback import estimate_price_deterministic

        estimate = await sync_to_async(estimate_price_deterministic)(agent, lang)
        if estimate and estimate.get("confidence", 0) >= 70:
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
        needed = next_pricing_intake_field(agent, state.get("diagnostic")) or "metros_cuadrados"
        agent.pending_intake_field = needed if needed != "pest" else "pest"
        agent.intent = Intent.QUOTE
        return await receptionist_node({**state, "agent_state": agent.model_dump(mode="json")})


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
        # En home no empujar CTA genérico: el contexto ya decide cuándo ofrecer cita
        pass
    return message


async def diagnostician_node(state: CECSAGraphState) -> dict:
    agent = _agent_state(state)
    lang = _resolve_lang(agent, state)
    agent.language = lang
    home = _is_home_chat(state)
    if home:
        from .home_flow import home_should_diagnose

        if not home_should_diagnose(agent, state.get("message") or ""):
            fast = _home_fast_reply(state, agent, lang)
            if fast:
                return fast
    try:
        if home:
            from .home_flow import home_llm_context

            context = await sync_to_async(home_llm_context)(
                agent, lang, state.get("message") or ""
            )
        else:
            from api.agents.case_context import build_shared_case_context

            context = build_shared_case_context(
                agent, lang, state.get("message") or "", role="diagnostician"
            )
        agent, output = await _run_agent(
            diagnostician_agent,
            context,
            state,
            timeout_key="diagnostician",
            use_full_history=not home,
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
        if home:
            from .home_flow import build_home_verdict

            try:
                agent, message = await sync_to_async(build_home_verdict)(
                    agent, lang, state.get("message") or ""
                )
                return {
                    "agent_state": agent.model_dump(mode="json"),
                    "result": {"message": message},
                }
            except Exception:
                pass
        return {"result": {"message": ORCHESTRATOR_MESSAGES[lang]["error_diagnosis"]}}


async def crm_node(state: CECSAGraphState) -> dict:
    """Síntesis interna para CRM; NUNCA sustituye el mensaje al cliente."""
    agent = _agent_state(state)
    lang = _resolve_lang(agent, state)
    agent.language = lang
    prior = state.get("result") or {}
    try:
        lang_rule = (
            "Escribe el summary en castellano."
            if lang == "es"
            else "Escriu el summary en català."
        )
        from api.agents.case_context import build_shared_case_context

        crm_ctx = build_shared_case_context(
            agent, lang, state.get("message") or "", role="crm"
        )
        agent, output = await _run_agent(
            crm_agent,
            f"{crm_ctx}\n{lang_rule}",
            state,
            timeout_key="crm",
            use_full_history=False,
        )
        agent.summary = output.summary
        if output.technical_notes:
            notes = list(agent.technical_notes or [])
            notes.append(f"CRM: {output.technical_notes}")
            agent.technical_notes = notes[-25:]
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": prior,
        }
    except Exception as e:
        print(f"WARNING crm_node: {e}")
        return {
            "agent_state": agent.model_dump(mode="json"),
            "result": prior,
        }


async def fallback_node(state: CECSAGraphState) -> dict:
    from .routing import is_bare_pest_mention, mentions_pest

    agent = _agent_state(state)
    lang = agent.language if agent.language in ("ca", "es") else "ca"
    msgs = ORCHESTRATOR_MESSAGES.get(lang, ORCHESTRATOR_MESSAGES["ca"])
    msg_lower = state.get("message", "").lower()
    if _is_home_chat(state) and not mentions_pest(msg_lower):
        return {"result": {"message": msgs.get("home_ask_pest", msgs["intake_fallback"])}}
    if not mentions_pest(msg_lower):
        return {"result": {"message": msgs.get("intake_fallback", msgs["fallback"])}}
    # Mención de plaga sin detalles: pedir tipo de inmueble antes que cocina/baño
    if is_bare_pest_mention(msg_lower) or _is_home_chat(state):
        return {"result": {"message": msgs.get("home_ask_property", msgs.get("home_ask_location", msgs["intake_fallback"]))}}
    return {"result": {"message": msgs["fallback"]}}
