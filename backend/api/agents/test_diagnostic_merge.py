from api.agents.diagnostic_merge import apply_facts_from_message, merge_agent_updates
from api.agents.models import AgentState, Intent, PestType, Severity


def test_apply_facts_extracts_pest_and_location():
    state = AgentState(language="ca")
    apply_facts_from_message(state, "tengo cucarachas en el baño")
    assert state.intent == Intent.QUOTE
    assert any("Plaga:" in n for n in state.technical_notes)
    assert any("bany" in n for n in state.technical_notes)


def test_apply_facts_identifies_american_cockroach():
    state = AgentState(language="es")
    apply_facts_from_message(state, "son de color marrón y grandes")
    assert state.pest_type == PestType.AMERICAN_COCKROACH


def test_merge_agent_updates_preserves_history():
    base = AgentState(language="ca", history=[{"role": "user", "content": "hola"}])
    updates = AgentState(language="ca", city="Barcelona", severity=Severity.MEDIUM)
    merged = merge_agent_updates(base, updates)
    assert merged.city == "Barcelona"
    assert merged.history == base.history
