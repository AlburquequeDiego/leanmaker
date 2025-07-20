import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto, MiembroProyecto
from evaluations.models import Evaluation
from strikes.models import Strike
from applications.models import Aplicacion
from project_status.models import ProjectStatus
from evaluation_categories.models import EvaluationCategory
from calendar_events.models import CalendarEvent
from areas.models import Area
from users.models import User
from django.contrib.auth.hashers import make_password

print('=== SCRIPT SIMPLE: 3 USUARIOS BÁSICOS ===')

# 0. Limpiar datos existentes (opcional)
print('--- Limpiando datos existentes ---')
Estudiante.objects.all().delete()
Empresa.objects.all().delete()
Proyecto.objects.all().delete()
User.objects.filter(role__in=['student', 'company', 'admin']).delete()
Area.objects.all().delete()
print('Datos limpiados.')

# 1. Crear áreas generales
print('--- BLOQUE 1: Áreas Generales ---')
AREAS_GENERALES = [
    {"name": "Tecnología y Sistemas", "description": "Área de tecnología, informática y sistemas"},
    {"name": "Administración y Gestión", "description": "Área de administración, gestión empresarial y finanzas"},
    {"name": "Comunicación y Marketing", "description": "Área de comunicación, marketing y publicidad"},
    {"name": "Salud y Ciencias", "description": "Área de salud, medicina, biología y ciencias"},
    {"name": "Ingeniería y Construcción", "description": "Área de ingeniería, construcción y arquitectura"},
    {"name": "Educación y Formación", "description": "Área de educación, pedagogía y formación"},
    {"name": "Arte y Diseño", "description": "Área de arte, diseño gráfico y creatividad"},
    {"name": "Investigación y Desarrollo", "description": "Área de investigación, desarrollo e innovación"},
    {"name": "Servicios y Atención al Cliente", "description": "Área de servicios, atención al cliente y ventas"},
    {"name": "Sostenibilidad y Medio Ambiente", "description": "Área de sostenibilidad, medio ambiente y responsabilidad social"},
]

for area_data in AREAS_GENERALES:
    Area.objects.get_or_create(name=area_data["name"], defaults={"description": area_data["description"]})
print('✅ 10 áreas generales creadas.')

# 2. Crear estados de proyecto
print('--- BLOQUE 2: Estados de Proyecto ---')
estados = ['Publicado', 'Activo', 'Completado', 'Cancelado']
for estado in estados:
    ProjectStatus.objects.get_or_create(name=estado)
print('✅ Estados de proyecto creados.')

# 3. Crear 3 usuarios básicos
print('--- BLOQUE 3: Usuarios Básicos ---')

# Usuario Administrador
admin_user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'password': make_password('admin123'),
        'first_name': 'Admin',
        'last_name': 'Sistema',
        'username': 'admin',
        'role': 'admin',
        'is_active': True,
        'is_verified': True,
        'is_staff': True,
        'is_superuser': True
    }
)
print('✅ Administrador creado: admin@test.com / admin123')

# Usuario Estudiante
student_user, created = User.objects.get_or_create(
    email='estudiante@test.com',
    defaults={
        'password': make_password('estudiante123'),
        'first_name': 'Juan',
        'last_name': 'Pérez',
        'username': 'estudiante',
        'role': 'student',
        'is_active': True,
        'is_verified': True
    }
)
print('✅ Estudiante creado: estudiante@test.com / estudiante123')

# Usuario Empresa
company_user, created = User.objects.get_or_create(
    email='empresa@test.com',
    defaults={
        'password': make_password('empresa123'),
        'first_name': 'María',
        'last_name': 'González',
        'username': 'empresa',
        'role': 'company',
        'is_active': True,
        'is_verified': True
    }
)
print('✅ Empresa creada: empresa@test.com / empresa123')

