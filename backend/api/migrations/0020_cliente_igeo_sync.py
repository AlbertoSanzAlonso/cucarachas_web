from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0019_alter_fichaservicio_reglas_comerciales"),
    ]

    operations = [
        migrations.AddField(
            model_name="cliente",
            name="igeo_codigo",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Código entidad iGEO (espejo PDI) cuando esté sincronizado",
                max_length=64,
            ),
        ),
        migrations.CreateModel(
            name="IgeoSyncLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("entity_type", models.CharField(db_index=True, max_length=64)),
                ("comando", models.CharField(blank=True, default="", max_length=16)),
                (
                    "remote_operation_id",
                    models.CharField(blank=True, db_index=True, default="", max_length=128),
                ),
                ("ok", models.BooleanField(default=False)),
                ("dry_run", models.BooleanField(default=True)),
                ("message", models.CharField(blank=True, default="", max_length=2000)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("telefono_norm", models.CharField(blank=True, default="", max_length=15)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "cliente",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="igeo_sync_logs",
                        to="api.cliente",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
