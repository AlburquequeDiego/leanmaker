from django.db import models

# Create your models here.

class Area(models.Model):
    """Modelo para áreas de conocimiento"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, help_text="Nombre del área")
    description = models.TextField(blank=True, null=True, help_text="Descripción del área")
    color = models.CharField(max_length=7, default='#007bff', help_text="Color hexadecimal del área")
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Icono del área")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'areas'
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def project_count(self):
        """Retorna el número de proyectos en esta área"""
        return self.projects.count()
