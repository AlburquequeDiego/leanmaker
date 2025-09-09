"""
🎓 MODELOS PARA FUNCIONALIDADES DEL DOCENTE

Este módulo contiene todos los modelos específicos para las funcionalidades
del rol docente en el sistema LeanMaker.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from students.models import Estudiante
from projects.models import Proyecto
from evaluations.models import Evaluation
import uuid
import json
from django.utils import timezone


class TeacherStudent(models.Model):
    """
    Relación entre docente y estudiante para supervisión académica
    """
    SUPERVISION_STATUS_CHOICES = [
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('suspended', 'Suspendido'),
        ('transferred', 'Transferido'),
    ]
    
    SUPERVISION_TYPE_CHOICES = [
        ('thesis', 'Tesis'),
        ('internship', 'Práctica'),
        ('project', 'Proyecto'),
        ('course', 'Curso'),
        ('mentoring', 'Mentoría'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='supervised_students',
        limit_choices_to={'role': 'teacher'}
    )
    student = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name='supervising_teachers'
    )
    
    # Información de supervisión
    supervision_type = models.CharField(
        max_length=20, 
        choices=SUPERVISION_TYPE_CHOICES, 
        default='project'
    )
    status = models.CharField(
        max_length=20, 
        choices=SUPERVISION_STATUS_CHOICES, 
        default='active'
    )
    
    # Fechas
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    
    # Métricas de supervisión
    total_hours_supervised = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    meetings_count = models.PositiveIntegerField(default=0)
    evaluations_count = models.PositiveIntegerField(default=0)
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    objectives = models.TextField(blank=True, null=True)  # Objetivos de supervisión
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_students'
        verbose_name = 'Estudiante Supervisado'
        verbose_name_plural = 'Estudiantes Supervisados'
        unique_together = ['teacher', 'student']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.teacher.full_name} → {self.student.user.full_name} ({self.get_supervision_type_display()})"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def progress_percentage(self):
        """Calcula el porcentaje de progreso basado en fechas"""
        if not self.expected_completion_date:
            return 0
        
        total_days = (self.expected_completion_date - self.start_date).days
        if total_days <= 0:
            return 100
        
        elapsed_days = (timezone.now().date() - self.start_date).days
        return min(100, max(0, (elapsed_days / total_days) * 100))


class TeacherProject(models.Model):
    """
    Relación entre docente y proyecto para supervisión y evaluación
    """
    SUPERVISION_ROLE_CHOICES = [
        ('supervisor', 'Supervisor Principal'),
        ('co_supervisor', 'Co-Supervisor'),
        ('evaluator', 'Evaluador'),
        ('advisor', 'Asesor'),
    ]
    
    PROJECT_PHASE_CHOICES = [
        ('planning', 'Planificación'),
        ('development', 'Desarrollo'),
        ('testing', 'Pruebas'),
        ('deployment', 'Despliegue'),
        ('maintenance', 'Mantenimiento'),
        ('completed', 'Completado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='supervised_projects',
        limit_choices_to={'role': 'teacher'}
    )
    project = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='supervising_teachers'
    )
    
    # Información de supervisión
    role = models.CharField(
        max_length=20, 
        choices=SUPERVISION_ROLE_CHOICES, 
        default='supervisor'
    )
    current_phase = models.CharField(
        max_length=20, 
        choices=PROJECT_PHASE_CHOICES, 
        default='planning'
    )
    
    # Fechas
    assigned_date = models.DateField(auto_now_add=True)
    last_review_date = models.DateField(null=True, blank=True)
    next_review_date = models.DateField(null=True, blank=True)
    
    # Métricas de supervisión
    review_count = models.PositiveIntegerField(default=0)
    feedback_count = models.PositiveIntegerField(default=0)
    hours_supervised = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Información adicional
    supervision_notes = models.TextField(blank=True, null=True)
    evaluation_criteria = models.TextField(blank=True, null=True)  # JSON
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_projects'
        verbose_name = 'Proyecto Supervisado'
        verbose_name_plural = 'Proyectos Supervisados'
        unique_together = ['teacher', 'project']
        ordering = ['-assigned_date']
    
    def __str__(self):
        return f"{self.teacher.full_name} → {self.project.title} ({self.get_role_display()})"
    
    def get_evaluation_criteria_list(self):
        """Obtiene los criterios de evaluación como lista"""
        if self.evaluation_criteria:
            try:
                return json.loads(self.evaluation_criteria)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_evaluation_criteria_list(self, criteria_list):
        """Establece los criterios de evaluación desde una lista"""
        if isinstance(criteria_list, list):
            self.evaluation_criteria = json.dumps(criteria_list, ensure_ascii=False)
        else:
            self.evaluation_criteria = '[]'


class TeacherEvaluation(models.Model):
    """
    Evaluaciones específicas realizadas por docentes
    """
    EVALUATION_TYPE_CHOICES = [
        ('progress', 'Evaluación de Progreso'),
        ('midterm', 'Evaluación Intermedia'),
        ('final', 'Evaluación Final'),
        ('peer_review', 'Revisión por Pares'),
        ('self_assessment', 'Autoevaluación'),
    ]
    
    EVALUATION_STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completada'),
        ('published', 'Publicada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='teacher_evaluations',
        limit_choices_to={'role': 'teacher'}
    )
    student = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name='teacher_evaluations_received'
    )
    project = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='teacher_evaluations'
    )
    
    # Información de evaluación
    evaluation_type = models.CharField(
        max_length=20, 
        choices=EVALUATION_TYPE_CHOICES, 
        default='progress'
    )
    status = models.CharField(
        max_length=20, 
        choices=EVALUATION_STATUS_CHOICES, 
        default='draft'
    )
    
    # Calificaciones (escala 1-5)
    technical_skills = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    communication = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    problem_solving = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    teamwork = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    punctuality = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    # Calificación general
    overall_score = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    # Comentarios
    strengths = models.TextField(blank=True, null=True)
    areas_for_improvement = models.TextField(blank=True, null=True)
    general_comments = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    
    # Fechas
    evaluation_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_evaluations'
        verbose_name = 'Evaluación de Docente'
        verbose_name_plural = 'Evaluaciones de Docente'
        ordering = ['-evaluation_date']
    
    def __str__(self):
        return f"{self.teacher.full_name} → {self.student.user.full_name} ({self.get_evaluation_type_display()})"
    
    def calculate_overall_score(self):
        """Calcula la calificación general basada en las calificaciones individuales"""
        scores = [
            self.technical_skills,
            self.communication,
            self.problem_solving,
            self.teamwork,
            self.punctuality
        ]
        
        valid_scores = [score for score in scores if score is not None]
        if valid_scores:
            return sum(valid_scores) / len(valid_scores)
        return None
    
    def save(self, *args, **kwargs):
        # Calcular calificación general automáticamente
        if not self.overall_score:
            self.overall_score = self.calculate_overall_score()
        super().save(*args, **kwargs)


class TeacherReport(models.Model):
    """
    Reportes generados por docentes sobre estudiantes y proyectos
    """
    REPORT_TYPE_CHOICES = [
        ('student_progress', 'Progreso del Estudiante'),
        ('project_status', 'Estado del Proyecto'),
        ('academic_performance', 'Rendimiento Académico'),
        ('supervision_summary', 'Resumen de Supervisión'),
        ('evaluation_summary', 'Resumen de Evaluaciones'),
        ('custom', 'Reporte Personalizado'),
    ]
    
    REPORT_STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('generated', 'Generado'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='teacher_reports',
        limit_choices_to={'role': 'teacher'}
    )
    
    # Información del reporte
    title = models.CharField(max_length=200)
    report_type = models.CharField(
        max_length=30, 
        choices=REPORT_TYPE_CHOICES, 
        default='custom'
    )
    status = models.CharField(
        max_length=20, 
        choices=REPORT_STATUS_CHOICES, 
        default='draft'
    )
    
    # Contenido del reporte
    content = models.TextField()
    summary = models.TextField(blank=True, null=True)
    
    # Filtros y parámetros del reporte
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    student_filter = models.ForeignKey(
        Estudiante, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='teacher_reports'
    )
    project_filter = models.ForeignKey(
        Proyecto, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='teacher_reports'
    )
    
    # Metadatos
    parameters = models.TextField(blank=True, null=True)  # JSON con parámetros adicionales
    file_path = models.CharField(max_length=500, blank=True, null=True)  # Ruta del archivo generado
    
    # Fechas
    generated_date = models.DateTimeField(auto_now_add=True)
    published_date = models.DateTimeField(null=True, blank=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_reports'
        verbose_name = 'Reporte de Docente'
        verbose_name_plural = 'Reportes de Docente'
        ordering = ['-generated_date']
    
    def __str__(self):
        return f"{self.title} - {self.teacher.full_name}"
    
    def get_parameters_dict(self):
        """Obtiene los parámetros como diccionario"""
        if self.parameters:
            try:
                return json.loads(self.parameters)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_parameters_dict(self, params_dict):
        """Establece los parámetros desde un diccionario"""
        if isinstance(params_dict, dict):
            self.parameters = json.dumps(params_dict, ensure_ascii=False)
        else:
            self.parameters = '{}'


class TeacherSchedule(models.Model):
    """
    Horarios y disponibilidad del docente
    """
    DAY_CHOICES = [
        ('monday', 'Lunes'),
        ('tuesday', 'Martes'),
        ('wednesday', 'Miércoles'),
        ('thursday', 'Jueves'),
        ('friday', 'Viernes'),
        ('saturday', 'Sábado'),
        ('sunday', 'Domingo'),
    ]
    
    ACTIVITY_TYPE_CHOICES = [
        ('office_hours', 'Horas de Oficina'),
        ('meeting', 'Reunión'),
        ('class', 'Clase'),
        ('supervision', 'Supervisión'),
        ('research', 'Investigación'),
        ('unavailable', 'No Disponible'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='teacher_schedule',
        limit_choices_to={'role': 'teacher'}
    )
    
    # Información del horario
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    activity_type = models.CharField(
        max_length=20, 
        choices=ACTIVITY_TYPE_CHOICES, 
        default='office_hours'
    )
    
    # Información adicional
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    
    # Configuración
    is_recurring = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Fechas específicas (para eventos no recurrentes)
    specific_date = models.DateField(null=True, blank=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_schedule'
        verbose_name = 'Horario de Docente'
        verbose_name_plural = 'Horarios de Docente'
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.teacher.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
    
    @property
    def duration_hours(self):
        """Calcula la duración en horas"""
        start = self.start_time
        end = self.end_time
        
        # Convertir a minutos desde medianoche
        start_minutes = start.hour * 60 + start.minute
        end_minutes = end.hour * 60 + end.minute
        
        # Manejar horarios que cruzan medianoche
        if end_minutes < start_minutes:
            end_minutes += 24 * 60
        
        duration_minutes = end_minutes - start_minutes
        return duration_minutes / 60.0


# Señales para mantener datos sincronizados
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


@receiver(post_save, sender=TeacherStudent)
def update_student_supervision_count(sender, instance, created, **kwargs):
    """Actualiza el conteo de supervisión del estudiante"""
    if created:
        # Actualizar métricas del estudiante si es necesario
        pass


@receiver(post_save, sender=TeacherProject)
def update_project_supervision_count(sender, instance, created, **kwargs):
    """Actualiza el conteo de supervisión del proyecto"""
    if created:
        # Actualizar métricas del proyecto si es necesario
        pass


@receiver(post_save, sender=TeacherEvaluation)
def update_evaluation_stats(sender, instance, created, **kwargs):
    """Actualiza estadísticas de evaluaciones"""
    if created:
        # Actualizar contadores de evaluaciones
        if hasattr(instance, 'teacher_student'):
            instance.teacher_student.evaluations_count += 1
            instance.teacher_student.save(update_fields=['evaluations_count'])
