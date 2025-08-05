from django.db import models
from users.models import User
import uuid

class Reports(models.Model):
    """Modelo para reportes del sistema"""
    
    REPORT_TYPE_CHOICES = (
        ('student', 'Estudiante'),
        ('company', 'Empresa'),
        ('project', 'Proyecto'),
        ('evaluation', 'Evaluación'),
        ('financial', 'Financiero'),
        ('analytics', 'Analíticas'),
        ('system', 'Sistema'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200, default='Reporte del sistema')
    description = models.TextField(blank=True, null=True)
    
    # Datos del reporte
    report_data = models.TextField(blank=True, null=True)  # JSON data del reporte
    
    # Archivos
    file_url = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"
