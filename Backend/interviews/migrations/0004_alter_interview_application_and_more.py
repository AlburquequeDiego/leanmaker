# Generated by Django 4.2.7 on 2025-07-13 05:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0003_initial'),
        ('interviews', '0003_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interview',
            name='application',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='applications.aplicacion'),
        ),
        migrations.AlterField(
            model_name='interview',
            name='interview_type',
            field=models.CharField(choices=[('technical', 'Técnica'), ('behavioral', 'Comportamental'), ('video', 'Video'), ('phone', 'Teléfono'), ('onsite', 'Presencial')], default='video', max_length=20),
        ),
    ]
