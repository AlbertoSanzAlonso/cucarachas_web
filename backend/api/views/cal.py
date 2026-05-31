import os
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Cliente, Cita

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
                defaults={'nombre': attendee.get('name', 'Client Cal.com')}
            )
            Cita.objects.create(
                cliente=cliente,
                fecha_hora=data.get('startTime'),
                notas=f"Reserva automàtica via Cal.com. UID: {data.get('uid', data.get('id', ''))}",
                estado='Confirmada'
            )

        elif trigger_event in ('BOOKING_CANCELLED', 'BOOKING_REJECTED'):
            attendee = data.get('attendees', [{}])[0]
            uid = data.get('uid', '')
            citas = Cita.objects.filter(notas__icontains=uid) if uid else \
                    Cita.objects.filter(cliente__email=attendee.get('email'), fecha_hora=data.get('startTime'))
            citas.update(estado='Cancelada')

        elif trigger_event == 'BOOKING_REQUESTED':
            attendee = data.get('attendees', [{}])[0]
            cliente, _ = Cliente.objects.get_or_create(
                email=attendee.get('email'),
                defaults={'nombre': attendee.get('name', 'Client Cal.com')}
            )
            Cita.objects.get_or_create(
                notas__icontains=data.get('uid', ''),
                defaults={
                    'cliente': cliente,
                    'fecha_hora': data.get('startTime'),
                    'notas': f"Sol·licitud pendent. UID: {data.get('uid', '')}",
                    'estado': 'Pendent'
                }
            )

        return Response({"status": "success", "event": trigger_event})
    except Exception as e:
        print(f"ERROR Webhook Cal.com [{trigger_event}]: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cal_bookings(request):
    """Proxy para obtener las reservas de Cal.com."""
    api_key = os.getenv('CAL_API_KEY')
    if not api_key:
        return Response({'error': 'CAL_API_KEY no configurada al servidor'}, status=500)
    
    # Probamos con el endpoint europeo por si la clave es regional
    url = "https://api.cal.eu/v2/bookings"
    
    try:
        api_key = os.getenv('CAL_API_KEY', '').strip()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "cal-api-version": "2024-06-11",
            "Content-Type": "application/json"
        }
        print(f"DEBUG: Re-connecting to Cal.eu v2 with key: {api_key[:8]}...")
        response = requests.get(url, headers=headers)
        print(f"DEBUG: Cal.com v2 status: {response.status_code}")
        print(f"DEBUG: Cal.com v2 response headers: {dict(response.headers)}")
        
        try:
            res_data = response.json()
        except:
            res_data = {"error": "Invalid JSON", "raw": response.text}

        if response.status_code != 200:
            print(f"DEBUG: Cal.com v2 FULL ERROR: {response.text}")
            return Response(res_data, status=response.status_code)
            
        return Response(res_data, status=200)
    except Exception as e:
        print(f"CRITICAL ERROR in get_cal_bookings: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_cal_booking(request, booking_id):
    """Proxy para cancelar una reserva en Cal.com."""
    api_key = os.getenv('CAL_API_KEY')
    if not api_key:
        return Response({'error': 'CAL_API_KEY no configurada al servidor'}, status=500)
    
    url = f"https://api.cal.eu/v2/bookings/{booking_id}/cancel"
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "cal-api-version": "2024-06-11"
        }
        response = requests.post(url, headers=headers)
        return Response(status=response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

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
