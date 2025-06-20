from django.db import models
from django.conf import settings
from companies.models import Company

class Project(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Borrador'
        PUBLISHED = 'PUBLISHED', 'Publicado'
        IN_PROGRESS = 'IN_PROGRESS', 'En Progreso'
        COMPLETED = 'COMPLETED', 'Completado'
        CANCELLED = 'CANCELLED', 'Cancelado'

    title = models.CharField(max_length=255, verbose_name='Título del Proyecto')
    description = models.TextField(verbose_name='Descripción Detallada')
    requirements = models.TextField(verbose_name='Requisitos')
    duration_in_weeks = models.PositiveIntegerField(verbose_name='Duración en Semanas')
    positions_to_fill = models.PositiveIntegerField(verbose_name='Vacantes a Cubrir')
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='projects', verbose_name='Empresa')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name='Estado')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
