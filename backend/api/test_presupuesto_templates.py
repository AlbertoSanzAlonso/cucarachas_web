from decimal import Decimal

from django.core.management import call_command
from django.test import TestCase

from api.models import PresupuestoReferencia
from api.presupuesto_templates import PRESUPUESTO_TEMPLATES, calc_iva, calc_total_con_iva


class PresupuestoTemplatesTests(TestCase):
    def test_templates_have_two_models(self):
        assert len(PRESUPUESTO_TEMPLATES) == 2
        ids = {t["id"] for t in PRESUPUESTO_TEMPLATES}
        assert ids == {"11675P", "11630P"}

    def test_iva_calculation_matches_reference_pdfs(self):
        base_particular = Decimal("250.00")
        assert calc_iva(base_particular) == Decimal("52.50")
        assert calc_total_con_iva(base_particular) == Decimal("302.50")

        base_hosteleria = Decimal("450.00")
        assert calc_iva(base_hosteleria) == Decimal("94.50")
        assert calc_total_con_iva(base_hosteleria) == Decimal("544.50")

    def test_seed_command_is_idempotent(self):
        call_command("seed_presupuesto_references")
        assert PresupuestoReferencia.objects.count() == 2
        ref = PresupuestoReferencia.objects.get(codigo="11675P")
        assert ref.total_monto == Decimal("250.00")
        assert ref.property_type == "particular"

        call_command("seed_presupuesto_references")
        assert PresupuestoReferencia.objects.count() == 2
