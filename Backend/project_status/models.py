from django.db import models
from users.models import Usuario

class ProjectStatus(models.Model):
    """Modelo para estados de proyecto"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, help_text="Nombre del estado")
    description = models.TextField(blank=True, null=True, help_text="Descripción del estado")
    color = models.CharField(max_length=7, default='#007bff', help_text="Color hexadecimal del estado")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'project_status'
        verbose_name = 'Estado de Proyecto'
        verbose_name_plural = 'Estados de Proyecto'
        ordering = ['name']

    def __str__(self):
        return self.name

class ProjectStatusHistory(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey('projects.Proyecto', on_delete=models.CASCADE, related_name='status_history')
    status = models.ForeignKey('ProjectStatus', on_delete=models.CASCADE, related_name='status_history')
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='status_changes')
    fecha_cambio = models.DateTimeField(auto_now_add=True)
    comentario = models.TextField(null=True, blank=True)
    class Meta:
        db_table = 'project_status_history'
    def __str__(self):
        return f"{self.project.title} - {self.status.name} ({self.fecha_cambio})" 