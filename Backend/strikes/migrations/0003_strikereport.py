# Generated by Django 4.2.7 on 2025-07-17 05:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('companies', '0003_empresa_business_name_empresa_company_address_and_more'),
        ('projects', '0003_remove_payment_fields'),
        ('students', '0005_estudiante_trl_level_alter_estudiante_gpa'),
        ('strikes', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StrikeReport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('reason', models.CharField(max_length=200, verbose_name='Motivo del Strike')),
                ('description', models.TextField(verbose_name='Descripción Detallada')),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('approved', 'Aprobado'), ('rejected', 'Rechazado')], default='pending', max_length=20)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('admin_notes', models.TextField(blank=True, null=True, verbose_name='Notas del Administrador')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='strike_reports', to='companies.empresa', verbose_name='Empresa')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='strike_reports', to='projects.proyecto', verbose_name='Proyecto')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='strike_reports_reviewed', to=settings.AUTH_USER_MODEL)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='strike_reports', to='students.estudiante', verbose_name='Estudiante')),
            ],
            options={
                'verbose_name': 'Reporte de Strike',
                'verbose_name_plural': 'Reportes de Strikes',
                'db_table': 'strike_reports',
                'ordering': ['-created_at'],
            },
        ),
    ]
