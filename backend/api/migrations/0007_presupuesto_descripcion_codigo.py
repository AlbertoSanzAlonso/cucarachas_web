from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_ficha_servicio"),
    ]

    operations = [
        migrations.AddField(
            model_name="presupuestodetalle",
            name="descripcion",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="presupuestoreferencia",
            name="codigo",
            field=models.CharField(
                blank=True,
                help_text="Código del modelo de referencia (ej. 11675P)",
                max_length=30,
                null=True,
                unique=True,
            ),
        ),
    ]
