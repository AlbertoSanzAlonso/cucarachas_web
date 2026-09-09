from .auth import auth_login, auth_logout, auth_me
from .blog import BlogArticleViewSet
from .crm import (
    SpeciesViewSet, ClienteViewSet, TratamientoViewSet,
    TecnicoViewSet, UbicacionViewSet, PresupuestoViewSet,
    CitaViewSet, ReporteServicioViewSet
)
from .agents import chat_with_agents
from .debug import debug_system
from .geo import geo_search, geo_reverse
from .fichas import ficha_wizard_questions
from .agenda import (
    agenda_auth_verify,
    agenda_admin_staff,
    agenda_admin_staff_detail,
    agenda_admin_services,
    agenda_admin_service_detail,
    agenda_admin_categories,
    agenda_schedule_services,
    agenda_schedule_day,
    agenda_schedule_slots,
    agenda_appointments_list,
    agenda_create_appointment,
    agenda_update_appointment,
    agenda_cancel_appointment,
    agenda_no_show,
    agenda_create_block,
    agenda_update_block,
    agenda_me_services,
    agenda_me_verify,
    agenda_public_slots,
)
