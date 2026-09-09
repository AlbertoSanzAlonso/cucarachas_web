from django.db import migrations, models


def backfill_crm_status(apps, schema_editor):
    Cliente = apps.get_model("api", "Cliente")
    Presupuesto = apps.get_model("api", "Presupuesto")
    AgendaAppointment = apps.get_model("api", "AgendaAppointment")

    accepted_ids = set(
        Presupuesto.objects.filter(estado="aceptado").values_list("cliente_id", flat=True)
    )
    completed_ids = set(
        AgendaAppointment.objects.filter(status="completed", cliente_id__isnull=False).values_list(
            "cliente_id", flat=True
        )
    )
    alta_ids = accepted_ids | completed_ids

    Cliente.objects.filter(id__in=alta_ids).update(crm_status="alta")
    Cliente.objects.exclude(id__in=alta_ids).update(crm_status="lead")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0009_agenda_propia"),
    ]

    operations = [
        migrations.AddField(
            model_name="cliente",
            name="crm_status",
            field=models.CharField(
                choices=[("lead", "Lead"), ("alta", "Alta"), ("baja", "Baja")],
                db_index=True,
                default="lead",
                help_text="Ciclo de vida CRM: lead (posible), alta (cliente activo), baja",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="cliente",
            name="crm_status_locked",
            field=models.BooleanField(
                default=False,
                help_text="Si True, el estado automático no sobrescribe crm_status",
            ),
        ),
        migrations.RunPython(backfill_crm_status, migrations.RunPython.noop),
    ]
