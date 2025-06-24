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

class User(AbstractUser):
    ROLES = (
        ('student', 'Estudiante'),
        ('company', 'Empresa'),
        ('admin', 'Administrador'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLES, default='student')
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    # Campos de perfil
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # Campos de estado
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Campos específicos para estudiantes
    career = models.CharField(max_length=100, blank=True, null=True)
    semester = models.PositiveIntegerField(blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    api_level = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(4)])
    strikes = models.PositiveIntegerField(default=0)
    total_hours = models.PositiveIntegerField(default=0)
    completed_projects = models.PositiveIntegerField(default=0)
    
    # Campos específicos para empresas
    company_name = models.CharField(max_length=200, blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    company_industry = models.CharField(max_length=100, blank=True, null=True)
    company_location = models.CharField(max_length=200, blank=True, null=True)
    company_rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    # Configuración
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        if self.role == 'company' and self.company_name:
            return f"{self.company_name} ({self.email})"
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"
    
    def get_role_display(self):
        return dict(self.ROLES)[self.role]
    
    @property
    def is_student(self):
        return self.role == 'student'
    
    @property
    def is_company(self):
        return self.role == 'company'
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    def can_apply_to_projects(self):
        """Verifica si el estudiante puede aplicar a proyectos"""
        if not self.is_student:
            return False
        return self.strikes < 3 and self.is_active and self.is_verified
    
    def get_strike_status(self):
        """Obtiene el estado de strikes del estudiante"""
        if self.strikes >= 3:
            return 'suspended'
        elif self.strikes == 2:
            return 'warning'
        elif self.strikes == 1:
            return 'caution'
        return 'clean'
