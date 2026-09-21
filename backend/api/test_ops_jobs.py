"""Cola OpsJob y cálculo de renovaciones (sin red)."""

from datetime import date
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import AdminConversation, OpsJob
from api.renewals import renewal_schedule


class RenewalScheduleTests(APITestCase):
    def test_semiannual_dates_require_confirmation(self):
        schedule = renewal_schedule(date(2026, 3, 18))
        self.assertTrue(schedule["requires_human_confirmation"])
        self.assertEqual(schedule["inicio"], "2026-09-01")
        self.assertEqual(schedule["segunda_odt"], "2027-03-01")
        self.assertEqual(schedule["fin"], "2027-08-31")


class OpsQueueApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="queueops",
            email="queue@test.local",
            password="pass12345",
        )
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    @patch("api.ops_actions.OpenWaClient")
    def test_confirm_enqueues_and_reports(self, mock_client_cls):
        client = mock_client_cls.return_value
        client.send_text.return_value = type(
            "R",
            (),
            {"ok": True, "dry_run": False, "chat_id": "346@c.us", "message": "Enviat"},
        )()
        conv = AdminConversation.objects.create(user=self.user, title="Cua")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {
                "language": "ca",
                "confirm_action": {
                    "kind": "whatsapp",
                    "summary": "Salut",
                    "telefono": "612345678",
                    "mensaje": "Hola",
                },
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertIn("Cua completada", res.data["assistant_message"]["content"])
        job = OpsJob.objects.get(conversation=conv)
        self.assertEqual(job.status, OpsJob.Status.DONE)
        client.send_text.assert_called_once()
