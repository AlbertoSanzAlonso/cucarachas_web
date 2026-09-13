from django.contrib import admin

from knowledge.models import TechnicalKnowledge


@admin.register(TechnicalKnowledge)
class TechnicalKnowledgeAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "source_key", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "content", "source_key", "source")
    readonly_fields = ("created_at", "updated_at")
