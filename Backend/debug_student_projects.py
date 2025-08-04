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
from users.models import User

def debug_student_projects():
    print("🔍 DEBUGGING STUDENT PROJECTS")
    print("=" * 50)
    
    # 1. Verificar estudiantes disponibles
    print("\n1. ESTUDIANTES DISPONIBLES:")
    print("-" * 40)
    students = Estudiante.objects.all()
    for student in students:
        user = student.user
        print(f"  - ID: {student.id}, Email: {user.email}, Nombre: {user.first_name} {user.last_name}")
    
    if not students.exists():
        print("  ❌ No hay estudiantes en la base de datos")
        return
    
    # Usar el primer estudiante para el debug
    student = students.first()
    print(f"\n🔍 Usando estudiante: {student.user.email}")
    
    # 2. Verificar todas las aplicaciones del estudiante
    print("\n2. TODAS LAS APLICACIONES DEL ESTUDIANTE:")
    print("-" * 40)
    all_applications = Aplicacion.objects.filter(student=student)
    print(f"  Total de aplicaciones: {all_applications.count()}")
    
    for app in all_applications:
        project = app.project
        print(f"  - Proyecto: '{project.title}'")
        print(f"    Status de aplicación: '{app.status}'")
        print(f"    Estado del proyecto: '{project.status.name if project.status else 'Sin estado'}'")
        print(f"    Empresa: {project.company.company_name if project.company else 'Sin empresa'}")
        print()
    
    # 3. Verificar aplicaciones con status 'accepted' o 'completed'
    print("\n3. APLICACIONES ACEPTADAS O COMPLETADAS:")
    print("-" * 40)
    accepted_applications = Aplicacion.objects.filter(
        student=student,
        status__in=['accepted', 'completed']
    ).exclude(status='rejected')
    
    print(f"  Aplicaciones aceptadas/completadas: {accepted_applications.count()}")
    
    for app in accepted_applications:
        project = app.project
        print(f"  - Proyecto: '{project.title}'")
        print(f"    Status de aplicación: '{app.status}'")
        print(f"    Estado del proyecto: '{project.status.name if project.status else 'Sin estado'}'")
        print()
    
    # 4. Verificar aplicaciones filtradas por estado del proyecto
    print("\n4. APLICACIONES FILTRADAS POR ESTADO DEL PROYECTO:")
    print("-" * 40)
    
    # Estados visibles según el código
    estados_visibles = ProjectStatus.objects.filter(name__in=['published', 'active', 'completed'])
    print(f"  Estados visibles: {[s.name for s in estados_visibles]}")
    
    filtered_applications = accepted_applications.filter(project__status__in=estados_visibles)
    print(f"  Aplicaciones después del filtro: {filtered_applications.count()}")
    
    for app in filtered_applications:
        project = app.project
        print(f"  - Proyecto: '{project.title}'")
        print(f"    Status de aplicación: '{app.status}'")
        print(f"    Estado del proyecto: '{project.status.name}'")
        print()
    
    # 5. Simular la lógica del endpoint my_projects
    print("\n5. SIMULACIÓN DEL ENDPOINT MY_PROJECTS:")
    print("-" * 40)
    
    projects_data = []
    for app in filtered_applications:
        project = app.project
        project_status = project.status.name if project.status else 'published'
        
        # Calcular progreso
        if project_status == 'completed':
            progress = 100
        elif project_status == 'active':
            progress = 75
        elif project_status == 'published':
            progress = 25
        else:
            progress = 0
        
        project_data = {
            'id': str(project.id),
            'title': project.title,
            'company': project.company.company_name if project.company else 'Sin empresa',
            'status': project_status,
            'progress': progress,
        }
        projects_data.append(project_data)
        print(f"  - Proyecto procesado: '{project.title}'")
        print(f"    Status: '{project_status}'")
        print(f"    Progreso: {progress}%")
        print()
    
    print(f"  Total de proyectos a devolver: {len(projects_data)}")
    
    # 6. Verificar estados de proyectos disponibles
    print("\n6. ESTADOS DE PROYECTOS DISPONIBLES:")
    print("-" * 40)
    all_statuses = ProjectStatus.objects.all()
    for status in all_statuses:
        count = Proyecto.objects.filter(status=status).count()
        print(f"  - Estado '{status.name}': {count} proyectos")

if __name__ == "__main__":
    debug_student_projects() 