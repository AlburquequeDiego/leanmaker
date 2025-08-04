#!/usr/bin/env python
"""
Script de prueba para validar horas de proyectos completados
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from work_hours.models import WorkHour
from students.models import Estudiante
from users.models import User
from applications.models import Aplicacion, Asignacion
from django.utils import timezone

def test_validate_hours():
    """Prueba la validación de horas de un proyecto completado"""
    
    print("🔍 [TEST] Iniciando prueba de validación de horas...")
    
    # Buscar un proyecto completado
    proyecto = Proyecto.objects.filter(status__name='completed').first()
    if not proyecto:
        print("❌ [TEST] No se encontró ningún proyecto completado")
        return
    
    print(f"✅ [TEST] Proyecto encontrado: {proyecto.title} (ID: {proyecto.id})")
    print(f"📊 [TEST] Horas requeridas: {proyecto.required_hours}")
    
    # Verificar estudiantes en el proyecto
    miembros = proyecto.miembros.filter(rol='estudiante').select_related('usuario')
    print(f"👥 [TEST] Estudiantes en el proyecto: {miembros.count()}")
    
    for miembro in miembros:
        user = miembro.usuario
        estudiante = getattr(user, 'estudiante_profile', None)
        
        if not estudiante:
            print(f"⚠️  [TEST] Usuario {user.email} sin perfil de estudiante")
            continue
            
        print(f"👤 [TEST] Estudiante: {estudiante.user.full_name} (ID: {estudiante.id})")
        print(f"⏰ [TEST] Horas totales antes: {estudiante.total_hours}")
        
        # Verificar si ya existe WorkHour para este estudiante
        existing_hours = WorkHour.objects.filter(
            project=proyecto, 
            student=estudiante, 
            is_project_completion=True
        )
        
        if existing_hours.exists():
            print(f"⚠️  [TEST] Ya existen horas validadas para {estudiante.user.full_name}")
            continue
            
        # Simular creación de WorkHour
        try:
            workhour = WorkHour.objects.create(
                student=estudiante,
                project=proyecto,
                date=proyecto.real_end_date or proyecto.estimated_end_date or timezone.now().date(),
                hours_worked=proyecto.required_hours,
                description=f"Horas validadas por finalización del proyecto: {proyecto.title}",
                is_verified=True,
                verified_by=user,  # Usar el mismo usuario como verificador
                verified_at=timezone.now(),
                is_project_completion=True
            )
            
            # Actualizar horas totales del estudiante
            estudiante.actualizar_horas_totales(int(proyecto.required_hours))
            
            print(f"✅ [TEST] WorkHour creado exitosamente para {estudiante.user.full_name}")
            print(f"⏰ [TEST] Horas totales después: {estudiante.total_hours}")
            
        except Exception as e:
            print(f"❌ [TEST] Error al crear WorkHour: {str(e)}")
    
    print("🎉 [TEST] Prueba completada")

if __name__ == "__main__":
    test_validate_hours() 