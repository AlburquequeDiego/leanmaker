#!/usr/bin/env python
"""
Script para poblar la base de datos con datos realistas y relaciones básicas.
"""
import os
import django
import random
from datetime import timedelta
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto
from strikes.models import Strike
from calendar_events.models import CalendarEvent
from work_hours.models import WorkHour
from django.utils import timezone
from applications.models import Aplicacion, Asignacion

fake = Faker('es_ES')

INSTITUCIONES = [
    'INACAP', 'Universidad de Chile', 'Pontificia Universidad Católica de Chile', 'Universidad de Concepción',
    'Universidad Técnica Federico Santa María', 'Universidad de Santiago de Chile', 'Universidad Austral de Chile',
    'Universidad de Valparaíso', 'Universidad de La Frontera', 'Universidad de Talca'
]

# 1. Administradores
admins = [
    {'nombre': 'Laura Martínez', 'correo': 'admin1@leanmaker.com', 'password': 'Admin123!'},
    {'nombre': 'Carlos Ramírez', 'correo': 'admin2@leanmaker.com', 'password': 'Admin123!'},
]

# 2. Empresas (50)
empresas = [
    {'nombre': 'InovaTech S.A.', 'correo': 'contacto@inovatech.com'},
    {'nombre': 'AgroSoluciones', 'correo': 'contacto@agrosoluciones.com'},
    {'nombre': 'EcoLogística', 'correo': 'contacto@ecologistica.com'},
    {'nombre': 'SaludVital', 'correo': 'contacto@saludvital.com'},
    {'nombre': 'ConstruRed', 'correo': 'contacto@construred.com'},
    {'nombre': 'FinanPlus', 'correo': 'contacto@finanplus.com'},
    {'nombre': 'EducaFuturo', 'correo': 'contacto@educafuturo.com'},
    {'nombre': 'MoviTrans', 'correo': 'contacto@movitrans.com'},
    {'nombre': 'BioEnergía', 'correo': 'contacto@bioenergia.com'},
    {'nombre': 'SegurMax', 'correo': 'contacto@segurmax.com'},
    {'nombre': 'RedComercial', 'correo': 'contacto@redcomercial.com'},
    {'nombre': 'AgroMarket', 'correo': 'contacto@agromarket.com'},
    {'nombre': 'TecnoVision', 'correo': 'contacto@tecnovision.com'},
    {'nombre': 'Medilab', 'correo': 'contacto@medilab.com'},
    {'nombre': 'Urbaniza', 'correo': 'contacto@urbaniza.com'},
]
# Completa hasta 50 empresas
while len(empresas) < 50:
    nombre = fake.company()
    correo = f"contacto{len(empresas)+1}@empresa.com"
    empresas.append({'nombre': nombre, 'correo': correo})

# 3. Estudiantes (50)
estudiantes = [
    {'nombre': 'Juan Pérez', 'correo': 'juan.perez@uchile.cl'},
    {'nombre': 'Ana Gómez', 'correo': 'ana.gomez@uc.cl'},
    {'nombre': 'Luis Torres', 'correo': 'luis.torres@udec.cl'},
    {'nombre': 'María Rodríguez', 'correo': 'maria.rodriguez@usm.cl'},
    {'nombre': 'Pedro Sánchez', 'correo': 'pedro.sanchez@usach.cl'},
    {'nombre': 'Sofía Ramírez', 'correo': 'sofia.ramirez@uach.cl'},
    {'nombre': 'Diego Fernández', 'correo': 'diego.fernandez@uv.cl'},
    {'nombre': 'Valentina López', 'correo': 'valentina.lopez@ufro.cl'},
    {'nombre': 'Daniel Castro', 'correo': 'daniel.castro@utalca.cl'},
    {'nombre': 'Camila Herrera', 'correo': 'camila.herrera@inacap.cl'},
    {'nombre': 'Mateo Ruiz', 'correo': 'mateo.ruiz@uchile.cl'},
    {'nombre': 'Isabella Morales', 'correo': 'isabella.morales@uc.cl'},
    {'nombre': 'Santiago Vargas', 'correo': 'santiago.vargas@udec.cl'},
    {'nombre': 'Paula Jiménez', 'correo': 'paula.jimenez@usm.cl'},
    {'nombre': 'Alejandro Mendoza', 'correo': 'alejandro.mendoza@usach.cl'},
]
# Completa hasta 50 estudiantes
while len(estudiantes) < 50:
    nombre = fake.name()
    correo = f"estudiante{len(estudiantes)+1}@universidad.cl"
    estudiantes.append({'nombre': nombre, 'correo': correo})

# 4. Crear usuarios y perfiles
print('Creando administradores...')
for admin in admins:
    nombres = admin['nombre'].split()
    first_name = nombres[0]
    last_name = ' '.join(nombres[1:]) if len(nombres) > 1 else ''
    user, created = User.objects.get_or_create(email=admin['correo'], defaults={
        'first_name': first_name, 'last_name': last_name, 'role': 'admin',
    })
    user.set_password(admin['password'])
    user.save()

