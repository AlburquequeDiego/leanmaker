#!/usr/bin/env python
"""
Script para crear el superusuario admin
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from users.models import Usuario

def create_admin():
    print("👑 Creando superusuario admin...")
    
    # Crear admin
    admin_user = Usuario.objects.create_user(
        email='admin@leanmaker.cl',
        password='admin123',
        first_name='Admin',
        last_name='System',
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True,
        is_verified=True
    )
    
    print(f"   ✅ Admin creado: {admin_user.email}")
    print(f"   🔑 Contraseña: admin123")

if __name__ == '__main__':
    create_admin() 