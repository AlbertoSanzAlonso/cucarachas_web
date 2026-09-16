"""Tests unitarios PDI iGEO (sin RabbitMQ real)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, TestCase

from api.igeo.client import IgeoPdiClient, PublishResult
from api.igeo.config import IgeoPdiSettings
from api.igeo.payloads import (
    build_cliente_potencial,
    build_generic_entity,
    normalize_comando,
)
from api.igeo.sync import publish_lead_from_booking


class PayloadTests(SimpleTestCase):
    def test_normalize_comando(self):
        self.assertEqual(normalize_comando("create"), "CREATE")
        self.assertEqual(normalize_comando("UPDATE"), "UPDATE")
        with self.assertRaises(ValueError):
            normalize_comando("UPSERT")

    def test_cliente_potencial_minimo(self):
        payload = build_cliente_potencial(
            nombre="Anna Puig",
            codigo_delegacion="DN",
            codigo_gestionado_por="GESTOR1",
            telefono="676502975",
            email="anna@example.com",
            direccion="Carrer Example 1, Barcelona",
            remote_operation_id="apt-123",
        )
        self.assertEqual(payload["tipoEntidadIgeo"], "CLIENTE_POTENCIAL")
        self.assertEqual(payload["comando"], "CREATE")
        self.assertEqual(payload["remoteOperationId"], "apt-123")
        datos = payload["datos"]
        self.assertEqual(datos["codigoDelegacion"], "DN")
        self.assertEqual(datos["codigoGestionadoPor"], "GESTOR1")
        self.assertEqual(datos["tipoCliente"], "PARTICULAR")
        self.assertEqual(datos["nombre"], "Anna")
        self.assertEqual(datos["apellidos"], "Puig")
        self.assertEqual(datos["datosContacto"]["telefono"], "676502975")
        self.assertIn("datosPostales", datos)

    def test_cliente_potencial_requiere_delegacion(self):
        with self.assertRaises(ValueError):
            build_cliente_potencial(
                nombre="Test",
                codigo_delegacion="",
                codigo_gestionado_por="G1",
            )

    def test_generic_entity(self):
        payload = build_generic_entity(
            tipo_entidad="CLIENTE",
            comando="update",
            datos={"codigo": "C1", "nombre": "X"},
            codigo_entidad="C1",
        )
        self.assertEqual(payload["comando"], "UPDATE")
        self.assertEqual(payload["codigoEntidadIgeo"], "C1")


class ClientDryRunTests(SimpleTestCase):
    def test_dry_run_publish(self):
        settings = IgeoPdiSettings(
            enabled=True,
            host="",
            port=5671,
            user="",
            password="",
            vhost="",
            use_ssl=True,
            default_delegacion="DN",
            default_gestor="G1",
            default_idioma="es_ES",
            default_actividad="",
            default_zona_comercial="",
            dry_run=True,
        )
        client = IgeoPdiClient(settings)
        payload = build_cliente_potencial(
            nombre="Test Lead",
            codigo_delegacion="DN",
            codigo_gestionado_por="G1",
            telefono="600000000",
        )
        result = client.publish(payload)
        self.assertTrue(result.ok)
        self.assertTrue(result.dry_run)
        self.assertEqual(result.payload["tipoEntidadIgeo"], "CLIENTE_POTENCIAL")

    def test_disabled_skips(self):
        settings = IgeoPdiSettings(
            enabled=False,
            host="pdi.example",
            port=5671,
            user="u",
            password="p",
            vhost="pre_x",
            use_ssl=True,
            default_delegacion="DN",
            default_gestor="G1",
            default_idioma="es_ES",
            default_actividad="",
            default_zona_comercial="",
            dry_run=False,
        )
        result = IgeoPdiClient(settings).publish({"tipoEntidadIgeo": "CLIENTE", "comando": "CREATE", "datos": {}})
        self.assertFalse(result.ok)
        self.assertIn("ENABLED=false", result.message)


class SyncHookTests(SimpleTestCase):
    @patch("api.igeo.sync.is_igeo_enabled", return_value=False)
    def test_publish_lead_disabled(self, _mock):
        self.assertIsNone(
            publish_lead_from_booking(name="A", phone="600", booking_uid="1")
        )

    @patch("api.igeo.sync.is_igeo_enabled", return_value=True)
    @patch("api.igeo.sync.get_igeo_settings")
    @patch("api.igeo.sync.log_sync_result")
    def test_publish_lead_dry_run(self, _log, mock_settings, _en):
        mock_settings.return_value = IgeoPdiSettings(
            enabled=True,
            host="",
            port=5671,
            user="",
            password="",
            vhost="",
            use_ssl=True,
            default_delegacion="DN",
            default_gestor="GESTOR",
            default_idioma="es_ES",
            default_actividad="",
            default_zona_comercial="",
            dry_run=True,
        )
        result = publish_lead_from_booking(
            name="Maria Lopez",
            phone="612345678",
            email="m@ex.com",
            address="Carrer A 1, Barcelona",
            notes="Cucaracha alemanya",
            booking_uid="uid-99",
            property_type="empresa",
        )
        self.assertIsNotNone(result)
        assert result is not None
        self.assertTrue(result.ok)
        self.assertTrue(result.dry_run)
        self.assertEqual(result.payload["tipoEntidadIgeo"], "CLIENTE_POTENCIAL")
        self.assertEqual(result.payload["remoteOperationId"], "uid-99")
        self.assertEqual(result.payload["datos"]["tipoCliente"], "EMPRESA")


class BookingIgeoHookTests(TestCase):
    @patch("api.igeo.sync.publish_lead_from_booking")
    @patch("api.booking_email.send_booking_confirmation_email", return_value=False)
    @patch("api.agenda.engine.create_appointment")
    @patch("api.agenda.engine.get_default_service")
    @patch("api.agenda.engine.get_default_staff")
    def test_create_booking_calls_igeo(
        self,
        mock_staff,
        mock_service,
        mock_create,
        _email,
        mock_igeo,
    ):
        from api.agenda.engine import create_booking_from_slot

        mock_staff.return_value = MagicMock(id=1)
        mock_service.return_value = MagicMock(id=1)
        apt = MagicMock()
        apt.id = "booking-uid-1"
        mock_create.return_value = apt
        mock_igeo.return_value = PublishResult(
            ok=True, dry_run=True, remote_operation_id="booking-uid-1", message="dry"
        )

        ok, msg, uid = create_booking_from_slot(
            slot_time="2026-06-01T09:00:00+02:00",
            attendee_name="Test User",
            attendee_phone="612345678",
            address="Carrer Test 1, Barcelona",
            attendee_email="test@example.com",
            notes="prova",
            language="ca",
        )
        self.assertTrue(ok)
        self.assertEqual(uid, "booking-uid-1")
        mock_igeo.assert_called_once()
        kwargs = mock_igeo.call_args.kwargs
        self.assertEqual(kwargs["name"], "Test User")
        self.assertEqual(kwargs["booking_uid"], "booking-uid-1")
        self.assertIn("Barcelona", kwargs["address"])
