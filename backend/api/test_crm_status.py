from django.test import TestCase

from api.crm_status import (
    apply_suggested_crm_status,
    set_manual_crm_status,
    suggest_crm_status,
    unlock_crm_status,
)
from api.models import (
    AgendaAppointment,
    AgendaService,
    AgendaStaff,
    Cliente,
    Presupuesto,
    Ubicacion,
)
from datetime import date, timedelta


class CrmStatusTests(TestCase):
    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre="Test Client",
            documento_fiscal="WEB-612345678",
            telefono="612345678",
            telefono_norm="612345678",
            email="test@example.com",
        )
        self.service = AgendaService.objects.create(
            id="svc-test",
            name_es="Primera revisión",
            name_en="First review",
            name_ca="Primera revisió",
            duration_minutes=60,
        )
        self.staff = AgendaStaff.objects.create(
            id="staff-test",
            name="Tècnic Test",
            role="Tècnic",
        )
        self.staff.services.add(self.service)

    def test_default_is_lead(self):
        self.assertEqual(self.cliente.crm_status, Cliente.CrmStatus.LEAD)
        self.assertEqual(suggest_crm_status(self.cliente), Cliente.CrmStatus.LEAD)

    def test_completed_appointment_suggests_alta(self):
        AgendaAppointment.objects.create(
            id="apt-1",
            staff=self.staff,
            service=self.service,
            date=date.today(),
            start_time="10:00",
            duration_minutes=60,
            customer_name="Test",
            customer_phone="612345678",
            status=AgendaAppointment.Status.COMPLETED,
            cliente=self.cliente,
        )
        self.assertEqual(suggest_crm_status(self.cliente), Cliente.CrmStatus.ALTA)
        apply_suggested_crm_status(self.cliente)
        self.cliente.refresh_from_db()
        self.assertEqual(self.cliente.crm_status, Cliente.CrmStatus.ALTA)

    def test_accepted_presupuesto_suggests_alta(self):
        ubicacion = Ubicacion.objects.create(
            cliente=self.cliente,
            direccion="Carrer Test 1",
            ciudad="Barcelona",
            tipo_propiedad="Residencial",
        )
        Presupuesto.objects.create(
            cliente=self.cliente,
            ubicacion=ubicacion,
            estado=Presupuesto.Estado.ACEPTADO,
            total_monto=100,
            validez_hasta=date.today() + timedelta(days=30),
        )
        apply_suggested_crm_status(self.cliente)
        self.cliente.refresh_from_db()
        self.assertEqual(self.cliente.crm_status, Cliente.CrmStatus.ALTA)

    def test_locked_status_not_overwritten(self):
        set_manual_crm_status(self.cliente, Cliente.CrmStatus.BAJA)
        AgendaAppointment.objects.create(
            id="apt-2",
            staff=self.staff,
            service=self.service,
            date=date.today(),
            start_time="11:00",
            duration_minutes=60,
            customer_name="Test",
            customer_phone="612345678",
            status=AgendaAppointment.Status.COMPLETED,
            cliente=self.cliente,
        )
        apply_suggested_crm_status(self.cliente)
        self.cliente.refresh_from_db()
        self.assertEqual(self.cliente.crm_status, Cliente.CrmStatus.BAJA)
        self.assertTrue(self.cliente.crm_status_locked)

    def test_unlock_reapplies_suggestion(self):
        set_manual_crm_status(self.cliente, Cliente.CrmStatus.BAJA)
        AgendaAppointment.objects.create(
            id="apt-3",
            staff=self.staff,
            service=self.service,
            date=date.today(),
            start_time="12:00",
            duration_minutes=60,
            customer_name="Test",
            customer_phone="612345678",
            status=AgendaAppointment.Status.COMPLETED,
            cliente=self.cliente,
        )
        unlock_crm_status(self.cliente)
        self.cliente.refresh_from_db()
        self.assertFalse(self.cliente.crm_status_locked)
        self.assertEqual(self.cliente.crm_status, Cliente.CrmStatus.ALTA)
