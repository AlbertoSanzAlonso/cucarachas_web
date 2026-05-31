import os
import requests as http_requests
import urllib.parse
from pydantic_ai import Agent, RunContext
from django.core.cache import cache

from api.cal_booking import create_cal_booking
from api.cal_client import CAL_API_KEY, CAL_DAYS_AHEAD, fetch_available_slots
from .models import AgentState, SchedulerOutput
from .config import AGENT_MODEL
from .prompts import SYSTEM_PROMPTS

# Agente 4: Agendador
scheduler_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentState,
    output_type=SchedulerOutput,
    retries=3,
)


@scheduler_agent.system_prompt
def get_scheduler_prompt(ctx: RunContext[AgentState]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["scheduler"].get(lang, SYSTEM_PROMPTS["scheduler"]["ca"])


@scheduler_agent.tool
def get_available_slots(ctx: RunContext[AgentState], days_ahead: int = CAL_DAYS_AHEAD) -> str | list:
    """Consulta els horaris lliures a Cal.com pels propers dies."""
    cache_key = f"cal_slots_{days_ahead}"
    cached_slots = cache.get(cache_key)
    if cached_slots:
        print("DEBUG: Serving Cal.com slots from Redis cache")
        return cached_slots

    ok, result = fetch_available_slots(days_ahead=days_ahead)
    if ok:
        cache.set(cache_key, result, 300)
        return result
    return result


@scheduler_agent.tool
def verify_address(ctx: RunContext[AgentState], address: str) -> str:
    """Verifica si una adreça existeix a Barcelona/Catalunya usando Google Maps API."""
    cache_key = f"geocode_{address.lower().replace(' ', '_')}"
    cached_address = cache.get(cache_key)
    if cached_address:
        print("DEBUG: Serving Geocode from Redis cache")
        return cached_address

    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return (
            f"Warning: GOOGLE_MAPS_API_KEY no configurada al servidor. "
            f"Assumeix que l'adreça '{address}' és vàlida i continua."
        )

    try:
        url = (
            "https://maps.googleapis.com/maps/api/geocode/json?"
            f"address={urllib.parse.quote(address)}&key={api_key}"
        )
        resp = http_requests.get(url, timeout=5)
        data = resp.json()

        if data.get("status") == "OK" and len(data.get("results", [])) > 0:
            formatted_address = data["results"][0]["formatted_address"]
            result_str = f"Adreça verificada correctament: {formatted_address}"
            cache.set(cache_key, result_str, 86400)
            return result_str
        return (
            f"L'adreça '{address}' no sembla vàlida o no s'ha trobat a Google Maps "
            f"(Status: {data.get('status')}). Demana al client que la revisi o especifiqui més."
        )
    except Exception as e:
        return f"Error de connexió verificant adreça: {str(e)}"


@scheduler_agent.tool
def create_booking(
    ctx: RunContext[AgentState],
    slot_time: str,
    attendee_name: str,
    attendee_email: str,
    attendee_phone: str,
    address: str,
    notes: str = "",
) -> str:
    """Crea una reserva a Cal.com per a l'horari seleccionat."""
    lang = ctx.deps.language if ctx.deps else "ca"
    ok, msg, _uid = create_cal_booking(
        slot_time=slot_time,
        attendee_name=attendee_name,
        attendee_phone=attendee_phone,
        address=address,
        attendee_email=attendee_email,
        notes=notes,
        language=lang,
    )
    return msg if ok else msg
