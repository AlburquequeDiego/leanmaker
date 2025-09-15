"""
🎯 MODELOS PARA DESAFÍOS COLECTIVOS

Este módulo contiene el modelo para los desafíos colectivos que las empresas
pueden publicar para la academia (trimestrales/semestrales).
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
# Importaciones diferidas para evitar problemas circulares
import uuid
import json
from django.utils import timezone


class DesafioColectivo(models.Model):
    """
    Desafíos trimestrales/semestrales que las empresas publican para la academia
    """
    
    PERIOD_CHOICES = [
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Empresa', 
        on_delete=models.CASCADE, 
        related_name='desafios_colectivos',
        help_text="Empresa que publica el desafío"
    )
    area = models.ForeignKey(
        'areas.Area', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='desafios_colectivos',
        help_text="Área temática del desafío"
    )
    
    # Información básica del desafío
    title = models.CharField(
        max_length=200,
        help_text="Título del desafío colectivo"
    )
    description = models.TextField(
        help_text="Descripción detallada del desafío"
    )
    requirements = models.TextField(
        help_text="Contexto completo del problema"
    )
    
    # Campos específicos de desafíos académicos
    period_type = models.CharField(
        max_length=20, 
        choices=PERIOD_CHOICES, 
        default='trimestral',
        help_text="Tipo de período académico"
    )
    academic_year = models.CharField(
        max_length=10,
        help_text="Año académico (ej: 2024)"
    )
    
    # Campos de información detallada
    objetivo = models.TextField(
        blank=True, 
        null=True,
        help_text="Criterios de evaluación"
    )
    tipo = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="Recursos disponibles"
    )
    contacto = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="Información de contacto"
    )
    
    # Campos JSON para habilidades y tecnologías
    required_skills = models.TextField(
        null=True, 
        blank=True,
        help_text="Habilidades requeridas (JSON array)"
    )
    technologies = models.TextField(
        null=True, 
        blank=True,
        help_text="Tecnologías a utilizar (JSON array)"
    )
    benefits = models.TextField(
        null=True, 
        blank=True,
        help_text="Beneficios para los participantes (JSON array)"
    )
    
    # Estado y métricas
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        help_text="Estado actual del desafío"
    )
    applications_count = models.IntegerField(
        default=0,
        help_text="Número de aplicaciones recibidas"
    )
    views_count = models.IntegerField(
        default=0,
        help_text="Número de visualizaciones"
    )
    
    # Campos de configuración
    is_featured = models.BooleanField(
        default=False,
        help_text="Si el desafío está destacado"
    )
    is_urgent = models.BooleanField(
        default=False,
        help_text="Si el desafío es urgente"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Si el desafío está activo"
    )
    
    # Campos de fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'collective_challenges'
        verbose_name = 'Desafío Colectivo'
        verbose_name_plural = 'Desafíos Colectivos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.company_name} ({self.get_period_type_display()})"
    
    def get_required_skills_list(self):
        """Obtiene la lista de habilidades requeridas como lista de Python"""
        if self.required_skills:
            try:
                return json.loads(self.required_skills)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_required_skills_list(self, skills_list):
        """Establece la lista de habilidades requeridas desde una lista de Python"""
        if isinstance(skills_list, list):
            self.required_skills = json.dumps(skills_list, ensure_ascii=False)
        else:
            self.required_skills = None
    
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
            self.technologies = None
    
    def get_benefits_list(self):
        """Obtiene la lista de beneficios como lista de Python"""
        if self.benefits:
            try:
                return json.loads(self.benefits)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_benefits_list(self, benefits_list):
        """Establece la lista de beneficios desde una lista de Python"""
        if isinstance(benefits_list, list):
            self.benefits = json.dumps(benefits_list, ensure_ascii=False)
        else:
            self.benefits = None


# ========================================
# MODELOS ADICIONALES PARA DESAFÍOS COLECTIVOS ACADÉMICOS
# ========================================

class ChallengeArea(models.Model):
    """
    Áreas específicas para desafíos colectivos (similar a áreas pero específico para desafíos)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, help_text="Nombre del área de desafío")
    description = models.TextField(blank=True, null=True, help_text="Descripción del área")
    color = models.CharField(max_length=7, default='#007bff', help_text="Color hexadecimal")
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Icono del área")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'challenge_areas'
        verbose_name = 'Área de Desafío'
        verbose_name_plural = 'Áreas de Desafíos'
        ordering = ['name']

    def __str__(self):
        return self.name


