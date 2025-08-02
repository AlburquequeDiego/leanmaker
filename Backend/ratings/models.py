from django.db import models
from django.conf import settings
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto


class Rating(models.Model):
    """Modelo para calificaciones/ratings"""
    
    RATING_TYPES = [
        ('student_to_company', 'Estudiante a Empresa'),
        ('company_to_student', 'Empresa a Estudiante'),
        ('student_to_project', 'Estudiante a Proyecto'),
        ('company_to_project', 'Empresa a Proyecto'),
    ]
    
    rating_type = models.CharField(
        max_length=20,
        choices=RATING_TYPES,
        verbose_name='Tipo de calificación'
    )
    rating_value = models.IntegerField(
        verbose_name='Valor de calificación',
        help_text='Calificación del 1 al 5'
    )
    comment = models.TextField(
        blank=True,
        null=True,
        verbose_name='Comentario'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'ratings_rating'
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.get_rating_type_display()} - {self.rating_value}/5"


class StudentCompanyRating(models.Model):
    """Modelo para calificaciones de estudiantes a empresas"""
    
    student = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='company_ratings_given',
        verbose_name='Estudiante'
    )
    company = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='student_ratings_received',
        verbose_name='Empresa'
    )
    project = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name='student_company_ratings',
        verbose_name='Proyecto'
    )
    rating = models.ForeignKey(
        Rating,
        on_delete=models.CASCADE,
        related_name='student_company_ratings',
        verbose_name='Calificación'
    )
    
    class Meta:
        db_table = 'ratings_studentcompanyrating'
        verbose_name = 'Calificación de estudiante a empresa'
        verbose_name_plural = 'Calificaciones de estudiantes a empresas'
        unique_together = ['student', 'company', 'project']
        
    def __str__(self):
        return f"{self.student} → {self.company} ({self.rating.rating_value}/5)"


class CompanyStudentRating(models.Model):
    """Modelo para calificaciones de empresas a estudiantes"""
    
    company = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='student_ratings_given',
        verbose_name='Empresa'
    )
    student = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='company_ratings_received',
        verbose_name='Estudiante'
    )
    project = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name='company_student_ratings',
        verbose_name='Proyecto'
    )
    rating = models.ForeignKey(
        Rating,
        on_delete=models.CASCADE,
        related_name='company_student_ratings',
        verbose_name='Calificación'
    )
    
    class Meta:
        db_table = 'ratings_companystudentrating'
        verbose_name = 'Calificación de empresa a estudiante'
        verbose_name_plural = 'Calificaciones de empresas a estudiantes'
        unique_together = ['company', 'student', 'project']
        
    def __str__(self):
        return f"{self.company} → {self.student} ({self.rating.rating_value}/5)"


class ProjectRating(models.Model):
    """Modelo para calificaciones de proyectos"""
    
    RATING_CATEGORIES = [
        ('overall', 'General'),
        ('communication', 'Comunicación'),
        ('quality', 'Calidad'),
        ('timeliness', 'Puntualidad'),
        ('collaboration', 'Colaboración'),
    ]
    
    project = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name='Proyecto'
    )
    rated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_ratings_given',
        verbose_name='Calificado por'
    )
    category = models.CharField(
        max_length=20,
        choices=RATING_CATEGORIES,
        default='overall',
        verbose_name='Categoría'
    )
    rating = models.ForeignKey(
        Rating,
        on_delete=models.CASCADE,
        related_name='project_ratings',
        verbose_name='Calificación'
    )
    
    class Meta:
        db_table = 'ratings_projectrating'
        verbose_name = 'Calificación de proyecto'
        verbose_name_plural = 'Calificaciones de proyectos'
        unique_together = ['project', 'rated_by', 'category']
        
    def __str__(self):
        return f"{self.project} - {self.get_category_display()} ({self.rating.rating_value}/5)" 