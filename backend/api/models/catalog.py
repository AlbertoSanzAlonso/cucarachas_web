"""Catálogo maestro: especies, tratamientos, técnicos y fichas de servicio."""

from typing import ClassVar

from django.db import models
from django.db.models import Manager


class Species(models.Model):
    """Technical information about cockroach species for the frontend."""

    objects: ClassVar[Manager]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    details = models.JSONField(default=list)  # List of strings
    image_url = models.URLField(blank=True, null=True)

    def __str__(self) -> str:
        return str(self.name)


class Tratamiento(models.Model):
    """Catalog of pest control services."""

    objects: ClassVar[Manager]

    nombre = models.CharField(max_length=200)  # Ej: Desratització
    descripcion = models.TextField()
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self) -> str:
        return str(self.nombre)


class Tecnico(models.Model):
    """Operational personnel."""

    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20)
    licencia_sanitaria = models.CharField(max_length=100)

    def __str__(self) -> str:
        return str(self.nombre)


class FichaServicio(models.Model):
    """
    Ficha maestra de conocimiento operativo para el Bio-Assistent.
    Reglas de diagnóstico, presupuesto, bloqueos y copy comercial por servicio.
    """

    objects: ClassVar[Manager]

    codigo = models.CharField(max_length=30, unique=True, help_text="Ej: CUC-GER-PISO")
    nombre_comercial = models.CharField(max_length=200)
    pest_type = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Valor PestType del agente (german_cockroach, american_cockroach, …)",
    )
    activa = models.BooleanField(default=True)

    tipos_cliente = models.JSONField(default=list, help_text='["particular", "restaurante", …]')
    lugares = models.JSONField(default=list, help_text='["cocina", "bano", …]')
    preguntas_obligatorias = models.JSONField(
        default=dict,
        help_text='Por tipo cliente: {"particular": ["codigo_postal", "metros_cuadrados", …]}',
    )
    reglas_diagnostico = models.JSONField(
        default=list,
        help_text='[{"keywords": ["noche"], "severity": "low"}, …]',
    )
    prioridad_default = models.CharField(max_length=20, default="media")
    sistema_recomendado = models.JSONField(
        default=dict,
        help_text='{"recomendar": ["gel", "trampas"], "no_recomendar": ["pulverizar"]}',
    )
    tiempo_medio = models.JSONField(default=dict, help_text='{"visita_1": 45, "visita_2": 30}')
    material_medio = models.JSONField(default=list)
    riesgo = models.CharField(max_length=20, default="medio")
    dificultad = models.PositiveSmallIntegerField(default=3)
    coste_interno = models.JSONField(
        default=dict,
        help_text='{"tiempo_tecnico": 52, "material": 18, "desplazamiento": 12}',
    )
    reglas_comerciales = models.JSONField(
        default=list,
        help_text='[{"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 240}, …]',
    )
    bloqueos_presupuesto = models.JSONField(default=list)
    copy_comercial = models.JSONField(default=dict, help_text='{"ca": "…", "es": "…"}')
    objeciones = models.JSONField(
        default=list,
        help_text='[{"trigger": "solo una visita", "respuesta_ca": "…", "respuesta_es": "…"}]',
    )
    venta_cruzada = models.JSONField(default=list)
    seguimiento = models.JSONField(
        default=dict,
        help_text='{"24h": "whatsapp", "7d": "email", "30d": "email"}',
    )
    garantia_meses = models.PositiveIntegerField(default=12)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ficha de servicio"
        verbose_name_plural = "Fichas de servicio"
        ordering = ["codigo"]

    def __str__(self):
        return f"{self.codigo} — {self.nombre_comercial}"