class ChallengeQuestion(models.Model):
    """
    Preguntas estructuradas para desafíos colectivos (9 preguntas tipo TRLD)
    Orientadas a guiar el desarrollo y progreso del desafío
    """
    QUESTION_TYPE_CHOICES = [
        ('trld_1', 'TRLD 1 - Identificación del Problema'),
        ('trld_2', 'TRLD 2 - Análisis de Requerimientos'),
        ('trld_3', 'TRLD 3 - Diseño Conceptual'),
        ('trld_4', 'TRLD 4 - Planificación de Desarrollo'),
        ('trld_5', 'TRLD 5 - Implementación Inicial'),
        ('trld_6', 'TRLD 6 - Pruebas y Validación'),
        ('trld_7', 'TRLD 7 - Optimización y Mejoras'),
        ('trld_8', 'TRLD 8 - Documentación y Entrega'),
        ('trld_9', 'TRLD 9 - Evaluación Final y Retroalimentación'),
    ]
    
    EVALUATION_TYPE_CHOICES = [
        ('multiple_choice', 'Opción Múltiple'),
        ('text', 'Texto Libre'),
        ('scale', 'Escala'),
        ('file', 'Archivo'),
        ('mixed', 'Mixto'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    challenge = models.ForeignKey(
        DesafioColectivo, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    challenge_area = models.ForeignKey(
        ChallengeArea, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='questions'
    )
    
    # Información de la pregunta
    question_type = models.CharField(
        max_length=10, 
        choices=QUESTION_TYPE_CHOICES,
        help_text="Tipo de pregunta TRL"
    )
    evaluation_type = models.CharField(
        max_length=20, 
        choices=EVALUATION_TYPE_CHOICES,
        default='text'
    )
    question_text = models.TextField(help_text="Texto de la pregunta")
    description = models.TextField(blank=True, null=True, help_text="Descripción adicional")
    
    # Configuración de evaluación
    max_score = models.FloatField(
        default=5.0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    weight = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Peso de la pregunta en la evaluación total"
    )
    
    # Opciones para preguntas de opción múltiple
    options = models.TextField(
        blank=True, 
        null=True,
        help_text="Opciones de respuesta (JSON array)"
    )
    
    # Criterios de evaluación
    evaluation_criteria = models.TextField(
        blank=True, 
        null=True,
        help_text="Criterios de evaluación (JSON)"
    )
    
    # Configuración
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'challenge_questions'
        verbose_name = 'Pregunta de Desafío'
        verbose_name_plural = 'Preguntas de Desafíos'
        ordering = ['challenge', 'order']
        unique_together = ['challenge', 'question_type']

    def __str__(self):
        return f"{self.challenge.title} - {self.get_question_type_display()}"
    
    def get_options_list(self):
        """Obtiene las opciones como lista"""
        if self.options:
            try:
                return json.loads(self.options)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_options_list(self, options_list):
        """Establece las opciones desde una lista"""
        if isinstance(options_list, list):
            self.options = json.dumps(options_list, ensure_ascii=False)
        else:
            self.options = None


class TeacherSection(models.Model):
    """
    Secciones/clases creadas por profesores para desafíos colectivos
    """
    PERIOD_CHOICES = [
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'Planificación'),
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='teacher_sections',
        limit_choices_to={'role': 'teacher'}
    )
    challenge = models.ForeignKey(
        DesafioColectivo, 
        on_delete=models.CASCADE, 
        related_name='teacher_sections'
    )
    
    # Información de la sección
    section_name = models.CharField(max_length=200, help_text="Nombre de la sección/clase")
    description = models.TextField(blank=True, null=True, help_text="Descripción de la sección")
    
    # Configuración académica
    period_type = models.CharField(
        max_length=20, 
        choices=PERIOD_CHOICES, 
        default='trimestral'
    )
    academic_year = models.CharField(max_length=10, help_text="Año académico")
    semester = models.CharField(max_length=20, help_text="Semestre o trimestre")
    
    # Fechas
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField(null=True, blank=True)
    
    # Configuración
    max_students = models.PositiveIntegerField(
        default=30,
        help_text="Máximo número de estudiantes"
    )
    max_groups = models.PositiveIntegerField(
        default=5,
        help_text="Máximo número de grupos"
    )
    students_per_group = models.PositiveIntegerField(
        default=6,
        help_text="Estudiantes por grupo"
    )
    
    # Estado
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='planning'
    )
    
    # Métricas
    enrolled_students_count = models.PositiveIntegerField(default=0)
    active_groups_count = models.PositiveIntegerField(default=0)
    
    # Configuración adicional
    allow_individual_participation = models.BooleanField(
        default=True,
        help_text="Permitir participación individual además de grupal"
    )
    auto_assign_groups = models.BooleanField(
        default=False,
        help_text="Asignación automática de grupos"
    )
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_sections'
        verbose_name = 'Sección de Profesor'
        verbose_name_plural = 'Secciones de Profesores'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.section_name} - {self.teacher.full_name} ({self.get_period_type_display()})"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def enrollment_percentage(self):
        if self.max_students > 0:
            return (self.enrolled_students_count / self.max_students) * 100
        return 0


