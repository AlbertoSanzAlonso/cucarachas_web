from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpeciesViewSet, ClienteViewSet, TratamientoViewSet, 
    TecnicoViewSet, UbicacionViewSet, PresupuestoViewSet, 
    CitaViewSet, ReporteServicioViewSet, chat_with_agents, cal_webhook, get_cal_slots,
    auth_login, auth_logout, auth_me, get_cal_bookings, cancel_cal_booking
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
    path('', include(router.urls)),
    path('chat/', chat_with_agents, name='agent-chat'),
    path('webhooks/cal/', cal_webhook, name='cal-webhook'),
    path('cal/slots/', get_cal_slots, name='cal-slots'),
    path('auth/login/', auth_login, name='auth-login'),
    path('auth/logout/', auth_logout, name='auth-logout'),
    path('auth/me/', auth_me, name='auth-me'),
    path('cal/bookings/', get_cal_bookings, name='cal-bookings'),
    path('cal/bookings/<int:booking_id>/cancel/', cancel_cal_booking, name='cal-cancel-booking'),
]
