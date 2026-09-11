"""FAQ pública editable (sin precios fijos hardcodeados en i18n)."""

from __future__ import annotations

from typing import ClassVar

from django.db import models
from django.db.models import Manager


class FaqItem(models.Model):
    """Pregunta frecuente multilingüe para /faq y agentes."""

    objects: ClassVar[Manager]

    class Category(models.TextChoices):
        SEGURETAT = "seguretat", "Seguretat"
        TECNIC = "tecnic", "Tècnic"
        PREUS = "preus", "Preus"
        GARANTIA = "garantia", "Garantia"

    slug = models.SlugField(max_length=80, unique=True)
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.TECNIC,
    )
    sort_order = models.PositiveSmallIntegerField(default=100)
    is_published = models.BooleanField(default=True)

    question_ca = models.CharField(max_length=300)
    question_es = models.CharField(max_length=300)
    question_en = models.CharField(max_length=300, blank=True)

    answer_ca = models.TextField()
    answer_es = models.TextField()
    answer_en = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self) -> str:
        return self.question_ca[:80]

    def as_localized(self, lang: str = "ca") -> dict:
        lang = (lang or "ca").lower()[:2]
        if lang == "es":
            q, a = self.question_es, self.answer_es
        elif lang == "en":
            q = self.question_en or self.question_es or self.question_ca
            a = self.answer_en or self.answer_es or self.answer_ca
        else:
            q, a = self.question_ca, self.answer_ca
        return {
            "id": self.slug,
            "category": self.category,
            "question": q,
            "answer": a,
        }
