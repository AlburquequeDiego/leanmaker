from django.db import models
from django.conf import settings

def student_cv_path(instance, filename):
    # El archivo se subirá a MEDIA_ROOT/cvs/user_<id>/<filename>
    return f'cvs/user_{instance.user.id}/{filename}'

class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='student_profile'
    )
    university = models.CharField(max_length=255, blank=True, verbose_name='Universidad')
    major = models.CharField(max_length=255, blank=True, verbose_name='Carrera')
    semester = models.PositiveIntegerField(null=True, blank=True, verbose_name='Semestre')
    bio = models.TextField(blank=True, verbose_name='Biografía')
    skills = models.TextField(blank=True, help_text='Separar habilidades por comas', verbose_name='Habilidades')
    linkedin_profile = models.URLField(blank=True, verbose_name='Perfil de LinkedIn')
    cv = models.FileField(upload_to=student_cv_path, null=True, blank=True, verbose_name='Currículum Vitae')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}" if self.user.first_name else self.user.email
