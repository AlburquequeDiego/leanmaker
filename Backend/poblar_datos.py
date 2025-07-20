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

# 0. Áreas (crear si no existen)
print('--- BLOQUE 0: Áreas ---')
AREAS_EJEMPLO = [
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
for area_data in AREAS_EJEMPLO:
    Area.objects.get_or_create(name=area_data["name"], defaults={"description": area_data["description"]})
print('Áreas listas.')

# 1. Proyectos (20 por empresa, solo si faltan)
print('--- BLOQUE 1: Proyectos ---')
empresas = list(Empresa.objects.all())
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
status_list = list(ProjectStatus.objects.all())
for empresa in empresas:
    proyectos_empresa = Proyecto.objects.filter(company=empresa)
    faltan = 20 - proyectos_empresa.count()
    for i in range(faltan):
        nombre = random.choice(NOMBRES_PROYECTOS) + f" {random.randint(2023,2025)}"
        descripcion = random.choice(DESCRIPCIONES)
        status = random.choice(status_list) if status_list else None
        Proyecto.objects.get_or_create(
            company=empresa,
            title=nombre,
            defaults={
                'description': descripcion,
                'requirements': 'Trabajo en equipo, responsabilidad, comunicación.',
                'status': status,
                'start_date': datetime.now().date() - timedelta(days=random.randint(30, 180)),
                'estimated_end_date': datetime.now().date() + timedelta(days=random.randint(10, 90)),
                'duration_weeks': random.randint(8, 24),
                'max_students': random.randint(2, 5),
                'current_students': 0
            }
        )
print('Proyectos listos.')

# 2. Asignación de estudiantes a proyectos (respetando TRL)
print('--- BLOQUE 2: Asignación de estudiantes a proyectos ---')
estudiantes = list(Estudiante.objects.all())  # <--- ESTA LÍNEA ES CLAVE
proyectos = list(Proyecto.objects.all())
for idx, proyecto in enumerate(proyectos):
    print(f"Asignando estudiantes al proyecto {idx+1}/{len(proyectos)}: {proyecto.title}")
    estudiantes_a_asignar = random.sample(estudiantes, k=min(3, len(estudiantes)))
    for est in estudiantes_a_asignar:
        MiembroProyecto.objects.get_or_create(
            proyecto=proyecto,
            usuario=est.user,
            defaults={
                'rol': 'estudiante',
                'horas_trabajadas': random.randint(20, 200),
                'tareas_completadas': random.randint(5, 20),
                'evaluacion_promedio': round(random.uniform(3, 5), 2)
            }
        )
print('Asignación de estudiantes lista.')

# 3. Aplicaciones y membresías
print('--- BLOQUE 3: Aplicaciones ---')
for proyecto in proyectos:
    miembros = MiembroProyecto.objects.filter(proyecto=proyecto)
    for miembro in miembros:
        Aplicacion.objects.get_or_create(
            project=proyecto,
            student=Estudiante.objects.get(user=miembro.usuario),
            defaults={
                'status': random.choice(['accepted', 'completed']),
                'cover_letter': 'Estoy interesado en este proyecto por mi experiencia en el área.'
            }
        )
print('Aplicaciones listas.')

# 4. Evaluaciones
print('--- BLOQUE 4: Evaluaciones ---')
cat = EvaluationCategory.objects.first()
for proyecto in proyectos:
    miembros = MiembroProyecto.objects.filter(proyecto=proyecto)
    for miembro in miembros:
        # Empresa evalúa estudiante
        Evaluation.objects.get_or_create(
            project=proyecto,
            student=miembro.usuario,
            evaluator=proyecto.company.user,
            category=cat,
            defaults={
                'score': random.randint(3, 5),
                'comments': 'Buen desempeño y compromiso.',
                'status': 'completed',
                'type': 'final',
                'evaluation_date': datetime.now().date() - timedelta(days=random.randint(1, 60))
            }
        )
print('Evaluaciones listas.')

# 5. Strikes (pocos)
print('--- BLOQUE 5: Strikes ---')
for est in estudiantes:
    if random.random() < 0.3:
        Strike.objects.get_or_create(
            student=est,
            company=random.choice(empresas),
            project=random.choice(proyectos),
            defaults={
                'reason': 'Incumplimiento de horario en el proyecto.',
                'description': 'El estudiante no cumplió con los horarios establecidos.',
                'severity': random.choice(['medium', 'high']),
                'issued_by': random.choice([e.user for e in empresas]),
                'issued_at': datetime.now() - timedelta(days=random.randint(1, 90)),
                'is_active': True
            }
        )
print('Strikes listos.')

print('¡Base de datos poblada de forma modular, segura y sin duplicados!')

TIPOS_EVENTO = ['Reunión', 'Entrega', 'Entrevista', 'Kickoff', 'Demo']
for proyecto in proyectos:
    miembros = MiembroProyecto.objects.filter(proyecto=proyecto)
    for miembro in miembros:
        for i in range(random.randint(2, 4)):
            fecha_evento = datetime.now() + timedelta(days=random.randint(-60, 60))
            CalendarEvent.objects.get_or_create(
                project=proyecto,
                user=miembro.usuario,
                company=proyecto.company,
                defaults={
                    'title': f"{random.choice(TIPOS_EVENTO)} de {proyecto.title}",
                    'description': f"Evento relacionado con el proyecto {proyecto.title}.",
                    'date': fecha_evento,
                }
            ) 