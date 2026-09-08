"""Motor de ocupación, slots y CRUD de citas (agenda propia)."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, time
from typing import Any
from zoneinfo import ZoneInfo

from django.db import transaction
from django.db.models import Q

from api.phone_utils import upsert_cliente_by_phone

from .config import (
    AGENDA_DAYS_AHEAD,
    AGENDA_MAX_DAYS,
    AGENDA_SLOT_MINUTES,
    AGENDA_TIMEZONE,
    DEFAULT_SERVICE_ID,
    DEFAULT_STAFF_ID,
)

ACTIVE_STATUSES = ("confirmed", "completed")


def _tz() -> ZoneInfo:
    return ZoneInfo(AGENDA_TIMEZONE)


def time_to_minutes(hhmm: str) -> int:
    parts = (hhmm or "0:0").split(":")
    return int(parts[0]) * 60 + int(parts[1])


def minutes_to_time(mins: int) -> str:
    h, m = divmod(mins, 60)
    return f"{h:02d}:{m:02d}"


def ranges_overlap(a_start: int, a_end: int, b_start: int, b_end: int) -> bool:
    return a_start < b_end and b_start < a_end


def day_of_week_from_date(d: date) -> int:
    """0=domingo … 6=sábado (como agenda-kit)."""
    return (d.weekday() + 1) % 7


def get_default_staff():
    from api.models import AgendaStaff

    staff = AgendaStaff.objects.filter(active=True).order_by("name").first()
    if staff:
        return staff
    return AgendaStaff.objects.filter(id=DEFAULT_STAFF_ID).first()


def get_default_service():
    from api.models import AgendaService

    svc = AgendaService.objects.filter(id=DEFAULT_SERVICE_ID, active=True).first()
    if svc:
        return svc
    return AgendaService.objects.filter(active=True).order_by("name_es").first()


def _windows_for_staff(staff_id: str, dow: int) -> list[dict[str, str]]:
    from api.models import AgendaSalonHours, AgendaStaffAvailability

    staff_wins = list(
        AgendaStaffAvailability.objects.filter(staff_id=staff_id, day_of_week=dow)
        .order_by("start_time")
        .values("start_time", "end_time")
    )
    if staff_wins:
        return [{"startTime": w["start_time"], "endTime": w["end_time"]} for w in staff_wins]

    salon = list(
        AgendaSalonHours.objects.filter(day_of_week=dow)
        .order_by("start_time")
        .values("start_time", "end_time")
    )
    return [{"startTime": w["start_time"], "endTime": w["end_time"]} for w in salon]


def _compute_free_slots(
    windows: list[dict[str, str]],
    occupied: list[dict[str, int]],
    *,
    duration_minutes: int,
    slot_minutes: int = AGENDA_SLOT_MINUTES,
) -> list[str]:
    free: list[str] = []
    for w in windows:
        w_start = time_to_minutes(w["startTime"])
        w_end = time_to_minutes(w["endTime"])
        t = w_start
        while t + duration_minutes <= w_end:
            slot_end = t + duration_minutes
            if not any(ranges_overlap(t, slot_end, o["start"], o["end"]) for o in occupied):
                free.append(minutes_to_time(t))
            t += slot_minutes
    return free


def build_day_schedule(
    day: date | str,
    *,
    staff_id: str | None = None,
    slot_minutes: int = AGENDA_SLOT_MINUTES,
) -> list[dict[str, Any]]:
    from api.models import AgendaAppointment, AgendaStaff, AgendaTimeBlock

    if isinstance(day, str):
        day = date.fromisoformat(day)

    dow = day_of_week_from_date(day)
    staff_qs = AgendaStaff.objects.filter(active=True).order_by("name")
    if staff_id:
        staff_qs = staff_qs.filter(id=staff_id)
    staff_rows = list(staff_qs)
    if not staff_rows:
        return []

    staff_ids = [s.id for s in staff_rows]
    appointments = list(
        AgendaAppointment.objects.filter(
            date=day,
            staff_id__in=staff_ids,
        )
        .exclude(status__in=("cancelled", "canceled"))
        .select_related("service", "staff")
        .order_by("start_time")
    )
    blocks = list(
        AgendaTimeBlock.objects.filter(date=day, staff_id__in=staff_ids).order_by("start_time")
    )

    result: list[dict[str, Any]] = []
    for staff in staff_rows:
        windows = _windows_for_staff(staff.id, dow)
        working = len(windows) > 0
        staff_apts = [a for a in appointments if a.staff_id == staff.id]
        staff_blocks = [b for b in blocks if b.staff_id == staff.id]

        occupied = [
            {
                "start": time_to_minutes(a.start_time),
                "end": time_to_minutes(a.start_time) + a.duration_minutes,
            }
            for a in staff_apts
        ] + [
            {
                "start": time_to_minutes(b.start_time),
                "end": time_to_minutes(b.end_time),
            }
            for b in staff_blocks
        ]

        free_slots = (
            _compute_free_slots(windows, occupied, duration_minutes=slot_minutes)
            if working
            else []
        )

        day_apts = []
        for a in staff_apts:
            end_t = minutes_to_time(time_to_minutes(a.start_time) + a.duration_minutes)
            day_apts.append(
                {
                    "id": a.id,
                    "startTime": a.start_time,
                    "endTime": end_t,
                    "durationMinutes": a.duration_minutes,
                    "serviceId": a.service_id,
                    "serviceName": a.service.name_es,
                    "staffId": a.staff_id or staff.id,
                    "staffName": (a.staff.name if a.staff else staff.name),
                    "categoryId": None,
                    "customerName": a.customer_name,
                    "customerPhone": a.customer_phone,
                    "customerEmail": a.customer_email or None,
                    "customerNotes": a.customer_address or None,
                    "notes": a.notes or None,
                    "status": a.status,
                    "createdAt": a.created_at.isoformat() if a.created_at else "",
                    "occupiedSlots": [{"startTime": a.start_time, "endTime": end_t}],
                    "bookingPattern": None,
                    "origin": a.origin or None,
                    "customerLocale": a.locale if a.locale in ("es", "en", "ca") else "es",
                }
            )

        result.append(
            {
                "staffId": staff.id,
                "staffName": staff.name,
                "working": working,
                "windows": windows,
                "appointments": day_apts,
                "blocks": [
                    {
                        "id": b.id,
                        "startTime": b.start_time,
                        "endTime": b.end_time,
                        "note": b.note or None,
                    }
                    for b in staff_blocks
                ],
                "freeSlots": free_slots,
            }
        )
    return result


def get_free_slots_for_staff(
    day: date | str,
    staff_id: str,
    duration_minutes: int,
    *,
    slot_minutes: int = AGENDA_SLOT_MINUTES,
    exclude_appointment_id: str | None = None,
) -> list[str]:
    schedules = build_day_schedule(day, staff_id=staff_id, slot_minutes=slot_minutes)
    day_sched = schedules[0] if schedules else None
    if not day_sched or not day_sched.get("working"):
        return []

    occupied = [
        {
            "start": time_to_minutes(a["startTime"]),
            "end": time_to_minutes(a["endTime"]),
        }
        for a in day_sched["appointments"]
        if a["id"] != exclude_appointment_id
    ] + [
        {
            "start": time_to_minutes(b["startTime"]),
            "end": time_to_minutes(b["endTime"]),
        }
        for b in day_sched["blocks"]
    ]
    return _compute_free_slots(
        day_sched["windows"],
        occupied,
        duration_minutes=duration_minutes,
        slot_minutes=slot_minutes,
    )


def _slot_datetime_iso(day: date, hhmm: str) -> str:
    h, m = map(int, hhmm.split(":"))
    local = datetime.combine(day, time(h, m), tzinfo=_tz())
    return local.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def fetch_available_slots(days_ahead: int | None = None) -> tuple[bool, list[dict[str, str]] | str]:
    """
    Slots agregados N días (formato chat: date/time/slot_time).
    Usa el staff y servicio por defecto.
    """
    staff = get_default_staff()
    service = get_default_service()
    if not staff or not service:
        return False, "Error: agenda no inicializada (falta staff o servicio)."

    if days_ahead is None:
        days_ahead = AGENDA_DAYS_AHEAD

    today = datetime.now(_tz()).date()
    now_mins = time_to_minutes(datetime.now(_tz()).strftime("%H:%M"))
    result: list[dict[str, str]] = []
    days_included = 0

    for offset in range(0, days_ahead + 1):
        if days_included >= AGENDA_MAX_DAYS:
            break
        day = today + timedelta(days=offset)
        free = get_free_slots_for_staff(day, staff.id, service.duration_minutes)
        if day == today:
            free = [t for t in free if time_to_minutes(t) > now_mins]
        if not free:
            continue
        day_added = False
        for hhmm in free:
            result.append(
                {
                    "date": day.strftime("%d/%m/%Y"),
                    "time": hhmm,
                    "slot_time": _slot_datetime_iso(day, hhmm),
                }
            )
            day_added = True
        if day_added:
            days_included += 1

    return True, result


def appointment_to_public(apt) -> dict[str, Any]:
    return {
        "id": apt.id,
        "staffId": apt.staff_id,
        "staffName": apt.staff.name if apt.staff_id and apt.staff else None,
        "serviceId": apt.service_id,
        "serviceName": apt.service.name_es if apt.service_id else "",
        "date": apt.date.isoformat() if hasattr(apt.date, "isoformat") else str(apt.date),
        "startTime": apt.start_time,
        "durationMinutes": apt.duration_minutes,
        "customerName": apt.customer_name,
        "customerPhone": apt.customer_phone,
        "customerEmail": apt.customer_email or None,
        "customerAddress": apt.customer_address or None,
        "notes": apt.notes or None,
        "status": apt.status,
        "locale": apt.locale,
        "origin": apt.origin or None,
        "createdAt": apt.created_at.isoformat() if apt.created_at else "",
        "updatedAt": apt.updated_at.isoformat() if apt.updated_at else "",
    }


def block_to_public(block) -> dict[str, Any]:
    return {
        "id": block.id,
        "staffId": block.staff_id,
        "date": block.date.isoformat() if hasattr(block.date, "isoformat") else str(block.date),
        "startTime": block.start_time,
        "endTime": block.end_time,
        "note": block.note or None,
    }


def parse_slot_time(slot_time: str) -> tuple[date, str]:
    """ISO slot_time → (date local, HH:MM)."""
    normalized = slot_time.strip().replace("Z", "+00:00")
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    local = dt.astimezone(_tz())
    return local.date(), local.strftime("%H:%M")


@transaction.atomic
def create_appointment(
    *,
    staff_id: str,
    service_id: str,
    day: date | str,
    start_time: str,
    customer_name: str,
    customer_phone: str,
    customer_email: str = "",
    customer_address: str = "",
    notes: str = "",
    locale: str = "ca",
    origin: str = "",
    duration_minutes: int | None = None,
    upsert_crm: bool = True,
) -> Any:
    from api.models import AgendaAppointment, AgendaService, AgendaStaff

    if isinstance(day, str):
        day = date.fromisoformat(day)

    service = AgendaService.objects.filter(id=service_id).first()
    if not service:
        raise ValueError("SERVICIO_INVALIDO")
    staff = AgendaStaff.objects.filter(id=staff_id, active=True).first()
    if not staff:
        raise ValueError("STAFF_INVALIDO")

    duration = duration_minutes or service.duration_minutes
    free = get_free_slots_for_staff(day, staff_id, duration)
    if start_time not in free:
        raise ValueError("SLOT_OCUPADO")

    cliente = None
    if upsert_crm and customer_phone.strip():
        try:
            cliente, _ = upsert_cliente_by_phone(
                telefono=customer_phone,
                nombre=customer_name,
                email=customer_email or "",
                documento_fiscal=None,
            )
        except ValueError:
            cliente = None

    apt = AgendaAppointment.objects.create(
        id=str(uuid.uuid4()),
        staff=staff,
        service=service,
        date=day,
        start_time=start_time,
        duration_minutes=duration,
        customer_name=customer_name.strip(),
        customer_phone=customer_phone.strip(),
        customer_email=(customer_email or "").strip(),
        customer_address=(customer_address or "").strip(),
        notes=(notes or "").strip(),
        status=AgendaAppointment.Status.CONFIRMED,
        locale=locale or "ca",
        origin=origin or "",
        cliente=cliente,
    )
    return apt


def update_appointment(apt_id: str, patch: dict[str, Any]) -> Any:
    from api.models import AgendaAppointment, AgendaService, AgendaStaff

    apt = AgendaAppointment.objects.select_related("staff", "service").filter(id=apt_id).first()
    if not apt:
        raise ValueError("CITA_NO_ENCONTRADA")

    if "staffId" in patch and patch["staffId"]:
        staff = AgendaStaff.objects.filter(id=patch["staffId"]).first()
        if not staff:
            raise ValueError("STAFF_INVALIDO")
        apt.staff = staff
    if "serviceId" in patch and patch["serviceId"]:
        service = AgendaService.objects.filter(id=patch["serviceId"]).first()
        if not service:
            raise ValueError("SERVICIO_INVALIDO")
        apt.service = service
    if "date" in patch and patch["date"]:
        apt.date = date.fromisoformat(patch["date"]) if isinstance(patch["date"], str) else patch["date"]
    if "startTime" in patch and patch["startTime"]:
        apt.start_time = patch["startTime"]
    if "durationMinutes" in patch and patch["durationMinutes"]:
        apt.duration_minutes = int(patch["durationMinutes"])
    if "customerName" in patch and patch["customerName"] is not None:
        apt.customer_name = str(patch["customerName"]).strip()
    if "customerPhone" in patch and patch["customerPhone"] is not None:
        apt.customer_phone = str(patch["customerPhone"]).strip()
    if "customerEmail" in patch:
        apt.customer_email = (patch["customerEmail"] or "").strip() if patch["customerEmail"] is not None else ""
    if "customerAddress" in patch:
        apt.customer_address = (patch["customerAddress"] or "").strip() if patch["customerAddress"] is not None else ""
    if "notes" in patch:
        apt.notes = (patch["notes"] or "").strip() if patch["notes"] is not None else ""
    if "locale" in patch and patch["locale"]:
        apt.locale = patch["locale"]
    if "status" in patch and patch["status"]:
        apt.status = patch["status"]
    if "origin" in patch:
        apt.origin = patch["origin"] or ""

    apt.save()
    return apt


def cancel_appointment(apt_id: str) -> Any:
    from api.models import AgendaAppointment

    apt = AgendaAppointment.objects.select_related("staff", "service").filter(id=apt_id).first()
    if not apt:
        raise ValueError("CITA_NO_ENCONTRADA")
    apt.status = AgendaAppointment.Status.CANCELLED
    apt.save(update_fields=["status", "updated_at"])
    return apt


def mark_no_show(apt_id: str) -> Any:
    from api.models import AgendaAppointment

    apt = AgendaAppointment.objects.select_related("staff", "service").filter(id=apt_id).first()
    if not apt:
        raise ValueError("CITA_NO_ENCONTRADA")
    apt.status = AgendaAppointment.Status.NO_SHOW
    apt.save(update_fields=["status", "updated_at"])
    return apt


def create_block(
    *,
    staff_id: str,
    day: date | str,
    start_time: str,
    end_time: str,
    note: str = "",
) -> Any:
    from api.models import AgendaStaff, AgendaTimeBlock

    if isinstance(day, str):
        day = date.fromisoformat(day)
    if time_to_minutes(end_time) <= time_to_minutes(start_time):
        raise ValueError("RANGO_INVALIDO")
    staff = AgendaStaff.objects.filter(id=staff_id).first()
    if not staff:
        raise ValueError("STAFF_INVALIDO")
    return AgendaTimeBlock.objects.create(
        id=str(uuid.uuid4()),
        staff=staff,
        date=day,
        start_time=start_time,
        end_time=end_time,
        note=(note or "").strip(),
    )


def update_block(block_id: str, patch: dict[str, Any]) -> Any:
    from api.models import AgendaTimeBlock

    block = AgendaTimeBlock.objects.filter(id=block_id).first()
    if not block:
        raise ValueError("BLOQUEO_NO_ENCONTRADO")
    if "date" in patch and patch["date"]:
        block.date = date.fromisoformat(patch["date"]) if isinstance(patch["date"], str) else patch["date"]
    if "startTime" in patch and patch["startTime"]:
        block.start_time = patch["startTime"]
    if "endTime" in patch and patch["endTime"]:
        block.end_time = patch["endTime"]
    if "note" in patch:
        block.note = (patch["note"] or "").strip() if patch["note"] is not None else ""
    if time_to_minutes(block.end_time) <= time_to_minutes(block.start_time):
        raise ValueError("RANGO_INVALIDO")
    block.save()
    return block


def delete_block(block_id: str) -> None:
    from api.models import AgendaTimeBlock

    deleted, _ = AgendaTimeBlock.objects.filter(id=block_id).delete()
    if not deleted:
        raise ValueError("BLOQUEO_NO_ENCONTRADO")


def create_booking_from_slot(
    *,
    slot_time: str,
    attendee_name: str,
    attendee_phone: str,
    address: str,
    attendee_email: str = "",
    notes: str = "",
    language: str = "ca",
    origin: str = "chat",
) -> tuple[bool, str, str | None]:
    """API compatible con el antiguo create_cal_booking."""
    staff = get_default_staff()
    service = get_default_service()
    if not staff or not service:
        return False, "Error: agenda no inicializada.", None

    lang = "es" if (language or "").startswith("es") else "ca"
    try:
        day, start_time = parse_slot_time(slot_time)
    except ValueError:
        return False, "Horari no vàlid." if lang == "ca" else "Horario no válido.", None

    addr = (address or "").strip()
    note_parts = [p for p in ((notes or "").strip(), f"Adreça: {addr}" if addr else "") if p]
    combined_notes = " | ".join(note_parts)[:500]

    try:
        apt = create_appointment(
            staff_id=staff.id,
            service_id=service.id,
            day=day,
            start_time=start_time,
            customer_name=attendee_name,
            customer_phone=attendee_phone,
            customer_email=attendee_email or "",
            customer_address=addr,
            notes=combined_notes,
            locale=lang,
            origin=origin,
            upsert_crm=True,
        )
    except ValueError as exc:
        code = str(exc)
        if code == "SLOT_OCUPADO":
            msg = (
                "Aquest horari ja no està disponible. Tria'n un altre."
                if lang == "ca"
                else "Este horario ya no está disponible. Elige otro."
            )
        else:
            msg = f"No s'ha pogut crear la reserva ({code})." if lang == "ca" else f"No se pudo crear la reserva ({code})."
        return False, msg, None

    if lang == "es":
        msg = (
            f"✅ **Cita confirmada** (visita presencial) para {attendee_name.strip()} "
            f"en {addr}. Te llamaremos al {attendee_phone.strip()} si hace falta algún detalle."
        )
    else:
        msg = (
            f"✅ **Cita confirmada** (visita presencial) per a {attendee_name.strip()} "
            f"a {addr}. Et trucarem al {attendee_phone.strip()} si cal algun detall."
        )
    return True, msg, apt.id
