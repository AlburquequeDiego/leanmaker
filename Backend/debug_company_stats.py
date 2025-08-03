#!/usr/bin/env python
"""
Script de depuración para verificar estadísticas de empresa
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

def debug_company_stats(company_email=None):
    """Depura las estadísticas de una empresa específica"""
    
    print("🔍 DEPURACIÓN DE ESTADÍSTICAS DE EMPRESA")
    print("=" * 50)
    
    # Obtener empresa
    if company_email:
        try:
            user = User.objects.get(email=company_email, role='company')
            company = user.empresa_profile
        except User.DoesNotExist:
            print(f"❌ Usuario con email {company_email} no encontrado")
            return
        except Exception as e:
            print(f"❌ Error obteniendo empresa: {e}")
            return
    else:
        # Mostrar todas las empresas
        companies = Empresa.objects.all()
        print(f"📋 Empresas encontradas: {companies.count()}")
        for comp in companies:
            print(f"  - {comp.company_name} (ID: {comp.id})")
        return
    
    print(f"🏢 Empresa: {company.company_name}")
    print(f"👤 Usuario: {user.email}")
    print(f"📅 Creada: {company.created_at}")
    print()
    
    # Verificar estados de proyecto disponibles
    print("📊 ESTADOS DE PROYECTO DISPONIBLES:")
    statuses = ProjectStatus.objects.all()
    for status in statuses:
        print(f"  - {status.name} (ID: {status.id})")
    print()
    
    # Proyectos de la empresa
    print("📋 PROYECTOS DE LA EMPRESA:")
    proyectos = Proyecto.objects.filter(company=company)
    print(f"Total proyectos: {proyectos.count()}")
    
    for proyecto in proyectos:
        status_name = proyecto.status.name if proyecto.status else "Sin estado"
        print(f"  - {proyecto.title}")
        print(f"    Estado: {status_name}")
        print(f"    Creado: {proyecto.created_at}")
        print(f"    Actualizado: {proyecto.updated_at}")
        print()
    
    # Estadísticas detalladas
    print("📈 ESTADÍSTICAS DETALLADAS:")
    
    # 1. Total proyectos
    total_projects = proyectos.count()
    print(f"1. Total proyectos: {total_projects}")
    
    # 2. Proyectos activos
    active_projects = proyectos.filter(
        status__name__in=['En Progreso', 'Abierto']
    ).count()
    print(f"2. Proyectos activos: {active_projects}")
    
    # 3. Proyectos completados
    completed_projects = proyectos.filter(
        status__name='Completado'
    ).count()
    print(f"3. Proyectos completados: {completed_projects}")
    
    # 4. Aplicaciones
    aplicaciones = Aplicacion.objects.filter(project__company=company)
    total_applications = aplicaciones.count()
    pending_applications = aplicaciones.filter(status='pending').count()
    print(f"4. Total aplicaciones: {total_applications}")
    print(f"5. Aplicaciones pendientes: {pending_applications}")
    
    # 6. Estudiantes activos
    active_students = MiembroProyecto.objects.filter(
        proyecto__company=company,
        proyecto__status__name='En Progreso',
        esta_activo=True,
        rol='estudiante'
    ).count()
    print(f"6. Estudiantes activos: {active_students}")
    
    # 7. Rating
    rating = float(company.rating) if company.rating else 0.0
    print(f"7. Rating: {rating}")
    
    # 8. Horas ofrecidas
    from django.db.models import Sum, F, Case, When, Value, IntegerField
    total_hours_offered = proyectos.aggregate(
        total_hours=Sum(
            Case(
                When(required_hours__isnull=False, then=F('required_hours')),
                default=F('hours_per_week') * F('duration_weeks'),
                output_field=IntegerField()
            )
        )
    )['total_hours'] or 0
    print(f"8. Horas ofrecidas: {total_hours_offered}")
    
    print()
    print("✅ Depuración completada")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        company_email = sys.argv[1]
        debug_company_stats(company_email)
    else:
        debug_company_stats() 