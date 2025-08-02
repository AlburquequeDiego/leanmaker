from django.db import models


class PlatformSetting(models.Model):
    """Modelo para configuraciones de la plataforma"""
    
    SETTING_TYPES = [
        ('string', 'Texto'),
        ('number', 'Número'),
        ('boolean', 'Booleano'),
        ('json', 'JSON'),
    ]
    
    key = models.CharField(max_length=100, unique=True, verbose_name='Clave')
    value = models.TextField(verbose_name='Valor')
    setting_type = models.CharField(
        max_length=20, 
        choices=SETTING_TYPES, 
        default='string',
        verbose_name='Tipo de configuración'
    )
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'platform_settings_platformsetting'
        verbose_name = 'Configuración de plataforma'
        verbose_name_plural = 'Configuraciones de plataforma'
        ordering = ['key']
        
    def __str__(self):
        return f"{self.key}: {self.value[:50]}" 