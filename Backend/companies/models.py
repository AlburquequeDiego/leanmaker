from django.db import models
from users.models import Usuario
import uuid
import json

class Empresa(models.Model):
    """
    Modelo de empresa que coincide exactamente con el schema original
    """
    TAMANOS = (
        ('Pequeña', 'Pequeña'),
        ('Mediana', 'Mediana'),
        ('Grande', 'Grande'),
        ('Startup', 'Startup'),
    )
    
    REMOTE_POLICY_CHOICES = (
        ('full-remote', 'Full Remote'),
        ('hybrid', 'Híbrido'),
        ('onsite', 'Presencial'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Activa'),
        ('inactive', 'Inactiva'),
        ('suspended', 'Suspendida'),
    )
    
    # Campos básicos (coinciden con schema original)
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='empresa_profile')
    company_name = models.CharField(max_length=200)
    
    # Campos opcionales (NULL permitido)
    description = models.TextField(null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=50, choices=TAMANOS, null=True, blank=True)
    website = models.CharField(max_length=200, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    logo_url = models.CharField(max_length=500, null=True, blank=True)
    
    # Campos de estado con valores por defecto
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_projects = models.IntegerField(default=0)
    projects_completed = models.IntegerField(default=0)
    total_hours_offered = models.IntegerField(default=0)
    
    # Campos JSON (se almacenan como texto en SQL Server)
    technologies_used = models.TextField(null=True, blank=True)  # JSON array
    benefits_offered = models.TextField(null=True, blank=True)   # JSON array
    
    # Campos adicionales
    remote_work_policy = models.CharField(max_length=50, choices=REMOTE_POLICY_CHOICES, null=True, blank=True)
    internship_duration = models.CharField(max_length=50, null=True, blank=True)
    stipend_range = models.CharField(max_length=100, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Campos de fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
    
    def __str__(self):
        return self.company_name
    
    def get_technologies_used_list(self):
        """Obtiene la lista de tecnologías utilizadas como lista de Python"""
        if self.technologies_used:
            try:
                return json.loads(self.technologies_used)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_technologies_used_list(self, technologies_list):
        """Establece la lista de tecnologías utilizadas desde una lista de Python"""
        if isinstance(technologies_list, list):
            self.technologies_used = json.dumps(technologies_list, ensure_ascii=False)
        else:
            self.technologies_used = None
    
    def get_benefits_offered_list(self):
        """Obtiene la lista de beneficios ofrecidos como lista de Python"""
        if self.benefits_offered:
            try:
                return json.loads(self.benefits_offered)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_benefits_offered_list(self, benefits_list):
        """Establece la lista de beneficios ofrecidos desde una lista de Python"""
        if isinstance(benefits_list, list):
            self.benefits_offered = json.dumps(benefits_list, ensure_ascii=False)
        else:
            self.benefits_offered = None
    
    @property
    def puede_publicar_proyectos(self):
        """Verifica si la empresa puede publicar proyectos"""
        return self.verified and self.user.is_active and self.status == 'active'
    
    def actualizar_calificacion(self, nueva_calificacion):
        """Actualiza la calificación promedio de la empresa"""
        total_actual = self.rating * self.total_projects
        self.total_projects += 1
        self.rating = (total_actual + nueva_calificacion) / self.total_projects
        self.save(update_fields=['rating', 'total_projects'])
    
    def incrementar_proyectos_publicados(self):
        """Incrementa el contador de proyectos publicados"""
        self.total_projects += 1
        self.save(update_fields=['total_projects'])
    
    def incrementar_proyectos_completados(self):
        """Incrementa el contador de proyectos completados"""
        self.projects_completed += 1
        self.save(update_fields=['projects_completed'])

class CalificacionEmpresa(models.Model):
    """
    Modelo para calificaciones de empresas por estudiantes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='calificaciones')
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones_dadas')
    
    # Calificación
    puntuacion = models.PositiveIntegerField()  # 1-5 estrellas
    comentario = models.TextField(blank=True, null=True)
    
    # Criterios específicos
    comunicacion = models.PositiveIntegerField(blank=True, null=True)
    flexibilidad = models.PositiveIntegerField(blank=True, null=True)
    aprendizaje = models.PositiveIntegerField(blank=True, null=True)
    ambiente_trabajo = models.PositiveIntegerField(blank=True, null=True)
    
    # Fechas
    fecha_calificacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_ratings'
        verbose_name = 'Calificación de Empresa'
        verbose_name_plural = 'Calificaciones de Empresas'
        unique_together = ['empresa', 'estudiante']
    
    def __str__(self):
        return f"{self.estudiante.full_name} -> {self.empresa.company_name} ({self.puntuacion}/5)"
    
    def save(self, *args, **kwargs):
        # Actualizar calificación promedio de la empresa
        super().save(*args, **kwargs)
        self.empresa.actualizar_calificacion(self.puntuacion)
