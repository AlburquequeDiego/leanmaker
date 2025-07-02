from projects.models import Proyecto
from django.conf import settings
from companies.models import Empresa
from django.db import models
from students.models import Estudiante
import uuid
from django.utils import timezone

class Strike(models.Model):
    """
    Modelo de strike que coincide exactamente con el interface Strike del frontend
    """
    SEVERITY_CHOICES = (
        ('low', 'Bajo'),
        ('medium', 'Medio'),
        ('high', 'Alto'),
    )
    
    # Campos básicos - coinciden con frontend
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='strike_records', verbose_name='Estudiante')
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='strikes', null=True, blank=True)  # Campo agregado para coincidir con frontend
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='issued_strikes', verbose_name='Empresa Emisora')
    
    # Información del strike - coinciden con frontend
    reason = models.TextField(verbose_name='Motivo de la Amonestación')
    description = models.TextField(null=True, blank=True)  # Campo agregado para coincidir con frontend
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='strikes_issued', null=True, blank=True)
    
    # Fechas - coinciden con frontend
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Campo agregado para coincidir con frontend
    
    # Estado - coincide con frontend
    is_active = models.BooleanField(default=True)
    
    # Campos adicionales para compatibilidad
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(null=True, blank=True)
    
    # Campos de fechas adicionales
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'strikes'
        verbose_name = 'Amonestación (Strike)'
        verbose_name_plural = 'Amonestaciones (Strikes)'
        ordering = ['-issued_at']

    def __str__(self):
        return f'Amonestación para {self.student.user.full_name} en {self.company.company_name} ({self.severity})'
    
    def save(self, *args, **kwargs):
        # Incrementar strikes del estudiante
        if self.is_active and not self.pk:  # Solo si es nuevo y activo
            self.student.incrementar_strikes()
        
        super().save(*args, **kwargs)
    
    def resolver(self, notas_resolucion=None):
        """Resuelve el strike"""
        self.is_active = False
        self.resolved_at = timezone.now()
        if notas_resolucion:
            self.resolution_notes = notas_resolucion
        self.save(update_fields=['is_active', 'resolved_at', 'resolution_notes'])
    
    def reactivar(self):
        """Reactiva el strike"""
        self.is_active = True
        self.resolved_at = None
        self.save(update_fields=['is_active', 'resolved_at'])
    
    @property
    def esta_expirado(self):
        """Verifica si el strike ha expirado"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
