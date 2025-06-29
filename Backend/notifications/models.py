from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Usuario
from projects.models import Proyecto, AplicacionProyecto
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid

class Notification(models.Model):
    TYPE_CHOICES = (
        # Notificaciones de proyectos
        ('project_published', 'Proyecto Publicado'),
        ('project_updated', 'Proyecto Actualizado'),
        ('project_cancelled', 'Proyecto Cancelado'),
        ('project_completed', 'Proyecto Completado'),
        
        # Notificaciones de aplicaciones
        ('application_submitted', 'Aplicación Enviada'),
        ('application_reviewed', 'Aplicación Revisada'),
        ('application_accepted', 'Aplicación Aceptada'),
        ('application_rejected', 'Aplicación Rechazada'),
        ('application_withdrawn', 'Aplicación Retirada'),
        
        # Notificaciones de entrevistas
        ('interview_scheduled', 'Entrevista Programada'),
        ('interview_reminder', 'Recordatorio de Entrevista'),
        ('interview_cancelled', 'Entrevista Cancelada'),
        
        # Notificaciones de evaluaciones
        ('evaluation_received', 'Evaluación Recibida'),
        ('evaluation_requested', 'Evaluación Solicitada'),
        ('evaluation_completed', 'Evaluación Completada'),
        
        # Notificaciones de sistema
        ('system_announcement', 'Anuncio del Sistema'),
        ('maintenance_notice', 'Aviso de Mantenimiento'),
        ('feature_update', 'Actualización de Funcionalidad'),
        
        # Notificaciones de strikes
        ('strike_received', 'Strike Recibido'),
        ('strike_warning', 'Advertencia de Strike'),
        ('strike_suspension', 'Suspensión por Strikes'),
        
        # Notificaciones de horas
        ('hours_submitted', 'Horas Enviadas'),
        ('hours_approved', 'Horas Aprobadas'),
        ('hours_rejected', 'Horas Rechazadas'),
        
        # Notificaciones de perfil
        ('profile_updated', 'Perfil Actualizado'),
        ('verification_completed', 'Verificación Completada'),
        ('api_level_upgraded', 'Nivel de API Mejorado'),
        
        # Notificaciones de mensajes
        ('new_message', 'Nuevo Mensaje'),
        ('message_reply', 'Respuesta a Mensaje'),
        
        # Notificaciones de calendario
        ('event_reminder', 'Recordatorio de Evento'),
        ('event_cancelled', 'Evento Cancelado'),
        ('event_updated', 'Evento Actualizado'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Destinatario
    recipient = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notifications')
    
    # Contenido
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Estado
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    scheduled_for = models.DateTimeField(blank=True, null=True)  # Para notificaciones programadas
    
    # Datos adicionales (JSON)
    data = models.JSONField(default=dict)  # Datos específicos del tipo de notificación
    
    # Relaciones opcionales
    related_project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, blank=True, null=True, related_name='notifications')
    related_application = models.ForeignKey(AplicacionProyecto, on_delete=models.CASCADE, blank=True, null=True, related_name='notifications')
    related_user = models.ForeignKey(Usuario, on_delete=models.CASCADE, blank=True, null=True, related_name='sent_notifications')
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.recipient.get_full_name()} - {self.title}"
    
    def mark_as_read(self):
        """Marca la notificación como leída"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def archive(self):
        """Archiva la notificación"""
        self.is_archived = True
        self.save(update_fields=['is_archived'])
    
    @property
    def is_urgent(self):
        """Verifica si la notificación es urgente"""
        return self.priority == 'urgent'
    
    @property
    def time_ago(self):
        """Retorna el tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f"{diff.days} día{'s' if diff.days != 1 else ''}"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hora{'s' if hours != 1 else ''}"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minuto{'s' if minutes != 1 else ''}"
        else:
            return "Ahora mismo"

class NotificationTemplate(models.Model):
    """Plantillas para notificaciones automáticas"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    notification_type = models.CharField(max_length=30, choices=Notification.TYPE_CHOICES)
    
    # Contenido de la plantilla
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    
    # Configuración
    is_active = models.BooleanField(default=True)
    priority = models.CharField(max_length=10, choices=Notification.PRIORITY_CHOICES, default='medium')
    
    # Variables disponibles en la plantilla
    available_variables = models.JSONField(default=list)
    
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
    enabled_types = models.JSONField(default=list)  # Lista de tipos habilitados
    
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
        return f"Preferencias de {self.user.get_full_name()}"
    
    def is_type_enabled(self, notification_type):
        """Verifica si un tipo de notificación está habilitado"""
        return notification_type in self.enabled_types
    
    def is_quiet_hours(self):
        """Verifica si estamos en horas silenciosas"""
        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        from django.utils import timezone
        now = timezone.now().time()
        return self.quiet_hours_start <= now <= self.quiet_hours_end
