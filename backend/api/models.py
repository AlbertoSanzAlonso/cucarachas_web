from typing import ClassVar

from django.db import models
from django.db.models import Manager

# 1. Tablas de Base (Maestros)

class Species(models.Model):
    """Technical information about cockroach species for the frontend."""
    objects: ClassVar[Manager]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    details = models.JSONField(default=list) # List of strings
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Cliente(models.Model):
    """Legal entity or person receiving the service."""
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Tratamiento(models.Model):
    """Catalog of pest control services."""
    objects: ClassVar[Manager]

    nombre = models.CharField(max_length=200) # Ej: Desratització
    descripcion = models.TextField()
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Tecnico(models.Model):
    """Operational personnel."""
    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20)
    licencia_sanitaria = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

# 2. Tablas de Ubicación y Ventas (Presupuestos)

class Ubicacion(models.Model):
    """Service points for a client."""
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='ubicaciones')
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    coordenadas_gps = models.CharField(max_length=100, blank=True, null=True)
    tipo_propiedad = models.CharField(max_length=100) # Ej: Residencial, Comercial

    def __str__(self):
        return f"{self.direccion} ({self.cliente.nombre})"

class Presupuesto(models.Model):
    """Sales quotes before appointment."""
    id: int

    class Estado(models.TextChoices):
        BORRADOR = 'borrador', 'Borrador'
        ENVIADO = 'enviado', 'Enviado'
        ACEPTADO = 'aceptado', 'Aceptado'
        RECHAZADO = 'rechazado', 'Rechazado'

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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Presupuesto {self.id} - {self.cliente.nombre}"

class PresupuestoDetalle(models.Model):
    """Individual items in a budget."""
    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name='detalles')
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
        MANUAL = "manual", "Manual"
        CRM = "crm", "Presupuesto CRM"

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
        help_text='[{"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 220}, …]',
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


# 3. Tablas de Operación (Agenda y Resultados)

class Cita(models.Model):
    """Execution of work (Appointment)."""
    id: int

    class Estado(models.TextChoices):
        PROGRAMADA = 'programada', 'Programada'
        EN_PROGRESO = 'en_progreso', 'En Progreso'
        COMPLETADA = 'completada', 'Completada'
        CANCELADA = 'cancelada', 'Cancelada'

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
    tecnico = models.ForeignKey(Tecnico, on_delete=models.CASCADE)
    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PROGRAMADA)

    def __str__(self):
        return f"Cita {self.id} - {self.fecha_inicio.date()}"

class ReporteServicio(models.Model):
    """Legal document generated after completion."""
    cita = models.OneToOneField(Cita, on_delete=models.CASCADE, related_name='reporte')
    hallazgos_tecnicos = models.TextField()
    recomendaciones = models.TextField()
    firma_cliente_url = models.URLField(blank=True, null=True)
    proxima_visita_sugerida = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte Cita {self.cita.id}"
