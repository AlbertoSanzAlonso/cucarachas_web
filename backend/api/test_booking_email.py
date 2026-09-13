"""Tests de correo de confirmación de cita."""
from __future__ import annotations

from datetime import date
from types import SimpleNamespace

from django.core import mail
from django.test import TestCase, override_settings

from api.booking_email import send_booking_confirmation_email


def _apt(**kwargs):
    base = dict(
        id="apt-test-1",
        date=date(2026, 9, 15),
        start_time="10:00",
        customer_name="Anna Test",
        customer_phone="676502975",
        customer_email="anna@test.cat",
        customer_address="Carrer Example 1, Barcelona",
        locale="ca",
        origin="chat",
    )
    base.update(kwargs)
    return SimpleNamespace(**base)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="info@cecsaddd.com",
    BOOKING_NOTIFY_EMAIL="info@cecsaddd.com",
)
class BookingEmailTests(TestCase):
    def test_sends_client_and_internal(self):
        ok = send_booking_confirmation_email(_apt())
        self.assertTrue(ok)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ["anna@test.cat"])
        self.assertIn("confirmada", mail.outbox[0].body.lower())
        self.assertEqual(mail.outbox[1].to, ["info@cecsaddd.com"])
        self.assertIn("Nova cita", mail.outbox[1].subject)

    def test_spanish_locale(self):
        ok = send_booking_confirmation_email(_apt(locale="es"))
        self.assertTrue(ok)
        self.assertIn("Confirmación", mail.outbox[0].subject)
        self.assertIn("confirmada", mail.outbox[0].body.lower())

    def test_skips_without_email(self):
        ok = send_booking_confirmation_email(_apt(customer_email=""))
        self.assertFalse(ok)
        self.assertEqual(len(mail.outbox), 0)
