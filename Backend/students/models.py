from django.db import models
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import json
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Estudiante(models.Model):
    """
    Modelo de estudiante que coincide exactamente con el interface Student del frontend
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('suspended', 'Suspendido'),
    )
    
    AVAILABILITY_CHOICES = (
        ('full-time', 'Tiempo Completo'),
        ('part-time', 'Tiempo Parcial'),
        ('flexible', 'Flexible'),
    )
    
    # Campos básicos (coinciden exactamente con interface Student del frontend)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='estudiante_profile')
    
    # Campos opcionales (NULL permitido) - coinciden con frontend
    career = models.CharField(max_length=200, null=True, blank=True)
    semester = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(12)])
    
    # Campos adicionales del registro
    university = models.CharField(max_length=200, null=True, blank=True)
    education_level = models.CharField(max_length=50, null=True, blank=True)
    
    # Campos de estado con valores por defecto - coinciden con frontend
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    api_level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    api_level_approved_by_admin = models.BooleanField(default=False, help_text="Indica si el nivel API fue aprobado manualmente por admin")
    trl_level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(9)], help_text="Nivel TRL del 1 al 9 según el estado del proyecto")
    strikes = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    completed_projects = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    total_hours = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(20)])
    
    # Campos de URLs (opcionales) - coinciden con frontend
    portfolio_url = models.CharField(max_length=500, null=True, blank=True)
    github_url = models.CharField(max_length=500, null=True, blank=True)
    linkedin_url = models.CharField(max_length=500, null=True, blank=True)
    
    # Campos para links de documentos (nuevos)
    cv_link = models.CharField(max_length=500, null=True, blank=True)
    certificado_link = models.CharField(max_length=500, null=True, blank=True)
    
    # Campos adicionales - coinciden con frontend
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='flexible')
    hours_per_week = models.IntegerField(default=20, validators=[MinValueValidator(5), MaxValueValidator(35)], help_text="Horas semanales disponibles para proyectos")
    location = models.CharField(max_length=200, null=True, blank=True)
    area = models.CharField(max_length=200, null=True, blank=True, help_text="Área de interés del estudiante")

    
    # Campos JSON (se almacenan como texto en SQL Server) - coinciden con frontend
    skills = models.TextField(null=True, blank=True)  # JSON array de habilidades
    
    # Campos de fechas - coinciden con frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'

    def __str__(self):
        return f"{self.user.full_name} ({self.career or 'Sin carrera'})"
    
    def get_skills_list(self):
        """Obtiene la lista de habilidades como lista de Python - coincide con frontend"""
        if self.skills:
            try:
                return json.loads(self.skills)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_skills_list(self, skills_list):
        """Establece la lista de habilidades desde una lista de Python - coincide con frontend"""
        if isinstance(skills_list, list):
            self.skills = json.dumps(skills_list, ensure_ascii=False)
        else:
            self.skills = None
    
    def get_languages_list(self):
        """Obtiene la lista de idiomas como lista de Python - para compatibilidad"""
        # Campo languages fue eliminado, retornar lista vacía para compatibilidad
        return []
    
    def set_languages_list(self, languages_list):
        """Establece la lista de idiomas desde una lista de Python - para compatibilidad"""
        # Campo languages fue eliminado, no hacer nada para compatibilidad
        pass
    

    
    @property
    def puede_aplicar_proyectos(self):
        """Verifica si el estudiante puede aplicar a proyectos"""
        return (
            self.status == 'approved' and 
            self.user.is_active and 
            self.strikes < 3 and 
            self.user.is_verified
        )
    
    @property
    def trl_permitido_segun_api(self):
        """Calcula el nivel TRL máximo permitido según el nivel API del estudiante"""
        api_to_trl = {
            1: 2,  # API 1: TRL 1-2 (20 horas)
            2: 4,  # API 2: TRL 1-4 (40 horas)
            3: 6,  # API 3: TRL 1-6 (80 horas)
            4: 9   # API 4: TRL 1-9 (160 horas)
        }
        return api_to_trl.get(self.api_level, 1)
    
    @property
    def horas_permitidas_segun_api(self):
        """Calcula las horas permitidas según el nivel API del estudiante"""
        api_to_hours = {
            1: 20,   # API 1: 20 horas
            2: 40,   # API 2: 40 horas
            3: 80,   # API 3: 80 horas
            4: 160   # API 4: 160 horas
        }
        return api_to_hours.get(self.api_level, 20)
    
    def actualizar_trl_segun_api(self):
        """Actualiza automáticamente el nivel TRL según el nivel API"""
        self.trl_level = self.trl_permitido_segun_api
        self.save(update_fields=['trl_level'])
    
    def puede_tomar_proyecto_trl(self, trl_proyecto):
        """Verifica si el estudiante puede tomar un proyecto de cierto nivel TRL"""
        return trl_proyecto <= self.trl_permitido_segun_api
    
    @property
    def estado_strikes(self):
        """Obtiene el estado de strikes del estudiante"""
        if self.strikes >= 3:
            return 'suspendido'
        elif self.strikes == 2:
            return 'advertencia'
        elif self.strikes == 1:
            return 'precaucion'
        return 'limpio'
    
    def incrementar_strikes(self):
        """Incrementa el contador de strikes"""
        self.strikes += 1
        if self.strikes >= 3:
            self.status = 'suspended'
        self.save(update_fields=['strikes', 'status'])
    
    def resetear_strikes(self):
        """Resetea el contador de strikes"""
        self.strikes = 0
        if self.status == 'suspended':
            self.status = 'approved'
        self.save(update_fields=['strikes', 'status'])
    
    def actualizar_horas_totales(self, horas_agregadas):
        """Actualiza las horas totales trabajadas"""
        self.total_hours += horas_agregadas
        self.save(update_fields=['total_hours'])
    
    def incrementar_proyectos_completados(self):
        """Incrementa el contador de proyectos completados"""
        self.completed_projects += 1
        self.save(update_fields=['completed_projects'])
    
    def actualizar_calificacion(self, _=None):
        """Actualiza la calificación promedio del estudiante (GPA)"""
        from evaluations.models import Evaluation
        # CORREGIDO: Buscar evaluaciones donde este estudiante es el evaluado
        evaluaciones = Evaluation.objects.filter(
            student=self,  # ← CAMBIO: usar self en lugar de self.user.id
            status='completed',
            evaluation_type='company_to_student'  # ← AGREGADO: solo evaluaciones de empresas a estudiantes
        )
        if evaluaciones.exists():
            promedio = sum([e.score for e in evaluaciones]) / evaluaciones.count()
            self.gpa = round(promedio, 2)
        else:
            self.gpa = 0
        self.save(update_fields=['gpa'])

    def proteger_api_level(self):
        """Protege el nivel de API para que no se baje automáticamente"""
        if self.api_level > 1:
            # Marcar como aprobado por admin para evitar cambios automáticos
            self.api_level_approved_by_admin = True
            self.save(update_fields=['api_level_approved_by_admin'])
            print(f"🛡️ [API LEVEL] Estudiante {self.user.email} con API {self.api_level} protegido contra cambios automáticos")
            return True
        return False
    
    # MÉTODO ELIMINADO: actualizar_api_level_automaticamente
    # Este método causaba el reseteo automático de niveles de API
    # Los niveles de API solo deben cambiarse manualmente por admin
    
    def sugerir_subida_api_level(self):
        """Sugiere si el estudiante puede subir de nivel API (SOLO SUBIR, NUNCA BAJAR)"""
        # Solo sugerir subida si el estudiante cumple criterios
        # NUNCA sugerir bajada
        
        if self.total_hours >= 80 or self.completed_projects >= 3:
            if self.api_level < 4:
                return {
                    'puede_subir': True,
                    'nivel_sugerido': 4,
                    'razon': f'Cumple criterios: {self.total_hours} horas o {self.completed_projects} proyectos'
                }
        elif self.total_hours >= 40 or self.completed_projects >= 2:
            if self.api_level < 3:
                return {
                    'puede_subir': True,
                    'nivel_sugerido': 3,
                    'razon': f'Cumple criterios: {self.total_hours} horas o {self.completed_projects} proyectos'
                }
        elif self.total_hours >= 20 or self.completed_projects >= 1:
            if self.api_level < 2:
                return {
                    'puede_subir': True,
                    'nivel_sugerido': 2,
                    'razon': f'Cumple criterios: {self.total_hours} horas o {self.completed_projects} proyectos'
                }
        
        # No sugerir cambios si ya está en el nivel máximo o no cumple criterios
        return {
            'puede_subir': False,
            'nivel_sugerido': self.api_level,
            'razon': f'Nivel actual {self.api_level} es apropiado para {self.total_hours} horas y {self.completed_projects} proyectos'
        }

    def save(self, *args, **kwargs):
        """Sobrescribir save para proteger el nivel API"""
        # Si el estudiante ya tiene un nivel API aprobado por admin, NO permitir cambios
        if self.pk:  # Solo para estudiantes existentes
            try:
                old_instance = Estudiante.objects.get(pk=self.pk)
                if (old_instance.api_level_approved_by_admin and 
                    old_instance.api_level > 1 and 
                    self.api_level != old_instance.api_level):
                    # Revertir el cambio del nivel API
                    self.api_level = old_instance.api_level
                    print(f"⚠️ [PROTECCIÓN] Intento de cambiar nivel API de {old_instance.api_level} a {self.api_level} bloqueado para estudiante {self.user.email}")
            except Estudiante.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

class PerfilEstudiante(models.Model):
    """
    Modelo para información adicional del perfil del estudiante
    """
    estudiante = models.OneToOneField(Estudiante, on_delete=models.CASCADE, related_name='perfil_detallado')
    
    # Información personal adicional
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero = models.CharField(max_length=20, null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, null=True, blank=True)
    
    # Información académica
    universidad = models.CharField(max_length=200, null=True, blank=True)
    facultad = models.CharField(max_length=200, null=True, blank=True)
    promedio_historico = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Información profesional
    experiencia_laboral = models.TextField(null=True, blank=True)
    certificaciones = models.TextField(null=True, blank=True)  # JSON array
    proyectos_personales = models.TextField(null=True, blank=True)  # JSON array
    
    # Preferencias
    tecnologias_preferidas = models.TextField(null=True, blank=True)  # JSON array
    industrias_interes = models.TextField(null=True, blank=True)  # JSON array
    tipo_proyectos_preferidos = models.TextField(null=True, blank=True)  # JSON array
    
    # Información de contacto adicional
    telefono_emergencia = models.CharField(max_length=20, null=True, blank=True)
    contacto_emergencia = models.CharField(max_length=200, null=True, blank=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Perfil de Estudiante'
        verbose_name_plural = 'Perfiles de Estudiantes'
    
    def __str__(self):
        return f"Perfil de {self.estudiante.user.full_name}"
    
    def get_certificaciones_list(self):
        """Obtiene la lista de certificaciones como lista de Python"""
        if self.certificaciones:
            try:
                return json.loads(self.certificaciones)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_certificaciones_list(self, certificaciones_list):
        """Establece la lista de certificaciones desde una lista de Python"""
        if isinstance(certificaciones_list, list):
            self.certificaciones = json.dumps(certificaciones_list, ensure_ascii=False)
        else:
            self.certificaciones = None
    
    def get_proyectos_personales_list(self):
        """Obtiene la lista de proyectos personales como lista de Python"""
        if self.proyectos_personales:
            try:
                return json.loads(self.proyectos_personales)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_proyectos_personales_list(self, proyectos_list):
        """Establece la lista de proyectos personales desde una lista de Python"""
        if isinstance(proyectos_list, list):
            self.proyectos_personales = json.dumps(proyectos_list, ensure_ascii=False)
        else:
            self.proyectos_personales = None
    
    def get_tecnologias_preferidas_list(self):
        """Obtiene la lista de tecnologías preferidas como lista de Python"""
        if self.tecnologias_preferidas:
            try:
                return json.loads(self.tecnologias_preferidas)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_tecnologias_preferidas_list(self, tecnologias_list):
        """Establece la lista de tecnologías preferidas desde una lista de Python"""
        if isinstance(tecnologias_list, list):
            self.tecnologias_preferidas = json.dumps(tecnologias_list, ensure_ascii=False)
        else:
            self.tecnologias_preferidas = None
    
    def get_industrias_interes_list(self):
        """Obtiene la lista de industrias de interés como lista de Python"""
        if self.industrias_interes:
            try:
                return json.loads(self.industrias_interes)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_industrias_interes_list(self, industrias_list):
        """Establece la lista de industrias de interés desde una lista de Python"""
        if isinstance(industrias_list, list):
            self.industrias_interes = json.dumps(industrias_list, ensure_ascii=False)
        else:
            self.industrias_interes = None
    
    def get_tipo_proyectos_preferidos_list(self):
        """Obtiene la lista de tipos de proyectos preferidos como lista de Python"""
        if self.tipo_proyectos_preferidos:
            try:
                return json.loads(self.tipo_proyectos_preferidos)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_tipo_proyectos_preferidos_list(self, tipos_list):
        """Establece la lista de tipos de proyectos preferidos desde una lista de Python"""
        if isinstance(tipos_list, list):
            self.tipo_proyectos_preferidos = json.dumps(tipos_list, ensure_ascii=False)
        else:
            self.tipo_proyectos_preferidos = None

class ApiLevelRequest(models.Model):
    """
    Petición de subida de nivel API por parte del estudiante.
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='api_level_requests')
    requested_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)])
    current_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    feedback = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'api_level_requests'
        verbose_name = 'Petición de Nivel API'
        verbose_name_plural = 'Peticiones de Nivel API'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Petición de {self.student.user.full_name} a nivel {self.requested_level} ({self.status})"

