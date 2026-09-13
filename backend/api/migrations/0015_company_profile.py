# Perfil de empresa para agentes (singleton) + seed inicial Catalunya

from django.db import migrations, models


def seed_company_profile(apps, schema_editor):
    CompanyProfile = apps.get_model("api", "CompanyProfile")
    CompanyProfile.objects.update_or_create(
        pk=1,
        defaults={
            "brand_name": "CECSA Control de Plagas",
            "legal_name": "Desinfecciones CECSA, S.L.",
            "phone": "933 309 169",
            "email": "info@cecsaddd.com",
            "address": "C/ Dels Rajolers, 16, 08028 Barcelona",
            "service_area_es": (
                "Servicio solo en Barcelona y toda Catalunya "
                "(provincias de Barcelona, Girona, Tarragona y Lleida). "
                "No nos desplazamos fuera de Catalunya."
            ),
            "service_area_ca": (
                "Servei només a Barcelona i tota Catalunya "
                "(províncies de Barcelona, Girona, Tarragona i Lleida). "
                "No ens desplacem fora de Catalunya."
            ),
            "business_hours_es": "Lun - Vie, 9:00 - 20:00h",
            "business_hours_ca": "Dl - Dv, 9:00 - 20:00h",
            "policies_es": (
                "Empresa familiar ética y consciente. Inspección gratuita en zona de cobertura. "
                "No ofrecemos servicio ni visitas fuera de Catalunya."
            ),
            "policies_ca": (
                "Empresa familiar ètica i conscient. Inspecció gratuïta en zona de cobertura. "
                "No oferim servei ni visites fora de Catalunya."
            ),
            "coverage_places": [],
            "outside_places": [],
            "agent_notes_es": (
                "Si el cliente está fuera de Catalunya, explica la cobertura con claridad "
                "y no ofrezcas visita ni inspección presencial."
            ),
            "agent_notes_ca": (
                "Si el client és fora de Catalunya, explica la cobertura amb claredat "
                "i no ofereixis visita ni inspecció presencial."
            ),
        },
    )


def unseed_company_profile(apps, schema_editor):
    CompanyProfile = apps.get_model("api", "CompanyProfile")
    CompanyProfile.objects.filter(pk=1).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0014_seed_blog_articles"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("brand_name", models.CharField(default="CECSA Control de Plagas", max_length=120)),
                (
                    "legal_name",
                    models.CharField(blank=True, default="Desinfecciones CECSA, S.L.", max_length=200),
                ),
                ("phone", models.CharField(default="933 309 169", max_length=40)),
                ("email", models.EmailField(blank=True, default="info@cecsaddd.com", max_length=254)),
                (
                    "address",
                    models.CharField(blank=True, default="C/ Dels Rajolers, 16, 08028 Barcelona", max_length=240),
                ),
                (
                    "service_area_es",
                    models.TextField(
                        default=(
                            "Servicio solo en Barcelona y toda Catalunya "
                            "(provincias de Barcelona, Girona, Tarragona y Lleida). "
                            "No nos desplazamos fuera de Catalunya."
                        )
                    ),
                ),
                (
                    "service_area_ca",
                    models.TextField(
                        default=(
                            "Servei només a Barcelona i tota Catalunya "
                            "(províncies de Barcelona, Girona, Tarragona i Lleida). "
                            "No ens desplacem fora de Catalunya."
                        )
                    ),
                ),
                (
                    "business_hours_es",
                    models.CharField(blank=True, default="Lun - Vie, 9:00 - 20:00h", max_length=200),
                ),
                (
                    "business_hours_ca",
                    models.CharField(blank=True, default="Dl - Dv, 9:00 - 20:00h", max_length=200),
                ),
                (
                    "policies_es",
                    models.TextField(
                        blank=True,
                        default=(
                            "Empresa familiar ética y consciente. Inspección gratuita en zona de cobertura. "
                            "No ofrecemos servicio ni visitas fuera de Catalunya."
                        ),
                    ),
                ),
                (
                    "policies_ca",
                    models.TextField(
                        blank=True,
                        default=(
                            "Empresa familiar ètica i conscient. Inspecció gratuïta en zona de cobertura. "
                            "No oferim servei ni visites fora de Catalunya."
                        ),
                    ),
                ),
                (
                    "coverage_places",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text="Lista de lugares cubiertos (minúsculas). Vacío = defaults Catalunya.",
                    ),
                ),
                (
                    "outside_places",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text="Lista de lugares fuera de cobertura (minúsculas). Vacío = defaults.",
                    ),
                ),
                (
                    "agent_notes_es",
                    models.TextField(blank=True, default="", help_text="Notas extra para el agente (castellano)."),
                ),
                (
                    "agent_notes_ca",
                    models.TextField(blank=True, default="", help_text="Notes extra per a l'agent (català)."),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Perfil de empresa (agentes)",
                "verbose_name_plural": "Perfil de empresa (agentes)",
            },
        ),
        migrations.RunPython(seed_company_profile, unseed_company_profile),
    ]
