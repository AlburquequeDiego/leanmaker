from django.db import models
from django.conf import settings
from companies.models import Empresa
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Usuario
import uuid

class Proyecto(models.Model):
    ESTADOS = (
        ('borrador', 'Borrador'),
        ('publicado', 'Publicado'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
        ('pausado', 'Pausado'),
    )
    
    MODALIDADES = (
        ('remoto', 'Remoto'),
        ('presencial', 'Presencial'),
        ('hibrido', 'Híbrido'),
    )
    
    NIVELES_DIFICULTAD = (
        ('basico', 'Básico'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    empresa = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='proyectos_empresa')
    
    # Detalles del proyecto
    area = models.CharField(max_length=100)  # Tecnología, Marketing, Diseño, etc.
    modalidad = models.CharField(max_length=20, choices=MODALIDADES, default='remoto')
    ubicacion = models.CharField(max_length=200, blank=True, null=True)
    dificultad = models.CharField(max_length=20, choices=NIVELES_DIFICULTAD, default='intermedio')
    
    # Requisitos y habilidades
    habilidades_requeridas = models.JSONField(default=list)  # Lista de habilidades requeridas
    habilidades_preferidas = models.JSONField(default=list)  # Habilidades preferidas
    nivel_api_minimo = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    
    # Duración y horarios
    duracion_meses = models.PositiveIntegerField(default=3)
    horas_por_semana = models.PositiveIntegerField(default=20)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    
    # Compensación
    es_pagado = models.BooleanField(default=False)
    monto_pago = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    moneda_pago = models.CharField(max_length=3, default='USD')
    
    # Estado y métricas
    estado = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    max_estudiantes = models.PositiveIntegerField(default=1)
    estudiantes_actuales = models.PositiveIntegerField(default=0)
    aplicaciones_count = models.PositiveIntegerField(default=0)
    vistas_count = models.PositiveIntegerField(default=0)
    
    # Fechas
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_publicacion = models.DateTimeField(blank=True, null=True)
    
    # Configuración adicional
    es_destacado = models.BooleanField(default=False)
    es_urgente = models.BooleanField(default=False)
    etiquetas = models.JSONField(default=list)  # Etiquetas para búsqueda
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.empresa.nombre_empresa or self.empresa.email}"
    
    @property
    def esta_disponible(self):
        """Verifica si el proyecto está disponible para aplicaciones"""
        return (
            self.estado == 'publicado' and 
            self.estudiantes_actuales < self.max_estudiantes and
            self.empresa.esta_activo
        )
    
    @property
    def porcentaje_completado(self):
        """Calcula el porcentaje de completado basado en fechas"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if today <= self.fecha_inicio:
            return 0
        elif today >= self.fecha_fin:
            return 100
        
        total_dias = (self.fecha_fin - self.fecha_inicio).days
        dias_transcurridos = (today - self.fecha_inicio).days
        return min(100, (dias_transcurridos / total_dias) * 100)
    
    def incrementar_vistas(self):
        """Incrementa el contador de vistas"""
        self.vistas_count += 1
        self.save(update_fields=['vistas_count'])
    
    def incrementar_aplicaciones(self):
        """Incrementa el contador de aplicaciones"""
        self.aplicaciones_count += 1
        self.save(update_fields=['aplicaciones_count'])

class AplicacionProyecto(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('revisando', 'En Revisión'),
        ('entrevistado', 'Entrevistado'),
        ('aceptado', 'Aceptado'),
        ('rechazado', 'Rechazado'),
        ('retirado', 'Retirado'),
        ('completado', 'Completado'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='aplicaciones')
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='aplicaciones_estudiante')
    
    # Información de la aplicación
    carta_presentacion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    puntaje_compatibilidad = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Fechas
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)
    fecha_revision = models.DateTimeField(blank=True, null=True)
    fecha_respuesta = models.DateTimeField(blank=True, null=True)
    
    # Notas y comentarios
    notas_empresa = models.TextField(blank=True, null=True)
    notas_estudiante = models.TextField(blank=True, null=True)
    
    # Información adicional
    url_portfolio = models.URLField(blank=True, null=True)
    url_github = models.URLField(blank=True, null=True)
    url_linkedin = models.URLField(blank=True, null=True)
    
    class Meta:
        db_table = 'project_applications'
        verbose_name = 'Aplicación a Proyecto'
        verbose_name_plural = 'Aplicaciones a Proyectos'
        ordering = ['-fecha_aplicacion']
        unique_together = ['proyecto', 'estudiante']
    
    def __str__(self):
        return f"{self.estudiante.get_full_name()} -> {self.proyecto.titulo}"
    
    def aceptar(self):
        """Acepta la aplicación"""
        self.estado = 'aceptado'
        self.fecha_respuesta = timezone.now()
        self.save()
        
        # Incrementar estudiantes actuales en el proyecto
        self.proyecto.estudiantes_actuales += 1
        self.proyecto.save(update_fields=['estudiantes_actuales'])
    
    def rechazar(self, notas=None):
        """Rechaza la aplicación"""
        self.estado = 'rechazado'
        self.fecha_respuesta = timezone.now()
        if notas:
            self.notas_empresa = notas
        self.save()
    
    def programar_entrevista(self, fecha_entrevista):
        """Programa una entrevista"""
        self.estado = 'entrevistado'
        self.save()
        
        # Crear evento de entrevista
        from calendar_events.models import EventoCalendario
        EventoCalendario.objects.create(
            titulo=f"Entrevista: {self.proyecto.titulo}",
            descripcion=f"Entrevista para el proyecto {self.proyecto.titulo}",
            fecha_inicio=fecha_entrevista,
            fecha_fin=fecha_entrevista,
            usuario=self.estudiante,
            tipo_evento='entrevista',
            aplicacion_relacionada=self
        )

class MiembroProyecto(models.Model):
    ROLES = (
        ('estudiante', 'Estudiante'),
        ('mentor', 'Mentor'),
        ('supervisor', 'Supervisor'),
        ('coordinador', 'Coordinador'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='miembros')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='membresias_proyecto')
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
    
    class Meta:
        db_table = 'project_members'
        verbose_name = 'Miembro del Proyecto'
        verbose_name_plural = 'Miembros del Proyecto'
        unique_together = ['proyecto', 'usuario']
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.proyecto.titulo} ({self.get_rol_display()})"
