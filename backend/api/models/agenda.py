"""Agenda propia (fuente de verdad de citas bookables)."""

from django.db import models

from .crm import Cliente


class AgendaService(models.Model):
    """Servicio bookable (p. ej. Primera revisió)."""

    id = models.CharField(max_length=64, primary_key=True)
    name_es = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200)
    name_ca = models.CharField(max_length=200, blank=True, default="")
    duration_minutes = models.PositiveIntegerField()
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return str(self.name_ca or self.name_es)


class AgendaStaff(models.Model):
    """Técnico / recurso de agenda."""

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100, blank=True, default="")
    photo = models.ImageField(upload_to="staff/", blank=True, null=True)
    active = models.BooleanField(default=True)
    services = models.ManyToManyField(AgendaService, blank=True, related_name="staff")

    def __str__(self) -> str:
        return str(self.name)


class AgendaSalonHours(models.Model):
    """Horario semanal por defecto (0=dom … 6=sáb)."""

    day_of_week = models.PositiveSmallIntegerField()
    start_time = models.CharField(max_length=5)  # HH:MM
    end_time = models.CharField(max_length=5)

    class Meta:
        unique_together = ("day_of_week", "start_time")
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"Dow{self.day_of_week} {self.start_time}-{self.end_time}"


class AgendaStaffAvailability(models.Model):
    """Disponibilidad semanal por técnico (si existe, prevalece sobre salon hours)."""

    staff = models.ForeignKey(
        AgendaStaff, on_delete=models.CASCADE, related_name="availability"
    )
    day_of_week = models.PositiveSmallIntegerField()
    start_time = models.CharField(max_length=5)
    end_time = models.CharField(max_length=5)

    class Meta:
        unique_together = ("staff", "day_of_week", "start_time")
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.staff_id} Dow{self.day_of_week} {self.start_time}-{self.end_time}"


class AgendaTimeBlock(models.Model):
    """Bloqueo de tiempo (vacaciones, desplazamiento, etc.)."""

    id = models.CharField(max_length=64, primary_key=True)
    staff = models.ForeignKey(
        AgendaStaff, on_delete=models.CASCADE, related_name="time_blocks"
    )
    date = models.DateField()
    start_time = models.CharField(max_length=5)
    end_time = models.CharField(max_length=5)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"Block {self.date} {self.start_time}-{self.end_time}"


class AgendaAppointment(models.Model):
    """Cita de la agenda propia (fuente de verdad)."""

    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No show"
        COMPLETED = "completed", "Completed"

    id = models.CharField(max_length=64, primary_key=True)
    staff = models.ForeignKey(
        AgendaStaff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )
    service = models.ForeignKey(
        AgendaService, on_delete=models.PROTECT, related_name="appointments"
    )
    date = models.DateField()
    start_time = models.CharField(max_length=5)
    duration_minutes = models.PositiveIntegerField()
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=40)
    customer_email = models.EmailField(blank=True, default="")
    customer_address = models.CharField(max_length=500, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CONFIRMED
    )
    locale = models.CharField(max_length=5, default="ca")
    origin = models.CharField(max_length=40, blank=True, default="")
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agenda_appointments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        indexes = [
            models.Index(fields=["date", "status"]),
            models.Index(fields=["staff", "date", "status"]),
        ]

    def __str__(self):
        return f"{self.date} {self.start_time} — {self.customer_name}"
