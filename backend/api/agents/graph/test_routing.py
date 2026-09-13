from api.agents.graph.routing import apply_preprocess, choose_agent_route, should_diagnose
from api.agents.models import AgentState, Intent

import pytest

pytestmark = pytest.mark.django_db


def _route(agent: AgentState, message: str) -> str:
    state = {
        "message": message,
        "language": agent.language,
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    return choose_agent_route(state)


def test_cockroaches_with_doubt_intent_routes_to_diagnostician():
    agent = AgentState(language="es", city="Barcelona", intent=Intent.DOUBT)
    assert _route(agent, "tengo cucarachas en el baño") == "diagnostician"


def test_cockroaches_without_city_routes_to_receptionist():
    agent = AgentState(language="es")
    assert _route(agent, "de cucarachas") == "receptionist"


def test_cockroaches_with_location_routes_to_diagnostician():
    agent = AgentState(language="es")
    assert _route(agent, "tengo cucarachas en el baño") == "diagnostician"


def test_incomplete_intake_routes_to_receptionist():
    agent = AgentState(language="es")
    assert _route(agent, "tengo un problema en casa") == "receptionist"


def test_generic_hola_problema_routes_to_receptionist():
    agent = AgentState(language="es")
    assert _route(agent, "hola tengo un problema") == "receptionist"


def test_stale_session_generic_problem_routes_to_receptionist():
    """Sesión con plaga previa no debe mandar 'tengo un problema' al fallback."""
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        city="Barcelona",
        intent=Intent.QUOTE,
        pest_type=PestType.GERMAN_COCKROACH,
    )
    assert _route(agent, "hola tengo un problema") == "receptionist"


def test_doubt_with_city_does_not_fallback():
    from api.agents.models import PestType

    # Follow-up de ubicación con plaga ya en sesión → diagnóstico (no fallback humano)
    agent = AgentState(
        language="es",
        city="Barcelona",
        intent=Intent.DOUBT,
        pest_type=PestType.GERMAN_COCKROACH,
    )
    assert _route(agent, "es en el baño del piso") == "diagnostician"


def test_should_diagnose_requires_location_or_follow_up():
    from api.agents.chat_intake import ensure_pest_from_message

    agent = AgentState(language="es", city="Barcelona", intent=Intent.DOUBT)
    assert should_diagnose(agent, "de cucarachas") is False
    agent = ensure_pest_from_message(agent, "de cucarachas")
    assert should_diagnose(agent, "de cucarachas") is False
    assert should_diagnose(agent, "tengo cucarachas en el baño") is True


def test_session_language_wins_over_message_hints():
    agent = AgentState(language="ca")
    state = {
        "message": "tengo cucarachas en el baño",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    updated = AgentState.model_validate(state["agent_state"])
    assert updated.language == "es"


def test_bare_pest_mention_routes_to_receptionist():
    from api.agents.chat_intake import ensure_pest_from_message

    agent = AgentState(language="es", intent=Intent.DOUBT)
    agent = ensure_pest_from_message(agent, "de cucarachas")
    state = {
        "message": "de cucarachas",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "source": "home",
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "receptionist"


def test_stale_session_bare_pest_routes_to_receptionist():
    """Sesión con city+property_type no debe mandar 'cucarachas' al fallback humano."""
    from api.agents.chat_intake import ensure_pest_from_message
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        city="Barcelona",
        property_type="particular",
        pest_type=PestType.GERMAN_COCKROACH,
        intent=Intent.DOUBT,
    )
    msg = "tengo un problema con cucarachas"
    agent = ensure_pest_from_message(agent, msg)
    assert _route(agent, msg) == "receptionist"


def test_hola_with_stale_appointment_routes_to_receptionist():
    agent = AgentState(language="es", intent=Intent.APPOINTMENT)
    assert _route(agent, "hola") == "receptionist"


def test_scheduling_after_quote_intent_routes_to_scheduler():
    agent = AgentState(language="ca", city="Barcelona", intent=Intent.QUOTE)
    assert _route(agent, "Vull agendar la meva cita gratuïta") == "scheduler"


def test_price_of_appointment_does_not_route_to_scheduler():
    """«¿Cuánto cuesta la cita?» es precio (gratuita), no horarios."""
    from api.agents.graph.routing import asks_price_of_appointment, wants_scheduling

    msg = "cuanto cuesta la primera cita?"
    assert asks_price_of_appointment(msg)
    assert not wants_scheduling(msg)
    agent = AgentState(language="es", city="Cornellà", intent=Intent.DOUBT)
    assert _route(agent, msg) == "receptionist"
    state = {
        "message": msg,
        "language": "es",
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "receptionist"


def test_scheduling_cta_keeps_session_language_ca():
    agent = AgentState(language="ca")
    state = {
        "message": "Vull agendar la meva cita gratuïta",
        "language": "ca",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    updated = AgentState.model_validate(state["agent_state"])
    assert updated.language == "ca"
    assert updated.intent == Intent.APPOINTMENT
    assert choose_agent_route(state) == "scheduler"


def test_follow_up_location_with_pest_routes_to_diagnostician():
    from api.agents.models import PestType

    agent = AgentState(
        language="ca",
        intent=Intent.QUOTE,
        pest_type=PestType.AMERICAN_COCKROACH,
        technical_notes=["Plaga: cucaraches/paneroles"],
    )
    assert _route(agent, "en el baño") == "diagnostician"


def test_quote_intent_without_pricing_keyword_stays_diagnostician():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.AMERICAN_COCKROACH,
    )
    assert _route(agent, "son de color marrón y grandes") == "diagnostician"


def test_explicit_pricing_routes_to_pricer():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.AMERICAN_COCKROACH,
        property_type="particular",
        city="Barcelona",
        chat_diagnostic={
            "where": "cocina",
            "quantity": "several",
            "metros_cuadrados": 70,
            "codigo_postal": "08001",
        },
    )
    assert _route(agent, "quiero un presupuesto") == "pricer"


def test_pricing_without_case_details_does_not_route_to_pricer():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.GERMAN_COCKROACH,
        city="Barcelona",
    )
    assert _route(agent, "presupuesto") != "pricer"


