#!/usr/bin/env python
"""
Script para verificar los datos del Top 10 estudiantes
y comparar con lo que se muestra en la interfaz
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante
from work_hours.models import WorkHour
from django.db.models import Sum
from users.models import User

def verificar_datos_top_students():
    """Verifica los datos del Top 10 estudiantes"""
    
    print("🔍 VERIFICACIÓN DE DATOS TOP 10 ESTUDIANTES")
    print("=" * 60)
    
    # 1. Verificar total de work hours
    total_work_hours = WorkHour.objects.count()
    print(f"📊 Total de work hours en BD: {total_work_hours}")
    
    # 2. Verificar estudiantes con work hours
    students_with_any_hours = Estudiante.objects.filter(work_hours__isnull=False).distinct().count()
    print(f"👥 Estudiantes con work hours: {students_with_any_hours}")
    
    # 3. Consulta principal (igual a la del backend)
    students_with_hours = Estudiante.objects.annotate(
        calculated_total_hours=Sum('work_hours__hours_worked')
    ).filter(
        calculated_total_hours__isnull=False
    ).order_by('-calculated_total_hours')[:10]
    
    print(f"🏆 Estudiantes encontrados con horas: {students_with_hours.count()}")
    print()
    
    # 4. Verificar cada estudiante
    for i, student in enumerate(students_with_hours, 1):
        print(f"🏅 POSICIÓN {i}:")
        print(f"   - ID: {student.id}")
        
        # Datos del usuario
        if hasattr(student, 'user') and student.user:
            user = student.user
            print(f"   - Nombre: {user.first_name} {user.last_name}")
            print(f"   - Email: {user.email}")
            print(f"   - Nombre completo: {user.full_name}")
        else:
            print(f"   - ⚠️ NO TIENE USUARIO ASOCIADO")
        
        # Horas calculadas vs horas del modelo
        calculated_hours = student.calculated_total_hours or 0
        model_hours = student.total_hours or 0
        print(f"   - Horas calculadas (Sum): {calculated_hours}")
        print(f"   - Horas del modelo (total_hours): {model_hours}")
        
        # Verificar si coinciden
        if calculated_hours != model_hours:
            print(f"   - ⚠️ DISCREPANCIA: Las horas no coinciden!")
        
        # Otros datos
        print(f"   - Proyectos completados: {student.completed_projects or 0}")
        print(f"   - API Level: {student.api_level or 1}")
        print(f"   - Strikes: {student.strikes or 0}")
        print(f"   - GPA: {student.gpa or 0.0}")
        print(f"   - Carrera: {student.career or 'No especificada'}")
        print(f"   - Universidad: {getattr(student, 'university', 'No especificada') or 'No especificada'}")
        
        # Verificar work hours individuales
        work_hours = student.work_hours.all()
        print(f"   - Work hours individuales: {work_hours.count()}")
        for wh in work_hours[:3]:  # Mostrar solo los primeros 3
            print(f"     * {wh.date}: {wh.hours_worked}h - {wh.project.title if wh.project else 'Sin proyecto'}")
        if work_hours.count() > 3:
            print(f"     ... y {work_hours.count() - 3} más")
        
        print()
    
    # 5. Verificar datos específicos del estudiante mostrado en la imagen
    print("🔍 VERIFICACIÓN ESPECÍFICA - JUAN PEREZ:")
    print("-" * 40)
    
    # Buscar por email
    try:
        juan_user = User.objects.get(email='juan.perez@inacapmail.cl')
        juan_student = Estudiante.objects.get(user=juan_user)
        
        print(f"✅ Encontrado: {juan_user.full_name}")
        print(f"   - Email: {juan_user.email}")
        print(f"   - Universidad: {juan_student.university}")
        print(f"   - Carrera: {juan_student.career}")
        print(f"   - Horas totales (modelo): {juan_student.total_hours}")
        print(f"   - Horas calculadas: {juan_student.work_hours.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0}")
        print(f"   - Proyectos completados: {juan_student.completed_projects}")
        print(f"   - API Level: {juan_student.api_level}")
        print(f"   - GPA: {juan_student.gpa}")
        print(f"   - Strikes: {juan_student.strikes}")
        
    except User.DoesNotExist:
        print("❌ No se encontró usuario con email: juan.perez@inacapmail.cl")
    except Estudiante.DoesNotExist:
        print("❌ No se encontró perfil de estudiante para juan.perez@inacapmail.cl")
    
    print()
    print("=" * 60)
    print("✅ VERIFICACIÓN COMPLETADA")

if __name__ == "__main__":
    verificar_datos_top_students() 