"""Espejo local de entidades iGEO (exportaciones PDI). No es un vector store."""

from django.db import models


class IgeoMirrorEntity(models.Model):
    """Copia relacional de un registro iGEO para búsqueda síncrona en oficina."""

    SOURCE_EXPORT = "export"
    SOURCE_FILE = "file"
    SOURCE_RESULT = "result"
    SOURCE_DEMO = "demo"

    source_key = models.CharField(
        max_length=180,
        unique=True,
        help_text="tipo:codigo o tipo:remote:id — clave estable de upsert",
    )
    entity_type = models.CharField(max_length=64, db_index=True)
    igeo_codigo = models.CharField(max_length=64, blank=True, default="", db_index=True)
    remote_operation_id = models.CharField(max_length=128, blank=True, default="", db_index=True)
    comando = models.CharField(max_length=16, blank=True, default="")
    display_name = models.CharField(max_length=255, blank=True, default="")
    telefono = models.CharField(max_length=32, blank=True, default="")
    telefono_norm = models.CharField(max_length=15, blank=True, default="", db_index=True)
    email = models.CharField(max_length=254, blank=True, default="")
    direccion = models.CharField(max_length=255, blank=True, default="")
    localidad = models.CharField(max_length=120, blank=True, default="")
    estado = models.CharField(max_length=64, blank=True, default="")
    is_deleted = models.BooleanField(default=False, db_index=True)
    payload = models.JSONField(default=dict, blank=True)
    source = models.CharField(max_length=16, default=SOURCE_EXPORT, db_index=True)
    cliente = models.ForeignKey(
        "api.Cliente",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="igeo_mirror_entities",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["entity_type", "igeo_codigo"]),
            models.Index(fields=["entity_type", "is_deleted"]),
        ]

    def __str__(self) -> str:
        return f"{self.entity_type} {self.igeo_codigo or self.source_key}"
