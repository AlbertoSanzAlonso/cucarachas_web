"""Guion del chat home: idioma UI, sin LLM ni datos de otra sesión."""
import pytest

from api.agents.chat_intake import apply_chat_intake_from_message, ensure_pest_from_message, parse_field_value
from api.agents.graph.home_flow import home_scripted_reply, reset_stale_home_case
from api.agents.graph.routing import choose_agent_route, apply_preprocess
from api.agents.graph.state import CECSAGraphState
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
        # Criterio del LLM (p. ej. presupuesto incompleto): sin plantilla
        return agent, ""
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
    assert "vivienda" in msg.lower() or "negocio" in msg.lower() or "comunidad" in msg.lower()
    assert "cocina" not in msg.lower() and "baño" not in msg.lower()
    assert agent.property_type is None
    assert "Costa Brava" not in (agent.city or "")

    agent, msg = _turn(agent, "piso")
    assert "Dónde" in msg or "dónde" in msg.lower()
    assert agent.property_type == "particular"

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


def test_vague_plaga_asks_pest_not_kitchen_zones():
    """«ayuda para una plaga» no asume cucarachas ni cocina/baño."""
    from api.agents.chat_intake import ensure_pest_from_message
    from api.agents.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "quisiera ayuda para una plaga")
    assert agent.pest_type is None
    assert "cucarachas" not in msg.lower() or "roedores" in msg.lower() or "otra plaga" in msg.lower()
    assert "cocina" not in msg.lower()
    assert "baño" not in msg.lower()
    assert home_next_action(agent, "quisiera ayuda para una plaga") == "ask_pest"


def test_cucarachas_asks_property_before_rooms():
    """Tras nombrar cucarachas, preguntar vivienda/negocio/comunidad antes que cocina."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tengo cucarachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type is None
    low = msg.lower()
    assert "vivienda" in low or "negocio" in low or "comunidad" in low
    assert "cocina" not in low and "baño" not in low

    agent, msg = _turn(agent, "en un bar")
    assert agent.property_type == "negoci"
    assert "local" in msg.lower() or "almacén" in msg.lower() or "cocina" in msg.lower()


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

    assert home_next_action(agent, "tengo una empresa") == "ask_pest"
    assert "plaga" in msg.lower() or "cucarach" in msg.lower()


def test_plaga_then_negocio_stays_on_script_not_llm():
    """Tras «ayuda para una plaga» + «es un negocio», plantilla negocio (no LLM inventando)."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "quisiera ayuda para una plaga")
    assert agent.pest_type is None
    assert "otra plaga" in msg.lower() or "roedores" in msg.lower()

    agent, msg = _turn(agent, "es un negocio")
    assert agent.property_type == "negoci"
    assert agent.pest_type is None
    low = msg.lower()
    assert "empresa" in low or "local" in low or "plaga" in low
    assert "cocina" not in low
    from api.agents.graph.home_flow import home_next_action

    assert home_next_action(agent, "es un negocio") == "ask_pest"


def test_eres_un_robot_goes_to_agent_not_pest_script():
    from api.agents.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, _ = _turn(agent, "hola")
    action = home_next_action(agent, "eres un robot?")
    assert action == "llm"
    state = _home_state(agent, "eres un robot?")
    assert choose_agent_route(state) == "receptionist"


def test_neighbor_cockroaches_goes_to_receptionist_agent():
    """Caso ambiguo: el agente (LLM) debe juzgar, no la plantilla «en el local»."""
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    assert "Cuéntame" in msg

    agent, msg = _turn(agent, "tengo un negocio")
    assert agent.property_type == "negoci"

    neighbor = "mi vecino tiene cucarachas"
    assert home_next_action(agent, neighbor) == "llm"
    state = _home_state(agent, neighbor)
    assert choose_agent_route(state) == "receptionist"
    # Sin plantilla: el nodo usará el LLM del recepcionista
    assert home_scripted_reply(state, agent, "es") is None
    assert "en el local" not in (msg or "").lower()


def test_vague_problem_does_not_inherit_stale_pest():
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply, reset_stale_home_case

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
    reply = home_scripted_reply(state, agent, "es")
    assert reply is not None
    text = reply["result"]["message"].lower()
    assert "cucarachas alemanas" not in text
    assert "vecino" not in text
    assert "plaga" in text or "cucarachas" in text or "roedores" in text


