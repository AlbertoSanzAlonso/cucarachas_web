from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from api.models import Presupuesto, PresupuestoDetalle
from api.pricing_reference import sync_presupuesto_to_reference


@receiver(post_save, sender=Presupuesto)
def sync_reference_on_presupuesto_save(sender, instance: Presupuesto, **kwargs):
    sync_presupuesto_to_reference(instance)


@receiver(post_save, sender=PresupuestoDetalle)
def sync_reference_on_detalle_save(sender, instance: PresupuestoDetalle, **kwargs):
    sync_presupuesto_to_reference(instance.presupuesto)


@receiver(post_delete, sender=PresupuestoDetalle)
def sync_reference_on_detalle_delete(sender, instance: PresupuestoDetalle, **kwargs):
    sync_presupuesto_to_reference(instance.presupuesto)
