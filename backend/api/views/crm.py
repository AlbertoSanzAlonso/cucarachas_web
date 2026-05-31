from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
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

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer

class ReporteServicioViewSet(viewsets.ModelViewSet):
    queryset = ReporteServicio.objects.all()
    serializer_class = ReporteServicioSerializer
