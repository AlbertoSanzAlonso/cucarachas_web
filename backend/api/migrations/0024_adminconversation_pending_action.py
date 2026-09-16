# Generated manually for pending_action chat confirmation

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0023_igeo_mirror_entity"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminconversation",
            name="pending_action",
            field=models.JSONField(blank=True, default=None, null=True),
        ),
    ]