def student_cv_path(instance, filename):
    # Ruta por defecto para guardar CVs
    return f'students/cvs/{instance.estudiante.user.id}/{filename}'

# TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTOS EN EL REGISTRO
# Signal para crear automáticamente el perfil de estudiante cuando se crea un usuario
# @receiver(post_save, sender=User)
# def crear_perfil_estudiante(sender, instance, created, **kwargs):
#     """Crea automáticamente el perfil de estudiante cuando se crea un usuario con rol 'student'."""
#     if created and instance.role == 'student':
#         try:
#             # Verificar si ya existe un perfil de estudiante
#             if not hasattr(instance, 'estudiante_profile'):
#                 print(f"[crear_perfil_estudiante] Creando perfil de estudiante para usuario {instance.id}")
#                 estudiante = Estudiante.objects.create(
#                     user=instance,
#                     career=instance.career or '',
#                     university='',
#                     education_level='',
#                     status='approved',
#                     api_level=1,
#                     trl_level=1,
#                     strikes=0,
#                     gpa=0.0,
#                     completed_projects=0,
#                     total_hours=0,
#                     experience_years=0,
#                     availability='flexible',
#                     location='',
#                     area='',
# 
#                 )
#                 # Calcular TRL automáticamente al crear
#                 estudiante.actualizar_trl_segun_api()
#                 print(f"[crear_perfil_estudiante] Perfil de estudiante creado exitosamente - ID: {estudiante.id}")
#                 
#                 # Crear perfil detallado
#                 perfil = PerfilEstudiante.objects.create(
#                     estudiante=estudiante,
#                     fecha_nacimiento=instance.birthdate,
#                     genero=instance.gender,
#                     universidad='',
#                 )
#                 print(f"[crear_perfil_estudiante] Perfil detallado creado exitosamente - ID: {perfil.id}")
#         except Exception as e:
#             print(f"[crear_perfil_estudiante] Error creando perfil de estudiante: {str(e)}")
#             import traceback
#             traceback.print_exc()

