from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from users.models import User
import uuid
import json

class Empresa(models.Model):
    """
    Modelo de empresa que coincide exactamente con el interface Company del frontend
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
    
    # Campos básicos (coinciden exactamente con interface Company del frontend)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='empresa_profile', null=True, blank=True)
    company_name = models.CharField(max_length=200)
    
    # Campos opcionales (NULL permitido) - coinciden con frontend
    description = models.TextField(null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=50, choices=TAMANOS, null=True, blank=True)
    website = models.CharField(max_length=200, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    
    # Campos adicionales del registro
    rut = models.CharField(max_length=20, null=True, blank=True)
    personality = models.CharField(max_length=50, null=True, blank=True)  # jurídica, natural, otra
    business_name = models.CharField(max_length=200, null=True, blank=True)  # razón social
    company_address = models.CharField(max_length=500, null=True, blank=True)
    company_phone = models.CharField(max_length=20, null=True, blank=True)
    company_email = models.EmailField(null=True, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    logo_url = models.CharField(max_length=500, null=True, blank=True)
    
    # Campos de estado con valores por defecto - coinciden con frontend
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_projects = models.IntegerField(default=0)
    projects_completed = models.IntegerField(default=0)
    total_hours_offered = models.IntegerField(default=0)
    
    # Campos JSON (se almacenan como texto en SQL Server) - coinciden con frontend
    technologies_used = models.TextField(null=True, blank=True)  # JSON array
    benefits_offered = models.TextField(null=True, blank=True)   # JSON array
    
    # Campos adicionales - coinciden con frontend
    remote_work_policy = models.CharField(max_length=50, choices=REMOTE_POLICY_CHOICES, null=True, blank=True)
    internship_duration = models.CharField(max_length=50, null=True, blank=True)
    stipend_range = models.CharField(max_length=100, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Campos de fechas - coinciden con frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
    
    def __str__(self):
        return self.company_name
    
    def get_technologies_used_list(self):
        """Obtiene la lista de tecnologías utilizadas como lista de Python - coincide con frontend"""
        if self.technologies_used:
            try:
                return json.loads(self.technologies_used)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_technologies_used_list(self, technologies_list):
        """Establece la lista de tecnologías utilizadas desde una lista de Python - coincide con frontend"""
        if isinstance(technologies_list, list):
            self.technologies_used = json.dumps(technologies_list, ensure_ascii=False)
        else:
            self.technologies_used = None
    
    def get_benefits_offered_list(self):
        """Obtiene la lista de beneficios ofrecidos como lista de Python - coincide con frontend"""
        if self.benefits_offered:
            try:
                return json.loads(self.benefits_offered)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_benefits_offered_list(self, benefits_list):
        """Establece la lista de beneficios ofrecidos desde una lista de Python - coincide con frontend"""
        if isinstance(benefits_list, list):
            self.benefits_offered = json.dumps(benefits_list, ensure_ascii=False)
        else:
            self.benefits_offered = None
    
    @property
    def puede_publicar_proyectos(self):
        """Verifica si la empresa puede publicar proyectos"""
        return self.verified and self.user.is_active and self.status == 'active'
    
    def actualizar_calificacion(self, nueva_calificacion=None):
        """Actualiza la calificación promedio de la empresa basada en evaluaciones"""
        from evaluations.models import Evaluation
        
        # Buscar evaluaciones donde esta empresa es evaluada por estudiantes
        # Usar la misma lógica que el dashboard: project__company
        evaluaciones = Evaluation.objects.filter(
            project__company=self,
            status='completed',
            evaluation_type='student_to_company'
        )
        
        if evaluaciones.exists():
            # Calcular promedio de todas las evaluaciones
            scores = [e.score for e in evaluaciones]
            promedio = sum(scores) / len(scores)
            self.rating = round(promedio, 2)
            
            # Log para debugging
            print(f"🔄 [EMPRESA] {self.company_name}: {len(scores)} evaluaciones, scores: {scores}, promedio: {self.rating}")
        else:
            # No hay evaluaciones, rating debe ser 0
            self.rating = 0
            print(f"🔄 [EMPRESA] {self.company_name}: Sin evaluaciones, rating establecido a 0")
        
        # Guardar solo el campo rating para evitar loops infinitos
        self.save(update_fields=['rating'])
        
        return self.rating
    

    
    def obtener_historial_evaluaciones(self):
        """Obtiene el historial completo de evaluaciones de la empresa"""
        from evaluations.models import Evaluation
        
        return Evaluation.objects.filter(
            project__company=self,
            status='completed',
            evaluation_type='student_to_company'
        ).select_related('project', 'student__user').order_by('-evaluation_date')
    
    def obtener_estadisticas_evaluaciones(self):
        """Obtiene estadísticas detalladas de las evaluaciones"""
        from evaluations.models import Evaluation
        from django.db.models import Avg, Count, Min, Max
        
        evaluaciones = Evaluation.objects.filter(
            project__company=self,
            status='completed',
            evaluation_type='student_to_company'
        )
        
        if evaluaciones.exists():
            stats = evaluaciones.aggregate(
                total_evaluaciones=Count('id'),
                promedio=Avg('score'),
                puntuacion_minima=Min('score'),
                puntuacion_maxima=Max('score')
            )
            
            # Agregar distribución de puntuaciones
            distribucion = {}
            for i in range(1, 6):
                count = evaluaciones.filter(score=i).count()
                if count > 0:
                    distribucion[f"{i} estrellas"] = count
            
            stats['distribucion'] = distribucion
            stats['promedio'] = round(stats['promedio'], 2)
            
            return stats
        
        return {
            'total_evaluaciones': 0,
            'promedio': 0.0,
            'puntuacion_minima': None,
            'puntuacion_maxima': None,
            'distribucion': {}
        }
    
    def incrementar_proyectos_publicados(self):
        """Incrementa el contador de proyectos publicados"""
        self.total_projects += 1
        self.save(update_fields=['total_projects'])
    
    def incrementar_proyectos_completados(self):
        """Incrementa el contador de proyectos completados"""
        self.projects_completed += 1
        self.save(update_fields=['projects_completed'])

class UsuarioResponsable(models.Model):
    """
    Modelo para el usuario responsable de la empresa
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.OneToOneField(Empresa, on_delete=models.CASCADE, related_name='usuario_responsable')
    
    # Campos del usuario responsable
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    birthdate = models.DateField()
    gender = models.CharField(max_length=20)
    password = models.CharField(max_length=128)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_responsible_users'
        verbose_name = 'Usuario Responsable'
        verbose_name_plural = 'Usuarios Responsables'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.empresa.company_name}"

