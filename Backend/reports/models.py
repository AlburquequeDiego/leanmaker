from django.db import models
from users.models import User


class Report(models.Model):
    """
    Modelo para reportes del sistema
    Permite generar y almacenar reportes de diferentes tipos
    """
    id = models.AutoField(primary_key=True)
    report_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_generated')
    report_data = models.TextField(null=True, blank=True)  # JSON
    file_url = models.CharField(max_length=500, null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'reports'
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def file_size_mb(self):
        """Retorna el tamaño del archivo en MB"""
        return round((self.file_size or 0) / (1024 * 1024), 2)

    @property
    def processing_time(self):
        """Calcula el tiempo de procesamiento en segundos"""
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds()
        return None

    @property
    def is_completed(self):
        """Indica si el reporte está completado"""
        return self.status == 'completed'

    def mark_as_completed(self, file_path=None, file_size=0):
        """Marca el reporte como completado"""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        if file_path:
            self.file_path = file_path
        if file_size:
            self.file_size = file_size
        self.save()

    def increment_download_count(self):
        """Incrementa el contador de descargas"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
