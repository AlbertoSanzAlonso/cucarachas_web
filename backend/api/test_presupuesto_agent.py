"""Tests de persistència de pressupostos des del Bio-Assistent."""
from datetime import date
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from api.agents.models import AgentState, PestType, Severity
from api.models import Cliente, Presupuesto
from api.presupuesto_agent import persist_agent_presupuesto


class PersistAgentPresupuestoTests(TestCase):
    def test_creates_borrador_with_origen_agent(self):
        agent = AgentState(
            customer_name="Hotel Test",
            city="Barcelona",
            property_type="negoci",
            pest_type=PestType.GERMAN_COCKROACH,
            severity=Severity.MEDIUM,
            chat_diagnostic={"business_type": "hotel", "codigo_postal": "08001"},
        )
        pres = persist_agent_presupuesto(
            agent,
            {"who": "empresa", "business_type": "hotel"},
            price_min=180,
            price_max=320,
            final_price=250,
            breakdown=["Inspecció", "Tractament gel"],
            guarantee_months=12,
            ficha_codigo="CUC-GER-NEG",
        )
        self.assertIsNotNone(pres)
        assert pres is not None
        self.assertEqual(pres.origen, "agent")
        self.assertEqual(pres.estado, Presupuesto.Estado.BORRADOR)
        self.assertEqual(pres.total_monto, Decimal("250.00"))
        self.assertEqual(pres.detalles.count(), 2)
        self.assertTrue(pres.cliente.documento_fiscal.startswith("AGENT-"))

    @patch("api.presupuesto_agent.upsert_cliente_by_phone")
    def test_links_existing_client_by_phone(self, mock_upsert):
        cliente = Cliente.objects.create(
            nombre="Client Real",
            telefono="612345678",
            telefono_norm="612345678",
            documento_fiscal="B12345678",
        )
        mock_upsert.return_value = (cliente, False)

        agent = AgentState(
            customer_name="Client Real",
            chat_diagnostic={"telefono": "612345678"},
        )
        pres = persist_agent_presupuesto(
            agent,
            {},
            price_min=90,
            price_max=90,
            final_price=90,
            breakdown=["Tractament"],
        )
        self.assertEqual(pres.cliente_id, cliente.id)
