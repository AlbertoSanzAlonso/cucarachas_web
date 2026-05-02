from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpeciesViewSet, ClienteViewSet, TratamientoViewSet, 
    TecnicoViewSet, UbicacionViewSet, PresupuestoViewSet, 
    CitaViewSet, ReporteServicioViewSet, chat_with_agents, cal_webhook, get_cal_slots
)

router = DefaultRouter()
router.register(r'species', SpeciesViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'tratamientos', TratamientoViewSet)
router.register(r'tecnicos', TecnicoViewSet)
router.register(r'ubicaciones', UbicacionViewSet)
router.register(r'presupuestos', PresupuestoViewSet)
router.register(r'citas', CitaViewSet)
router.register(r'reportes', ReporteServicioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', chat_with_agents, name='agent-chat'),
    path('webhooks/cal/', cal_webhook, name='cal-webhook'),
    path('cal/slots/', get_cal_slots, name='cal-slots'),
]
