"""Contenido público: blog / artículos."""

from typing import ClassVar

from django.db import models
from django.db.models import Manager
from django.utils.text import slugify


class BlogArticle(models.Model):
    """Artículo del blog público CECSA."""

    objects: ClassVar[Manager]

    class Category(models.TextChoices):
        PREVENCION = "prevencion", "Prevención"
        TECNICO = "tecnico", "Técnico"
        CURIOSIDADES = "curiosidades", "Curiosidades"
        SALUD = "salud", "Salut Ambiental"

    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True, blank=True)
    excerpt = models.TextField(help_text="Resumen corto para la tarjeta del listado")
    body = models.TextField(help_text="Cuerpo del artículo en Markdown")
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.PREVENCION,
    )
    author = models.CharField(max_length=120, default="Equipo Técnico CECSA")
    image = models.CharField(
        max_length=400,
        blank=True,
        default="/assets/cockroach-focus.webp",
        help_text="Ruta pública (ej. /assets/…) o URL absoluta",
    )
    read_time_minutes = models.PositiveSmallIntegerField(default=5)
    published_at = models.DateField(null=True, blank=True)
    is_published = models.BooleanField(default=True)
    meta_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-id"]
        verbose_name = "Artículo de blog"
        verbose_name_plural = "Artículos de blog"

    def __str__(self) -> str:
        return str(self.title)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or "article"
            slug = base
            n = 2
            while BlogArticle.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        if not self.meta_description:
            self.meta_description = (self.excerpt or "")[:320]
        super().save(*args, **kwargs)
