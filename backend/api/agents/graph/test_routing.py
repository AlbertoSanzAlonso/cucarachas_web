from api.agents.graph.routing import apply_preprocess, choose_agent_route, should_diagnose
from api.agents.models import AgentState, Intent


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


def test_cockroaches_without_city_routes_to_diagnostician():
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
    agent = AgentState(language="es", city="Barcelona", intent=Intent.DOUBT)
    assert _route(agent, "es en el baño del piso") == "diagnostician"


def test_should_diagnose_detects_pest_keywords():
    agent = AgentState(language="es", city="Barcelona", intent=Intent.DOUBT)
    assert should_diagnose(agent, "tengo cucarachas en el baño") is True


def test_hola_with_stale_appointment_routes_to_receptionist():
    agent = AgentState(language="es", intent=Intent.APPOINTMENT)
    assert _route(agent, "hola") == "receptionist"


def test_scheduling_after_quote_intent_routes_to_scheduler():
    agent = AgentState(language="ca", city="Barcelona", intent=Intent.QUOTE)
    assert _route(agent, "Vull agendar la meva cita gratuïta") == "scheduler"


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
        city="Barcelona",
    )
    assert _route(agent, "quiero un presupuesto") == "pricer"


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


def test_vale_after_quote_with_pest_routes_to_scheduler():
    from api.agents.models import PestType

    agent = AgentState(
        language="es",
        intent=Intent.QUOTE,
        pest_type=PestType.GERMAN_COCKROACH,
        city="Barcelona",
        property_type="negoci",
    )
    assert _route(agent, "vale") == "scheduler"


def test_wizard_diagnostic_routes_pricing_to_pricer():
    from api.agents.diagnostic_merge import merge_diagnostic_into_state

    agent = AgentState(language="es")
    diagnostic = {"path": "empresa", "who": "empresa", "level": "frequent", "sanitary_risk": "soon"}
    agent = merge_diagnostic_into_state(agent, diagnostic)
    state = {
        "message": "Quiero un presupuesto",
        "language": "es",
        "agent_state": agent.model_dump(mode="json"),
        "diagnostic": diagnostic,
    }
    state.update(apply_preprocess(state))
    assert choose_agent_route(state) == "pricer"
