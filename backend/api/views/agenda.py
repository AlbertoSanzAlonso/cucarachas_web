"""API agenda propia — contrato compatible con agenda-kit HTTP + endpoints chat."""
from __future__ import annotations

from datetime import date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from api.agenda import engine
from api.agenda.config import AGENDA_DAYS_AHEAD, AGENDA_SLOT_MINUTES
from api.models import (
    AgendaAppointment,
    AgendaService,
    AgendaStaff,
)

ERROR_MESSAGES = {
    "SERVICIO_INVALIDO": "Servicio no válido",
    "STAFF_INVALIDO": "Técnico no válido",
    "CITA_NO_ENCONTRADA": "Cita no encontrada",
    "BLOQUEO_NO_ENCONTRADO": "Bloqueo no encontrado",
    "RANGO_INVALIDO": "La hora de fin debe ser posterior al inicio",
    "SLOT_OCUPADO": "Ese horario no está disponible",
}


def _err(exc: Exception, status: int = 400) -> Response:
    code = str(exc)
    return Response({"error": ERROR_MESSAGES.get(code, code)}, status=status)


def _photo_url(request, staff: AgendaStaff) -> str | None:
    if not staff.photo:
        return None
    return request.build_absolute_uri(staff.photo.url)


def _staff_public(request, s: AgendaStaff) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "role": s.role or None,
        "active": s.active,
        "photoUrl": _photo_url(request, s),
        "serviceIds": list(s.services.values_list("id", flat=True)),
    }


def _parse_service_ids(raw) -> list:
    if raw is None:
        return ["primera-revisio"]
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        import json

        raw = raw.strip()
        if not raw:
            return ["primera-revisio"]
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            return [x.strip() for x in raw.split(",") if x.strip()]
    return ["primera-revisio"]


def _apply_staff_photo(request, staff: AgendaStaff) -> None:
    """Acepta multipart `photo` o flag `clearPhoto`."""
    clear = request.data.get("clearPhoto")
    if clear in (True, "true", "1", "yes"):
        if staff.photo:
            staff.photo.delete(save=False)
        staff.photo = None
        return
    uploaded = request.FILES.get("photo")
    if uploaded:
        if staff.photo:
            staff.photo.delete(save=False)
        staff.photo = uploaded


def _service_public(s: AgendaService) -> dict:
    return {
        "id": s.id,
        "nameEs": s.name_es,
        "nameEn": s.name_en,
        "nameCa": s.name_ca or s.name_es,
        "durationMinutes": s.duration_minutes,
        "categoryId": None,
        "bookingPattern": None,
        "active": s.active,
    }


def _slug_id(name: str, prefix: str) -> str:
    import re
    import uuid

    slug = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")[:40] or prefix
    return f"{slug}-{uuid.uuid4().hex[:6]}"


# ── Auth (admin DRF Token) ───────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_auth_verify(request):
    return Response({"ok": True})