def test_out_of_area_alicante_scripted():
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "vivo en Alicante")
    assert agent.city and "alicante" in agent.city.lower()
    low = msg.lower()
    assert "catalunya" in low
    assert "desplaz" in low or "visita" in low or "fuera" in low
    assert "inspección gratuita" not in low


def test_out_of_area_visit_with_stored_city():
    agent = AgentState(language="es", city="Alicante")
    agent, msg = _turn(agent, "¿podéis venir a mi local?")
    low = msg.lower()
    assert "catalunya" in low
    assert "alicante" in low
    assert "inspección gratuita" not in low


def test_cornella_after_valencia_is_in_coverage():
    """Cornellà es Catalunya: no debe quedar bloqueado por una ciudad fuera previa."""
    from api.agents.diagnostic_merge import apply_facts_from_message
    from api.agents.graph.home_flow import home_next_action

    agent = AgentState(language="es", city="Valencia")
    agent = apply_facts_from_message(agent, "estoy en Cornella")
    assert agent.city and "cornell" in agent.city.lower()
    assert home_next_action(agent, "estoy en Cornella") == "in_area"
    agent, msg = _turn(AgentState(language="es", city="Valencia"), "estoy en Cornella")
    low = msg.lower()
    assert "servicio" in low or "servei" in low or "catalunya" in low
    assert "no podemos" not in low
    assert "no ens podem" not in low


def test_company_info_not_marked_as_business():
    from api.agents.diagnostic_merge import apply_facts_from_message
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, "quiero informacion de la empresa")
    assert agent.property_type is None
    assert home_next_action(agent, "quiero informacion de la empresa") == "company_info"
    state = _home_state(agent, "quiero informacion de la empresa")
    reply = home_scripted_reply(state, agent, "es")
    assert reply is not None
    text = reply["result"]["message"].lower()
    assert "catalunya" in text
    assert "negocio" not in text
    assert "933" in text


def test_cucurachas_typo_asks_where():
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "cucurachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    low = msg.lower()
    assert "vivienda" in low or "negocio" in low or "comunidad" in low
    assert "especificar" not in low


def test_presupuesto_without_case_asks_pest():
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    assert home_next_action(agent, "para el presupuesto?") == "ask_pest"
    state = _home_state(agent, "para el presupuesto?")
    assert choose_agent_route(state) == "receptionist"
    # Sin plantilla: el recepcionista LLM orquesta
    assert home_scripted_reply(state, agent, "es") is None

    agent2 = AgentState(language="es")
    agent2, msg = _turn(agent2, "presu")
    assert choose_agent_route(_home_state(agent2, "presu")) == "receptionist"
    assert msg == "" or "€" not in msg


def test_si_quiero_presupuesto_advances_to_where():
    """Tras ask_pest, «sí pero quiero presupuesto» confirma plaga; no cotiza aún."""
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply
    from api.agents.graph.routing import wants_pricing_message

    agent = AgentState(language="es")
    agent, msg1 = _turn(agent, "para un presupuesto?")
    assert agent.pending_intake_field == "pest"
    assert "€" not in (msg1 or "")

    agent, msg2 = _turn(agent, "si pero quiero presupuesto")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert wants_pricing_message("si pero quiero presupuesto")
    assert "€" not in (msg2 or "")
    # Con plaga + keyword presupuesto → pedir inmueble/zona (no precio inventado)
    state = _home_state(agent, "si pero quiero presupuesto")
    assert choose_agent_route(state) == "receptionist"
    action = home_next_action(agent, "si pero quiero presupuesto")
    assert action in ("ask_property", "ask_where", "llm", "ask_pest")
    if action in ("ask_pest", "ask_where", "ask_property"):
        # Puede ser plantilla o LLM según acción
        pass


def test_description_without_where_goes_to_llm_not_fake_location():
    """Sin zona aún, «son marrones» no inventa ubicación ni salta a cantidad falsa."""
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply

    agent = AgentState(language="es")
    agent, msg = _turn(agent, "tengo cucarachas pequeñas")
    low = msg.lower()
    assert "vivienda" in low or "negocio" in low or "comunidad" in low
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert not (agent.chat_diagnostic or {}).get("where")

    agent, msg = _turn(agent, "piso")
    assert agent.property_type == "particular"
    assert "dónde" in msg.lower() or "donde" in msg.lower()

    assert home_next_action(agent, "son marrones") == "ask_where"
    state = _home_state(agent, "son marrones")
    # Plantilla de zona o LLM; no inventar ubicación en chat_diagnostic
    assert not (agent.chat_diagnostic or {}).get("where")
    assert choose_agent_route(state) == "receptionist"


