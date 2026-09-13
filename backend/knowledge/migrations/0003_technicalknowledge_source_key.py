# Generated manually for RAG sync source_key

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("knowledge", "0002_alter_technicalknowledge_embedding"),
    ]

    operations = [
        migrations.AddField(
            model_name="technicalknowledge",
            name="source_key",
            field=models.CharField(
                blank=True,
                db_index=True,
                help_text="Identificador estable: blog:slug, faq:slug, ficha:codigo, …",
                max_length=180,
                null=True,
                unique=True,
            ),
        ),
    ]
