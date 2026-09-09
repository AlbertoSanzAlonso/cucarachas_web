"""Guion del chat home: idioma UI, sin LLM ni datos de otra sesión."""
from api.agents.chat_intake import apply_chat_intake_from_message, ensure_pest_from_message, parse_field_value
from api.agents.graph.home_flow import home_scripted_reply, reset_stale_home_case
from api.agents.graph.routing import choose_agent_route, apply_preprocess
from api.agents.models import AgentState, Intent, PestType


def _home_state(agent: AgentState, message: str) -> dict:
    state = {
        "message": message,
        "language": agent.language,
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    return state


def _turn(agent: AgentState, message: str) -> tuple[AgentState, str]:
    from api.agents.graph.home_flow import build_home_verdict, home_next_action, home_should_diagnose

    agent = reset_stale_home_case(agent, message)
    agent.language = "es"
    agent.intent = Intent.DOUBT
    from api.agents.diagnostic_merge import apply_facts_from_message

    agent = apply_facts_from_message(agent, message)
    agent = ensure_pest_from_message(agent, message)
    agent = apply_chat_intake_from_message(agent, message)
    state = _home_state(agent, message)
    agent = AgentState.model_validate(state["agent_state"])
    action = home_next_action(agent, message)
    if home_should_diagnose(agent, message) or action == "verdict":
        assert choose_agent_route(state) == "diagnostician"
        if action == "verdict":
            agent, msg = build_home_verdict(agent, "es", message)
            return agent, msg
        return agent, ""
    if action == "llm":
        assert choose_agent_route(state) == "receptionist"
        return agent, ""
    assert choose_agent_route(state) == "receptionist"
    reply = home_scripted_reply(state, agent, "es")
    if reply is None:
        agent, msg = build_home_verdict(agent, "es", message)
        return agent, msg
    agent = AgentState.model_validate(reply["agent_state"])
    return agent, reply["result"]["message"]


def test_parse_quantity_range():
    assert parse_field_value("quantity", "3 o 4") == "several"
    assert parse_field_value("quantity", "1") == "one"
    assert parse_field_value("quantity", "muchas") == "many"


def test_home_flow_es_does_not_leak_community():
    agent = AgentState(
        language="ca",
        city="Carrer de la Costa Brava",
        property_type="comunitat",
        pest_type=PestType.GERMAN_COCKROACH,
        technical_notes=["Comunidad Costa Brava"],
        chat_diagnostic={"where": "escalera"},
        intent=Intent.QUOTE,
    )
    agent, msg = _turn(agent, "hola")
    assert "Cuéntame" in msg
    assert agent.property_type is None
    assert agent.city is None
    assert not agent.chat_diagnostic

    agent, msg = _turn(agent, "tengo un problema de cucarachas")
    assert "Dónde" in msg
    assert agent.property_type is None
    assert "Costa Brava" not in (agent.city or "")

    agent, msg = _turn(agent, "en el baño")
    assert "Cuántas" in msg
    assert (agent.chat_diagnostic or {}).get("where") == "bano"

    agent, msg = _turn(agent, "3 o 4")
    assert "inspección gratuita" in msg.lower() or "presupuesto" in msg.lower()
    assert "cucaracha alemana" in msg.lower() or "nivel" in msg.lower()
    assert "Costa Brava" not in msg
    assert "comunitat" not in msg.lower()
    assert "llagost" not in msg.lower()
    assert (agent.chat_diagnostic or {}).get("quantity") == "several"


def test_home_free_question_routes_to_diagnostician():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        intent=Intent.DOUBT,
        chat_diagnostic={"where": "bano", "quantity": "several"},
    )
    state = _home_state(agent, "por qué salen de noche?")
    assert choose_agent_route(state) == "diagnostician"


def test_hola_que_tal_does_not_assume_cockroaches():
    from api.agents.graph.home_flow import home_next_action
    from api.agents.graph.routing import is_simple_greeting

    assert is_simple_greeting("hola que tal")
    assert is_simple_greeting("hola, qué tal")
    assert not is_simple_greeting("hola tengo cucarachas")

    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        chat_diagnostic={"where": "bano"},
        intent=Intent.DOUBT,
    )
    agent, msg = _turn(agent, "hola que tal")
    assert "Cuéntame" in msg or "puedo ayudar" in msg.lower()
    assert "cucarachas" not in msg.lower()
    assert agent.pest_type is None
    assert home_next_action(agent, "hola que tal") == "greet"


def test_home_quantity_routes_to_diagnostician():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        intent=Intent.DOUBT,
        chat_diagnostic={"where": "bano"},
    )
    agent = apply_chat_intake_from_message(agent, "3 o 4")
    state = _home_state(agent, "3 o 4")
    assert choose_agent_route(state) == "diagnostician"


def test_natural_hola_then_que_tal_then_empresa():
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    assert "Cuéntame" in msg

    agent, msg = _turn(agent, "que tal")
    assert "Bien" in msg or "Dime" in msg
    assert msg != "¡Hola! Cuéntame, ¿en qué te puedo ayudar?"
    assert agent.pest_type is None

    agent, msg = _turn(agent, "tengo una empresa")
    assert agent.property_type == "negoci"
    from api.agents.graph.home_flow import home_next_action

    assert home_next_action(agent, "tengo una empresa") == "llm"


def test_eres_un_robot_goes_to_agent_not_pest_script():
    from api.agents.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, _ = _turn(agent, "hola")
    action = home_next_action(agent, "eres un robot?")
    assert action == "llm"
    state = _home_state(agent, "eres un robot?")
    assert choose_agent_route(state) == "receptionist"
