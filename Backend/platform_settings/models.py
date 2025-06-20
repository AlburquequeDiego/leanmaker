from django.db import models

# Create your models here.

class PlatformSetting(models.Model):
    SETTING_TYPE_CHOICES = [
        ('INTEGER', 'Número Entero'),
        ('FLOAT', 'Número Decimal'),
        ('STRING', 'Texto'),
        ('BOOLEAN', 'Verdadero/Falso'),
        ('JSON', 'JSON'),
    ]
    
    key = models.CharField(max_length=100, unique=True, verbose_name='Clave')
    value = models.TextField(verbose_name='Valor')
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPE_CHOICES, verbose_name='Tipo de Configuración')
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuración de Plataforma'
        verbose_name_plural = 'Configuraciones de Plataforma'
        ordering = ['key']

    def __str__(self):
        return f'{self.key}: {self.value}'

    @classmethod
    def get_setting(cls, key, default=None):
        """
        Método de clase para obtener una configuración por su clave.
        """
        try:
            setting = cls.objects.get(key=key)
            return setting.get_typed_value()
        except cls.DoesNotExist:
            return default

    def get_typed_value(self):
        """
        Convierte el valor almacenado al tipo correcto según setting_type.
        """
        if self.setting_type == 'INTEGER':
            try:
                return int(self.value)
            except ValueError:
                return 0
        elif self.setting_type == 'FLOAT':
            try:
                return float(self.value)
            except ValueError:
                return 0.0
        elif self.setting_type == 'BOOLEAN':
            return self.value.lower() in ('true', '1', 'yes', 'on')
        elif self.setting_type == 'JSON':
            import json
            try:
                return json.loads(self.value)
            except json.JSONDecodeError:
                return {}
        else:  # STRING
            return self.value
