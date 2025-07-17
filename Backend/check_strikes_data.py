#!/usr/bin/env python
"""
Script para verificar datos de strikes y reportes de strikes en la base de datos.
"""

import os
import django
import uuid
from datetime import datetime, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from strikes.models import Strike, StrikeReport
from users.models import User
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto

def check_strikes_data():
    """Verificar datos de strikes y reportes de strikes."""
    print("🔍 VERIFICANDO DATOS DE STRIKES Y REPORTES")
    print("=" * 60)
    
    # Verificar strikes existentes
    total_strikes = Strike.objects.count()
    active_strikes = Strike.objects.filter(is_active=True).count()
    
    print(f"📊 STRIKES:")
    print(f"   Total strikes: {total_strikes}")
    print(f"   Strikes activos: {active_strikes}")
    
    if total_strikes > 0:
        print("\n📝 Ejemplos de strikes:")
        for strike in Strike.objects.select_related('student__user', 'company', 'project')[:3]:
            print(f"   - {strike.student.user.full_name} en {strike.company.company_name}")
            print(f"     Motivo: {strike.reason[:50]}...")
            print(f"     Activo: {strike.is_active}")
            print()
    
    # Verificar reportes de strikes
    total_reports = StrikeReport.objects.count()
    pending_reports = StrikeReport.objects.filter(status='pending').count()
    approved_reports = StrikeReport.objects.filter(status='approved').count()
    rejected_reports = StrikeReport.objects.filter(status='rejected').count()
    
    print(f"📊 REPORTES DE STRIKES:")
    print(f"   Total reportes: {total_reports}")
    print(f"   Pendientes: {pending_reports}")
    print(f"   Aprobados: {approved_reports}")
    print(f"   Rechazados: {rejected_reports}")
    
    if total_reports > 0:
        print("\n📝 Ejemplos de reportes:")
        for report in StrikeReport.objects.select_related('company', 'student__user', 'project')[:3]:
            print(f"   - {report.company.company_name} → {report.student.user.full_name}")
            print(f"     Motivo: {report.reason[:50]}...")
            print(f"     Estado: {report.status}")
            print()
    
    return total_strikes, total_reports

def create_test_strike_reports():
    """Crear datos de prueba para reportes de strikes."""
    print("\n🚀 CREANDO DATOS DE PRUEBA PARA REPORTES DE STRIKES")
    print("=" * 60)
    
    # Obtener datos existentes
    companies = Empresa.objects.all()
    students = Estudiante.objects.all()
    projects = Proyecto.objects.all()
    
    if not companies.exists():
        print("❌ No hay empresas en la base de datos")
        return False
    
    if not students.exists():
        print("❌ No hay estudiantes en la base de datos")
        return False
    
    if not projects.exists():
        print("❌ No hay proyectos en la base de datos")
        return False
    
    print(f"📊 Datos disponibles:")
    print(f"   Empresas: {companies.count()}")
    print(f"   Estudiantes: {students.count()}")
    print(f"   Proyectos: {projects.count()}")
    
    # Motivos de prueba para strikes
    test_reasons = [
        "Falta de comunicación con el equipo",
        "No cumplimiento de fechas de entrega",
        "Calidad del trabajo por debajo del estándar",
        "Falta de responsabilidad en las tareas asignadas",
        "Comportamiento inapropiado en reuniones",
        "No asistencia a reuniones importantes",
        "Falta de preparación en presentaciones",
        "No seguimiento de las mejores prácticas del proyecto"
    ]
    
    # Descripciones de prueba
    test_descriptions = [
        "El estudiante no ha respondido a los correos del equipo durante más de una semana, afectando el progreso del proyecto.",
        "Se han incumplido múltiples fechas de entrega sin justificación válida, retrasando el cronograma del proyecto.",
        "El trabajo entregado no cumple con los estándares de calidad establecidos por la empresa.",
        "El estudiante no ha demostrado la responsabilidad necesaria en las tareas que se le han asignado.",
        "Se han observado comportamientos inapropiados durante las reuniones de equipo.",
        "El estudiante no ha asistido a reuniones importantes sin previo aviso.",
        "Las presentaciones realizadas no muestran la preparación adecuada.",
        "No se están siguiendo las mejores prácticas establecidas para el desarrollo del proyecto."
    ]
    
    # Crear reportes de prueba
    reports_created = 0
    
    for i in range(min(5, len(companies), len(students), len(projects))):
        try:
            company = companies[i]
            student = students[i]
            project = projects[i]
            reason = test_reasons[i % len(test_reasons)]
            description = test_descriptions[i % len(test_descriptions)]
            
            # Crear reporte
            report = StrikeReport.objects.create(
                company=company,
                student=student,
                project=project,
                reason=reason,
                description=description,
                status='pending'  # Todos pendientes para que el admin los revise
            )
            
            print(f"✅ Reporte creado: {company.company_name} → {student.user.full_name}")
            print(f"   Motivo: {reason}")
            print(f"   Proyecto: {project.title}")
            print()
            
            reports_created += 1
            
        except Exception as e:
            print(f"❌ Error creando reporte {i+1}: {e}")
    
    print(f"🎉 Se crearon {reports_created} reportes de prueba")
    return reports_created

def main():
    """Función principal."""
    print("🔍 VERIFICACIÓN Y CREACIÓN DE DATOS DE STRIKES")
    print("=" * 60)
    
    # Verificar datos existentes
    total_strikes, total_reports = check_strikes_data()
    
    # Si no hay reportes, crear datos de prueba
    if total_reports == 0:
        print("\n📝 No hay reportes de strikes. Creando datos de prueba...")
        reports_created = create_test_strike_reports()
        
        if reports_created > 0:
            print(f"\n✅ Se crearon {reports_created} reportes de prueba")
            print("🔄 Ahora puedes probar la funcionalidad desde la interfaz de administración")
        else:
            print("\n❌ No se pudieron crear reportes de prueba")
    else:
        print("\n✅ Ya existen reportes de strikes en la base de datos")
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada")

if __name__ == '__main__':
    main() 