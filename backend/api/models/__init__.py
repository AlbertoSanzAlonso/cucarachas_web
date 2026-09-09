"""
Modelos Django de la app `api`.

Factorizados por dominio; los imports públicos siguen siendo
`from api.models import Cliente`, etc.
"""

from .agenda import (
    AgendaAppointment,
    AgendaSalonHours,
    AgendaService,
    AgendaStaff,
    AgendaStaffAvailability,
    AgendaTimeBlock,
)
from .catalog import FichaServicio, Species, Tecnico, Tratamiento
from .content import BlogArticle
from .crm import Cliente, Ubicacion
from .operacion import Cita, ReporteServicio
from .presupuesto import Presupuesto, PresupuestoDetalle, PresupuestoReferencia

__all__ = [
    "Species",
    "Tratamiento",
    "Tecnico",
    "FichaServicio",
    "BlogArticle",
    "Cliente",
    "Ubicacion",
    "Presupuesto",
    "PresupuestoDetalle",
    "PresupuestoReferencia",
    "Cita",
    "ReporteServicio",
    "AgendaService",
    "AgendaStaff",
    "AgendaSalonHours",
    "AgendaStaffAvailability",
    "AgendaTimeBlock",
    "AgendaAppointment",
]
