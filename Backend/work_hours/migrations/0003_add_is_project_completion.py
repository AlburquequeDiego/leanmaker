from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('work_hours', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='workhour',
            name='is_project_completion',
            field=models.BooleanField(default=False, help_text='Horas generadas automáticamente al completar un proyecto'),
        ),
    ] 