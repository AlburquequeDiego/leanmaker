# Generated by Django 4.2.23 on 2025-07-02 01:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('interviews', '0001_initial'),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='application',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='projects.aplicacionproyecto'),
        ),
    ]
