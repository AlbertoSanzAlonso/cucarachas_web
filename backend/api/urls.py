from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpeciesViewSet, ClienteViewSet, TratamientoViewSet, 
    TecnicoViewSet, UbicacionViewSet, PresupuestoViewSet, 
    CitaViewSet, ReporteServicioViewSet, chat_with_agents, cal_webhook, get_cal_slots,
    auth_login, auth_logout, auth_me, get_cal_bookings, cancel_cal_booking, update_cal_booking_view,
    debug_system, geo_search, geo_reverse, ficha_wizard_questions,
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
    path('chat/', chat_with_agents, name='agent-chat'),
    path('webhooks/cal/', cal_webhook, name='cal-webhook'),
    path('cal/slots/', get_cal_slots, name='cal-slots'),
    path('geo/search/', geo_search, name='geo-search'),
    path('geo/reverse/', geo_reverse, name='geo-reverse'),
    path('fichas/wizard/', ficha_wizard_questions, name='ficha-wizard'),
    path('auth/login/', auth_login, name='auth-login'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/me/', auth_me, name='auth-me'),
    path('cal/bookings/', get_cal_bookings, name='cal-bookings'),
    path('cal/bookings/<str:booking_uid>/cancel/', cancel_cal_booking, name='cal-cancel-booking'),
    path('cal/bookings/<str:booking_uid>/', update_cal_booking_view, name='cal-update-booking'),
    path('debug/', debug_system, name='debug-system'),
]
