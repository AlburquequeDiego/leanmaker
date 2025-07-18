import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto
from evaluations.models import Evaluation
from calendar_events.models import CalendarEvent
from interviews.models import Interview
from strikes.models import Strike
from notifications.models import Notification
from applications.models import Aplicacion
from project_status.models import ProjectStatus  # <--- Importar el modelo correcto
from projects.models import MiembroProyecto  # Importar el modelo correcto
from evaluation_categories.models import EvaluationCategory  # Importar el modelo correcto

# 1. BORRAR SOLO DATOS DE INTERACCIÓN (NO USUARIOS NI PERFILES)
print('Eliminando datos de interacción previos...')
CalendarEvent.objects.all().delete()
Interview.objects.all().delete()
Evaluation.objects.all().delete()
Strike.objects.all().delete()
Notification.objects.all().delete()
Aplicacion.objects.all().delete()
Proyecto.objects.all().delete()

# Utilidades
NOMBRES_PROYECTOS = [
    'Desarrollo Web', 'App Móvil', 'Sistema de Inventario', 'Rediseño UX', 'Plataforma E-learning',
    'Automatización de Procesos', 'Dashboard de Analítica', 'Integración API', 'Soporte Técnico', 'Optimización SEO'
]
DESCRIPCIONES = [
    'Proyecto para mejorar la presencia digital.',
    'Desarrollo de una aplicación móvil para clientes.',
    'Implementación de sistema de inventario en la nube.',
    'Rediseño de la experiencia de usuario.',
    'Creación de plataforma educativa online.',
    'Automatización de tareas administrativas.',
    'Visualización de datos para toma de decisiones.',
    'Integración con servicios externos.',
    'Soporte y mantenimiento de sistemas.',
    'Mejoras en posicionamiento web.'
]
COMENTARIOS_EVAL = [
    'Excelente desempeño y compromiso.',
    'Cumplió con los plazos y aportó ideas.',
    'Buena comunicación y trabajo en equipo.',
    'Debe mejorar la puntualidad.',
    'Gran capacidad de adaptación.',
    'Faltó proactividad en algunas tareas.'
]
NOTIFICACIONES = [
    'Has sido asignado a un nuevo proyecto.',
    'Tienes una entrevista agendada.',
    'Recibiste una nueva evaluación.',
    'Tienes un evento en el calendario.',
    'Has recibido un strike por incumplimiento.'
]
TIPOS_EVENTO = ['Entrevista', 'Reunión', 'Entrega', 'Workshop']

# Poblar empresas y administradores
empresas = list(Empresa.objects.all())
administradores = list(User.objects.filter(role='admin'))
estudiantes = list(Estudiante.objects.all())
usuarios_estudiantes = [e.user for e in estudiantes]

# 2. CREAR PROYECTOS PARA EMPRESAS (máx 3 por empresa)
proyectos_creados = []
for empresa in empresas:
    for i in range(10):  # Solo 10 proyectos por empresa
        nombre = random.choice(NOMBRES_PROYECTOS) + f" {random.randint(2023,2025)}"
        descripcion = random.choice(DESCRIPCIONES)
        status_name = random.choice(['active', 'completed', 'cancelled'])
        status_obj, _ = ProjectStatus.objects.get_or_create(name=status_name)
        proyecto = Proyecto.objects.create(
            company=empresa,
            title=nombre,
            description=descripcion,
            requirements="Requisitos del proyecto.",
            status=status_obj,
            start_date=datetime.now().date() - timedelta(days=random.randint(30, 180)),
            estimated_end_date=datetime.now().date() + timedelta(days=random.randint(10, 90)),
        )
        proyectos_creados.append(proyecto)

# 3. ASIGNAR ESTUDIANTES A PROYECTOS (máx 5 por proyecto)
for proyecto in proyectos_creados:
    if len(usuarios_estudiantes) >= 5:
        asignados = random.sample(usuarios_estudiantes, k=random.randint(3, 5))
    else:
        asignados = usuarios_estudiantes
    for user in asignados:
        MiembroProyecto.objects.create(
            proyecto=proyecto,
            usuario=user,
            rol='estudiante'
        )

# 4. CREAR APLICACIONES (máx 2 por estudiante)
for estudiante in estudiantes:
    proyectos_sample = random.sample(proyectos_creados, k=min(2, len(proyectos_creados)))
    for proyecto in proyectos_sample:
        Aplicacion.objects.create(
            student=estudiante,
            project=proyecto,
            status=random.choice(['pending', 'accepted', 'rejected']),
            applied_at=datetime.now() - timedelta(days=random.randint(1, 60)),
        )

# 5. CREAR EVALUACIONES (máx 2 por estudiante)
category_obj, _ = EvaluationCategory.objects.get_or_create(name="General")
for estudiante in estudiantes:
    proyectos_sample = random.sample(proyectos_creados, k=min(2, len(proyectos_creados)))
    for proyecto in proyectos_sample:
        Evaluation.objects.create(
            project=proyecto,
            student=estudiante.user,
            evaluator=random.choice(empresas).user,
            score=random.randint(3, 5),
            comments=random.choice(COMENTARIOS_EVAL),
            status='completed',
            type='final',
            evaluation_date=datetime.now() - timedelta(days=random.randint(1, 60)),
            category=category_obj,
        )

# 6. CREAR ENTREVISTAS (máx 1 por estudiante)
for estudiante in estudiantes:
    aplicaciones = Aplicacion.objects.filter(student=estudiante)
    if aplicaciones.exists():
        aplicacion = random.choice(list(aplicaciones))
        Interview.objects.create(
            application=aplicacion,
            interviewer=aplicacion.project.company.user,
            interview_date=datetime.now() + timedelta(days=random.randint(1, 30)),
            status=random.choice(['scheduled', 'completed']),
            duration_minutes=60,
            interview_type=random.choice(['technical', 'behavioral', 'video', 'phone', 'onsite']),
        )

# 7. CREAR STRIKES (máx 2 por estudiante)
for estudiante in estudiantes:
    strikes_count = random.choices([0, 1, 2], weights=[70, 20, 10])[0]
    for i in range(strikes_count):
        Strike.objects.create(
            student=estudiante,
            reason='Incumplimiento de horario en el proyecto.',
            date=datetime.now() - timedelta(days=random.randint(1, 90)),
        )

# 8. CREAR NOTIFICACIONES (máx 5 por estudiante)
for user in usuarios_estudiantes:
    for i in range(random.randint(2, 5)):
        Notification.objects.create(
            user=user,
            message=random.choice(NOTIFICACIONES),
            created_at=datetime.now() - timedelta(days=random.randint(1, 60)),
            read=random.choice([True, False]),
        )

# 9. CREAR EVENTOS DE CALENDARIO (máx 3 por estudiante)
for user in usuarios_estudiantes:
    proyectos_sample = random.sample(proyectos_creados, k=min(2, len(proyectos_creados)))
    for proyecto in proyectos_sample:
        for i in range(random.randint(1, 2)):
            CalendarEvent.objects.create(
                project=proyecto,
                user=user,
                company=proyecto.company,
                title=f"{random.choice(TIPOS_EVENTO)} de {proyecto.title}",
                description=random.choice(DESCRIPCIONES),
                date=datetime.now() + timedelta(days=random.randint(1, 60)),
            )

print('¡Base de datos poblada con datos realistas, conectados y SIN borrar usuarios ni perfiles!') 