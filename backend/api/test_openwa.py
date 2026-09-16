"""Tests OpenWA (sense contenidor real)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import requests
from django.test import SimpleTestCase

from api.openwa.client import (
    OpenWaClient,
    OpenWaError,
    format_contacts,
    status_summary,
    to_whatsapp_chat_id,
)
from api.openwa.config import OpenWaSettings


def _settings(**overrides) -> OpenWaSettings:
    data = dict(
        enabled=True,
        api_url="http://openwa:2785/api",
        api_key="test-key",
        session_id="sess-cecsa",
        timeout_seconds=5,
        dry_run=False,
    )
    data.update(overrides)
    return OpenWaSettings(**data)


class ChatIdTests(SimpleTestCase):
    def test_spanish_mobile(self):
        self.assertEqual(to_whatsapp_chat_id("612345678"), "34612345678@c.us")
        self.assertEqual(to_whatsapp_chat_id("+34 612 345 678"), "34612345678@c.us")
        self.assertEqual(to_whatsapp_chat_id("34612345678"), "34612345678@c.us")
        self.assertEqual(to_whatsapp_chat_id("0034612345678"), "34612345678@c.us")

    def test_international_e164(self):
        self.assertEqual(to_whatsapp_chat_id("+54 9 11 2345 6789"), "5491123456789@c.us")
        self.assertEqual(to_whatsapp_chat_id("005491123456789"), "5491123456789@c.us")
        self.assertEqual(to_whatsapp_chat_id("+52 55 1234 5678"), "525512345678@c.us")
        self.assertEqual(to_whatsapp_chat_id("+1 415 555 2671"), "14155552671@c.us")

    def test_existing_chat_id(self):
        self.assertEqual(to_whatsapp_chat_id("5491123456789@c.us"), "5491123456789@c.us")
        self.assertEqual(
            to_whatsapp_chat_id("5491123456789@s.whatsapp.net"),
            "5491123456789@c.us",
        )
        self.assertEqual(to_whatsapp_chat_id("123456789012345@lid"), "123456789012345@lid")

    def test_search_contacts_prioritizes_recent_chats(self):
        client = OpenWaClient(_settings())
        chats = [
            {
                "id": "111@c.us",
                "name": "Altre",
                "isGroup": False,
                "kind": "individual",
                "timestamp": 10,
            },
            {
                "id": "5491199988877@c.us",
                "name": "Mauro Montenegro",
                "isGroup": False,
                "kind": "individual",
                "timestamp": 99,
            },
        ]
        with (
            patch.object(client, "iter_all_contacts", return_value=iter([])),
            patch.object(client, "iter_all_chats", return_value=iter(chats)),
        ):
            hits = client.search_contacts("Mauro Montenegro")
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0]["id"], "5491199988877@c.us")
        self.assertTrue(hits[0].get("_from_chat"))

    def test_rejects_landline(self):
        with self.assertRaises(OpenWaError):
            to_whatsapp_chat_id("933309169")
        with self.assertRaises(OpenWaError):
            to_whatsapp_chat_id("+34 933 309 169")

    def test_rejects_ambiguous_short(self):
        with self.assertRaises(OpenWaError):
            to_whatsapp_chat_id("12345")


class OpenWaClientTests(SimpleTestCase):
    def test_disabled_does_not_call_http(self):
        client = OpenWaClient(_settings(enabled=False))
        with patch("api.openwa.client.requests.request") as mock_req:
            result = client.send_text("612345678", "Hola CECSA")
        mock_req.assert_not_called()
        self.assertFalse(result.ok)
        self.assertTrue(result.dry_run)
        self.assertIn("OPENWA_ENABLED=false", result.message)

    def test_dry_run_validates_but_does_not_send(self):
        client = OpenWaClient(_settings(dry_run=True))
        with patch("api.openwa.client.requests.request") as mock_req:
            result = client.send_text("612345678", "Recordatori visita")
        mock_req.assert_not_called()
        self.assertTrue(result.ok)
        self.assertTrue(result.dry_run)
        self.assertEqual(result.chat_id, "34612345678@c.us")

    def test_empty_message_rejected(self):
        client = OpenWaClient(_settings())
        with self.assertRaises(OpenWaError):
            client.send_text("612345678", "  ")

    def test_send_text_posts_session_path(self):
        ready = MagicMock()
        ready.ok = True
        ready.json.return_value = {"id": "sess-cecsa", "status": "ready"}
        response = MagicMock()
        response.ok = True
        response.json.return_value = {"success": True, "data": {"messageId": "true_34612345678@c.us_1"}}
        client = OpenWaClient(_settings())
        with patch(
            "api.openwa.client.requests.request",
            side_effect=[ready, response],
        ) as mock_req:
            result = client.send_text("612345678", "Hola")
        self.assertEqual(mock_req.call_count, 2)
        args, kwargs = mock_req.call_args
        self.assertEqual(args[0], "POST")
        self.assertIn("/sessions/sess-cecsa/messages/send-text", args[1])
        self.assertEqual(kwargs["json"]["chatId"], "34612345678@c.us")
        self.assertEqual(kwargs["json"]["text"], "Hola")
        self.assertEqual(kwargs["headers"]["X-API-Key"], "test-key")
        self.assertTrue(result.ok)
        self.assertEqual(result.message_id, "true_34612345678@c.us_1")

    def test_status_summary_disabled(self):
        client = OpenWaClient(_settings(enabled=False, dry_run=True))
        text = status_summary(client)
        self.assertIn("enabled=False", text)
        self.assertIn("desactivat", text)

    def test_status_summary_connection_error(self):
        client = OpenWaClient(_settings(dry_run=False))
        with patch.object(
            client,
            "session_status",
            side_effect=RuntimeError("No es pot connectar a OpenWA (http://openwa:2785/api/sessions/x)"),
        ):
            text = status_summary(client)
        self.assertIn("ERROR DE CONNEXIÓ", text)
        self.assertIn("url=http://openwa:2785/api", text)

    def test_list_contacts_gets_session_path(self):
        ready = MagicMock()
        ready.ok = True
        ready.json.return_value = {"id": "sess-cecsa", "status": "ready"}
        contacts = MagicMock()
        contacts.ok = True
        contacts.json.return_value = [
            {
                "id": "34612345678@c.us",
                "name": "Anna",
                "pushName": "Anna",
                "number": "34612345678",
                "isMyContact": True,
                "isBlocked": False,
            }
        ]
        client = OpenWaClient(_settings())
        with patch(
            "api.openwa.client.requests.request",
            side_effect=[ready, contacts],
        ) as mock_req:
            rows = client.list_contacts(limit=100)
        self.assertEqual(mock_req.call_count, 2)
        args, kwargs = mock_req.call_args
        self.assertEqual(args[0], "GET")
        self.assertIn("/sessions/sess-cecsa/contacts", args[1])
        self.assertEqual(kwargs["params"]["limit"], 100)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["name"], "Anna")

    def test_search_contacts_filters_by_name_and_phone(self):
        client = OpenWaClient(_settings())
        sample = [
            {"id": "34611111111@c.us", "name": "Maria Lopez", "number": "34611111111", "isMyContact": True},
            {"id": "34622222222@c.us", "name": "Joan", "pushName": "Joanet", "number": "34622222222"},
            {"id": "34612345678@c.us", "name": "Altres", "number": "34612345678"},
            {
                "id": "5491123456789@c.us",
                "name": "Montenegro Mauro",
                "pushName": "Mauro",
                "number": "5491123456789",
            },
        ]
        with (
            patch.object(
                client,
                "iter_all_contacts",
                side_effect=lambda **_kwargs: iter(sample),
            ),
            patch.object(client, "iter_all_chats", return_value=iter([])),
        ):
            by_name = client.search_contacts("maria")
            by_phone = client.search_contacts("612345678")
            by_tokens = client.search_contacts("Mauro Montenegro")
            by_accent = client.search_contacts("maría")
            by_surname = client.search_contacts("Montenegro")
        self.assertEqual(len(by_name), 1)
        self.assertEqual(by_name[0]["name"], "Maria Lopez")
        self.assertEqual(len(by_phone), 1)
        self.assertEqual(by_phone[0]["number"], "34612345678")
        self.assertEqual(len(by_tokens), 1)
        self.assertEqual(by_tokens[0]["number"], "5491123456789")
        self.assertEqual(len(by_accent), 1)
        self.assertEqual(len(by_surname), 1)

    def test_search_contacts_includes_chats_not_in_agenda(self):
        client = OpenWaClient(_settings())
        chats = [
            {
                "id": "5491199988877@c.us",
                "name": "Mauro Montenegro",
                "isGroup": False,
                "kind": "individual",
                "timestamp": 1,
            }
        ]
        with (
            patch.object(client, "iter_all_contacts", return_value=iter([])),
            patch.object(client, "iter_all_chats", return_value=iter(chats)),
        ):
            hits = client.search_contacts("Mauro")
        self.assertEqual(len(hits), 1)
        self.assertTrue(hits[0].get("_from_chat"))
        self.assertEqual(hits[0]["number"], "5491199988877")

    def test_format_contacts_empty(self):
        text = format_contacts([])
        self.assertIn("Cap contacte", text)
        self.assertIn("internacional", text)

    def test_list_contacts_disabled(self):
        client = OpenWaClient(_settings(enabled=False))
        with self.assertRaises(OpenWaError):
            client.list_contacts()

    def test_send_rejects_when_session_not_ready(self):
        client = OpenWaClient(_settings())
        with patch.object(
            client,
            "session_status",
            return_value={"id": "sess-cecsa", "status": "qr_ready"},
        ):
            with self.assertRaises(OpenWaError) as ctx:
                client.send_text("612345678", "Hola")
        self.assertIn("no ready", str(ctx.exception))

    def test_connection_error_is_explicit(self):
        client = OpenWaClient(_settings())
        with patch(
            "api.openwa.client.requests.request",
            side_effect=requests.exceptions.ConnectionError("refused"),
        ):
            with self.assertRaises(RuntimeError) as ctx:
                client.list_contacts()
        self.assertIn("No es pot connectar a OpenWA", str(ctx.exception))
        self.assertIn("OPENWA_API_URL", str(ctx.exception))
