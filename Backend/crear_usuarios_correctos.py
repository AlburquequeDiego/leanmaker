import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from django.contrib.auth.hashers import make_password

print('=== CREANDO USUARIOS CORRECTOS ===')

# 1. Eliminar usuarios anteriores y sus perfiles
print('--- Eliminando usuarios anteriores y sus perfiles ---')
Estudiante.objects.all().delete()
Empresa.objects.all().delete()
User.objects.filter(email__in=[
    'admin@test.com',
    'estudiante@test.com', 
    'empresa@test.com'
]).delete()
print('✅ Usuarios anteriores y perfiles eliminados.')

# 2. Crear usuarios correctos según documentación
print('--- Creando usuarios correctos ---')

# Usuario Admin - Laura Martínez
admin_user = User.objects.create(
    email='admin1@leanmaker.com',
    password=make_password('Admin123!'),
    first_name='Laura',
    last_name='Martínez',
    username='laura_admin',
    role='admin',
    is_active=True,
    is_verified=True,
    is_staff=True,
    is_superuser=True
)
print('✅ Admin creado: admin1@leanmaker.com / Admin123!')

# Usuario Empresa - FinanPlus
company_user = User.objects.create(
    email='contacto@finanplus.com',
    password=make_password('Empresa123!'),
    first_name='FinanPlus',
    last_name='',
    username='finanplus',
    role='company',
    is_active=True,
    is_verified=True
)
print('✅ Empresa creada: contacto@finanplus.com / Empresa123!')

# Usuario Estudiante - Juan Pérez
student_user = User.objects.create(
    email='juan.perez@uchile.cl',
    password=make_password('Estudiante123!'),
    first_name='Juan',
    last_name='Pérez',
    username='juan_perez',
    role='student',
    is_active=True,
    is_verified=True
)
print('✅ Estudiante creado: juan.perez@uchile.cl / Estudiante123!')

# 3. Crear perfil de empresa
print('--- Creando perfil de empresa ---')
empresa = Empresa.objects.create(
    user=company_user,
    company_name='FinanPlus',
    description='Empresa líder en servicios financieros y consultoría empresarial',
    industry='Finanzas',
    size='Mediana',
    website='https://finanplus.com',
    address='Av. Apoquindo 1234',
    city='Santiago',
    country='Chile',
    founded_year=2015,
    verified=True,
    rating=4.7,
    total_projects=25,
    projects_completed=20,
    total_hours_offered=3000,
    technologies_used='["Excel", "Power BI", "Python", "SQL"]',
    benefits_offered='["Horario flexible", "Capacitación", "Bonos"]',
    remote_work_policy='hybrid',
    contact_email='contacto@finanplus.com',
    contact_phone='+56 2 2345 6789',
    status='active'
)
print('✅ Perfil de empresa FinanPlus creado.')

# 4. Crear perfil de estudiante
print('--- Creando perfil de estudiante ---')
estudiante = Estudiante.objects.create(
    user=student_user,
    career='Ingeniería Comercial',
    semester=7,
    graduation_year=2025,
    status='approved',
    api_level=2,
    strikes=0,
    gpa=4.3,
    completed_projects=2,
    total_hours=80,
    experience_years=0,
    portfolio_url='https://linkedin.com/in/juanperez',
    github_url='https://github.com/juanperez',
    linkedin_url='https://linkedin.com/in/juanperez',
    availability='full-time',
    location='Santiago',
    rating=4.2,
    skills='["Excel", "Power BI", "Análisis de datos", "Marketing"]',
    languages='["Español", "Inglés"]'
)
print('✅ Perfil de estudiante Juan Pérez creado.')

print('\n=== RESUMEN ===')
print('✅ Usuarios correctos creados:')
print('   - Admin: admin1@leanmaker.com / Admin123!')
print('   - Empresa: contacto@finanplus.com / Empresa123!')
print('   - Estudiante: juan.perez@uchile.cl / Estudiante123!')
print('✅ Perfiles de empresa y estudiante creados')
print('\n🎉 Sistema listo con los usuarios correctos!') 