#!/usr/bin/env python
"""
Script para verificar aplicaciones rechazadas en la base de datos
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from applications.models import Aplicacion
from django.db.models import Count

def check_rejected_applications():
    """Verifica las aplicaciones rechazadas en la base de datos"""
    
    print("🔍 Verificando aplicaciones rechazadas...")
    
    # Contar aplicaciones por estado
    status_counts = Aplicacion.objects.values('status').annotate(count=Count('id')).order_by('status')
    
    print("\n📊 Estadísticas por estado:")
    for status in status_counts:
        print(f"  - {status['status']}: {status['count']}")
    
    # Obtener aplicaciones rechazadas
    rejected_apps = Aplicacion.objects.filter(status='rejected').select_related('project', 'student__user')
    
    print(f"\n❌ Aplicaciones rechazadas encontradas: {rejected_apps.count()}")
    
    if rejected_apps.exists():
        print("\n📋 Detalles de aplicaciones rechazadas:")
        for app in rejected_apps:
            student_name = f"{app.student.user.first_name} {app.student.user.last_name}".strip() if app.student and app.student.user else "Sin nombre"
            project_title = app.project.title if app.project else "Sin proyecto"
            print(f"  - ID: {app.id}")
            print(f"    Estudiante: {student_name}")
            print(f"    Proyecto: {project_title}")
            print(f"    Estado: {app.status}")
            print(f"    Fecha aplicación: {app.applied_at}")
            print(f"    Fecha respuesta: {app.responded_at}")
            print()
    else:
        print("❌ No se encontraron aplicaciones rechazadas")
    
    # Verificar todas las aplicaciones
    all_apps = Aplicacion.objects.all().select_related('project', 'student__user')
    print(f"\n📊 Total de aplicaciones: {all_apps.count()}")
    
    print("\n🔍 Todas las aplicaciones:")
    for app in all_apps:
        student_name = f"{app.student.user.first_name} {app.student.user.last_name}".strip() if app.student and app.student.user else "Sin nombre"
        project_title = app.project.title if app.project else "Sin proyecto"
        print(f"  - {app.id}: {student_name} -> {project_title} ({app.status})")

if __name__ == "__main__":
    check_rejected_applications() 