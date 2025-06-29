from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    ROLES = (
        ('estudiante', 'Estudiante'),
        ('empresa', 'Empresa'),
        ('admin', 'Administrador'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLES, default='estudiante')
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    # Campos de perfil
    telefono = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    biografia = models.TextField(blank=True, null=True)
    
    # Campos de estado
    esta_activo = models.BooleanField(default=True)
    esta_verificado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    
    # Campos específicos para estudiantes
    carrera = models.CharField(max_length=100, blank=True, null=True)
    semestre = models.PositiveIntegerField(blank=True, null=True)
    año_graduacion = models.PositiveIntegerField(blank=True, null=True)
    promedio_academico = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    nivel_api = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    strikes = models.PositiveIntegerField(default=0)
    horas_totales = models.PositiveIntegerField(default=0)
    proyectos_completados = models.PositiveIntegerField(default=0)
    
    # Campos específicos para empresas
    nombre_empresa = models.CharField(max_length=200, blank=True, null=True)
    descripcion_empresa = models.TextField(blank=True, null=True)
    sitio_web_empresa = models.URLField(blank=True, null=True)
    tamaño_empresa = models.CharField(max_length=50, blank=True, null=True)
    industria_empresa = models.CharField(max_length=100, blank=True, null=True)
    ubicacion_empresa = models.CharField(max_length=200, blank=True, null=True)
    calificacion_empresa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    # Configuración
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        if self.role == 'empresa' and self.nombre_empresa:
            return f"{self.nombre_empresa} ({self.email})"
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"
    
    def get_role_display(self):
        return dict(self.ROLES)[self.role]
    
    @property
    def es_estudiante(self):
        return self.role == 'estudiante'
    
    @property
    def es_empresa(self):
        return self.role == 'empresa'
    
    @property
    def es_admin(self):
        return self.role == 'admin'
    
    def puede_aplicar_proyectos(self):
        """Verifica si el estudiante puede aplicar a proyectos"""
        if not self.es_estudiante:
            return False
        return self.strikes < 3 and self.esta_activo and self.esta_verificado
    
    def obtener_estado_strikes(self):
        """Obtiene el estado de strikes del estudiante"""
        if self.strikes >= 3:
            return 'suspendido'
        elif self.strikes == 2:
            return 'advertencia'
        elif self.strikes == 1:
            return 'precaucion'
        return 'limpio'
