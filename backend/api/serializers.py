from rest_framework import serializers
from .models import (
    Species, Cliente, Tratamiento, Tecnico,
    Ubicacion, Presupuesto, PresupuestoDetalle,
    Cita, ReporteServicio,
)
from .phone_utils import normalize_phone, upsert_cliente_by_phone

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Cliente
        fields = [
            "id",
            "nombre",
            "name",
            "email",
            "telefono",
            "phone",
            "telefono_norm",
            "documento_fiscal",
            "created_at",
        ]
        read_only_fields = ["id", "telefono_norm", "created_at"]

    def _map_aliases(self, attrs: dict) -> dict:
        data = dict(attrs)
        name = data.pop("name", None)
        if name and not data.get("nombre"):
            data["nombre"] = name
        phone = data.pop("phone", None)
        if phone and not data.get("telefono"):
            data["telefono"] = phone
        return data

    def validate(self, attrs):
        data = self._map_aliases(attrs)
        telefono = (data.get("telefono") or "").strip()
        if self.instance is None and not normalize_phone(telefono):
            raise serializers.ValidationError(
                {"telefono": "El telèfon és obligatori per identificar el lead."}
            )
        return data

    def create(self, validated_data):
        data = self._map_aliases(validated_data)
        telefono = data["telefono"]
        try:
            cliente, _ = upsert_cliente_by_phone(
                telefono=telefono,
                nombre=data.get("nombre") or "Sense nom",
                email=data.get("email") or "",
                documento_fiscal=data.get("documento_fiscal"),
            )
        except ValueError as exc:
            raise serializers.ValidationError({"telefono": str(exc)}) from exc
        return cliente

    def update(self, instance, validated_data):
        data = self._map_aliases(validated_data)
        telefono = data.get("telefono")
        if telefono is not None:
            norm = normalize_phone(telefono)
            if not norm:
                raise serializers.ValidationError(
                    {"telefono": "El telèfon és obligatori per identificar el lead."}
                )
            if norm != instance.telefono_norm:
                if Cliente.objects.filter(telefono_norm=norm).exclude(pk=instance.pk).exists():
                    raise serializers.ValidationError(
                        {"telefono": "Ja existeix un lead amb aquest telèfon."}
                    )
                instance.telefono_norm = norm
            instance.telefono = telefono.strip() or norm
        if "nombre" in data:
            instance.nombre = data["nombre"]
        if "email" in data:
            instance.email = data["email"] or ""
        if "documento_fiscal" in data and data["documento_fiscal"]:
            instance.documento_fiscal = data["documento_fiscal"]
        instance.save()
        return instance

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
    line_label = serializers.SerializerMethodField()

    class Meta:
        model = PresupuestoDetalle
        fields = '__all__'

    def get_line_label(self, obj):
        return obj.line_label

class PresupuestoSerializer(serializers.ModelSerializer):
    detalles = PresupuestoDetalleSerializer(many=True, read_only=True)

    class Meta:
        model = Presupuesto
        fields = [
            "id",
            "cliente",
            "ubicacion",
            "estado",
            "total_monto",
            "validez_hasta",
            "pest_type",
            "severity",
            "garantia_meses",
            "notas",
            "created_at",
            "detalles",
        ]

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'

class ReporteServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteServicio
        fields = '__all__'
