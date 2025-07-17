#!/usr/bin/env python
"""
Script para verificar usuarios admin en la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def check_admin_users():
    """Verificar usuarios admin"""
    print("🔍 Verificando usuarios admin...")
    
    # Buscar usuarios admin
    admin_users = User.objects.filter(role='admin')
    print(f"👥 Usuarios admin encontrados: {admin_users.count()}")
    
    for user in admin_users:
        print(f"   - ID: {user.id}")
        print(f"     Email: {user.email}")
        print(f"     Nombre: {user.full_name}")
        print(f"     Activo: {user.is_active}")
        print(f"     Verificado: {user.is_verified}")
        print(f"     Staff: {user.is_staff}")
        print(f"     Superuser: {user.is_superuser}")
        print()
    
    # Buscar superusuarios
    superusers = User.objects.filter(is_superuser=True)
    print(f"👑 Superusuarios encontrados: {superusers.count()}")
    
    for user in superusers:
        print(f"   - ID: {user.id}")
        print(f"     Email: {user.email}")
        print(f"     Nombre: {user.full_name}")
        print(f"     Role: {user.role}")
        print()
    
    # Buscar usuarios con email que contenga 'admin'
    admin_emails = User.objects.filter(email__icontains='admin')
    print(f"📧 Usuarios con 'admin' en email: {admin_emails.count()}")
    
    for user in admin_emails:
        print(f"   - ID: {user.id}")
        print(f"     Email: {user.email}")
        print(f"     Nombre: {user.full_name}")
        print(f"     Role: {user.role}")
        print()

if __name__ == "__main__":
    check_admin_users() 