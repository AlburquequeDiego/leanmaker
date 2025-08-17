#!/usr/bin/env python
"""
Script para verificar datos en la base de datos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto
from project_status.models import ProjectStatus
from applications.models import Aplicacion
from work_hours.models import WorkHour

def check_database_data():
    print("🔍 Verificando datos en la base de datos...")
    print("=" * 50)
    
    # Verificar usuarios
    print("\n👥 USUARIOS:")
    total_users = User.objects.count()
    print(f"Total usuarios: {total_users}")
    
    if total_users > 0:
        users = User.objects.all()[:5]
        for user in users:
            print(f"  - {user.email} (rol: {user.role})")
    
    # Verificar empresas
    print("\n🏢 EMPRESAS:")
    total_companies = Empresa.objects.count()
    print(f"Total empresas: {total_companies}")
    
    if total_companies > 0:
        companies = Empresa.objects.all()[:5]
        for company in companies:
            print(f"  - {company.company_name} (ID: {company.id})")
    else:
        print("  ❌ No hay empresas en la base de datos")
    
    # Verificar estudiantes
    print("\n🎓 ESTUDIANTES:")
    total_students = Estudiante.objects.count()
    print(f"Total estudiantes: {total_students}")
    
    if total_students > 0:
        students = Estudiante.objects.all()[:5]
        for student in students:
            user_email = student.user.email if student.user else "Sin usuario"
            print(f"  - {user_email} (ID: {student.id})")
    else:
        print("  ❌ No hay estudiantes en la base de datos")
    
    # Verificar proyectos
    print("\n💼 PROYECTOS:")
    total_projects = Proyecto.objects.count()
    print(f"Total proyectos: {total_projects}")
    
    if total_projects > 0:
        projects = Proyecto.objects.all()[:5]
        for project in projects:
            print(f"  - {project.title} (ID: {project.id})")
    
    # Verificar estados de proyecto
    print("\n🚀 ESTADOS DE PROYECTO:")
    total_statuses = ProjectStatus.objects.count()
    print(f"Total estados: {total_statuses}")
    
    if total_statuses > 0:
        statuses = ProjectStatus.objects.all()
        for status in statuses:
            print(f"  - {status.name} (ID: {status.id})")
    
    # Verificar aplicaciones
    print("\n📝 APLICACIONES:")
    total_applications = Aplicacion.objects.count()
    print(f"Total aplicaciones: {total_applications}")
    
    if total_applications > 0:
        applications = Aplicacion.objects.all()[:5]
        for app in applications:
            print(f"  - Proyecto: {app.project.title if app.project else 'Sin proyecto'} (Estado: {app.status})")
    
    # Verificar work hours
    print("\n⏰ WORK HOURS:")
    total_work_hours = WorkHour.objects.count()
    print(f"Total work hours: {total_work_hours}")
    
    if total_work_hours > 0:
        work_hours = WorkHour.objects.all()[:5]
        for wh in work_hours:
            print(f"  - Proyecto: {wh.project.title if wh.project else 'Sin proyecto'} (Verificado: {wh.is_verified})")
    
    print("\n" + "=" * 50)
    print("✅ Verificación completada")

if __name__ == "__main__":
    check_database_data()
