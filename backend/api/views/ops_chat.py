"""API del xat intern d'oficina (auth Token). Independent de POST /api/chat/."""

from __future__ import annotations

from django.db.models import Count, Prefetch
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.agents.config import OPS_AGENT_MODELS, resolve_ops_model
from api.models import AdminConversation, AdminMemoryNote, AdminMessage
from api.serializers_ops import (
    AdminConversationDetailSerializer,
    AdminConversationListSerializer,
    AdminMemoryNoteSerializer,
    AdminMessageSerializer,
)

try:
    from pydantic_ai.exceptions import UsageLimitExceeded
except ImportError:  # pragma: no cover

    class UsageLimitExceeded(Exception):  # type: ignore[no-redef]
        pass


def _title_from_message(text: str) -> str:
    cleaned = " ".join((text or "").strip().split())
    if not cleaned:
        return "Nova conversa"
    return cleaned[:72]


def _wants_speech(data) -> bool:
    raw = str(data.get("speak") or data.get("tts") or "").strip().lower()
    return raw in ("1", "true", "yes", "on")


def _user_asked_to_save_note(text: str) -> bool:
    low = (text or "").casefold()
    keys = (
        "desa nota",
        "desar nota",
        "guarda nota",
        "guardar nota",
        "recorda",
        "recordar",
        "desa com a nota",
        "guarda como nota",
        "guardar como nota",
        "pinnea",
        "pinna",
    )
    return any(k in low for k in keys)


def _run_confirm_action(*, conv, user, action: dict, language: str = "ca") -> dict:
    """Ejecuta una acción ya confirmada en el modal (sin LLM)."""
    from api.ops_actions import execute_confirmed_action, pending_action_dict

    normalized = pending_action_dict(action)
    summary = (normalized or {}).get("summary") or "Acció confirmada"
    user_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.USER,
        content=f"Confirmo: {summary}",
        source="confirm",
    )
    if not conv.title:
        conv.title = _title_from_message(summary)
        conv.save(update_fields=["title", "updated_at"])

    reply = execute_confirmed_action(normalized or {}, conversation_id=conv.pk)
    assistant_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.ASSISTANT,
        content=reply,
        source="confirm",
    )
    conv.updated_at = timezone.now()
    conv.save(update_fields=["title", "updated_at"])
    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "user_message": AdminMessageSerializer(user_msg).data,
        "assistant_message": AdminMessageSerializer(assistant_msg).data,
        "notes": [],
        "pending_action": None,
        "via_voice": False,
        "assistant_audio_base64": None,
        "model": None,
    }


