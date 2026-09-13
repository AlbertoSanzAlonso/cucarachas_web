"""Señales: contenido dinámico → TechnicalKnowledge (RAG)."""

from __future__ import annotations

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from api.models import (
    BlogArticle,
    CompanyProfile,
    FaqItem,
    FichaServicio,
    PresupuestoReferencia,
    Species,
    Tratamiento,
)


def _safe_sync(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as exc:
        print(f"WARNING: knowledge sync failed ({fn.__name__}): {exc}")
        return None


@receiver(post_save, sender=BlogArticle)
def sync_blog_on_save(sender, instance: BlogArticle, **kwargs):
    from knowledge.sync import sync_blog_article

    _safe_sync(sync_blog_article, instance)


@receiver(post_delete, sender=BlogArticle)
def sync_blog_on_delete(sender, instance: BlogArticle, **kwargs):
    from knowledge.sync import blog_source_key, delete_knowledge

    _safe_sync(delete_knowledge, blog_source_key(instance.slug))


@receiver(post_save, sender=FaqItem)
def sync_faq_on_save(sender, instance: FaqItem, **kwargs):
    from knowledge.sync import sync_faq_item

    _safe_sync(sync_faq_item, instance)


@receiver(post_delete, sender=FaqItem)
def sync_faq_on_delete(sender, instance: FaqItem, **kwargs):
    from knowledge.sync import delete_knowledge, faq_source_key

    _safe_sync(delete_knowledge, faq_source_key(instance.slug))


@receiver(post_save, sender=CompanyProfile)
def sync_company_on_save(sender, instance: CompanyProfile, **kwargs):
    from knowledge.sync import sync_company_profile

    _safe_sync(sync_company_profile, instance)


@receiver(post_save, sender=Species)
def sync_species_on_save(sender, instance: Species, **kwargs):
    from knowledge.sync import sync_species

    _safe_sync(sync_species, instance)


@receiver(post_delete, sender=Species)
def sync_species_on_delete(sender, instance: Species, **kwargs):
    from knowledge.sync import delete_knowledge, species_source_key

    _safe_sync(delete_knowledge, species_source_key(instance.slug))


@receiver(post_save, sender=Tratamiento)
def sync_tratamiento_on_save(sender, instance: Tratamiento, **kwargs):
    from knowledge.sync import sync_tratamiento

    _safe_sync(sync_tratamiento, instance)


@receiver(post_delete, sender=Tratamiento)
def sync_tratamiento_on_delete(sender, instance: Tratamiento, **kwargs):
    from knowledge.sync import delete_knowledge, tratamiento_source_key

    _safe_sync(delete_knowledge, tratamiento_source_key(instance.pk))


@receiver(post_save, sender=FichaServicio)
def sync_ficha_on_save(sender, instance: FichaServicio, **kwargs):
    from knowledge.sync import sync_ficha_servicio

    _safe_sync(sync_ficha_servicio, instance)


@receiver(post_delete, sender=FichaServicio)
def sync_ficha_on_delete(sender, instance: FichaServicio, **kwargs):
    from knowledge.sync import delete_knowledge, ficha_source_key

    _safe_sync(delete_knowledge, ficha_source_key(instance.codigo))


@receiver(post_save, sender=PresupuestoReferencia)
def sync_presupuesto_ref_on_save(sender, instance: PresupuestoReferencia, **kwargs):
    from knowledge.sync import sync_presupuesto_referencia

    _safe_sync(sync_presupuesto_referencia, instance)


@receiver(post_delete, sender=PresupuestoReferencia)
def sync_presupuesto_ref_on_delete(sender, instance: PresupuestoReferencia, **kwargs):
    from knowledge.sync import delete_knowledge, presupuesto_ref_source_key

    _safe_sync(delete_knowledge, presupuesto_ref_source_key(instance.pk))
