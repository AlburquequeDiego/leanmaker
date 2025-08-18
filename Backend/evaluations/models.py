from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from projects.models import Proyecto, AplicacionProyecto
from companies.models import Empresa
from students.models import Estudiante
from users.models import User

import uuid
import json
from django.db.models.signals import post_save, post_delete
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
    
    # NUEVO: Tipo de evaluación para distinguir dirección
    EVALUATION_TYPE_CHOICES = [
        ('company_to_student', 'Empresa a Estudiante'),
        ('student_to_company', 'Estudiante a Empresa'),
    ]

    # Campos básicos - coinciden con frontend
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='evaluations')
    student = models.ForeignKey('students.Estudiante', on_delete=models.CASCADE, related_name='evaluations_received')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_done')

    
    # NUEVO: Tipo de evaluación
    evaluation_type = models.CharField(
        max_length=25, 
        choices=EVALUATION_TYPE_CHOICES,
        default='company_to_student',
        help_text='Dirección de la evaluación'
    )
    
    # Campos de evaluación - coinciden con frontend
    score = models.FloatField(validators=[MinValueValidator(1), MaxValueValidator(5)])  # Ahora solo de 1 a 5
    comments = models.TextField(blank=True, null=True)
    evaluation_date = models.DateField(auto_now_add=True)  # Campo agregado para coincidir con frontend
    
    # NUEVO: Criterios específicos por tipo de evaluación
    criteria_scores = models.JSONField(default=dict, blank=True, help_text='Puntajes por criterio específico')
    
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
        # NUEVO: Índice para consultas eficientes
        indexes = [
            models.Index(fields=['evaluation_type', 'status']),
            models.Index(fields=['student', 'evaluation_type']),
            models.Index(fields=['company', 'evaluation_type']),
        ]

    def __str__(self):
        return f"{self.student.user.full_name} - {self.project.title} ({self.get_evaluation_type_display()})"
    
    def save(self, *args, **kwargs):
        # Sincronizar campos para compatibilidad
        if not self.date:
            self.date = self.evaluation_date
        if not self.overall_rating:
            self.overall_rating = self.score
        
        # Determinar automáticamente el tipo de evaluación
        if not self.evaluation_type:
            if hasattr(self.evaluator, 'role') and self.evaluator.role == 'company':
                self.evaluation_type = 'company_to_student'
            elif hasattr(self.evaluator, 'role') and self.evaluator.role == 'student':
                self.evaluation_type = 'student_to_company'
        
        # Guardar la evaluación
        super().save(*args, **kwargs)
        
        # Actualizar company si es necesario para evitar errores en signals
        if not hasattr(self, 'company') and self.evaluation_type == 'student_to_company':
            try:
                self.company = self.project.company
            except:
                pass
        
        # Log para debugging
        print(f"💾 [EVALUATION] Guardada evaluación {self.id}: {self.evaluation_type}, score: {self.score}")
    
    def delete(self, *args, **kwargs):
        # Guardar referencias antes de eliminar para los signals
        evaluation_type = self.evaluation_type
        student_id = self.student.id if self.student else None
        company_id = self.project.company.id if self.project and self.project.company else None
        
        # Eliminar la evaluación
        super().delete(*args, **kwargs)
        
        # Log para debugging
        print(f"🗑️ [EVALUATION] Eliminada evaluación {self.id}: {evaluation_type}")
        
        # Actualizar ratings después de eliminar (los signals se encargarán)
        if evaluation_type == 'company_to_student' and student_id:
            try:
                from students.models import Estudiante
                student = Estudiante.objects.get(id=student_id)
                student.actualizar_calificacion()
            except Exception as e:
                print(f"⚠️ Error actualizando GPA después de eliminar: {e}")
        
        if evaluation_type == 'student_to_company' and company_id:
            try:
                from companies.models import Empresa
                company = Empresa.objects.get(id=company_id)
                company.actualizar_calificacion()
            except Exception as e:
                print(f"⚠️ Error actualizando rating después de eliminar: {e}")

    def get_strengths_list(self):
        return [s.strip() for s in (self.strengths or '').split(',') if s.strip()]

    def get_areas_for_improvement_list(self):
        return [a.strip() for a in (self.areas_for_improvement or '').split(',') if a.strip()]
    
    # NUEVO: Método para obtener criterios específicos
    def get_criteria_scores(self):
        """Retorna los puntajes por criterio como diccionario"""
        return self.criteria_scores or {}
    
    def set_criteria_scores(self, criteria_dict):
        """Establece los puntajes por criterio"""
        self.criteria_scores = criteria_dict
        self.save(update_fields=['criteria_scores'])





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
    """Signal para actualizar GPA del estudiante cuando se crea/actualiza una evaluación"""
    try:
        if instance.evaluation_type == 'company_to_student' and instance.student:
            print(f"🔄 [SIGNAL] Actualizando GPA para estudiante: {instance.student.user.full_name}")
            instance.student.actualizar_calificacion()
    except Exception as e:
        print(f"❌ [SIGNAL] Error actualizando GPA del estudiante: {e}")
        import traceback
        traceback.print_exc()

@receiver(post_save, sender=Evaluation)
def actualizar_rating_empresa(sender, instance, **kwargs):
    """Signal para actualizar rating de la empresa cuando se crea/actualiza una evaluación"""
    try:
        if instance.evaluation_type == 'student_to_company' and instance.project and instance.project.company:
            print(f"🔄 [SIGNAL] Actualizando rating para empresa: {instance.project.company.company_name}")
            instance.project.company.actualizar_calificacion()
    except Exception as e:
        print(f"❌ [SIGNAL] Error actualizando rating de la empresa: {e}")
        import traceback
        traceback.print_exc()

@receiver(post_delete, sender=Evaluation)
def actualizar_gpa_estudiante_delete(sender, instance, **kwargs):
    """Signal para actualizar GPA del estudiante cuando se elimina una evaluación"""
    try:
        if instance.evaluation_type == 'company_to_student' and instance.student:
            print(f"🔄 [SIGNAL DELETE] Actualizando GPA para estudiante: {instance.student.user.full_name}")
            instance.student.actualizar_calificacion()
    except Exception as e:
        print(f"❌ [SIGNAL DELETE] Error actualizando GPA del estudiante: {e}")

@receiver(post_delete, sender=Evaluation)
def actualizar_rating_empresa_delete(sender, instance, **kwargs):
    """Signal para actualizar rating de la empresa cuando se elimina una evaluación"""
    try:
        if instance.evaluation_type == 'student_to_company' and instance.project and instance.project.company:
            print(f"🔄 [SIGNAL DELETE] Actualizando rating para empresa: {instance.project.company.company_name}")
            instance.project.company.actualizar_calificacion()
    except Exception as e:
        print(f"❌ [SIGNAL DELETE] Error actualizando rating de la empresa: {e}")
