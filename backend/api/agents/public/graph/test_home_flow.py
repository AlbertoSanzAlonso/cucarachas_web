"""Guion del chat home: idioma UI, sin LLM ni datos de otra sesión."""
import pytest

from api.agents.public.chat_intake import apply_chat_intake_from_message, ensure_pest_from_message, parse_field_value
from api.agents.public.graph.home_flow import home_scripted_reply, reset_stale_home_case
from api.agents.public.graph.routing import choose_agent_route, apply_preprocess
from api.agents.public.graph.state import CECSAGraphState
from api.agents.models import AgentState, Intent, PestType

pytestmark = pytest.mark.django_db


def _home_state(agent: AgentState, message: str) -> CECSAGraphState:
    state: CECSAGraphState = {
        "message": message,
        "language": agent.language,
        "source": "home",
        "agent_state": agent.model_dump(mode="json"),
    }
    state.update(apply_preprocess(state))
    return state


def _turn(agent: AgentState, message: str) -> tuple[AgentState, str]:
    from api.agents.public.graph.home_flow import build_home_verdict, home_next_action, home_should_diagnose

    agent = reset_stale_home_case(agent, message)
    agent.language = "es"
    agent.intent = Intent.DOUBT
    from api.agents.public.diagnostic_merge import apply_facts_from_message

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
        # Criterio del LLM (p. ej. presupuesto incompleto): sin plantilla
        return agent, ""
    agent = AgentState.model_validate(reply["agent_state"])
    return agent, reply["result"]["message"]


def test_parse_quantity_range():
    assert parse_field_value("quantity", "3 o 4") == "several"
    assert parse_field_value("quantity", "1") == "one"
    assert parse_field_value("quantity", "muchas") == "many"


def test_home_flow_es_does_not_leak_community():
    """Saludo limpia sesión ajena; el chat libre ya no usa plantillas (solo LLM)."""
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
    assert "Cuéntame" in msg or "puedo ayudar" in msg.lower() or "Explica" in msg
    assert agent.property_type is None
    assert agent.city is None
    assert not agent.chat_diagnostic
    state = _home_state(agent, "hola")
    assert home_scripted_reply(state, agent, "es") is not None
    assert choose_agent_route(state) == "receptionist"

    agent, msg = _turn(agent, "tengo un problema de cucarachas")
    assert msg == ""
    assert agent.property_type is None
    assert "Costa Brava" not in (agent.city or "")
    state = _home_state(agent, "tengo un problema de cucarachas")
    assert home_scripted_reply(state, agent, "es") is None

    agent, msg = _turn(agent, "piso")
    assert agent.property_type == "particular"
    assert home_scripted_reply(_home_state(agent, "piso"), agent, "es") is None

    agent, msg = _turn(agent, "en el baño")
    assert (agent.chat_diagnostic or {}).get("where") == "bano"

    agent, msg = _turn(agent, "3 o 4")
    assert (agent.chat_diagnostic or {}).get("quantity") == "several"
    # Caso listo puede ir a diagnostician/veredicto ficha, pero nunca plantilla ask_*
    assert home_scripted_reply(_home_state(agent, "3 o 4"), agent, "es") is None


def test_home_free_question_routes_to_diagnostician():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="particular",
        intent=Intent.DOUBT,
        chat_diagnostic={"where": "bano", "quantity": "several"},
    )
    state = _home_state(agent, "por qué salen de noche?")
    assert choose_agent_route(state) == "diagnostician"


def test_vague_plaga_asks_pest_not_kitchen_zones():
    """«ayuda para una plaga» no asume cucarachas; sin plantilla en chat libre."""
    from api.agents.public.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "quisiera ayuda para una plaga")
    assert agent.pest_type is None
    assert msg == ""
    assert home_scripted_reply(_home_state(agent, "quisiera ayuda para una plaga"), agent, "es") is None
    assert home_next_action(agent, "quisiera ayuda para una plaga") == "ask_pest"


