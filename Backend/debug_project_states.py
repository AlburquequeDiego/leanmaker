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
from projects.models import MiembroProyecto

def debug_project_states():
    print("🔍 DEBUGGING PROJECT STATES")
    print("=" * 50)
    
    # 1. Verificar estados disponibles
    print("\n1. ESTADOS DISPONIBLES EN LA BASE DE DATOS:")
    print("-" * 40)
    statuses = ProjectStatus.objects.all()
    for status in statuses:
        print(f"  - ID: {status.id}, Nombre: '{status.name}', Color: {status.color}")
    
    # 2. Contar proyectos por estado
    print("\n2. PROYECTOS POR ESTADO:")
    print("-" * 40)
    for status in statuses:
        count = Proyecto.objects.filter(status=status).count()
        print(f"  - Estado '{status.name}': {count} proyectos")
    
    # 3. Verificar proyectos específicos
    print("\n3. PROYECTOS ESPECÍFICOS:")
    print("-" * 40)
    projects = Proyecto.objects.all()[:5]  # Primeros 5 proyectos
    for project in projects:
        print(f"  - Proyecto: '{project.title}'")
        print(f"    Estado: '{project.status.name if project.status else 'Sin estado'}'")
        print(f"    Empresa: {project.company.company_name if project.company else 'Sin empresa'}")
        
        # Contar aplicaciones aceptadas
        accepted_apps = Aplicacion.objects.filter(
            project=project, 
            status__in=['accepted', 'active', 'completed']
        ).count()
        print(f"    Aplicaciones aceptadas: {accepted_apps}")
        
        # Contar miembros activos
        active_members = MiembroProyecto.objects.filter(
            proyecto=project,
            rol='estudiante',
            esta_activo=True
        ).count()
        print(f"    Miembros activos: {active_members}")
        print()
    
    # 4. Analizar lógica de "proyectos activos"
    print("\n4. ANÁLISIS DE LÓGICA 'PROYECTOS ACTIVOS':")
    print("-" * 40)
    
    # Lógica actual (solo por estado 'active')
    active_by_status = Proyecto.objects.filter(status__name='active').count()
    print(f"  - Proyectos con estado 'active': {active_by_status}")
    
    # Lógica alternativa 1: proyectos con estudiantes trabajando
    projects_with_students = Proyecto.objects.filter(
        aplicaciones__status__in=['accepted', 'active', 'completed']
    ).distinct().count()
    print(f"  - Proyectos con estudiantes aceptados: {projects_with_students}")
    
    # Lógica alternativa 2: proyectos con miembros activos
    projects_with_active_members = Proyecto.objects.filter(
        miembros__rol='estudiante',
        miembros__esta_activo=True
    ).distinct().count()
    print(f"  - Proyectos con miembros activos: {projects_with_active_members}")
    
    # Lógica alternativa 3: proyectos en desarrollo (active + published con estudiantes)
    development_projects = Proyecto.objects.filter(
        status__name__in=['active', 'published']
    ).filter(
        aplicaciones__status__in=['accepted', 'active', 'completed']
    ).distinct().count()
    print(f"  - Proyectos en desarrollo (active/published con estudiantes): {development_projects}")
    
    print("\n5. RECOMENDACIÓN:")
    print("-" * 40)
    print("  El contador 'Proyectos Activos' debería mostrar proyectos que:")
    print("  a) Tienen estado 'active' O")
    print("  b) Tienen estado 'published' Y tienen estudiantes aceptados")
    print("  Esto reflejaría mejor la actividad real de la empresa.")

if __name__ == "__main__":
    debug_project_states() 