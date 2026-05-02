import os
import requests as http_requests
from datetime import datetime, timedelta, timezone
from pydantic_ai import Agent, RunContext
from .models import AgentState, SchedulerOutput

CAL_API_KEY = os.getenv('CAL_API_KEY', '')
CAL_EVENT_TYPE_ID = int(os.getenv('CAL_EVENT_TYPE_ID', '277401'))
CAL_HEADERS = {"Authorization": f"Bearer {CAL_API_KEY}"}

# Agente 4: Agendador
# Rol: Consultar disponibilidad real en Cal.com y crear reservas.
scheduler_agent = Agent(
    'google-gla:gemini-flash-latest',
    output_type=SchedulerOutput,
    system_prompt=(
        "Ets el Gestor d'Agenda de CECSA Control de Plagues. "
        "La teva única missió és gestionar les cites tècniques. "
        "PROCEDIMENT: "
        "1. Usa 'get_available_slots' per consultar la disponibilitat real a Cal.com. "
        "2. Presenta els horaris disponibles de forma clara i amable. "
        "3. Quan el client trii un horari, usa 'create_booking' per confirmar la cita. "
        "4. Confirma sempre amb el nom i email del client. "
        "Mai inventis horaris. Sempre usa les eines per consultar dades reals. "
        "Respon sempre en Català."
    ),
)

@scheduler_agent.tool
def get_available_slots(ctx: RunContext[None], days_ahead: int = 7) -> str:
    """Consulta els horaris lliures a Cal.com pels propers dies."""
    try:
        start_time = datetime.now(timezone.utc).isoformat()
        end_time = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).isoformat()

        resp = http_requests.get(
            f"https://api.cal.com/v2/slots",
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
            return "No s'ha pogut obtenir la disponibilitat. Torna-ho a intentar."

        slots_by_day = data.get("data", {}).get("slots", {})
        if not slots_by_day:
            return "Actualment no hi ha horaris disponibles pels propers dies. Et podem contactar nosaltres."

        result = []
        count = 0
        for day, slots in slots_by_day.items():
            for slot in slots:
                if count >= 6:
                    break
                dt = datetime.fromisoformat(slot["time"].replace("Z", "+00:00"))
                local_dt = dt.astimezone()
                result.append(
                    f"- {local_dt.strftime('%A %d %B')} a les {local_dt.strftime('%H:%M')}h "
                    f"(ISO: {slot['time']})"
                )
                count += 1
            if count >= 6:
                break

        return "Horaris disponibles:\n" + "\n".join(result)

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
            "https://api.cal.com/v2/bookings",
            headers={**CAL_HEADERS, "Content-Type": "application/json"},
            json=payload,
            timeout=10
        )
        data = resp.json()

        if data.get("status") == "success":
            booking = data.get("data", {})
            uid = booking.get("uid", "")
            return (
                f"✅ Cita confirmada! "
                f"UID: {uid}. "
                f"Rebràs un correu de confirmació a {attendee_email}."
            )
        else:
            return f"No s'ha pogut crear la reserva: {data.get('error', {}).get('message', 'Error desconegut')}"

    except Exception as e:
        return f"Error creant la reserva: {str(e)}"
