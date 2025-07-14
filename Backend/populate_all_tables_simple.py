#!/usr/bin/env python
"""
Script simplificado para poblar la base de datos con datos razonables.
Usa los usuarios existentes (2 admins + 50 empresas + 50 estudiantes) y crea perfiles acordes a su rol.
"""
import os
import django
import random
import json
from datetime import timedelta
from faker import Faker
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from users.models import User
from companies.models import Empresa
from students.models import Estudiante, PerfilEstudiante
from projects.models import Proyecto
from applications.models import Aplicacion, Asignacion
from work_hours.models import WorkHour
from calendar_events.models import CalendarEvent
from notifications.models import Notification
from evaluations.models import EvaluationCategory, Evaluation
from ratings.models import Rating
from documents.models import Document
from reports.models import Report
from activity_logs.models import ActivityLog
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus

fake = Faker('es_ES')

# Datos de referencia
INSTITUCIONES = [
    'Universidad de Chile', 'Pontificia Universidad Católica de Chile', 'Universidad de Concepción',
    'Universidad Técnica Federico Santa María', 'Universidad de Santiago de Chile', 'Universidad Austral de Chile',
    'Universidad de Valparaíso', 'Universidad de La Frontera', 'Universidad de Talca', 'INACAP'
]

CARRERAS = [
    'Ingeniería Civil', 'Ingeniería Informática', 'Ingeniería Industrial', 'Ingeniería Comercial',
    'Medicina', 'Derecho', 'Psicología', 'Arquitectura', 'Periodismo', 'Administración de Empresas'
]

TECNOLOGIAS = [
    'Python', 'JavaScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask',
    'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science'
]

def create_basic_data():
    """Crear datos básicos de referencia"""
    print('🌍 Creando datos básicos...')
    
    # Áreas
    areas_data = ['Tecnología', 'Ingeniería', 'Salud', 'Educación', 'Negocios']
    areas = []
    for area_name in areas_data:
        area, created = Area.objects.get_or_create(
            name=area_name,
            defaults={'description': fake.text(50), 'is_active': True}
        )
        areas.append(area)
    
    # Niveles TRL
    trl_data = [
        {'level': 1, 'name': 'TRL 1', 'description': 'Principios básicos', 'min_hours': 20},
        {'level': 2, 'name': 'TRL 2', 'description': 'Concepto formulado', 'min_hours': 40},
        {'level': 3, 'name': 'TRL 3', 'description': 'Prueba de concepto', 'min_hours': 60},
        {'level': 4, 'name': 'TRL 4', 'description': 'Validación en laboratorio', 'min_hours': 80},
        {'level': 5, 'name': 'TRL 5', 'description': 'Validación en entorno', 'min_hours': 100},
    ]
    trl_levels = []
    for trl in trl_data:
        level, created = TRLLevel.objects.get_or_create(
            level=trl['level'],
            defaults={
                'name': trl['name'],
                'description': trl['description'],
                'min_hours': trl['min_hours']
            }
        )
        trl_levels.append(level)
    
    # Estados de proyecto
    status_data = [
        {'name': 'Abierto', 'description': 'Disponible para aplicaciones'},
        {'name': 'En Progreso', 'description': 'Proyecto en ejecución'},
        {'name': 'Completado', 'description': 'Proyecto finalizado'},
    ]
    statuses = []
    for status in status_data:
        project_status, created = ProjectStatus.objects.get_or_create(
            name=status['name'],
            defaults={'description': status['description'], 'is_active': True}
        )
        statuses.append(project_status)
    
    return areas, trl_levels, statuses

