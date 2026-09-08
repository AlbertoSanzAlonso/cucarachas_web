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


def _service_public(s: AgendaService) -> dict:
    return {
        "id": s.id,
        "nameEs": s.name_es,
        "nameEn": s.name_en,
        "nameCa": s.name_ca or s.name_es,
        "durationMinutes": s.duration_minutes,
        "categoryId": None,
        "bookingPattern": None,
    }


# ── Auth (admin DRF Token) ───────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_auth_verify(request):
    return Response({"ok": True})


# ── Catálogo ─────────────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_admin_staff(request):
    staff = AgendaStaff.objects.filter(active=True).order_by("name")
    return Response(
        {
            "staff": [
                {"id": s.id, "name": s.name, "role": s.role or None}
                for s in staff
            ]
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agenda_admin_services(request):
    services = AgendaService.objects.filter(active=True).order_by("name_es")
    return Response({"services": [_service_public(s) for s in services]})


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
    required = ("staffId", "serviceId", "date", "startTime", "customerName", "customerPhone")
    if not all(str(body.get(k) or "").strip() for k in required):
        return Response({"error": "Datos incompletos"}, status=400)
    notes = body.get("notes") or ""
    address = body.get("customerAddress") or body.get("address") or ""
    if address and "Adreça" not in notes and "Dirección" not in notes:
        notes = f"{notes} | Adreça: {address}".strip(" |")
    try:
        apt = engine.create_appointment(
            staff_id=body["staffId"],
            service_id=body["serviceId"],
            day=body["date"],
            start_time=body["startTime"],
            customer_name=body["customerName"],
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
