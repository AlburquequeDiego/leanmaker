#!/usr/bin/env python3
"""
Script para limpiar migraciones antiguas y preparar el sistema para migraciones consolidadas.
Este script debe ejecutarse ANTES de aplicar las nuevas migraciones consolidadas.

IMPORTANTE: 
- Hacer backup de la base de datos antes de ejecutar
- Ejecutar solo en desarrollo, NO en producción
- Verificar que no hay datos críticos que se puedan perder
"""

import os
import shutil
import sys
from pathlib import Path

def cleanup_migrations():
    """Limpia todas las migraciones antiguas y las reemplaza con las consolidadas"""
    
    # Directorio base del proyecto
    base_dir = Path(__file__).parent
    
    # Aplicaciones que tienen migraciones consolidadas
    apps_with_consolidated = [
        'users',
        'companies', 
        'students',
        'projects',
        'applications',
        'calendar_events',
        'interviews',
        'notifications',
        'evaluations',
        'work_hours',
        'strikes',
        'mass_notifications',
        'custom_admin',
        'assignments',
        'questionnaires',
        'areas',
        'trl_levels',
        'project_status'
    ]
    
    print("🧹 Iniciando limpieza de migraciones...")
    print("=" * 60)
    
    for app in apps_with_consolidated:
        app_dir = base_dir / app
        migrations_dir = app_dir / 'migrations'
        
        if not migrations_dir.exists():
            print(f"⚠️  No se encontró directorio de migraciones para {app}")
            continue
            
        print(f"\n📁 Procesando {app}...")
        
        # Listar archivos de migración existentes
        migration_files = list(migrations_dir.glob('*.py'))
        migration_files = [f for f in migration_files if f.name != '__init__.py']
        
        if not migration_files:
            print(f"   ℹ️  No hay migraciones para limpiar en {app}")
            continue
            
        print(f"   📋 Migraciones encontradas: {len(migration_files)}")
        
        # Crear backup de las migraciones antiguas
        backup_dir = migrations_dir / 'backup_old_migrations'
        backup_dir.mkdir(exist_ok=True)
        
        for migration_file in migration_files:
            backup_file = backup_dir / migration_file.name
            shutil.copy2(migration_file, backup_file)
            print(f"   💾 Backup creado: {migration_file.name}")
        
        # Eliminar archivos de migración antiguos (excepto __init__.py)
        for migration_file in migration_files:
            migration_file.unlink()
            print(f"   🗑️  Eliminado: {migration_file.name}")
        
        # Verificar si existe la migración consolidada
        consolidated_file = migrations_dir / '0001_initial_consolidated.py'
        if consolidated_file.exists():
            # Renombrar la migración consolidada
            new_name = migrations_dir / '0001_initial.py'
            consolidated_file.rename(new_name)
            print(f"   ✅ Migración consolidada renombrada: 0001_initial.py")
        else:
            print(f"   ⚠️  No se encontró migración consolidada para {app}")
    
    print("\n" + "=" * 60)
    print("🎉 Limpieza de migraciones completada!")
    print("\n📋 Resumen de acciones realizadas:")
    print("   1. ✅ Backup de todas las migraciones antiguas creado")
    print("   2. ✅ Migraciones antiguas eliminadas")
    print("   3. ✅ Migraciones consolidadas renombradas")
    print("\n⚠️  IMPORTANTE:")
    print("   - Las migraciones antiguas están en backup_old_migrations/")
    print("   - Ahora puedes ejecutar: python manage.py migrate")
    print("   - Si hay problemas, puedes restaurar desde el backup")
    print("\n🚀 Tu sistema está listo para usar las migraciones consolidadas!")

def restore_migrations():
    """Restaura las migraciones desde el backup (en caso de problemas)"""
    
    base_dir = Path(__file__).parent
    
    print("🔄 Iniciando restauración de migraciones desde backup...")
    print("=" * 60)
    
    for app in ['users', 'companies', 'students', 'projects', 'applications']:
        app_dir = base_dir / app
        migrations_dir = app_dir / 'migrations'
        backup_dir = migrations_dir / 'backup_old_migrations'
        
        if not backup_dir.exists():
            print(f"⚠️  No se encontró backup para {app}")
            continue
            
        print(f"\n📁 Restaurando {app}...")
        
        # Restaurar archivos de backup
        backup_files = list(backup_dir.glob('*.py'))
        for backup_file in backup_files:
            restore_file = migrations_dir / backup_file.name
            shutil.copy2(backup_file, restore_file)
            print(f"   ✅ Restaurado: {backup_file.name}")
        
        # Eliminar directorio de backup
        shutil.rmtree(backup_dir)
        print(f"   🗑️  Backup eliminado")
    
    print("\n🎉 Restauración completada!")
    print("Las migraciones originales han sido restauradas.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--restore":
        restore_migrations()
    else:
        cleanup_migrations()
