"""
User models for LeanMaker Backend.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        
        # Si el usuario es administrador, asignar permisos de superusuario
        if extra_fields.get('role') == 'admin':
            user.is_superuser = True
            user.is_staff = True
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for LeanMaker.
    """
    ROLES = (
        ('admin', 'Administrador'),
        ('student', 'Estudiante'),
        ('company', 'Empresa'),
    )
    
    # Override id to use UUID
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4)
    
    # Override username to be optional
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    # Use email as primary identifier
    email = models.EmailField(unique=True)
    
    # Role field
    role = models.CharField(max_length=20, choices=ROLES, default='student')
    
    # Additional fields
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar = models.URLField(max_length=500, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    career = models.CharField(max_length=100, null=True, blank=True)
    company_name = models.CharField(max_length=200, null=True, blank=True)
    
    # Status fields
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        """Get full name or email if no name is set."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def get_role_display(self):
        """Get human-readable role name."""
        return dict(self.ROLES)[self.role]
    
    @property
    def is_student(self):
        """Check if user is a student."""
        return self.role == 'student'
    
    @property
    def is_company(self):
        """Check if user is a company."""
        return self.role == 'company'
    
    @property
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == 'admin' 