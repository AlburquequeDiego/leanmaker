#!/usr/bin/env python
"""
Script para rellenar perfiles de estudiantes con datos de ejemplo
basados en sus correos electrónicos para pruebas visuales.
"""

import os
import sys
import django
from django.contrib.auth import get_user_model
from django.db import transaction
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante
from users.models import User

User = get_user_model()

# Datos de ejemplo para diferentes tipos de estudiantes
STUDENT_DATA = {
    'estudiante': {
        'biografia': 'Estudiante apasionado por la tecnología y la innovación. Me encanta aprender nuevas tecnologías y trabajar en proyectos que tengan un impacto real en la sociedad.',
        'habilidades': ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'Git'],
        'intereses': ['Desarrollo Web', 'Inteligencia Artificial', 'Emprendimiento'],
        'proyectos_destacados': ['E-commerce Platform', 'Task Management App', 'Weather Dashboard'],
        'experiencia_laboral': 'Desarrollador Frontend Junior en StartupTech (6 meses)',
        'educacion': 'Ingeniería en Sistemas Computacionales - Universidad Tecnológica',
        'certificaciones': ['AWS Cloud Practitioner', 'React Developer Certificate'],
        'idiomas': ['Español (Nativo)', 'Inglés (Intermedio)'],
        'redes_sociales': {
            'linkedin': 'linkedin.com/in/estudiante-dev',
            'github': 'github.com/estudiante-dev',
            'portfolio': 'estudiante-portfolio.com'
        }
    },
    'alumno': {
        'biografia': 'Alumno dedicado al estudio de las ciencias de la computación. Busco oportunidades para aplicar mis conocimientos en proyectos reales y crecer profesionalmente.',
        'habilidades': ['Java', 'Spring Boot', 'MySQL', 'HTML/CSS', 'Bootstrap', 'Maven'],
        'intereses': ['Desarrollo Backend', 'Bases de Datos', 'Arquitectura de Software'],
        'proyectos_destacados': ['REST API for Library System', 'Inventory Management System', 'Student Portal'],
        'experiencia_laboral': 'Practicante en Desarrollo de Software en TechCorp (3 meses)',
        'educacion': 'Licenciatura en Informática - Instituto Tecnológico',
        'certificaciones': ['Oracle Java Certified', 'MySQL Database Administrator'],
        'idiomas': ['Español (Nativo)', 'Inglés (Básico)'],
        'redes_sociales': {
            'linkedin': 'linkedin.com/in/alumno-dev',
            'github': 'github.com/alumno-dev',
            'portfolio': 'alumno-portfolio.com'
        }
    },
    'student': {
        'biografia': 'Student passionate about software engineering and problem solving. I enjoy working on challenging projects and collaborating with teams to create innovative solutions.',
        'habilidades': ['TypeScript', 'Angular', 'C#', '.NET Core', 'SQL Server', 'Azure'],
        'intereses': ['Full Stack Development', 'Cloud Computing', 'DevOps'],
        'proyectos_destacados': ['Real-time Chat Application', 'E-learning Platform', 'Inventory Tracker'],
        'experiencia_laboral': 'Software Developer Intern at TechStart (4 months)',
        'educacion': 'Computer Science Degree - Technical University',
        'certificaciones': ['Microsoft Azure Developer', 'Angular Developer Certificate'],
        'idiomas': ['English (Native)', 'Spanish (Intermediate)'],
        'redes_sociales': {
            'linkedin': 'linkedin.com/in/student-dev',
            'github': 'github.com/student-dev',
            'portfolio': 'student-portfolio.com'
        }
    },
    'admin': {
        'biografia': 'Administrador del sistema con experiencia en gestión de plataformas educativas y desarrollo de software empresarial.',
        'habilidades': ['Python', 'Django', 'PostgreSQL', 'Docker', 'Linux', 'AWS'],
        'intereses': ['Administración de Sistemas', 'Seguridad Informática', 'Gestión de Proyectos'],
        'proyectos_destacados': ['Learning Management System', 'Student Portal', 'Company Dashboard'],
        'experiencia_laboral': 'System Administrator at EduTech (2 years)',
        'educacion': 'Ingeniería en Sistemas - Universidad Nacional',
        'certificaciones': ['AWS Solutions Architect', 'Django Developer Certificate'],
        'idiomas': ['Español (Nativo)', 'Inglés (Avanzado)'],
        'redes_sociales': {
            'linkedin': 'linkedin.com/in/admin-dev',
            'github': 'github.com/admin-dev',
            'portfolio': 'admin-portfolio.com'
        }
    }
}

def get_student_data_by_email(email):
    """Determina qué datos usar basándose en el correo electrónico."""
    email_lower = email.lower()
    
    if 'admin' in email_lower:
        return STUDENT_DATA['admin']
    elif 'student' in email_lower:
        return STUDENT_DATA['student']
    elif 'alumno' in email_lower:
        return STUDENT_DATA['alumno']
    else:
        return STUDENT_DATA['estudiante']

def populate_student_profiles():
    """Rellena los perfiles de estudiantes con datos de ejemplo."""
    print("🚀 Iniciando población de perfiles de estudiantes...")
    
    # Obtener todos los usuarios que son estudiantes
    students = Estudiante.objects.all()
    
    if not students.exists():
        print("❌ No se encontraron estudiantes en la base de datos.")
        return
    
    print(f"📊 Encontrados {students.count()} estudiantes para actualizar.")
    
    updated_count = 0
    skipped_count = 0
    
    with transaction.atomic():
        for student in students:
            try:
                # Obtener el usuario asociado
                user = student.user
                
                # Obtener datos basados en el correo
                profile_data = get_student_data_by_email(user.email)
                
                # Actualizar el perfil con los campos disponibles en el modelo Estudiante
                student.career = profile_data['educacion'].split(' - ')[0] if ' - ' in profile_data['educacion'] else 'Ingeniería en Sistemas'
                student.university = profile_data['educacion'].split(' - ')[1] if ' - ' in profile_data['educacion'] else 'Universidad Tecnológica'
                student.set_skills_list(profile_data['habilidades'])
                student.set_languages_list(profile_data['idiomas'])
                student.portfolio_url = profile_data['redes_sociales']['portfolio']
                student.github_url = profile_data['redes_sociales']['github']
                student.linkedin_url = profile_data['redes_sociales']['linkedin']
                student.location = f"Ciudad de México, México"
                
                # Agregar algunos datos adicionales aleatorios para variedad
                student.semester = random.randint(1, 12)
                student.graduation_year = random.randint(2024, 2028)
                student.gpa = round(random.uniform(7.0, 9.5), 2)
                student.completed_projects = random.randint(0, 5)
                student.total_hours = random.randint(0, 200)
                student.experience_years = random.randint(0, 3)
                student.rating = round(random.uniform(3.5, 5.0), 2)
                
                student.save()
                print(f"✅ Perfil sobreescrito para {user.email}")
                updated_count += 1
                
            except Exception as e:
                print(f"❌ Error actualizando {user.email}: {str(e)}")
                continue
    
    print(f"\n🎉 Proceso completado!")
    print(f"📈 Perfiles actualizados: {updated_count}")
    print(f"⏭️  Perfiles saltados: {skipped_count}")
    print(f"📊 Total de estudiantes procesados: {students.count()}")

if __name__ == '__main__':
    try:
        populate_student_profiles()
    except Exception as e:
        print(f"❌ Error en el script: {str(e)}")
        sys.exit(1) 