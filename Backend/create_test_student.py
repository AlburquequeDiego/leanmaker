#!/usr/bin/env python
"""
Script para crear un usuario de prueba con rol de estudiante
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante

def create_test_student():
    """Crear un usuario de prueba con rol de estudiante"""
    print("=== CREANDO USUARIO DE PRUEBA ESTUDIANTE ===")
    
    # Verificar si ya existe
    try:
        user = User.objects.get(email='estudiante@test.com')
        print(f"✅ Usuario ya existe: {user.email}, Rol: {user.role}")
        
        # Verificar si tiene perfil de estudiante
        try:
            estudiante = Estudiante.objects.get(user=user)
            print(f"✅ Perfil de estudiante ya existe: {estudiante}")
        except Estudiante.DoesNotExist:
            print("⚠️ No tiene perfil de estudiante, creando...")
            estudiante = Estudiante.objects.create(user=user)
            print(f"✅ Perfil de estudiante creado: {estudiante}")
        
        return user
        
    except User.DoesNotExist:
        print("❌ Usuario no existe, creando...")
    
    # Crear usuario
    try:
        user = User.objects.create_user(
            email='estudiante@test.com',
            password='test123456',
            first_name='Juan',
            last_name='Pérez',
            role='student',
            phone='+56912345678',
            bio='Estudiante de prueba para testing'
        )
        print(f"✅ Usuario creado: {user.email}, Rol: {user.role}")
        
        # Crear perfil de estudiante
        estudiante = Estudiante.objects.create(
            user=user,
            university='Universidad de Chile',
            career='Ingeniería Informática',
            api_level=1,
            availability='full-time'
        )
        print(f"✅ Perfil de estudiante creado: {estudiante}")
        
        return user
        
    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
        return None

def list_students():
    """Listar todos los usuarios con rol de estudiante"""
    print("\n=== LISTANDO ESTUDIANTES ===")
    students = User.objects.filter(role='student')
    
    if not students:
        print("❌ No hay estudiantes en la base de datos")
        return
    
    for student in students:
        print(f"✅ {student.email} - {student.first_name} {student.last_name} - Rol: {student.role}")
        try:
            profile = Estudiante.objects.get(user=student)
            print(f"   📚 Perfil: {profile.university} - {profile.career}")
        except Estudiante.DoesNotExist:
            print("   ⚠️ Sin perfil de estudiante")

if __name__ == '__main__':
    create_test_student()
    list_students() 