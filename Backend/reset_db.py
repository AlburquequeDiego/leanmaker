#!/usr/bin/env python
"""
Script para resetear la base de datos y crear un superusuario.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from users.models import User

def reset_database():
    """Resetear la base de datos."""
    print("🔄 Reseteando base de datos...")
    
    # Eliminar archivo de base de datos si existe
    db_file = 'db.sqlite3'
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print(f"✅ Archivo {db_file} eliminado")
        except PermissionError:
            print(f"❌ No se pudo eliminar {db_file} - puede estar en uso")
            return False
    
    # Ejecutar migraciones
    print("📦 Ejecutando migraciones...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migraciones aplicadas correctamente")
    except Exception as e:
        print(f"❌ Error en migraciones: {e}")
        return False
    
    # Crear superusuario
    print("👤 Creando superusuario...")
    try:
        user = User.objects.create_superuser(
            username='admin',
            email='admin@leanmaker.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print(f"✅ Superusuario creado: {user.email}")
    except Exception as e:
        print(f"❌ Error creando superusuario: {e}")
        return False
    
    # Crear usuario de prueba
    print("👤 Creando usuario de prueba...")
    try:
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='test123',
            first_name='Test',
            last_name='User',
            role='student'
        )
        print(f"✅ Usuario de prueba creado: {user.email}")
    except Exception as e:
        print(f"❌ Error creando usuario de prueba: {e}")
        return False
    
    print("🎉 Base de datos reseteada exitosamente!")
    print("\n📋 Credenciales de acceso:")
    print("   Admin: admin@leanmaker.com / admin123")
    print("   Test:  test@test.com / test123")
    
    return True

if __name__ == '__main__':
    success = reset_database()
    if success:
        print("\n✅ Script completado exitosamente")
    else:
        print("\n❌ Script falló")
        sys.exit(1) 