from django.db.models import Count, Max
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..crm_status import set_manual_crm_status, unlock_crm_status
from ..models import (
    Species, Cliente, Tratamiento, Tecnico,
    Ubicacion, Presupuesto, Cita, ReporteServicio
)
from ..serializers import (
    SpeciesSerializer, ClienteSerializer, TratamientoSerializer,
    TecnicoSerializer, UbicacionSerializer, PresupuestoSerializer,
    CitaSerializer, ReporteServicioSerializer
)


class SpeciesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    lookup_field = 'slug'


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Cliente.objects.annotate(
            appointments_count=Count("agenda_appointments"),
            last_appointment_at=Max("agenda_appointments__created_at"),
        ).order_by("-created_at")
        crm_status = (self.request.query_params.get("crm_status") or "").strip().lower()
        valid = {c.value for c in Cliente.CrmStatus}
        if crm_status in valid:
            qs = qs.filter(crm_status=crm_status)
        return qs

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        data = request.data

        crm_status = data.get("crm_status") if hasattr(data, "get") else None
        if crm_status is not None and crm_status != instance.crm_status:
            try:
                set_manual_crm_status(instance, crm_status)
            except ValueError as exc:
                return Response(
                    {"crm_status": [str(exc)]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            instance.refresh_from_db()

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        # crm_status already applied with lock; ignore in serializer update
        self.perform_update(serializer)
        return Response(self.get_serializer(self.get_object()).data)

    @action(detail=True, methods=["post"], url_path="unlock-status")
    def unlock_status(self, request, pk=None):
        instance = self.get_object()
        unlock_crm_status(instance)
        instance.refresh_from_db()
        return Response(self.get_serializer(instance).data)


class TratamientoViewSet(viewsets.ModelViewSet):
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer


class TecnicoViewSet(viewsets.ModelViewSet):
    queryset = Tecnico.objects.all()
    serializer_class = TecnicoSerializer


class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer


class PresupuestoViewSet(viewsets.ModelViewSet):
    queryset = Presupuesto.objects.all()
    serializer_class = PresupuestoSerializer
    permission_classes = [IsAuthenticated]


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer


class ReporteServicioViewSet(viewsets.ModelViewSet):
    queryset = ReporteServicio.objects.all()
    serializer_class = ReporteServicioSerializer
