import traceback
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from asgiref.sync import async_to_sync
from ..agents.orchestrator import CECSAOrchestrator
from ..agents.models import AgentState, Intent
from ..agents.booking import confirm_booking_from_chat
from ..agents.diagnostic_merge import apply_diagnostic_from_message, merge_diagnostic_into_state, apply_facts_from_message
from ..agents.graph.routing import wants_scheduling
from ..agents.serialization import normalize_language, state_for_session
from ..cors_utils import apply_cors_headers


@csrf_exempt
@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([AllowAny])
def chat_with_agents(request):
    """Endpoint público del Bio-Assistent (CORS vía corsheaders + refuerzo dinámico)."""
    if request.method == 'GET':
        response = Response({"status": "API is online"})
        return apply_cors_headers(response, request)

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
        orchestrator.state = apply_facts_from_message(orchestrator.state, message)

        if isinstance(booking, dict) and booking.get('slot_time') and booking.get('name') and booking.get('phone') and booking.get('email'):
            result = confirm_booking_from_chat(
                orchestrator.state,
                slot_time=str(booking['slot_time']),
                name=str(booking['name']),
                phone=str(booking['phone']),
                email=str(booking['email']),
                language=language,
                address=str(booking.get('address') or '').strip() or None,
            )
        else:
            if not message:
                response = Response(
                    {"reply": "Missatge buit.", "slots": []},
                    status=400,
                )
                return apply_cors_headers(response, request)
            result = async_to_sync(orchestrator.process_message)(
                message,
                source=request.data.get("source"),
                diagnostic=diagnostic if isinstance(diagnostic, dict) else None,
            )

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
        return apply_cors_headers(response, request)

    except Exception as e:
        print(f"CRITICAL ERROR: {traceback.format_exc()}")
        # 200 para que el modal muestre el mensaje en lugar de un fallo de red genérico
        response = Response({
            "reply": "Error intern de connexió. Si us plau, intenta-ho de nou.",
            "slots": [],
        }, status=200)
        return apply_cors_headers(response, request)
