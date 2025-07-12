#!/usr/bin/env python
"""
Script para crear aplicaciones de prueba para estudiantes
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto
from applications.models import Aplicacion

def create_test_applications():
    """Crear aplicaciones de prueba para estudiantes"""
    print("=== CREANDO APLICACIONES DE PRUEBA ===")
    
    # Obtener un estudiante
    try:
        student_user = User.objects.get(email='juan.perez@uchile.cl')
        student = Estudiante.objects.get(user=student_user)
        print(f"✅ Estudiante encontrado: {student.user.full_name}")
    except (User.DoesNotExist, Estudiante.DoesNotExist):
        print("❌ Estudiante juan.perez@uchile.cl no encontrado")
        return
    
    # Obtener o crear una empresa
    try:
        company_user = User.objects.filter(role='company').first()
        if not company_user:
            print("❌ No hay empresas en la base de datos")
            return
        
        company = Empresa.objects.get(user=company_user)
        print(f"✅ Empresa encontrada: {company.company_name}")
    except Empresa.DoesNotExist:
        print("❌ Perfil de empresa no encontrado")
        return
    
    # Obtener o crear proyectos
    projects = Proyecto.objects.filter(company=company)[:5]
    if not projects.exists():
        print("❌ No hay proyectos en la base de datos")
        return
    
    print(f"✅ Proyectos encontrados: {projects.count()}")
    
    # Crear aplicaciones de prueba
    statuses = ['pending', 'accepted', 'rejected', 'completed', 'reviewing']
    cover_letters = [
        "Me interesa mucho este proyecto porque me permitirá desarrollar mis habilidades en desarrollo web.",
        "Tengo experiencia en las tecnologías requeridas y creo que puedo aportar mucho valor al proyecto.",
        "Este proyecto se alinea perfectamente con mis objetivos profesionales y mi área de estudio.",
        "He trabajado en proyectos similares y estoy emocionado por la oportunidad de participar.",
        "Mi formación académica y experiencia práctica me preparan bien para este desafío."
    ]
    
    applications_created = 0
    
    for i, project in enumerate(projects):
        # Verificar si ya existe una aplicación para este proyecto y estudiante
        existing_application = Aplicacion.objects.filter(
            project=project,
            student=student
        ).first()
        
        if existing_application:
            print(f"⚠️ Aplicación ya existe para proyecto: {project.title}")
            continue
        
        # Crear aplicación
        status = statuses[i % len(statuses)]
        cover_letter = cover_letters[i % len(cover_letters)]
        
        application = Aplicacion.objects.create(
            project=project,
            student=student,
            status=status,
            compatibility_score=75 + (i * 5),  # Score variado
            cover_letter=cover_letter,
            student_notes=f"Nota del estudiante para {project.title}",
            portfolio_url="https://mi-portfolio.com",
            github_url="https://github.com/estudiante-dev",
            linkedin_url="https://linkedin.com/in/estudiante-dev",
            applied_at=timezone.now() - timedelta(days=i * 7),  # Fechas variadas
        )
        
        # Si es accepted o completed, agregar fechas de respuesta
        if status in ['accepted', 'rejected', 'completed']:
            application.reviewed_at = application.applied_at + timedelta(days=3)
            application.responded_at = application.applied_at + timedelta(days=5)
            application.save()
        
        print(f"✅ Aplicación creada: {project.title} - Estado: {status}")
        applications_created += 1
    
    print(f"\n🎉 Se crearon {applications_created} aplicaciones de prueba")
    
    # Mostrar resumen
    total_applications = Aplicacion.objects.filter(student=student).count()
    print(f"\n📊 RESUMEN:")
    print(f"Total de aplicaciones del estudiante: {total_applications}")
    
    for status in statuses:
        count = Aplicacion.objects.filter(student=student, status=status).count()
        print(f"  - {status}: {count}")

def list_student_applications():
    """Listar todas las aplicaciones de un estudiante"""
    print("\n=== APLICACIONES DEL ESTUDIANTE ===")
    
    try:
        student_user = User.objects.get(email='juan.perez@uchile.cl')
        student = Estudiante.objects.get(user=student_user)
        
        applications = Aplicacion.objects.filter(student=student).select_related('project', 'project__company')
        
        if not applications.exists():
            print("❌ No hay aplicaciones para este estudiante")
            return
        
        for app in applications:
            print(f"✅ {app.project.title} - {app.project.company.company_name} - Estado: {app.status}")
            print(f"   Fecha: {app.applied_at.strftime('%Y-%m-%d')}")
            print(f"   Score: {app.compatibility_score}")
            print()
            
    except (User.DoesNotExist, Estudiante.DoesNotExist):
        print("❌ Estudiante no encontrado")

if __name__ == '__main__':
    create_test_applications()
    list_student_applications() 