def test_pricing_with_where_but_no_property_asks_intake():
    """Baño diagnosticado sin tipo de inmueble → no soltar tarifas automáticas."""
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        chat_diagnostic={"where": "bano", "quantity": "several"},
    )
    state = {
        "message": "y en cuanto a tarifas?",
        "language": "es",
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) in ("receptionist", "intake")
    assert choose_agent_route(state) != "pricer"


def test_wizard_diagnostic_skips_diagnostician():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state

    agent = AgentState(language="ca")
    diagnostic = {
        "path": "particular",
        "who": "particular",
        "where": "cocina",
        "quantity": "several",
        "urgency": "this_week",
    }
    agent = merge_diagnostic_into_state(agent, diagnostic)
    assert agent.pest_type is not None
    state = {
        "message": "Vull agendar la meva cita gratuïta",
        "language": "ca",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "scheduler"


def test_affirmative_after_wizard_routes_to_scheduler():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state
    from api.agents.models import PestType

    agent = AgentState(language="es")
    diagnostic = {
        "path": "empresa",
        "who": "empresa",
        "where_empresa": "almacen",
        "business_type": "restaurante",
        "level": "grave",
        "sanitary_risk": "urgent",
    }
    agent = merge_diagnostic_into_state(agent, diagnostic)
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    state = {
        "message": "si",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
    }
    state.update(apply_preprocess(state))
    updated = AgentState.model_validate(state["agent_state"])
    assert updated.intent == Intent.APPOINTMENT
    assert choose_agent_route(state) == "scheduler"


def test_affirmative_without_case_stays_receptionist():
    agent = AgentState(language="es")
    assert _route(agent, "si") == "receptionist"


def test_vale_with_pest_only_stays_receptionist():
    """«vale» con plaga pero sin caso listo no salta a agenda (evita brusquedad)."""
    from api.agents.graph.routing import should_offer_slots
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.GERMAN_COCKROACH,
        city="Barcelona",
        property_type="negoci",
    )
    assert should_offer_slots(agent, "vale") is False
    state = {
        "message": "vale",
        "language": "es",
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "receptionist"


def test_vale_after_ready_case_routes_to_scheduler():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.GERMAN_COCKROACH,
        city="Barcelona",
        property_type="negoci",
        chat_diagnostic={"where": "cocina", "quantity": "several"},
    )
    assert _route(agent, "vale") == "scheduler"


