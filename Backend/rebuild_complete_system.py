#!/usr/bin/env python
"""
Script completo para recrear todo el sistema LeanMaker con datos coherentes
"""
import os
import django
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from users.models import Usuario
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto
from areas.models import Area
from trl_levels.models import TRLLevel

def rebuild_complete_system():
    print("🚀 Reconstruyendo sistema LeanMaker completo...")
    
    # 1. Crear áreas de conocimiento
    print("\n1️⃣ Creando áreas de conocimiento...")
    areas_data = [
        {"name": "Inteligencia Artificial", "description": "Machine Learning, Deep Learning, NLP", "color": "#FF6B6B"},
        {"name": "Desarrollo Web", "description": "Frontend, Backend, Full Stack", "color": "#4ECDC4"},
        {"name": "Aplicaciones Móviles", "description": "iOS, Android, React Native", "color": "#45B7D1"},
        {"name": "Ciberseguridad", "description": "Seguridad informática, Ethical Hacking", "color": "#96CEB4"},
        {"name": "Análisis de Datos", "description": "Data Science, Business Intelligence", "color": "#FFEAA7"},
        {"name": "Automatización", "description": "RPA, IoT, Sistemas embebidos", "color": "#DDA0DD"},
        {"name": "Blockchain", "description": "Smart Contracts, DeFi, Web3", "color": "#98D8C8"},
        {"name": "Cloud Computing", "description": "AWS, Azure, Google Cloud", "color": "#F7DC6F"}
    ]
    
    areas = {}
    for area_info in areas_data:
        area, created = Area.objects.get_or_create(
            name=area_info["name"],
            defaults={
                'description': area_info["description"],
                'color': area_info["color"],
                'is_active': True
            }
        )
        areas[area_info["name"]] = area
        if created:
            print(f"   ✅ Área creada: {area_info['name']}")
        else:
            print(f"   ℹ️  Área existente: {area_info['name']}")
    
    # 2. Crear niveles TRL
    print("\n2️⃣ Creando niveles TRL...")
    trl_data = [
        {"level": 1, "name": "Principios básicos observados", "description": "Investigación científica básica", "min_hours": 10},
        {"level": 2, "name": "Concepto tecnológico formulado", "description": "Investigación aplicada", "min_hours": 20},
        {"level": 3, "name": "Prueba de concepto", "description": "Validación analítica y experimental", "min_hours": 30},
        {"level": 4, "name": "Validación en laboratorio", "description": "Validación en entorno de laboratorio", "min_hours": 40},
        {"level": 5, "name": "Validación en entorno relevante", "description": "Validación en entorno relevante", "min_hours": 50},
        {"level": 6, "name": "Demostración en entorno relevante", "description": "Demostración en entorno relevante", "min_hours": 60},
        {"level": 7, "name": "Demostración en entorno operativo", "description": "Demostración en entorno operativo", "min_hours": 70},
        {"level": 8, "name": "Sistema completo y calificado", "description": "Sistema completo y calificado", "min_hours": 80},
        {"level": 9, "name": "Sistema probado en operación", "description": "Sistema probado en operación", "min_hours": 90}
    ]
    
    trl_levels = {}
    for trl_info in trl_data:
        trl, created = TRLLevel.objects.get_or_create(
            level=trl_info["level"],
            defaults={
                'name': trl_info["name"],
                'description': trl_info["description"],
                'min_hours': trl_info["min_hours"]
            }
        )
        trl_levels[trl_info["level"]] = trl
        if created:
            print(f"   ✅ TRL {trl_info['level']} creado: {trl_info['name']}")
        else:
            print(f"   ℹ️  TRL {trl_info['level']} existente: {trl_info['name']}")
    
    # 3. Crear empresas con emails de universidades chilenas
    print("\n3️⃣ Creando empresas (universidades)...")
    empresas_data = [
        {
            "email": "contacto@usach.cl",
            "company_name": "Universidad de Santiago de Chile",
            "description": "Universidad pública de excelencia en investigación e innovación",
            "industry": "Educación Superior",
            "size": "Grande",
            "website": "https://www.usach.cl",
            "phone": "+56 2 2718 0000"
        },
        {
            "email": "info@utalca.cl",
            "company_name": "Universidad de Talca",
            "description": "Universidad pública comprometida con el desarrollo regional",
            "industry": "Educación Superior",
            "size": "Mediana",
            "website": "https://www.utalca.cl",
            "phone": "+56 71 220 0000"
        },
        {
            "email": "contacto@udec.cl",
            "company_name": "Universidad de Concepción",
            "description": "Universidad tradicional con fuerte enfoque en investigación",
            "industry": "Educación Superior",
            "size": "Grande",
            "website": "https://www.udec.cl",
            "phone": "+56 41 220 4000"
        },
        {
            "email": "info@ufro.cl",
            "company_name": "Universidad de La Frontera",
            "description": "Universidad pública líder en innovación tecnológica",
            "industry": "Educación Superior",
            "size": "Mediana",
            "website": "https://www.ufro.cl",
            "phone": "+56 45 232 5000"
        },
        {
            "email": "contacto@pucv.cl",
            "company_name": "Pontificia Universidad Católica de Valparaíso",
            "description": "Universidad católica con tradición en excelencia académica",
            "industry": "Educación Superior",
            "size": "Grande",
            "website": "https://www.pucv.cl",
            "phone": "+56 32 227 4000"
        }
    ]
    
    empresas = {}
    for empresa_info in empresas_data:
        # Crear usuario para la empresa
        user, created = Usuario.objects.get_or_create(
            email=empresa_info["email"],
            defaults={
                'first_name': empresa_info["company_name"].split()[0],
                'last_name': ' '.join(empresa_info["company_name"].split()[1:]),
                'role': 'company',
                'is_active': True,
                'is_verified': True
            }
        )
        
        if created:
            user.set_password('empresa123')
            user.save()
            print(f"   ✅ Usuario empresa creado: {empresa_info['email']}")
        else:
            print(f"   ℹ️  Usuario empresa existente: {empresa_info['email']}")
        
        # Crear perfil de empresa
        empresa, created = Empresa.objects.get_or_create(
            user=user,
            defaults={
                'company_name': empresa_info["company_name"],
                'description': empresa_info["description"],
                'industry': empresa_info["industry"],
                'size': empresa_info["size"],
                'website': empresa_info["website"],
                'contact_phone': empresa_info["phone"],
                'contact_email': empresa_info["email"]
            }
        )
        empresas[empresa_info["company_name"]] = empresa
        
        if created:
            print(f"   ✅ Empresa creada: {empresa_info['company_name']}")
        else:
            print(f"   ℹ️  Empresa existente: {empresa_info['company_name']}")
    
    # 4. Crear estudiantes con emails de universidades
    print("\n4️⃣ Creando estudiantes...")
    estudiantes_data = [
        {
            "email": "maria.gonzalez@usach.cl",
            "first_name": "María",
            "last_name": "González",
            "career": "Ingeniería Informática",
            "semester": 8,
            "gpa": 6.2,
            "university": "Universidad de Santiago de Chile"
        },
        {
            "email": "carlos.rodriguez@utalca.cl",
            "first_name": "Carlos",
            "last_name": "Rodríguez",
            "career": "Ingeniería Civil Informática",
            "semester": 6,
            "gpa": 5.8,
            "university": "Universidad de Talca"
        },
        {
            "email": "ana.martinez@udec.cl",
            "first_name": "Ana",
            "last_name": "Martínez",
            "career": "Ingeniería en Computación",
            "semester": 7,
            "gpa": 6.5,
            "university": "Universidad de Concepción"
        },
        {
            "email": "juan.perez@ufro.cl",
            "first_name": "Juan",
            "last_name": "Pérez",
            "career": "Ingeniería Civil en Informática",
            "semester": 5,
            "gpa": 6.0,
            "university": "Universidad de La Frontera"
        },
        {
            "email": "lucia.silva@pucv.cl",
            "first_name": "Lucía",
            "last_name": "Silva",
            "career": "Ingeniería Informática",
            "semester": 9,
            "gpa": 6.8,
            "university": "Pontificia Universidad Católica de Valparaíso"
        }
    ]
    
    estudiantes = []
    for estudiante_info in estudiantes_data:
        # Crear usuario para el estudiante
        user, created = Usuario.objects.get_or_create(
            email=estudiante_info["email"],
            defaults={
                'first_name': estudiante_info["first_name"],
                'last_name': estudiante_info["last_name"],
                'role': 'student',
                'is_active': True,
                'is_verified': True,
                'bio': f'Estudiante de {estudiante_info["career"]} en {estudiante_info["university"]}'
            }
        )
        
        if created:
            user.set_password('estudiante123')
            user.save()
            print(f"   ✅ Usuario estudiante creado: {estudiante_info['email']}")
        else:
            print(f"   ℹ️  Usuario estudiante existente: {estudiante_info['email']}")
        
        # Crear perfil de estudiante
        estudiante, created = Estudiante.objects.get_or_create(
            user=user,
            defaults={
                'career': estudiante_info["career"],
                'semester': estudiante_info["semester"],
                'gpa': estudiante_info["gpa"],
                'status': 'approved',
                'skills': '["Python", "JavaScript", "React", "Django", "SQL"]',
                'languages': '["Español", "Inglés"]',
                'availability': 'flexible'
            }
        )
        estudiantes.append(estudiante)
        
        if created:
            print(f"   ✅ Estudiante creado: {estudiante_info['first_name']} {estudiante_info['last_name']}")
        else:
            print(f"   ℹ️  Estudiante existente: {estudiante_info['first_name']} {estudiante_info['last_name']}")
    
    # 5. Crear proyectos
    print("\n5️⃣ Creando proyectos...")
    proyectos_data = [
        {
            "title": "Sistema de Gestión de Inventarios Inteligente",
            "description": "Desarrollo de un sistema web para gestión de inventarios con IA para predicción de demanda",
            "company": "Universidad de Santiago de Chile",
            "area": "Desarrollo Web",
            "trl": 5,
            "max_students": 3,
            "duration_weeks": 12
        },
        {
            "title": "Chatbot Inteligente para Atención al Cliente",
            "description": "Implementación de un chatbot con NLP para atención automática de consultas estudiantiles",
            "company": "Universidad de Talca",
            "area": "Inteligencia Artificial",
            "trl": 4,
            "max_students": 2,
            "duration_weeks": 10
        },
        {
            "title": "Dashboard de Analytics para E-commerce",
            "description": "Creación de un dashboard interactivo para análisis de datos de ventas online",
            "company": "Universidad de Concepción",
            "area": "Análisis de Datos",
            "trl": 6,
            "max_students": 2,
            "duration_weeks": 8
        },
        {
            "title": "Aplicación Móvil para Gestión de Eventos",
            "description": "Desarrollo de una app móvil para gestión y registro de eventos universitarios",
            "company": "Universidad de La Frontera",
            "area": "Aplicaciones Móviles",
            "trl": 5,
            "max_students": 3,
            "duration_weeks": 14
        },
        {
            "title": "Sistema de Seguridad IoT para Campus",
            "description": "Implementación de un sistema de seguridad basado en IoT para monitoreo del campus",
            "company": "Pontificia Universidad Católica de Valparaíso",
            "area": "Ciberseguridad",
            "trl": 4,
            "max_students": 2,
            "duration_weeks": 16
        }
    ]
    
    for proyecto_info in proyectos_data:
        proyecto, created = Proyecto.objects.get_or_create(
            title=proyecto_info["title"],
            defaults={
                'description': proyecto_info["description"],
                'company': empresas[proyecto_info["company"]],
                'area': areas[proyecto_info["area"]],
                'trl': trl_levels[proyecto_info["trl"]],
                'max_students': proyecto_info["max_students"],
                'current_students': 0
            }
        )
        
        if created:
            print(f"   ✅ Proyecto creado: {proyecto_info['title']}")
        else:
            print(f"   ℹ️  Proyecto existente: {proyecto_info['title']}")
    
    print("\n🎉 ¡Sistema reconstruido exitosamente!")
    print("\n📊 Resumen:")
    print(f"   • {len(areas)} áreas creadas")
    print(f"   • {len(trl_levels)} niveles TRL creados")
    print(f"   • {len(empresas)} empresas (universidades) creadas")
    print(f"   • {len(estudiantes)} estudiantes creados")
    print(f"   • {len(proyectos_data)} proyectos creados")
    
    print("\n🔑 Credenciales de prueba:")
    print("   • Admin: admin@leanmaker.cl / admin123")
    print("   • Estudiantes:")
    for estudiante_info in estudiantes_data:
        print(f"     - {estudiante_info['email']} / estudiante123")
    print("   • Empresas:")
    for empresa_info in empresas_data:
        print(f"     - {empresa_info['email']} / empresa123")

if __name__ == '__main__':
    rebuild_complete_system() 