"""Tests unitarios del cliente Cal.com (sin red)."""
from unittest.mock import patch

from django.test import SimpleTestCase

from api import cal_client


class ResolveBookingLocationTests(SimpleTestCase):
    def setUp(self):
        cal_client._cached_event_locations = None
        cal_client._cached_locations_event_id = None

    @patch.object(cal_client, "CAL_BOOKING_LOCATION_TYPE", "attendeeAddress")
    @patch.object(cal_client, "_location_types_from_event_type", return_value={"attendeeAddress"})
    def test_in_person_attendee_address(self, *_mocks):
        loc = cal_client.resolve_booking_location(address="Carrer Example 1, Barcelona")
        self.assertEqual(
            loc,
            {"type": "attendeeAddress", "address": "Carrer Example 1, Barcelona"},
        )

    @patch.object(cal_client, "CAL_BOOKING_LOCATION_TYPE", "attendeeAddress")
    @patch.object(cal_client, "_location_types_from_event_type", return_value={"integration"})
    def test_never_uses_integration_when_only_video_in_stale_cache(self, *_mocks):
        """Caché/API antigua con integration no debe mandar videollamada (CECSA presencial)."""
        loc = cal_client.resolve_booking_location(address="Barcelona")
        self.assertEqual(loc, {"type": "attendeeAddress", "address": "Barcelona"})

    @patch.object(cal_client, "CAL_BOOKING_LOCATION_TYPE", "integration")
    @patch.object(cal_client, "_integrations_from_event_type", return_value=["cal-video"])
    def test_integration_only_when_explicit_env(self, *_mocks):
        loc = cal_client.resolve_booking_location(address="Barcelona")
        self.assertEqual(loc, {"type": "integration", "integration": "cal-video"})

    @patch.object(cal_client, "CAL_BOOKING_LOCATION_TYPE", "attendeeAddress")
    @patch.object(cal_client, "_location_types_from_event_type", return_value=set())
    def test_defaults_to_attendee_address_when_api_returns_no_locations(self, *_mocks):
        loc = cal_client.resolve_booking_location(address="Barcelona")
        self.assertEqual(loc, {"type": "attendeeAddress", "address": "Barcelona"})


class ParseSlotsResponseTests(SimpleTestCase):
    def _make_payload(self, num_days: int, slots_per_day: int) -> dict:
        slots = {}
        for d in range(num_days):
            day = f"2026-06-{d + 1:02d}"
            slots[day] = [f"{day}T{9 + h:02d}:00:00+02:00" for h in range(slots_per_day)]
        return {"data": {"slots": slots}}

    @patch.object(cal_client, "CAL_MAX_DAYS", 14)
    def test_includes_all_days_not_capped_by_slot_count(self):
        payload = self._make_payload(num_days=10, slots_per_day=6)
        result = cal_client.parse_slots_response(payload)
        unique_days = {s["date"] for s in result}
        self.assertEqual(len(unique_days), 10)
        self.assertEqual(len(result), 60)

    @patch.object(cal_client, "CAL_MAX_DAYS", 8)
    def test_respects_max_days_limit(self):
        payload = self._make_payload(num_days=12, slots_per_day=4)
        result = cal_client.parse_slots_response(payload)
        unique_days = {s["date"] for s in result}
        self.assertEqual(len(unique_days), 8)
        self.assertEqual(len(result), 32)
