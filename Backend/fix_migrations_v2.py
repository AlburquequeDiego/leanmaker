#!/usr/bin/env python
"""
Script para resolver y ejecutar todas las migraciones - VERSIÓN 2
Resuelve el problema específico con LogEntry y dependencias
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
    
    backup_dir = Path("migrations_backup_fix_v2")
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
            for file in app_migrations.glob("*.py"):
                if file.name != "__init__.py":
                    file.unlink()
                    print(f"   🗑️  Eliminado {app}/{file.name}")
    
    print("✅ Migraciones reseteadas")

def create_users_migration():
    """
    Crea la migración de users primero (base de todo)
    """
    print("📝 Creando migración para users (base)...")
    
    try:
        # Crear migración específica para users
        result = os.system("python manage.py makemigrations users")
        if result == 0:
            print("   ✅ Migración de users creada")
            return True
        else:
            print("   ❌ Error creando migración de users")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_other_migrations():
    """
    Crea migraciones para las demás apps
    """
    print("📝 Creando migraciones para otras apps...")
    
    apps_to_migrate = [
        'companies', 'students', 'projects', 'applications',
        'evaluations', 'notifications', 'work_hours', 'interviews',
        'calendar_events', 'strikes', 'questionnaires', 'trl_levels',
        'areas', 'project_status', 'assignments', 'mass_notifications',
        'custom_admin'
    ]
    
    for app in apps_to_migrate:
        try:
            print(f"   📝 Creando migración para {app}...")
            result = os.system(f"python manage.py makemigrations {app}")
            if result == 0:
                print(f"   ✅ Migración de {app} creada")
            else:
                print(f"   ❌ Error creando migración de {app}")
        except Exception as e:
            print(f"   ❌ Error en {app}: {e}")
    
    print("✅ Migraciones de otras apps creadas")

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
    print("🔧 SCRIPT DE REPARACIÓN DE MIGRACIONES - VERSIÓN 2")
    print("=" * 70)
    print("🎯 Objetivo: Resolver dependencias rotas y ejecutar migraciones")
    print("=" * 70)
    
    try:
        # Paso 1: Backup
        backup_migrations()
        
        # Paso 2: Reset
        reset_migrations()
        
        # Paso 3: Crear migración de users primero
        if not create_users_migration():
            print("❌ No se pudo crear la migración de users")
            return False
        
        # Paso 4: Crear migraciones de otras apps
        create_other_migrations()
        
        # Paso 5: Ejecutar migraciones
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
