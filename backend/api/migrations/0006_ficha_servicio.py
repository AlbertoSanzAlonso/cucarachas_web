from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_presupuesto_concepto"),
    ]

    operations = [
        migrations.CreateModel(
            name="FichaServicio",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("codigo", models.CharField(help_text="Ej: CUC-GER-PISO", max_length=30, unique=True)),
                ("nombre_comercial", models.CharField(max_length=200)),
                (
                    "pest_type",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="Valor PestType del agente (german_cockroach, american_cockroach, …)",
                        max_length=50,
                    ),
                ),
                ("activa", models.BooleanField(default=True)),
                ("tipos_cliente", models.JSONField(default=list, help_text='["particular", "restaurante", …]')),
                ("lugares", models.JSONField(default=list, help_text='["cocina", "bano", …]')),
                (
                    "preguntas_obligatorias",
                    models.JSONField(
                        default=dict,
                        help_text='Por tipo cliente: {"particular": ["codigo_postal", "metros_cuadrados", …]}',
                    ),
                ),
                (
                    "reglas_diagnostico",
                    models.JSONField(
                        default=list,
                        help_text='[{"keywords": ["noche"], "severity": "low"}, …]',
                    ),
                ),
                ("prioridad_default", models.CharField(default="media", max_length=20)),
                (
                    "sistema_recomendado",
                    models.JSONField(
                        default=dict,
                        help_text='{"recomendar": ["gel", "trampas"], "no_recomendar": ["pulverizar"]}',
                    ),
                ),
                ("tiempo_medio", models.JSONField(default=dict, help_text='{"visita_1": 45, "visita_2": 30}')),
                ("material_medio", models.JSONField(default=list)),
                ("riesgo", models.CharField(default="medio", max_length=20)),
                ("dificultad", models.PositiveSmallIntegerField(default=3)),
                (
                    "coste_interno",
                    models.JSONField(
                        default=dict,
                        help_text='{"tiempo_tecnico": 52, "material": 18, "desplazamiento": 12}',
                    ),
                ),
                (
                    "reglas_comerciales",
                    models.JSONField(
                        default=list,
                        help_text='[{"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 220}, …]',
                    ),
                ),
                ("bloqueos_presupuesto", models.JSONField(default=list)),
                ("copy_comercial", models.JSONField(default=dict, help_text='{"ca": "…", "es": "…"}')),
                (
                    "objeciones",
                    models.JSONField(
                        default=list,
                        help_text='[{"trigger": "solo una visita", "respuesta_ca": "…", "respuesta_es": "…"}]',
                    ),
                ),
                ("venta_cruzada", models.JSONField(default=list)),
                (
                    "seguimiento",
                    models.JSONField(
                        default=dict,
                        help_text='{"24h": "whatsapp", "7d": "email", "30d": "email"}',
                    ),
                ),
                ("garantia_meses", models.PositiveIntegerField(default=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Ficha de servicio",
                "verbose_name_plural": "Fichas de servicio",
                "ordering": ["codigo"],
            },
        ),
    ]
