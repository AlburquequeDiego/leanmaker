#!/usr/bin/env python
"""
Script simple para actualizar los niveles de API de todos los estudiantes
"""
import os
import sys
import django
from django.db.models import Count

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante

def update_api_levels_simple():
    """Actualiza los niveles de API de todos los estudiantes de forma simple"""
    print("🔧 Actualizando niveles de API de estudiantes...")
    print("=" * 60)
    
    # Obtener todos los estudiantes
    estudiantes = Estudiante.objects.all().select_related('user')
    
    print(f"📊 Total de estudiantes: {estudiantes.count()}")
    print()
    
    # Contar niveles antes de la actualización
    api_level_counts_before = estudiantes.values('api_level').annotate(count=Count('id')).order_by('api_level')
    print("📈 Distribución ANTES de la actualización:")
    for item in api_level_counts_before:
        print(f"  - API {item['api_level']}: {item['count']} estudiantes")
    
    print()
    
    # Actualizar cada estudiante
    actualizados = 0
    for estudiante in estudiantes:
        print(f"🔍 Verificando {estudiante.user.full_name} ({estudiante.user.email}):")
        print(f"  - API actual: {estudiante.api_level}")
        print(f"  - Horas trabajadas: {estudiante.total_hours}")
        print(f"  - Proyectos completados: {estudiante.completed_projects}")
        
        # Calcular nuevo nivel
        nuevo_api_level = 1
        if estudiante.total_hours >= 80 or estudiante.completed_projects >= 3:
            nuevo_api_level = 4
        elif estudiante.total_hours >= 40 or estudiante.completed_projects >= 2:
            nuevo_api_level = 3
        elif estudiante.total_hours >= 20 or estudiante.completed_projects >= 1:
            nuevo_api_level = 2
        else:
            nuevo_api_level = 1
        
        if nuevo_api_level > estudiante.api_level:
            api_level_anterior = estudiante.api_level
            # Usar update() para evitar signals
            Estudiante.objects.filter(id=estudiante.id).update(api_level=nuevo_api_level)
            print(f"  ✅ Actualizado de API {api_level_anterior} a API {nuevo_api_level}")
            actualizados += 1
        else:
            print(f"  ⏭️ Sin cambios (API {estudiante.api_level} es correcto)")
        
        print()
    
    # Contar niveles después de la actualización
    estudiantes_after = Estudiante.objects.all()
    api_level_counts_after = estudiantes_after.values('api_level').annotate(count=Count('id')).order_by('api_level')
    
    print("📈 Distribución DESPUÉS de la actualización:")
    for item in api_level_counts_after:
        print(f"  - API {item['api_level']}: {item['count']} estudiantes")
    
    print()
    print(f"✅ Actualización completada. {actualizados} estudiantes actualizados.")

if __name__ == '__main__':
    update_api_levels_simple()
