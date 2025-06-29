from django.db import models

class EvaluationCategory(models.Model):
    """Categoría o criterio de evaluación (ej: Técnica, Habilidades Blandas, etc)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Categoría de Evaluación'
        verbose_name_plural = 'Categorías de Evaluación'
        ordering = ['name']

    def __str__(self):
        return self.name 