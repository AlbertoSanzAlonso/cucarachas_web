from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from api.models import Cliente, Presupuesto, PresupuestoDetalle, PresupuestoReferencia
from api.presupuesto_pdf import build_presupuesto_pdf
from api.presupuesto_service import create_presupuesto_from_form


class PresupuestoPdfTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre="Anna Test",
            documento_fiscal="PDF-001",
            telefono="+34600999888",
            telefono_norm="600999888",
            email="anna@test.cat",
        )

    def test_create_presupuesto_with_free_concepts(self):
        presupuesto = create_presupuesto_from_form(
            cliente_id=self.cliente.id,
            lineas=[
                {"concepto": "Desinsectació paneroles", "precio": "150.00", "cantidad": 1},
                {"concepto": "Segona visita de control", "precio": "45.00", "cantidad": 1},
            ],
            direccion="Carrer Major 1",
            ciudad="Barcelona",
            fecha=date(2026, 7, 8),
            notas="Inclou productes eco.",
        )
        assert presupuesto.total_monto == Decimal("195.00")
        assert presupuesto.detalles.count() == 2
        assert presupuesto.detalles.first().line_label == "Desinsectació paneroles"
        assert PresupuestoReferencia.objects.filter(presupuesto=presupuesto).exists()

    def test_build_pdf_returns_bytes(self):
        presupuesto = create_presupuesto_from_form(
            cliente_id=self.cliente.id,
            lineas=[{"concepto": "Visita tècnica", "precio": "85.00", "cantidad": 1}],
            fecha=timezone.now().date(),
        )
        pdf = build_presupuesto_pdf(presupuesto)
        assert pdf[:4] == b"%PDF"
