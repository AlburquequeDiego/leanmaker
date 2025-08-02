from django.db import models


class Documents(models.Model):
    """Modelo para documents"""
    
    name = models.CharField(max_length=200, verbose_name='Nombre')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'documents_documents'
        verbose_name = 'Documents'
        verbose_name_plural = 'Documentss'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name
