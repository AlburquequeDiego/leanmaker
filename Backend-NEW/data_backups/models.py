from django.db import models
from users.models import Usuario


class DataBackup(models.Model):
    """
    Modelo para respaldos de datos del sistema
    Permite crear y gestionar respaldos automáticos y manuales
    """
    id = models.AutoField(primary_key=True)
    backup_name = models.CharField(max_length=200)
    backup_type = models.CharField(max_length=50, default='full')
    file_url = models.CharField(max_length=500, null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    file_path = models.CharField(max_length=500, null=True, blank=True)
    checksum = models.CharField(max_length=128, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_by = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='backups_created')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'data_backups'
        verbose_name = 'Respaldo de Datos'
        verbose_name_plural = 'Respaldos de Datos'
        ordering = ['-created_at']

    def __str__(self):
        return self.backup_name

    @property
    def file_size_mb(self):
        """Retorna el tamaño del archivo en MB"""
        return round((self.file_size or 0) / (1024 * 1024), 2)

    @property
    def file_size_gb(self):
        """Retorna el tamaño del archivo en GB"""
        return round((self.file_size or 0) / (1024 * 1024 * 1024), 2)

    @property
    def is_expired(self):
        """Indica si el respaldo ha expirado"""
        from django.utils import timezone
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    @property
    def is_completed(self):
        """Indica si el respaldo está completado"""
        return self.status == 'completed'

    @property
    def duration_minutes(self):
        """Calcula la duración del respaldo en minutos"""
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds() / 60
        return None

    def mark_as_completed(self, file_path=None, file_size=0, checksum=None):
        """Marca el respaldo como completado"""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        if file_path:
            self.file_path = file_path
        if file_size:
            self.file_size = file_size
        if checksum:
            self.checksum = checksum
        self.save()

    def mark_as_failed(self):
        """Marca el respaldo como fallido"""
        self.status = 'failed'
        self.save(update_fields=['status'])
