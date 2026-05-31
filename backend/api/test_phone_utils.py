from django.test import TestCase

from api.models import Cliente
from api.phone_utils import normalize_phone, upsert_cliente_by_phone


class NormalizePhoneTests(TestCase):
    def test_last_nine_digits_spain(self):
        self.assertEqual(normalize_phone("+34 612 34 56 78"), "612345678")
        self.assertEqual(normalize_phone("612345678"), "612345678")

    def test_short_number_returns_all_digits(self):
        self.assertEqual(normalize_phone("12345"), "12345")

    def test_empty(self):
        self.assertEqual(normalize_phone(""), "")
        self.assertEqual(normalize_phone(None), "")


class UpsertClienteTests(TestCase):
    def test_creates_and_deduplicates(self):
        c1, created1 = upsert_cliente_by_phone(
            telefono="+34 612 345 678",
            nombre="Anna",
            email="a@test.cat",
        )
        self.assertTrue(created1)
        self.assertEqual(c1.telefono_norm, "612345678")

        c2, created2 = upsert_cliente_by_phone(
            telefono="612-345-678",
            nombre="Anna Actualitzada",
            email="b@test.cat",
        )
        self.assertFalse(created2)
        self.assertEqual(c1.id, c2.id)
        c2.refresh_from_db()
        self.assertEqual(c2.nombre, "Anna Actualitzada")
        self.assertEqual(c2.email, "b@test.cat")
        self.assertEqual(Cliente.objects.count(), 1)
