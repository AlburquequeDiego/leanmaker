from projects.models import Proyecto
from users.models import Usuario
from companies.models import Empresa
from django.db import models
from students.models import Student
import uuid

class Strike(models.Model):
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='strikes', verbose_name='Proyecto')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='strikes', verbose_name='Estudiante')
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='issued_strikes', verbose_name='Empresa Emisora')
    
    reason = models.TextField(verbose_name='Motivo de la Amonestación')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'strikes'
        verbose_name = 'Amonestación (Strike)'
        verbose_name_plural = 'Amonestaciones (Strikes)'
        ordering = ['-created_at']

    def __str__(self):
        return f'Amonestación para {self.student} en {self.project.title}'
