from decimal import Decimal

from django.core.management.base import BaseCommand

from api.models import PresupuestoReferencia
from api.presupuesto_templates import PRESUPUESTO_TEMPLATES


class Command(BaseCommand):
    help = (
        "Importa los modelos de presupuesto (11675P, 11630P) como PresupuestoReferencia "
        "para el agente pricer."
    )

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for tpl in PRESUPUESTO_TEMPLATES:
            ref_data = tpl["reference"]
            codigo = tpl["id"]
            defaults = {
                "pest_type": tpl.get("pest_type", ""),
                "severity": tpl.get("severity", ""),
                "property_type": tpl.get("property_type", ""),
                "city": ref_data.get("city", ""),
                "zone_detail": ref_data.get("zone_detail", ""),
                "total_monto": ref_data.get("total_monto", Decimal("0")),
                "breakdown": ref_data.get("breakdown", []),
                "garantia_meses": ref_data.get("garantia_meses", 12),
                "source": PresupuestoReferencia.Source.MANUAL,
                "notes": ref_data.get("notes", ""),
                "presupuesto": None,
            }
            obj, was_created = PresupuestoReferencia.objects.update_or_create(
                codigo=codigo,
                defaults=defaults,
            )
            if was_created:
                created += 1
            else:
                updated += 1
            self.stdout.write(f"  {'Creado' if was_created else 'Actualizado'}: {codigo} — {obj.total_monto}€")

        self.stdout.write(
            self.style.SUCCESS(f"Listo: {created} creado(s), {updated} actualizado(s).")
        )
