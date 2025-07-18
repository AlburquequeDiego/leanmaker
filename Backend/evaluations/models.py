from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from projects.models import Proyecto, AplicacionProyecto
from companies.models import Empresa
from students.models import Estudiante
from users.models import User
from evaluation_categories.models import EvaluationCategory
import uuid
import json
from django.db.models.signals import post_save
from django.dispatch import receiver

class Evaluation(models.Model):
    """
    Modelo de evaluación que coincide exactamente con el interface Evaluation del frontend
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('flagged', 'Marcada'),
    ]
    TYPE_CHOICES = [
        ('intermediate', 'Intermedia'),
        ('final', 'Final'),
    ]

    # Campos básicos - coinciden con frontend
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='evaluations')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_received')  # Campo renombrado para coincidir con frontend
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_done')
    category = models.ForeignKey(EvaluationCategory, on_delete=models.CASCADE, related_name='evaluations')  # Campo agregado para coincidir con frontend
    
    # Campos de evaluación - coinciden con frontend
    score = models.FloatField(validators=[MinValueValidator(1), MaxValueValidator(5)])  # Ahora solo de 1 a 5
    comments = models.TextField(blank=True, null=True)
    evaluation_date = models.DateField(auto_now_add=True)  # Campo agregado para coincidir con frontend
    
    # Campos adicionales para compatibilidad
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='evaluations', null=True, blank=True)
    evaluator_role = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='final')
    overall_rating = models.FloatField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])  # Ahora solo de 1 a 5
    strengths = models.TextField(blank=True, null=True, help_text='Fortalezas (separadas por coma)')
    areas_for_improvement = models.TextField(blank=True, null=True, help_text='Áreas de mejora (separadas por coma)')
    project_duration = models.CharField(max_length=50, blank=True, null=True)
    technologies = models.CharField(max_length=200, blank=True, null=True)
    deliverables = models.CharField(max_length=200, blank=True, null=True)
    
    # Campos de fechas - coinciden con frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Evaluación'
        verbose_name_plural = 'Evaluaciones'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.project.title} ({self.get_type_display()})"
    
    def save(self, *args, **kwargs):
        # Sincronizar campos para compatibilidad
        if not self.date:
            self.date = self.evaluation_date
        if not self.overall_rating:
            self.overall_rating = self.score
        
        super().save(*args, **kwargs)

    def get_strengths_list(self):
        return [s.strip() for s in (self.strengths or '').split(',') if s.strip()]

    def get_areas_for_improvement_list(self):
        return [a.strip() for a in (self.areas_for_improvement or '').split(',') if a.strip()]

class EvaluationCategoryScore(models.Model):
    """Puntaje por categoría/criterio en una evaluación"""
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='categories')
    category = models.ForeignKey(EvaluationCategory, on_delete=models.CASCADE)
    rating = models.FloatField()

    class Meta:
        verbose_name = 'Puntaje de Categoría'
        verbose_name_plural = 'Puntajes de Categoría'
        unique_together = ('evaluation', 'category')

    def __str__(self):
        return f"{self.evaluation} - {self.category}: {self.rating}"

class EvaluationTemplate(models.Model):
    """Plantillas de evaluación para diferentes tipos de proyectos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Categorías incluidas en la plantilla (JSON como TextField)
    categories = models.TextField(default='[]')  # Lista de categorías
    
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
    
    def get_categories_list(self):
        """Obtiene la lista de categorías como lista de Python"""
        if self.categories:
            try:
                return json.loads(self.categories)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_categories_list(self, categories_list):
        """Establece la lista de categorías desde una lista de Python"""
        if isinstance(categories_list, list):
            self.categories = json.dumps(categories_list, ensure_ascii=False)
        else:
            self.categories = '[]'

class StudentSkill(models.Model):
    """Habilidades de los estudiantes con niveles de experiencia"""
    
    LEVEL_CHOICES = (
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
        ('expert', 'Experto'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='skill_records')
    
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
        return f"{self.student.user.full_name} - {self.skill_name} ({self.get_level_display()})"

class StudentPortfolio(models.Model):
    """Portafolio de trabajos del estudiante"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='portfolio_items')
    
    # Información del proyecto
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    
    # Tecnologías utilizadas (JSON como TextField)
    technologies = models.TextField(default='[]')
    
    # Imágenes del proyecto (JSON como TextField)
    images = models.TextField(default='[]')  # URLs de imágenes
    
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
        return f"{self.student.user.full_name} - {self.title}"
    
    def get_technologies_list(self):
        """Obtiene la lista de tecnologías como lista de Python"""
        if self.technologies:
            try:
                return json.loads(self.technologies)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_technologies_list(self, technologies_list):
        """Establece la lista de tecnologías desde una lista de Python"""
        if isinstance(technologies_list, list):
            self.technologies = json.dumps(technologies_list, ensure_ascii=False)
        else:
            self.technologies = '[]'
    
    def get_images_list(self):
        """Obtiene la lista de imágenes como lista de Python"""
        if self.images:
            try:
                return json.loads(self.images)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_images_list(self, images_list):
        """Establece la lista de imágenes desde una lista de Python"""
        if isinstance(images_list, list):
            self.images = json.dumps(images_list, ensure_ascii=False)
        else:
            self.images = '[]'

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
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='achievements')
    
    # Información del logro
    title = models.CharField(max_length=200)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    
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
        return f"{self.student.user.full_name} - {self.title}"
    
    @property
    def is_expired(self):
        """Verifica si el logro ha expirado"""
        if self.expiry_date:
            from django.utils import timezone
            return timezone.now().date() > self.expiry_date
        return False

@receiver(post_save, sender=Evaluation)
def actualizar_gpa_estudiante(sender, instance, **kwargs):
    try:
        # Buscar el perfil de estudiante correspondiente al usuario evaluado
        from students.models import Estudiante
        estudiante = Estudiante.objects.get(user=instance.student)
        estudiante.actualizar_calificacion()
    except Estudiante.DoesNotExist:
        pass