# 4. Crear perfil de estudiante
print('--- BLOQUE 4: Perfil de Estudiante ---')
estudiante = Estudiante.objects.create(
    user=student_user,
    career='Ingeniería en Sistemas',
    semester=6,
    graduation_year=2025,
    status='approved',
    api_level=2,
    strikes=0,
    gpa=4.2,
    completed_projects=3,
    total_hours=120,
    experience_years=1,
    portfolio_url='https://github.com/juanperez',
    github_url='https://github.com/juanperez',
    linkedin_url='https://linkedin.com/in/juanperez',
    availability='full-time',
    location='Santiago',
    rating=4.5,
    skills='["React", "Node.js", "Python", "SQL"]',
    languages='["Español", "Inglés"]'
)
print('✅ Perfil de estudiante creado.')

# 5. Crear perfil de empresa
print('--- BLOQUE 5: Perfil de Empresa ---')
empresa = Empresa.objects.create(
    user=company_user,
    company_name='TechCorp Solutions',
    description='Empresa líder en desarrollo de software y soluciones tecnológicas',
    industry='Tecnología',
    size='Mediana',
    website='https://techcorp.com',
    address='Av. Providencia 1234',
    city='Santiago',
    country='Chile',
    founded_year=2018,
    verified=True,
    rating=4.8,
    total_projects=15,
    projects_completed=12,
    total_hours_offered=2000,
    technologies_used='["React", "Node.js", "Python", "AWS"]',
    benefits_offered='["Horario flexible", "Trabajo remoto", "Capacitación"]',
    remote_work_policy='hybrid',
    contact_email='contacto@techcorp.com',
    contact_phone='+56 2 2345 6789',
    status='active'
)
print('✅ Perfil de empresa creado.')

# 6. Crear 2 proyectos de ejemplo
print('--- BLOQUE 6: Proyectos de Ejemplo ---')

# Obtener área y estado
area_tech = Area.objects.get(name='Tecnología y Sistemas')
area_admin = Area.objects.get(name='Administración y Gestión')
estado_publicado = ProjectStatus.objects.get(name='Publicado')

# Proyecto 1: Desarrollo Web
proyecto1 = Proyecto.objects.create(
    title='Desarrollo de Aplicación Web React',
    description='Desarrollo de una aplicación web moderna usando React y Node.js para gestión de inventarios',
    company=empresa,
    status=estado_publicado,
    area=area_tech,
    requirements='Conocimientos en React, JavaScript, Node.js. Experiencia en desarrollo web.',
    api_level=2,
    max_students=2,
    current_students=0,
    duration_weeks=12,
    hours_per_week=20,
    required_hours=240,
    modality='hybrid',
    location='Santiago',
    difficulty='intermediate',
    min_api_level=2
)
print('✅ Proyecto 1 creado: Desarrollo de Aplicación Web React')

# Proyecto 2: Análisis de Datos
proyecto2 = Proyecto.objects.create(
    title='Análisis de Datos Empresariales',
    description='Análisis de datos de ventas y creación de dashboards para toma de decisiones',
    company=empresa,
    status=estado_publicado,
    area=area_admin,
    requirements='Conocimientos en Excel, Python, Power BI. Interés en análisis de datos.',
    api_level=1,
    max_students=1,
    current_students=0,
    duration_weeks=8,
    hours_per_week=15,
    required_hours=120,
    modality='remote',
    location='Remoto',
    difficulty='beginner',
    min_api_level=1
)
print('✅ Proyecto 2 creado: Análisis de Datos Empresariales')

print('\n=== RESUMEN ===')
print('✅ 10 áreas generales creadas')
print('✅ 3 usuarios básicos creados:')
print('   - Admin: admin@test.com / admin123')
print('   - Estudiante: estudiante@test.com / estudiante123')
print('   - Empresa: empresa@test.com / empresa123')
print('✅ 2 proyectos de ejemplo creados')
print('\n🎉 Sistema listo para pruebas!') 