import os
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Cliente
from api.cal_client import (
    CAL_BASE_URL,
    CAL_BOOKING_API_VERSION,
    fetch_cal_bookings,
    update_cal_booking,
)

@api_view(['GET', 'POST'])
def cal_webhook(request):
    """
    Webhook para recibir eventos de Cal.com.
    - GET: responde al Ping de verificación de Cal.com.
    - POST: procesa eventos de reserva.
    """
    if request.method == 'GET':
        return Response({"status": "ok", "message": "CECSA Cal.com Webhook actiu"})

    payload = request.data
    trigger_event = payload.get('triggerEvent')
    data = payload.get('payload', {})

    if not trigger_event or trigger_event == 'PING':
        return Response({"status": "ok", "message": "Ping rebut correctament"})

    try:
        if trigger_event == 'BOOKING_CREATED':
            attendee = data.get('attendees', [{}])[0]
            cliente, _ = Cliente.objects.get_or_create(
                email=attendee.get('email'),
                defaults={
                    'nombre': attendee.get('name', 'Client Cal.com'),
                    'telefono': attendee.get('phoneNumber', ''),
                    'documento_fiscal': f"CAL-{data.get('uid', 'web')[:12]}",
                }
            )
            # Cita requiere ubicacion/tecnico/fechas — el panel usa Cal.com API directamente.
            print(f"INFO Webhook BOOKING_CREATED uid={data.get('uid')} client={cliente.email}")

        elif trigger_event in ('BOOKING_CANCELLED', 'BOOKING_REJECTED'):
            print(f"INFO Webhook {trigger_event} uid={data.get('uid')}")

        elif trigger_event == 'BOOKING_REQUESTED':
            attendee = data.get('attendees', [{}])[0]
            Cliente.objects.get_or_create(
                email=attendee.get('email'),
                defaults={
                    'nombre': attendee.get('name', 'Client Cal.com'),
                    'telefono': attendee.get('phoneNumber', ''),
                    'documento_fiscal': f"CAL-{data.get('uid', 'web')[:12]}",
                }
            )

        return Response({"status": "success", "event": trigger_event})
    except Exception as e:
        print(f"ERROR Webhook Cal.com [{trigger_event}]: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cal_bookings(request):
    """Proxy: lista reservas de Cal.com (API v2 2024-08-13)."""
    ok, result = fetch_cal_bookings()
    if ok:
        return Response({
            "status": "success",
            "data": {"bookings": result},
        }, status=200)
    return Response({"status": "error", "message": result}, status=502)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_cal_booking(request, booking_uid):
    """Proxy para cancelar una reserva en Cal.com (por UID)."""
    api_key = os.getenv('CAL_API_KEY', '').strip()
    if not api_key:
        return Response({'error': 'CAL_API_KEY no configurada al servidor'}, status=500)

    url = f"{CAL_BASE_URL}/bookings/{booking_uid}/cancel"

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "cal-api-version": CAL_BOOKING_API_VERSION,
        }
        response = requests.post(
            url,
            headers=headers,
            json={"cancellationReason": "Cancel·lada des del panell CECSA"},
            timeout=12,
        )
        try:
            body = response.json()
        except ValueError:
            body = {"raw": response.text[:300]}
        return Response(body, status=response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cal_booking_view(request, booking_uid):
    """Proxy: reprograma hora i/o adreça d'una reserva Cal.com."""
    start = (request.data.get('start') or '').strip() or None
    address = request.data.get('address')
    if address is not None:
        address = str(address).strip()

    ok, result = update_cal_booking(
        booking_uid,
        start=start,
        address=address,
    )
    if ok:
        return Response({"status": "success", "data": result}, status=200)
    return Response({"status": "error", "message": result}, status=502)


@api_view(['GET'])
def get_cal_slots(request):
    """Proxy para obtener slots de Cal.com evitando problemas de CORS."""
    from api.cal_client import fetch_available_slots

    days_ahead = 7
    if request.query_params.get('startTime') and request.query_params.get('endTime'):
        try:
            from datetime import datetime
            start = datetime.fromisoformat(request.query_params['startTime'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(request.query_params['endTime'].replace('Z', '+00:00'))
            days_ahead = max(1, (end.date() - start.date()).days)
        except ValueError:
            pass

    ok, result = fetch_available_slots(days_ahead=days_ahead)
    if ok:
        return Response({"status": "success", "data": result}, status=200)
    return Response({"status": "error", "message": result}, status=502)
