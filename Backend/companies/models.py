from django.db import models
from django.conf import settings

class Company(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='company_profile'
    )
    name = models.CharField(max_length=255, unique=True, verbose_name='Nombre de la Empresa')
    industry = models.CharField(max_length=100, blank=True, verbose_name='Industria')
    description = models.TextField(blank=True, verbose_name='Descripción')
    website = models.URLField(blank=True, verbose_name='Sitio Web')
    location = models.CharField(max_length=255, blank=True, verbose_name='Ubicación')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        ordering = ['name']

    def __str__(self):
        return self.name