print('Creando empresas...')
empresa_objs = []
for emp in empresas:
    nombres = emp['nombre'].split()
    first_name = nombres[0]
    last_name = ' '.join(nombres[1:]) if len(nombres) > 1 else ''
    user, created = User.objects.get_or_create(email=emp['correo'], defaults={
        'first_name': first_name, 'last_name': last_name, 'role': 'company',
    })
    user.set_password('Empresa123!')
    user.save()
    if hasattr(user, 'empresa_profile'):
        empresa = user.empresa_profile
    else:
        empresa = Empresa.objects.create(user=user, company_name=emp['nombre'])
    empresa_objs.append(empresa)

print('Creando estudiantes...')
estudiante_objs = []
for idx, est in enumerate(estudiantes):
    institucion = INSTITUCIONES[idx % len(INSTITUCIONES)]
    nombres = est['nombre'].split()
    first_name = nombres[0]
    last_name = ' '.join(nombres[1:]) if len(nombres) > 1 else ''
    user, created = User.objects.get_or_create(email=est['correo'], defaults={
        'first_name': first_name, 'last_name': last_name, 'role': 'student',
    })
    user.set_password('Estudiante123!')
    user.save()
    if hasattr(user, 'estudiante_profile'):
        estudiante = user.estudiante_profile
    else:
        estudiante = Estudiante.objects.create(user=user, university=institucion)
    estudiante_objs.append(estudiante)

# 5. Proyectos (máximo 50)
print('Creando proyectos...')
proyectos = []
for i in range(1, 51):
    empresa = random.choice(empresa_objs)
    titulo = f"Proyecto {i}: {fake.bs().capitalize()}"
    proyecto, _ = Proyecto.objects.get_or_create(
        title=titulo,
        company=empresa,
        description=fake.text(100),
        requirements=fake.text(50),
    )
    proyectos.append(proyecto)

# 6. Strikes (máximo 3 por estudiante)
print('Creando strikes...')
for estudiante in estudiante_objs:
    num_strikes = random.randint(0, 3)
    for _ in range(num_strikes):
        empresa = random.choice(empresa_objs)
        proyecto = random.choice(proyectos)
        Strike.objects.create(student=estudiante, company=empresa, project=proyecto, reason=fake.sentence(), severity=random.choice(['low', 'medium', 'high']))

# 6. Crear aplicaciones y asignaciones (máximo 100)
print('Creando aplicaciones y asignaciones...')
aplicaciones = []
asignaciones = []
for estudiante in estudiante_objs:
    proyectos_sample = random.sample(proyectos, min(3, len(proyectos)))
    for proyecto in proyectos_sample:
        aplicacion, _ = Aplicacion.objects.get_or_create(
            project=proyecto,
            student=estudiante,
            defaults={
                'status': random.choice(['pending', 'accepted', 'completed']),
                'cover_letter': fake.text(100),
            }
        )
        aplicaciones.append(aplicacion)
        asignacion, _ = Asignacion.objects.get_or_create(
            application=aplicacion,
            defaults={
                'fecha_inicio': timezone.now().date() - timedelta(days=random.randint(1, 100)),
            }
        )
        asignaciones.append(asignacion)

# 7. Horas acumuladas (1-5 por estudiante)
print('Creando horas acumuladas...')
for estudiante in estudiante_objs:
    for _ in range(random.randint(1, 5)):
        empresa = random.choice(empresa_objs)
        proyecto = random.choice(proyectos)
        # Buscar una asignación válida para el estudiante y proyecto
        asignaciones_validas = [a for a in asignaciones if a.application.student == estudiante and a.application.project == proyecto]
        if asignaciones_validas:
            asignacion = random.choice(asignaciones_validas)
        else:
            continue  # Si no hay asignación, omitir
        WorkHour.objects.create(
            assignment=asignacion,
            student=estudiante,
            project=proyecto,
            company=empresa,
            date=timezone.now().date(),
            hours_worked=random.randint(1, 8),
            description=fake.sentence()
        )

# 8. Eventos de calendario (máximo 5 por estudiante)
print('Creando eventos de calendario...')
for estudiante in estudiante_objs:
    for _ in range(random.randint(1, 5)):
        CalendarEvent.objects.create(
            title=fake.sentence(nb_words=4),
            description=fake.text(50),
            event_type=random.choice(['meeting', 'deadline', 'interview', 'presentation', 'review', 'other']),
            start_date=timezone.now() + timedelta(days=random.randint(1, 60)),
            end_date=timezone.now() + timedelta(days=random.randint(1, 60), hours=2),
            location=fake.address(),
            priority=random.choice(['low', 'medium', 'high', 'urgent']),
            status=random.choice(['scheduled', 'in_progress', 'completed', 'cancelled']),
            is_public=random.choice([True, False]),
            created_by=estudiante.user,
            user=estudiante.user,
        )

print('¡Población de la base de datos completada!') 