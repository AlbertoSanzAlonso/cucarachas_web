from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0021_admin_ops_chat"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminmessage",
            name="source",
            field=models.CharField(
                default="text",
                help_text="text | voice — origen de l'entrada de l'operari",
                max_length=16,
            ),
        ),
    ]
