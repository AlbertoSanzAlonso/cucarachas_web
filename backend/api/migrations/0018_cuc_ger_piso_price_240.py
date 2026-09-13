"""Actualiza precio base CUC-GER-PISO de 220€ a 240€."""

from django.db import migrations


def forwards(apps, schema_editor):
    FichaServicio = apps.get_model("api", "FichaServicio")
    ficha = FichaServicio.objects.filter(codigo="CUC-GER-PISO").first()
    if not ficha:
        return
    rules = list(ficha.reglas_comerciales or [])
    changed = False
    for rule in rules:
        if rule.get("precio_venta") == 220:
            rule["precio_venta"] = 240
            changed = True
    if changed:
        ficha.reglas_comerciales = rules
        ficha.save(update_fields=["reglas_comerciales"])


def backwards(apps, schema_editor):
    FichaServicio = apps.get_model("api", "FichaServicio")
    ficha = FichaServicio.objects.filter(codigo="CUC-GER-PISO").first()
    if not ficha:
        return
    rules = list(ficha.reglas_comerciales or [])
    changed = False
    for rule in rules:
        if rule.get("precio_venta") == 240:
            cond = rule.get("condition") or {}
            if cond.get("field") == "metros_cuadrados" and cond.get("op") == "lt":
                rule["precio_venta"] = 220
                changed = True
    if changed:
        ficha.reglas_comerciales = rules
        ficha.save(update_fields=["reglas_comerciales"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0017_alter_blog_body_company_policies"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
