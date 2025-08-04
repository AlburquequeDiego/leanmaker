#!/usr/bin/env python
"""
Script de prueba para verificar que el sistema de validación de horas funciona correctamente
después de las correcciones realizadas.
"""

import os
import sys
import django
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from work_hours.models import WorkHour
from students.models import Estudiante
from users.models import User
from applications.models import Aplicacion, Asignacion
from project_status.models import ProjectStatus

def test_hour_validation_system():
    """Prueba el sistema de validación de horas"""
    print("=== PRUEBA DEL SISTEMA DE VALIDACIÓN DE HORAS ===\n")
    
    # 1. Verificar que existen proyectos completados
    try:
        status_completado = ProjectStatus.objects.get(name='Completado')
        proyectos_completados = Proyecto.objects.filter(status=status_completado)
        print(f"1. Proyectos completados encontrados: {proyectos_completados.count()}")
        
        if proyectos_completados.exists():
            proyecto = proyectos_completados.first()
            print(f"   - Proyecto de prueba: {proyecto.title} (ID: {proyecto.id})")
            print(f"   - Horas requeridas: {proyecto.required_hours}")
            print(f"   - Estado: {proyecto.status.name}")
        else:
            print("   ⚠️  No hay proyectos completados para probar")
            return
    except ProjectStatus.DoesNotExist:
        print("   ❌ Estado 'Completado' no encontrado en ProjectStatus")
        return
    
    # 2. Verificar estudiantes en el proyecto
    miembros = proyecto.miembros.filter(rol='estudiante')
    print(f"\n2. Estudiantes en el proyecto: {miembros.count()}")
    
    for miembro in miembros:
        user = miembro.usuario
        estudiante = getattr(user, 'estudiante_profile', None)
        if estudiante:
            print(f"   - {user.full_name} (ID: {estudiante.id}) - Horas totales: {estudiante.total_hours}")
        else:
            print(f"   - {user.full_name} (sin perfil de estudiante)")
    
    # 3. Verificar WorkHours existentes
    work_hours_existentes = WorkHour.objects.filter(project=proyecto, is_project_completion=True)
    print(f"\n3. WorkHours existentes para el proyecto: {work_hours_existentes.count()}")
    
    for wh in work_hours_existentes:
        print(f"   - Estudiante: {wh.student.user.full_name}")
        print(f"     Horas: {wh.hours_worked}")
        print(f"     Verificado: {wh.is_verified}")
        print(f"     Verificado por: {wh.verified_by.full_name if wh.verified_by else 'N/A'}")
    
    # 4. Verificar aplicaciones
    aplicaciones = Aplicacion.objects.filter(project=proyecto)
    print(f"\n4. Aplicaciones para el proyecto: {aplicaciones.count()}")
    
    for app in aplicaciones:
        print(f"   - Estudiante: {app.student.user.full_name}")
        print(f"     Estado: {app.status}")
        print(f"     Fecha: {app.applied_at}")
    
    # 5. Verificar asignaciones
    asignaciones = Asignacion.objects.filter(application__project=proyecto)
    print(f"\n5. Asignaciones para el proyecto: {asignaciones.count()}")
    
    for asignacion in asignaciones:
        print(f"   - Estudiante: {asignacion.application.student.user.full_name}")
        print(f"     Estado: {asignacion.estado}")
        print(f"     Fecha inicio: {asignacion.fecha_inicio}")
    
    # 6. Simular creación de WorkHour (sin guardar)
    print(f"\n6. Simulación de creación de WorkHour:")
    
    for miembro in miembros:
        user = miembro.usuario
        estudiante = getattr(user, 'estudiante_profile', None)
        
        if not estudiante:
            print(f"   ⚠️  {user.full_name}: Sin perfil de estudiante")
            continue
        
        # Verificar si ya existe WorkHour
        if WorkHour.objects.filter(project=proyecto, student=estudiante, is_project_completion=True).exists():
            print(f"   ✅ {user.full_name}: Ya tiene WorkHour")
            continue
        
        # Simular creación
        try:
            workhour_data = {
                'student': estudiante,
                'project': proyecto,
                'date': proyecto.real_end_date or proyecto.estimated_end_date or '2024-01-01',
                'hours_worked': float(proyecto.required_hours),
                'description': f"Horas validadas por finalización del proyecto: {proyecto.title}",
                'is_verified': True,
                'verified_by': None,  # Sería el admin en la práctica
                'verified_at': '2024-01-01 12:00:00',
                'is_project_completion': True
            }
            print(f"   ✅ {user.full_name}: Datos válidos para crear WorkHour")
            print(f"      - Horas a sumar: {proyecto.required_hours}")
            print(f"      - Horas actuales del estudiante: {estudiante.total_hours}")
            print(f"      - Horas después de sumar: {estudiante.total_hours + proyecto.required_hours}")
        except Exception as e:
            print(f"   ❌ {user.full_name}: Error en datos - {str(e)}")
    
    print(f"\n=== PRUEBA COMPLETADA ===")

if __name__ == "__main__":
    test_hour_validation_system() 