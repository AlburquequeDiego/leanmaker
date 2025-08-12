from django.db import models
from django.conf import settings


class MassNotification(models.Model):
    """Modelo para notificaciones masivas"""
    
    NOTIFICATION_TYPES = [
        ('announcement', 'Anuncio'),
        ('reminder', 'Recordatorio'),
        ('alert', 'Alerta'),
        ('update', 'Actualización'),
        ('event', 'Evento'),
        ('deadline', 'Fecha límite'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('normal', 'Normal'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    TARGET_AUDIENCES = [
        ('all', 'Todos los usuarios'),
        ('students', 'Solo estudiantes'),
        ('companies', 'Solo empresas'),
        ('admins', 'Solo administradores'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Título')
    message = models.TextField(verbose_name='Mensaje')
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='announcement',
        verbose_name='Tipo de notificación'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name='Prioridad'
    )
    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCES,
        default='all',
        verbose_name='Audiencia objetivo'
    )
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mass_notifications_sent',
        verbose_name='Enviado por'
    )
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name='Programado para')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Enviado el')
    is_sent = models.BooleanField(default=False, verbose_name='Enviado')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    
    # Campos adicionales para eventos especiales
    event_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha del evento')
    event_location = models.CharField(max_length=200, null=True, blank=True, verbose_name='Ubicación del evento')
    event_description = models.TextField(null=True, blank=True, verbose_name='Descripción detallada del evento')
    event_capacity = models.PositiveIntegerField(null=True, blank=True, verbose_name='Capacidad del evento')
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('workshop', 'Taller'),
            ('conference', 'Conferencia'),
            ('networking', 'Networking'),
            ('presentation', 'Presentación'),
            ('meeting', 'Reunión'),
            ('other', 'Otro'),
        ],
        null=True,
        blank=True,
        verbose_name='Tipo de evento'
    )
    
    class Meta:
        db_table = 'mass_notifications_massnotification'
        verbose_name = 'Notificación masiva'
        verbose_name_plural = 'Notificaciones masivas'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.get_target_audience_display()}"
    
    @property
    def is_event(self):
        """Verifica si es una notificación de evento"""
        return self.notification_type == 'event'
    



class NotificationTemplate(models.Model):
    """Modelo para plantillas de notificaciones"""
    
    name = models.CharField(max_length=100, verbose_name='Nombre')
    subject = models.CharField(max_length=200, verbose_name='Asunto')
    content = models.TextField(verbose_name='Cuerpo del mensaje')
    template_type = models.CharField(max_length=20, default='email', verbose_name='Tipo de plantilla')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'mass_notifications_notificationtemplate'
        verbose_name = 'Plantilla de notificación'
        verbose_name_plural = 'Plantillas de notificaciones'
        ordering = ['name']
        
    def __str__(self):
        return self.name 