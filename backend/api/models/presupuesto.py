"""Presupuestos CRM y referencias históricas para el agente pricer."""

from typing import ClassVar

from django.db import models
from django.db.models import Manager

from .catalog import Tratamiento
from .crm import Cliente, Ubicacion


class Presupuesto(models.Model):
    """Sales quotes before appointment."""

    id: int

    class Estado(models.TextChoices):
        BORRADOR = "borrador"
        ENVIADO = "enviado"
        ACEPTADO = "aceptado"
        RECHAZADO = "rechazado"

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.BORRADOR)
    total_monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    validez_hasta = models.DateField()
    # Clasificación opcional para el agente presupuestador (mejora el emparejado histórico)
    pest_type = models.CharField(max_length=50, blank=True, default="")
    severity = models.CharField(max_length=20, blank=True, default="")
    garantia_meses = models.PositiveIntegerField(default=12)
    notas = models.TextField(blank=True, default="")
    origen = models.CharField(
        max_length=20,
        choices=[("admin", "Admin"), ("agent", "Agent")],
        default="admin",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Presupuesto {self.id} - {self.cliente.nombre}"


class PresupuestoDetalle(models.Model):
    """Individual items in a budget."""

    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name="detalles")
    tratamiento = models.ForeignKey(Tratamiento, on_delete=models.PROTECT, null=True, blank=True)
    concepto = models.CharField(max_length=300, blank=True, default="")
    descripcion = models.TextField(blank=True, default="")
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.PositiveIntegerField(default=1)

    @property
    def line_label(self) -> str:
        if self.concepto.strip():
            return self.concepto.strip()
        if self.tratamiento_id:
            return self.tratamiento.nombre
        return "Concepte"

    def __str__(self):
        return f"{self.line_label} x {self.cantidad}"


class PresupuestoReferencia(models.Model):
    """
    Casos históricos de presupuesto para el agente pricer.
    Se alimenta automáticamente desde Presupuesto (CRM) o entrada manual en admin.
    """

    objects: ClassVar[Manager]

    class Source(models.TextChoices):
        MANUAL = "manual"
        CRM = "crm", "Presupuesto CRM"  # type: ignore[assignment]

    pest_type = models.CharField(max_length=50, blank=True, default="")
    severity = models.CharField(max_length=20, blank=True, default="")
    property_type = models.CharField(max_length=20, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    zone_detail = models.CharField(max_length=100, blank=True, default="")
    total_monto = models.DecimalField(max_digits=12, decimal_places=2)
    breakdown = models.JSONField(default=list)
    garantia_meses = models.PositiveIntegerField(default=12)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.MANUAL)
    presupuesto = models.OneToOneField(
        Presupuesto,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="referencia_agent",
    )
    notes = models.TextField(blank=True, default="")
    codigo = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        unique=True,
        help_text="Código del modelo de referencia (ej. 11675P)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Presupuesto de referencia"
        verbose_name_plural = "Presupuestos de referencia"
        ordering = ["-created_at"]

    def __str__(self):
        label = self.city or "sense ciutat"
        return f"Ref {self.total_monto}€ — {label} ({self.get_source_display()})"
