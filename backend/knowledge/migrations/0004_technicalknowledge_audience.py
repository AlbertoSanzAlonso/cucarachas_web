# Generated manually for ops RAG audience filter

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("knowledge", "0003_technicalknowledge_source_key"),
    ]

    operations = [
        migrations.AddField(
            model_name="technicalknowledge",
            name="audience",
            field=models.CharField(
                choices=[
                    ("public", "Público (Bio-Assistent)"),
                    ("ops", "Oficina (ops)"),
                    ("both", "Ambos"),
                ],
                db_index=True,
                default="public",
                help_text="public = chat clientes; ops = asistente oficina; both = ambos",
                max_length=16,
            ),
        ),
    ]
