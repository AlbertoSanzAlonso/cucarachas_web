# Generated manually for PresupuestoReferencia + campos pricer en Presupuesto

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_cliente_telefono_norm"),
    ]

    operations = [
        migrations.AddField(
            model_name="presupuesto",
            name="garantia_meses",
            field=models.PositiveIntegerField(default=12),
        ),
        migrations.AddField(
            model_name="presupuesto",
            name="pest_type",
            field=models.CharField(blank=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="presupuesto",
            name="severity",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.CreateModel(
            name="PresupuestoReferencia",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("pest_type", models.CharField(blank=True, default="", max_length=50)),
                ("severity", models.CharField(blank=True, default="", max_length=20)),
                ("property_type", models.CharField(blank=True, default="", max_length=20)),
                ("city", models.CharField(blank=True, default="", max_length=100)),
                ("zone_detail", models.CharField(blank=True, default="", max_length=100)),
                ("total_monto", models.DecimalField(decimal_places=2, max_digits=12)),
                ("breakdown", models.JSONField(default=list)),
                ("garantia_meses", models.PositiveIntegerField(default=12)),
                (
                    "source",
                    models.CharField(
                        choices=[("manual", "Manual"), ("crm", "Presupuesto CRM")],
                        default="manual",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "presupuesto",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="referencia_agent",
                        to="api.presupuesto",
                    ),
                ),
            ],
            options={
                "verbose_name": "Presupuesto de referencia",
                "verbose_name_plural": "Presupuestos de referencia",
                "ordering": ["-created_at"],
            },
        ),
    ]
