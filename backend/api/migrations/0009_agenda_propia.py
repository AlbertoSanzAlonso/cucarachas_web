# Generated manually for agenda propia CECSA

import uuid

from django.db import migrations, models
import django.db.models.deletion


def seed_agenda(apps, schema_editor):
    AgendaService = apps.get_model("api", "AgendaService")
    AgendaStaff = apps.get_model("api", "AgendaStaff")
    AgendaSalonHours = apps.get_model("api", "AgendaSalonHours")
    AgendaStaffAvailability = apps.get_model("api", "AgendaStaffAvailability")

    service, _ = AgendaService.objects.get_or_create(
        id="primera-revisio",
        defaults={
            "name_es": "Primera revisión",
            "name_en": "First inspection",
            "name_ca": "Primera revisió",
            "duration_minutes": 60,
            "active": True,
        },
    )

    staff, _ = AgendaStaff.objects.get_or_create(
        id="cecsa-tecnico-1",
        defaults={
            "name": "CECSA Tècnic",
            "role": "Tècnic",
            "active": True,
        },
    )
    staff.services.add(service)

    # Lun–Vie 09:00–14:00 y 15:00–18:00 (dow: 0=dom … 6=sáb → 1..5)
    windows = [("09:00", "14:00"), ("15:00", "18:00")]
    for dow in range(1, 6):
        for start, end in windows:
            AgendaSalonHours.objects.get_or_create(
                day_of_week=dow,
                start_time=start,
                defaults={"end_time": end},
            )
            AgendaStaffAvailability.objects.get_or_create(
                staff=staff,
                day_of_week=dow,
                start_time=start,
                defaults={"end_time": end},
            )


def unseed_agenda(apps, schema_editor):
    AgendaService = apps.get_model("api", "AgendaService")
    AgendaStaff = apps.get_model("api", "AgendaStaff")
    AgendaSalonHours = apps.get_model("api", "AgendaSalonHours")
    AgendaStaffAvailability = apps.get_model("api", "AgendaStaffAvailability")
    AgendaStaffAvailability.objects.filter(staff_id="cecsa-tecnico-1").delete()
    AgendaSalonHours.objects.all().delete()
    AgendaStaff.objects.filter(id="cecsa-tecnico-1").delete()
    AgendaService.objects.filter(id="primera-revisio").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_presupuesto_origen"),
    ]

    operations = [
        migrations.CreateModel(
            name="AgendaService",
            fields=[
                ("id", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("name_es", models.CharField(max_length=200)),
                ("name_en", models.CharField(max_length=200)),
                ("name_ca", models.CharField(blank=True, default="", max_length=200)),
                ("duration_minutes", models.PositiveIntegerField()),
                ("active", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="AgendaStaff",
            fields=[
                ("id", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=200)),
                ("role", models.CharField(blank=True, default="", max_length=100)),
                ("active", models.BooleanField(default=True)),
                (
                    "services",
                    models.ManyToManyField(
                        blank=True, related_name="staff", to="api.agendaservice"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="AgendaSalonHours",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("day_of_week", models.PositiveSmallIntegerField()),
                ("start_time", models.CharField(max_length=5)),
                ("end_time", models.CharField(max_length=5)),
            ],
            options={
                "ordering": ["day_of_week", "start_time"],
                "unique_together": {("day_of_week", "start_time")},
            },
        ),
        migrations.CreateModel(
            name="AgendaStaffAvailability",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("day_of_week", models.PositiveSmallIntegerField()),
                ("start_time", models.CharField(max_length=5)),
                ("end_time", models.CharField(max_length=5)),
                (
                    "staff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="availability",
                        to="api.agendastaff",
                    ),
                ),
            ],
            options={
                "ordering": ["day_of_week", "start_time"],
                "unique_together": {("staff", "day_of_week", "start_time")},
            },
        ),
        migrations.CreateModel(
            name="AgendaTimeBlock",
            fields=[
                ("id", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("date", models.DateField()),
                ("start_time", models.CharField(max_length=5)),
                ("end_time", models.CharField(max_length=5)),
                ("note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "staff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="time_blocks",
                        to="api.agendastaff",
                    ),
                ),
            ],
            options={
                "ordering": ["date", "start_time"],
            },
        ),
        migrations.CreateModel(
            name="AgendaAppointment",
            fields=[
                ("id", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("date", models.DateField()),
                ("start_time", models.CharField(max_length=5)),
                ("duration_minutes", models.PositiveIntegerField()),
                ("customer_name", models.CharField(max_length=200)),
                ("customer_phone", models.CharField(max_length=40)),
                ("customer_email", models.EmailField(blank=True, default="", max_length=254)),
                ("customer_address", models.CharField(blank=True, default="", max_length=500)),
                ("notes", models.TextField(blank=True, default="")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("confirmed", "Confirmed"),
                            ("cancelled", "Cancelled"),
                            ("no_show", "No show"),
                            ("completed", "Completed"),
                        ],
                        default="confirmed",
                        max_length=20,
                    ),
                ),
                ("locale", models.CharField(default="ca", max_length=5)),
                ("origin", models.CharField(blank=True, default="", max_length=40)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "cliente",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="agenda_appointments",
                        to="api.cliente",
                    ),
                ),
                (
                    "service",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="appointments",
                        to="api.agendaservice",
                    ),
                ),
                (
                    "staff",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="appointments",
                        to="api.agendastaff",
                    ),
                ),
            ],
            options={
                "ordering": ["date", "start_time"],
            },
        ),
        migrations.AddIndex(
            model_name="agendaappointment",
            index=models.Index(fields=["date", "status"], name="api_agendaa_date_7a1c0e_idx"),
        ),
        migrations.AddIndex(
            model_name="agendaappointment",
            index=models.Index(
                fields=["staff", "date", "status"], name="api_agendaa_staff_i_8f2b1a_idx"
            ),
        ),
        migrations.RunPython(seed_agenda, unseed_agenda),
    ]
