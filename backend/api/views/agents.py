import os
import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from asgiref.sync import async_to_sync
from ..agents.orchestrator import CECSAOrchestrator
from ..agents.models import AgentState

@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def chat_with_agents(request):
    """
    Endpoint con refuerzo manual de CORS y manejo de errores robusto.
    """
    # Manejo manual de preflight (OPTIONS)
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "*"
        return response

    if request.method == 'GET':
        return Response({"status": "API is online"})

    message = request.data.get('message')
    language = request.data.get('language')
    
    try:
        state_data = request.session.get('agent_state')
        orchestrator = CECSAOrchestrator()
        
        if state_data:
            try:
                # Usar model_validate con context para ser más permisivo si el estado cambió
                orchestrator.state = AgentState.model_validate(state_data)
                if language: orchestrator.state.language = language
            except Exception:
                orchestrator.state = AgentState(language=language or "ca")
        elif language:
            orchestrator.state.language = language

        # Ejecución
        result = async_to_sync(orchestrator.process_message)(message)

        if isinstance(result, str):
            result = {"message": result}

        request.session['agent_state'] = orchestrator.state.model_dump()

        res_data = {
            "reply": result.get("message", ""),
            "slots": result.get("slots", []),
            "booking_confirmed": result.get("booking_confirmed", False),
            "booking_uid": result.get("booking_uid")
        }
        
        response = Response(res_data)
        # Refuerzo manual de CORS
        response["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        print(f"CRITICAL ERROR: {traceback.format_exc()}")
        response = Response({
            "reply": f"Error intern de connexió. Si us plau, intenta-ho de nou.",
            "debug": str(e)
        }, status=500)
        response["Access-Control-Allow-Origin"] = "*"
        return response
