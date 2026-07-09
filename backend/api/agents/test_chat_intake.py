"""Tests de recolección de datos por chat libre."""
from django.test import TestCase

from api.agents.chat_intake import (
    apply_chat_intake_from_message,
    build_unified_diagnostic,
    extract_fields_from_message,
    get_missing_mandatory_fields,
    parse_field_value,
)
from api.agents.graph.routing import choose_agent_route, should_run_intake
from api.agents.models import AgentState, Intent, PestType
from api.models import FichaServicio
from api.test_ficha_engine import CUC_GER_PISO


class ChatIntakeTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        FichaServicio.objects.create(**CUC_GER_PISO)

    def test_extract_postal_and_m2(self):
        found = extract_fields_from_message("Vivo en 08001, el piso tiene 75 m2")
        self.assertEqual(found["codigo_postal"], "08001")
        self.assertEqual(found["metros_cuadrados"], 75)

    def test_apply_pending_answer(self):
        agent = AgentState(
            pest_type=PestType.GERMAN_COCKROACH,
            property_type="particular",
            pending_intake_field="codigo_postal",
        )
        updated = apply_chat_intake_from_message(agent, "08001")
        self.assertEqual(updated.chat_diagnostic["codigo_postal"], "08001")
        self.assertIsNone(updated.pending_intake_field)

    def test_missing_fields_until_complete(self):
        agent = AgentState(
            pest_type=PestType.GERMAN_COCKROACH,
            property_type="particular",
            chat_diagnostic={"where": "cocina"},
        )
        missing = get_missing_mandatory_fields(agent, {"path": "particular"})
        self.assertIn("codigo_postal", missing)
        self.assertIn("metros_cuadrados", missing)

    def test_presupuesto_routes_to_intake(self):
        agent = AgentState(
            language="es",
            pest_type=PestType.GERMAN_COCKROACH,
            property_type="particular",
            intent=Intent.QUOTE,
            chat_diagnostic={"where": "cocina"},
        )
        state = {
            "message": "quiero un presupuesto",
            "language": "es",
            "agent_state": agent.model_dump(mode="json"),
        }
        self.assertTrue(should_run_intake(agent, {"path": "particular"}, "quiero un presupuesto"))
        self.assertEqual(choose_agent_route(state), "intake")

    def test_complete_chat_data_unified(self):
        agent = AgentState(
            pest_type=PestType.GERMAN_COCKROACH,
            property_type="particular",
            chat_diagnostic={"codigo_postal": "08001", "metros_cuadrados": 70, "where": "cocina"},
        )
        unified = build_unified_diagnostic(agent, {"path": "particular"})
        self.assertEqual(get_missing_mandatory_fields(agent, unified), [])

    def test_parse_m2_bare_number(self):
        self.assertEqual(parse_field_value("metros_cuadrados", "85"), 85)