@receiver(post_save, sender=Estudiante)
def actualizar_trl_automaticamente(sender, instance, **kwargs):
    """Actualiza automáticamente el nivel TRL cuando se actualiza el nivel API"""
    # Solo actualizar si se modificó el api_level y no estamos ya actualizando el trl_level
    if (kwargs.get('update_fields') and 'api_level' in kwargs['update_fields'] and 
        'trl_level' not in kwargs.get('update_fields', [])):
        # Usar update() para evitar disparar signals nuevamente
        Estudiante.objects.filter(id=instance.id).update(trl_level=instance.trl_permitido_segun_api)

# SIGNAL ELIMINADO: actualizar_api_level_automaticamente
# Este signal causaba el reseteo automático de niveles de API
# Los niveles de API solo deben cambiarse manualmente por admin

@receiver(post_save, sender='evaluations.Evaluation')
def actualizar_gpa_estudiante_post_save(sender, instance, **kwargs):
    try:
        # instance.student ya es un Estudiante, no necesitamos buscarlo
        instance.student.actualizar_calificacion()
    except Exception as e:
        print(f"Error actualizando GPA: {e}")
        pass

@receiver(post_delete, sender='evaluations.Evaluation')
def actualizar_gpa_estudiante_post_delete(sender, instance, **kwargs):
    try:
        # instance.student ya es un Estudiante, no necesitamos buscarlo
        instance.student.actualizar_calificacion()
    except Exception as e:
        print(f"Error actualizando GPA: {e}")
        pass