def test_cucarachas_asks_property_before_rooms():
    """Tras nombrar cucarachas se guarda plaga; chat libre sin plantilla ask_property."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tengo cucarachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type is None
    assert msg == ""
    assert home_scripted_reply(_home_state(agent, "tengo cucarachas"), agent, "es") is None

    agent, msg = _turn(agent, "en un bar")
    assert agent.property_type == "negoci"
    assert home_scripted_reply(_home_state(agent, "en un bar"), agent, "es") is None


def test_hola_que_tal_does_not_assume_cockroaches():
    from api.agents.public.graph.home_flow import home_next_action
    from api.agents.public.graph.routing import is_simple_greeting

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
    assert "Cuéntame" in msg or "puedo ayudar" in msg.lower() or "en què" in msg.lower()
    assert "plaga" not in msg.lower()
    assert agent.pest_type is None
    assert home_next_action(agent, "hola que tal") == "greet"
    reply = home_scripted_reply(_home_state(agent, "hola que tal"), agent, "es")
    assert reply is not None
    assert "plaga" not in reply["result"]["message"].lower()


def test_home_quantity_routes_to_diagnostician():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="particular",
        intent=Intent.DOUBT,
        chat_diagnostic={"where": "bano"},
    )
    agent = apply_chat_intake_from_message(agent, "3 o 4")
    state = _home_state(agent, "3 o 4")
    assert choose_agent_route(state) == "diagnostician"


def test_natural_hola_then_que_tal_then_empresa():
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    assert "Cuéntame" in msg or "ayudar" in msg.lower()
    assert home_scripted_reply(_home_state(agent, "hola"), agent, "es") is not None

    agent, msg = _turn(agent, "que tal")
    assert agent.pest_type is None
    assert "plaga" not in msg.lower()

    agent, msg = _turn(agent, "tengo una empresa")
    assert agent.property_type == "negoci"
    from api.agents.public.graph.home_flow import home_next_action

    assert home_next_action(agent, "tengo una empresa") == "ask_pest"
    assert home_scripted_reply(_home_state(agent, "tengo una empresa"), agent, "es") is None


def test_plaga_then_negocio_stays_on_script_not_llm():
    """Tras plaga + negocio: hechos en estado; sin plantilla (LLM libre)."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "quisiera ayuda para una plaga")
    assert agent.pest_type is None

    agent, msg = _turn(agent, "es un negocio")
    assert agent.property_type == "negoci"
    assert agent.pest_type is None
    from api.agents.public.graph.home_flow import home_next_action

    assert home_next_action(agent, "es un negocio") == "ask_pest"
    assert home_scripted_reply(_home_state(agent, "es un negocio"), agent, "es") is None


def test_eres_un_robot_goes_to_agent_not_pest_script():
    from api.agents.public.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, _ = _turn(agent, "hola")
    action = home_next_action(agent, "eres un robot?")
    assert action == "llm"
    state = _home_state(agent, "eres un robot?")
    assert choose_agent_route(state) == "receptionist"


def test_neighbor_cockroaches_goes_to_receptionist_agent():
    """Caso ambiguo: el agente (LLM) debe juzgar, no la plantilla «en el local»."""
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    assert "ayudar" in msg.lower() or "Cuéntame" in msg
    assert home_scripted_reply(_home_state(agent, "hola"), agent, "es") is not None

    agent, msg = _turn(agent, "tengo un negocio")
    assert agent.property_type == "negoci"

    neighbor = "mi vecino tiene cucarachas"
    assert home_next_action(agent, neighbor) == "llm"
    state = _home_state(agent, neighbor)
    assert choose_agent_route(state) == "receptionist"
    assert home_scripted_reply(state, agent, "es") is None


def test_vague_problem_does_not_inherit_stale_pest():
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply, reset_stale_home_case

    stale = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="negoci",
        city="Barcelona",
        chat_diagnostic={"where": "bano"},
    )
    agent = reset_stale_home_case(stale, "hola tengo un problema")
    assert agent.pest_type is None
    assert agent.city is None
    assert not agent.chat_diagnostic
    assert home_next_action(agent, "hola tengo un problema") == "ask_pest"

    state = _home_state(agent, "hola tengo un problema")
    assert home_scripted_reply(state, agent, "es") is None


def test_si_after_ask_pest_asks_property_not_slots():
    """hola → problema → sí confirma plaga; sin plantilla ni slots."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tengo un problema")
    # Sin plantilla ya no fuerza pending_intake_field=pest
    agent, msg = _turn(agent, "si")
    # «sí» solo no confirma plaga sin contexto de ask_pest pendiente
    assert choose_agent_route(_home_state(agent, "si")) == "receptionist"
    assert home_scripted_reply(_home_state(agent, "si"), agent, "es") is None


def test_out_of_area_alicante_scripted():
    """Fuera de zona: hechos en estado; respuesta via LLM (sin plantilla)."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "vivo en Alicante")
    assert agent.city and "alicante" in agent.city.lower()
    assert msg == ""
    from api.agents.public.graph.home_flow import home_next_action

    assert home_next_action(agent, "vivo en Alicante") == "out_of_area"
    assert home_scripted_reply(_home_state(agent, "vivo en Alicante"), agent, "es") is None


