"""CRM: clientes y ubicaciones de servicio."""

from django.db import models


class Cliente(models.Model):
    """Legal entity or person receiving the service."""

    class CrmStatus(models.TextChoices):
        LEAD = "lead"
        ALTA = "alta"
        BAJA = "baja"

    nombre = models.CharField(max_length=200)
    documento_fiscal = models.CharField(max_length=50, unique=True, help_text="DNI/RUT/NIT")
    email = models.EmailField(blank=True, default="")
    telefono = models.CharField(max_length=20)
    telefono_norm = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
        help_text="Últimos 9 dígitos; clave de negocio para deduplicar leads",
    )
    crm_status = models.CharField(
        max_length=10,
        choices=CrmStatus.choices,
        default=CrmStatus.LEAD,
        db_index=True,
        help_text="Ciclo de vida CRM: lead (posible), alta (cliente activo), baja",
    )
    crm_status_locked = models.BooleanField(
        default=False,
        help_text="Si True, el estado automático no sobrescribe crm_status",
    )
    igeo_codigo = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Código entidad iGEO (espejo PDI) cuando esté sincronizado",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return str(self.nombre)


class Ubicacion(models.Model):
    """Service points for a client."""

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="ubicaciones")
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    coordenadas_gps = models.CharField(max_length=100, blank=True, null=True)
    tipo_propiedad = models.CharField(max_length=100)  # Ej: Residencial, Comercial

    def __str__(self):
        return f"{self.direccion} ({self.cliente.nombre})"


class IgeoSyncLog(models.Model):
    """Auditoría de publicaciones / resultados PDI iGEO."""

    entity_type = models.CharField(max_length=64, db_index=True)
    comando = models.CharField(max_length=16, blank=True, default="")
    remote_operation_id = models.CharField(max_length=128, blank=True, default="", db_index=True)
    ok = models.BooleanField(default=False)
    dry_run = models.BooleanField(default=True)
    message = models.CharField(max_length=2000, blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    telefono_norm = models.CharField(max_length=15, blank=True, default="")
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="igeo_sync_logs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.entity_type} {self.comando} ok={self.ok}"
