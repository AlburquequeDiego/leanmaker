from django.db import models
from applications.models import Asignacion
from students.models import Estudiante
from projects.models import Proyecto
from companies.models import Empresa
from django.conf import settings
import uuid
from django.utils import timezone

class WorkHour(models.Model):
    """
    Modelo de horas trabajadas que coincide exactamente con el interface WorkHour del frontend
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Asignacion, on_delete=models.CASCADE, related_name='work_hours')
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='work_hours')
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='work_hours')
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='work_hours')
    
    # Campos básicos - coinciden con frontend
    date = models.DateField()  # Campo renombrado para coincidir con frontend
    hours_worked = models.IntegerField()  # Campo renombrado para coincidir con frontend
    description = models.TextField(null=True, blank=True)  # Campo renombrado para coincidir con frontend
    
    # Campos de validación - coinciden con frontend
    approved = models.BooleanField(default=False)  # Campo renombrado para coincidir con frontend
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='horas_aprobadas')  # Campo renombrado para coincidir con frontend
    approved_at = models.DateTimeField(null=True, blank=True)  # Campo renombrado para coincidir con frontend
    
    # Campos adicionales para compatibilidad
    fecha = models.DateField()  # Campo original para compatibilidad
    horas_trabajadas = models.IntegerField()  # Campo original para compatibilidad
    descripcion = models.TextField(null=True, blank=True)  # Campo original para compatibilidad
    estado_validacion = models.CharField(max_length=20, default='pendiente')
    validador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='horas_validadas')
    fecha_validacion = models.DateTimeField(null=True, blank=True)
    comentario_validacion = models.TextField(null=True, blank=True)
    
    # Campos de fechas - coinciden con frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'work_hours'
        verbose_name = 'Hora Trabajada'
        verbose_name_plural = 'Horas Trabajadas'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.date} ({self.hours_worked}h)"
    
    def save(self, *args, **kwargs):
        # Sincronizar campos para compatibilidad
        if not self.fecha:
            self.fecha = self.date
        if not self.horas_trabajadas:
            self.horas_trabajadas = self.hours_worked
        if not self.descripcion:
            self.descripcion = self.description
        if not self.validador:
            self.validador = self.approved_by
        if not self.fecha_validacion:
            self.fecha_validacion = self.approved_at
        if not self.comentario_validacion:
            self.comentario_validacion = self.description
        
        super().save(*args, **kwargs)
    
    def aprobar_horas(self, aprobador, comentario=None):
        """Aprueba las horas trabajadas"""
        self.approved = True
        self.approved_by = aprobador
        self.approved_at = timezone.now()
        if comentario:
            self.description = comentario
        self.save(update_fields=['approved', 'approved_by', 'approved_at', 'description'])
        
        # Actualizar horas totales del estudiante
        self.student.actualizar_horas_totales(self.hours_worked)
    
    def rechazar_horas(self, rechazador, comentario=None):
        """Rechaza las horas trabajadas"""
        self.approved = False
        self.approved_by = rechazador
        self.approved_at = timezone.now()
        if comentario:
            self.description = comentario
        self.save(update_fields=['approved', 'approved_by', 'approved_at', 'description'])
