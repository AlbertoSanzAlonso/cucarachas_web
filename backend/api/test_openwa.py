"""Tests OpenWA (sense contenidor real)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

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

    def test_rejects_landline(self):
        with self.assertRaises(OpenWaError):
            to_whatsapp_chat_id("933309169")


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
        response = MagicMock()
        response.ok = True
        response.json.return_value = {"success": True, "data": {"messageId": "true_34612345678@c.us_1"}}
        client = OpenWaClient(_settings())
        with patch("api.openwa.client.requests.request", return_value=response) as mock_req:
            result = client.send_text("612345678", "Hola")
        mock_req.assert_called_once()
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

    def test_list_contacts_gets_session_path(self):
        response = MagicMock()
        response.ok = True
        response.json.return_value = [
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
        with patch("api.openwa.client.requests.request", return_value=response) as mock_req:
            rows = client.list_contacts(limit=100)
        mock_req.assert_called_once()
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
        ]
        with patch.object(client, "list_contacts", return_value=sample):
            by_name = client.search_contacts("maria")
            by_phone = client.search_contacts("612345678")
        self.assertEqual(len(by_name), 1)
        self.assertEqual(by_name[0]["name"], "Maria Lopez")
        self.assertEqual(len(by_phone), 1)
        self.assertEqual(by_phone[0]["number"], "34612345678")

    def test_format_contacts_empty(self):
        self.assertIn("Cap contacte", format_contacts([]))

    def test_list_contacts_disabled(self):
        client = OpenWaClient(_settings(enabled=False))
        with self.assertRaises(OpenWaError):
            client.list_contacts()
