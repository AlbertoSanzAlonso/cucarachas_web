from django.db import models
from pgvector.django import VectorField


class TechnicalKnowledge(models.Model):
    """
    Base de datos de conocimiento técnico para RAG.
    Almacena fragmentos de protocolos, manuales, blog, FAQ y catálogo.
    """

    class Category:
        GENERAL = "general"
        COMERCIAL = "comercial"
        BLOG = "blog"
        FAQ = "faq"
        COMPANY = "company"
        SPECIES = "species"
        TRATAMIENTO = "tratamiento"
        FICHA = "ficha"
        PRESUPUESTO_REF = "presupuesto_ref"

    title = models.CharField(max_length=255)
    content = models.TextField()
    source = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, default=Category.GENERAL)
    # Clave estable para upsert/delete desde contenido dinámico (ej. blog:mi-slug)
    source_key = models.CharField(
        max_length=180,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text="Identificador estable: blog:slug, faq:slug, ficha:codigo, …",
    )

    # Embedding de 3072 dimensiones (para Gemini gemini-embedding-001)
    embedding = VectorField(dimensions=3072)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Coneixement Tècnic"
        verbose_name_plural = "Base de Coneixement"

    def __str__(self):
        return self.title
