from django.db import models
from django.conf import settings

class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name='Destinatario'
    )
    title = models.CharField(max_length=255, verbose_name='Título')
    message = models.TextField(verbose_name='Mensaje')
    
    is_read = models.BooleanField(default=False, verbose_name='Leído')
    
    # Podríamos añadir un enlace opcional para redirigir al usuario
    link = models.URLField(blank=True, null=True, verbose_name='Enlace')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f'Notificación para {self.recipient.email}: {self.title}'
