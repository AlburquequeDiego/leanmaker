import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante
from companies.models import Empresa

print('=== VERIFICANDO PERFILES ===')

# Verificar usuarios existentes
print('--- Usuarios existentes ---')
users = User.objects.all()
for user in users:
    print(f'- {user.email} ({user.role})')

# Verificar perfiles de estudiantes
print('\n--- Perfiles de estudiantes ---')
estudiantes = Estudiante.objects.all()
if estudiantes:
    for e in estudiantes:
        print(f'- {e.user.email}')
else:
    print('❌ No hay perfiles de estudiantes')

# Verificar perfiles de empresas
print('\n--- Perfiles de empresas ---')
empresas = Empresa.objects.all()
if empresas:
    for c in empresas:
        print(f'- {c.user.email}')
else:
    print('❌ No hay perfiles de empresas')

# Crear perfiles faltantes
print('\n--- Creando perfiles faltantes ---')

# Buscar usuario estudiante
student_user = User.objects.filter(email='juan.perez@uchile.cl').first()
if student_user and not Estudiante.objects.filter(user=student_user).exists():
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
else:
    print('✅ Perfil de estudiante ya existe.')

# Buscar usuario empresa
company_user = User.objects.filter(email='contacto@finanplus.com').first()
if company_user and not Empresa.objects.filter(user=company_user).exists():
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
else:
    print('✅ Perfil de empresa ya existe.')

print('\n=== RESUMEN FINAL ===')
print('✅ Usuarios disponibles:')
print('   - Admin: admin1@leanmaker.com / Admin123!')
print('   - Empresa: contacto@finanplus.com / Empresa123!')
print('   - Estudiante: juan.perez@uchile.cl / Estudiante123!')
print('\n🎉 Sistema listo para pruebas!') 