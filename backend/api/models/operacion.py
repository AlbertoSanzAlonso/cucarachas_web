"""Operación legacy: citas de trabajo y reportes de servicio."""

from django.db import models

from .catalog import Tecnico
from .crm import Cliente, Ubicacion
from .presupuesto import Presupuesto


class Cita(models.Model):
    """Execution of work (Appointment)."""

    id: int

    class Estado(models.TextChoices):
        PROGRAMADA = "programada"
        EN_PROGRESO = "en_progreso"
        COMPLETADA = "completada"
        CANCELADA = "cancelada"

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

    cita = models.OneToOneField(Cita, on_delete=models.CASCADE, related_name="reporte")
    hallazgos_tecnicos = models.TextField()
    recomendaciones = models.TextField()
    firma_cliente_url = models.URLField(blank=True, null=True)
    proxima_visita_sugerida = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte Cita {self.cita.id}"
