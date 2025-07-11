from django.db import models
from users.models import User
from projects.models import AplicacionProyecto
import uuid
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Interview(models.Model):
    """
    Modelo de entrevista que coincide exactamente con el interface Interview del frontend
    """
    STATUS_CHOICES = (
        ('scheduled', 'Programada'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no-show', 'No se presentó'),
    )
    
    # Campos básicos - coinciden con frontend
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(AplicacionProyecto, on_delete=models.CASCADE, related_name='interviews')  # Campo renombrado para coincidir con frontend
    interviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews_conducted')
    
    # Información de la entrevista - coinciden con frontend
    interview_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Campos de evaluación - coinciden con frontend
    notes = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Campos adicionales para compatibilidad
    interview_type = models.CharField(max_length=20, default='video')
    
    # Campos de fechas - coinciden con frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Entrevista'
        verbose_name_plural = 'Entrevistas'
        db_table = 'interviews'
        ordering = ['-interview_date']

    def __str__(self):
        return f"Entrevista {self.id} - {self.interview_date}"
    
    def completar(self, feedback=None, rating=None):
        """Marca la entrevista como completada"""
        self.status = 'completed'
        if feedback:
            self.feedback = feedback
        if rating:
            self.rating = rating
        self.save(update_fields=['status', 'feedback', 'rating'])
    
    def cancelar(self, motivo=None):
        """Cancela la entrevista"""
        self.status = 'cancelled'
        if motivo:
            self.notes = motivo
        self.save(update_fields=['status', 'notes'])
    
    def marcar_no_show(self):
        """Marca la entrevista como no-show"""
        self.status = 'no-show'
        self.save(update_fields=['status'])
    
    @property
    def esta_programada(self):
        """Verifica si la entrevista está programada"""
        return self.status == 'scheduled'
    
    @property
    def esta_completada(self):
        """Verifica si la entrevista está completada"""
        return self.status == 'completed'
    
    @property
    def esta_cancelada(self):
        """Verifica si la entrevista está cancelada"""
        return self.status in ['cancelled', 'no-show']
