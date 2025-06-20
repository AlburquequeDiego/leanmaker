from django.db import models
from django.conf import settings
from projects.models import Project

class WorkHours(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='work_hours', verbose_name='Estudiante')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='work_hours', verbose_name='Proyecto')
    
    # Fecha y horas
    date = models.DateField(verbose_name='Fecha')
    start_time = models.TimeField(verbose_name='Hora de Inicio')
    end_time = models.TimeField(verbose_name='Hora de Fin')
    
    # Descripción del trabajo
    description = models.TextField(verbose_name='Descripción del Trabajo')
    
    # Estado de aprobación
    is_approved = models.BooleanField(default=False, verbose_name='Aprobado')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_work_hours',
        verbose_name='Aprobado por'
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Aprobación')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Horas de Trabajo'
        verbose_name_plural = 'Horas de Trabajo'
        ordering = ['-date', '-start_time']
        unique_together = ('student', 'project', 'date', 'start_time')

    def __str__(self):
        return f'{self.student.email} - {self.project.title} - {self.date}'

    @property
    def hours_worked(self):
        """
        Calcula las horas trabajadas.
        """
        from datetime import datetime, timedelta
        
        start = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        
        # Si la hora de fin es menor que la de inicio, asumimos que es del día siguiente
        if end < start:
            end += timedelta(days=1)
        
        duration = end - start
        return duration.total_seconds() / 3600  # Convertir a horas

    @property
    def hours_worked_formatted(self):
        """
        Retorna las horas trabajadas en formato legible.
        """
        hours = self.hours_worked
        return f"{hours:.2f} horas"
