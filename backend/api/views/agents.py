import os
import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from asgiref.sync import async_to_sync
from ..agents.orchestrator import CECSAOrchestrator
from ..agents.models import AgentState, Intent
from ..agents.booking import confirm_booking_from_chat
from ..agents.diagnostic_merge import apply_diagnostic_from_message, merge_diagnostic_into_state
from ..agents.graph.routing import wants_scheduling
from ..agents.serialization import normalize_language, state_for_session

@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def chat_with_agents(request):
    """
    Endpoint con refuerzo manual de CORS y manejo de errores robusto.
    """
    # Manejo manual de preflight (OPTIONS)
    if request.method == 'OPTIONS':
        response = Response()
        response["Access-Control-Allow-Origin"] = "https://cucarachasbarcelona.cat"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    if request.method == 'GET':
        return Response({"status": "API is online"})

    message = request.data.get('message', '')
    message = str(message).strip() if message is not None else ''
    booking = request.data.get('booking')

    language = normalize_language(request.data.get('language'))
    
    try:
        state_data = request.session.get('agent_state')
        orchestrator = CECSAOrchestrator()
        
        if state_data:
            try:
                orchestrator.state = AgentState.model_validate(state_data)
                orchestrator.state.language = language
            except Exception:
                orchestrator.state = AgentState(language=language)
        else:
            orchestrator.state.language = language

        # Chat home (sin formulario): no reutilizar intención de cita de otra visita
        if request.data.get("source") == "home" and not wants_scheduling(message.lower()):
            orchestrator.state.intent = Intent.DOUBT

        diagnostic = request.data.get("diagnostic")
        if isinstance(diagnostic, dict) and diagnostic:
            orchestrator.state = merge_diagnostic_into_state(orchestrator.state, diagnostic)
        orchestrator.state = apply_diagnostic_from_message(orchestrator.state, message)

        if isinstance(booking, dict) and booking.get('slot_time') and booking.get('name') and booking.get('phone'):
            result = confirm_booking_from_chat(
                orchestrator.state,
                slot_time=str(booking['slot_time']),
                name=str(booking['name']),
                phone=str(booking['phone']),
                language=language,
            )
        else:
            if not message:
                return Response(
                    {"reply": "Missatge buit.", "slots": []},
                    status=400,
                )
            result = async_to_sync(orchestrator.process_message)(message)

        if isinstance(result, str):
            result = {"message": result}

        try:
            request.session['agent_state'] = state_for_session(orchestrator.state)
            request.session.modified = True
        except Exception as session_err:
            print(f"WARNING: No se pudo guardar agent_state en sesión: {session_err}")

        res_data = {
            "reply": result.get("message", ""),
            "slots": result.get("slots", []),
            "booking_confirmed": result.get("booking_confirmed", False),
            "booking_uid": result.get("booking_uid")
        }
        
        response = Response(res_data)
        # Refuerzo manual de CORS
        response["Access-Control-Allow-Origin"] = "https://cucarachasbarcelona.cat"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    except Exception as e:
        print(f"CRITICAL ERROR: {traceback.format_exc()}")
        # 200 para que el modal muestre el mensaje en lugar de un fallo de red genérico
        response = Response({
            "reply": "Error intern de connexió. Si us plau, intenta-ho de nou.",
            "slots": [],
        }, status=200)
        response["Access-Control-Allow-Origin"] = "https://cucarachasbarcelona.cat"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
