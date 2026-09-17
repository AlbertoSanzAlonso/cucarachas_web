"""Endpoints OpenAI Realtime del xat d'oficina (auth Token)."""

from __future__ import annotations

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import AdminConversation, AdminMessage
from api.serializers_ops import AdminMessageSerializer


def ops_conv_for_user(user, conversation_id) -> AdminConversation | None:
    if not conversation_id:
        return None
    try:
        cid = int(conversation_id)
    except (TypeError, ValueError):
        return None
    return AdminConversation.objects.filter(user=user, pk=cid).first()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ops_realtime_session(request):
    """Crea clau efímera OpenAI Realtime + assegura conversa (mai exposa OPENAI_API_KEY)."""
    from api.agents.ops.realtime_session import RealtimeSessionError, create_ephemeral_client_secret

    language = (request.data.get("language") or "ca").strip().lower()
    if language not in ("ca", "es"):
        language = "ca"

    conv = ops_conv_for_user(request.user, request.data.get("conversation_id"))
    if conv is None:
        conv = AdminConversation.objects.create(
            user=request.user,
            title=(request.data.get("title") or "").strip()[:200] or "Veu",
        )

    try:
        secret = create_ephemeral_client_secret(language=language, user_id=request.user.pk)
    except RealtimeSessionError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
    except Exception as exc:
        return Response(
            {"detail": f"Error Realtime: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if not conv.title:
        conv.title = "Veu"
        conv.save(update_fields=["title", "updated_at"])

    return Response(
        {
            "conversation_id": conv.pk,
            "client_secret": secret["client_secret"],
            "expires_at": secret.get("expires_at"),
            "model": secret.get("model"),
            "voice": secret.get("voice"),
            "created_at": timezone.now().isoformat(),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ops_realtime_tool(request):
    """Executa una tool Realtime al servidor (CRM / WA / pending)."""
    from api.agents.ops.realtime_session import execute_realtime_tool

    conv = ops_conv_for_user(request.user, request.data.get("conversation_id"))
    if conv is None:
        return Response({"detail": "Conversa no trobada."}, status=status.HTTP_404_NOT_FOUND)

    name = (request.data.get("name") or "").strip()
    if not name:
        return Response({"detail": "Falta name de la tool."}, status=status.HTTP_400_BAD_REQUEST)

    arguments = request.data.get("arguments")
    try:
        result = execute_realtime_tool(name, arguments, conversation=conv)
    except Exception as exc:
        return Response(
            {"detail": f"Error executant {name}: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return Response({"name": name, "output": result})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ops_realtime_transcript(request):
    """Persisteix un torn de veu (user/assistant) al fil de la conversa."""
    conv = ops_conv_for_user(request.user, request.data.get("conversation_id"))
    if conv is None:
        return Response({"detail": "Conversa no trobada."}, status=status.HTTP_404_NOT_FOUND)

    role = (request.data.get("role") or "").strip().lower()
    if role not in ("user", "assistant"):
        return Response(
            {"detail": "role ha de ser user o assistant."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    content = (request.data.get("content") or "").strip()
    if not content:
        return Response({"detail": "content buit."}, status=status.HTTP_400_BAD_REQUEST)

    msg = AdminMessage.objects.create(
        conversation=conv,
        role=role,
        content=content[:8000],
        source="voice",
    )
    if not conv.title or conv.title in ("Veu", "Nou xat", ""):
        conv.title = content[:60]
    conv.save(update_fields=["title", "updated_at"])
    return Response(
        {
            "conversation_id": conv.pk,
            "message": AdminMessageSerializer(msg).data,
        },
        status=status.HTTP_201_CREATED,
    )
