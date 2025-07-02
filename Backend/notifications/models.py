from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Usuario
from projects.models import Proyecto, AplicacionProyecto
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid
import json
from django.utils import timezone

class Notification(models.Model):
    """
    Modelo de notificación que coincide exactamente con el interface Notification del frontend
    """
    TYPE_CHOICES = [
        ('info', 'Información'),
        ('success', 'Éxito'),
        ('warning', 'Advertencia'),
        ('error', 'Error'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('normal', 'Normal'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]

    # Campos básicos - coinciden con frontend
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Campos de tipo y estado - coinciden con frontend
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='info')  # Campo renombrado para coincidir con frontend
    read = models.BooleanField(default=False)  # Campo renombrado para coincidir con frontend
    
    # Campos adicionales - coinciden con frontend
    related_url = models.CharField(max_length=500, null=True, blank=True)  # Campo agregado para coincidir con frontend
    
    # Campos adicionales para compatibilidad
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    action_url = models.CharField(max_length=500, null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    # Campos de fechas adicionales
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Sincronizar campos para compatibilidad
        if not self.notification_type:
            self.notification_type = self.type
        if not self.is_read:
            self.is_read = self.read
        if not self.action_url:
            self.action_url = self.related_url
        
        super().save(*args, **kwargs)
    
    def marcar_como_leida(self):
        """Marca la notificación como leída"""
        self.read = True
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['read', 'is_read', 'read_at'])
    
    def marcar_como_no_leida(self):
        """Marca la notificación como no leída"""
        self.read = False
        self.is_read = False
        self.read_at = None
        self.save(update_fields=['read', 'is_read', 'read_at'])

class NotificationTemplate(models.Model):
    """Plantillas para notificaciones automáticas"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    notification_type = models.CharField(max_length=30, choices=Notification.TYPE_CHOICES, default='info')
    
    # Contenido de la plantilla
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    
    # Configuración
    is_active = models.BooleanField(default=True)
    priority = models.CharField(max_length=10, choices=Notification.PRIORITY_CHOICES, default='medium')
    
    # Variables disponibles en la plantilla
    available_variables = models.TextField(default='[]')  # JSON array
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Plantilla de Notificación'
        verbose_name_plural = 'Plantillas de Notificaciones'
        unique_together = ['name', 'notification_type']
    
    def __str__(self):
        return f"{self.name} ({self.get_notification_type_display()})"
    
    def get_available_variables_list(self):
        """Obtiene la lista de variables disponibles como lista de Python"""
        if self.available_variables:
            try:
                return json.loads(self.available_variables)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_available_variables_list(self, variables_list):
        """Establece la lista de variables disponibles desde una lista de Python"""
        if isinstance(variables_list, list):
            self.available_variables = json.dumps(variables_list, ensure_ascii=False)
        else:
            self.available_variables = '[]'
    
    def render(self, context):
        """Renderiza la plantilla con el contexto proporcionado"""
        title = self.title_template
        message = self.message_template
        
        for key, value in context.items():
            title = title.replace(f"{{{{{key}}}}}", str(value))
            message = message.replace(f"{{{{{key}}}}}", str(value))
        
        return title, message

class NotificationPreference(models.Model):
    """Preferencias de notificación por usuario"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Tipos de notificación habilitados
    enabled_types = models.TextField(default='[]')  # JSON array de tipos habilitados
    
    # Configuración de canales
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    
    # Configuración de frecuencia
    digest_frequency = models.CharField(max_length=20, choices=(
        ('immediate', 'Inmediato'),
        ('hourly', 'Cada hora'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
    ), default='immediate')
    
    # Configuración de horarios
    quiet_hours_start = models.TimeField(blank=True, null=True)
    quiet_hours_end = models.TimeField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Preferencia de Notificación'
        verbose_name_plural = 'Preferencias de Notificaciones'
        unique_together = ['user']
    
    def __str__(self):
        return f"Preferencias de {self.user.full_name}"
    
    def get_enabled_types_list(self):
        """Obtiene la lista de tipos habilitados como lista de Python"""
        if self.enabled_types:
            try:
                return json.loads(self.enabled_types)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_enabled_types_list(self, types_list):
        """Establece la lista de tipos habilitados desde una lista de Python"""
        if isinstance(types_list, list):
            self.enabled_types = json.dumps(types_list, ensure_ascii=False)
        else:
            self.enabled_types = '[]'
    
    def is_type_enabled(self, notification_type):
        """Verifica si un tipo de notificación está habilitado"""
        return notification_type in self.get_enabled_types_list()
    
    def is_quiet_hours(self):
        """Verifica si estamos en horas silenciosas"""
        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        now = timezone.now().time()
        return self.quiet_hours_start <= now <= self.quiet_hours_end
