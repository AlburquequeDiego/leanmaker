#!/usr/bin/env python
"""
Script para crear/convertir usuarios admin.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def create_admin():
    """Convierte admin1@leanmaker.com en superusuario"""
    
    print("👑 Creando/convirtiendo usuario admin...")
    
    # Buscar admin1@leanmaker.com
    admin_user = User.objects.filter(email='admin1@leanmaker.com').first()
    
    if admin_user:
        print(f"✅ Usuario encontrado: {admin_user.email}")
        
        # Convertir en superusuario
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        
        print(f"✅ Usuario {admin_user.email} convertido en superusuario")
        print(f"   - is_staff: {admin_user.is_staff}")
        print(f"   - is_superuser: {admin_user.is_superuser}")
        
    else:
        print("❌ No se encontró admin1@leanmaker.com")
        print("Creando nuevo superusuario...")
        
        # Crear nuevo superusuario
        admin_user = User.objects.create_user(
            email='admin@leanmaker.com',
            password='Admin123!',
            is_staff=True,
            is_superuser=True,
            first_name='Admin',
            last_name='Sistema'
        )
        
        print(f"✅ Nuevo superusuario creado: {admin_user.email}")

if __name__ == '__main__':
    create_admin() 