def test_out_of_area_visit_with_stored_city():
    agent = AgentState(language="es", city="Alicante")
    from api.agents.public.graph.home_flow import home_next_action

    assert home_next_action(agent, "¿podéis venir a mi local?") == "out_of_area"
    agent, msg = _turn(agent, "¿podéis venir a mi local?")
    assert msg == ""
    assert home_scripted_reply(_home_state(agent, "¿podéis venir a mi local?"), agent, "es") is None


def test_cornella_after_valencia_is_in_coverage():
    """Cornellà es Catalunya: no debe quedar bloqueado por una ciudad fuera previa."""
    from api.agents.public.diagnostic_merge import apply_facts_from_message
    from api.agents.public.graph.home_flow import home_next_action

    agent = AgentState(language="es", city="Valencia")
    agent = apply_facts_from_message(agent, "estoy en Cornella")
    assert agent.city and "cornell" in agent.city.lower()
    assert home_next_action(agent, "estoy en Cornella") == "in_area"
    assert home_scripted_reply(_home_state(agent, "estoy en Cornella"), agent, "es") is None


def test_company_info_not_marked_as_business():
    from api.agents.public.diagnostic_merge import apply_facts_from_message
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, "quiero informacion de la empresa")
    assert agent.property_type is None
    assert home_next_action(agent, "quiero informacion de la empresa") == "company_info"
    state = _home_state(agent, "quiero informacion de la empresa")
    assert home_scripted_reply(state, agent, "es") is None
    assert choose_agent_route(state) == "receptionist"


def test_cucurachas_typo_asks_where():
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "cucurachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert msg == ""
    assert home_scripted_reply(_home_state(agent, "cucurachas"), agent, "es") is None


def test_presupuesto_without_case_asks_pest():
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    assert home_next_action(agent, "para el presupuesto?") == "ask_pest"
    state = _home_state(agent, "para el presupuesto?")
    assert choose_agent_route(state) == "receptionist"
    assert home_scripted_reply(state, agent, "es") is None

    agent2 = AgentState(language="es")
    agent2, msg = _turn(agent2, "presu")
    assert choose_agent_route(_home_state(agent2, "presu")) == "receptionist"
    assert msg == "" or "€" not in msg


def test_si_quiero_presupuesto_advances_to_where():
    """Con keyword presupuesto el LLM orquesta; sin plantilla ni precio inventado."""
    from api.agents.public.graph.home_flow import home_next_action
    from api.agents.public.graph.routing import wants_pricing_message

    agent = AgentState(language="es")
    agent, msg1 = _turn(agent, "para un presupuesto?")
    assert "€" not in (msg1 or "")
    assert home_scripted_reply(_home_state(agent, "para un presupuesto?"), agent, "es") is None

    agent = ensure_pest_from_message(agent, "si pero quiero presupuesto")
    agent, msg2 = _turn(agent, "si pero quiero presupuesto")
    assert wants_pricing_message("si pero quiero presupuesto")
    assert "€" not in (msg2 or "")
    state = _home_state(agent, "si pero quiero presupuesto")
    assert choose_agent_route(state) == "receptionist"
    action = home_next_action(agent, "si pero quiero presupuesto")
    assert action in ("ask_property", "ask_where", "llm", "ask_pest", "ask_qty", "verdict")


def test_description_without_where_goes_to_llm_not_fake_location():
    """Sin zona aún, hechos en estado; sin plantilla de vivienda."""
    from api.agents.public.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "tengo cucarachas pequeñas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert not (agent.chat_diagnostic or {}).get("where")
    assert home_scripted_reply(_home_state(agent, "tengo cucarachas pequeñas"), agent, "es") is None

    agent, msg = _turn(agent, "piso")
    assert agent.property_type == "particular"

    assert home_next_action(agent, "son marrones") == "ask_where"
    assert not (agent.chat_diagnostic or {}).get("where")
    assert choose_agent_route(_home_state(agent, "son marrones")) == "receptionist"


def test_description_after_where_asks_quantity_not_verdict():
    """Con cocina ya dicha, «son marrones» → ask_qty en lógica; sin plantilla."""
    from api.agents.public.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, _ = _turn(agent, "cucarachas")
    agent, _ = _turn(agent, "piso")
    agent, msg = _turn(agent, "en la cocina")
    assert (agent.chat_diagnostic or {}).get("where") == "cocina"
    assert home_scripted_reply(_home_state(agent, "en la cocina"), agent, "es") is None

    assert home_next_action(agent, "son marrones") == "ask_qty"
    agent, msg2 = _turn(agent, "son marrones")
    assert msg2 == ""


def test_facts_capture_size_and_white_color():
    from api.agents.public.diagnostic_merge import apply_facts_from_message

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, "cucarachas grandes")
    assert any("gran" in n.lower() for n in agent.technical_notes)
    agent = apply_facts_from_message(agent, "son blancas")
    assert any("blanc" in n.lower() or "clar" in n.lower() for n in agent.technical_notes)


