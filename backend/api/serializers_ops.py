from rest_framework import serializers

from .models import AdminConversation, AdminMemoryNote, AdminMessage


class AdminMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminMessage
        fields = ("id", "role", "content", "source", "created_at")
        read_only_fields = fields


class AdminMemoryNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminMemoryNote
        fields = (
            "id",
            "conversation",
            "title",
            "content",
            "pinned",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AdminConversationListSerializer(serializers.ModelSerializer):
    preview = serializers.SerializerMethodField()
    message_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdminConversation
        fields = (
            "id",
            "title",
            "archived",
            "created_at",
            "updated_at",
            "preview",
            "message_count",
        )
        read_only_fields = fields

    def get_preview(self, obj: AdminConversation) -> str:
        last = getattr(obj, "last_message", None)
        if last:
            return (last.content or "")[:140]
        msg = obj.messages.order_by("-created_at").first()
        if not msg:
            return ""
        return (msg.content or "")[:140]


class AdminConversationDetailSerializer(serializers.ModelSerializer):
    messages = AdminMessageSerializer(many=True, read_only=True)
    notes = AdminMemoryNoteSerializer(many=True, read_only=True)

    class Meta:
        model = AdminConversation
        fields = (
            "id",
            "title",
            "archived",
            "created_at",
            "updated_at",
            "messages",
            "notes",
        )
        read_only_fields = ("id", "created_at", "updated_at", "messages", "notes")
