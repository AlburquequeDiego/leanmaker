#!/usr/bin/env python
"""
Script para ejecutar todas las migraciones del sistema LeanMaker
Asegura que la base de datos esté completamente actualizada con todos los modelos y campos
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.db import connection

def setup_django():
    """Configura Django para ejecutar el script"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

def check_migrations():
    """Verifica el estado de las migraciones"""
    print("🔍 Verificando estado de migraciones...")
    
    try:
        from django.core.management import call_command
        call_command('showmigrations')
        return True
    except Exception as e:
        print(f"❌ Error verificando migraciones: {e}")
        return False

def run_migrations():
    """Ejecuta todas las migraciones pendientes"""
    print("🚀 Ejecutando migraciones...")
    
    try:
        from django.core.management import call_command
        
        # Ejecutar makemigrations para todas las apps
        print("📝 Generando migraciones...")
        call_command('makemigrations', verbosity=1)
        
        # Ejecutar migrate
        print("🔄 Aplicando migraciones...")
        call_command('migrate', verbosity=1)
        
        return True
    except Exception as e:
        print(f"❌ Error ejecutando migraciones: {e}")
        return False

def create_superuser():
    """Crea un superusuario por defecto si no existe"""
    print("👤 Verificando superusuario...")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(is_superuser=True).exists():
            print("📧 Creando superusuario por defecto...")
            print("Email: admin@leanmaker.com")
            print("Password: admin123")
            
            User.objects.create_superuser(
                email='admin@leanmaker.com',
                password='admin123',
                first_name='Admin',
                last_name='LeanMaker',
                role='admin'
            )
            print("✅ Superusuario creado exitosamente")
        else:
            print("✅ Superusuario ya existe")
            
        return True
    except Exception as e:
        print(f"❌ Error creando superusuario: {e}")
        return False

def verify_database():
    """Verifica que la base de datos esté correctamente configurada"""
    print("🔍 Verificando base de datos...")
    
    try:
        with connection.cursor() as cursor:
            # Verificar tablas principales
            tables_to_check = [
                'users',
                'students', 
                'companies',
                'projects',
                'applications',
                'evaluations',
                'notifications',
                'strikes',
                'calendar_events',
                'interviews',
                'areas',
                'trl_levels',
                'project_status_projectstatus',
                'evaluation_categories_evaluationcategory'
            ]
            
            for table in tables_to_check:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"✅ Tabla {table}: {count} registros")
                
        return True
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        return False

def main():
    """Función principal"""
    print("=" * 60)
    print("🚀 LEANMAKER - SCRIPT DE MIGRACIÓN COMPLETA")
    print("=" * 60)
    
    # Configurar Django
    setup_django()
    
    # Verificar migraciones
    if not check_migrations():
        print("❌ No se pudo verificar las migraciones")
        return False
    
    # Ejecutar migraciones
    if not run_migrations():
        print("❌ No se pudieron ejecutar las migraciones")
        return False
    
    # Verificar base de datos
    if not verify_database():
        print("❌ Error en la verificación de la base de datos")
        return False
    
    # Crear superusuario
    if not create_superuser():
        print("❌ No se pudo crear el superusuario")
        return False
    
    print("=" * 60)
    print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 60)
    print("🎉 La base de datos está lista para usar")
    print("📧 Superusuario: admin@leanmaker.com")
    print("🔑 Contraseña: admin123")
    print("=" * 60)
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1) 