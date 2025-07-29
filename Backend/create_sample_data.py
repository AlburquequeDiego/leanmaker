#!/usr/bin/env python3
"""
Script para crear datos de prueba para LeanMaker
Basado en los datos del archivo de conexiones
"""

import os
import sys
import django
from pathlib import Path
from django.contrib.auth import get_user_model
from django.core.management import call_command

# Configurar Django con configuración local
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings_local')
django.setup()

User = get_user_model()

def create_admin_user():
    """Crear usuario administrador"""
    try:
        admin_user = User.objects.create_user(
            username='admin@leanmaker.com',
            email='admin@leanmaker.com',
            password='Admin123!',
            first_name='Laura',
            last_name='Martínez',
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Admin creado: {admin_user.email}")
        return admin_user
    except Exception as e:
        print(f"⚠️ Admin ya existe o error: {e}")
        return User.objects.get(email='admin@leanmaker.com')

def create_student_users():
    """Crear usuarios estudiantes"""
    students_data = [
        ('diego.alburqueque@inacapmail.cl', 'Diego', 'Alburqueque'),
        ('joaquin@inacapmail.cl', 'Joaquín', 'Estudiante'),
        ('juan.perez@uchile.cl', 'Juan', 'Pérez'),
        ('camila.rojas@inacapmail.cl', 'Camila', 'Rojas'),
        ('matias.contreras@inacapmail.cl', 'Matías', 'Contreras'),
        ('fernanda.torres@inacapmail.cl', 'Fernanda', 'Torres'),
        ('melisa.colana@uchile.cl', 'Melisa', 'Colana'),
        ('diego.fariaz@uchile.cl', 'Diego', 'Fariaz'),
        ('loreto.alburqueque@uchile.cl', 'Loreto', 'Alburqueque'),
        ('soledad.garay@inacapmail.cl', 'Soledad', 'Garay'),
    ]
    
    created_students = []
    for email, first_name, last_name in students_data:
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password='Estudiante123!',
                first_name=first_name,
                last_name=last_name,
                user_type='student'
            )
            created_students.append(user)
            print(f"✅ Estudiante creado: {user.email}")
        except Exception as e:
            print(f"⚠️ Estudiante ya existe: {email}")
    
    return created_students

def create_company_users():
    """Crear usuarios de empresa"""
    companies_data = [
        ('informatica@contrucciones.cL', 'Informática', 'Construcciones'),
        ('camila.rios@empresa.cl', 'Camila', 'Ríos'),
        ('martin.herrera@correo.cl', 'Martín', 'Herrera'),
        ('fernandasoto@empresa.com', 'Fernanda', 'Soto'),
        ('jorge.alarcon@correo.cl', 'Jorge', 'Alarcón'),
        ('valespinoza@empresa.cl', 'Valentina', 'Espinoza'),
        ('nico.mendez@correo.cl', 'Nicolás', 'Méndez'),
        ('avargas@empresa.com', 'Ana', 'Vargas'),
        ('diego.morales@correo.cl', 'Diego', 'Morales'),
        ('isileon@empresa.cl', 'Isabella', 'León'),
    ]
    
    created_companies = []
    for email, first_name, last_name in companies_data:
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password='Empresa123!',
                first_name=first_name,
                last_name=last_name,
                user_type='company'
            )
            created_companies.append(user)
            print(f"✅ Empresa creada: {user.email}")
        except Exception as e:
            print(f"⚠️ Empresa ya existe: {email}")
    
    return created_companies

def create_sample_companies():
    """Crear empresas de ejemplo"""
    try:
        from companies.models import Company
        
        companies = [
            {
                'name': 'Construcciones Informáticas S.A.',
                'description': 'Empresa líder en construcción y tecnología',
                'industry': 'Construcción',
                'size': 'medium',
                'website': 'https://construcciones.cl',
                'phone': '+56 2 2345 6789',
                'address': 'Av. Providencia 1234, Santiago'
            },
            {
                'name': 'Tech Solutions Ltda.',
                'description': 'Soluciones tecnológicas innovadoras',
                'industry': 'Tecnología',
                'size': 'small',
                'website': 'https://techsolutions.cl',
                'phone': '+56 2 3456 7890',
                'address': 'Av. Las Condes 567, Santiago'
            },
            {
                'name': 'Innovación Digital SPA',
                'description': 'Transformación digital para empresas',
                'industry': 'Consultoría',
                'size': 'large',
                'website': 'https://innovaciondigital.cl',
                'phone': '+56 2 4567 8901',
                'address': 'Av. Apoquindo 890, Santiago'
            }
        ]
        
        created_companies = []
        for company_data in companies:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            if created:
                print(f"✅ Empresa creada: {company.name}")
            else:
                print(f"⚠️ Empresa ya existe: {company.name}")
            created_companies.append(company)
        
        return created_companies
    except Exception as e:
        print(f"⚠️ Error creando empresas: {e}")
        return []

