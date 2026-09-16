"""API del xat intern d'oficina (auth Token). Independent de POST /api/chat/."""

from __future__ import annotations

from django.db.models import Count, Prefetch
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import AdminConversation, AdminMemoryNote, AdminMessage
from api.serializers_ops import (
    AdminConversationDetailSerializer,
    AdminConversationListSerializer,
    AdminMemoryNoteSerializer,
    AdminMessageSerializer,
)


def _title_from_message(text: str) -> str:
    cleaned = " ".join((text or "").strip().split())
    if not cleaned:
        return "Nova conversa"
    return cleaned[:72]


class AdminConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
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
        title = (request.data.get("title") or "").strip()
        conv = AdminConversation.objects.create(user=request.user, title=title)
        return Response(
            AdminConversationDetailSerializer(conv).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        conv = self.get_object()
        title = request.data.get("title")
        if title is not None:
            conv.title = str(title).strip()[:200]
        archived = request.data.get("archived")
        if archived is not None:
            conv.archived = bool(archived)
        conv.save()
        return Response(AdminConversationListSerializer(conv).data)

    @action(detail=True, methods=["post"], url_path="messages")
    def post_message(self, request, pk=None):
        conv = self.get_object()
        text = (request.data.get("content") or request.data.get("message") or "").strip()
        if not text:
            return Response({"detail": "El missatge és buit."}, status=status.HTTP_400_BAD_REQUEST)
        language = (request.data.get("language") or "ca").strip().lower()
        if language not in ("ca", "es"):
            language = "ca"

        user_msg = AdminMessage.objects.create(
            conversation=conv,
            role=AdminMessage.Role.USER,
            content=text,
        )
        if not conv.title:
            conv.title = _title_from_message(text)
            conv.save(update_fields=["title", "updated_at"])

        history = list(
            conv.messages.exclude(pk=user_msg.pk).values("role", "content")
        )
        try:
            from api.agents.ops_agent import run_ops_agent

            output = run_ops_agent(
                user_message=text,
                history=history,
                user_id=request.user.pk,
                conversation_id=conv.pk,
                language=language,
            )
            reply = (output.message or "").strip() or "Sense resposta."
            if output.suggested_title and not conv.title:
                conv.title = output.suggested_title.strip()[:200]
            notes_created = []
            for note_text in output.important_notes or []:
                body = (note_text or "").strip()
                if not body:
                    continue
                note = AdminMemoryNote.objects.create(
                    user=request.user,
                    conversation=conv,
                    title=body[:80],
                    content=body,
                    pinned=True,
                )
                notes_created.append(note)
        except Exception as exc:
            reply = (
                f"No s'ha pogut completar la petició ({exc}). "
                "Revisa la clau d'OpenAI o torna-ho a provar."
            )
            notes_created = []

        assistant_msg = AdminMessage.objects.create(
            conversation=conv,
            role=AdminMessage.Role.ASSISTANT,
            content=reply,
        )
        conv.updated_at = timezone.now()
        conv.save(update_fields=["title", "updated_at"])

        return Response(
            {
                "conversation_id": conv.id,
                "title": conv.title,
                "user_message": AdminMessageSerializer(user_msg).data,
                "assistant_message": AdminMessageSerializer(assistant_msg).data,
                "notes": AdminMemoryNoteSerializer(notes_created, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminMemoryNoteViewSet(viewsets.ModelViewSet):
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
        if conv and conv.user_id != self.request.user.id:
            raise PermissionError("Conversa d'un altre usuari")
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
