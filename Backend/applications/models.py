from django.db import models
from django.conf import settings
from projects.models import Project
from students.models import Student

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pendiente'
        UNDER_REVIEW = 'UNDER_REVIEW', 'En Revisión'
        INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', 'Entrevista Programada'
        ACCEPTED = 'ACCEPTED', 'Aceptada'
        REJECTED = 'REJECTED', 'Rechazada'
        WITHDRAWN = 'WITHDRAWN', 'Retirada'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='student_applications', verbose_name='Proyecto')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='student_applications', verbose_name='Estudiante')
    
    application_date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Postulación')
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING, verbose_name='Estado')
    
    cover_letter = models.TextField(blank=True, verbose_name='Carta de Presentación')

    class Meta:
        verbose_name = 'Postulación'
        verbose_name_plural = 'Postulaciones'
        # Un estudiante solo puede postular una vez a un mismo proyecto
        unique_together = ('project', 'student')
        ordering = ['-application_date']

    def __str__(self):
        return f'Postulación de {self.student} a {self.project.title}'
