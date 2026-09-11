"""Tests API pública company/FAQ y filtro ficha preventivo DDD."""

from __future__ import annotations

import pytest
from django.test import Client

from api.agents.models import AgentState, PestType
from api.commercial_seed import FAQ_SEED
from api.ficha_engine import find_ficha, match_objection
from api.models import CompanyProfile, FaqItem, FichaServicio


@pytest.mark.django_db
def test_company_public_exposes_whatsapp_and_hero():
    CompanyProfile.objects.update_or_create(
        pk=1,
        defaults={
            "phone": "933 309 169",
            "whatsapp": "681 033 305",
            "hero_title_es": "Titulo test ES",
            "hero_title_ca": "Titol test CA",
        },
    )
    client = Client()
    resp = client.get("/api/company/?lang=es")
    assert resp.status_code == 200
    data = resp.json()
    assert data["whatsapp"] == "681 033 305"
    assert "681" in data["whatsapp_url"]
    assert data["phone_tel"].startswith("+34")
    assert data["hero_title"] == "Titulo test ES"


@pytest.mark.django_db
def test_faq_list_localized():
    for item in FAQ_SEED[:2]:
        FaqItem.objects.update_or_create(slug=item["slug"], defaults=item)
    client = Client()
    resp = client.get("/api/faq/?lang=es")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 2
    assert all("question" in i and "answer" in i for i in items)
    # Sin precios fijos tipo 85€
    joined = " ".join(i["answer"] for i in items)
    assert "85€" not in joined and "85 €" not in joined


@pytest.mark.django_db
def test_find_ficha_preventive_ddd():
    FichaServicio.objects.update_or_create(
        codigo="CUC-DDD-PREV",
        defaults={
            "nombre_comercial": "Prevención DDD",
            "pest_type": "",
            "tipos_cliente": ["negoci"],
            "activa": True,
            "reglas_comerciales": [{"action": "visita_tecnica"}],
        },
    )
    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-NEG",
        defaults={
            "nombre_comercial": "Eliminación negocio",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
        },
    )
    agent = AgentState(language="es", property_type="negoci")
    ficha = find_ficha(
        agent,
        {"path": "empresa", "certificate": "yes", "business_type": "bar"},
    )
    assert ficha is not None
    assert ficha.codigo == "CUC-DDD-PREV"


@pytest.mark.django_db
def test_find_ficha_active_infestation_not_preventive():
    FichaServicio.objects.update_or_create(
        codigo="CUC-DDD-PREV",
        defaults={
            "nombre_comercial": "Prevención DDD",
            "pest_type": "",
            "tipos_cliente": ["negoci"],
            "activa": True,
        },
    )
    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-NEG",
        defaults={
            "nombre_comercial": "Eliminación negocio",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
        },
    )
    agent = AgentState(
        language="es",
        property_type="negoci",
        pest_type=PestType.GERMAN_COCKROACH,
    )
    ficha = find_ficha(
        agent,
        {
            "path": "empresa",
            "business_type": "bar",
            "extra_info": "tengo cucarachas germanicas en la cocina del bar",
        },
    )
    assert ficha is not None
    assert ficha.codigo == "CUC-GER-NEG"


@pytest.mark.django_db
def test_match_objection_caro():
    ficha = FichaServicio.objects.create(
        codigo="CUC-TEST-OBJ",
        nombre_comercial="Test",
        objeciones=[
            {
                "trigger": "caro",
                "respuesta_es": "Visita técnica para ajustar.",
                "respuesta_ca": "Visita tècnica.",
            }
        ],
    )
    assert "Visita" in (match_objection(ficha, "me parece caro", "es") or "")
