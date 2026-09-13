"""Datos públicos de empresa y FAQ (editables en admin)."""

from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.agents.company_knowledge import get_company_profile
from api.cors_utils import apply_cors_headers
from api.models import FaqItem


def _digits_phone(raw: str) -> str:
    return "".join(c for c in (raw or "") if c.isdigit())


def _phone_tel(phone: str) -> str:
    digits = _digits_phone(phone)
    if not digits:
        return ""
    if digits.startswith("34"):
        return f"+{digits}"
    if len(digits) == 9:
        return f"+34{digits}"
    return f"+{digits}"


def _wa_me(whatsapp: str) -> str:
    digits = _digits_phone(whatsapp)
    if not digits:
        return ""
    if digits.startswith("34"):
        return f"https://wa.me/{digits}"
    if len(digits) == 9:
        return f"https://wa.me/34{digits}"
    return f"https://wa.me/{digits}"


@api_view(["GET"])
@permission_classes([AllowAny])
def company_public(request):
    """Perfil público para web y CTAs (sin notas internas de agentes)."""
    profile = get_company_profile()
    lang = (request.query_params.get("lang") or "ca").lower()[:2]
    if lang == "es":
        hero_title = profile.hero_title_es
        hero_subtitle = profile.hero_subtitle_es
        service_area = profile.service_area_es
        business_hours = profile.business_hours_es
        policies = profile.policies_es
    else:
        hero_title = profile.hero_title_ca
        hero_subtitle = profile.hero_subtitle_ca
        service_area = profile.service_area_ca
        business_hours = profile.business_hours_ca
        policies = profile.policies_ca

    return apply_cors_headers(
        Response(
            {
                "brand_name": profile.brand_name,
                "legal_name": profile.legal_name,
                "phone": profile.phone,
                "phone_tel": _phone_tel(profile.phone),
                "whatsapp": profile.whatsapp,
                "whatsapp_url": _wa_me(profile.whatsapp),
                "email": profile.email,
                "address": profile.address,
                "hero_title": hero_title,
                "hero_subtitle": hero_subtitle,
                "service_area": service_area,
                "business_hours": business_hours,
                "policies": policies,
            }
        ),
        request,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def faq_list(request):
    """FAQ publicada; idioma vía ?lang=ca|es|en."""
    lang = (request.query_params.get("lang") or "ca").lower()[:2]
    category = (request.query_params.get("category") or "").strip()
    qs = FaqItem.objects.filter(is_published=True)
    if category and category != "all":
        qs = qs.filter(category=category)
    items = [item.as_localized(lang) for item in qs]
    return apply_cors_headers(Response({"items": items}), request)
