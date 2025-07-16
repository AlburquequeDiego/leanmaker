from django.db import models
from users.models import User
from students.models import Estudiante
from companies.models import Empresa

class NotificationTemplate(models.Model):
    """Modelo para plantillas de notificaciones masivas"""
    name = models.CharField(max_length=200)
    notification_type = models.CharField(max_length=30, default='announcement')
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='notification_templates_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_templates_mass'
        verbose_name = 'Plantilla de Notificación Masiva'
        verbose_name_plural = 'Plantillas de Notificaciones Masivas'
        unique_together = ['name', 'notification_type']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.notification_type})"

class MassNotification(models.Model):
    """
    Modelo para notificaciones masivas
    Permite enviar notificaciones a múltiples usuarios simultáneamente
    """
    NOTIFICATION_TYPE_CHOICES = [
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

    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('scheduled', 'Programada'),
        ('sending', 'Enviando'),
        ('sent', 'Enviada'),
        ('cancelled', 'Cancelada'),
        ('failed', 'Fallida'),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200, help_text="Título de la notificación")
    message = models.TextField(help_text="Contenido de la notificación")
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        default='announcement',
        help_text="Tipo de notificación"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        help_text="Prioridad de la notificación"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Estado de la notificación"
    )
    
    # Destinatarios
    target_students = models.ManyToManyField(
        Estudiante,
        blank=True,
        related_name='mass_notifications_received',
        help_text="Estudiantes destinatarios"
    )
    target_companies = models.ManyToManyField(
        Empresa,
        blank=True,
        related_name='mass_notifications_received',
        help_text="Empresas destinatarias"
    )
    target_all_students = models.BooleanField(
        default=False,
        help_text="Enviar a todos los estudiantes"
    )
    target_all_companies = models.BooleanField(
        default=False,
        help_text="Enviar a todas las empresas"
    )
    
    # Programación
    scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora programada para el envío"
    )
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora cuando se envió"
    )
    
    # Estadísticas
    total_recipients = models.IntegerField(
        default=0,
        help_text="Total de destinatarios"
    )
    sent_count = models.IntegerField(
        default=0,
        help_text="Número de notificaciones enviadas"
    )
    failed_count = models.IntegerField(
        default=0,
        help_text="Número de notificaciones fallidas"
    )
    read_count = models.IntegerField(
        default=0,
        help_text="Número de notificaciones leídas"
    )
    
    # Metadatos
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mass_notifications_created',
        help_text="Usuario que creó la notificación"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mass_notifications'
        verbose_name = 'Notificación Masiva'
        verbose_name_plural = 'Notificaciones Masivas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    @property
    def is_scheduled(self):
        """Indica si la notificación está programada"""
        return self.status == 'scheduled' and self.scheduled_at

    @property
    def is_sent(self):
        """Indica si la notificación fue enviada"""
        return self.status == 'sent'

    @property
    def success_rate(self):
        """Calcula la tasa de éxito del envío"""
        if self.total_recipients > 0:
            return (self.sent_count / self.total_recipients) * 100
        return 0

    @property
    def read_rate(self):
        """Calcula la tasa de lectura"""
        if self.sent_count > 0:
            return (self.read_count / self.sent_count) * 100
        return 0

    def calculate_recipients(self):
        """Calcula el total de destinatarios de forma optimizada"""
        count = 0
        
        if self.target_all_students:
            # Usar count() directamente sin cargar objetos
            count += Estudiante.objects.only('id').count()
        else:
            # Usar count() en la relación many-to-many
            count += self.target_students.only('id').count()
            
        if self.target_all_companies:
            # Usar count() directamente sin cargar objetos
            count += Empresa.objects.only('id').count()
        else:
            # Usar count() en la relación many-to-many
            count += self.target_companies.only('id').count()
            
        self.total_recipients = count
        # Usar update() en lugar de save() para evitar triggers adicionales
        MassNotification.objects.filter(id=self.id).update(total_recipients=count)
        return count

    def mark_as_sent(self):
        """Marca la notificación como enviada"""
        from django.utils import timezone
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])

    def increment_sent_count(self):
        """Incrementa el contador de envíos exitosos"""
        self.sent_count += 1
        self.save(update_fields=['sent_count'])

    def increment_failed_count(self):
        """Incrementa el contador de envíos fallidos"""
        self.failed_count += 1
        self.save(update_fields=['failed_count'])

    def increment_read_count(self):
        """Incrementa el contador de lecturas"""
        self.read_count += 1
        self.save(update_fields=['read_count']) 