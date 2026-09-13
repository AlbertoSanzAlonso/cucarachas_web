"""Tests sync contenido web → RAG (sin PII / sin coste_interno)."""

from __future__ import annotations

from decimal import Decimal

import pytest

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


@pytest.mark.django_db
def test_presupuesto_ref_chunk_excludes_zone_detail_and_address():
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
    assert "Barcelona" in content
    assert "220" in content
    assert "Tractament gel" in content
    assert "Carrer Secret" not in content
    assert "zone_detail" not in content
    assert "3º" not in content
    assert chunk["category"] == TechnicalKnowledge.Category.PRESUPUESTO_REF


@pytest.mark.django_db
def test_ficha_chunk_excludes_coste_interno():
    ficha = FichaServicio(**{**CUC_GER_PISO, "activa": True})
    # Ensure fixture has internal costs
    assert ficha.coste_interno
    assert "tiempo_tecnico" in ficha.coste_interno

    chunk = build_ficha_chunk(ficha)
    assert chunk is not None
    content = chunk["content"]
    assert "coste_interno" not in content
    assert "tiempo_tecnico" not in content
    assert "52" not in content  # valor típico de coste interno del fixture
    assert ficha.codigo in content
    assert chunk["category"] == TechnicalKnowledge.Category.FICHA


@pytest.mark.django_db
def test_blog_publish_unpublish_syncs_rag(monkeypatch):
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)

    article = BlogArticle.objects.create(
        title="Prevenció de paneroles a l'estiu",
        excerpt="Consells bàsics",
        body="## Cos\nMantén la cuina neta.",
        category=BlogArticle.Category.PREVENCION,
        is_published=True,
    )
    assert article.slug

    obj = sync_blog_article(article)
    assert obj is not None
    key = blog_source_key(article.slug)
    assert TechnicalKnowledge.objects.filter(source_key=key).exists()
    stored = TechnicalKnowledge.objects.get(source_key=key)
    assert "Prevenció" in stored.title
    assert "cuina" in stored.content

    article.is_published = False
    article.save()
    # Señal también borra; forzamos sync explícito por claridad del test
    result = sync_blog_article(article)
    assert result is None
    assert not TechnicalKnowledge.objects.filter(source_key=key).exists()


@pytest.mark.django_db
def test_sync_ficha_persists_without_coste(monkeypatch):
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    ficha = FichaServicio.objects.create(**CUC_GER_PISO)
    sync_ficha_servicio(ficha)
    tk = TechnicalKnowledge.objects.get(source_key=f"ficha:{ficha.codigo}")
    assert "coste_interno" not in tk.content
    assert "tiempo_tecnico" not in tk.content
