"""Conocimiento de empresa para agentes: BD + horarios de agenda + cobertura."""

from __future__ import annotations

from functools import lru_cache

from django.core.cache import cache

from api.models import AgendaSalonHours, CompanyProfile

_DAY_NAMES_ES = ("domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado")
_DAY_NAMES_CA = ("diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte")

DEFAULT_COVERAGE_PLACES = (
    "barcelona",
    "girona",
    "gerona",
    "tarragona",
    "lleida",
    "lerida",
    "catalunya",
    "cataluña",
    "catalonia",
    "badalona",
    "hospitalet",
    "l'hospitalet",
    "lhospitalet",
    "sabadell",
    "terrassa",
    "mataro",
    "mataró",
    "reus",
    "manresa",
    "vic",
    "figueres",
    "blanes",
    "sitges",
    "cornella",
    "cornellà",
    "cornellà de llobregat",
    "sant cugat",
    "granollers",
    "igualada",
    "vilafranca",
    "el prat",
    "castelldefels",
    "gava",
    "gavà",
    "viladecans",
    "rubi",
    "rubí",
    "cerdanyola",
    "montcada",
    "santa coloma",
)

DEFAULT_OUTSIDE_PLACES = (
    "alicante",
    "alacant",
    "madrid",
    "valencia",
    "valència",
    "sevilla",
    "malaga",
    "málaga",
    "bilbao",
    "zaragoza",
    "murcia",
    "palma",
    "ibiza",
    "eivissa",
    "tenerife",
    "las palmas",
    "canarias",
    "galicia",
    "asturias",
    "vigo",
    "a coruña",
    "coruña",
    "santander",
    "pamplona",
    "valladolid",
    "cordoba",
    "córdoba",
    "granada",
    "toledo",
    "salamanca",
    "andorra",
    "francia",
    "france",
    "portugal",
)

_CACHE_KEY = "cecsa:company_profile:v1"
_CACHE_TTL = 60  # segundos; cambios en admin se notan pronto


def invalidate_company_profile_cache() -> None:
    cache.delete(_CACHE_KEY)
    format_company_knowledge_for_agent.cache_clear()


def get_company_profile() -> CompanyProfile:
    cached = cache.get(_CACHE_KEY)
    if cached is not None:
        return cached
    profile = CompanyProfile.get_solo()
    cache.set(_CACHE_KEY, profile, _CACHE_TTL)
    return profile


def _coverage_places(profile: CompanyProfile) -> tuple[str, ...]:
    raw = profile.coverage_places if isinstance(profile.coverage_places, list) else []
    places = tuple(str(p).strip().lower() for p in raw if str(p).strip())
    return places or DEFAULT_COVERAGE_PLACES


def _outside_places(profile: CompanyProfile) -> tuple[str, ...]:
    raw = profile.outside_places if isinstance(profile.outside_places, list) else []
    places = tuple(str(p).strip().lower() for p in raw if str(p).strip())
    return places or DEFAULT_OUTSIDE_PLACES


def find_place_mention(text: str, places: tuple[str, ...]) -> str | None:
    low = (text or "").lower()
    # Más largos primero para preferir "cornellà de llobregat" sobre coincidencias cortas
    for place in sorted(places, key=len, reverse=True):
        if place and place in low:
            return place
    return None


def find_outside_place(text: str, profile: CompanyProfile | None = None) -> str | None:
    profile = profile or get_company_profile()
    outside = find_place_mention(text, _outside_places(profile))
    if not outside:
        return None
    # Si también menciona un sitio cubierto (raro), priorizar cobertura
    if find_place_mention(text, _coverage_places(profile)):
        return None
    return outside


def find_coverage_place(text: str, profile: CompanyProfile | None = None) -> str | None:
    profile = profile or get_company_profile()
    return find_place_mention(text, _coverage_places(profile))


