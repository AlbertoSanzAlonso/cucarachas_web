import traceback
from rest_framework.decorators import api_view
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from ..agents.orchestrator import CECSAOrchestrator
from ..agents.models import AgentState

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

        # Usar async_to_sync para llamar al orquestador asíncrono desde la vista síncrona de Django
        result = async_to_sync(orchestrator.process_message)(message)

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
        print(traceback.format_exc())
        return Response({
            "reply": "Ho sento, he tingut un error intern. Si us plau, truca al 933 309 169 per a una assistència immediata.",
        }, status=500)
