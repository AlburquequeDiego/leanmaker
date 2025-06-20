from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from projects.models import Project
from students.models import Student
from companies.models import Company

class Evaluation(models.Model):
    class EvaluatorType(models.TextChoices):
        COMPANY = 'COMPANY', 'Empresa'
        STUDENT = 'STUDENT', 'Estudiante'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='evaluations', verbose_name='Proyecto')
    
    # Quién evalúa
    evaluator_type = models.CharField(max_length=10, choices=EvaluatorType.choices, verbose_name='Tipo de Evaluador')
    evaluator_id = models.PositiveIntegerField() # ID del User (Student o Company)

    # A quién se evalúa
    evaluated_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='received_evaluations', null=True, blank=True, verbose_name='Estudiante Evaluado')
    evaluated_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='received_evaluations', null=True, blank=True, verbose_name='Empresa Evaluada')

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Calificación (1-5)'
    )
    comment = models.TextField(verbose_name='Comentario')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Evaluación'
        verbose_name_plural = 'Evaluaciones'
        ordering = ['-created_at']
        # Un evaluador solo puede hacer una evaluación por entidad en un proyecto
        unique_together = [('project', 'evaluator_type', 'evaluator_id', 'evaluated_student'), 
                           ('project', 'evaluator_type', 'evaluator_id', 'evaluated_company')]

    def __str__(self):
        return f'Evaluación en {self.project.title} ({self.get_rating_display()} estrellas)'
