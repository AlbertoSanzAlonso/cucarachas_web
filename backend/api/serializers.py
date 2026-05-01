from rest_framework import serializers
from .models import (
    Species, Cliente, Tratamiento, Tecnico, 
    Ubicacion, Presupuesto, PresupuestoDetalle, 
    Cita, ReporteServicio
)

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = '__all__'

class TecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tecnico
        fields = '__all__'

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'

class PresupuestoDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresupuestoDetalle
        fields = '__all__'

class PresupuestoSerializer(serializers.ModelSerializer):
    detalles = PresupuestoDetalleSerializer(many=True, read_only=True)
    class Meta:
        model = Presupuesto
        fields = '__all__'

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'

class ReporteServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteServicio
        fields = '__all__'