def populate_student_profiles():
    """Poblar perfiles de estudiantes con datos acordes a su rol"""
    print('👨‍🎓 Poblando perfiles de estudiantes...')
    estudiantes = Estudiante.objects.all()
    
    for estudiante in estudiantes:
        # Datos básicos del estudiante
        estudiante.career = random.choice(CARRERAS)
        estudiante.semester = random.randint(1, 12)
        estudiante.graduation_year = random.randint(2024, 2028)
        estudiante.gpa = Decimal(str(random.uniform(4.0, 7.0)).format('0.2'))
        estudiante.api_level = random.randint(1, 4)
        estudiante.status = random.choice(['pending', 'approved', 'rejected'])
        estudiante.save()
        
        # Perfil extendido
        perfil, created = PerfilEstudiante.objects.get_or_create(
            estudiante=estudiante,
            defaults={
                'fecha_nacimiento': fake.date_of_birth(minimum_age=18, maximum_age=25),
                'genero': random.choice(['Masculino', 'Femenino']),
                'nacionalidad': 'Chilena',
                'universidad': random.choice(INSTITUCIONES),
                'facultad': fake.word().capitalize() + ' y Ciencias',
                'promedio_historico': Decimal(str(random.uniform(4.0, 7.0)).format('0.2')),
                'experiencia_laboral': fake.text(50),
                'certificaciones': json.dumps(random.sample(['AWS', 'Google Cloud', 'Docker'], random.randint(0, 2))),
                'tecnologias_preferidas': json.dumps(random.sample(TECNOLOGIAS, random.randint(2, 4))),
                'industrias_interes': json.dumps(random.sample(['Tecnología', 'Salud', 'Educación'], random.randint(1, 2))),
                'telefono_emergencia': fake.phone_number(),
                'contacto_emergencia': fake.name(),
            }
        )

def populate_company_profiles():
    """Poblar perfiles de empresas con datos acordes a su rol"""
    print('🏢 Poblando perfiles de empresas...')
    empresas = Empresa.objects.all()
    
    for empresa in empresas:
        empresa.description = fake.text(100)
        empresa.industry = random.choice(['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Retail'])
        empresa.size = random.choice(['Pequeña', 'Mediana', 'Grande', 'Startup'])
        empresa.website = f"https://{fake.domain_name()}"
        empresa.address = fake.address()
        empresa.city = fake.city()
        empresa.country = 'Chile'
        empresa.verified = random.choice([True, False])
        empresa.rating = Decimal(str(random.uniform(3.0, 5.0)).format('0.2'))
        empresa.total_projects = random.randint(1, 10)
        empresa.projects_completed = random.randint(0, empresa.total_projects)
        empresa.technologies_used = json.dumps(random.sample(TECNOLOGIAS, random.randint(3, 6)))
        empresa.remote_work_policy = random.choice(['full-remote', 'hybrid', 'onsite'])
        empresa.save()

def create_projects():
    """Crear proyectos usando empresas existentes"""
    print('🚀 Creando proyectos...')
    empresas = Empresa.objects.all()
    areas = Area.objects.all()
    trl_levels = TRLLevel.objects.all()
    statuses = ProjectStatus.objects.all()
    
    proyectos = []
    for i in range(1, 21):  # Solo 20 proyectos
        empresa = random.choice(empresas)
        area = random.choice(areas)
        trl = random.choice(trl_levels)
        status = random.choice(statuses)
        
        proyecto = Proyecto.objects.create(
            company=empresa,
            status=status,
            area=area,
            title=f"Proyecto {i}: {fake.bs().capitalize()}",
            description=fake.text(150),
            requirements=fake.text(100),
            trl=trl,
            modality=random.choice(['remote', 'onsite', 'hybrid']),
            difficulty=random.choice(['beginner', 'intermediate', 'advanced']),
            duration_weeks=random.randint(4, 24),
            hours_per_week=random.randint(10, 30),
            required_skills=json.dumps(random.sample(TECNOLOGIAS, random.randint(2, 4))),
            is_featured=random.choice([True, False]),
            published_at=timezone.now() - timedelta(days=random.randint(1, 30))
        )
        proyectos.append(proyecto)
    
    return proyectos