def test_building_pest_goes_to_agent_not_kitchen_template():
    """«cucarachas en mi edificio» → agente (comunidad), no plantilla cocina/baño."""
    from api.agents.public.diagnostic_merge import apply_facts_from_message
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply
    from api.agents.public.graph.routing import is_building_community_context, is_clear_own_pest_report

    msg = "tengo cucarachas en mi edificio"
    assert is_building_community_context(msg)
    assert not is_clear_own_pest_report(msg)

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, msg)
    assert agent.property_type == "comunitat"
    assert home_next_action(agent, msg) == "llm"
    state = _home_state(agent, msg)
    assert home_scripted_reply(state, agent, "es") is None
    assert choose_agent_route(state) == "receptionist"


def test_entrada_sets_where_and_context_keeps_pest_memory():
    """«en la entrada» se guarda; el contexto no pide otra vez la plaga."""
    from api.agents.public.chat_intake import apply_chat_intake_from_message, parse_field_value
    from api.agents.public.graph.home_flow import home_receptionist_context

    assert parse_field_value("where", "en la entrada") == "entrada"

    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="negoci",
    )
    agent = apply_chat_intake_from_message(agent, "en la entrada")
    assert (agent.chat_diagnostic or {}).get("where") == "entrada"

    ctx = home_receptionist_context(agent, "es", "grandes")
    low = ctx.lower()
    assert "plaga ya confirmada" in low or "ya sabemos" in low
    assert "plaga=cucarachas" in low
    assert "dónde=entrada" in low or "donde=entrada" in low
    assert "qué plaga ha visto" not in low
    assert "cuántas" in low


def test_cucas_then_salon_then_vivienda_never_reasks_pest():
    """«cucas» cuenta como plaga; hechos en estado; sin plantillas."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tengo un problema")
    assert home_scripted_reply(_home_state(agent, "tengo un problema"), agent, "es") is None

    agent, msg = _turn(agent, "cucas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH

    agent, msg = _turn(agent, "en un salon")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert (agent.chat_diagnostic or {}).get("where") == "salon"

    agent, msg = _turn(agent, "en una vivienda")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type == "particular"
    assert (agent.chat_diagnostic or {}).get("where") == "salon"
    assert home_scripted_reply(_home_state(agent, "en una vivienda"), agent, "es") is None


def test_street_after_cucarachas_keeps_pest_and_asks_qty():
    """«en la calle» no borra plaga; hechos en estado; sin plantilla."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tyengo problemas")
    assert agent.pest_type is None

    agent, msg = _turn(agent, "he visto una pequeña")
    assert agent.pest_type is None

    agent, msg = _turn(agent, "una de cucarachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH

    agent, msg = _turn(agent, "en la calle")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type == "particular"
    assert (agent.chat_diagnostic or {}).get("where") == "entrada"
    assert home_scripted_reply(_home_state(agent, "en la calle"), agent, "es") is None

    agent, msg = _turn(agent, "marrones")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert msg == ""


def test_company_knowledge_mentions_catalunya():
    from api.agents.public.company_knowledge import (
        find_outside_place,
        format_company_knowledge_for_agent,
        is_outside_service_area,
    )

    text = format_company_knowledge_for_agent("es")
    assert "Catalunya" in text or "catalunya" in text.lower()
    assert "933" in text
    assert find_outside_place("vivo en alicante") == "alicante"
    outside, place = is_outside_service_area(message="madrid", city=None)
    assert outside and place == "madrid"
    ok, _ = is_outside_service_area(message="estoy en badalona", city=None)
    assert not ok


def test_informational_identify_does_not_ask_property():
    """«cómo identifico…» / blog: sin plantilla; el LLM + RAG responden."""
    from api.agents.public.graph.home_flow import home_next_action, home_scripted_reply
    from api.agents.public.graph.routing import is_informational_query

    msg = "como identifico cucarachas en la cocina?"
    assert is_informational_query(msg)
    agent = AgentState(language="es", intent=Intent.DOUBT)
    assert home_next_action(agent, msg) == "knowledge"
    state = _home_state(agent, msg)
    assert home_scripted_reply(state, agent, "es") is None
    assert choose_agent_route(state) == "receptionist"

    blog_msg = "cuantos articulos hay en el blog?"
    assert is_informational_query(blog_msg)
    agent2 = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        intent=Intent.DOUBT,
    )
    state2 = _home_state(agent2, blog_msg)
    assert home_scripted_reply(state2, agent2, "es") is None
    assert choose_agent_route(state2) == "receptionist"