def test_description_after_where_asks_quantity_not_verdict():
    """Con cocina ya dicha, «son marrones» debe pedir cantidad — no veredicto de alemanas."""
    from api.agents.graph.home_flow import home_next_action

    agent = AgentState(language="es")
    agent, _ = _turn(agent, "cucarachas")
    agent, _ = _turn(agent, "piso")
    agent, msg = _turn(agent, "en la cocina")
    assert "cuántas" in msg.lower() or "cuantas" in msg.lower()
    assert (agent.chat_diagnostic or {}).get("where") == "cocina"

    assert home_next_action(agent, "son marrones") == "ask_qty"
    agent, msg2 = _turn(agent, "son marrones")
    low = msg2.lower()
    assert "cuántas" in low or "cuantas" in low or "pocas" in low
    assert "alemana" not in low
    assert "nevera" not in low


def test_facts_capture_size_and_white_color():
    from api.agents.diagnostic_merge import apply_facts_from_message

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, "cucarachas grandes")
    assert any("gran" in n.lower() for n in agent.technical_notes)
    agent = apply_facts_from_message(agent, "son blancas")
    assert any("blanc" in n.lower() or "clar" in n.lower() for n in agent.technical_notes)


def test_building_pest_goes_to_agent_not_kitchen_template():
    """«cucarachas en mi edificio» → agente (comunidad), no plantilla cocina/baño."""
    from api.agents.diagnostic_merge import apply_facts_from_message
    from api.agents.graph.home_flow import home_next_action, home_scripted_reply
    from api.agents.graph.routing import is_building_community_context, is_clear_own_pest_report

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
    from api.agents.chat_intake import apply_chat_intake_from_message, parse_field_value
    from api.agents.graph.home_flow import home_receptionist_context

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
    """«cucas» cuenta como plaga; no repreguntar tras vivienda; conservar salón."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tengo un problema")
    assert "plaga" in msg.lower() or "cucarach" in msg.lower()

    agent, msg = _turn(agent, "cucas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert "vivienda" in msg.lower() or "negocio" in msg.lower() or "comunidad" in msg.lower()
    assert "qué plaga" not in msg.lower()

    agent, msg = _turn(agent, "en un salon")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert (agent.chat_diagnostic or {}).get("where") == "salon"
    # Puede pedir inmueble o cantidad; NUNCA de nuevo la plaga
    assert "has visto cucarachas, roedores" not in msg.lower()
    assert "qué plaga" not in msg.lower()

    agent, msg = _turn(agent, "en una vivienda")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type == "particular"
    assert (agent.chat_diagnostic or {}).get("where") == "salon"
    low = msg.lower()
    assert "has visto cucarachas, roedores" not in low
    assert "qué plaga" not in low
    assert "cuánt" in low or "pocas" in low or "varias" in low


def test_street_after_cucarachas_keeps_pest_and_asks_qty():
    """«en la calle» no borra plaga ni repregunta especie; asume vivienda + exterior."""
    agent = AgentState(language="es")
    agent, msg = _turn(agent, "hola")
    agent, msg = _turn(agent, "tyengo problemas")
    assert agent.pest_type is None
    assert "plaga" in msg.lower() or "cucarach" in msg.lower()

    agent, msg = _turn(agent, "he visto una pequeña")
    assert agent.pest_type is None
    assert "plaga" in msg.lower() or "cucarach" in msg.lower()

    agent, msg = _turn(agent, "una de cucarachas")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert "vivienda" in msg.lower() or "negocio" in msg.lower()

    agent, msg = _turn(agent, "en la calle")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert agent.property_type == "particular"
    assert (agent.chat_diagnostic or {}).get("where") == "entrada"
    low = msg.lower()
    assert "qué plaga" not in low
    assert "cuánt" in low or "pocas" in low or "varias" in low

    agent, msg = _turn(agent, "marrones")
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert "qué plaga" not in msg.lower()
    assert "cuánt" in msg.lower() or "pocas" in msg.lower() or "anoto" in msg.lower()


def test_company_knowledge_mentions_catalunya():
    from api.agents.company_knowledge import (
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
