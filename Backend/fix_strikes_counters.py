#!/usr/bin/env python
"""
Script para corregir los contadores de strikes de todos los estudiantes.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from strikes.models import Strike
from students.models import Estudiante
from django.db import transaction

def fix_strikes_counters():
    """Corregir los contadores de strikes de todos los estudiantes."""
    print("🔧 CORRIGIENDO CONTADORES DE STRIKES")
    print("=" * 60)
    
    # Obtener todos los estudiantes
    students = Estudiante.objects.all()
    print(f"📊 Total de estudiantes: {students.count()}")
    
    fixed_count = 0
    errors = []
    
    with transaction.atomic():
        for student in students:
            try:
                # Contar strikes activos del estudiante
                active_strikes = Strike.objects.filter(
                    student=student, 
                    is_active=True
                ).count()
                
                # Contar strikes totales del estudiante
                total_strikes = Strike.objects.filter(student=student).count()
                
                # Obtener el contador actual
                current_count = student.strikes
                
                # Si hay diferencia, corregir
                if current_count != active_strikes:
                    print(f"🔧 Corrigiendo {student.user.full_name}:")
                    print(f"   Contador actual: {current_count}")
                    print(f"   Strikes activos: {active_strikes}")
                    print(f"   Strikes totales: {total_strikes}")
                    
                    # Actualizar el contador
                    student.strikes = active_strikes
                    
                    # Si tiene 3 o más strikes, suspender
                    if active_strikes >= 3:
                        student.status = 'suspended'
                        print(f"   ⚠️  Estudiante suspendido por {active_strikes} strikes")
                    
                    student.save(update_fields=['strikes', 'status'])
                    fixed_count += 1
                    print(f"   ✅ Corregido a {active_strikes} strikes")
                    print()
                else:
                    print(f"✅ {student.user.full_name}: {current_count} strikes (correcto)")
                    
            except Exception as e:
                error_msg = f"Error corrigiendo {student.user.full_name}: {str(e)}"
                print(f"❌ {error_msg}")
                errors.append(error_msg)
    
    print("\n" + "=" * 60)
    print(f"🎉 CORRECCIÓN COMPLETADA")
    print(f"   Estudiantes corregidos: {fixed_count}")
    print(f"   Errores: {len(errors)}")
    
    if errors:
        print("\n❌ Errores encontrados:")
        for error in errors:
            print(f"   - {error}")
    
    # Verificar el resultado
    print("\n🔍 VERIFICACIÓN FINAL:")
    students_with_strikes = Estudiante.objects.filter(strikes__gt=0)
    print(f"   Estudiantes con strikes > 0: {students_with_strikes.count()}")
    
    for student in students_with_strikes:
        active_strikes = Strike.objects.filter(student=student, is_active=True).count()
        print(f"   - {student.user.full_name}: {student.strikes} strikes (BD: {active_strikes})")
        if student.strikes != active_strikes:
            print(f"     ⚠️  INCONSISTENCIA DETECTADA!")
    
    print("\n✅ Verificación completada")

if __name__ == '__main__':
    fix_strikes_counters() 