#!/usr/bin/env python
"""
Script de prueba para verificar la consistencia de datos en la base de datos.
Este script verifica que los datos se guarden correctamente tanto para estudiantes como para empresas.
"""

import os
import sys
import django
from datetime import datetime, date

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante, PerfilEstudiante
from companies.models import Empresa
import json

def test_student_creation():
    """Prueba la creación de un estudiante con todos sus datos."""
    print("\n=== PRUEBA DE CREACIÓN DE ESTUDIANTE ===")
    
    try:
        # Crear usuario estudiante
        user_data = {
            'email': 'test.student@inacapmail.cl',
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'phone': '+56912345678',
            'birthdate': date(2000, 1, 15),
            'gender': 'Masculino',
            'role': 'student'
        }
        
        user = User.objects.create_user(
            username='test.student',
            email=user_data['email'],
            password='testpass123',
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            phone=user_data['phone'],
            birthdate=user_data['birthdate'],
            gender=user_data['gender'],
            role=user_data['role']
        )
        
        print(f"✅ Usuario estudiante creado - ID: {user.id}")
        print(f"   - Email: {user.email}")
        print(f"   - Nombre: {user.full_name}")
        print(f"   - Birthdate: {user.birthdate}")
        print(f"   - Gender: {user.gender}")
        
        # Verificar que se creó el perfil de estudiante automáticamente
        try:
            estudiante = Estudiante.objects.get(user=user)
            print(f"✅ Perfil de estudiante creado automáticamente - ID: {estudiante.id}")
            print(f"   - Career: {estudiante.career}")
            print(f"   - University: {estudiante.university}")
            print(f"   - Status: {estudiante.status}")
            print(f"   - API Level: {estudiante.api_level}")
            print(f"   - TRL Level: {estudiante.trl_level}")
            
            # Verificar que se creó el perfil detallado
            try:
                perfil = PerfilEstudiante.objects.get(estudiante=estudiante)
                print(f"✅ Perfil detallado creado automáticamente - ID: {perfil.id}")
                print(f"   - Fecha nacimiento: {perfil.fecha_nacimiento}")
                print(f"   - Género: {perfil.genero}")
                print(f"   - Universidad: {perfil.universidad}")
            except PerfilEstudiante.DoesNotExist:
                print("❌ Perfil detallado NO se creó automáticamente")
                
        except Estudiante.DoesNotExist:
            print("❌ Perfil de estudiante NO se creó automáticamente")
            
        return user, estudiante if 'estudiante' in locals() else None
        
    except Exception as e:
        print(f"❌ Error creando estudiante: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def test_company_creation():
    """Prueba la creación de una empresa con todos sus datos."""
    print("\n=== PRUEBA DE CREACIÓN DE EMPRESA ===")
    
    try:
        # Crear usuario empresa
        user_data = {
            'email': 'test.company@empresa.cl',
            'first_name': 'María',
            'last_name': 'González',
            'phone': '+56987654321',
            'birthdate': date(1985, 5, 20),
            'gender': 'Femenino',
            'role': 'company'
        }
        
        user = User.objects.create_user(
            username='test.company',
            email=user_data['email'],
            password='testpass123',
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            phone=user_data['phone'],
            birthdate=user_data['birthdate'],
            gender=user_data['gender'],
            role=user_data['role']
        )
        
        print(f"✅ Usuario empresa creado - ID: {user.id}")
        print(f"   - Email: {user.email}")
        print(f"   - Nombre: {user.full_name}")
        print(f"   - Birthdate: {user.birthdate}")
        print(f"   - Gender: {user.gender}")
        
        # Verificar que se creó el perfil de empresa automáticamente
        try:
            empresa = Empresa.objects.get(user=user)
            print(f"✅ Perfil de empresa creado automáticamente - ID: {empresa.id}")
            print(f"   - Company Name: {empresa.company_name}")
            print(f"   - Industry: {empresa.industry}")
            print(f"   - Status: {empresa.status}")
            print(f"   - Verified: {empresa.verified}")
            print(f"   - Rating: {empresa.rating}")
            
        except Empresa.DoesNotExist:
            print("❌ Perfil de empresa NO se creó automáticamente")
            
        return user, empresa if 'empresa' in locals() else None
        
    except Exception as e:
        print(f"❌ Error creando empresa: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def test_data_validation():
    """Prueba la validación de datos."""
    print("\n=== PRUEBA DE VALIDACIÓN DE DATOS ===")
    
    # Verificar que los campos JSON se manejen correctamente
    try:
        # Crear estudiante con datos JSON
        user = User.objects.create_user(
            username='test.json',
            email='test.json@inacapmail.cl',
            password='testpass123',
            first_name='Test',
            last_name='JSON',
            role='student'
        )
        
        estudiante = Estudiante.objects.create(
            user=user,
            career='Ingeniería Informática',
            university='INACAP',
            education_level='Pregrado',
            skills=json.dumps(['Python', 'JavaScript', 'React']),
            languages=json.dumps(['Español', 'Inglés'])
        )
        
        print(f"✅ Estudiante con datos JSON creado - ID: {estudiante.id}")
        print(f"   - Skills: {estudiante.get_skills_list()}")
        print(f"   - Languages: {estudiante.get_languages_list()}")
        
        # Verificar que los datos JSON se recuperen correctamente
        skills_list = estudiante.get_skills_list()
        languages_list = estudiante.get_languages_list()
        
        if isinstance(skills_list, list) and len(skills_list) == 3:
            print("✅ Skills se recuperan correctamente como lista")
        else:
            print("❌ Error recuperando skills")
            
        if isinstance(languages_list, list) and len(languages_list) == 2:
            print("✅ Languages se recuperan correctamente como lista")
        else:
            print("❌ Error recuperando languages")
            
        return user, estudiante
        
    except Exception as e:
        print(f"❌ Error en validación de datos: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def cleanup_test_data():
    """Limpia los datos de prueba."""
    print("\n=== LIMPIANDO DATOS DE PRUEBA ===")
    
    try:
        # Eliminar usuarios de prueba
        test_emails = [
            'test.student@inacapmail.cl',
            'test.company@empresa.cl',
            'test.json@inacapmail.cl'
        ]
        
        for email in test_emails:
            try:
                user = User.objects.get(email=email)
                user.delete()
                print(f"✅ Usuario {email} eliminado")
            except User.DoesNotExist:
                print(f"⚠️ Usuario {email} no existe")
                
    except Exception as e:
        print(f"❌ Error limpiando datos: {str(e)}")

def main():
    """Función principal del script."""
    print("🚀 INICIANDO PRUEBAS DE CONSISTENCIA DE DATOS")
    print("=" * 50)
    
    # Ejecutar pruebas
    student_user, student_profile = test_student_creation()
    company_user, company_profile = test_company_creation()
    json_user, json_profile = test_data_validation()
    
    # Resumen
    print("\n=== RESUMEN DE PRUEBAS ===")
    print(f"✅ Estudiante creado: {'Sí' if student_user else 'No'}")
    print(f"✅ Perfil estudiante: {'Sí' if student_profile else 'No'}")
    print(f"✅ Empresa creada: {'Sí' if company_user else 'No'}")
    print(f"✅ Perfil empresa: {'Sí' if company_profile else 'No'}")
    print(f"✅ Datos JSON: {'Sí' if json_user else 'No'}")
    
    # Limpiar datos de prueba
    cleanup_test_data()
    
    print("\n🎉 PRUEBAS COMPLETADAS")

if __name__ == '__main__':
    main()
