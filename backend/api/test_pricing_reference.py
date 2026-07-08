from decimal import Decimal

from api.agents.models import AgentState, PestType, Severity
from api.models import (
    Cliente,
    Presupuesto,
    PresupuestoDetalle,
    PresupuestoReferencia,
    Tratamiento,
    Ubicacion,
)
from api.pricing_reference import find_similar_references, sync_presupuesto_to_reference
from django.test import TestCase
from django.utils import timezone


class PricingReferenceTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre="Test Client",
            documento_fiscal="TEST-001",
            telefono="+34600111222",
            telefono_norm="600111222",
        )
        self.ubicacion = Ubicacion.objects.create(
            cliente=self.cliente,
            direccion="Carrer Test 1",
            ciudad="Barcelona",
            tipo_propiedad="Residencial",
        )
        self.tratamiento = Tratamiento.objects.create(
            nombre="Eliminació Directa",
            descripcion="Test",
            precio_base=Decimal("120.00"),
        )

    def test_sync_presupuesto_creates_reference(self):
        presupuesto = Presupuesto.objects.create(
            cliente=self.cliente,
            ubicacion=self.ubicacion,
            total_monto=Decimal("180.00"),
            validez_hasta=timezone.now().date(),
            pest_type="german_cockroach",
            severity="medium",
        )
        PresupuestoDetalle.objects.create(
            presupuesto=presupuesto,
            tratamiento=self.tratamiento,
            precio_unitario=Decimal("180.00"),
            cantidad=1,
        )

        ref = PresupuestoReferencia.objects.get(presupuesto=presupuesto)
        assert ref.total_monto == Decimal("180.00")
        assert ref.pest_type == "german_cockroach"
        assert ref.property_type == "particular"
        assert ref.city == "Barcelona"

    def test_find_similar_references_filters_by_pest(self):
        PresupuestoReferencia.objects.create(
            pest_type="german_cockroach",
            property_type="particular",
            city="Barcelona",
            total_monto=Decimal("150.00"),
            breakdown=[],
        )
        PresupuestoReferencia.objects.create(
            pest_type="american_cockroach",
            property_type="particular",
            city="Barcelona",
            total_monto=Decimal("220.00"),
            breakdown=[],
        )

        agent = AgentState(
            pest_type=PestType.GERMAN_COCKROACH,
            property_type="particular",
            city="Barcelona",
            severity=Severity.MEDIUM,
        )
        cases = find_similar_references(agent)
        assert len(cases) == 1
        assert cases[0].total_monto == Decimal("150.00")

    def test_sync_returns_none_without_amount(self):
        presupuesto = Presupuesto.objects.create(
            cliente=self.cliente,
            ubicacion=self.ubicacion,
            total_monto=Decimal("0"),
            validez_hasta=timezone.now().date(),
        )
        assert sync_presupuesto_to_reference(presupuesto) is None
        assert PresupuestoReferencia.objects.count() == 0