def create_applications():
    """Crear aplicaciones"""
    print('📝 Creando aplicaciones...')
    estudiantes = Estudiante.objects.all()
    proyectos = Proyecto.objects.all()
    
    aplicaciones = []
    for estudiante in estudiantes:
        # Cada estudiante aplica a 1-3 proyectos
        proyectos_sample = random.sample(list(proyectos), min(3, len(proyectos)))
        
        for proyecto in proyectos_sample:
            aplicacion, created = Aplicacion.objects.get_or_create(
                project=proyecto,
                student=estudiante,
                defaults={
                    'status': random.choice(['pending', 'accepted', 'rejected']),
                    'cover_letter': fake.text(100),
                    'portfolio_url': f"https://portfolio.com/{fake.user_name()}",
                    'applied_at': timezone.now() - timedelta(days=random.randint(1, 15))
                }
            )
            aplicaciones.append(aplicacion)
    
    return aplicaciones

def create_work_hours():
    """Crear horas de trabajo"""
    print('⏰ Creando horas de trabajo...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    asignaciones = Asignacion.objects.filter(estado='en curso')
    
    for estudiante in estudiantes:
        # 1-3 registros de horas por estudiante
        for _ in range(random.randint(1, 3)):
            empresa = random.choice(empresas)
            proyecto = random.choice(proyectos)
            
            # Buscar asignación válida
            asignaciones_validas = asignaciones.filter(application__student=estudiante, application__project=proyecto)
            if asignaciones_validas.exists():
                asignacion = random.choice(asignaciones_validas)
            else:
                continue
            
            WorkHour.objects.create(
                assignment=asignacion,
                student=estudiante,
                project=proyecto,
                company=empresa,
                date=timezone.now().date() - timedelta(days=random.randint(1, 7)),
                hours_worked=random.randint(1, 6),
                description=fake.text(50),
                approved=random.choice([True, False]),
                approved_by=empresa.user if random.choice([True, False]) else None,
                approved_at=timezone.now() if random.choice([True, False]) else None
            )

def create_calendar_events():
    """Crear eventos de calendario"""
    print('📅 Creando eventos de calendario...')
    usuarios = User.objects.all()
    
    for usuario in usuarios:
        # 1-3 eventos por usuario
        for _ in range(random.randint(1, 3)):
            start_date = timezone.now() + timedelta(days=random.randint(1, 30))
            end_date = start_date + timedelta(hours=random.randint(1, 3))
            
            CalendarEvent.objects.create(
                title=fake.sentence(nb_words=3),
                description=fake.text(50),
                event_type=random.choice(['meeting', 'deadline', 'interview']),
                start_date=start_date,
                end_date=end_date,
                location=fake.address(),
                priority=random.choice(['low', 'medium', 'high']),
                status=random.choice(['scheduled', 'completed']),
                created_by=usuario,
                user=usuario
            )

def create_notifications():
    """Crear notificaciones"""
    print('🔔 Creando notificaciones...')
    usuarios = User.objects.all()
    
    for usuario in usuarios:
        # 1-5 notificaciones por usuario
        for _ in range(random.randint(1, 5)):
            Notification.objects.create(
                user=usuario,
                title=fake.sentence(nb_words=2),
                message=fake.text(50),
                notification_type=random.choice(['info', 'success', 'warning']),
                is_read=random.choice([True, False]),
                created_at=timezone.now() - timedelta(days=random.randint(1, 7))
            )

def create_evaluations():
    """Crear evaluaciones"""
    print('📊 Creando evaluaciones...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    
    # Crear categorías de evaluación
    categories_data = [
        {'name': 'Habilidades Técnicas', 'description': 'Evaluación técnica'},
        {'name': 'Trabajo en Equipo', 'description': 'Colaboración'},
        {'name': 'Comunicación', 'description': 'Habilidades de comunicación'},
    ]
    
    categories = []
    for cat in categories_data:
        category, created = EvaluationCategory.objects.get_or_create(
            name=cat['name'],
            defaults={'description': cat['description']}
        )
        categories.append(category)
    
    # Crear evaluaciones
    for estudiante in estudiantes:
        # 1 evaluación por estudiante
        empresa = random.choice(empresas)
        proyecto = random.choice(proyectos)
        category = random.choice(categories)
        
        evaluacion = Evaluation.objects.create(
            student=estudiante.user,
            evaluator=empresa.user,
            project=proyecto,
            category=category,
            score=random.randint(60, 100),
            comments=fake.text(100),
            evaluation_date=timezone.now().date() - timedelta(days=random.randint(1, 30)),
            company=empresa,
            status=random.choice(['pending', 'completed']),
            type=random.choice(['intermediate', 'final'])
        )

def create_ratings():
    """Crear calificaciones"""
    print('⭐ Creando calificaciones...')
    estudiantes = Estudiante.objects.all()
    proyectos = Proyecto.objects.all()
    
    for estudiante in estudiantes:
        # Cada estudiante califica 1-2 proyectos
        proyectos_sample = random.sample(list(proyectos), min(2, len(proyectos)))
        
        for proyecto in proyectos_sample:
            Rating.objects.get_or_create(
                project=proyecto,
                user=estudiante.user,
                defaults={
                    'rating': random.randint(1, 5),
                    'comment': fake.text(50),
                    'created_at': timezone.now() - timedelta(days=random.randint(1, 30))
                }
            )

def create_documents():
    """Crear documentos"""
    print('📄 Creando documentos...')
    usuarios = User.objects.all()
    proyectos = Proyecto.objects.all()
    
    for usuario in usuarios:
        # 1-2 documentos por usuario
        for _ in range(random.randint(1, 2)):
            proyecto = random.choice(proyectos)
            Document.objects.create(
                title=fake.sentence(nb_words=2),
                description=fake.text(50),
                document_type=random.choice(['contract', 'proposal', 'report', 'presentation', 'manual', 'certificate', 'other']),
                file_url=f"https://docs.com/{fake.user_name()}.pdf",
                file_type=random.choice(['pdf', 'doc', 'docx']),
                file_size=random.randint(100000, 2000000),
                uploaded_by=usuario,
                project=proyecto,
                is_public=random.choice([True, False]),
                download_count=random.randint(0, 10)
            )

def create_reports():
    """Crear reportes"""
    print('📈 Creando reportes...')
    admins = User.objects.filter(role='admin')
    
    for admin in admins:
        # 1-2 reportes por admin
        for _ in range(random.randint(1, 2)):
            Report.objects.create(
                report_type=random.choice(['user_activity', 'project_status']),
                title=fake.sentence(nb_words=3),
                description=fake.text(50),
                generated_by=admin,
                status=random.choice(['pending', 'completed']),
                created_at=timezone.now() - timedelta(days=random.randint(1, 7))
            )

def create_activity_logs():
    """Crear logs de actividad"""
    print('📝 Creando logs de actividad...')
    usuarios = User.objects.all()
    
    activities = ['login', 'create_project', 'apply_project', 'update_profile']
    
    for usuario in usuarios:
        # 3-8 logs por usuario
        for _ in range(random.randint(3, 8)):
            ActivityLog.objects.create(
                user=usuario,
                action=random.choice(activities),
                details=fake.text(30),
                ip_address=fake.ipv4(),
                created_at=timezone.now() - timedelta(days=random.randint(1, 14))
            )

def main():
    """Función principal"""
    print("🚀 Iniciando población simplificada de la base de datos...")
    print(f"📊 Usando usuarios existentes: {User.objects.count()} usuarios")
    
    # Crear datos básicos
    areas, trl_levels, statuses = create_basic_data()
    
    # Poblar perfiles según rol
    populate_student_profiles()
    populate_company_profiles()
    
    # Crear datos principales
    proyectos = create_projects()
    aplicaciones = create_applications()
    
    # Crear datos relacionados
    create_work_hours()
    create_calendar_events()
    create_notifications()
    create_evaluations()
    create_ratings()
    create_documents()
    create_reports()
    create_activity_logs()
    
    print("✅ ¡Población simplificada completada!")
    print(f"📊 Resumen:")
    print(f"   - Áreas: {len(areas)}")
    print(f"   - Niveles TRL: {len(trl_levels)}")
    print(f"   - Estados: {len(statuses)}")
    print(f"   - Proyectos: {len(proyectos)}")
    print(f"   - Aplicaciones: {len(aplicaciones)}")

if __name__ == "__main__":
    main() 