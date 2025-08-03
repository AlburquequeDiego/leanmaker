from django.db import models
from django.conf import settings
from projects.models import Proyecto
from students.models import Estudiante


class WorkHour(models.Model):
    """Modelo para registrar horas de trabajo de estudiantes en proyectos"""
    
    student = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name='work_hours',
        verbose_name='Estudiante'
    )
    project = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='work_hours',
        verbose_name='Proyecto'
    )
    date = models.DateField(verbose_name='Fecha')
    hours_worked = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        verbose_name='Horas trabajadas'
    )
    description = models.TextField(
        blank=True, 
        null=True, 
        verbose_name='Descripción del trabajo'
    )
    is_verified = models.BooleanField(default=False, verbose_name='Verificado')
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work_hours_verified',
        verbose_name='Verificado por'
    )
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de verificación')
    is_project_completion = models.BooleanField(default=False, verbose_name='Horas de completación de proyecto')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'work_hours'
        verbose_name = 'Hora de trabajo'
        verbose_name_plural = 'Horas de trabajo'
        ordering = ['-date', '-created_at']
        
    def __str__(self):
        return f"{self.student} - {self.project} - {self.date} ({self.hours_worked}h)" 