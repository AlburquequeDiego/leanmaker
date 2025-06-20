from django.db import models
from projects.models import Project
from students.models import Student
from companies.models import Company

class Strike(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='strikes', verbose_name='Proyecto')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='strikes', verbose_name='Estudiante')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='issued_strikes', verbose_name='Empresa Emisora')
    
    reason = models.TextField(verbose_name='Motivo de la Amonestación')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Amonestación (Strike)'
        verbose_name_plural = 'Amonestaciones (Strikes)'
        ordering = ['-created_at']

    def __str__(self):
        return f'Amonestación para {self.student} en {self.project.title}'