# ── Catálogo ─────────────────────────────────────────────────────────────


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def agenda_admin_staff(request):
    if request.method == "GET":
        include_inactive = request.query_params.get("all") == "1"
        qs = AgendaStaff.objects.all().order_by("name")
        if not include_inactive:
            qs = qs.filter(active=True)
        return Response(
            {
                "staff": [
                    _staff_public(request, s)
                    for s in qs.prefetch_related("services")
                ]
            }
        )

    body = request.data or {}
    name = (body.get("name") or "").strip()
    if not name:
        return Response({"error": "El nombre es obligatorio"}, status=400)

    raw_id = (body.get("id") or "").strip()
    if not raw_id:
        raw_id = _slug_id(name, "tecnic")
    if AgendaStaff.objects.filter(id=raw_id).exists():
        return Response({"error": "Ya existe un técnico con ese id"}, status=400)

    active_raw = body.get("active", True)
    if isinstance(active_raw, str):
        active = active_raw.lower() in ("1", "true", "yes", "on")
    else:
        active = bool(active_raw)

    staff = AgendaStaff(
        id=raw_id,
        name=name,
        role=(body.get("role") or "").strip(),
        active=active,
    )
    _apply_staff_photo(request, staff)
    staff.save()

    service_ids = _parse_service_ids(body.get("serviceIds"))
    services = list(AgendaService.objects.filter(id__in=service_ids))
    if services:
        staff.services.set(services)

    # Copiar horario del salón como disponibilidad del técnico
    from api.models import AgendaSalonHours, AgendaStaffAvailability

    for win in AgendaSalonHours.objects.all():
        AgendaStaffAvailability.objects.get_or_create(
            staff=staff,
            day_of_week=win.day_of_week,
            start_time=win.start_time,
            defaults={"end_time": win.end_time},
        )

    return Response({"staff": _staff_public(request, staff)}, status=201)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def agenda_admin_staff_detail(request, staff_id: str):
    staff = AgendaStaff.objects.filter(id=staff_id).first()
    if not staff:
        return Response({"error": "Técnico no encontrado"}, status=404)

    if request.method == "DELETE":
        if staff.photo:
            staff.photo.delete(save=False)
        staff.delete()
        return Response(status=204)

    body = request.data or {}
    if "name" in body and str(body.get("name") or "").strip():
        staff.name = str(body["name"]).strip()
    if "role" in body:
        staff.role = str(body.get("role") or "").strip()
    if "active" in body:
        active_raw = body["active"]
        if isinstance(active_raw, str):
            staff.active = active_raw.lower() in ("1", "true", "yes", "on")
        else:
            staff.active = bool(active_raw)

    _apply_staff_photo(request, staff)
    staff.save()

    if "serviceIds" in body:
        service_ids = _parse_service_ids(body.get("serviceIds"))
        services = list(AgendaService.objects.filter(id__in=service_ids))
        staff.services.set(services)

    return Response({"staff": _staff_public(request, staff)})



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def agenda_admin_services(request):
    if request.method == "GET":
        include_inactive = request.query_params.get("all") == "1"
        qs = AgendaService.objects.all().order_by("name_es")
        if not include_inactive:
            qs = qs.filter(active=True)
        return Response({"services": [_service_public(s) for s in qs]})

    body = request.data or {}
    name_es = (body.get("nameEs") or body.get("name_es") or "").strip()
    name_ca = (body.get("nameCa") or body.get("name_ca") or name_es).strip()
    name_en = (body.get("nameEn") or body.get("name_en") or name_es).strip()
    if not name_es:
        return Response({"error": "El nombre (ES) es obligatorio"}, status=400)

    try:
        duration = int(body.get("durationMinutes") or body.get("duration_minutes") or 60)
    except (TypeError, ValueError):
        return Response({"error": "Duración inválida"}, status=400)
    if duration < 15 or duration > 480:
        return Response({"error": "Duración entre 15 y 480 minutos"}, status=400)

    raw_id = (body.get("id") or "").strip()
    if not raw_id:
        raw_id = _slug_id(name_ca or name_es, "servei")
    if AgendaService.objects.filter(id=raw_id).exists():
        return Response({"error": "Ya existe un servicio con ese id"}, status=400)

    service = AgendaService.objects.create(
        id=raw_id,
        name_es=name_es,
        name_en=name_en or name_es,
        name_ca=name_ca or name_es,
        duration_minutes=duration,
        active=bool(body.get("active", True)),
    )
    return Response({"service": _service_public(service)}, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def agenda_admin_service_detail(request, service_id: str):
    service = AgendaService.objects.filter(id=service_id).first()
    if not service:
        return Response({"error": "Servicio no encontrado"}, status=404)

    body = request.data or {}
    if "nameEs" in body or "name_es" in body:
        val = (body.get("nameEs") or body.get("name_es") or "").strip()
        if val:
            service.name_es = val
    if "nameEn" in body or "name_en" in body:
        service.name_en = (body.get("nameEn") or body.get("name_en") or "").strip()
    if "nameCa" in body or "name_ca" in body:
        service.name_ca = (body.get("nameCa") or body.get("name_ca") or "").strip()
    if "durationMinutes" in body or "duration_minutes" in body:
        raw_duration = (
            body.get("durationMinutes")
            if "durationMinutes" in body
            else body.get("duration_minutes")
        )
        if raw_duration is None:
            return Response({"error": "Duración inválida"}, status=400)
        try:
            duration = int(raw_duration)
        except (TypeError, ValueError):
            return Response({"error": "Duración inválida"}, status=400)
        if duration < 15 or duration > 480:
            return Response({"error": "Duración entre 15 y 480 minutos"}, status=400)
        service.duration_minutes = duration
    if "active" in body:
        service.active = bool(body["active"])
    service.save()
    return Response({"service": _service_public(service)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_admin_categories(request):
    return Response({"categories": []})


@api_view(["GET"])
@permission_classes([AllowAny])
def agenda_schedule_services(request):
    staff_id = request.query_params.get("staffId")
    qs = AgendaService.objects.filter(active=True).order_by("name_es")
    if staff_id:
        qs = qs.filter(staff__id=staff_id)
    return Response({"services": [_service_public(s) for s in qs.distinct()]})


# ── Schedule ─────────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_schedule_day(request):
    day_str = request.query_params.get("date")
    if not day_str:
        return Response({"error": "Falta date"}, status=400)
    schedules = engine.build_day_schedule(day_str, slot_minutes=AGENDA_SLOT_MINUTES)
    return Response({"date": day_str, "schedules": schedules, "salonWindows": []})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_schedule_slots(request):
    day_str = request.query_params.get("date")
    service_ids = (request.query_params.get("serviceIds") or request.query_params.get("serviceId") or "").split(",")
    service_ids = [s.strip() for s in service_ids if s.strip()]
    staff_id = request.query_params.get("staffId")
    exclude = request.query_params.get("excludeAppointmentId")
    if not day_str or not service_ids:
        return Response({"error": "Faltan date o serviceIds"}, status=400)

    service = AgendaService.objects.filter(id=service_ids[0]).first()
    if not service:
        return Response({"error": "Servicio no válido"}, status=400)

    duration = service.duration_minutes
    durations = request.query_params.get("serviceDurations")
    if durations:
        parts = [p.strip() for p in durations.split(",")]
        if parts and parts[0].isdigit():
            duration = int(parts[0])

    if staff_id:
        slots = engine.get_free_slots_for_staff(
            day_str,
            staff_id,
            duration,
            exclude_appointment_id=exclude,
        )
        return Response({"slots": slots, "slotsOverHours": []})

    by_staff: dict[str, list[str]] = {}
    for s in AgendaStaff.objects.filter(active=True):
        by_staff[s.id] = engine.get_free_slots_for_staff(
            day_str, s.id, duration, exclude_appointment_id=exclude
        )
    return Response({"slotsByStaff": by_staff})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_appointments_list(request):
    from_d = request.query_params.get("from") or date.today().isoformat()
    to_d = request.query_params.get("to") or from_d
    rows = (
        AgendaAppointment.objects.filter(date__gte=from_d, date__lte=to_d)
        .select_related("staff", "service")
        .order_by("date", "start_time")
    )
    return Response({"appointments": [engine.appointment_to_public(a) for a in rows]})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def agenda_create_appointment(request):
    body = request.data or {}
    service_id = body.get("serviceId")
    if not service_id:
        ids = body.get("serviceIds") or []
        if isinstance(ids, list) and ids:
            service_id = ids[0]
    customer_name = (body.get("customerName") or "").strip()
    if not customer_name:
        first = (body.get("customerFirstName") or "").strip()
        last = (body.get("customerLastName") or "").strip()
        customer_name = f"{first} {last}".strip()
    required_ok = all(
        [
            body.get("staffId"),
            service_id,
            body.get("date"),
            body.get("startTime"),
            customer_name,
            (body.get("customerPhone") or "").strip(),
        ]
    )
    if not required_ok or not isinstance(service_id, str):
        return Response({"error": "Datos incompletos"}, status=400)
    notes = body.get("notes") or ""
    address = body.get("customerAddress") or body.get("address") or ""
    if address and "Adreça" not in notes and "Dirección" not in notes:
        notes = f"{notes} | Adreça: {address}".strip(" |")
    try:
        apt = engine.create_appointment(
            staff_id=body["staffId"],
            service_id=service_id,
            day=body["date"],
            start_time=body["startTime"],
            customer_name=customer_name,
            customer_phone=body["customerPhone"],
            customer_email=body.get("customerEmail") or "",
            customer_address=address,
            notes=notes,
            locale=body.get("locale") or "es",
            origin=body.get("origin") or "admin",
            duration_minutes=body.get("durationMinutes"),
            upsert_crm=True,
        )
        return Response({"appointment": engine.appointment_to_public(apt)}, status=201)
    except ValueError as exc:
        return _err(exc)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def agenda_update_appointment(request, apt_id: str):
    body = request.data or {}
    patch = {
        "staffId": body.get("staffId"),
        "serviceId": body.get("serviceId"),
        "date": body.get("date"),
        "startTime": body.get("startTime"),
        "durationMinutes": body.get("durationMinutes"),
        "customerName": body.get("customerName"),
        "customerPhone": body.get("customerPhone"),
        "customerEmail": body.get("customerEmail"),
        "customerAddress": body.get("customerAddress") or body.get("address"),
        "notes": body.get("notes"),
        "locale": body.get("locale"),
        "status": body.get("status"),
        "origin": body.get("origin"),
    }
    # Only pass keys that were present
    present = {k: v for k, v in patch.items() if k in body or (k == "customerAddress" and ("customerAddress" in body or "address" in body))}
    try:
        apt = engine.update_appointment(apt_id, present)
        return Response({"appointment": engine.appointment_to_public(apt)})
    except ValueError as exc:
        status = 404 if str(exc) == "CITA_NO_ENCONTRADA" else 400
        return _err(exc, status=status)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def agenda_cancel_appointment(request, apt_id: str):
    try:
        apt = engine.cancel_appointment(apt_id)
        return Response({"appointment": engine.appointment_to_public(apt)})
    except ValueError as exc:
        return _err(exc, status=404 if str(exc) == "CITA_NO_ENCONTRADA" else 400)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def agenda_no_show(request, apt_id: str):
    try:
        apt = engine.mark_no_show(apt_id)
        return Response({"appointment": engine.appointment_to_public(apt)})
    except ValueError as exc:
        return _err(exc, status=404 if str(exc) == "CITA_NO_ENCONTRADA" else 400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def agenda_create_block(request):
    body = request.data or {}
    if not all(body.get(k) for k in ("staffId", "date", "startTime", "endTime")):
        return Response({"error": "Datos incompletos"}, status=400)
    try:
        block = engine.create_block(
            staff_id=body["staffId"],
            day=body["date"],
            start_time=body["startTime"],
            end_time=body["endTime"],
            note=body.get("note") or "",
        )
        return Response({"block": engine.block_to_public(block)}, status=201)
    except ValueError as exc:
        return _err(exc)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def agenda_update_block(request, block_id: str):
    if request.method == "DELETE":
        try:
            engine.delete_block(block_id)
            return Response({"ok": True})
        except ValueError as exc:
            return _err(exc, status=404 if str(exc) == "BLOQUEO_NO_ENCONTRADO" else 400)

    body = request.data or {}
    try:
        block = engine.update_block(
            block_id,
            {
                k: body[k]
                for k in ("date", "startTime", "endTime", "note")
                if k in body
            },
        )
        return Response({"block": engine.block_to_public(block)})
    except ValueError as exc:
        return _err(exc, status=404 if str(exc) == "BLOQUEO_NO_ENCONTRADO" else 400)


# Staff stubs (admin token → 401 so HTTP adapter falls back to /admin/*)
@api_view(["GET"])
@permission_classes([AllowAny])
def agenda_me_services(request):
    return Response({"error": "No autorizado"}, status=401)


@api_view(["GET"])
@permission_classes([AllowAny])
def agenda_me_verify(request):
    return Response({"error": "No autorizado"}, status=401)


# ── Público (chat) ───────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([AllowAny])
def agenda_public_slots(request):
    days = request.query_params.get("days")
    days_ahead = int(days) if days and str(days).isdigit() else AGENDA_DAYS_AHEAD
    ok, result = engine.fetch_available_slots(days_ahead=days_ahead)
    if not ok:
        return Response({"error": result, "slots": []}, status=503)
    return Response({"slots": result})
