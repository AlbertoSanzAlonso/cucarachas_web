from django.contrib import admin

from .models import (
    BlogArticle,
    CompanyProfile,
    FaqItem,
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


@admin.register(BlogArticle)
class BlogArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published", "published_at", "author")
    list_filter = ("category", "is_published")
    search_fields = ("title", "excerpt", "slug")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    """Singleton: editar teléfono, cobertura, horarios y notas del recepcionista."""

    list_display = ("brand_name", "phone", "whatsapp", "email", "updated_at")
    readonly_fields = ("updated_at",)
    fieldsets = (
        (
            "Identidad",
            {
                "fields": (
                    "brand_name",
                    "legal_name",
                    "phone",
                    "whatsapp",
                    "email",
                    "address",
                )
            },
        ),
        (
            "Web (hero)",
            {
                "fields": (
                    "hero_title_es",
                    "hero_title_ca",
                    "hero_subtitle_es",
                    "hero_subtitle_ca",
                )
            },
        ),
        (
            "Cobertura y políticas",
            {
                "fields": (
                    "service_area_es",
                    "service_area_ca",
                    "business_hours_es",
                    "business_hours_ca",
                    "policies_es",
                    "policies_ca",
                )
            },
        ),
        (
            "Política comercial (agentes)",
            {
                "fields": ("commercial_policy_es", "commercial_policy_ca"),
                "description": "Sin costes internos, salarios ni márgenes.",
            },
        ),
        (
            "Listas de lugares (opcional)",
            {
                "classes": ("collapse",),
                "fields": ("coverage_places", "outside_places"),
                "description": "Vacío = defaults internos (Catalunya / fuera). Minúsculas, substrings.",
            },
        ),
        (
            "Notas para el agente",
            {"fields": ("agent_notes_es", "agent_notes_ca", "updated_at")},
        ),
    )

    def has_add_permission(self, request):
        return not CompanyProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FaqItem)
class FaqItemAdmin(admin.ModelAdmin):
    list_display = ("slug", "category", "sort_order", "is_published", "question_ca")
    list_filter = ("category", "is_published")
    search_fields = ("slug", "question_ca", "question_es")
    prepopulated_fields = {"slug": ("question_ca",)}
    readonly_fields = ("created_at", "updated_at")
    ordering = ("sort_order", "id")
