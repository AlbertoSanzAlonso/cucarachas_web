"""API del xat intern d'oficina (auth Token). Independent de POST /api/chat/."""

from __future__ import annotations

from django.db.models import Count, Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.agents.config import OPS_AGENT_MODELS, resolve_ops_model
from api.models import AdminConversation, AdminMemoryNote, AdminMessage
from api.ops_turn import persist_turn, request_dict, run_ops_turn, wants_speech
from api.serializers_ops import (
    AdminConversationDetailSerializer,
    AdminConversationListSerializer,
    AdminMemoryNoteSerializer,
)


class AdminConversationViewSet(viewsets.ModelViewSet[AdminConversation]):
    queryset = AdminConversation.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = AdminConversation.objects.filter(user=self.request.user).annotate(
            message_count=Count("messages"),
        )
        archived = (self.request.query_params.get("archived") or "").strip().lower()
        if archived in ("1", "true", "yes"):
            qs = qs.filter(archived=True)
        else:
            qs = qs.filter(archived=False)
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            qs = qs.filter(title__icontains=q)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AdminConversationDetailSerializer
        return AdminConversationListSerializer

    def retrieve(self, request, *args, **kwargs):
        obj = (
            AdminConversation.objects.filter(user=request.user, pk=kwargs["pk"])
            .prefetch_related(
                Prefetch("messages", queryset=AdminMessage.objects.order_by("created_at")),
                Prefetch("notes", queryset=AdminMemoryNote.objects.order_by("-pinned", "-updated_at")),
            )
            .first()
        )
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminConversationDetailSerializer(obj).data)

    def perform_create(self, serializer):
        raise NotImplementedError

    def create(self, request, *args, **kwargs):
        data = request_dict(request.data)
        title = (data.get("title") or "").strip()
        conv = AdminConversation.objects.create(user=request.user, title=title)
        return Response(
            AdminConversationDetailSerializer(conv).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        conv = self.get_object()
        data = request_dict(request.data)
        title = data.get("title")
        if title is not None:
            conv.title = str(title).strip()[:200]
        archived = data.get("archived")
        if archived is not None:
            conv.archived = bool(archived)
        conv.save()
        return Response(AdminConversationListSerializer(conv).data)

    @action(detail=True, methods=["post"], url_path="messages")
    def post_message(self, request, pk=None):
        conv = self.get_object()
        data = request_dict(request.data)
        language = (data.get("language") or "ca").strip().lower()
        if language not in ("ca", "es"):
            language = "ca"

        speak = wants_speech(data)
        model = data.get("model")

        confirm_action = data.get("confirm_action")
        if confirm_action is not None:
            if not isinstance(confirm_action, dict):
                return Response(
                    {"detail": "confirm_action ha de ser un objecte."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Compat: executa directe (tests / clients antics). El xat UI confirma amb «sí».
            from api.ops_actions import pending_action_dict
            from api.ops_jobs import run_confirmed_queue

            normalized = pending_action_dict(confirm_action)
            summary = (normalized or {}).get("summary") or "Acció confirmada"
            user_msg = AdminMessage.objects.create(
                conversation=conv,
                role=AdminMessage.Role.USER,
                content=f"Confirmo: {summary}",
                source="confirm",
            )
            reply = run_confirmed_queue(
                conversation=conv,
                user=request.user,
                action=normalized or {},
            )
            conv.pending_action = None
            payload = persist_turn(
                conv=conv,
                user_msg=user_msg,
                reply=reply,
                source="confirm",
                speak=False,
                language=language,
                model=model,
            )
            return Response(payload, status=status.HTTP_201_CREATED)

        audio = request.FILES.get("audio")
        if audio:
            from api.agents.ops.voice import VoiceError, transcribe_audio_upload

            try:
                text = transcribe_audio_upload(audio, language=language)
            except VoiceError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as exc:
                return Response(
                    {"detail": f"No s'ha pogut processar la veu ({exc})."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            payload = run_ops_turn(
                conv=conv,
                user=request.user,
                text=text,
                language=language,
                source="voice",
                speak=speak,
                model=model,
            )
            return Response(payload, status=status.HTTP_201_CREATED)

        text = (data.get("content") or data.get("message") or "").strip()
        if not text:
            return Response({"detail": "El missatge és buit."}, status=status.HTTP_400_BAD_REQUEST)

        payload = run_ops_turn(
            conv=conv,
            user=request.user,
            text=text,
            language=language,
            source="text",
            speak=speak,
            model=model,
        )
        return Response(payload, status=status.HTTP_201_CREATED)


class AdminMemoryNoteViewSet(viewsets.ModelViewSet[AdminMemoryNote]):
    queryset = AdminMemoryNote.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AdminMemoryNoteSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = AdminMemoryNote.objects.filter(user=self.request.user)
        conv_id = self.request.query_params.get("conversation")
        if conv_id:
            qs = qs.filter(conversation_id=conv_id)
        scope = (self.request.query_params.get("scope") or "").strip()
        if scope == "global":
            qs = qs.filter(conversation__isnull=True)
        return qs

    def perform_create(self, serializer):
        conv = serializer.validated_data.get("conversation")
        if conv and conv.user_id != self.request.user.pk:
            raise PermissionError("Conversa d'un altre usuari")
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_ops_models(request):
    """Catàleg de models permesos al selector de l'assistent d'oficina."""
    from api.agents.config import AGENT_MODEL

    return Response(
        {
            "default": resolve_ops_model(AGENT_MODEL),
            "models": list(OPS_AGENT_MODELS),
        }
    )
