#!/usr/bin/env python3
"""
Script para verificar la sincronización entre estados de usuarios y estudiantes.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante

def check_sync():
    """Verifica la sincronización entre estados de usuarios y estudiantes."""
    print("🔍 Verificando sincronización entre usuarios y estudiantes...")
    print("=" * 80)
    
    # Obtener todos los usuarios estudiantes
    student_users = User.objects.filter(role='student')
    print(f"📊 Total de usuarios con rol 'student': {student_users.count()}")
    
    # Obtener todos los estudiantes
    estudiantes = Estudiante.objects.all()
    print(f"📊 Total de estudiantes en modelo Estudiante: {estudiantes.count()}")
    
    print("\n🔍 Verificando inconsistencias...")
    print("-" * 80)
    
    inconsistencies = []
    
    for user in student_users:
        try:
            estudiante = Estudiante.objects.get(user=user)
            
            # Verificar sincronización de estados
            user_active = user.is_active
            user_verified = user.is_verified
            student_status = estudiante.status
            
            # Mapeo esperado:
            # - approved -> is_active=True, is_verified=True
            # - suspended -> is_active=False, is_verified=True
            # - rejected/blocked -> is_active=False, is_verified=False
            # - pending -> is_active=False, is_verified=False
            
            expected_active = student_status == 'approved'
            expected_verified = student_status == 'approved' or student_status == 'suspended'
            
            if user_active != expected_active or user_verified != expected_verified:
                inconsistency = {
                    'user_id': user.id,
                    'user_email': user.email,
                    'user_active': user_active,
                    'user_verified': user_verified,
                    'student_status': student_status,
                    'expected_active': expected_active,
                    'expected_verified': expected_verified,
                    'type': 'state_mismatch'
                }
                inconsistencies.append(inconsistency)
                print(f"❌ Usuario {user.email}:")
                print(f"   - Estado User: active={user_active}, verified={user_verified}")
                print(f"   - Estado Estudiante: {student_status}")
                print(f"   - Esperado: active={expected_active}, verified={expected_verified}")
                print()
                
        except Estudiante.DoesNotExist:
            inconsistency = {
                'user_id': user.id,
                'user_email': user.email,
                'type': 'missing_student_profile'
            }
            inconsistencies.append(inconsistency)
            print(f"❌ Usuario {user.email}: No tiene perfil de estudiante")
            print()
    
    # Verificar estudiantes sin usuario
    for estudiante in estudiantes:
        if not hasattr(estudiante, 'user') or estudiante.user is None:
            inconsistency = {
                'student_id': estudiante.id,
                'type': 'missing_user'
            }
            inconsistencies.append(inconsistency)
            print(f"❌ Estudiante ID {estudiante.id}: No tiene usuario asociado")
            print()
    
    print("=" * 80)
    print(f"📊 Resumen:")
    print(f"   - Total de inconsistencias encontradas: {len(inconsistencies)}")
    
    if inconsistencies:
        print(f"\n🔧 Tipos de inconsistencias:")
        types = {}
        for inc in inconsistencies:
            types[inc['type']] = types.get(inc['type'], 0) + 1
        
        for inc_type, count in types.items():
            print(f"   - {inc_type}: {count}")
        
        print(f"\n💡 Recomendaciones:")
        if 'state_mismatch' in types:
            print(f"   - Ejecutar script de sincronización para corregir estados")
        if 'missing_student_profile' in types:
            print(f"   - Crear perfiles de estudiante faltantes")
        if 'missing_user' in types:
            print(f"   - Revisar estudiantes sin usuario asociado")
    else:
        print("✅ ¡Perfecto! No se encontraron inconsistencias.")
    
    return inconsistencies

def fix_inconsistencies():
    """Corrige las inconsistencias encontradas."""
    print("\n🔧 Corrigiendo inconsistencias...")
    print("=" * 80)
    
    inconsistencies = check_sync()
    
    if not inconsistencies:
        print("✅ No hay inconsistencias que corregir.")
        return
    
    fixed_count = 0
    
    for inc in inconsistencies:
        if inc['type'] == 'state_mismatch':
            try:
                user = User.objects.get(id=inc['user_id'])
                estudiante = Estudiante.objects.get(user=user)
                
                # Corregir estados según el status del estudiante
                if estudiante.status == 'approved':
                    user.is_active = True
                    user.is_verified = True
                elif estudiante.status == 'suspended':
                    user.is_active = False
                    user.is_verified = True
                else:  # pending, rejected, blocked
                    user.is_active = False
                    user.is_verified = False
                
                user.save(update_fields=['is_active', 'is_verified'])
                fixed_count += 1
                print(f"✅ Corregido usuario {user.email}: active={user.is_active}, verified={user.is_verified}")
                
            except (User.DoesNotExist, Estudiante.DoesNotExist) as e:
                print(f"❌ Error corrigiendo usuario {inc['user_email']}: {e}")
    
    print(f"\n📊 Total de inconsistencias corregidas: {fixed_count}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--fix":
        fix_inconsistencies()
    else:
        check_sync() 