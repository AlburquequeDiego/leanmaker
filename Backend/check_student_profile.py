#!/usr/bin/env python
"""
Script para verificar perfiles de estudiantes
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante

def check_student_profiles():
    """Verificar perfiles de estudiantes"""
    print("=== Verificación de Perfiles de Estudiantes ===")
    
    # Contar usuarios y estudiantes
    total_users = User.objects.count()
    total_students = Estudiante.objects.count()
    student_users = User.objects.filter(role='student').count()
    
    print(f"Total usuarios: {total_users}")
    print(f"Usuarios estudiantes: {student_users}")
    print(f"Perfiles de estudiantes: {total_students}")
    
    # Verificar usuarios estudiantes sin perfil
    student_users_without_profile = []
    for user in User.objects.filter(role='student'):
        try:
            profile = user.estudiante_profile
            print(f"✅ {user.email} - Tiene perfil: {profile.id}")
        except Estudiante.DoesNotExist:
            print(f"❌ {user.email} - SIN PERFIL")
            student_users_without_profile.append(user)
    
    print(f"\nUsuarios estudiantes sin perfil: {len(student_users_without_profile)}")
    
    if student_users_without_profile:
        print("\nCreando perfiles faltantes...")
        for user in student_users_without_profile:
            try:
                Estudiante.objects.create(user=user)
                print(f"✅ Creado perfil para {user.email}")
            except Exception as e:
                print(f"❌ Error creando perfil para {user.email}: {e}")

if __name__ == "__main__":
    check_student_profiles() 