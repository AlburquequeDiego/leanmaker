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
    
    def authenticate_user(self, email, password):
        """Método personalizado para autenticar usuarios por email"""
        try:
            user = self.get(email=email)
            if user.check_password(password) and user.is_active:
                return user
        except self.model.DoesNotExist:
            pass
        return None

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
    """
    Modelo de usuario principal que coincide exactamente con el interface User del frontend
    """
    ROLES = (
        ('admin', 'Administrador'),
        ('student', 'Estudiante'),
        ('company', 'Empresa'),
    )
    
    # Campos básicos (coinciden exactamente con interface User del frontend)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLES)
    
    # Campos opcionales (NULL permitido) - coinciden con frontend
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar = models.CharField(max_length=500, null=True, blank=True)  # URL del avatar
    bio = models.TextField(null=True, blank=True)
    
    # Campos adicionales del registro
    birthdate = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, null=True, blank=True)
    
    # Campos de estado con valores por defecto - coinciden con frontend
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Campos de fechas - coinciden con frontend
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Configuración
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        """Coincide con el campo full_name del frontend"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def get_role_display(self):
        return dict(self.ROLES)[self.role]
    
    @property
    def es_estudiante(self):
        return self.role == 'student'
    
    @property
    def es_empresa(self):
        return self.role == 'company'
    
    @property
    def es_admin(self):
        return self.role == 'admin'
    
    def puede_aplicar_proyectos(self):
        """Verifica si el estudiante puede aplicar a proyectos"""
        if not self.es_estudiante:
            return False
        # Verificar strikes a través del perfil de estudiante
        try:
            estudiante = self.estudiante_profile
            return estudiante.strikes < 3 and self.is_active and self.is_verified
        except:
            return False
    
    def obtener_estado_strikes(self):
        """Obtiene el estado de strikes del estudiante"""
        try:
            estudiante = self.estudiante_profile
            if estudiante.strikes >= 3:
                return 'suspendido'
            elif estudiante.strikes == 2:
                return 'advertencia'
            elif estudiante.strikes == 1:
                return 'precaucion'
            return 'limpio'
        except:
            return 'limpio'
