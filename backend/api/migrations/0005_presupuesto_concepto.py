# Generated manually — concepto libre en líneas de presupuesto

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_presupuesto_referencia"),
    ]

    operations = [
        migrations.AddField(
            model_name="presupuesto",
            name="notas",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="presupuestodetalle",
            name="concepto",
            field=models.CharField(blank=True, default="", max_length=300),
        ),
        migrations.AlterField(
            model_name="presupuestodetalle",
            name="tratamiento",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                to="api.tratamiento",
            ),
        ),
    ]
