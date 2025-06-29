from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from users.models import Usuario


class ActivityLog(models.Model):
    """
    Modelo para logs de actividad del sistema
    Registra todas las acciones importantes realizadas por los usuarios
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        help_text="Usuario que realizó la acción"
    )
    action = models.CharField(
        max_length=100,
        help_text="Tipo de acción realizada"
    )
    entity_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Tipo de entidad relacionada"
    )
    entity_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="ID de la entidad relacionada"
    )
    details = models.TextField(
        null=True,
        blank=True,
        help_text="Detalles adicionales de la actividad"
    )
    ip_address = models.CharField(
        max_length=45,
        null=True,
        blank=True,
        help_text="Dirección IP del usuario"
    )
    user_agent = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text="User agent del navegador"
    )
    # Campos para referenciar cualquier modelo
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Tipo de contenido relacionado"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="ID del objeto relacionado"
    )
    content_object = GenericForeignKey(
        'content_type',
        'object_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        verbose_name = 'Log de Actividad'
        verbose_name_plural = 'Logs de Actividad'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.action} ({self.created_at})"

    @classmethod
    def log_activity(cls, user, action, description, content_object=None, ip_address=None, user_agent=None):
        """
        Método de clase para crear logs de actividad fácilmente
        """
        content_type = None
        object_id = None
        
        if content_object:
            content_type = ContentType.objects.get_for_model(content_object)
            object_id = content_object.pk

        return cls.objects.create(
            user=user,
            action=action,
            entity_type=content_type.model if content_type else None,
            entity_id=object_id,
            details=description,
            ip_address=ip_address,
            user_agent=user_agent
        )

    @property
    def is_recent(self):
        """Indica si la actividad es reciente (últimas 24 horas)"""
        from django.utils import timezone
        from datetime import timedelta
        return self.created_at >= timezone.now() - timedelta(days=1)
