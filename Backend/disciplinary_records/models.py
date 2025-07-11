from django.db import models
from users.models import User
from students.models import Estudiante
from companies.models import Empresa


class DisciplinaryRecord(models.Model):
    """
    Modelo para registros disciplinarios
    Registra incidentes y acciones disciplinarias contra estudiantes
    """
    SEVERITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]

    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='disciplinary_records',
        help_text="Estudiante involucrado en el incidente"
    )
    company = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='disciplinary_records',
        help_text="Empresa donde ocurrió el incidente"
    )
    incident_date = models.DateField(
        help_text="Fecha del incidente"
    )
    description = models.TextField(
        help_text="Descripción detallada del incidente"
    )
    action_taken = models.TextField(
        blank=True,
        null=True,
        help_text="Acción disciplinaria tomada"
    )
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium',
        help_text="Severidad del incidente"
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='disciplinary_records_recorded',
        help_text="Usuario que registró el incidente"
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'disciplinary_records'
        verbose_name = 'Registro Disciplinario'
        verbose_name_plural = 'Registros Disciplinarios'
        ordering = ['-incident_date']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.incident_date}"

    @property
    def is_recent(self):
        """Indica si el incidente es reciente (últimos 30 días)"""
        from django.utils import timezone
        from datetime import timedelta
        return self.incident_date >= timezone.now().date() - timedelta(days=30)

    @property
    def severity_color(self):
        """Retorna el color asociado a la severidad"""
        colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'critical': '#dc3545',
        }
        return colors.get(self.severity, '#6c757d')
