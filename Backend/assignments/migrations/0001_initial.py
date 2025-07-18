# Generated by Django 4.2.23 on 2025-07-02 01:37

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('applications', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(help_text='Título de la asignación', max_length=200)),
                ('description', models.TextField(help_text='Descripción detallada de la tarea')),
                ('due_date', models.DateTimeField(help_text='Fecha límite de la tarea')),
                ('priority', models.CharField(choices=[('low', 'Baja'), ('medium', 'Media'), ('high', 'Alta'), ('urgent', 'Urgente')], default='medium', max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('in_progress', 'En Progreso'), ('completed', 'Completada'), ('cancelled', 'Cancelada')], default='pending', max_length=20)),
                ('estimated_hours', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('actual_hours', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('application', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='applications.aplicacion')),
            ],
            options={
                'verbose_name': 'Asignación',
                'verbose_name_plural': 'Asignaciones',
                'db_table': 'assignments',
                'ordering': ['-created_at'],
            },
        ),
    ]
