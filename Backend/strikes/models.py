from projects.models import Proyecto
from django.conf import settings
from companies.models import Empresa
from django.db import models
from students.models import Estudiante
import uuid
from django.utils import timezone

class StrikeReport(models.Model):
    """
    Modelo para reportes de strikes que las empresas hacen sobre estudiantes
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='strike_reports', verbose_name='Empresa')
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='strike_reports', verbose_name='Estudiante')
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='strike_reports', verbose_name='Proyecto')
    
    # Información del reporte
    reason = models.CharField(max_length=200, verbose_name='Motivo del Strike')
    description = models.TextField(verbose_name='Descripción Detallada')
    
    # Estado del reporte
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Campos de revisión
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='strike_reports_reviewed', null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(null=True, blank=True, verbose_name='Notas del Administrador')
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'strike_reports'
        verbose_name = 'Reporte de Strike'
        verbose_name_plural = 'Reportes de Strikes'
        ordering = ['-created_at']

    def __str__(self):
        return f'Reporte de {self.company.company_name} sobre {self.student.user.full_name} - {self.status}'
    
    def approve(self, admin_user, notes=None):
        """Aprueba el reporte y crea el strike"""
        if self.status != 'pending':
            raise ValueError('Solo se pueden aprobar reportes pendientes')
        
        # Verificar que el estudiante no tenga 3 strikes
        if self.student.strikes >= 3:
            raise ValueError('El estudiante ya tiene el máximo de 3 strikes permitidos')
        
        # Crear el strike
        Strike.objects.create(
            student=self.student,
            project=self.project,
            company=self.company,
            reason=self.reason,
            description=self.description,
            issued_by=admin_user,
            severity='medium'  # Por defecto medio
        )
        
        # Marcar como aprobado
        self.status = 'approved'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        if notes:
            self.admin_notes = notes
        self.save()
    
    def reject(self, admin_user, notes=None):
        """Rechaza el reporte"""
        if self.status != 'pending':
            raise ValueError('Solo se pueden rechazar reportes pendientes')
        
        self.status = 'rejected'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        if notes:
            self.admin_notes = notes
        self.save()

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
        is_new = not self.pk
        # Validar antes de guardar: no permitir más de 3 strikes activos
        if is_new and self.is_active:
            active_strikes = Strike.objects.filter(student=self.student, is_active=True).count()
            if active_strikes >= 3:
                raise ValueError("El estudiante ya tiene el máximo de 3 strikes activos permitidos.")
        super().save(*args, **kwargs)
        # Incrementar strikes del estudiante después de guardar
        if is_new and self.is_active:
            try:
                self.student.incrementar_strikes()
            except Exception as e:
                print(f"Error incrementando strikes para {self.student.user.full_name}: {e}")
    
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
