"""
🎯 MODELOS PARA DESAFÍOS COLECTIVOS

Este módulo contiene el modelo para los desafíos colectivos que las empresas
pueden publicar para la academia (trimestrales/semestrales).
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from companies.models import Empresa
from areas.models import Area
from users.models import User
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
        Empresa, 
        on_delete=models.CASCADE, 
        related_name='desafios_colectivos',
        help_text="Empresa que publica el desafío"
    )
    area = models.ForeignKey(
        Area, 
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