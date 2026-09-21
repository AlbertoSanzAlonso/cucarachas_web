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
from .company import CompanyProfile
from .content import BlogArticle
from .crm import Cliente, IgeoSyncLog, Ubicacion
from .faq import FaqItem
from .igeo import IgeoMirrorEntity
from .operacion import Cita, ReporteServicio
from .ops_chat import AdminConversation, AdminMemoryNote, AdminMessage, OpsJob
from .presupuesto import Presupuesto, PresupuestoDetalle, PresupuestoReferencia

__all__ = [
    "CompanyProfile",
    "Species",
    "Tratamiento",
    "Tecnico",
    "FichaServicio",
    "BlogArticle",
    "FaqItem",
    "Cliente",
    "IgeoSyncLog",
    "IgeoMirrorEntity",
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
    "AdminConversation",
    "AdminMessage",
    "AdminMemoryNote",
    "OpsJob",
]