def is_outside_service_area(
    *,
    message: str = "",
    city: str | None = None,
    profile: CompanyProfile | None = None,
) -> tuple[bool, str | None]:
    """True si mensaje o ciudad indican fuera de Catalunya/cobertura."""
    profile = profile or get_company_profile()
    # Si el mensaje nombra un sitio cubierto (p. ej. Cornellà tras Valencia), no está fuera
    if find_coverage_place(message, profile):
        return False, None
    hit = find_outside_place(message, profile) or find_outside_place(city or "", profile)
    if hit:
        return True, hit
    return False, None


def wants_onsite_service(message: str) -> bool:
    low = (message or "").lower()
    keys = (
        "venir",
        "desplaz",
        "desplaçar",
        "visita",
        "inspecci",
        "al local",
        "a mi local",
        "a casa",
        "en casa",
        "cita",
        "agendar",
        "podeis",
        "podéis",
        "podeu",
        "pueden ir",
        "podeu venir",
        "os desplazáis",
        "us desplaceu",
    )
    return any(k in low for k in keys)


def is_company_info_query(message: str) -> bool:
    """Pregunta sobre CECSA (no «tengo una empresa»)."""
    msg_lower = (message or "").lower()
    keys = (
        "informacion de la empresa",
        "información de la empresa",
        "info de la empresa",
        "informacio de l'empresa",
        "informació de l'empresa",
        "sobre la empresa",
        "sobre cecsa",
        "que es cecsa",
        "qué es cecsa",
        "què és cecsa",
        "quien sois",
        "quiénes sois",
        "qui sou",
        "vuestra empresa",
        "vostra empresa",
        "datos de la empresa",
        "dades de l'empresa",
        "horario",
        "horari",
        "donde estais",
        "dónde estáis",
        "on sou",
        "cobertura",
        "ambito de actuacion",
        "ámbito de actuación",
        "ambit d'actuacio",
        "àmbit d'actuació",
    )
    return any(k in msg_lower for k in keys)


def company_info_reply(lang: str) -> str:
    """Respuesta de plantilla (chat home) con datos oficiales."""
    profile = get_company_profile()
    area = profile.service_area_ca if lang == "ca" else profile.service_area_es
    hours = (
        (profile.business_hours_ca if lang == "ca" else profile.business_hours_es)
        or _format_salon_hours(lang)
        or ""
    )
    if lang == "ca":
        parts = [
            f"**{profile.brand_name}**: {area}",
            f"Seu: {profile.address}." if profile.address else "",
            f"Telèfon: {profile.phone}.",
            f"WhatsApp: {profile.whatsapp}." if getattr(profile, "whatsapp", None) else "",
            f"Horari: {hours}." if hours else "",
            "En què et puc ajudar ara: plaga, cita o pressupost?",
        ]
    else:
        parts = [
            f"**{profile.brand_name}**: {area}",
            f"Sede: {profile.address}." if profile.address else "",
            f"Teléfono: {profile.phone}.",
            f"WhatsApp: {profile.whatsapp}." if getattr(profile, "whatsapp", None) else "",
            f"Horario: {hours}." if hours else "",
            "¿En qué te puedo ayudar ahora: plaga, cita o presupuesto?",
        ]
    return " ".join(p for p in parts if p)


def _format_salon_hours(lang: str) -> str | None:
    try:
        rows = list(AgendaSalonHours.objects.all().order_by("day_of_week", "start_time"))
    except Exception:
        return None
    if not rows:
        return None
    names = _DAY_NAMES_CA if lang == "ca" else _DAY_NAMES_ES
    by_day: dict[int, list[str]] = {}
    for row in rows:
        by_day.setdefault(int(row.day_of_week), []).append(f"{row.start_time}-{row.end_time}")
    parts = []
    for dow in sorted(by_day):
        day = names[dow] if 0 <= dow < 7 else f"día{dow}"
        parts.append(f"{day}: {', '.join(by_day[dow])}")
    return "; ".join(parts)


