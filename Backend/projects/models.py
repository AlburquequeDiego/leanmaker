from django.db import models
from django.conf import settings
from companies.models import Empresa
from areas.models import Area
from trl_levels.models import TRLLevel
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
import uuid
from django.utils import timezone
import json

class Proyecto(models.Model):
    """
    Modelo de proyecto que coincide exactamente con el interface Project del frontend
    """
    MODALITY_CHOICES = (
        ('remote', 'Remoto'),
        ('onsite', 'Presencial'),
        ('hybrid', 'Híbrido'),
    )
    
    DIFFICULTY_CHOICES = (
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    )
    
    STATUS_CHOICES = (
        ('open', 'Abierto'),
        ('in-progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    )
    
    # Campos básicos (coinciden exactamente con interface Project del frontend)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='proyectos', null=True, blank=True)
    status = models.ForeignKey('project_status.ProjectStatus', on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos')
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos')
    
    # Campos obligatorios - coinciden con frontend
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()  # Campo agregado para coincidir con frontend
    
    # Campos opcionales (NULL permitido) - coinciden con frontend
    trl = models.ForeignKey(TRLLevel, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos')
    api_level = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(4)])
    required_hours = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    
    # Campos de configuración - coinciden con frontend
    min_api_level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    max_students = models.IntegerField(default=1)
    current_students = models.IntegerField(default=0)
    duration_weeks = models.IntegerField(default=12)  # Campo agregado para coincidir con frontend
    hours_per_week = models.IntegerField(default=20)
    
    # Campos de fechas (opcionales) - coinciden con frontend
    start_date = models.DateField(null=True, blank=True)
    estimated_end_date = models.DateField(null=True, blank=True)
    real_end_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)  # Campo agregado para coincidir con frontend
    
    # Campos adicionales - coinciden con frontend
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES, default='remote')
    location = models.CharField(max_length=200, null=True, blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')
    
    # Campos JSON (se almacenan como texto en SQL Server) - coinciden con frontend
    required_skills = models.TextField(null=True, blank=True)  # JSON array
    preferred_skills = models.TextField(null=True, blank=True)  # JSON array
    tags = models.TextField(null=True, blank=True)  # JSON array
    technologies = models.TextField(null=True, blank=True)  # JSON array - campo agregado para coincidir con frontend
    benefits = models.TextField(null=True, blank=True)  # JSON array - campo agregado para coincidir con frontend
    
    # Campos de pago - coinciden con frontend
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_currency = models.CharField(max_length=3, default='USD')
    stipend_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Campo agregado para coincidir con frontend
    stipend_currency = models.CharField(max_length=3, default='USD')  # Campo agregado para coincidir con frontend
    
    # Campos de métricas
    applications_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    
    # Campos de estado
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # Campos de fechas - coinciden con frontend
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.company_name if self.company else 'Sin empresa'}"
    
    def get_required_skills_list(self):
        """Obtiene la lista de habilidades requeridas como lista de Python - coincide con frontend"""
        if self.required_skills:
            try:
                return json.loads(self.required_skills)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_required_skills_list(self, skills_list):
        """Establece la lista de habilidades requeridas desde una lista de Python - coincide con frontend"""
        if isinstance(skills_list, list):
            self.required_skills = json.dumps(skills_list, ensure_ascii=False)
        else:
            self.required_skills = None
    
    def get_preferred_skills_list(self):
        """Obtiene la lista de habilidades preferidas como lista de Python - coincide con frontend"""
        if self.preferred_skills:
            try:
                return json.loads(self.preferred_skills)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_preferred_skills_list(self, skills_list):
        """Establece la lista de habilidades preferidas desde una lista de Python - coincide con frontend"""
        if isinstance(skills_list, list):
            self.preferred_skills = json.dumps(skills_list, ensure_ascii=False)
        else:
            self.preferred_skills = None
    
    def get_tags_list(self):
        """Obtiene la lista de tags como lista de Python - coincide con frontend"""
        if self.tags:
            try:
                return json.loads(self.tags)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_tags_list(self, tags_list):
        """Establece la lista de tags desde una lista de Python - coincide con frontend"""
        if isinstance(tags_list, list):
            self.tags = json.dumps(tags_list, ensure_ascii=False)
        else:
            self.tags = None
    
    def get_technologies_list(self):
        """Obtiene la lista de tecnologías como lista de Python - coincide con frontend"""
        if self.technologies:
            try:
                return json.loads(self.technologies)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_technologies_list(self, technologies_list):
        """Establece la lista de tecnologías desde una lista de Python - coincide con frontend"""
        if isinstance(technologies_list, list):
            self.technologies = json.dumps(technologies_list, ensure_ascii=False)
        else:
            self.technologies = None
    
    def get_benefits_list(self):
        """Obtiene la lista de beneficios como lista de Python - coincide con frontend"""
        if self.benefits:
            try:
                return json.loads(self.benefits)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_benefits_list(self, benefits_list):
        """Establece la lista de beneficios desde una lista de Python - coincide con frontend"""
        if isinstance(benefits_list, list):
            self.benefits = json.dumps(benefits_list, ensure_ascii=False)
        else:
            self.benefits = None
    
    @property
    def esta_activo(self):
        """Verifica si el proyecto está activo"""
        return self.status and self.status.name.lower() in ['active', 'open', 'en curso']
    
    @property
    def puede_aplicar(self):
        """Verifica si se pueden recibir aplicaciones"""
        return (
            self.esta_activo and 
            self.current_students < self.max_students and
            self.applications_count < 50  # Límite de aplicaciones
        )
    
    @property
    def porcentaje_ocupacion(self):
        """Calcula el porcentaje de ocupación del proyecto"""
        if self.max_students == 0:
            return 0
        return (self.current_students / self.max_students) * 100
    
    def incrementar_vistas(self):
        """Incrementa el contador de vistas"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def incrementar_aplicaciones(self):
        """Incrementa el contador de aplicaciones"""
        self.applications_count += 1
        self.save(update_fields=['applications_count'])
    
    def agregar_estudiante(self):
        """Agrega un estudiante al proyecto"""
        if self.current_students < self.max_students:
            self.current_students += 1
            self.save(update_fields=['current_students'])
            return True
        return False
    
    def remover_estudiante(self):
        """Remueve un estudiante del proyecto"""
        if self.current_students > 0:
            self.current_students -= 1
            self.save(update_fields=['current_students'])
            return True
        return False
    
    def marcar_como_featured(self):
        """Marca el proyecto como destacado"""
        self.is_featured = True
        self.save(update_fields=['is_featured'])
    
    def marcar_como_urgente(self):
        """Marca el proyecto como urgente"""
        self.is_urgent = True
        self.save(update_fields=['is_urgent'])
    
    def publicar(self):
        """Publica el proyecto"""
        self.published_at = timezone.now()
        self.save(update_fields=['published_at'])

class HistorialEstadosProyecto(models.Model):
    """
    Modelo para el historial de cambios de estado de proyectos
    """
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='historial_estados')
    status = models.ForeignKey('project_status.ProjectStatus', on_delete=models.CASCADE, related_name='historial_cambios')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='cambios_estado_proyecto')
    
    # Campos adicionales
    fecha_cambio = models.DateTimeField(auto_now_add=True)
    comentario = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'project_status_changes'
        verbose_name = 'Historial de Estado de Proyecto'
        verbose_name_plural = 'Historial de Estados de Proyectos'
        ordering = ['-fecha_cambio']
    
    def __str__(self):
        return f"{self.project.title} - {self.status.name} ({self.fecha_cambio})"

class AplicacionProyecto(models.Model):
    """
    Modelo de aplicación que coincide exactamente con el interface Application del frontend
    """
    ESTADOS = (
        ('pending', 'Pendiente'),
        ('reviewing', 'En Revisión'),
        ('interviewed', 'Entrevistado'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
        ('withdrawn', 'Retirado'),
        ('completed', 'Completado'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='project_applications')
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aplicaciones_estudiante')
    
    # Información de la aplicación - coinciden con frontend
    cover_letter = models.TextField()  # Campo renombrado para coincidir con frontend
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pending')
    compatibility_score = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(100)])  # Campo renombrado para coincidir con frontend
    
    # Fechas - coinciden con frontend
    applied_at = models.DateTimeField(auto_now_add=True)  # Campo renombrado para coincidir con frontend
    reviewed_at = models.DateTimeField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    responded_at = models.DateTimeField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    
    # Notas y comentarios - coinciden con frontend
    company_notes = models.TextField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    student_notes = models.TextField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    
    # Información adicional - coinciden con frontend
    portfolio_url = models.URLField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    github_url = models.URLField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    linkedin_url = models.URLField(blank=True, null=True)  # Campo renombrado para coincidir con frontend
    
    # Campos de fechas adicionales
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)
    fecha_revision = models.DateTimeField(blank=True, null=True)
    fecha_respuesta = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_applications'
        verbose_name = 'Aplicación a Proyecto'
        verbose_name_plural = 'Aplicaciones a Proyectos'
        ordering = ['-fecha_aplicacion']
        unique_together = ['proyecto', 'estudiante']
    
    def __str__(self):
        return f"{self.estudiante.full_name} -> {self.proyecto.title}"
    
    def aceptar(self):
        """Acepta la aplicación"""
        self.estado = 'accepted'
        self.responded_at = timezone.now()
        self.save(update_fields=['estado', 'responded_at'])
        
        # Agregar estudiante al proyecto
        self.proyecto.agregar_estudiante()
    
    def rechazar(self, notas=None):
        """Rechaza la aplicación"""
        self.estado = 'rejected'
        self.responded_at = timezone.now()
        if notas:
            self.company_notes = notas
        self.save(update_fields=['estado', 'responded_at', 'company_notes'])
    
    def programar_entrevista(self, fecha_entrevista):
        """Programa una entrevista"""
        self.estado = 'interviewed'
        self.reviewed_at = timezone.now()
        self.save(update_fields=['estado', 'reviewed_at'])
        
        # Crear evento de entrevista usando signals o método separado
        # La creación del evento se manejará en signals para evitar importación circular
        pass

class MiembroProyecto(models.Model):
    ROLES = (
        ('estudiante', 'Estudiante'),
        ('mentor', 'Mentor'),
        ('supervisor', 'Supervisor'),
        ('coordinador', 'Coordinador'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='miembros')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='membresias_proyecto')
    rol = models.CharField(max_length=20, choices=ROLES, default='estudiante')
    
    # Fechas
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    fecha_salida = models.DateTimeField(blank=True, null=True)
    
    # Métricas
    horas_trabajadas = models.PositiveIntegerField(default=0)
    tareas_completadas = models.PositiveIntegerField(default=0)
    evaluacion_promedio = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    
    # Estado
    esta_activo = models.BooleanField(default=True)
    es_verificado = models.BooleanField(default=False)
    
    # Información adicional
    responsabilidades = models.TextField(blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_members'
        verbose_name = 'Miembro del Proyecto'
        verbose_name_plural = 'Miembros del Proyecto'
        unique_together = ['proyecto', 'usuario']
    
    def __str__(self):
        return f"{self.usuario.full_name} - {self.proyecto.title} ({self.get_rol_display()})"
