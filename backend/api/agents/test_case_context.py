"""Memoria de caso compartida entre agentes."""
from api.agents.case_context import build_shared_case_context, case_memory
from api.agents.diagnostic_merge import merge_agent_updates
from api.agents.models import AgentState, PestType, Severity


def test_case_memory_known_and_missing():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="particular",
        chat_diagnostic={"where": "cocina"},
    )
    mem = case_memory(agent, "es")
    assert mem["pest_confirmed"] is True
    assert any("dónde=cocina" in k for k in mem["known"])
    assert any("cuántas" in m for m in mem["missing"])
    assert mem["case_ready"] is False


def test_shared_context_same_memory_for_all_roles():
    agent = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="negoci",
        city="Barcelona",
        chat_diagnostic={"where": "entrada", "quantity": "several"},
        technical_notes=["Descripció: grans i marrons"],
    )
    for role in ("receptionist", "diagnostician", "pricer", "scheduler", "crm"):
        ctx = build_shared_case_context(agent, "es", "quiero presupuesto", role=role)
        low = ctx.lower()
        assert "memoria del caso" in low
        assert "dónde=entrada" in low or "donde=entrada" in low
        assert "cuántas=several" in low
        assert "prohibido volver a preguntar" in low
        assert "qué plaga" not in low.split("siguiente dato")[0] or "ya confirmada" in low


def test_merge_does_not_erase_confirmed_facts():
    base = AgentState(
        language="es",
        pest_type=PestType.GERMAN_COCKROACH,
        property_type="particular",
        city="Barcelona",
        chat_diagnostic={"where": "cocina", "quantity": "many"},
        technical_notes=["Plaga: cucaraches"],
    )
    updates = AgentState(
        language="es",
        pest_type=None,
        property_type=None,
        city=None,
        chat_diagnostic={"where": "", "extra": "x"},
        technical_notes=["Color: marrón"],
        severity=Severity.HIGH,
    )
    merged = merge_agent_updates(base, updates)
    assert merged.pest_type == PestType.GERMAN_COCKROACH
    assert merged.property_type == "particular"
    assert merged.city == "Barcelona"
    assert merged.chat_diagnostic.get("where") == "cocina"
    assert merged.chat_diagnostic.get("quantity") == "many"
    assert merged.chat_diagnostic.get("extra") == "x"
    assert any("marrón" in n or "Color" in n for n in merged.technical_notes)
    assert merged.severity == Severity.HIGH
