from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from projects.models import Project, ProjectApplication
from students.models import Student
from companies.models import Company
from users.models import User
import uuid

class Evaluation(models.Model):
    CATEGORY_CHOICES = (
        ('technical', 'Habilidades Técnicas'),
        ('soft_skills', 'Habilidades Blandas'),
        ('punctuality', 'Puntualidad'),
        ('teamwork', 'Trabajo en Equipo'),
        ('communication', 'Comunicación'),
        ('problem_solving', 'Resolución de Problemas'),
        ('leadership', 'Liderazgo'),
        ('creativity', 'Creatividad'),
        ('overall', 'Evaluación General'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='evaluations')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_evaluations')
    application = models.ForeignKey(ProjectApplication, on_delete=models.CASCADE, related_name='evaluations', blank=True, null=True)
    
    # Evaluación
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    evaluation_date = models.DateField()
    
    # Configuración
    is_anonymous = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'evaluations'
        verbose_name = 'Evaluación'
        verbose_name_plural = 'Evaluaciones'
        ordering = ['-created_at']
        unique_together = ['project', 'student', 'evaluator', 'category']
    
    def __str__(self):
        return f"{self.evaluator.get_full_name()} -> {self.student.get_full_name()} ({self.get_category_display()})"
    
    @property
    def rating_stars(self):
        """Retorna el rating en formato de estrellas"""
        return '★' * self.rating + '☆' * (5 - self.rating)

class EvaluationTemplate(models.Model):
    """Plantillas de evaluación para diferentes tipos de proyectos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Categorías incluidas en la plantilla
    categories = models.JSONField(default=list)  # Lista de categorías
    
    # Configuración
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'evaluation_templates'
        verbose_name = 'Plantilla de Evaluación'
        verbose_name_plural = 'Plantillas de Evaluación'
    
    def __str__(self):
        return self.name

class StudentSkill(models.Model):
    """Habilidades de los estudiantes con niveles de experiencia"""
    
    LEVEL_CHOICES = (
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
        ('expert', 'Experto'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    
    # Información de la habilidad
    skill_name = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    years_experience = models.PositiveIntegerField(default=0)
    
    # Validación
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='verified_skills', blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_skills'
        verbose_name = 'Habilidad del Estudiante'
        verbose_name_plural = 'Habilidades de Estudiantes'
        unique_together = ['student', 'skill_name']
        ordering = ['skill_name']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.skill_name} ({self.get_level_display()})"

class StudentPortfolio(models.Model):
    """Portafolio de trabajos del estudiante"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_items')
    
    # Información del proyecto
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    
    # Tecnologías utilizadas
    technologies = models.JSONField(default=list)
    
    # Imágenes del proyecto
    images = models.JSONField(default=list)  # URLs de imágenes
    
    # Fechas
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Configuración
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'student_portfolio'
        verbose_name = 'Proyecto de Portafolio'
        verbose_name_plural = 'Proyectos de Portafolio'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.title}"

class StudentAchievement(models.Model):
    """Logros y certificaciones del estudiante"""
    
    TYPE_CHOICES = (
        ('certification', 'Certificación'),
        ('award', 'Premio'),
        ('competition', 'Competencia'),
        ('publication', 'Publicación'),
        ('patent', 'Patente'),
        ('other', 'Otro'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    
    # Información del logro
    title = models.CharField(max_length=200)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Detalles
    issuer = models.CharField(max_length=200)  # Quien emitió el logro
    issue_date = models.DateField()
    expiry_date = models.DateField(blank=True, null=True)
    
    # Archivos
    certificate_url = models.URLField(blank=True, null=True)
    badge_url = models.URLField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_achievements'
        verbose_name = 'Logro del Estudiante'
        verbose_name_plural = 'Logros de Estudiantes'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.title}"
    
    @property
    def is_expired(self):
        """Verifica si el logro ha expirado"""
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.expiry_date
