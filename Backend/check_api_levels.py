#!/usr/bin/env python
"""
Script para verificar los niveles de API de los estudiantes
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante
from django.db.models import Count

def check_api_levels():
    """Verifica los niveles de API de todos los estudiantes"""
    print("🔍 Verificando niveles de API de estudiantes...")
    print("=" * 60)
    
    # Obtener todos los estudiantes
    estudiantes = Estudiante.objects.all().select_related('user')
    
    print(f"📊 Total de estudiantes: {estudiantes.count()}")
    print()
    
    # Contar por nivel de API
    api_level_counts = estudiantes.values('api_level').annotate(count=Count('id')).order_by('api_level')
    
    print("📈 Distribución por nivel de API:")
    for item in api_level_counts:
        print(f"  - API {item['api_level']}: {item['count']} estudiantes")
    
    print()
    
    # Mostrar detalles de estudiantes con API > 1
    estudiantes_altos = estudiantes.filter(api_level__gt=1)
    
    if estudiantes_altos.exists():
        print(f"🎯 Estudiantes con API > 1 ({estudiantes_altos.count()}):")
        for estudiante in estudiantes_altos:
            print(f"  - {estudiante.user.full_name} ({estudiante.user.email}): API {estudiante.api_level}")
    else:
        print("⚠️ No hay estudiantes con API > 1")
    
    print()
    
    # Verificar si hay inconsistencias
    print("🔍 Verificando inconsistencias...")
    
    # Estudiantes con API 1 pero que deberían tener más
    estudiantes_api1 = estudiantes.filter(api_level=1)
    print(f"  - Estudiantes con API 1: {estudiantes_api1.count()}")
    
    # Verificar si hay estudiantes con proyectos completados pero API 1
    estudiantes_con_proyectos = estudiantes.filter(completed_projects__gt=0, api_level=1)
    if estudiantes_con_proyectos.exists():
        print(f"  ⚠️ Estudiantes con proyectos completados pero API 1: {estudiantes_con_proyectos.count()}")
        for estudiante in estudiantes_con_proyectos[:5]:  # Mostrar solo los primeros 5
            print(f"    - {estudiante.user.full_name}: {estudiante.completed_projects} proyectos")
    
    # Verificar si hay estudiantes con horas trabajadas pero API 1
    estudiantes_con_horas = estudiantes.filter(total_hours__gt=0, api_level=1)
    if estudiantes_con_horas.exists():
        print(f"  ⚠️ Estudiantes con horas trabajadas pero API 1: {estudiantes_con_horas.count()}")
        for estudiante in estudiantes_con_horas[:5]:  # Mostrar solo los primeros 5
            print(f"    - {estudiante.user.full_name}: {estudiante.total_hours} horas")
    
    print()
    print("✅ Verificación completada")

if __name__ == '__main__':
    check_api_levels()
