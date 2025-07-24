#!/usr/bin/env python3
"""
Script para crear las áreas básicas en la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from areas.models import Area

def crear_areas_basicas():
    """Crea las áreas básicas del sistema"""
    
    print("🔧 CREANDO ÁREAS BÁSICAS")
    print("=" * 40)
    
    # Áreas básicas que necesitamos
    areas_basicas = [
        {
            'name': 'Tecnología',
            'description': 'Proyectos relacionados con desarrollo de software, sistemas y tecnología',
            'color': '#2196F3'
        },
        {
            'name': 'Marketing',
            'description': 'Proyectos de marketing digital, publicidad y comunicación',
            'color': '#FF9800'
        },
        {
            'name': 'Finanzas',
            'description': 'Proyectos financieros, contabilidad y análisis económico',
            'color': '#4CAF50'
        },
        {
            'name': 'Recursos Humanos',
            'description': 'Proyectos de gestión de talento, reclutamiento y desarrollo organizacional',
            'color': '#9C27B0'
        },
        {
            'name': 'Operaciones',
            'description': 'Proyectos de optimización de procesos, logística y gestión operacional',
            'color': '#607D8B'
        },
        {
            'name': 'Investigación',
            'description': 'Proyectos de investigación, desarrollo e innovación',
            'color': '#E91E63'
        },
        {
            'name': 'Diseño',
            'description': 'Proyectos de diseño gráfico, UX/UI y creatividad',
            'color': '#00BCD4'
        },
        {
            'name': 'Ventas',
            'description': 'Proyectos de ventas, atención al cliente y desarrollo comercial',
            'color': '#FF5722'
        }
    ]
    
    creadas = 0
    for area_data in areas_basicas:
        # Verificar si ya existe
        if Area.objects.filter(name=area_data['name']).exists():
            print(f"⚠️  El área '{area_data['name']}' ya existe")
            continue
        
        # Crear el área
        area = Area.objects.create(
            name=area_data['name'],
            description=area_data['description'],
            color=area_data['color'],
            is_active=True
        )
        print(f"✅ Creada: {area.name} (ID: {area.id})")
        creadas += 1
    
    print(f"\n📊 Resumen:")
    print(f"   - Áreas creadas: {creadas}")
    print(f"   - Total de áreas: {Area.objects.count()}")
    
    # Mostrar todas las áreas disponibles
    print(f"\n📋 Áreas disponibles:")
    for area in Area.objects.all().order_by('id'):
        print(f"   ID: {area.id} | Nombre: '{area.name}' | Color: {area.color}")

if __name__ == "__main__":
    crear_areas_basicas() 