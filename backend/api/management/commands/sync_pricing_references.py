from django.core.management.base import BaseCommand

from api.models import Presupuesto
from api.pricing_reference import sync_presupuesto_to_reference


class Command(BaseCommand):
    help = "Sincroniza presupuestos CRM existentes a PresupuestoReferencia (dataset del pricer)."

    def handle(self, *args, **options):
        synced = 0
        skipped = 0
        for presupuesto in Presupuesto.objects.select_related("ubicacion").prefetch_related("detalles"):
            ref = sync_presupuesto_to_reference(presupuesto)
            if ref:
                synced += 1
            else:
                skipped += 1
        self.stdout.write(
            self.style.SUCCESS(f"Listo: {synced} referencia(s) sincronizada(s), {skipped} omitida(s).")
        )
