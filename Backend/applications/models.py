from django.db import models
from django.conf import settings
from projects.models import Proyecto
from students.models import Estudiante
from users.models import User
import uuid
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

class Aplicacion(models.Model):
    """
    Modelo de aplicación que coincide exactamente con el schema original
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('reviewing', 'En Revisión'),
        ('interviewed', 'Entrevistado'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
        ('withdrawn', 'Retirado'),
        ('completed', 'Completado'),
    )
    
    # Campos básicos (coinciden con schema original)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='application_project', null=True, blank=True)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='aplicaciones', null=True, blank=True)
    
    # Campos de estado con valores por defecto
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Campos opcionales (NULL permitido)
    cover_letter = models.TextField(null=True, blank=True)
    company_notes = models.TextField(null=True, blank=True)
    student_notes = models.TextField(null=True, blank=True)
    
    # Campos de URLs (opcionales)
    portfolio_url = models.CharField(max_length=500, null=True, blank=True)
    github_url = models.CharField(max_length=500, null=True, blank=True)
    linkedin_url = models.CharField(max_length=500, null=True, blank=True)
    
    # Campos de fechas
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications'
        verbose_name = 'Aplicación'
        verbose_name_plural = 'Aplicaciones'
        unique_together = ['project', 'student']  # Una aplicación por estudiante y proyecto
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.user.full_name} -> {self.project.title} ({self.get_status_display()})"
    
    @property
    def puede_ser_aceptada(self):
        """Verifica si la aplicación puede ser aceptada"""
        return (
            self.status in ['pending', 'reviewing', 'interviewed'] and
            self.project.puede_aplicar and
            self.student.puede_aplicar_proyectos
        )
    
    @property
    def tiempo_espera(self):
        """Calcula el tiempo de espera desde la aplicación"""
        from django.utils import timezone
        return timezone.now() - self.applied_at
    
    def marcar_como_revisada(self):
        """Marca la aplicación como revisada"""
        from django.utils import timezone
        self.status = 'reviewing'
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_at'])
    
    def aceptar(self, notas_empresa=None):
        """Acepta la aplicación y asegura la membresía activa del estudiante en el proyecto"""
        from django.utils import timezone
        from projects.models import MiembroProyecto
        if self.puede_ser_aceptada:
            self.status = 'accepted'
            self.responded_at = timezone.now()
            if notas_empresa:
                self.company_notes = notas_empresa
            self.save(update_fields=['status', 'responded_at', 'company_notes'])
            self.project.incrementar_aplicaciones()
            # Crear o reactivar miembro del proyecto
            miembro, creado = MiembroProyecto.objects.get_or_create(
                proyecto=self.project,
                usuario=self.student.user,
                defaults={'rol': 'estudiante', 'esta_activo': True}
            )
            if not creado and not miembro.esta_activo:
                miembro.esta_activo = True
                miembro.rol = 'estudiante'
                miembro.save(update_fields=['esta_activo', 'rol'])
            # Actualizar contador de estudiantes activos
            self.project.current_students = MiembroProyecto.objects.filter(
                proyecto=self.project, rol='estudiante', esta_activo=True
            ).count()
            self.project.save(update_fields=['current_students'])
            return True
        return False
    
    def rechazar(self, notas_empresa=None):
        """Rechaza la aplicación"""
        from django.utils import timezone
        self.status = 'rejected'
        self.responded_at = timezone.now()
        if notas_empresa:
            self.company_notes = notas_empresa
        self.save(update_fields=['status', 'responded_at', 'company_notes'])
    
    def retirar(self, notas_estudiante=None):
        """Retira la aplicación"""
        from django.utils import timezone
        self.status = 'withdrawn'
        self.responded_at = timezone.now()
        if notas_estudiante:
            self.student_notes = notas_estudiante
        self.save(update_fields=['status', 'responded_at', 'student_notes'])
    
    def marcar_como_completada(self):
        """Marca la aplicación como completada"""
        from django.utils import timezone
        self.status = 'completed'
        self.responded_at = timezone.now()
        self.save(update_fields=['status', 'responded_at'])
    


class Asignacion(models.Model):
    """
    Modelo de asignación que coincide exactamente con el schema original
    """
    ESTADO_CHOICES = (
        ('en curso', 'En Curso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    )
    
    # Campos básicos (coinciden con schema original)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(Aplicacion, on_delete=models.CASCADE, related_name='asignacion')
    
    # Campos obligatorios
    fecha_inicio = models.DateField()
    
    # Campos opcionales (NULL permitido)
    fecha_fin = models.DateField(null=True, blank=True)
    tareas = models.TextField(null=True, blank=True)
    
    # Campos de estado con valores por defecto
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='en curso')
    hours_worked = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    
    # Campos de fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'application_assignments'
        verbose_name = 'Asignación'
        verbose_name_plural = 'Asignaciones'

    def __str__(self):
        return f"Asignación: {self.application.student.user.full_name} - {self.application.project.title}"
    
    @property
    def esta_activa(self):
        """Verifica si la asignación está activa"""
        return self.estado == 'en curso'
    
    @property
    def duracion_dias(self):
        """Calcula la duración en días de la asignación"""
        from django.utils import timezone
        if self.fecha_fin:
            return (self.fecha_fin - self.fecha_inicio).days
        else:
            return (timezone.now().date() - self.fecha_inicio).days
    
    def agregar_horas_trabajadas(self, horas):
        """Agrega horas trabajadas a la asignación"""
        self.hours_worked += horas
        self.save(update_fields=['hours_worked'])
        
        # Actualizar horas totales del estudiante
        self.application.student.actualizar_horas_totales(horas)
    
    def completar_tarea(self):
        """Completa una tarea de la asignación"""
        self.tasks_completed += 1
        self.save(update_fields=['tasks_completed'])
    
    def finalizar_asignacion(self, fecha_fin=None):
        """Finaliza la asignación"""
        from django.utils import timezone
        self.estado = 'completado'
        if fecha_fin:
            self.fecha_fin = fecha_fin
        else:
            self.fecha_fin = timezone.now().date()
        self.save(update_fields=['estado', 'fecha_fin'])
        
        # Incrementar proyectos completados del estudiante
        self.application.student.incrementar_proyectos_completados()
        
        # Incrementar proyectos completados de la empresa
        self.application.project.company.incrementar_proyectos_completados()
    
    def cancelar_asignacion(self):
        """Cancela la asignación"""
        self.estado = 'cancelado'
        self.save(update_fields=['estado'])
        
        # Remover estudiante del proyecto
        self.application.project.remover_estudiante()

# Señal para crear miembro automáticamente al aceptar una aplicación
@receiver(post_save, sender=Aplicacion)
def crear_miembro_al_aceptar_aplicacion(sender, instance, created, **kwargs):
    if instance.status in ['accepted', 'active']:
        from projects.models import MiembroProyecto
        # Verifica si ya existe el miembro
        if not MiembroProyecto.objects.filter(proyecto=instance.project, usuario=instance.student.user, rol='estudiante').exists():
            MiembroProyecto.objects.create(
                proyecto=instance.project,
                usuario=instance.student.user,
                rol='estudiante',
                esta_activo=True
            )
        else:
            miembro = MiembroProyecto.objects.get(proyecto=instance.project, usuario=instance.student.user, rol='estudiante')
            if not miembro.esta_activo:
                miembro.esta_activo = True
                miembro.save(update_fields=['esta_activo'])
