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


class UpdatePresupuestoSerializer(serializers.Serializer):
    lineas = PresupuestoLineaInputSerializer(many=True, min_length=1)
    validez_dias = serializers.IntegerField(min_value=1, max_value=365, required=False)
    garantia_meses = serializers.IntegerField(min_value=0, max_value=120, required=False)
    notas = serializers.CharField(required=False, allow_blank=True)
    estado = serializers.ChoiceField(
        choices=[c[0] for c in Presupuesto.Estado.choices],
        required=False,
    )
    direccion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    ciudad = serializers.CharField(max_length=100, required=False, allow_blank=True)
    tipo_propiedad = serializers.CharField(max_length=100, required=False, allow_blank=True)


class SendPresupuestoEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    body = serializers.CharField(required=False, allow_blank=True, default="")


class PresupuestoDetalleSerializer(serializers.ModelSerializer):
    line_label = serializers.CharField(read_only=True)

    class Meta:
        model = PresupuestoDetalle
        fields = ["id", "concepto", "descripcion", "tratamiento", "precio_unitario", "cantidad", "line_label"]


class PresupuestoListSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    cliente_email = serializers.EmailField(source="cliente.email", read_only=True)
    cliente_telefono = serializers.CharField(source="cliente.telefono", read_only=True)
    ciudad = serializers.CharField(source="ubicacion.ciudad", read_only=True)
    direccion = serializers.CharField(source="ubicacion.direccion", read_only=True)

    class Meta:
        model = Presupuesto
        fields = [
            "id",
            "cliente",
            "cliente_nombre",
            "cliente_email",
            "cliente_telefono",
            "ciudad",
            "direccion",
            "estado",
            "origen",
            "total_monto",
            "validez_hasta",
            "garantia_meses",
            "pest_type",
            "severity",
            "notas",
            "created_at",
        ]


class PresupuestoDetailSerializer(PresupuestoListSerializer):
    detalles = PresupuestoDetalleSerializer(many=True, read_only=True)
    tipo_propiedad = serializers.CharField(source="ubicacion.tipo_propiedad", read_only=True)

    class Meta(PresupuestoListSerializer.Meta):
        fields = PresupuestoListSerializer.Meta.fields + ["detalles", "tipo_propiedad"]
