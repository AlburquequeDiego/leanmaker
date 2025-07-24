#!/usr/bin/env python3
"""
Script para verificar qué estados de proyecto están disponibles en la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from project_status.models import ProjectStatus

def verificar_estados_disponibles():
    """Verifica qué estados están disponibles en la base de datos"""
    
    print("🔍 VERIFICANDO ESTADOS DISPONIBLES EN LA BASE DE DATOS")
    print("=" * 60)
    
    # Obtener todos los estados
    estados = ProjectStatus.objects.all().order_by('id')
    
    if not estados.exists():
        print("❌ No hay estados de proyecto en la base de datos")
        print("\n💡 Necesitas crear estados básicos:")
        print("   - published (Publicado)")
        print("   - active (Activo)")
        print("   - completed (Completado)")
        print("   - cancelled (Cancelado)")
        print("   - deleted (Eliminado)")
        return
    
    print(f"✅ Se encontraron {estados.count()} estados:")
    print()
    
    for estado in estados:
        print(f"   ID: {estado.id} | Nombre: '{estado.name}' | Activo: {estado.is_active}")
        if estado.description:
            print(f"        Descripción: {estado.description}")
        print()
    
    print("📋 IDs disponibles para usar en proyectos:")
    ids_disponibles = [estado.id for estado in estados if estado.is_active]
    print(f"   {ids_disponibles}")
    
    # Verificar si existe el estado con ID 4
    estado_4 = ProjectStatus.objects.filter(id=4).first()
    if estado_4:
        print(f"\n✅ El estado con ID 4 existe: '{estado_4.name}'")
    else:
        print(f"\n❌ El estado con ID 4 NO existe")
        print("   Este es el problema que causa el error al crear proyectos")

if __name__ == "__main__":
    verificar_estados_disponibles() 