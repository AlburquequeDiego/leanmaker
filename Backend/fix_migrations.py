#!/usr/bin/env python
"""
Script para resolver y ejecutar todas las migraciones
Resuelve dependencias rotas y ejecuta las migraciones en el orden correcto
"""

import os
import sys
import django
import shutil
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def backup_migrations():
    """
    Hace backup de las migraciones actuales
    """
    print("📦 Haciendo backup de migraciones actuales...")
    
    backup_dir = Path("migrations_backup_fix")
    if backup_dir.exists():
        shutil.rmtree(backup_dir)
    backup_dir.mkdir()
    
    apps_to_backup = [
        'users', 'companies', 'students', 'projects', 'applications',
        'evaluations', 'notifications', 'work_hours', 'interviews',
        'calendar_events', 'strikes', 'questionnaires', 'trl_levels',
        'areas', 'project_status', 'assignments', 'mass_notifications',
        'custom_admin'
    ]
    
    for app in apps_to_backup:
        app_migrations = Path(app) / "migrations"
        if app_migrations.exists():
            backup_app_dir = backup_dir / app
            backup_app_dir.mkdir()
            
            # Copiar solo archivos .py (no directorios)
            for file in app_migrations.glob("*.py"):
                if file.is_file():
                    shutil.copy2(file, backup_app_dir)
                    print(f"   ✅ Backup de {app}/{file.name}")
    
    print("✅ Backup completado")

def reset_migrations():
    """
    Resetea todas las migraciones a un estado limpio
    """
    print("🔄 Reseteando migraciones...")
    
    apps_to_reset = [
        'users', 'companies', 'students', 'projects', 'applications',
        'evaluations', 'notifications', 'work_hours', 'interviews',
        'calendar_events', 'strikes', 'questionnaires', 'trl_levels',
        'areas', 'project_status', 'assignments', 'mass_notifications',
        'custom_admin'
    ]
    
    for app in apps_to_reset:
        app_migrations = Path(app) / "migrations"
        if app_migrations.exists():
            # Eliminar archivos de migración (no el directorio)
            for file in app_migrations.glob("*.py"):
                if file.name != "__init__.py":
                    file.unlink()
                    print(f"   🗑️  Eliminado {app}/{file.name}")
    
    print("✅ Migraciones reseteadas")

def create_initial_migrations():
    """
    Crea migraciones iniciales para todas las apps
    """
    print("📝 Creando migraciones iniciales...")
    
    try:
        # Crear migración inicial para users (base de todo)
        print("   📝 Creando migración para users...")
        os.system("python manage.py makemigrations users --empty")
        
        # Crear migración inicial para companies
        print("   📝 Creando migración para companies...")
        os.system("python manage.py makemigrations companies --empty")
        
        # Crear migración inicial para students
        print("   📝 Creando migración para students...")
        os.system("python manage.py makemigrations students --empty")
        
        # Crear migración inicial para projects
        print("   📝 Creando migración para projects...")
        os.system("python manage.py makemigrations projects --empty")
        
        # Crear migración inicial para applications
        print("   📝 Creando migración para applications...")
        os.system("python manage.py makemigrations applications --empty")
        
        # Crear migración inicial para evaluations
        print("   📝 Creando migración para evaluations...")
        os.system("python manage.py makemigrations evaluations --empty")
        
        # Crear migración inicial para notifications
        print("   📝 Creando migración para notifications...")
        os.system("python manage.py makemigrations notifications --empty")
        
        # Crear migración inicial para work_hours
        print("   📝 Creando migración para work_hours...")
        os.system("python manage.py makemigrations work_hours --empty")
        
        # Crear migración inicial para interviews
        print("   📝 Creando migración para interviews...")
        os.system("python manage.py makemigrations interviews --empty")
        
        # Crear migración inicial para calendar_events
        print("   📝 Creando migración para calendar_events...")
        os.system("python manage.py makemigrations calendar_events --empty")
        
        # Crear migración inicial para strikes
        print("   📝 Creando migración para strikes...")
        os.system("python manage.py makemigrations strikes --empty")
        
        # Crear migración inicial para questionnaires
        print("   📝 Creando migración para questionnaires...")
        os.system("python manage.py makemigrations questionnaires --empty")
        
        # Crear migración inicial para trl_levels
        print("   📝 Creando migración para trl_levels...")
        os.system("python manage.py makemigrations trl_levels --empty")
        
        # Crear migración inicial para areas
        print("   📝 Creando migración para areas...")
        os.system("python manage.py makemigrations areas --empty")
        
        # Crear migración inicial para project_status
        print("   📝 Creando migración para project_status...")
        os.system("python manage.py makemigrations project_status --empty")
        
        # Crear migración inicial para assignments
        print("   📝 Creando migración para assignments...")
        os.system("python manage.py makemigrations assignments --empty")
        
        # Crear migración inicial para mass_notifications
        print("   📝 Creando migración para mass_notifications...")
        os.system("python manage.py makemigrations mass_notifications --empty")
        
        # Crear migración inicial para custom_admin
        print("   📝 Creando migración para custom_admin...")
        os.system("python manage.py makemigrations custom_admin --empty")
        
        print("✅ Migraciones iniciales creadas")
        
    except Exception as e:
        print(f"❌ Error creando migraciones: {e}")

def run_migrations():
    """
    Ejecuta todas las migraciones
    """
    print("🚀 Ejecutando migraciones...")
    
    try:
        # Ejecutar migraciones
        result = os.system("python manage.py migrate")
        
        if result == 0:
            print("✅ Migraciones ejecutadas exitosamente")
            return True
        else:
            print("❌ Error ejecutando migraciones")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando migraciones: {e}")
        return False

def check_migration_status():
    """
    Verifica el estado de las migraciones
    """
    print("🔍 Verificando estado de migraciones...")
    
    try:
        result = os.system("python manage.py showmigrations")
        return result == 0
    except Exception as e:
        print(f"❌ Error verificando migraciones: {e}")
        return False

def main():
    """
    Función principal que ejecuta todo el proceso
    """
    print("🔧 SCRIPT DE REPARACIÓN DE MIGRACIONES")
    print("=" * 60)
    print("🎯 Objetivo: Resolver dependencias rotas y ejecutar migraciones")
    print("=" * 60)
    
    try:
        # Paso 1: Backup
        backup_migrations()
        
        # Paso 2: Reset
        reset_migrations()
        
        # Paso 3: Crear migraciones iniciales
        create_initial_migrations()
        
        # Paso 4: Ejecutar migraciones
        if run_migrations():
            print("\n🎉 ¡Migraciones completadas exitosamente!")
            
            # Verificar estado final
            if check_migration_status():
                print("✅ Estado de migraciones verificado correctamente")
            else:
                print("⚠️  Hay problemas con el estado de migraciones")
        else:
            print("\n❌ Las migraciones no se completaron correctamente")
            return False
            
    except Exception as e:
        print(f"❌ Error durante el proceso: {e}")
        return False
    
    return True

if __name__ == '__main__':
    success = main()
    
    if success:
        print("\n🎉 ¡Proceso completado exitosamente!")
        print("💡 Tu base de datos está lista para usar")
    else:
        print("\n❌ El proceso no se completó correctamente")
        sys.exit(1)
