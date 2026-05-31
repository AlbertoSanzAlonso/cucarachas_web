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
