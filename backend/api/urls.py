from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpeciesViewSet, ClienteViewSet, TratamientoViewSet,
    TecnicoViewSet, UbicacionViewSet, PresupuestoViewSet,
    CitaViewSet, ReporteServicioViewSet, BlogArticleViewSet,
    chat_with_agents,
    AdminConversationViewSet, AdminMemoryNoteViewSet, list_ops_models,
    ops_realtime_session, ops_realtime_tool, ops_realtime_transcript,
    auth_login, auth_logout, auth_me,
    debug_system, geo_search, geo_reverse, ficha_wizard_questions,
    company_public, faq_list,
    agenda_auth_verify, agenda_admin_staff, agenda_admin_staff_detail,
    agenda_admin_services, agenda_admin_service_detail, agenda_admin_categories,
    agenda_schedule_services, agenda_schedule_day, agenda_schedule_slots,
    agenda_appointments_list, agenda_create_appointment, agenda_update_appointment,
    agenda_cancel_appointment, agenda_no_show, agenda_create_block, agenda_update_block,
    agenda_me_services, agenda_me_verify, agenda_public_slots,
)
from .views.presupuestos import (
    create_presupuesto,
    create_presupuesto_pdf,
    delete_presupuesto,
    download_presupuesto_pdf,
    get_presupuesto_detail,
    list_presupuestos,
    send_presupuesto_email_view,
    update_presupuesto,
)
from knowledge.views import TechnicalKnowledgeViewSet

router = DefaultRouter()
router.register(r'species', SpeciesViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'tratamientos', TratamientoViewSet)
router.register(r'tecnicos', TecnicoViewSet)
router.register(r'ubicaciones', UbicacionViewSet)
router.register(r'presupuestos', PresupuestoViewSet)
router.register(r'citas', CitaViewSet)
router.register(r'reportes', ReporteServicioViewSet)
router.register(r'knowledge', TechnicalKnowledgeViewSet)
router.register(r'blog', BlogArticleViewSet, basename='blog')
router.register(r'ops/conversations', AdminConversationViewSet, basename='ops-conversations')
router.register(r'ops/notes', AdminMemoryNoteViewSet, basename='ops-notes')

urlpatterns = [
    path('presupuestos/list/', list_presupuestos, name='presupuestos-list'),
    path('presupuestos/create/', create_presupuesto, name='presupuestos-create'),
    path('presupuestos/create_pdf/', create_presupuesto_pdf, name='presupuestos-create-pdf'),
    path('presupuestos/<int:pk>/update/', update_presupuesto, name='presupuestos-update'),
    path('presupuestos/<int:pk>/delete/', delete_presupuesto, name='presupuestos-delete'),
    path('presupuestos/<int:pk>/send/', send_presupuesto_email_view, name='presupuestos-send'),
    path('presupuestos/<int:pk>/pdf/', download_presupuesto_pdf, name='presupuestos-download-pdf'),
    path('presupuestos/<int:pk>/', get_presupuesto_detail, name='presupuestos-detail'),
    path('', include(router.urls)),
    path('ops/models/', list_ops_models, name='ops-models'),
    path('ops/realtime/session/', ops_realtime_session, name='ops-realtime-session'),
    path('ops/realtime/tool/', ops_realtime_tool, name='ops-realtime-tool'),
    path('ops/realtime/transcript/', ops_realtime_transcript, name='ops-realtime-transcript'),
    path('chat/', chat_with_agents, name='agent-chat'),
    path('geo/search/', geo_search, name='geo-search'),
    path('geo/reverse/', geo_reverse, name='geo-reverse'),
    path('fichas/wizard/', ficha_wizard_questions, name='ficha-wizard'),
    path('company/', company_public, name='company-public'),
    path('faq/', faq_list, name='faq-list'),
    path('auth/login/', auth_login, name='auth-login'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/me/', auth_me, name='auth-me'),
    # Agenda propia (sustituye Cal.com)
    path('agenda/auth/verify', agenda_auth_verify, name='agenda-auth-verify'),
    path('agenda/admin/staff', agenda_admin_staff, name='agenda-admin-staff'),
    path('agenda/admin/staff/<str:staff_id>', agenda_admin_staff_detail, name='agenda-admin-staff-detail'),
    path('agenda/admin/services', agenda_admin_services, name='agenda-admin-services'),
    path('agenda/admin/services/<str:service_id>', agenda_admin_service_detail, name='agenda-admin-service-detail'),
    path('agenda/admin/service-categories', agenda_admin_categories, name='agenda-admin-categories'),
    path('agenda/schedule/day', agenda_schedule_day, name='agenda-schedule-day'),
    path('agenda/schedule/slots', agenda_schedule_slots, name='agenda-schedule-slots'),
    path('agenda/schedule/services', agenda_schedule_services, name='agenda-schedule-services'),
    path('agenda/schedule/appointments', agenda_create_appointment, name='agenda-create-appointment'),
    path('agenda/schedule/appointments/<str:apt_id>', agenda_update_appointment, name='agenda-update-appointment'),
    path('agenda/schedule/blocks', agenda_create_block, name='agenda-create-block'),
    path('agenda/schedule/blocks/<str:block_id>', agenda_update_block, name='agenda-update-block'),
    path('agenda/appointments', agenda_appointments_list, name='agenda-appointments'),
    path('agenda/appointments/<str:apt_id>/cancel', agenda_cancel_appointment, name='agenda-cancel'),
    path('agenda/appointments/<str:apt_id>/no-show', agenda_no_show, name='agenda-no-show'),
    path('agenda/me/services', agenda_me_services, name='agenda-me-services'),
    path('agenda/me/verify', agenda_me_verify, name='agenda-me-verify'),
    path('agenda/slots/', agenda_public_slots, name='agenda-public-slots'),
    path('debug/', debug_system, name='debug-system'),
]
