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
