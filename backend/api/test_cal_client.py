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