def test_si_after_pest_confirm_does_not_offer_slots():
    """Tras ask_pest, «sí» confirma plaga y sigue el guion — no muestra horarios."""
    from api.agents.chat_intake import ensure_pest_from_message
    from api.agents.graph.routing import should_offer_slots
    from api.agents.models import PestType

    agent = AgentState(language="es", pending_intake_field="pest")
    agent = ensure_pest_from_message(agent, "si")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert should_offer_slots(agent, "si") is False
    state = {
        "message": "si",
        "language": "es",
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "receptionist"


def test_wizard_diagnostic_routes_pricing_to_pricer():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state

    agent = AgentState(language="es")
    diagnostic = {
        "path": "empresa",
        "who": "empresa",
        "where_empresa": "cocina",
        "level": "frequent",
        "sanitary_risk": "soon",
        "business_type": "restaurant",
        "metros_cuadrados": 120,
        "codigo_postal": "08001",
    }
    agent = merge_diagnostic_into_state(agent, diagnostic)
    state = {
        "message": "Quiero un presupuesto",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "pricer"


def test_hotel_wizard_pedir_presupuesto_routes_to_pricer_or_intake():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state

    agent = AgentState(language="es")
    diagnostic = {
        "who": "empresa",
        "path": "general",
        "business_type": "hotel",
        "where_empresa": "cocina",
        "sanitary_risk": "soon",
        "level": "frequent",
        "certificate": "yes",
    }
    agent = merge_diagnostic_into_state(agent, diagnostic)
    assert agent.pest_type is not None
    assert agent.property_type == "negoci"
    state = {
        "message": "Pedir presupuesto",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
    }
    state.update(apply_preprocess(state))
    route = choose_agent_route(state)
    assert route in ("pricer", "intake")


def test_intake_answer_routes_to_pricer():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state

    agent = AgentState(language="es", intent=Intent.QUOTE)
    diagnostic = {
        "who": "empresa",
        "path": "empresa",
        "business_type": "oficina",
        "where_empresa": "zona_clientes",
        "sanitary_risk": "soon",
        "level": "frequent",
    }
    agent = merge_diagnostic_into_state(agent, diagnostic)
    agent.chat_diagnostic = {"metros_cuadrados": 600}
    state = {
        "message": "600",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
        "missing_intake_fields": [],
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "pricer"


def test_after_receptionist_pricer_without_pest_stays_done():
    """El LLM del recepcionista no debe forzar pricer sin plaga (evita 250€ fantasma)."""
    from api.agents.graph.routing import after_receptionist

    agent = AgentState(language="es", intent=Intent.QUOTE)
    state = {
        "message": "quiero saber los precios",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "route": "pricer",
    }
    assert after_receptionist(state) == "done"


def test_pricing_keyword_without_pest_routes_to_receptionist():
    agent = AgentState(language="es")
    assert _route(agent, "quiero saber los precios") == "receptionist"


def test_find_similar_references_requires_pest():
    from api.pricing_reference import find_similar_references

    assert find_similar_references(AgentState(language="es")) == []


def test_bare_presupuesto_resets_assumed_pest():
    from api.agents.chat_intake import reset_assumed_pest_for_bare_pricing
    from api.agents.models import PestType

    agent = AgentState(language="es", pest_type=PestType.GERMAN_COCKROACH)
    cleared = reset_assumed_pest_for_bare_pricing(agent, "PRESUPUESTO")
    assert cleared.pest_type is None
    assert cleared.pending_intake_field == "pest"

    cleared_abbr = reset_assumed_pest_for_bare_pricing(
        AgentState(language="es", pest_type=PestType.GERMAN_COCKROACH),
        "presu",
    )
    assert cleared_abbr.pest_type is None

    cleared_presi = reset_assumed_pest_for_bare_pricing(
        AgentState(language="es", pest_type=PestType.GERMAN_COCKROACH),
        "presi",
    )
    assert cleared_presi.pest_type is None
    from api.agents.graph.routing import wants_pricing_message

    assert wants_pricing_message("presi")
    assert not wants_pricing_message("presidente")

    kept = reset_assumed_pest_for_bare_pricing(
        AgentState(
            language="es",
            pest_type=PestType.GERMAN_COCKROACH,
            chat_diagnostic={"where": "cocina"},
        ),
        "PRESUPUESTO",
    )
    assert kept.pest_type == PestType.GERMAN_COCKROACH


def test_bare_pricing_routes_to_receptionist_not_pricer():
    agent = AgentState(language="es")
    assert _route(agent, "presupuesto") == "receptionist"
    assert _route(agent, "presu") == "receptionist"

    state = {
        "message": "presupuesto",
        "language": "es",
        "source": "home",
        "agent_state": AgentState(language="es").model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "receptionist"


def test_diy_product_question_is_listening_turn():
    from api.agents.graph.routing import is_client_question_or_objection

    assert is_client_question_or_objection("pero no me sirve con usar algun producto?")
    assert is_client_question_or_objection(
        "es en mi casa, el año pasado tenia algunas pero desaparecieron con unos productos del supermercado"
    )
    assert not is_client_question_or_objection("quiero presupuesto")


def test_ready_case_pricing_routes_to_pricer():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="particular",
        chat_diagnostic={
            "where": "cocina",
            "quantity": "several",
            "metros_cuadrados": 65,
            "codigo_postal": "08001",
        },
    )
    state = {
        "message": "presupuesto",
        "language": "es",
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "pricer"


def test_pricing_orchestration_context_for_bare_budget():
    from api.agents.chat_intake import pricing_orchestration_context

    block = pricing_orchestration_context(AgentState(language="es"), "es", "presu")
    assert "ORQUESTACIÓN PRESUPUESTO" in block
    assert "FALTA AHORA: pest" in block
    assert "euros" in block.lower() or "€" in block
