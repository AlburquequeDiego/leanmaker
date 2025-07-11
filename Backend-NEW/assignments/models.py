from django.db import models
from users.models import Usuario
from projects.models import Proyecto
from applications.models import Aplicacion
import uuid


class Assignment(models.Model):
    """Modelo para asignaciones de tareas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Proyecto', on_delete=models.CASCADE, related_name='assignments', null=True, blank=True)
    application = models.ForeignKey('applications.Aplicacion', on_delete=models.CASCADE, related_name='assignments', null=True, blank=True)
    assigned_by = models.ForeignKey('users.Usuario', on_delete=models.CASCADE, related_name='assignments_created', null=True, blank=True)
    assigned_to = models.ForeignKey('users.Usuario', on_delete=models.CASCADE, related_name='assignments_assigned', null=True, blank=True)
    title = models.CharField(max_length=200, help_text="Título de la asignación")
    description = models.TextField(help_text="Descripción detallada de la tarea")
    due_date = models.DateTimeField(help_text="Fecha límite de la tarea")
    priority = models.CharField(
        max_length=20, 
        choices=[
            ('low', 'Baja'),
            ('medium', 'Media'),
            ('high', 'Alta'),
            ('urgent', 'Urgente')
        ],
        default='medium'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pendiente'),
            ('in_progress', 'En Progreso'),
            ('completed', 'Completada'),
            ('cancelled', 'Cancelada')
        ],
        default='pending'
    )
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        verbose_name = 'Asignación'
        verbose_name_plural = 'Asignaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.assigned_to.get_full_name()}"

    @property
    def student(self):
        """Retorna el estudiante asignado"""
        return self.application.estudiante

    @property
    def project(self):
        """Retorna el proyecto asignado"""
        return self.application.proyecto

    @property
    def company(self):
        """Retorna la empresa del proyecto"""
        return self.application.proyecto.empresa

    @property
    def duration_days(self):
        """Calcula la duración en días de la asignación"""
        if self.due_date:
            return (self.due_date - self.created_at).days
        return None

    @property
    def is_active(self):
        """Indica si la asignación está activa"""
        return self.status == 'pending' or self.status == 'in_progress'
