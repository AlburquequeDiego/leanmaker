#!/usr/bin/env python
"""
Script simple para verificar datos de empresa
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from applications.models import Aplicacion
from projects.models import MiembroProyecto
from companies.models import Empresa
from users.models import User
from project_status.models import ProjectStatus

print("🔍 VERIFICANDO DATOS DE EMPRESA")
print("=" * 50)

# Obtener la primera empresa
try:
    company = Empresa.objects.first()
    if company:
        print(f"🏢 Empresa: {company.company_name}")
        print(f"📅 Creada: {company.created_at}")
        print(f"⭐ Rating: {company.rating}")
        print()
        
        # Proyectos
        proyectos = Proyecto.objects.filter(company=company)
        print(f"📋 Total proyectos: {proyectos.count()}")
        
        for proyecto in proyectos:
            status_name = proyecto.status.name if proyecto.status else "Sin estado"
            print(f"  - {proyecto.title} (Estado: {status_name})")
        
        print()
        
        # Estados disponibles
        print("📊 Estados de proyecto disponibles:")
        for status in ProjectStatus.objects.all():
            print(f"  - {status.name}")
        
        print()
        
        # Estadísticas
        active_projects = proyectos.filter(status__name__in=['En Progreso', 'Abierto']).count()
        completed_projects = proyectos.filter(status__name='Completado').count()
        total_applications = Aplicacion.objects.filter(project__company=company).count()
        pending_applications = Aplicacion.objects.filter(project__company=company, status='pending').count()
        active_students = MiembroProyecto.objects.filter(
            proyecto__company=company,
            proyecto__status__name='En Progreso',
            esta_activo=True,
            rol='estudiante'
        ).count()
        
        print("📈 ESTADÍSTICAS:")
        print(f"  - Proyectos activos: {active_projects}")
        print(f"  - Proyectos completados: {completed_projects}")
        print(f"  - Total aplicaciones: {total_applications}")
        print(f"  - Aplicaciones pendientes: {pending_applications}")
        print(f"  - Estudiantes activos: {active_students}")
        
    else:
        print("❌ No se encontraron empresas")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 