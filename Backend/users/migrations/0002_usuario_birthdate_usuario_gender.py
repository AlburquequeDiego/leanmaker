# Generated by Django 4.2.23 on 2025-07-02 06:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='birthdate',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='gender',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
