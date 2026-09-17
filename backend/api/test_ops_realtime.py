"""Tests del mode veu Realtime (session / tool / transcript)."""

from __future__ import annotations

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.agents.ops.realtime_session import (
    build_session_config,
    execute_realtime_tool,
    realtime_tools_schema,
)
from api.models import AdminConversation, AdminMessage


User = get_user_model()


class RealtimeSessionUnitTests(TestCase):
    def test_session_config_has_tools_without_send(self):
        cfg = build_session_config(language="ca")
        session = cfg["session"]
        self.assertEqual(session["type"], "realtime")
        names = {t["name"] for t in session["tools"]}
        self.assertIn("search_whatsapp_contacts", names)
        self.assertIn("prepare_whatsapp", names)
        self.assertIn("confirm_pending_action", names)
        self.assertNotIn("send_whatsapp", names)
        self.assertNotIn("send_email", names)
        self.assertIn("MAI diguis @lid", session["instructions"])

    def test_tools_schema_count(self):
        self.assertGreaterEqual(len(realtime_tools_schema()), 10)


class RealtimeApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="opsrt",
            email="ops-rt@test.local",
            password="pass12345",
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_session_requires_auth(self):
        anon = APIClient()
        res = anon.post("/api/ops/realtime/session/", {}, format="json")
        self.assertEqual(res.status_code, 401)

    @patch("api.agents.ops.realtime_session.create_ephemeral_client_secret")
    def test_session_creates_conversation_and_returns_secret(self, mock_secret):
        mock_secret.return_value = {
            "client_secret": "ek_test_secret",
            "expires_at": 9999999999,
            "model": "gpt-realtime",
            "voice": "marin",
        }
        res = self.client.post(
            "/api/ops/realtime/session/",
            {"language": "ca"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["client_secret"], "ek_test_secret")
        self.assertTrue(res.data["conversation_id"])
        self.assertTrue(
            AdminConversation.objects.filter(pk=res.data["conversation_id"], user=self.user).exists()
        )

    def test_tool_prepare_and_confirm_whatsapp(self):
        conv = AdminConversation.objects.create(user=self.user, title="RT")
        prep = self.client.post(
            "/api/ops/realtime/tool/",
            {
                "conversation_id": conv.pk,
                "name": "prepare_whatsapp",
                "arguments": {
                    "telefono": "34600111222",
                    "nombre": "Joan",
                    "mensaje": "Hola Joan",
                    "summary": "WhatsApp a Joan",
                },
            },
            format="json",
        )
        self.assertEqual(prep.status_code, 200)
        self.assertIn("sí", prep.data["output"].casefold())
        conv.refresh_from_db()
        self.assertEqual(conv.pending_action["kind"], "whatsapp")
        self.assertNotIn("@lid", prep.data["output"])

        with patch("api.ops_actions.OpenWaClient") as mock_cls:
            mock_cls.return_value.send_text.return_value = type(
                "R",
                (),
                {"ok": True, "dry_run": False, "chat_id": "34600111222@c.us", "message": "ok"},
            )()
            conf = self.client.post(
                "/api/ops/realtime/tool/",
                {"conversation_id": conv.pk, "name": "confirm_pending_action", "arguments": {}},
                format="json",
            )
        self.assertEqual(conf.status_code, 200)
        self.assertIn("enviat", conf.data["output"].casefold())
        self.assertIn("Joan", conf.data["output"])
        self.assertNotIn("@lid", conf.data["output"])
        conv.refresh_from_db()
        self.assertIsNone(conv.pending_action)

    def test_tool_prepare_queues_batch_email_and_whatsapp(self):
        conv = AdminConversation.objects.create(user=self.user, title="RT-lot")
        wa = self.client.post(
            "/api/ops/realtime/tool/",
            {
                "conversation_id": conv.pk,
                "name": "prepare_whatsapp",
                "arguments": {
                    "telefono": "34600111222",
                    "nombre": "Joan",
                    "mensaje": "Hola Joan",
                    "summary": "WA Joan",
                },
            },
            format="json",
        )
        self.assertEqual(wa.status_code, 200)
        mail = self.client.post(
            "/api/ops/realtime/tool/",
            {
                "conversation_id": conv.pk,
                "name": "prepare_email",
                "arguments": {
                    "to_email": "anna@test.local",
                    "subject": "Visita",
                    "body": "Et confirmem.",
                    "cc": "",
                    "summary": "Mail Anna",
                },
            },
            format="json",
        )
        self.assertEqual(mail.status_code, 200)
        self.assertIn("2", mail.data["output"])
        conv.refresh_from_db()
        self.assertEqual(conv.pending_action["kind"], "batch")
        self.assertEqual(len(conv.pending_action["items"]), 2)

        with patch("api.ops_actions.OpenWaClient") as mock_wa, patch(
            "api.ops_actions.send_ops_email"
        ) as mock_mail:
            mock_wa.return_value.send_text.return_value = type(
                "R",
                (),
                {"ok": True, "dry_run": False, "chat_id": "34600111222@c.us", "message": "ok"},
            )()
            mock_mail.return_value = type(
                "E",
                (),
                {
                    "ok": True,
                    "dry_run": False,
                    "message": "Enviat",
                    "to_email": "anna@test.local",
                },
            )()
            conf = self.client.post(
                "/api/ops/realtime/tool/",
                {"conversation_id": conv.pk, "name": "confirm_pending_action", "arguments": {}},
                format="json",
            )
        self.assertEqual(conf.status_code, 200)
        self.assertIn("2/2", conf.data["output"])
        mock_wa.return_value.send_text.assert_called_once()
        mock_mail.assert_called_once()
        conv.refresh_from_db()
        self.assertIsNone(conv.pending_action)

    def test_transcript_persists_voice_messages(self):
        conv = AdminConversation.objects.create(user=self.user, title="Veu")
        res = self.client.post(
            "/api/ops/realtime/transcript/",
            {
                "conversation_id": conv.pk,
                "role": "user",
                "content": "Envia un WhatsApp a Mauro",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        msg = AdminMessage.objects.get(pk=res.data["message"]["id"])
        self.assertEqual(msg.source, "voice")
        self.assertEqual(msg.role, "user")

    def test_execute_cancel_pending(self):
        conv = AdminConversation.objects.create(
            user=self.user,
            title="X",
            pending_action={
                "kind": "whatsapp",
                "summary": "Test",
                "telefono": "600111222",
                "mensaje": "hola",
            },
        )
        out = execute_realtime_tool("cancel_pending_action", {}, conversation=conv)
        self.assertIn("cancel", out.casefold())
        conv.refresh_from_db()
        self.assertIsNone(conv.pending_action)
