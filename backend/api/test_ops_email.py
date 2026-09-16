"""Tests del correu de l'assistent d'oficina."""

from __future__ import annotations

import os

from django.core import mail
from django.test import SimpleTestCase, override_settings

from api.ops_email import email_status_summary, send_ops_email


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="info@cecsaddd.com",
    EMAIL_HOST="smtp.test.local",
)
class OpsEmailTests(SimpleTestCase):
    def tearDown(self):
        os.environ.pop("OPS_EMAIL_DRY_RUN", None)

    def test_rejects_invalid_to(self):
        result = send_ops_email(to_email="nope", subject="Hola", body="Cos del missatge")
        self.assertFalse(result.ok)
        self.assertEqual(len(mail.outbox), 0)

    def test_rejects_empty_body(self):
        result = send_ops_email(to_email="anna@test.cat", subject="Hola", body=" ")
        self.assertFalse(result.ok)
        self.assertEqual(len(mail.outbox), 0)

    def test_sends_plain_email(self):
        result = send_ops_email(
            to_email="anna@test.cat",
            subject="Confirmació visita",
            body="Hola Anna, et confirmem la visita demà.",
        )
        self.assertTrue(result.ok)
        self.assertFalse(result.dry_run)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["anna@test.cat"])
        self.assertEqual(mail.outbox[0].subject, "Confirmació visita")
        self.assertEqual(mail.outbox[0].from_email, "info@cecsaddd.com")

    def test_sends_with_cc(self):
        result = send_ops_email(
            to_email="anna@test.cat",
            subject="Pressupost",
            body="Adjuntem informació.",
            cc="oficina@cecsaddd.com, info@cecsaddd.com",
        )
        self.assertTrue(result.ok)
        self.assertEqual(mail.outbox[0].cc, ["oficina@cecsaddd.com", "info@cecsaddd.com"])

    def test_dry_run_does_not_send(self):
        os.environ["OPS_EMAIL_DRY_RUN"] = "true"
        result = send_ops_email(
            to_email="anna@test.cat",
            subject="Prova",
            body="Només dry-run",
        )
        self.assertTrue(result.ok)
        self.assertTrue(result.dry_run)
        self.assertEqual(len(mail.outbox), 0)

    def test_status_summary_includes_from(self):
        summary = email_status_summary()
        self.assertIn("ready=", summary)
        self.assertIn("from=info@cecsaddd.com", summary)

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
        EMAIL_HOST="",
        EMAIL_HOST_USER="",
        EMAIL_HOST_PASSWORD="",
    )
    def test_not_ready_explains_coolify_vars(self):
        summary = email_status_summary()
        self.assertIn("ready=False", summary)
        self.assertIn("EMAIL_HOST", summary)
        result = send_ops_email(
            to_email="anna@test.cat",
            subject="Prova",
            body="Hola",
        )
        self.assertFalse(result.ok)
        self.assertIn("EMAIL_HOST", result.message)
        self.assertIn("Coolify", result.message)
