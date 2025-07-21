#!/usr/bin/env python3
"""
Script para probar el flujo completo de postulaciones
"""

import os
import sys
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from projects.models import Proyecto
from applications.models import Aplicacion
from students.models import Estudiante

User = get_user_model()

def test_postulaciones():
    """Prueba el flujo completo de postulaciones"""
    
    print("🧪 PROBANDO FLUJO DE POSTULACIONES")
    print("=" * 50)
    
    # 1. Verificar que existe un estudiante
    try:
        student_user = User.objects.filter(role='student').first()
        if not student_user:
            print("❌ No se encontró ningún estudiante")
            return
        
        student = student_user.estudiante_profile
        print(f"✅ Estudiante encontrado: {student_user.email}")
        print(f"   - API Level: {student.api_level}")
        print(f"   - TRL Level: {student.trl_level}")
        
    except Exception as e:
        print(f"❌ Error al obtener estudiante: {e}")
        return
    
    # 2. Verificar que existen proyectos publicados
    try:
        published_projects = Proyecto.objects.filter(status__name='Publicado')
        print(f"✅ Proyectos publicados encontrados: {published_projects.count()}")
        
        if published_projects.count() == 0:
            print("❌ No hay proyectos publicados para probar")
            return
            
        # Mostrar algunos proyectos
        for i, project in enumerate(published_projects[:3]):
            print(f"   {i+1}. {project.title} (API: {project.api_level}, TRL: {project.trl_id})")
            
    except Exception as e:
        print(f"❌ Error al obtener proyectos: {e}")
        return
    
    # 3. Verificar postulaciones existentes
    try:
        existing_applications = Aplicacion.objects.filter(student=student)
        print(f"✅ Postulaciones existentes del estudiante: {existing_applications.count()}")
        
        for app in existing_applications:
            print(f"   - {app.project.title} (Estado: {app.status})")
            
    except Exception as e:
        print(f"❌ Error al obtener postulaciones: {e}")
        return
    
    # 4. Probar crear una nueva postulación
    try:
        # Buscar un proyecto al que no se haya postulado
        applied_project_ids = existing_applications.values_list('project_id', flat=True)
        available_project = published_projects.exclude(id__in=applied_project_ids).first()
        
        if not available_project:
            print("❌ No hay proyectos disponibles para postularse")
            return
            
        print(f"✅ Proyecto disponible para postularse: {available_project.title}")
        
        # Crear postulación
        new_application = Aplicacion.objects.create(
            project=available_project,
            student=student,
            status='pending'
        )
        
        print(f"✅ Nueva postulación creada: {new_application.id}")
        print(f"   - Proyecto: {new_application.project.title}")
        print(f"   - Estado: {new_application.status}")
        
        # Verificar que el contador de aplicaciones del proyecto se incrementó
        project_before = Proyecto.objects.get(id=available_project.id)
        print(f"   - Aplicaciones del proyecto: {project_before.applications_count}")
        
    except Exception as e:
        print(f"❌ Error al crear postulación: {e}")
        return
    
    # 5. Probar postulación duplicada
    try:
        duplicate_application = Aplicacion.objects.create(
            project=available_project,
            student=student,
            status='pending'
        )
        print(f"❌ ERROR: Se permitió crear postulación duplicada: {duplicate_application.id}")
        
        # Eliminar la duplicada
        duplicate_application.delete()
        print("   - Postulación duplicada eliminada")
        
    except Exception as e:
        print(f"✅ Correcto: No se permitió postulación duplicada: {e}")
    
    # 6. Verificar estado final
    try:
        final_applications = Aplicacion.objects.filter(student=student)
        print(f"✅ Postulaciones finales del estudiante: {final_applications.count()}")
        
        for app in final_applications:
            print(f"   - {app.project.title} (Estado: {app.status})")
            
    except Exception as e:
        print(f"❌ Error al verificar estado final: {e}")
    
    print("\n" + "=" * 50)
    print("✅ PRUEBA COMPLETADA")

if __name__ == "__main__":
    test_postulaciones() 