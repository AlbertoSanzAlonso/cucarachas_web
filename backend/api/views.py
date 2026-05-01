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
        # Recuperar estado de la sesión si existe
        state_data = request.session.get('agent_state')
        orchestrator = CECSAOrchestrator()
        if state_data:
            orchestrator.state = AgentState(**state_data)

        # Procesar mensaje de forma síncrona para DRF
        reply = asyncio.run(orchestrator.process_message(message))

        # Guardar nuevo estado
        request.session['agent_state'] = orchestrator.state.model_dump()
        
        return Response({
            "reply": reply,
            "state": orchestrator.state.model_dump()
        })
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(error_details) # También saldrá en logs
        return Response({
            "reply": f"Error interno: {str(e)}",
            "debug_error": error_details
        }, status=500)