class StudentGroup(models.Model):
    """
    Grupos de estudiantes dentro de las secciones del profesor
    """
    STATUS_CHOICES = [
        ('forming', 'Formándose'),
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('disbanded', 'Disuelto'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(
        TeacherSection, 
        on_delete=models.CASCADE, 
        related_name='student_groups'
    )
    
    # Información del grupo
    group_name = models.CharField(max_length=200, help_text="Nombre del grupo")
    description = models.TextField(blank=True, null=True, help_text="Descripción del grupo")
    
    # Configuración
    max_members = models.PositiveIntegerField(
        default=6,
        help_text="Máximo número de miembros"
    )
    
    # Estado
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='forming'
    )
    
    # Métricas
    members_count = models.PositiveIntegerField(default=0)
    progress_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Fechas
    formed_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_groups'
        verbose_name = 'Grupo de Estudiantes'
        verbose_name_plural = 'Grupos de Estudiantes'
        ordering = ['section', 'group_name']

    def __str__(self):
        return f"{self.group_name} - {self.section.section_name}"
    
    @property
    def is_full(self):
        return self.members_count >= self.max_members
    
    @property
    def available_spots(self):
        return max(0, self.max_members - self.members_count)


class GroupMembership(models.Model):
    """
    Membresía de estudiantes en grupos
    """
    ROLE_CHOICES = [
        ('member', 'Miembro'),
        ('leader', 'Líder'),
        ('co_leader', 'Co-Líder'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        StudentGroup, 
        on_delete=models.CASCADE, 
        related_name='memberships'
    )
    student = models.ForeignKey(
        'students.Estudiante', 
        on_delete=models.CASCADE, 
        related_name='group_memberships'
    )
    
    # Información de membresía
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='member'
    )
    
    # Fechas
    joined_date = models.DateTimeField(auto_now_add=True)
    left_date = models.DateTimeField(null=True, blank=True)
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'group_memberships'
        verbose_name = 'Membresía de Grupo'
        verbose_name_plural = 'Membresías de Grupos'
        unique_together = ['group', 'student']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.group.group_name} ({self.get_role_display()})"


class ChallengeProgress(models.Model):
    """
    Seguimiento de progreso de estudiantes en desafíos colectivos
    """
    PROGRESS_STATUS_CHOICES = [
        ('not_started', 'No Iniciado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('needs_review', 'Necesita Revisión'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Estudiante', 
        on_delete=models.CASCADE, 
        related_name='challenge_progress'
    )
    challenge = models.ForeignKey(
        DesafioColectivo, 
        on_delete=models.CASCADE, 
        related_name='student_progress'
    )
    section = models.ForeignKey(
        TeacherSection, 
        on_delete=models.CASCADE, 
        related_name='student_progress',
        null=True, 
        blank=True
    )
    group = models.ForeignKey(
        StudentGroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='group_progress'
    )
    
    # Progreso por etapas TRLD
    trld_1_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_2_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_3_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_4_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_5_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_6_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_7_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_8_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trld_9_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Progreso general
    overall_progress = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Estado
    status = models.CharField(
        max_length=20, 
        choices=PROGRESS_STATUS_CHOICES, 
        default='not_started'
    )
    
    # Calificaciones
    current_grade = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    final_grade = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    # Respuestas y evaluaciones (manejadas directamente aquí)
    responses_data = models.TextField(
        blank=True, 
        null=True,
        help_text="Respuestas a las preguntas TRLD (JSON)"
    )
    teacher_feedback = models.TextField(
        blank=True, 
        null=True,
        help_text="Feedback general del profesor"
    )
    evaluation_notes = models.TextField(
        blank=True, 
        null=True,
        help_text="Notas de evaluación del profesor"
    )
    
    # Fechas importantes
    started_date = models.DateTimeField(null=True, blank=True)
    last_activity_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Fechas de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'challenge_progress'
        verbose_name = 'Progreso de Desafío'
        verbose_name_plural = 'Progresos de Desafíos'
        unique_together = ['student', 'challenge', 'section']
        ordering = ['-last_activity_date']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.challenge.title} ({self.overall_progress}%)"
    
    def calculate_overall_progress(self):
        """Calcula el progreso general basado en las etapas TRLD"""
        trld_progresses = [
            self.trld_1_progress,
            self.trld_2_progress,
            self.trld_3_progress,
            self.trld_4_progress,
            self.trld_5_progress,
            self.trld_6_progress,
            self.trld_7_progress,
            self.trld_8_progress,
            self.trld_9_progress,
        ]
        
        return sum(trld_progresses) / len(trld_progresses)
    
    def get_responses_data_dict(self):
        """Obtiene las respuestas como diccionario"""
        if self.responses_data:
            try:
                return json.loads(self.responses_data)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_responses_data_dict(self, responses_dict):
        """Establece las respuestas desde un diccionario"""
        if isinstance(responses_dict, dict):
            self.responses_data = json.dumps(responses_dict, ensure_ascii=False)
        else:
            self.responses_data = None
    
    def get_trld_response(self, trld_level):
        """Obtiene la respuesta para un nivel TRLD específico"""
        responses = self.get_responses_data_dict()
        return responses.get(f'trld_{trld_level}', {})
    
    def set_trld_response(self, trld_level, response_data):
        """Establece la respuesta para un nivel TRLD específico"""
        responses = self.get_responses_data_dict()
        responses[f'trld_{trld_level}'] = response_data
        self.set_responses_data_dict(responses)
    
    def save(self, *args, **kwargs):
        # Calcular progreso general automáticamente
        self.overall_progress = self.calculate_overall_progress()
        super().save(*args, **kwargs)