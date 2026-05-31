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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Presupuesto {self.id} - {self.cliente.nombre}"

class PresupuestoDetalle(models.Model):
    """Individual items in a budget."""
    presupuesto = models.ForeignKey(Presupuesto, on_delete=models.CASCADE, related_name='detalles')
    tratamiento = models.ForeignKey(Tratamiento, on_delete=models.PROTECT)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.tratamiento.nombre} x {self.cantidad}"

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
