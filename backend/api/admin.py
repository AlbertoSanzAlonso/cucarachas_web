from django.contrib import admin

from .models import (
    FichaServicio,
    Presupuesto,
    PresupuestoDetalle,
    PresupuestoReferencia,
    Species,
    Tratamiento,
)


class PresupuestoDetalleInline(admin.TabularInline):
    model = PresupuestoDetalle
    extra = 1
    fields = ("concepto", "tratamiento", "precio_unitario", "cantidad")


@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tratamiento)
class TratamientoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio_base")
    search_fields = ("nombre",)


@admin.register(Presupuesto)
class PresupuestoAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "total_monto", "estado", "pest_type", "created_at")
    list_filter = ("estado", "pest_type", "severity")
    inlines = [PresupuestoDetalleInline]
    search_fields = ("cliente__nombre", "ubicacion__ciudad")


@admin.register(PresupuestoReferencia)
class PresupuestoReferenciaAdmin(admin.ModelAdmin):
    list_display = (
        "codigo",
        "total_monto",
        "city",
        "pest_type",
        "property_type",
        "severity",
        "source",
        "created_at",
    )
    list_filter = ("source", "pest_type", "property_type", "severity")
    search_fields = ("codigo", "city", "notes", "pest_type")
    readonly_fields = ("presupuesto", "created_at", "updated_at")


@admin.register(FichaServicio)
class FichaServicioAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre_comercial", "pest_type", "prioridad_default", "activa", "updated_at")
    list_filter = ("activa", "pest_type", "prioridad_default", "riesgo")
    search_fields = ("codigo", "nombre_comercial")
    readonly_fields = ("created_at", "updated_at")
