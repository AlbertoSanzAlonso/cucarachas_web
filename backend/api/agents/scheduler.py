import os
import requests as http_requests
import urllib.parse
from datetime import datetime, timedelta, timezone
from pydantic_ai import Agent, RunContext
from django.core.cache import cache
from .models import SchedulerOutput, AgentDeps
from .config import AGENT_MODEL, CAL_API_KEY, CAL_EVENT_TYPE_ID, CAL_BASE_URL
from .prompts import SYSTEM_PROMPTS

def get_cal_headers():
    return {
        "Authorization": f"Bearer {CAL_API_KEY}",
        "cal-api-version": "2024-06-11",
        "Content-Type": "application/json"
    }

# Agente 4: Agendador
scheduler_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentDeps,
    output_type=SchedulerOutput,
)

@scheduler_agent.system_prompt
def get_scheduler_prompt(ctx: RunContext[AgentDeps]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["scheduler"].get(lang, SYSTEM_PROMPTS["scheduler"]["ca"])

@scheduler_agent.tool
def get_available_slots(ctx: RunContext[AgentDeps], days_ahead: int = 7) -> str:
    """Consulta els horaris lliures a Cal.com pels propers dies."""
    cache_key = f"cal_slots_{days_ahead}"
    cached_slots = cache.get(cache_key)
    if cached_slots:
        print("DEBUG: Serving Cal.com slots from Redis cache")
        return cached_slots

    try:
        start_time = datetime.now(timezone.utc).isoformat()
        end_time = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).isoformat()

        if not CAL_API_KEY:
            return "Error: CAL_API_KEY no configurada al servidor."

        resp = http_requests.get(
            f"{CAL_BASE_URL}/slots/available",
            params={
                "eventTypeId": CAL_EVENT_TYPE_ID,
                "startTime": start_time,
                "endTime": end_time,
                "clientId": CAL_API_KEY
            },
            timeout=10
        )
        print(f"DEBUG Cal.com slots status: {resp.status_code}")
        data = resp.json()

        if data.get("status") != "success":
            return f'Error de l\'API: {data.get("error", {}).get("message", "No s\'ha pogut obtenir la disponibilitat")}'

        # En la v2 los slots vienen en data.data.slots (que es un dict por días)
        slots_data = data.get("data", {})
        slots_by_day = {}
        
        if isinstance(slots_data, dict):
            slots_by_day = slots_data.get("slots", {})
        
        if not slots_by_day or not isinstance(slots_by_day, dict):
            return "Actualment no hi ha horaris disponibles pels propers dies."

        result = []
        count = 0
        for day in sorted(slots_by_day.keys()):
            for slot in slots_by_day[day]:
                if count >= 8: break
                time_str = slot.get("time")
                if not time_str: continue
                
                dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                result.append(f"- {dt.strftime('%A %d %B')} a les {dt.strftime('%H:%M')}h (ID: {time_str})")
                count += 1
            if count >= 8: break

        final_result = "Horaris disponibles (digues la data que prefereixis):\n" + "\n".join(result)
        
        # Guardamos en caché por 5 minutos (300 segundos) para no saturar la API
        cache.set(cache_key, final_result, 300)
        
        return final_result

    except Exception as e:
        return f"Error consultant Cal.com: {str(e)}"

@scheduler_agent.tool
def verify_address(ctx: RunContext[AgentDeps], address: str) -> str:
    """Verifica si una adreça existeix a Barcelona/Catalunya usando Google Maps API."""
    cache_key = f"geocode_{address.lower().replace(' ', '_')}"
    cached_address = cache.get(cache_key)
    if cached_address:
        print("DEBUG: Serving Geocode from Redis cache")
        return cached_address

    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return f"Warning: GOOGLE_MAPS_API_KEY no configurada al servidor. Assumeix que l'adreça '{address}' és vàlida i continua."
    
    try:
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={urllib.parse.quote(address)}&key={api_key}"
        resp = http_requests.get(url, timeout=5)
        data = resp.json()
        
        if data.get("status") == "OK" and len(data.get("results", [])) > 0:
            formatted_address = data["results"][0]["formatted_address"]
            result_str = f"Adreça verificada correctament: {formatted_address}"
            # Cacheamos la dirección correcta durante 24 horas (86400 segundos)
            cache.set(cache_key, result_str, 86400)
            return result_str
        else:
            return f"L'adreça '{address}' no sembla vàlida o no s'ha trobat a Google Maps (Status: {data.get('status')}). Demana al client que la revisi o especifiqui més."
    except Exception as e:
        return f"Error de connexió verificant adreça: {str(e)}"

@scheduler_agent.tool
def create_booking(
    ctx: RunContext[AgentDeps],
    slot_time: str,
    attendee_name: str,
    attendee_email: str,
    attendee_phone: str,
    address: str,
    notes: str = ""
) -> str:
    """Crea una reserva a Cal.com per a l'horari seleccionat."""
    try:
        headers = get_cal_headers()
        
        payload = {
            "eventTypeId": int(CAL_EVENT_TYPE_ID),
            "start": slot_time,
            "attendee": {
                "name": attendee_name,
                "email": attendee_email,
                "phoneNumber": attendee_phone,
                "timeZone": "Europe/Madrid",
                "language": "ca"
            },
            "location": {
                "value": "inPerson",
                "optionValue": address
            },
            "metadata": {"notes": notes, "source": "CECSA Bio-Assistent"}
        }

        resp = http_requests.post(
            f"{CAL_BASE_URL}/bookings",
            headers=headers,
            json=payload,
            timeout=10
        )
        print(f"DEBUG Cal.com booking status: {resp.status_code}")
        data = resp.json()

        if data.get("status") == "success":
            booking = data.get("data", {})
            return f"✅ Cita confirmada! UID: {booking.get('uid', 'OK')}. Rebràs un email a {attendee_email}."
        else:
            err_msg = data.get('error', {}).get('message', 'Error desconegut')
            return f"No s'ha pogut crear la reserva: {err_msg}"

    except Exception as e:
        return f"Error creant la reserva: {str(e)}"
