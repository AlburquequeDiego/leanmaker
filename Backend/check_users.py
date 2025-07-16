#!/usr/bin/env python
"""
Script para verificar usuarios en la base de datos.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def check_users():
    """Verifica qué usuarios existen"""
    
    print("👥 Verificando usuarios en la base de datos...")
    
    users = User.objects.all()
    print(f"Total de usuarios: {users.count()}")
    
    for user in users:
        print(f"  - {user.email} (staff: {user.is_staff}, superuser: {user.is_superuser})")
    
    # Buscar admins
    admins = User.objects.filter(is_staff=True)
    print(f"\n👑 Usuarios admin: {admins.count()}")
    
    for admin in admins:
        print(f"  - {admin.email}")
    
    # Buscar superusuarios
    superusers = User.objects.filter(is_superuser=True)
    print(f"\n🌟 Superusuarios: {superusers.count()}")
    
    for superuser in superusers:
        print(f"  - {superuser.email}")

if __name__ == '__main__':
    check_users() 