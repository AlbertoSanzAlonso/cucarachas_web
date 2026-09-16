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
def test_find_ficha_hospitality_severe_host():
    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-NEG",
        defaults={
            "nombre_comercial": "Eliminación negocio",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
        },
    )
    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-HOST",
        defaults={
            "nombre_comercial": "Servicio especial hostelería",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
            "reglas_comerciales": [{"precio_venta": 1100}],
            "preguntas_obligatorias": {
                "negoci": ["business_type", "where", "sanitary_risk"],
            },
            "copy_comercial": {
                "es": "Servicio especial 1100€ + IVA para casos graves en hostelería.",
                "ca": "Servei especial 1100€ + IVA per a casos greus en hostaleria.",
            },
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
            "extra_info": "ya han venido otras empresas y siguen apareciendo",
        },
    )
    assert ficha is not None
    assert ficha.codigo == "CUC-GER-HOST"


@pytest.mark.django_db
def test_pricing_hospitality_severe_1100():
    from api.ficha_engine import evaluate_ficha_pricing

    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-HOST",
        defaults={
            "nombre_comercial": "Servicio especial hostelería",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
            "reglas_comerciales": [{"precio_venta": 1100}],
            "preguntas_obligatorias": {
                "negoci": ["business_type", "where", "sanitary_risk"],
            },
            "copy_comercial": {"es": "Servicio especial hostelería.", "ca": "Servei especial."},
            "garantia_meses": 12,
        },
    )
    agent = AgentState(
        language="es",
        property_type="negoci",
        pest_type=PestType.GERMAN_COCKROACH,
    )
    result = evaluate_ficha_pricing(
        agent,
        {
            "path": "empresa",
            "business_type": "restaurante",
            "where": "cocina",
            "sanitary_risk": "alto",
            "extra_info": "otras empresas no han solucionado el problema",
        },
        message="restaurante con cucarachas persistentes",
        lang="es",
    )
    assert result is not None
    assert result.ficha_codigo == "CUC-GER-HOST"
    assert result.final_price == 1100.0
    assert result.can_quote


@pytest.mark.django_db
def test_host_intake_skips_quantity_and_quotes():
    """Bar + alemanas + otras empresas → HOST; no exige 'cuántas'."""
    from api.agents.public.chat_intake import (
        apply_chat_intake_from_message,
        has_pricing_case_details,
        next_pricing_intake_field,
    )
    from api.agents.public.diagnostic_merge import apply_facts_from_message
    from api.ficha_engine import evaluate_ficha_pricing, find_ficha

    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-NEG",
        defaults={
            "nombre_comercial": "Negocio estándar",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
            "reglas_comerciales": [{"precio_venta": 380}],
            "preguntas_obligatorias": {"negoci": ["business_type", "metros_cuadrados", "where"]},
        },
    )
    FichaServicio.objects.update_or_create(
        codigo="CUC-GER-HOST",
        defaults={
            "nombre_comercial": "Servicio especial hostelería",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "activa": True,
            "reglas_comerciales": [{"precio_venta": 1100}],
            "preguntas_obligatorias": {
                "negoci": ["business_type", "where", "sanitary_risk"],
            },
            "copy_comercial": {"es": "Servicio especial 1100€ + IVA.", "ca": "Servei especial."},
            "garantia_meses": 12,
        },
    )

    agent = AgentState(language="es")
    agent = apply_facts_from_message(agent, "tengo problemas en mi bar")
    agent = apply_chat_intake_from_message(agent, "tengo problemas en mi bar")
    assert agent.property_type == "negoci"
    assert (agent.chat_diagnostic or {}).get("business_type") == "bar"

    agent = apply_facts_from_message(agent, "creo que son alemanas, pero ya he intentado con otras empresas")
    agent = apply_chat_intake_from_message(
        agent, "creo que son alemanas, pero ya he intentado con otras empresas"
    )
    assert agent.pest_type == PestType.GERMAN_COCKROACH
    assert (agent.chat_diagnostic or {}).get("failed_prior_treatment") == "yes"

    ficha = find_ficha(agent, {}, message="otras empresas")
    assert ficha is not None
    assert ficha.codigo == "CUC-GER-HOST"
    assert next_pricing_intake_field(agent) is None
    assert has_pricing_case_details(agent)

    result = evaluate_ficha_pricing(
        agent,
        {},
        message="cuanto sale tratar las cucarachas alemanas en el bar",
        lang="es",
    )
    assert result is not None
    assert result.ficha_codigo == "CUC-GER-HOST"
    assert result.final_price == 1100.0


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
