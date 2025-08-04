#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from project_status.models import ProjectStatus
from applications.models import Aplicacion
from students.models import Estudiante

def verify_my_projects_fix():
    print("🔍 VERIFICANDO FIX DE MY_PROJECTS")
    print("=" * 50)
    
    # 1. Obtener un estudiante
    student = Estudiante.objects.first()
    if not student:
        print("❌ No hay estudiantes en la base de datos")
        return
    
    print(f"🔍 Estudiante: {student.user.email}")
    
    # 2. Verificar aplicaciones con el nuevo filtro (incluyendo 'active')
    accepted_statuses = ['accepted', 'active', 'completed']
    applications = Aplicacion.objects.filter(
        student=student, 
        status__in=accepted_statuses
    ).exclude(status='rejected').select_related('project', 'project__company')
    
    print(f"🔍 Aplicaciones con status {accepted_statuses}: {applications.count()}")
    
    # 3. Verificar aplicaciones filtradas por estado del proyecto
    estados_visibles = ProjectStatus.objects.filter(name__in=['published', 'active', 'completed'])
    filtered_applications = applications.filter(project__status__in=estados_visibles)
    
    print(f"🔍 Aplicaciones después de filtrar por estado del proyecto: {filtered_applications.count()}")
    
    # 4. Mostrar cada aplicación que debería aparecer
    print("\n🔍 APLICACIONES QUE DEBERÍAN APARECER EN MY_PROJECTS:")
    print("-" * 60)
    
    for app in filtered_applications:
        project = app.project
        project_status = project.status.name if project.status else 'published'
        
        # Calcular progreso como lo hace el endpoint
        if project_status == 'completed':
            progress = 100
        elif project_status == 'active':
            progress = 75
        elif project_status == 'published':
            progress = 25
        else:
            progress = 0
        
        print(f"✅ Proyecto: '{project.title}'")
        print(f"   - Status de aplicación: '{app.status}'")
        print(f"   - Estado del proyecto: '{project_status}'")
        print(f"   - Progreso calculado: {progress}%")
        print(f"   - Empresa: {project.company.company_name if project.company else 'Sin empresa'}")
        print()
    
    # 5. Verificar que no falten aplicaciones 'active'
    print("🔍 VERIFICACIÓN ESPECÍFICA DE APLICACIONES 'ACTIVE':")
    print("-" * 60)
    
    active_applications = Aplicacion.objects.filter(
        student=student,
        status='active'
    ).select_related('project', 'project__company')
    
    print(f"🔍 Aplicaciones con status 'active': {active_applications.count()}")
    
    for app in active_applications:
        project = app.project
        print(f"  - Proyecto: '{project.title}'")
        print(f"    Status: '{app.status}'")
        print(f"    Estado del proyecto: '{project.status.name if project.status else 'Sin estado'}'")
        print()

if __name__ == "__main__":
    verify_my_projects_fix() 