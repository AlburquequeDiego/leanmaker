#!/usr/bin/env python3
"""
Script para crear los estados básicos de proyecto en la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from project_status.models import ProjectStatus

def crear_estados_basicos():
    """Crea los estados básicos de proyecto"""
    
    print("🔧 CREANDO ESTADOS BÁSICOS DE PROYECTO")
    print("=" * 50)
    
    # Estados básicos que necesitamos
    estados_basicos = [
        {
            'name': 'published',
            'description': 'Proyecto publicado y visible para estudiantes',
            'color': '#28a745'
        },
        {
            'name': 'active',
            'description': 'Proyecto activo y en desarrollo',
            'color': '#007bff'
        },
        {
            'name': 'completed',
            'description': 'Proyecto completado exitosamente',
            'color': '#6f42c1'
        },
        {
            'name': 'cancelled',
            'description': 'Proyecto cancelado',
            'color': '#dc3545'
        },
        {
            'name': 'deleted',
            'description': 'Proyecto eliminado',
            'color': '#6c757d'
        }
    ]
    
    creados = 0
    for estado_data in estados_basicos:
        # Verificar si ya existe
        if ProjectStatus.objects.filter(name=estado_data['name']).exists():
            print(f"⚠️  El estado '{estado_data['name']}' ya existe")
            continue
        
        # Crear el estado
        estado = ProjectStatus.objects.create(
            name=estado_data['name'],
            description=estado_data['description'],
            color=estado_data['color'],
            is_active=True
        )
        print(f"✅ Creado: {estado.name} (ID: {estado.id})")
        creados += 1
    
    print(f"\n📊 Resumen:")
    print(f"   - Estados creados: {creados}")
    print(f"   - Total de estados: {ProjectStatus.objects.count()}")
    
    # Mostrar todos los estados disponibles
    print(f"\n📋 Estados disponibles:")
    for estado in ProjectStatus.objects.all().order_by('id'):
        print(f"   ID: {estado.id} | Nombre: '{estado.name}' | Color: {estado.color}")

if __name__ == "__main__":
    crear_estados_basicos() 