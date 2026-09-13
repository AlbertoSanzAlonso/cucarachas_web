"""Tests sync contenido web → RAG (sin PII / sin coste_interno)."""

from __future__ import annotations

from decimal import Decimal
from unittest import mock

from django.test import TestCase, override_settings

from api.models import BlogArticle, FichaServicio, PresupuestoReferencia
from api.test_ficha_engine import CUC_GER_PISO
from knowledge.models import TechnicalKnowledge
from knowledge.sync import (
    blog_source_key,
    build_ficha_chunk,
    build_presupuesto_ref_chunk,
    sync_blog_article,
    sync_ficha_servicio,
)


class KnowledgeSyncBuildersTests(TestCase):
    def test_presupuesto_ref_chunk_excludes_zone_detail_and_address(self):
        ref = PresupuestoReferencia(
            pk=99,
            pest_type="german_cockroach",
            severity="alta",
            property_type="particular",
            city="Barcelona",
            zone_detail="Carrer Secret 12, 3º 2ª",
            total_monto=Decimal("220.00"),
            breakdown=[{"nombre": "Tractament gel", "precio_unitario": 220, "cantidad": 1}],
            garantia_meses=12,
            source=PresupuestoReferencia.Source.MANUAL,
            notes="Presupuesto CRM #1 — estado enviado",
        )
        chunk = build_presupuesto_ref_chunk(ref)
        content = chunk["content"]
        self.assertIn("Barcelona", content)
        self.assertIn("220", content)
        self.assertIn("Tractament gel", content)
        self.assertNotIn("Carrer Secret", content)
        self.assertNotIn("zone_detail", content)
        self.assertNotIn("3º", content)
        self.assertEqual(chunk["category"], TechnicalKnowledge.Category.PRESUPUESTO_REF)

    def test_ficha_chunk_excludes_coste_interno(self):
        ficha = FichaServicio(**{**CUC_GER_PISO, "activa": True})
        self.assertTrue(ficha.coste_interno)
        self.assertIn("tiempo_tecnico", ficha.coste_interno)

        chunk = build_ficha_chunk(ficha)
        self.assertIsNotNone(chunk)
        content = chunk["content"]
        self.assertNotIn("coste_interno", content)
        self.assertNotIn("tiempo_tecnico", content)
        self.assertNotIn('"material": 18', content)
        self.assertNotIn('"desplazamiento": 12', content)
        self.assertIn(ficha.codigo, content)
        self.assertEqual(chunk["category"], TechnicalKnowledge.Category.FICHA)


@override_settings()
class KnowledgeSyncPersistenceTests(TestCase):
    def setUp(self):
        # Evitar llamadas reales a Gemini en tests
        self._emb_patch = mock.patch(
            "knowledge.sync._safe_embedding",
            return_value=[0.0] * 3072,
        )
        self._emb_patch.start()

    def tearDown(self):
        self._emb_patch.stop()

    def test_blog_publish_unpublish_syncs_rag(self):
        article = BlogArticle.objects.create(
            title="Prevenció de paneroles a l'estiu",
            excerpt="Consells bàsics",
            body="## Cos\nMantén la cuina neta.",
            category=BlogArticle.Category.PREVENCION,
            is_published=True,
        )
        self.assertTrue(article.slug)

        obj = sync_blog_article(article)
        self.assertIsNotNone(obj)
        key = blog_source_key(article.slug)
        self.assertTrue(TechnicalKnowledge.objects.filter(source_key=key).exists())
        stored = TechnicalKnowledge.objects.get(source_key=key)
        self.assertIn("Prevenció", stored.title)
        self.assertIn("cuina", stored.content)

        article.is_published = False
        article.save(update_fields=["is_published"])
        result = sync_blog_article(article)
        self.assertIsNone(result)
        self.assertFalse(TechnicalKnowledge.objects.filter(source_key=key).exists())

    def test_sync_ficha_persists_without_coste(self):
        ficha = FichaServicio.objects.create(**CUC_GER_PISO)
        sync_ficha_servicio(ficha)
        tk = TechnicalKnowledge.objects.get(source_key=f"ficha:{ficha.codigo}")
        self.assertNotIn("coste_interno", tk.content)
        self.assertNotIn("tiempo_tecnico", tk.content)
