#!/usr/bin/env python
"""
Script para crear datos de prueba en el sistema LeanMaker
"""
import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import Usuario
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto
from areas.models import Area
from trl_levels.models import TRLLevel

User = get_user_model()

def create_test_data():
    print("🚀 Creando datos de prueba para LeanMaker...")
    
    # Crear áreas
    print("\n1️⃣ Creando áreas...")
    areas = []
    area_names = [
        "Inteligencia Artificial",
        "Desarrollo Web",
        "Aplicaciones Móviles", 
        "Ciberseguridad",
        "Análisis de Datos",
        "Automatización",
        "IoT",
        "Blockchain"
    ]
    
    for name in area_names:
        area, created = Area.objects.get_or_create(
            name=name,
            defaults={
                'description': f'Área de {name}',
                'is_active': True
            }
        )
        areas.append(area)
        if created:
            print(f"   ✅ Área creada: {name}")
        else:
            print(f"   ℹ️  Área existente: {name}")
    
    # Crear niveles TRL
    print("\n2️⃣ Creando niveles TRL...")
    trl_levels = []
    trl_data = [
        {"level": 1, "name": "Principios básicos observados", "description": "Investigación científica básica", "min_hours": 40},
        {"level": 2, "name": "Concepto tecnológico formulado", "description": "Aplicación potencial identificada", "min_hours": 60},
        {"level": 3, "name": "Prueba de concepto", "description": "Validación analítica y experimental", "min_hours": 80},
        {"level": 4, "name": "Validación en laboratorio", "description": "Componente validado en entorno relevante", "min_hours": 100},
        {"level": 5, "name": "Validación en entorno relevante", "description": "Componente validado en entorno real", "min_hours": 120},
        {"level": 6, "name": "Demostración en entorno relevante", "description": "Sistema validado en entorno real", "min_hours": 140},
        {"level": 7, "name": "Demostración en entorno operativo", "description": "Prototipo validado en entorno operativo", "min_hours": 160},
        {"level": 8, "name": "Sistema completo y calificado", "description": "Sistema validado y calificado", "min_hours": 180},
        {"level": 9, "name": "Sistema probado en operación", "description": "Sistema probado exitosamente", "min_hours": 200}
    ]
    
    for trl_info in trl_data:
        trl, created = TRLLevel.objects.get_or_create(
            level=trl_info["level"],
            defaults={
                'name': trl_info["name"],
                'description': trl_info["description"],
                'min_hours': trl_info["min_hours"]
            }
        )
        trl_levels.append(trl)
        if created:
            print(f"   ✅ TRL {trl_info['level']} creado: {trl_info['name']}")
        else:
            print(f"   ℹ️  TRL {trl_info['level']} existente: {trl_info['name']}")
    
    # Crear empresas de prueba
    print("\n3️⃣ Creando empresas de prueba...")
    empresas = []
    empresas_data = [
        {
            "company_name": "TechCorp Solutions",
            "description": "Empresa líder en desarrollo de software empresarial",
            "industry": "Tecnología",
            "size": "Mediana",
            "city": "Santiago",
            "country": "Chile"
        },
        {
            "company_name": "InnovateLab",
            "description": "Startup especializada en inteligencia artificial",
            "industry": "Tecnología",
            "size": "Startup",
            "city": "Valparaíso",
            "country": "Chile"
        },
        {
            "company_name": "DataFlow Analytics",
            "description": "Empresa de análisis de datos y business intelligence",
            "industry": "Consultoría",
            "size": "Mediana",
            "city": "Concepción",
            "country": "Chile"
        }
    ]
    
    for empresa_info in empresas_data:
        empresa, created = Empresa.objects.get_or_create(
            company_name=empresa_info["company_name"],
            defaults={
                'description': empresa_info["description"],
                'industry': empresa_info["industry"],
                'size': empresa_info["size"],
                'city': empresa_info["city"],
                'country': empresa_info["country"],
                'status': 'active'
            }
        )
        empresas.append(empresa)
        if created:
            print(f"   ✅ Empresa creada: {empresa_info['company_name']}")
        else:
            print(f"   ℹ️  Empresa existente: {empresa_info['company_name']}")
    
    # Crear estudiantes de prueba
    print("\n4️⃣ Creando estudiantes de prueba...")
    estudiantes = []
    estudiantes_data = [
        {
            "email": "maria.gonzalez@estudiante.cl",
            "first_name": "María",
            "last_name": "González",
            "career": "Ingeniería Informática",
            "semester": 8,
            "gpa": 6.2
        },
        {
            "email": "carlos.rodriguez@estudiante.cl",
            "first_name": "Carlos",
            "last_name": "Rodríguez",
            "career": "Ingeniería Civil Informática",
            "semester": 6,
            "gpa": 5.8
        },
        {
            "email": "ana.martinez@estudiante.cl",
            "first_name": "Ana",
            "last_name": "Martínez",
            "career": "Ingeniería en Computación",
            "semester": 7,
            "gpa": 6.5
        }
    ]
    
    for estudiante_info in estudiantes_data:
        # Crear usuario
        user, created = User.objects.get_or_create(
            email=estudiante_info["email"],
            defaults={
                'first_name': estudiante_info["first_name"],
                'last_name': estudiante_info["last_name"],
                'role': 'student',
                'is_active': True,
                'is_verified': True,
                'bio': f'Estudiante de {estudiante_info["career"]} en semestre {estudiante_info["semester"]}'
            }
        )
        
        if created:
            user.set_password('estudiante123')
            user.save()
            print(f"   ✅ Usuario creado: {estudiante_info['email']}")
        else:
            print(f"   ℹ️  Usuario existente: {estudiante_info['email']}")
        
        # Crear perfil de estudiante
        estudiante, created = Estudiante.objects.get_or_create(
            user=user,
            defaults={
                'career': estudiante_info["career"],
                'semester': estudiante_info["semester"],
                'gpa': estudiante_info["gpa"],
                'status': 'approved',
                'skills': '["Python", "JavaScript", "React", "Django"]',
                'languages': '["Español", "Inglés"]'
            }
        )
        estudiantes.append(estudiante)
        
        if created:
            print(f"   ✅ Estudiante creado: {estudiante_info['first_name']} {estudiante_info['last_name']}")
        else:
            print(f"   ℹ️  Estudiante existente: {estudiante_info['first_name']} {estudiante_info['last_name']}")
    
    # Crear proyectos de prueba
    print("\n5️⃣ Creando proyectos de prueba...")
    proyectos_data = [
        {
            "title": "Sistema de Gestión de Inventarios",
            "description": "Desarrollo de una aplicación web para gestión de inventarios en tiempo real",
            "company": empresas[0],
            "area": areas[1],
            "trl": trl_levels[4],
            "max_students": 3,
            "required_skills": '["Django", "React", "PostgreSQL"]',
            "duration_months": 6
        },
        {
            "title": "Chatbot Inteligente para Atención al Cliente",
            "description": "Implementación de un chatbot usando IA para mejorar la atención al cliente",
            "company": empresas[1],
            "area": areas[0],
            "trl": trl_levels[3],
            "max_students": 2,
            "required_skills": '["Python", "Machine Learning", "APIs"]',
            "duration_months": 4
        },
        {
            "title": "Dashboard de Analytics para E-commerce",
            "description": "Creación de un dashboard interactivo para análisis de ventas y comportamiento de usuarios",
            "company": empresas[2],
            "area": areas[4],
            "trl": trl_levels[5],
            "max_students": 2,
            "required_skills": '["JavaScript", "D3.js", "APIs REST"]',
            "duration_months": 5
        }
    ]
    
    for proyecto_info in proyectos_data:
        proyecto, created = Proyecto.objects.get_or_create(
            title=proyecto_info["title"],
            defaults={
                'description': proyecto_info["description"],
                'company': proyecto_info["company"],
                'area': proyecto_info["area"],
                'trl': proyecto_info["trl"],
                'max_students': proyecto_info["max_students"],
                'required_skills': proyecto_info["required_skills"],
                'duration_months': proyecto_info["duration_months"]
            }
        )
        
        if created:
            print(f"   ✅ Proyecto creado: {proyecto_info['title']}")
        else:
            print(f"   ℹ️  Proyecto existente: {proyecto_info['title']}")
    
    print("\n🎉 ¡Datos de prueba creados exitosamente!")
    print("\n📊 Resumen:")
    print(f"   • {len(areas)} áreas creadas")
    print(f"   • {len(trl_levels)} niveles TRL creados")
    print(f"   • {len(empresas)} empresas creadas")
    print(f"   • {len(estudiantes)} estudiantes creados")
    print(f"   • {len(proyectos_data)} proyectos creados")
    
    print("\n🔑 Credenciales de prueba:")
    print("   • Admin: alburqueque511gmail.com / admin")
    for estudiante_info in estudiantes_data:
        print(f"   • Estudiante: {estudiante_info['email']} / estudiante123")

if __name__ == '__main__':
    create_test_data() 