class CalificacionEmpresa(models.Model):
    """
    Modelo para calificaciones de empresas por estudiantes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='calificaciones')
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calificaciones_dadas')
    
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

# Signal para crear automáticamente el perfil de empresa cuando se crea un usuario
# TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTOS EN EL REGISTRO
# @receiver(post_save, sender=User)
# def crear_perfil_empresa(sender, instance, created, **kwargs):
#     """Crea automáticamente el perfil de empresa cuando se crea un usuario con rol 'company'."""
#     if created and instance.role == 'company':
#         try:
#             # Verificar si ya existe un perfil de empresa
#             if not hasattr(instance, 'empresa_profile'):
#                 print(f"[crear_perfil_empresa] Creando perfil de empresa para usuario {instance.id}")
#                 empresa = Empresa.objects.create(
#                     user=instance,
#                     company_name=instance.company_name or instance.email,
#                     description='',
#                     industry='',
#                     size='',
#                     website='',
#                     city='',
#                     country='Chile',
#                     rut='',
#                     personality='',
#                     business_name='',
#                     company_address='',
#                     company_phone='',
#                     company_email='',
#                     founded_year=None,
#                     logo_url='',
#                     verified=False,
#                     rating=0.0,
#                     total_projects=0,
#                     projects_completed=0,
#                     total_hours_offered=0,
#                     technologies_used=None,
#                     benefits_offered=None,
#                     remote_work_policy='',
#                     internship_duration='',
#                     stipend_range='',
#                     contact_email='',
#                     contact_phone='',
#                     status='active',
#                 )
#                 print(f"[crear_perfil_empresa] Perfil de empresa creado exitosamente - ID: {empresa.id}")
#         except Exception as e:
#             print(f"[crear_perfil_empresa] Error creando perfil de empresa: {str(e)}")
#             import traceback
#             traceback.print_exc()

@receiver(post_save, sender=CalificacionEmpresa)
def actualizar_rating_empresa_post_save(sender, instance, **kwargs):
    empresa = instance.empresa
    calificaciones = CalificacionEmpresa.objects.filter(empresa=empresa)
    if calificaciones.exists():
        promedio = sum([c.puntuacion for c in calificaciones]) / calificaciones.count()
        empresa.rating = round(promedio, 2)
    else:
        empresa.rating = 0
    empresa.save(update_fields=['rating'])

@receiver(post_delete, sender=CalificacionEmpresa)
def actualizar_rating_empresa_post_delete(sender, instance, **kwargs):
    empresa = instance.empresa
    calificaciones = CalificacionEmpresa.objects.filter(empresa=empresa)
    if calificaciones.exists():
        promedio = sum([c.puntuacion for c in calificaciones]) / calificaciones.count()
        empresa.rating = round(promedio, 2)
    else:
        empresa.rating = 0
    empresa.save(update_fields=['rating'])

# Signal para actualizar rating de empresa cuando se crea/actualiza una evaluación del sistema evaluations/
@receiver(post_save, sender='evaluations.Evaluation')
def actualizar_rating_empresa_evaluations_post_save(sender, instance, **kwargs):
    """Actualiza el rating de la empresa cuando se crea una evaluación estudiante->empresa"""
    if instance.evaluation_type == 'student_to_company' and instance.company:
        instance.company.actualizar_calificacion()

@receiver(post_delete, sender='evaluations.Evaluation')
def actualizar_rating_empresa_evaluations_post_delete(sender, instance, **kwargs):
    """Actualiza el rating de la empresa cuando se elimina una evaluación estudiante->empresa"""
    if instance.evaluation_type == 'student_to_company' and instance.company:
        instance.company.actualizar_calificacion()
