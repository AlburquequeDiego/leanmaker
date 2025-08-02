from django.db import models
from django.conf import settings
from students.models import Estudiante
from projects.models import Proyecto


class Assignment(models.Model):
    """Modelo para asignaciones de estudiantes a proyectos"""
    
    ASSIGNMENT_STATUS = [
        ('pending', 'Pendiente'),
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]
    
    student = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name='assignments',
        verbose_name='Estudiante'
    )
    project = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='assignments',
        verbose_name='Proyecto'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments_created',
        verbose_name='Asignado por'
    )
    status = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_STATUS,
        default='pending',
        verbose_name='Estado'
    )
    assigned_date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de asignación')
    start_date = models.DateField(null=True, blank=True, verbose_name='Fecha de inicio')
    end_date = models.DateField(null=True, blank=True, verbose_name='Fecha de finalización')
    notes = models.TextField(blank=True, null=True, verbose_name='Notas')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'assignments_assignment'
        verbose_name = 'Asignación'
        verbose_name_plural = 'Asignaciones'
        ordering = ['-assigned_date']
        unique_together = ['student', 'project']
        
    def __str__(self):
        return f"{self.student} - {self.project} ({self.get_status_display()})"


class AssignmentRole(models.Model):
    """Modelo para roles específicos en asignaciones"""
    
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='roles',
        verbose_name='Asignación'
    )
    role_name = models.CharField(max_length=100, verbose_name='Nombre del rol')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    responsibilities = models.TextField(blank=True, null=True, verbose_name='Responsabilidades')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    
    class Meta:
        db_table = 'assignments_assignmentrole'
        verbose_name = 'Rol de asignación'
        verbose_name_plural = 'Roles de asignación'
        
    def __str__(self):
        return f"{self.assignment} - {self.role_name}"


class AssignmentMilestone(models.Model):
    """Modelo para hitos/marcadores de progreso en asignaciones"""
    
    MILESTONE_STATUS = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En progreso'),
        ('completed', 'Completado'),
        ('overdue', 'Atrasado'),
    ]
    
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='milestones',
        verbose_name='Asignación'
    )
    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    due_date = models.DateField(verbose_name='Fecha de vencimiento')
    status = models.CharField(
        max_length=20,
        choices=MILESTONE_STATUS,
        default='pending',
        verbose_name='Estado'
    )
    completed_date = models.DateField(null=True, blank=True, verbose_name='Fecha de completado')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    
    class Meta:
        db_table = 'assignments_assignmentmilestone'
        verbose_name = 'Hito de asignación'
        verbose_name_plural = 'Hitos de asignación'
        ordering = ['due_date']
        
    def __str__(self):
        return f"{self.assignment} - {self.title}" 