def _run_ops_turn(*, conv, user, text: str, language: str, source: str = "text", speak: bool = False, model: str | None = None) -> dict:
    from api.ops_actions import pending_action_dict

    user_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.USER,
        content=text,
        source=source,
    )
    if not conv.title:
        conv.title = _title_from_message(text)
        conv.save(update_fields=["title", "updated_at"])

    history = list(conv.messages.exclude(pk=user_msg.pk).values("role", "content"))
    from django.db.models import Q

    pinned_qs = (
        AdminMemoryNote.objects.filter(user=user, pinned=True)
        .filter(Q(conversation=conv) | Q(conversation__isnull=True))
        .order_by("-pinned", "-updated_at")[:12]
    )
    memory_notes: list[str] = []
    for n in pinned_qs:
        title = (n.title or "").strip()
        content = (n.content or "").strip()
        if title and content:
            memory_notes.append(content if content.startswith(title) else f"{title}: {content}")
        elif content:
            memory_notes.append(content)
        elif title:
            memory_notes.append(title)
    notes_created = []
    pending = None
    try:
        from api.agents.ops.agent import run_ops_agent

        output = run_ops_agent(
            user_message=text,
            history=history,
            user_id=user.pk,
            conversation_id=conv.pk,
            language=language,
            model=model,
            memory_notes=memory_notes,
        )
        reply = (output.message or "").strip() or "Sense resposta."
        if output.suggested_title and not conv.title:
            conv.title = output.suggested_title.strip()[:200]
        pending = pending_action_dict(getattr(output, "pending_action", None))
        if _user_asked_to_save_note(text):
            for note_text in output.important_notes or []:
                body = (note_text or "").strip()
                if not body:
                    continue
                note = AdminMemoryNote.objects.create(
                    user=user,
                    conversation=conv,
                    title=body[:80],
                    content=body,
                    pinned=True,
                )
                notes_created.append(note)
    except Exception as exc:
        err = str(exc)
        err_low = err.lower()
        is_usage = (
            isinstance(exc, UsageLimitExceeded)
            or "request_limit" in err_low
            or "usage limit" in err_low
            or "usage_limits" in err_low
            or "tool_calls_limit" in err_low
        )
        if is_usage:
            openwa_related = "openwa" in err_low or "whatsapp" in err_low
            if openwa_related:
                reply = (
                    "No s'ha pogut completar l'acció de WhatsApp (límit de passos amb errors OpenWA). "
                    "Comprova a Coolify que OpenWA està en marxa, sessió ready (QR) i "
                    f"OPENWA_API_URL al hostname intern. Detall: {exc}"
                )
            else:
                reply = (
                    "No s'ha pogut acabar l'acció: massa passos en un sol torn. "
                    "Torna-ho a provar amb una ordre més concreta "
                    "(ex.: «envia WhatsApp a +34… amb aquest text»). "
                    f"Detall: {exc}"
                )
        elif "openwa" in err_low or "whatsapp" in err_low:
            reply = (
                "No s'ha pogut completar l'acció de WhatsApp. "
                "Comprova a Coolify que OpenWA està en marxa, amb sessió ready (QR escanejat) "
                f"i OPENWA_API_URL al hostname intern. Detall: {exc}"
            )
        else:
            reply = (
                f"No s'ha pogut completar la petició ({exc}). "
                "Revisa la clau d'OpenAI o torna-ho a provar."
            )

    assistant_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.ASSISTANT,
        content=reply,
        source=source,
    )
    conv.updated_at = timezone.now()
    conv.save(update_fields=["title", "updated_at"])

    audio_b64 = None
    if speak:
        try:
            from api.agents.ops.voice import synthesize_speech

            audio_b64 = synthesize_speech(reply, language=language)
        except Exception:
            audio_b64 = None

    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "user_message": AdminMessageSerializer(user_msg).data,
        "assistant_message": AdminMessageSerializer(assistant_msg).data,
        "notes": AdminMemoryNoteSerializer(notes_created, many=True).data,
        "pending_action": pending,
        "via_voice": source == "voice",
        "assistant_audio_base64": audio_b64,
        "model": resolve_ops_model(model),
    }


class AdminConversationViewSet(viewsets.ModelViewSet):
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
        language = (request.data.get("language") or "ca").strip().lower()
        if language not in ("ca", "es"):
            language = "ca"

        speak = _wants_speech(request.data)
        model = request.data.get("model")

        confirm_action = request.data.get("confirm_action")
        if confirm_action is not None:
            if not isinstance(confirm_action, dict):
                return Response(
                    {"detail": "confirm_action ha de ser un objecte."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payload = _run_confirm_action(
                conv=conv,
                user=request.user,
                action=confirm_action,
                language=language,
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
            payload = _run_ops_turn(
                conv=conv,
                user=request.user,
                text=text,
                language=language,
                source="voice",
                speak=speak,
                model=model,
            )
            return Response(payload, status=status.HTTP_201_CREATED)

        text = (request.data.get("content") or request.data.get("message") or "").strip()
        if not text:
            return Response({"detail": "El missatge és buit."}, status=status.HTTP_400_BAD_REQUEST)

        payload = _run_ops_turn(
            conv=conv,
            user=request.user,
            text=text,
            language=language,
            source="text",
            speak=speak,
            model=model,
        )
        return Response(payload, status=status.HTTP_201_CREATED)


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
