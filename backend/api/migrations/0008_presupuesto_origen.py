from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_presupuesto_descripcion_codigo"),
    ]

    operations = [
        migrations.AddField(
            model_name="presupuesto",
            name="origen",
            field=models.CharField(
                choices=[("admin", "Admin"), ("agent", "Agent")],
                default="admin",
                max_length=20,
            ),
        ),
    ]
