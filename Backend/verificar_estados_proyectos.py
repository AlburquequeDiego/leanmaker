#!/usr/bin/env python3
"""
Script para verificar los estados de los proyectos
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from project_status.models import ProjectStatus

def verificar_estados():
    """Verifica los estados de los proyectos"""
    
    print("🔍 VERIFICANDO ESTADOS DE PROYECTOS")
    print("=" * 50)
    
    # 1. Verificar estados disponibles
    print("📋 Estados disponibles:")
    estados = ProjectStatus.objects.all()
    for estado in estados:
        print(f"   - {estado.id}: {estado.name}")
    
    print()
    
    # 2. Verificar proyectos por estado
    print("📊 Proyectos por estado:")
    for estado in estados:
        count = Proyecto.objects.filter(status=estado).count()
        print(f"   - {estado.name}: {count} proyectos")
        
        # Mostrar algunos proyectos de cada estado
        proyectos = Proyecto.objects.filter(status=estado)[:3]
        for proyecto in proyectos:
            print(f"     * {proyecto.title} (ID: {proyecto.id})")
    
    print()
    
    # 3. Verificar proyectos activos/publicados
    print("✅ Proyectos activos/publicados:")
    proyectos_activos = Proyecto.objects.filter(status__name__in=['active', 'published'])
    print(f"   Total: {proyectos_activos.count()}")
    
    for proyecto in proyectos_activos:
        print(f"   - {proyecto.title} (Estado: {proyecto.status.name})")
    
    print()
    
    # 4. Verificar proyectos con estado nulo
    print("⚠️ Proyectos sin estado:")
    proyectos_sin_estado = Proyecto.objects.filter(status__isnull=True)
    print(f"   Total: {proyectos_sin_estado.count()}")
    
    for proyecto in proyectos_sin_estado:
        print(f"   - {proyecto.title} (ID: {proyecto.id})")

if __name__ == "__main__":
    verificar_estados() 