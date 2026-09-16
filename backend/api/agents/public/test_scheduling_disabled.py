"""Agendación de citas del chat cliente desactivada (sin agenda iGEO)."""
from unittest.mock import patch

from django.test import SimpleTestCase

from api.agents.public.booking import confirm_booking_from_chat
from api.agents.models import AgentState
from api.agents.public.prompts import (
    client_scheduling_unavailable_reply,
    scheduling_disabled_prompt_suffix,
)


class ClientSchedulingDisabledTests(SimpleTestCase):
    def test_unavailable_reply_has_no_slots(self):
        result = client_scheduling_unavailable_reply("es")
        self.assertFalse(result["booking_confirmed"])
        self.assertEqual(result["slots"], [])
        self.assertIsNone(result["booking_uid"])
        self.assertIn("933 309 169", result["message"])

    def test_unavailable_reply_catalan(self):
        result = client_scheduling_unavailable_reply("ca")
        self.assertIn("933 309 169", result["message"])
        self.assertEqual(result["slots"], [])

    @patch("api.agents.public.booking.ENABLE_CLIENT_SCHEDULING", False)
    def test_confirm_booking_blocked(self):
        state = AgentState(language="es")
        result = confirm_booking_from_chat(
            state,
            slot_time="2026-06-01T09:00:00.000Z",
            name="Anna Test",
            phone="676502975",
            language="es",
            address="Carrer Example 1, Barcelona",
            email="anna@test.cat",
        )
        self.assertFalse(result["booking_confirmed"])
        self.assertEqual(result["slots"], [])
        self.assertIn("933", result["message"])

    @patch("api.agents.config.ENABLE_CLIENT_SCHEDULING", False)
    def test_prompt_suffix_when_disabled(self):
        suffix = scheduling_disabled_prompt_suffix("es")
        self.assertIn("DESACTIVADAS", suffix)
        self.assertIn("933 309 169", suffix)

    @patch("api.agents.config.ENABLE_CLIENT_SCHEDULING", True)
    def test_prompt_suffix_empty_when_enabled(self):
        suffix = scheduling_disabled_prompt_suffix("es")
        self.assertEqual(suffix, "")
