#!/usr/bin/env python3
"""
Script para migrar apps existentes al nuevo backend.
"""

import os
import shutil
from pathlib import Path


def copy_app(app_name, source_dir="../Backend", target_dir="."):
    """Copy an app from the old backend to the new one."""
    source_path = Path(source_dir) / app_name
    target_path = Path(target_dir) / app_name
    
    if not source_path.exists():
        print(f"❌ App {app_name} no encontrada en {source_path}")
        return False
    
    # Remove target if exists
    if target_path.exists():
        shutil.rmtree(target_path)
        print(f"🗑️ Eliminado directorio existente: {app_name}")
    
    # Copy app
    shutil.copytree(source_path, target_path)
    print(f"✅ App {app_name} copiada exitosamente")
    
    # Clean up unnecessary files
    cleanup_app(target_path)
    
    return True


def cleanup_app(app_path):
    """Clean up unnecessary files from copied app."""
    files_to_remove = [
        '__pycache__',
        'migrations/__pycache__',
        '*.pyc',
        '*.pyo',
        '*.pyd',
    ]
    
    for pattern in files_to_remove:
        for file_path in app_path.rglob(pattern):
            if file_path.is_file():
                file_path.unlink()
            elif file_path.is_dir():
                shutil.rmtree(file_path)
    
    # Remove migration files except __init__.py
    migrations_dir = app_path / 'migrations'
    if migrations_dir.exists():
        for migration_file in migrations_dir.glob('*.py'):
            if migration_file.name != '__init__.py':
                migration_file.unlink()
        print(f"🧹 Migraciones limpiadas en {app_path.name}")


def update_app_config(app_path):
    """Update app configuration for the new backend."""
    apps_file = app_path / 'apps.py'
    if apps_file.exists():
        content = apps_file.read_text(encoding='utf-8')
        # Update default_auto_field
        content = content.replace(
            "default_auto_field = 'django.db.models.BigAutoField'",
            "default_auto_field = 'django.db.models.BigAutoField'"
        )
        apps_file.write_text(content, encoding='utf-8')
        print(f"⚙️ Configuración actualizada en {app_path.name}")


def main():
    """Main migration function."""
    print("🔄 Migrando apps al nuevo backend...")
    
    # Apps to migrate
    apps_to_migrate = [
        'companies',
        'students', 
        'projects',
        'applications',
        'evaluations',
        'notifications',
        'work_hours',
        'interviews',
        'calendar_events',
        'strikes',
        'questionnaires',
        'platform_settings',
        'trl_levels',
        'areas',
        'project_status',
        'assignments',
        'evaluation_categories',
        'ratings',
        'mass_notifications',
        'disciplinary_records',
        'documents',
        'activity_logs',
        'reports',
        'data_backups',
    ]
    
    successful_migrations = 0
    
    for app_name in apps_to_migrate:
        print(f"\n📦 Migrando {app_name}...")
        if copy_app(app_name):
            update_app_config(Path(app_name))
            successful_migrations += 1
    
    print(f"\n🎉 Migración completada!")
    print(f"✅ {successful_migrations}/{len(apps_to_migrate)} apps migradas exitosamente")
    
    if successful_migrations > 0:
        print("\n📋 Próximos pasos:")
        print("1. Revisar y ajustar modelos si es necesario")
        print("2. Ejecutar: python manage.py makemigrations")
        print("3. Ejecutar: python manage.py migrate")
        print("4. Probar las APIs")
    
    return successful_migrations == len(apps_to_migrate)


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 