@lru_cache(maxsize=4)
def format_company_knowledge_for_agent(lang: str = "es") -> str:
    """Texto para tools/prompt del agente (se invalida vía cache Django + lru)."""
    lang = "ca" if lang == "ca" else "es"
    profile = get_company_profile()
    area = profile.service_area_ca if lang == "ca" else profile.service_area_es
    hours_fallback = profile.business_hours_ca if lang == "ca" else profile.business_hours_es
    hours_db = _format_salon_hours(lang)
    hours = hours_db or hours_fallback
    policies = profile.policies_ca if lang == "ca" else profile.policies_es
    notes = profile.agent_notes_ca if lang == "ca" else profile.agent_notes_es
    commercial = (
        profile.commercial_policy_ca if lang == "ca" else profile.commercial_policy_es
    )
    lines = [
        f"Empresa: {profile.brand_name}",
        f"Razón social: {profile.legal_name}" if profile.legal_name else "",
        f"Teléfono: {profile.phone}",
        f"WhatsApp: {profile.whatsapp}" if getattr(profile, "whatsapp", None) else "",
        f"Email: {profile.email}" if profile.email else "",
        f"Sede: {profile.address}" if profile.address else "",
        f"Ámbito de actuación: {area}",
        f"Horario: {hours}" if hours else "",
        f"Políticas: {policies}" if policies else "",
        f"Política comercial: {commercial}" if commercial else "",
        f"Notas internas: {notes}" if notes else "",
        "REGLA OBLIGATORIA: si el cliente está fuera del ámbito de actuación, "
        "NO ofrezcas visita, inspección ni desplazamiento; explícalo con claridad "
        "y ofrece orientación general o el teléfono solo si aporta valor.",
        "REGLA COMERCIAL: no inventes precios; usa ficha, histórico y política comercial. "
        "En bares distingue preventivo/certificado DDD vs infestación activa.",
    ]
    return "\n".join(line for line in lines if line)


def format_commercial_policy(lang: str = "es") -> str:
    """Política comercial desde CompanyProfile (fuente BD)."""
    lang = "ca" if lang == "ca" else "es"
    profile = get_company_profile()
    text = profile.commercial_policy_ca if lang == "ca" else profile.commercial_policy_es
    return (text or "").strip()


def out_of_area_message(lang: str, place: str | None = None) -> str:
    profile = get_company_profile()
    place_label = (place or "").strip()
    if lang == "ca":
        if place_label:
            return (
                "Gràcies per l'interès. CECSA opera només a Catalunya "
                "(Barcelona, Girona, Tarragona i Lleida); "
                f"des de {place_label} no ens podem desplaçar. "
                f"Si ets a Catalunya o coneixes algú a la zona, truca al {profile.phone} "
                "o escriu-nos i t'ajudem."
            )
        return (
            "Gràcies per l'interès. CECSA opera només a Catalunya "
            "(Barcelona, Girona, Tarragona i Lleida); no fem visites fora d'aquesta zona. "
            f"Si ets a Catalunya, truca al {profile.phone} o escriu-nos i t'ajudem."
        )
    if place_label:
        return (
            "Gracias por tu interés. CECSA solo opera en Catalunya "
            f"(Barcelona, Girona, Tarragona y Lleida); desde {place_label} no podemos desplazarnos. "
            f"Si estás en Catalunya o conoces a alguien en la zona, llama al {profile.phone} "
            "o escríbenos y te ayudamos."
        )
    return (
        "Gracias por tu interés. CECSA solo opera en Catalunya "
        "(Barcelona, Girona, Tarragona y Lleida); no hacemos visitas fuera de esta zona. "
        f"Si estás en Catalunya, llama al {profile.phone} o escríbenos y te ayudamos."
    )


def in_area_message(lang: str, place: str | None = None) -> str:
    place_label = (place or "").strip().title() or ("la zona" if lang == "es" else "la zona")
    if lang == "ca":
        return (
            f"Perfecte — {place_label} és a Catalunya i hi donem servei. "
            "En què et puc ajudar ara: plaga, cita o pressupost?"
        )
    return (
        f"Perfecto — {place_label} está en Catalunya y allí sí damos servicio. "
        "¿En qué te puedo ayudar ahora: plaga, cita o presupuesto?"
    )
