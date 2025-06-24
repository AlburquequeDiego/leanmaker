from django.db import models
from django.conf import settings
from companies.models import Company
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
import uuid

class Project(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
        ('paused', 'Pausado'),
    )
    
    MODALITY_CHOICES = (
        ('remote', 'Remoto'),
        ('onsite', 'Presencial'),
        ('hybrid', 'Híbrido'),
    )
    
    DIFFICULTY_CHOICES = (
        ('beginner', 'Básico'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='company_projects')
    
    # Detalles del proyecto
    area = models.CharField(max_length=100)  # Tecnología, Marketing, Diseño, etc.
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES, default='remote')
    location = models.CharField(max_length=200, blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')
    
    # Requisitos y habilidades
    required_skills = models.JSONField(default=list)  # Lista de habilidades requeridas
    preferred_skills = models.JSONField(default=list)  # Habilidades preferidas
    min_api_level = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    
    # Duración y horarios
    duration_months = models.PositiveIntegerField(default=3)
    hours_per_week = models.PositiveIntegerField(default=20)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Compensación
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    payment_currency = models.CharField(max_length=3, default='USD')
    
    # Estado y métricas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    max_students = models.PositiveIntegerField(default=1)
    current_students = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    # Configuración adicional
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    tags = models.JSONField(default=list)  # Etiquetas para búsqueda
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.company_name or self.company.email}"
    
    @property
    def is_available(self):
        """Verifica si el proyecto está disponible para aplicaciones"""
        return (
            self.status == 'published' and 
            self.current_students < self.max_students and
            self.company.is_active
        )
    
    @property
    def completion_percentage(self):
        """Calcula el porcentaje de completado basado en fechas"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if today <= self.start_date:
            return 0
        elif today >= self.end_date:
            return 100
        
        total_days = (self.end_date - self.start_date).days
        elapsed_days = (today - self.start_date).days
        return min(100, (elapsed_days / total_days) * 100)
    
    def increment_views(self):
        """Incrementa el contador de vistas"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def increment_applications(self):
        """Incrementa el contador de aplicaciones"""
        self.applications_count += 1
        self.save(update_fields=['applications_count'])

class ProjectApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('reviewing', 'En Revisión'),
        ('interviewed', 'Entrevistado'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
        ('withdrawn', 'Retirado'),
        ('completed', 'Completado'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_applications')
    
    # Información de la aplicación
    cover_letter = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    compatibility_score = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Fechas
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    
    # Notas y comentarios
    company_notes = models.TextField(blank=True, null=True)
    student_notes = models.TextField(blank=True, null=True)
    
    # Información adicional
    portfolio_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    
    class Meta:
        db_table = 'project_applications'
        verbose_name = 'Aplicación a Proyecto'
        verbose_name_plural = 'Aplicaciones a Proyectos'
        ordering = ['-applied_at']
        unique_together = ['project', 'student']
    
    def __str__(self):
        return f"{self.student.get_full_name()} -> {self.project.title}"
    
    def accept(self):
        """Acepta la aplicación"""
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Incrementar estudiantes actuales en el proyecto
        self.project.current_students += 1
        self.project.save(update_fields=['current_students'])
    
    def reject(self, notes=None):
        """Rechaza la aplicación"""
        self.status = 'rejected'
        self.responded_at = timezone.now()
        if notes:
            self.company_notes = notes
        self.save()
    
    def schedule_interview(self, interview_date):
        """Programa una entrevista"""
        self.status = 'interviewed'
        self.save()
        
        # Crear evento de entrevista
        from calendar_events.models import CalendarEvent
        CalendarEvent.objects.create(
            title=f"Entrevista: {self.project.title}",
            description=f"Entrevista para el proyecto {self.project.title}",
            start_date=interview_date,
            end_date=interview_date,
            user=self.student,
            event_type='interview',
            related_application=self
        )

class ProjectMember(models.Model):
    ROLE_CHOICES = (
        ('student', 'Estudiante'),
        ('mentor', 'Mentor'),
        ('supervisor', 'Supervisor'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Fechas
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(blank=True, null=True)
    
    # Métricas
    hours_worked = models.PositiveIntegerField(default=0)
    tasks_completed = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'project_members'
        verbose_name = 'Miembro del Proyecto'
        verbose_name_plural = 'Miembros del Proyecto'
        unique_together = ['project', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.title} ({self.get_role_display()})"
