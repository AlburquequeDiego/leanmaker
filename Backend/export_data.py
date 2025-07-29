#!/usr/bin/env python3
"""
Script para exportar datos desde SQL Server Azure a SQLite local
"""

import os
import sys
import django
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command
from django.db import connections
from django.conf import settings

def export_data():
    """Exporta datos desde Azure a local"""
    print("🔄 Exportando datos desde Azure a local...")
    
    try:
        # Exportar datos usando Django dumpdata
        print("📤 Exportando datos desde Azure...")
        call_command('dumpdata', 
                    '--exclude', 'contenttypes',
                    '--exclude', 'auth.Permission',
                    '--exclude', 'sessions',
                    '--indent', '2',
                    '--output', 'data_export.json')
        
        print("✅ Datos exportados a data_export.json")
        
        # Cambiar a configuración local
        os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings_local'
        django.setup()
        
        # Importar datos a SQLite local
        print("📥 Importando datos a SQLite local...")
        call_command('loaddata', 'data_export.json')
        
        print("✅ Datos importados exitosamente a SQLite local")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def main():
    """Función principal"""
    print("=" * 60)
    print("🔄 EXPORTADOR DE DATOS AZURE → LOCAL")
    print("=" * 60)
    
    # Verificar que existe la configuración local
    if not Path('core/settings_local.py').exists():
        print("❌ Error: No se encontró core/settings_local.py")
        print("Ejecuta primero: python setup_local.py")
        return
    
    # Verificar que existe la base de datos local
    if not Path('db.sqlite3').exists():
        print("❌ Error: No se encontró db.sqlite3")
        print("Ejecuta primero: python setup_local.py")
        return
    
    # Exportar datos
    if export_data():
        print("\n🎉 ¡Migración completada!")
        print("Ahora puedes usar el sistema local con tus datos")
    else:
        print("\n❌ Error en la migración")

if __name__ == "__main__":
    main() 