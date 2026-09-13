"""Perfil de empresa / conocimiento para agentes (editable en admin)."""

from __future__ import annotations

from typing import ClassVar

from django.db import models
from django.db.models import Manager


class CompanyProfile(models.Model):
    """Singleton (pk=1): datos que el recepcionista debe conocer y pueden cambiar."""

    objects: ClassVar[Manager]

    brand_name = models.CharField(max_length=120, default="CECSA Control de Plagas")
    legal_name = models.CharField(
        max_length=200,
        blank=True,
        default="Desinfecciones CECSA, S.L.",
    )
    phone = models.CharField(max_length=40, default="933 309 169")
    whatsapp = models.CharField(max_length=40, blank=True, default="681 033 305")
    email = models.EmailField(blank=True, default="info@cecsaddd.com")
    address = models.CharField(
        max_length=240,
        blank=True,
        default="C/ Dels Rajolers, 16, 08028 Barcelona",
    )
    hero_title_es = models.CharField(
        max_length=200,
        blank=True,
        default="Eliminación profesional de cucarachas en Barcelona",
    )
    hero_title_ca = models.CharField(
        max_length=200,
        blank=True,
        default="Eliminació professional de paneroles a Barcelona",
    )
    hero_subtitle_es = models.TextField(
        blank=True,
        default=(
            "Tratamiento adaptado a viviendas, locales y comunidades, con diagnóstico, "
            "dos actuaciones en los casos habituales y garantía de solución según condiciones."
        ),
    )
    hero_subtitle_ca = models.TextField(
        blank=True,
        default=(
            "Tractament adaptat a habitatges, locals i comunitats, amb diagnòstic, "
            "dues actuacions en els casos habituals i garantia de solució segons condicions."
        ),
    )
    commercial_policy_es = models.TextField(
        blank=True,
        default="",
        help_text="Política comercial pública para agentes (sin costes internos ni márgenes).",
    )
    commercial_policy_ca = models.TextField(
        blank=True,
        default="",
        help_text="Política comercial pública per a agents (sense costos interns ni marges).",
    )
    service_area_es = models.TextField(
        default=(
            "Servicio solo en Barcelona y toda Catalunya "
            "(provincias de Barcelona, Girona, Tarragona y Lleida). "
            "No nos desplazamos fuera de Catalunya."
        ),
    )
    service_area_ca = models.TextField(
        default=(
            "Servei només a Barcelona i tota Catalunya "
            "(províncies de Barcelona, Girona, Tarragona i Lleida). "
            "No ens desplacem fora de Catalunya."
        ),
    )
    business_hours_es = models.CharField(
        max_length=200,
        blank=True,
        default="Lun - Vie, 9:00 - 20:00h",
    )
    business_hours_ca = models.CharField(
        max_length=200,
        blank=True,
        default="Dl - Dv, 9:00 - 20:00h",
    )
    policies_es = models.TextField(
        blank=True,
        default=(
            "Empresa familiar ética y consciente con más de 20 años de experiencia. "
            "En los casos habituales trabajamos con diagnóstico, dos actuaciones y seguimiento. "
            "Inspección gratuita en zona de cobertura. No ofrecemos servicio fuera de Catalunya. "
            "La garantía de solución aplica según condiciones del presupuesto (acceso, instrucciones "
            "y alcance contratado). No cubre nuevas entradas desde vecinos, bajantes o zonas no tratadas."
        ),
    )
    policies_ca = models.TextField(
        blank=True,
        default=(
            "Empresa familiar ètica i conscient amb més de 20 anys d'experiència. "
            "En els casos habituals treballem amb diagnòstic, dues actuacions i seguiment. "
            "Inspecció gratuïta en zona de cobertura. No oferim servei fora de Catalunya. "
            "La garantia de solució s'aplica segons condicions del pressupost (accés, instruccions "
            "i abast contractat). No cobreix noves entrades des de veïns, baixants o zones no tractades."
        ),
    )
    # Ciudades/zonas dentro de cobertura (substrings, minúsculas)
    coverage_places = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de lugares cubiertos (minúsculas). Vacío = defaults Catalunya.",
    )
    # Lugares claramente fuera (para denegar visitas)
    outside_places = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de lugares fuera de cobertura (minúsculas). Vacío = defaults.",
    )
    agent_notes_es = models.TextField(
        blank=True,
        default="",
        help_text="Notas extra para el agente (castellano).",
    )
    agent_notes_ca = models.TextField(
        blank=True,
        default="",
        help_text="Notes extra per a l'agent (català).",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Perfil de empresa (agentes)"
        verbose_name_plural = "Perfil de empresa (agentes)"

    def __str__(self) -> str:
        return f"{self.brand_name} (perfil agentes)"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
        try:
            from api.agents.company_knowledge import invalidate_company_profile_cache

            invalidate_company_profile_cache()
        except Exception:
            pass

    @classmethod
    def get_solo(cls) -> CompanyProfile:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
