# Generated by Django 4.2.7 on 2025-07-16 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assignments', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignment',
            name='priority',
            field=models.CharField(choices=[('low', 'Baja'), ('normal', 'Normal'), ('medium', 'Media'), ('high', 'Alta'), ('urgent', 'Urgente')], default='medium', max_length=20),
        ),
    ]
