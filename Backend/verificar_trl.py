#!/usr/bin/env python3
"""
Script para verificar niveles TRL existentes en la base de datos
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from trl_levels.models import TRLLevel
from areas.models import Area

def verificar_datos():
    """Verificar niveles TRL y áreas existentes"""
    print("🔍 VERIFICACIÓN DE DATOS PARA PROYECTOS")
    print("=" * 60)
    
    # Verificar niveles TRL
    print("\n📋 NIVELES TRL EXISTENTES:")
    print("-" * 40)
    trl_levels = TRLLevel.objects.all()
    if trl_levels.exists():
        for trl in trl_levels:
            print(f"📄 ID: {trl.id} - Nivel: {trl.level} - Descripción: {trl.description}")
    else:
        print("❌ No hay niveles TRL en la base de datos")
    
    # Verificar áreas
    print("\n📋 ÁREAS EXISTENTES:")
    print("-" * 40)
    areas = Area.objects.all()
    if areas.exists():
        for area in areas:
            print(f"📄 ID: {area.id} - Nombre: {area.name}")
    else:
        print("❌ No hay áreas en la base de datos")
    
    # Verificar proyectos existentes
    print("\n📋 PROYECTOS EXISTENTES:")
    print("-" * 40)
    from projects.models import Proyecto
    proyectos = Proyecto.objects.all()
    if proyectos.exists():
        for proyecto in proyectos:
            print(f"📄 ID: {proyecto.id} - Título: {proyecto.title}")
            print(f"   📄 Estado: {proyecto.status.name if proyecto.status else 'Sin estado'}")
            print(f"   📄 TRL: {proyecto.trl.level if proyecto.trl else 'Sin TRL'}")
            print(f"   📄 API Level: {proyecto.api_level}")
            print(f"   📄 Área: {proyecto.area.name if proyecto.area else 'Sin área'}")
            print()
    else:
        print("❌ No hay proyectos en la base de datos")

if __name__ == "__main__":
    verificar_datos() 