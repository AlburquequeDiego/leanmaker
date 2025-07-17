#!/usr/bin/env python
"""
Script para verificar si los strikes se están creando correctamente después de aprobar un reporte.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from strikes.models import Strike, StrikeReport
from students.models import Estudiante
from users.models import User

def check_strikes_after_approval():
    """Verificar el estado de strikes después de aprobar reportes."""
    print("🔍 VERIFICANDO STRIKES DESPUÉS DE APROBACIÓN")
    print("=" * 60)
    
    # Verificar reportes de strikes
    print("\n📊 REPORTES DE STRIKES:")
    total_reports = StrikeReport.objects.count()
    pending_reports = StrikeReport.objects.filter(status='pending').count()
    approved_reports = StrikeReport.objects.filter(status='approved').count()
    rejected_reports = StrikeReport.objects.filter(status='rejected').count()
    
    print(f"   Total reportes: {total_reports}")
    print(f"   Pendientes: {pending_reports}")
    print(f"   Aprobados: {approved_reports}")
    print(f"   Rechazados: {rejected_reports}")
    
    # Verificar strikes creados
    print("\n📊 STRIKES CREADOS:")
    total_strikes = Strike.objects.count()
    active_strikes = Strike.objects.filter(is_active=True).count()
    
    print(f"   Total strikes: {total_strikes}")
    print(f"   Strikes activos: {active_strikes}")
    
    if total_strikes > 0:
        print("\n📝 Detalles de strikes:")
        for strike in Strike.objects.select_related('student__user', 'company', 'project')[:5]:
            print(f"   - {strike.student.user.full_name} en {strike.company.company_name}")
            print(f"     Motivo: {strike.reason[:50]}...")
            print(f"     Activo: {strike.is_active}")
            print(f"     Fecha: {strike.issued_at}")
            print()
    
    # Verificar estudiantes con strikes
    print("\n👥 ESTUDIANTES CON STRIKES:")
    students_with_strikes = Estudiante.objects.filter(strikes__gt=0)
    print(f"   Estudiantes con strikes > 0: {students_with_strikes.count()}")
    
    for student in students_with_strikes:
        print(f"   - {student.user.full_name}: {student.strikes} strikes")
        print(f"     Estado: {student.status}")
        print()
    
    # Buscar específicamente a Juan Pérez
    print("\n🔍 BUSCANDO A JUAN PÉREZ:")
    try:
        juan_perez = User.objects.filter(first_name__icontains='Juan', last_name__icontains='Pérez').first()
        if juan_perez and hasattr(juan_perez, 'estudiante_profile'):
            student = juan_perez.estudiante_profile
            print(f"   Nombre: {student.user.full_name}")
            print(f"   Email: {student.user.email}")
            print(f"   Strikes: {student.strikes}")
            print(f"   Estado: {student.status}")
            
            # Verificar strikes asociados
            strikes_count = Strike.objects.filter(student=student).count()
            print(f"   Strikes en BD: {strikes_count}")
            
            # Verificar reportes asociados
            reports_count = StrikeReport.objects.filter(student=student).count()
            print(f"   Reportes en BD: {reports_count}")
            
        else:
            print("   ❌ No se encontró Juan Pérez como estudiante")
            
    except Exception as e:
        print(f"   ❌ Error buscando Juan Pérez: {e}")
    
    # Verificar si hay inconsistencias
    print("\n🔍 VERIFICANDO INCONSISTENCIAS:")
    
    # Estudiantes con strikes > 0 pero sin strikes en la tabla Strike
    students_with_count_but_no_strikes = []
    for student in Estudiante.objects.filter(strikes__gt=0):
        strikes_in_table = Strike.objects.filter(student=student).count()
        if strikes_in_table == 0:
            students_with_count_but_no_strikes.append(student)
    
    if students_with_count_but_no_strikes:
        print(f"   ⚠️  {len(students_with_count_but_no_strikes)} estudiantes tienen strikes > 0 pero no hay registros en tabla Strike:")
        for student in students_with_count_but_no_strikes:
            print(f"      - {student.user.full_name}: {student.strikes} strikes")
    else:
        print("   ✅ No hay inconsistencias encontradas")
    
    # Estudiantes con strikes en tabla pero contador = 0
    students_with_strikes_but_count_zero = []
    for student in Estudiante.objects.filter(strikes=0):
        strikes_in_table = Strike.objects.filter(student=student).count()
        if strikes_in_table > 0:
            students_with_strikes_but_count_zero.append(student)
    
    if students_with_strikes_but_count_zero:
        print(f"   ⚠️  {len(students_with_strikes_but_count_zero)} estudiantes tienen strikes en tabla pero contador = 0:")
        for student in students_with_strikes_but_count_zero:
            strikes_count = Strike.objects.filter(student=student).count()
            print(f"      - {student.user.full_name}: {strikes_count} strikes en tabla, contador = {student.strikes}")
    else:
        print("   ✅ No hay inconsistencias encontradas")

if __name__ == '__main__':
    check_strikes_after_approval() 