from django.db import migrations, models

from api.phone_utils import normalize_phone


def populate_telefono_norm(apps, schema_editor):
    Cliente = apps.get_model("api", "Cliente")
    seen: set[str] = set()
    for cliente in Cliente.objects.all().order_by("id"):
        norm = normalize_phone(cliente.telefono)
        if not norm:
            norm = f"legacy-{cliente.id}"
        base = norm
        suffix = 0
        while norm in seen:
            suffix += 1
            norm = f"{base}-{suffix}"
        seen.add(norm)
        cliente.telefono_norm = norm
        cliente.save(update_fields=["telefono_norm"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_cita_cliente_presupuesto_presupuestodetalle_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cliente",
            name="telefono_norm",
            field=models.CharField(
                help_text="Últimos 9 dígitos; clave de negocio para deduplicar leads",
                max_length=15,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="cliente",
            name="email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.RunPython(populate_telefono_norm, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="cliente",
            name="telefono_norm",
            field=models.CharField(
                db_index=True,
                help_text="Últimos 9 dígitos; clave de negocio para deduplicar leads",
                max_length=15,
                unique=True,
            ),
        ),
    ]
