from datetime import datetime

from rest_framework import serializers

from api.models import Presupuesto, PresupuestoDetalle


class PresupuestoLineaInputSerializer(serializers.Serializer):
    concepto = serializers.CharField(max_length=300)
    descripcion = serializers.CharField(required=False, allow_blank=True, default="")
    precio = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    cantidad = serializers.IntegerField(min_value=1, default=1, required=False)


class CreatePresupuestoSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    lineas = PresupuestoLineaInputSerializer(many=True, min_length=1)
    direccion = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    ciudad = serializers.CharField(max_length=100, required=False, allow_blank=True, default="Barcelona")
    tipo_propiedad = serializers.CharField(max_length=100, required=False, allow_blank=True, default="Residencial")
    fecha = serializers.DateField(required=False)
    validez_dias = serializers.IntegerField(min_value=1, max_value=365, default=30)
    pest_type = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    severity = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")
    garantia_meses = serializers.IntegerField(min_value=0, max_value=120, default=12)
    notas = serializers.CharField(required=False, allow_blank=True, default="")


class PresupuestoDetalleSerializer(serializers.ModelSerializer):
    line_label = serializers.CharField(read_only=True)

    class Meta:
        model = PresupuestoDetalle
        fields = ["id", "concepto", "descripcion", "tratamiento", "precio_unitario", "cantidad", "line_label"]


class PresupuestoListSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    ciudad = serializers.CharField(source="ubicacion.ciudad", read_only=True)

    class Meta:
        model = Presupuesto
        fields = [
            "id",
            "cliente",
            "cliente_nombre",
            "ciudad",
            "estado",
            "total_monto",
            "validez_hasta",
            "garantia_meses",
            "created_at",
        ]
