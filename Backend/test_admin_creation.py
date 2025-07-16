#!/usr/bin/env python
"""
Script para probar la creación de administradores con permisos de superusuario.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def test_admin_creation():
    """Probar la creación de administradores con permisos de superusuario."""
    
    print("=== PRUEBA DE CREACIÓN DE ADMINISTRADORES ===\n")
    
    # Verificar administradores existentes
    existing_admins = User.objects.filter(role='admin')
    print(f"👥 Administradores existentes: {existing_admins.count()}")
    
    for admin in existing_admins:
        print(f"   - {admin.email}")
        print(f"     is_superuser: {admin.is_superuser}")
        print(f"     is_staff: {admin.is_staff}")
        print(f"     is_active: {admin.is_active}")
        print()
    
    # Crear un administrador de prueba
    print("🔄 Creando administrador de prueba...")
    
    try:
        test_admin = User.objects.create_user(
            email='test_admin@leanmaker.com',
            password='test123456',
            first_name='Admin',
            last_name='Test',
            role='admin'
        )
        
        # Verificar que se asignaron los permisos correctamente
        print(f"✅ Administrador creado: {test_admin.email}")
        print(f"   is_superuser: {test_admin.is_superuser}")
        print(f"   is_staff: {test_admin.is_staff}")
        print(f"   is_active: {test_admin.is_active}")
        print(f"   role: {test_admin.role}")
        
        if test_admin.is_superuser and test_admin.is_staff:
            print("✅ Permisos de superusuario asignados correctamente")
        else:
            print("❌ Error: No se asignaron los permisos de superusuario")
        
        # Limpiar - eliminar el usuario de prueba
        test_admin.delete()
        print("🧹 Usuario de prueba eliminado")
        
    except Exception as e:
        print(f"❌ Error al crear administrador: {e}")
    
    print("\n✅ Prueba completada")

if __name__ == '__main__':
    test_admin_creation() 