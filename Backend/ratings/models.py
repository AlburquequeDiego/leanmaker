from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from projects.models import Proyecto
import uuid

class Rating(models.Model):
    """Modelo para calificaciones de proyectos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_given')
    
    # Calificación
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ratings'
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'
        unique_together = ['project', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} -> {self.project.title} ({self.rating}/5)" 