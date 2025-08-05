from django.db import models
from users.models import User
from students.models import Estudiante
from companies.models import Empresa
import uuid
from django.utils import timezone

class DisciplinaryRecords(models.Model):
    """Modelo para registros disciplinarios de estudiantes"""
    
    SEVERITY_CHOICES = (
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident_date = models.DateField(default=timezone.now)
    description = models.TextField(default='Sin descripción')
    action_taken = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    
    # Fechas
    recorded_at = models.DateTimeField(default=timezone.now)
    
    # Relaciones
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='disciplinary_records', null=True, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disciplinary_records_created', null=True, blank=True)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='disciplinary_records', null=True, blank=True)
    
    class Meta:
        db_table = 'disciplinary_records'
        verbose_name = 'Registro Disciplinario'
        verbose_name_plural = 'Registros Disciplinarios'
        ordering = ['-recorded_at']
        
    def __str__(self):
        student_name = self.student.user.full_name if self.student else 'Estudiante no especificado'
        return f"{student_name} - {self.incident_date} ({self.get_severity_display()})"
