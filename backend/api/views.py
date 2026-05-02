from rest_framework import viewsets
from .models import (
    Species, Cliente, Tratamiento, Tecnico, 
    Ubicacion, Presupuesto, Cita, ReporteServicio
)
from .serializers import (
    SpeciesSerializer, ClienteSerializer, TratamientoSerializer, 
    TecnicoSerializer, UbicacionSerializer, PresupuestoSerializer, 
    CitaSerializer, ReporteServicioSerializer
)

class SpeciesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    lookup_field = 'slug'

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class TratamientoViewSet(viewsets.ModelViewSet):
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer

class TecnicoViewSet(viewsets.ModelViewSet):
    queryset = Tecnico.objects.all()
    serializer_class = TecnicoSerializer

class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer

class PresupuestoViewSet(viewsets.ModelViewSet):
    queryset = Presupuesto.objects.all()
    serializer_class = PresupuestoSerializer

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer

class ReporteServicioViewSet(viewsets.ModelViewSet):
    queryset = ReporteServicio.objects.all()
    serializer_class = ReporteServicioSerializer

# --- Agentes AI Integration ---
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .agents.orchestrator import CECSAOrchestrator
from .agents.models import AgentState
import json

import asyncio

@api_view(['GET', 'POST'])
def chat_with_agents(request):
    """
    Endpoint principal para interactuar con el ecosistema de agentes de CECSA.
    """
    if request.method == 'GET':
        return Response({"status": "API is online", "message": "CECSA Agentic API is ready for POST requests."})

    message = request.data.get('message')
    if not message:
        return Response({"error": "No message provided"}, status=400)

    try:
        state_data = request.session.get('agent_state')
        orchestrator = CECSAOrchestrator()
        if state_data:
            orchestrator.state = AgentState(**state_data)

        from asgiref.sync import async_to_sync
        result = async_to_sync(orchestrator.process_message)(message)

        # El orchestrator ahora devuelve siempre un dict
        if isinstance(result, str):
            result = {"message": result}

        request.session['agent_state'] = orchestrator.state.model_dump()

        return Response({
            "reply": result.get("message", ""),
            "slots": result.get("slots", []),
            "booking_confirmed": result.get("booking_confirmed", False),
            "booking_uid": result.get("booking_uid"),
            "state": orchestrator.state.model_dump()
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({
            "reply": "Ho sento, he tingut un error intern. Si us plau, truca al 933 309 169 per a una assistència immediata.",
        }, status=500)
@api_view(['GET', 'POST'])
def cal_webhook(request):
    """
    Webhook para recibir eventos de Cal.com.
    - GET: responde al Ping de verificación de Cal.com.
    - POST: procesa eventos de reserva.
    """
    # Cal.com realiza un GET o POST de ping para verificar el endpoint
    if request.method == 'GET':
        return Response({"status": "ok", "message": "CECSA Cal.com Webhook actiu"})

    payload = request.data
    trigger_event = payload.get('triggerEvent')
    data = payload.get('payload', {})

    # Responder OK inmediatamente al ping de prueba
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
            # Intentamos cancelar por UID en notas, fallback por email+hora
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
import requests
from django.conf import settings
import os

@api_view(['GET'])
def get_cal_slots(request):
    """
    Proxy para obtener slots de Cal.com evitando problemas de CORS en el frontend.
    """
    event_type_id = request.query_params.get('eventTypeId', '277401')
    start_time = request.query_params.get('startTime')
    end_time = request.query_params.get('endTime')
    
    api_key = os.getenv('CAL_API_KEY', 'cal_live_e17cc48d9dd1068857af7b67f396b787')
    
    url = f"https://api.cal.com/v2/slots?eventTypeId={event_type_id}&startTime={start_time}&endTime={end_time}"
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers)
        return Response(response.json(), status=response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
