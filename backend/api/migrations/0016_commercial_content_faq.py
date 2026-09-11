# WhatsApp, hero, política comercial + FaqItem + seed contenido

from django.db import migrations, models


def seed_commercial_content(apps, schema_editor):
    CompanyProfile = apps.get_model("api", "CompanyProfile")
    FaqItem = apps.get_model("api", "FaqItem")

    from api.commercial_seed import (
        AGENT_NOTES_CA,
        AGENT_NOTES_ES,
        COMMERCIAL_POLICY_CA,
        COMMERCIAL_POLICY_ES,
        FAQ_SEED,
    )

    CompanyProfile.objects.update_or_create(
        pk=1,
        defaults={
            "whatsapp": "681 033 305",
            "hero_title_es": "Eliminación profesional de cucarachas en Barcelona",
            "hero_title_ca": "Eliminació professional de paneroles a Barcelona",
            "hero_subtitle_es": (
                "Tratamiento adaptado a viviendas, locales y comunidades, con diagnóstico, "
                "dos actuaciones en los casos habituales y garantía de solución según condiciones."
            ),
            "hero_subtitle_ca": (
                "Tractament adaptat a habitatges, locals i comunitats, amb diagnòstic, "
                "dues actuacions en els casos habituals i garantia de solució segons condicions."
            ),
            "commercial_policy_es": COMMERCIAL_POLICY_ES,
            "commercial_policy_ca": COMMERCIAL_POLICY_CA,
            "agent_notes_es": AGENT_NOTES_ES,
            "agent_notes_ca": AGENT_NOTES_CA,
            "policies_es": (
                "Empresa familiar ética y consciente con más de 20 años de experiencia. "
                "En los casos habituales trabajamos con diagnóstico, dos actuaciones y seguimiento. "
                "Inspección gratuita en zona de cobertura. No ofrecemos servicio fuera de Catalunya. "
                "La garantía de solución aplica según condiciones del presupuesto."
            ),
            "policies_ca": (
                "Empresa familiar ètica i conscient amb més de 20 anys d'experiència. "
                "En els casos habituals treballem amb diagnòstic, dues actuacions i seguiment. "
                "Inspecció gratuïta en zona de cobertura. No oferim servei fora de Catalunya. "
                "La garantia de solució s'aplica segons condicions del pressupost."
            ),
        },
    )

    for item in FAQ_SEED:
        FaqItem.objects.update_or_create(slug=item["slug"], defaults=item)


def unseed_commercial_content(apps, schema_editor):
    FaqItem = apps.get_model("api", "FaqItem")
    FaqItem.objects.filter(slug__in=[
        "preu-pis",
        "dos-tractaments",
        "garantia",
        "sortir-casa",
        "nens-mascotes",
        "preparacio",
        "temps-activitat",
        "veins-comunitat",
        "bars-locals",
        "certificat-ddd",
        "preventiu-vs-activa",
        "bar-germanica-preu",
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0015_company_profile"),
    ]

    operations = [
        migrations.AddField(
            model_name="companyprofile",
            name="whatsapp",
            field=models.CharField(blank=True, default="681 033 305", max_length=40),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="hero_title_es",
            field=models.CharField(
                blank=True,
                default="Eliminación profesional de cucarachas en Barcelona",
                max_length=200,
            ),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="hero_title_ca",
            field=models.CharField(
                blank=True,
                default="Eliminació professional de paneroles a Barcelona",
                max_length=200,
            ),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="hero_subtitle_es",
            field=models.TextField(
                blank=True,
                default=(
                    "Tratamiento adaptado a viviendas, locales y comunidades, con diagnóstico, "
                    "dos actuaciones en los casos habituales y garantía de solución según condiciones."
                ),
            ),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="hero_subtitle_ca",
            field=models.TextField(
                blank=True,
                default=(
                    "Tractament adaptat a habitatges, locals i comunitats, amb diagnòstic, "
                    "dues actuacions en els casos habituals i garantia de solució segons condicions."
                ),
            ),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="commercial_policy_es",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Política comercial pública para agentes (sin costes internos ni márgenes).",
            ),
        ),
        migrations.AddField(
            model_name="companyprofile",
            name="commercial_policy_ca",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Política comercial pública per a agents (sense costos interns ni marges).",
            ),
        ),
        migrations.CreateModel(
            name="FaqItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=80, unique=True)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("seguretat", "Seguretat"),
                            ("tecnic", "Tècnic"),
                            ("preus", "Preus"),
                            ("garantia", "Garantia"),
                        ],
                        default="tecnic",
                        max_length=32,
                    ),
                ),
                ("sort_order", models.PositiveSmallIntegerField(default=100)),
                ("is_published", models.BooleanField(default=True)),
                ("question_ca", models.CharField(max_length=300)),
                ("question_es", models.CharField(max_length=300)),
                ("question_en", models.CharField(blank=True, max_length=300)),
                ("answer_ca", models.TextField()),
                ("answer_es", models.TextField()),
                ("answer_en", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "FAQ",
                "verbose_name_plural": "FAQs",
                "ordering": ["sort_order", "id"],
            },
        ),
        migrations.RunPython(seed_commercial_content, unseed_commercial_content),
    ]
