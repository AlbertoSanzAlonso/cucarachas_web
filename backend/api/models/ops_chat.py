"""Chat interno del backoffice (asistente admin). Independiente del Bio-Assistent público."""

from django.conf import settings
from django.db import models


class AdminConversation(models.Model):
    """Hilo persistente por usuario admin (estilo ChatGPT)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_conversations",
    )
    title = models.CharField(max_length=200, blank=True, default="")
    archived = models.BooleanField(default=False, db_index=True)
    # Acción sensible pendiente de confirmación por chat («sí» / «cancel·la»).
    pending_action = models.JSONField(null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title or f"Conversa {self.pk}"


class AdminMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user"
        ASSISTANT = "assistant"
        SYSTEM = "system"

    conversation = models.ForeignKey(
        AdminConversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=16, choices=Role.choices)
    content = models.TextField()
    source = models.CharField(
        max_length=16,
        default="text",
        help_text="text | voice — origen de l'entrada de l'operari",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.role}: {self.content[:40]}"


class AdminMemoryNote(models.Model):
    """Información importante guardada (por conversación o memoria global del usuario)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_memory_notes",
    )
    conversation = models.ForeignKey(
        AdminConversation,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=160)
    content = models.TextField()
    pinned = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-pinned", "-updated_at"]

    def __str__(self) -> str:
        return self.title
