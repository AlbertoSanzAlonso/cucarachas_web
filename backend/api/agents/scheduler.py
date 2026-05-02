import os
import requests as http_requests
from datetime import datetime, timedelta, timezone
from pydantic_ai import Agent, RunContext
from .models import AgentState, SchedulerOutput

CAL_API_KEY = os.getenv('CAL_API_KEY', '').strip()
CAL_EVENT_TYPE_ID = int(os.getenv('CAL_EVENT_TYPE_ID', '277401'))
CAL_HEADERS = {
    "Authorization": f"Bearer {CAL_API_KEY}",
    "cal-api-version": "2024-06-11",
    "Content-Type": "application/json"
}

# Agente 4: Agendador
# Rol: Consultar disponibilidad real en Cal.com y crear reservas.
scheduler_agent = Agent(
    'google-gla:gemini-flash-latest',
    output_type=SchedulerOutput,
    system_prompt=(
        "Ets el Gestor d'Agenda de CECSA Control de Plagues. "
        "La teva missió és gestionar les cites tècniques. "
        "PROCEDIMENT: "
        "1. Usa 'get_available_slots' per consultar la disponibilitat real. "
        "2. IMPORTANT: Quan rebis horaris lliures, a part de descriure'ls al 'message', "
        "   HAS DE RELLENAR el camp 'available_slots' amb objectes: "
        "   {'date': 'Día mes', 'time': 'HH:MM', 'slot_time': 'ISO_STRING'}. "
        "3. Quan el client trii un horari, usa 'create_booking'. "
        "4. Respon sempre en Català. Mai inventis horaris."
    ),
)

@scheduler_agent.tool
def get_available_slots(ctx: RunContext[None], days_ahead: int = 7) -> str:
    """Consulta els horaris lliures a Cal.com pels propers dies."""
    try:
        start_time = datetime.now(timezone.utc).isoformat()
        end_time = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).isoformat()

        resp = http_requests.get(
            f"https://api.cal.eu/v2/slots",
            headers=CAL_HEADERS,
            params={
                "eventTypeId": CAL_EVENT_TYPE_ID,
                "startTime": start_time,
                "endTime": end_time,
            },
            timeout=10
        )
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

        return "Horaris disponibles (digues la data que prefereixis):\n" + "\n".join(result)

    except Exception as e:
        return f"Error consultant Cal.com: {str(e)}"


@scheduler_agent.tool
def create_booking(
    ctx: RunContext[None],
    slot_time: str,
    attendee_name: str,
    attendee_email: str,
    notes: str = ""
) -> str:
    """Crea una reserva a Cal.com per a l'horari seleccionat."""
    try:
        payload = {
            "eventTypeId": CAL_EVENT_TYPE_ID,
            "start": slot_time,
            "attendee": {
                "name": attendee_name,
                "email": attendee_email,
                "timeZone": "Europe/Madrid",
                "language": "ca"
            },
            "metadata": {"notes": notes, "source": "CECSA Bio-Assistent"}
        }

        resp = http_requests.post(
            "https://api.cal.eu/v2/bookings",
            headers=CAL_HEADERS,
            json=payload,
            timeout=10
        )
        data = resp.json()

        if data.get("status") == "success":
            booking = data.get("data", {})
            return f"✅ Cita confirmada! UID: {booking.get('uid', 'OK')}. Rebràs un email a {attendee_email}."
        else:
            err_msg = data.get('error', {}).get('message', 'Error desconegut')
            return f"No s'ha pogut crear la reserva: {err_msg}"

    except Exception as e:
        return f"Error creant la reserva: {str(e)}"