def create_sample_projects():
    """Crear proyectos de ejemplo"""
    try:
        from projects.models import Project
        from companies.models import Company
        
        companies = Company.objects.all()
        if not companies.exists():
            print("⚠️ No hay empresas disponibles para crear proyectos")
            return []
        
        projects_data = [
            {
                'title': 'Sistema de Gestión de Construcción',
                'description': 'Desarrollo de software para gestión de proyectos de construcción',
                'required_api_level': 3,
                'required_trl_level': 6,
                'students_needed': 3,
                'hours_offered': 240,
                'location': 'Santiago, Chile',
                'status': 'active'
            },
            {
                'title': 'Aplicación Móvil para Delivery',
                'description': 'Creación de app móvil para servicio de delivery',
                'required_api_level': 2,
                'required_trl_level': 5,
                'students_needed': 2,
                'hours_offered': 180,
                'location': 'Valparaíso, Chile',
                'status': 'active'
            },
            {
                'title': 'Plataforma de E-learning',
                'description': 'Desarrollo de plataforma educativa online',
                'required_api_level': 4,
                'required_trl_level': 7,
                'students_needed': 4,
                'hours_offered': 320,
                'location': 'Concepción, Chile',
                'status': 'active'
            },
            {
                'title': 'Sistema de Inventario Inteligente',
                'description': 'Sistema de gestión de inventario con IA',
                'required_api_level': 3,
                'required_trl_level': 6,
                'students_needed': 2,
                'hours_offered': 200,
                'location': 'La Serena, Chile',
                'status': 'active'
            }
        ]
        
        created_projects = []
        for i, project_data in enumerate(projects_data):
            company = companies[i % len(companies)]
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults={
                    **project_data,
                    'company': company
                }
            )
            if created:
                print(f"✅ Proyecto creado: {project.title}")
            else:
                print(f"⚠️ Proyecto ya existe: {project.title}")
            created_projects.append(project)
        
        return created_projects
    except Exception as e:
        print(f"⚠️ Error creando proyectos: {e}")
        return []

def main():
    """Función principal"""
    print("=" * 60)
    print("🎯 CREANDO DATOS DE PRUEBA PARA LEANMAKER")
    print("=" * 60)
    
    # Verificar que existe la configuración local
    if not Path('core/settings_local.py').exists():
        print("❌ Error: No se encontró core/settings_local.py")
        print("Ejecuta primero: python setup_local.py")
        return
    
    # Verificar que existe la base de datos local
    if not Path('db.sqlite3').exists():
        print("❌ Error: No se encontró db.sqlite3")
        print("Ejecuta primero: python setup_local.py")
        return
    
    print("\n👤 Creando usuarios...")
    admin = create_admin_user()
    students = create_student_users()
    companies = create_company_users()
    
    print("\n🏢 Creando empresas...")
    sample_companies = create_sample_companies()
    
    print("\n📋 Creando proyectos...")
    projects = create_sample_projects()
    
    print("\n" + "=" * 60)
    print("🎉 ¡DATOS DE PRUEBA CREADOS EXITOSAMENTE!")
    print("=" * 60)
    print(f"\n📊 Resumen:")
    print(f"   - Admin: 1 usuario")
    print(f"   - Estudiantes: {len(students)} usuarios")
    print(f"   - Empresas: {len(companies)} usuarios")
    print(f"   - Empresas de muestra: {len(sample_companies)}")
    print(f"   - Proyectos: {len(projects)}")
    
    print(f"\n🔑 Credenciales de acceso:")
    print(f"   - Admin: admin@leanmaker.com / Admin123!")
    print(f"   - Estudiante: diego.alburqueque@inacapmail.cl / Estudiante123!")
    print(f"   - Empresa: informatica@contrucciones.cL / Empresa123!")
    
    print(f"\n🌐 URLs:")
    print(f"   - Admin: http://localhost:8000/admin")
    print(f"   - Frontend: http://localhost:5173")
    
    print(f"\n💡 Ahora puedes:")
    print(f"   1. Iniciar el servidor: python manage.py runserver --settings=core.settings_local")
    print(f"   2. Acceder al admin con las credenciales")
    print(f"   3. Probar la funcionalidad completa del sistema")

if __name__ == "__main__":
    main() 