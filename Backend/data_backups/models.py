from django.db import models
from users.models import User
import uuid

class DataBackups(models.Model):
    """Modelo para respaldos de datos del sistema"""
    
    BACKUP_TYPE_CHOICES = (
        ('full', 'Completo'),
        ('incremental', 'Incremental'),
        ('differential', 'Diferencial'),
        ('manual', 'Manual'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('expired', 'Expirado'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    backup_name = models.CharField(max_length=200, default='Backup automático')
    backup_type = models.CharField(max_length=50, choices=BACKUP_TYPE_CHOICES, default='manual')
    
    # Archivos
    file_url = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)
    file_path = models.CharField(max_length=500, blank=True, null=True)
    
    # Verificación
    checksum = models.CharField(max_length=128, blank=True, null=True)
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    # Usuario que creó el backup
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_backups', null=True, blank=True)
    
    class Meta:
        db_table = 'data_backups'
        verbose_name = 'Respaldo de Datos'
        verbose_name_plural = 'Respaldos de Datos'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.backup_name} ({self.get_backup_type_display()})"
    
    @property
    def is_expired(self):
        """Verifica si el backup ha expirado"""
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() > self.expires_at
        return False
