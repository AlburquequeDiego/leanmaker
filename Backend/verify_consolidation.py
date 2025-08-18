#!/usr/bin/env python3
"""
Script de verificación para migraciones consolidadas.
Este script verifica que todas las migraciones consolidadas estén correctamente configuradas.
"""

import os
import sys
from pathlib import Path
import ast

def verify_migration_file(file_path):
    """Verifica que un archivo de migración sea válido"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar que sea un archivo Python válido
        ast.parse(content)
        
        # Verificar que tenga la estructura básica de migración
        if 'class Migration(migrations.Migration):' not in content:
            return False, "No contiene la clase Migration"
        
        if 'initial = True' not in content:
            return False, "No es una migración inicial"
        
        if 'operations = [' not in content:
            return False, "No contiene operaciones"
        
        return True, "OK"
        
    except SyntaxError as e:
        return False, f"Error de sintaxis: {e}"
    except Exception as e:
        return False, f"Error: {e}"

def verify_dependencies(file_path):
    """Verifica las dependencias de una migración"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar la sección de dependencies
        if 'dependencies = [' in content:
            # Extraer las dependencias
            start = content.find('dependencies = [')
            end = content.find(']', start)
            if end != -1:
                deps_section = content[start:end+1]
                # Verificar que las dependencias sean válidas
                if '0001_initial_consolidated' in deps_section:
                    return True, "Dependencias OK"
                else:
                    return False, "Dependencias no consolidadas"
        
        return True, "Sin dependencias (OK)"
        
    except Exception as e:
        return False, f"Error verificando dependencias: {e}"

def main():
    """Función principal de verificación"""
    
    base_dir = Path(__file__).parent
    
    # Aplicaciones que deben tener migraciones consolidadas
    expected_apps = [
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
    
    print("🔍 Verificando migraciones consolidadas...")
    print("=" * 60)
    
    all_ok = True
    issues = []
    
    for app in expected_apps:
        app_dir = base_dir / app
        migrations_dir = app_dir / 'migrations'
        
        if not migrations_dir.exists():
            print(f"❌ {app}: Directorio de migraciones no encontrado")
            all_ok = False
            issues.append(f"{app}: Directorio de migraciones no encontrado")
            continue
        
        # Buscar migración consolidada
        consolidated_file = migrations_dir / '0001_initial_consolidated.py'
        initial_file = migrations_dir / '0001_initial.py'
        
        if consolidated_file.exists():
            print(f"📁 {app}: Migración consolidada encontrada")
            
            # Verificar que sea válida
            is_valid, message = verify_migration_file(consolidated_file)
            if is_valid:
                print(f"   ✅ Estructura válida")
            else:
                print(f"   ❌ Estructura inválida: {message}")
                all_ok = False
                issues.append(f"{app}: {message}")
            
            # Verificar dependencias
            deps_ok, deps_message = verify_dependencies(consolidated_file)
            if deps_ok:
                print(f"   ✅ Dependencias OK")
            else:
                print(f"   ⚠️  Dependencias: {deps_message}")
                issues.append(f"{app}: {deps_message}")
                
        elif initial_file.exists():
            print(f"📁 {app}: Migración inicial encontrada (¿ya renombrada?)")
            
            # Verificar que sea válida
            is_valid, message = verify_migration_file(initial_file)
            if is_valid:
                print(f"   ✅ Estructura válida")
            else:
                print(f"   ❌ Estructura inválida: {message}")
                all_ok = False
                issues.append(f"{app}: {message}")
                
        else:
            print(f"❌ {app}: No se encontró migración consolidada ni inicial")
            all_ok = False
            issues.append(f"{app}: No se encontró migración consolidada")
        
        # Verificar que no haya migraciones antiguas
        old_migrations = [f for f in migrations_dir.glob('*.py') 
                         if f.name not in ['__init__.py', '0001_initial_consolidated.py', '0001_initial.py']]
        
        if old_migrations:
            print(f"   ⚠️  Migraciones antiguas encontradas: {len(old_migrations)}")
            for old_mig in old_migrations:
                print(f"      - {old_mig.name}")
            issues.append(f"{app}: {len(old_migrations)} migraciones antiguas encontradas")
    
    print("\n" + "=" * 60)
    
    if all_ok:
        print("🎉 ¡Verificación completada exitosamente!")
        print("✅ Todas las migraciones consolidadas están correctas")
        print("\n🚀 Puedes proceder con la limpieza de migraciones:")
        print("   python cleanup_migrations.py")
    else:
        print("❌ Se encontraron problemas en la verificación:")
        for issue in issues:
            print(f"   - {issue}")
        print("\n🔧 Corrige los problemas antes de proceder")
    
    print("\n📋 Resumen:")
    print(f"   Aplicaciones verificadas: {len(expected_apps)}")
    print(f"   Problemas encontrados: {len(issues)}")
    
    return all_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
