#!/usr/bin/env python
"""
Script completo para poblar todas las tablas de la base de datos con datos realistas.
Usa los usuarios existentes (2 admins + 50 empresas + 50 estudiantes) y crea datos en todas las demás tablas.
"""
import os
import django
import random
import json
from datetime import timedelta, datetime
from faker import Faker
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from users.models import User
from companies.models import Empresa, UsuarioResponsable, CalificacionEmpresa
from students.models import Estudiante, PerfilEstudiante
from projects.models import Proyecto, HistorialEstadosProyecto, AplicacionProyecto, MiembroProyecto
from project_status.models import ProjectStatus, ProjectStatusHistory
from areas.models import Area
from trl_levels.models import TRLLevel
from applications.models import Aplicacion, Asignacion
from work_hours.models import WorkHour
from calendar_events.models import CalendarEvent, EventReminder, CalendarSettings
from notifications.models import Notification, NotificationTemplate, NotificationPreference
from mass_notifications.models import NotificationTemplate as MassNotificationTemplate, MassNotification
from evaluations.models import (
    EvaluationCategory, Evaluation, EvaluationCategoryScore, EvaluationTemplate,
    StudentSkill, StudentPortfolio, StudentAchievement
)
from evaluation_categories.models import EvaluationCategory as EvalCategory
from questionnaires.models import Questionnaire, Question, Choice, Answer
from ratings.models import Rating
from interviews.models import Interview
from disciplinary_records.models import DisciplinaryRecord
from documents.models import Document
from reports.models import Report
from activity_logs.models import ActivityLog
from data_backups.models import DataBackup
from platform_settings.models import PlatformSetting
from strikes.models import Strike

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

def create_areas():
    """Crear áreas de conocimiento"""
    print('🌍 Creando áreas de conocimiento...')
    areas_data = [
        'Tecnología de la Información', 'Ingeniería', 'Ciencias de la Salud', 
        'Ciencias Sociales', 'Arquitectura y Diseño', 'Administración y Negocios',
        'Medio Ambiente', 'Educación', 'Arte y Cultura', 'Investigación'
    ]
    
    areas = []
    for area_name in areas_data:
        area, created = Area.objects.get_or_create(
            name=area_name,
            defaults={
                'description': fake.text(100),
                'is_active': True
            }
        )
        areas.append(area)
    return areas

def create_trl_levels():
    """Crear niveles TRL"""
    print('📊 Creando niveles TRL...')
    trl_data = [
        {'level': 1, 'name': 'TRL 1', 'description': 'Principios básicos observados', 'min_hours': 20},
        {'level': 2, 'name': 'TRL 2', 'description': 'Concepto tecnológico formulado', 'min_hours': 40},
        {'level': 3, 'name': 'TRL 3', 'description': 'Prueba de concepto analítica', 'min_hours': 60},
        {'level': 4, 'name': 'TRL 4', 'description': 'Validación en laboratorio', 'min_hours': 80},
        {'level': 5, 'name': 'TRL 5', 'description': 'Validación en entorno relevante', 'min_hours': 100},
        {'level': 6, 'name': 'TRL 6', 'description': 'Demostración en entorno relevante', 'min_hours': 120},
        {'level': 7, 'name': 'TRL 7', 'description': 'Demostración en entorno operativo', 'min_hours': 140},
        {'level': 8, 'name': 'TRL 8', 'description': 'Sistema completo calificado', 'min_hours': 160},
        {'level': 9, 'name': 'TRL 9', 'description': 'Sistema probado en operación', 'min_hours': 180}
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
    return trl_levels

def create_project_statuses():
    """Crear estados de proyecto"""
    print('📋 Creando estados de proyecto...')
    status_data = [
        {'name': 'Borrador', 'description': 'Proyecto en fase de planificación'},
        {'name': 'Abierto', 'description': 'Proyecto disponible para aplicaciones'},
        {'name': 'En Revisión', 'description': 'Evaluando aplicaciones recibidas'},
        {'name': 'En Progreso', 'description': 'Proyecto en ejecución'},
        {'name': 'Pausado', 'description': 'Proyecto temporalmente suspendido'},
        {'name': 'Completado', 'description': 'Proyecto finalizado exitosamente'},
        {'name': 'Cancelado', 'description': 'Proyecto cancelado'}
    ]
    
    statuses = []
    for status in status_data:
        project_status, created = ProjectStatus.objects.get_or_create(
            name=status['name'],
            defaults={
                'description': status['description'],
                'is_active': True
            }
        )
        statuses.append(project_status)
    return statuses

def create_platform_settings():
    """Crear configuraciones de plataforma"""
    print('⚙️ Creando configuraciones de plataforma...')
    settings_data = [
        {'key': 'max_strikes', 'value': '3', 'description': 'Máximo número de strikes permitidos', 'setting_type': 'INTEGER'},
        {'key': 'min_gpa', 'value': '4.0', 'description': 'GPA mínimo requerido', 'setting_type': 'FLOAT'},
        {'key': 'max_hours_per_week', 'value': '20', 'description': 'Máximo de horas por semana', 'setting_type': 'INTEGER'},
        {'key': 'application_deadline_days', 'value': '30', 'description': 'Días límite para aplicar', 'setting_type': 'INTEGER'},
        {'key': 'auto_approve_applications', 'value': 'false', 'description': 'Aprobar aplicaciones automáticamente', 'setting_type': 'BOOLEAN'},
    ]
    
    for setting in settings_data:
        PlatformSetting.objects.get_or_create(
            key=setting['key'],
            defaults={
                'value': setting['value'],
                'description': setting['description'],
                'setting_type': setting['setting_type']
            }
        )

def create_evaluation_categories():
    """Crear categorías de evaluación"""
    print('📝 Creando categorías de evaluación...')
    categories_data = [
        {'name': 'Habilidades Técnicas', 'description': 'Evaluación de competencias técnicas'},
        {'name': 'Trabajo en Equipo', 'description': 'Capacidad de colaboración'},
        {'name': 'Comunicación', 'description': 'Habilidades de comunicación'},
        {'name': 'Responsabilidad', 'description': 'Cumplimiento de responsabilidades'},
        {'name': 'Creatividad', 'description': 'Pensamiento creativo e innovación'},
        {'name': 'Liderazgo', 'description': 'Capacidades de liderazgo'},
    ]
    
    categories = []
    for cat in categories_data:
        category, created = EvaluationCategory.objects.get_or_create(
            name=cat['name'],
            defaults={
                'description': cat['description'],
                'is_active': True
            }
        )
        categories.append(category)
    return categories

def create_questionnaires():
    """Crear cuestionarios y preguntas"""
    print('📋 Creando cuestionarios...')
    questionnaire_data = [
        {
            'title': 'Evaluación de Habilidades Técnicas',
            'description': 'Cuestionario para evaluar competencias técnicas del estudiante',
            'questions': [
                {'text': '¿Qué nivel de experiencia tienes en programación?', 'type': 'SINGLE_CHOICE'},
                {'text': '¿Qué tecnologías conoces?', 'type': 'MULTIPLE_CHOICE'},
                {'text': 'Describe tu proyecto más complejo', 'type': 'TEXT'},
            ]
        },
        {
            'title': 'Evaluación de Soft Skills',
            'description': 'Evaluación de habilidades blandas y trabajo en equipo',
            'questions': [
                {'text': '¿Cómo manejas el trabajo bajo presión?', 'type': 'TEXT'},
                {'text': '¿Prefieres trabajar solo o en equipo?', 'type': 'SINGLE_CHOICE'},
                {'text': 'Describe una situación de conflicto que hayas resuelto', 'type': 'TEXT'},
            ]
        }
    ]
    
    questionnaires = []
    for q_data in questionnaire_data:
        questionnaire, created = Questionnaire.objects.get_or_create(
            title=q_data['title'],
            defaults={'description': q_data['description']}
        )
        questionnaires.append(questionnaire)
        
        for q in q_data['questions']:
            question, created = Question.objects.get_or_create(
                questionnaire=questionnaire,
                text=q['text'],
                defaults={'question_type': q['type']}
            )
            
            if q['type'] in ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']:
                choices = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto']
                for choice_text in choices:
                    Choice.objects.get_or_create(
                        question=question,
                        text=choice_text
                    )
    
    return questionnaires

def create_notification_templates():
    """Crear plantillas de notificación"""
    print('📧 Creando plantillas de notificación...')
    templates_data = [
        {
            'name': 'Aplicación Recibida',
            'notification_type': 'info',
            'title_template': 'Tu aplicación ha sido recibida',
            'message_template': 'Hola {{student_name}}, hemos recibido tu aplicación para el proyecto {{project_title}}. Te notificaremos cuando sea revisada.',
            'priority': 'normal',
            'is_active': True,
            'available_variables': ['student_name', 'project_title']
        },
        {
            'name': 'Aplicación Aprobada',
            'notification_type': 'success',
            'title_template': '¡Tu aplicación ha sido aprobada!',
            'message_template': '¡Felicitaciones {{student_name}}! Tu aplicación para {{project_title}} ha sido aprobada. Comienza tu trabajo pronto.',
            'priority': 'high',
            'is_active': True,
            'available_variables': ['student_name', 'project_title']
        },
        {
            'name': 'Strike Recibido',
            'notification_type': 'warning',
            'title_template': 'Amonestación recibida',
            'message_template': 'Hola {{student_name}}, has recibido una amonestación por {{reason}}. Por favor revisa los detalles.',
            'priority': 'medium',
            'is_active': True,
            'available_variables': ['student_name', 'reason']
        }
    ]
    
    for template_data in templates_data:
        NotificationTemplate.objects.get_or_create(
            name=template_data['name'],
            notification_type=template_data['notification_type'],
            defaults={
                'title_template': template_data['title_template'],
                'message_template': template_data['message_template'],
                'priority': template_data['priority'],
                'is_active': template_data['is_active'],
                'available_variables': json.dumps(template_data['available_variables'])
            }
        )

def populate_student_profiles():
    """Poblar perfiles de estudiantes con datos adicionales"""
    print('👨‍🎓 Poblando perfiles de estudiantes...')
    estudiantes = Estudiante.objects.all()
    
    for estudiante in estudiantes:
        # Actualizar datos del estudiante
        estudiante.career = random.choice(CARRERAS)
        estudiante.semester = random.randint(1, 12)
        estudiante.graduation_year = random.randint(2024, 2028)
        estudiante.gpa = Decimal(str(random.uniform(4.0, 7.0)).format('0.2'))
        estudiante.api_level = random.randint(1, 4)
        estudiante.save()
        
        # Crear perfil extendido SOLO con campos válidos
        perfil, created = PerfilEstudiante.objects.get_or_create(
            estudiante=estudiante,
            defaults={
                'fecha_nacimiento': fake.date_of_birth(minimum_age=18, maximum_age=28),
                'genero': random.choice(['Masculino', 'Femenino', 'Otro']),
                'nacionalidad': 'Chilena',
                'universidad': random.choice(INSTITUCIONES),
                'facultad': fake.word().capitalize() + ' y Ciencias',
                'promedio_historico': Decimal(str(random.uniform(4.0, 7.0)).format('0.2')),
                'experiencia_laboral': fake.text(100),
                'certificaciones': json.dumps(random.sample(['AWS', 'Google Cloud', 'Microsoft Azure', 'Docker', 'Kubernetes'], random.randint(0, 3))),
                'proyectos_personales': json.dumps([fake.sentence(nb_words=4) for _ in range(random.randint(0, 2))]),
                'tecnologias_preferidas': json.dumps(random.sample(TECNOLOGIAS, random.randint(2, 5))),
                'industrias_interes': json.dumps(random.sample(['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Retail', 'Manufactura', 'Servicios'], random.randint(1, 3))),
                'tipo_proyectos_preferidos': json.dumps(random.sample(['Investigación', 'Desarrollo', 'Innovación', 'Consultoría'], random.randint(1, 2))),
                'telefono_emergencia': fake.phone_number(),
                'contacto_emergencia': fake.name(),
            }
        )

def populate_company_profiles():
    """Poblar perfiles de empresas con datos adicionales"""
    print('🏢 Poblando perfiles de empresas...')
    empresas = Empresa.objects.all()
    
    for empresa in empresas:
        empresa.description = fake.text(300)
        empresa.industry = random.choice(['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Retail', 'Manufactura', 'Servicios'])
        empresa.size = random.choice(['Pequeña', 'Mediana', 'Grande', 'Startup'])
        empresa.website = f"https://{fake.domain_name()}"
        empresa.address = fake.address()
        empresa.city = fake.city()
        empresa.country = 'Chile'
        empresa.rut = f"{random.randint(10000000, 99999999)}-{random.randint(1, 9)}"
        empresa.personality = random.choice(['jurídica', 'natural'])
        empresa.business_name = empresa.company_name
        empresa.company_address = empresa.address
        empresa.company_phone = fake.phone_number()
        empresa.company_email = empresa.user.email
        empresa.founded_year = random.randint(1990, 2023)
        empresa.logo_url = f"https://via.placeholder.com/150x150?text={empresa.company_name[:3]}"
        empresa.verified = random.choice([True, False])
        empresa.rating = Decimal(str(random.uniform(3.0, 5.0)).format('0.2'))
        empresa.total_projects = random.randint(1, 20)
        empresa.projects_completed = random.randint(0, empresa.total_projects)
        empresa.total_hours_offered = random.randint(100, 2000)
        empresa.technologies_used = json.dumps(random.sample(TECNOLOGIAS, random.randint(5, 12)))
        empresa.benefits_offered = json.dumps(random.sample(['Flexibilidad horaria', 'Trabajo remoto', 'Capacitación', 'Bonos', 'Seguro de salud'], random.randint(2, 4)))
        empresa.remote_work_policy = random.choice(['full-remote', 'hybrid', 'onsite'])
        empresa.internship_duration = random.choice(['3 meses', '6 meses', '1 año', 'Flexible'])
        empresa.contact_email = empresa.user.email
        empresa.contact_phone = empresa.company_phone
        empresa.save()

def create_projects():
    """Crear proyectos usando empresas existentes"""
    print('🚀 Creando proyectos...')
    empresas = Empresa.objects.all()
    areas = Area.objects.all()
    trl_levels = TRLLevel.objects.all()
    statuses = ProjectStatus.objects.all()
    
    proyectos = []
    for i in range(1, 101):  # 100 proyectos
        empresa = random.choice(empresas)
        area = random.choice(areas)
        trl = random.choice(trl_levels)
        status = random.choice(statuses)
        
        proyecto = Proyecto.objects.create(
            company=empresa,
            status=status,
            area=area,
            title=f"Proyecto {i}: {fake.bs().capitalize()}",
            description=fake.text(300),
            requirements=fake.text(200),
            trl=trl,
            modality=random.choice(['remote', 'onsite', 'hybrid']),
            difficulty=random.choice(['beginner', 'intermediate', 'advanced']),
            duration_weeks=random.randint(4, 52),
            hours_per_week=random.randint(10, 40),
            required_skills=json.dumps(random.sample(TECNOLOGIAS, random.randint(3, 8))),
            is_featured=random.choice([True, False]),
            is_urgent=random.choice([True, False]),
            published_at=timezone.now() - timedelta(days=random.randint(1, 365))
        )
        proyectos.append(proyecto)
        
        # Crear historial de estados
        HistorialEstadosProyecto.objects.create(
            project=proyecto,
            status=status,
            user=empresa.user,
            comentario=fake.text(100)
        )
    
    return proyectos

def create_applications_and_assignments():
    """Crear aplicaciones y asignaciones"""
    print('📝 Creando aplicaciones y asignaciones...')
    estudiantes = Estudiante.objects.all()
    proyectos = Proyecto.objects.all()
    
    aplicaciones = []
    asignaciones = []
    
    for estudiante in estudiantes:
        # Cada estudiante aplica a 2-5 proyectos
        proyectos_sample = random.sample(list(proyectos), min(5, len(proyectos)))
        
        for proyecto in proyectos_sample:
            aplicacion, created = Aplicacion.objects.get_or_create(
                project=proyecto,
                student=estudiante,
                defaults={
                    'status': random.choice(['pending', 'accepted', 'rejected', 'completed']),
                    'cover_letter': fake.text(200),
                    'portfolio_url': f"https://portfolio.com/{fake.user_name()}",
                    'github_url': f"https://github.com/{fake.user_name()}",
                    'linkedin_url': f"https://linkedin.com/in/{fake.user_name()}",
                    'applied_at': timezone.now() - timedelta(days=random.randint(1, 30))
                }
            )
            aplicaciones.append(aplicacion)
            
            # Si la aplicación fue aceptada, crear asignación
            if aplicacion.status == 'accepted':
                asignacion, created = Asignacion.objects.get_or_create(
                    application=aplicacion,
                    defaults={
                        'fecha_inicio': timezone.now().date() - timedelta(days=random.randint(1, 100)),
                        'fecha_fin': timezone.now().date() + timedelta(days=random.randint(30, 200)),
                        'tareas': fake.text(100),
                        'estado': random.choice(['en curso', 'completado', 'cancelado']),
                        'hours_worked': random.randint(0, 100),
                        'tasks_completed': random.randint(0, 10)
                    }
                )
                asignaciones.append(asignacion)
    
    return aplicaciones, asignaciones

def create_work_hours():
    """Crear horas de trabajo"""
    print('⏰ Creando horas de trabajo...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    asignaciones = Asignacion.objects.filter(estado='active')
    
    for estudiante in estudiantes:
        # 1-5 registros de horas por estudiante
        for _ in range(random.randint(1, 5)):
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
                date=timezone.now().date() - timedelta(days=random.randint(1, 30)),
                hours_worked=random.randint(1, 8),
                description=fake.text(100),
                task_type=random.choice(['development', 'research', 'meeting', 'documentation', 'testing']),
                is_approved=random.choice([True, False]),
                approved_by=empresa.user if random.choice([True, False]) else None,
                approved_at=timezone.now() if random.choice([True, False]) else None
            )

def create_calendar_events():
    """Crear eventos de calendario"""
    print('📅 Creando eventos de calendario...')
    usuarios = User.objects.all()
    
    for usuario in usuarios:
        # 1-5 eventos por usuario
        for _ in range(random.randint(1, 5)):
            start_date = timezone.now() + timedelta(days=random.randint(1, 60))
            end_date = start_date + timedelta(hours=random.randint(1, 4))
            
            evento = CalendarEvent.objects.create(
                title=fake.sentence(nb_words=4),
                description=fake.text(100),
                event_type=random.choice(['meeting', 'deadline', 'interview', 'presentation', 'review', 'other']),
                start_date=start_date,
                end_date=end_date,
                location=fake.address(),
                priority=random.choice(['low', 'medium', 'high', 'urgent']),
                status=random.choice(['scheduled', 'in_progress', 'completed', 'cancelled']),
                is_public=random.choice([True, False]),
                created_by=usuario,
                user=usuario
            )
            
            # Crear recordatorio para algunos eventos
            if random.choice([True, False]):
                EventReminder.objects.create(
                    event=evento,
                    user=usuario,
                    reminder_type=random.choice(['email', 'push', 'sms', 'in_app']),
                    minutes_before=random.choice([5, 15, 30, 60]),
                    scheduled_for=start_date - timedelta(minutes=random.choice([5, 15, 30, 60]))
                )

def create_notifications():
    """Crear notificaciones"""
    print('🔔 Creando notificaciones...')
    usuarios = User.objects.all()
    
    for usuario in usuarios:
        # 1-10 notificaciones por usuario
        for _ in range(random.randint(1, 10)):
            Notification.objects.create(
                user=usuario,
                title=fake.sentence(nb_words=3),
                message=fake.text(100),
                notification_type=random.choice(['info', 'success', 'warning', 'error']),
                is_read=random.choice([True, False]),
                created_at=timezone.now() - timedelta(days=random.randint(1, 30))
            )

def create_evaluations():
    """Crear evaluaciones"""
    print('📊 Creando evaluaciones...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    categories = EvaluationCategory.objects.all()
    
    for estudiante in estudiantes:
        # 1-3 evaluaciones por estudiante
        for _ in range(random.randint(1, 3)):
            empresa = random.choice(empresas)
            proyecto = random.choice(proyectos)
            
            evaluacion = Evaluation.objects.create(
                student=estudiante,
                evaluator=empresa.user,
                project=proyecto,
                evaluation_date=timezone.now().date() - timedelta(days=random.randint(1, 100)),
                overall_score=random.randint(1, 5),
                comments=fake.text(200),
                is_anonymous=random.choice([True, False])
            )
            
            # Crear puntajes por categoría
            for category in random.sample(list(categories), random.randint(2, len(categories))):
                EvaluationCategoryScore.objects.create(
                    evaluation=evaluacion,
                    category=category,
                    score=random.randint(1, 5),
                    comments=fake.text(100)
                )

def create_ratings():
    """Crear calificaciones"""
    print('⭐ Creando calificaciones...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    
    for estudiante in estudiantes:
        # Cada estudiante califica 1-3 empresas
        empresas_sample = random.sample(list(empresas), min(3, len(empresas)))
        
        for empresa in empresas_sample:
            Rating.objects.create(
                student=estudiante,
                company=empresa,
                rating=random.randint(1, 5),
                comment=fake.text(150),
                created_at=timezone.now() - timedelta(days=random.randint(1, 100))
            )

def create_interviews():
    """Crear entrevistas"""
    print('🎤 Creando entrevistas...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    
    for estudiante in estudiantes:
        # 0-2 entrevistas por estudiante
        for _ in range(random.randint(0, 2)):
            empresa = random.choice(empresas)
            proyecto = random.choice(proyectos)
            
            Interview.objects.create(
                student=estudiante,
                company=empresa,
                project=proyecto,
                interviewer=empresa.user,
                interview_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                duration_minutes=random.randint(30, 120),
                interview_type=random.choice(['phone', 'video', 'onsite']),
                status=random.choice(['scheduled', 'completed', 'cancelled']),
                notes=fake.text(200),
                feedback=fake.text(150) if random.choice([True, False]) else ''
            )

def create_documents():
    """Crear documentos"""
    print('📄 Creando documentos...')
    usuarios = User.objects.all()
    
    for usuario in usuarios:
        # 1-3 documentos por usuario
        for _ in range(random.randint(1, 3)):
            Document.objects.create(
                title=fake.sentence(nb_words=3),
                description=fake.text(100),
                file_type=random.choice(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']),
                file_size=random.randint(100000, 5000000),  # 100KB - 5MB
                uploaded_by=usuario,
                is_public=random.choice([True, False]),
                download_count=random.randint(0, 50),
                tags=json.dumps(random.sample(['documento', 'reporte', 'presentación', 'manual'], random.randint(1, 3)))
            )

def create_reports():
    """Crear reportes"""
    print('📈 Creando reportes...')
    admins = User.objects.filter(role='admin')
    
    for admin in admins:
        # 1-5 reportes por admin
        for _ in range(random.randint(1, 5)):
            Report.objects.create(
                report_type=random.choice(['user_activity', 'project_status', 'financial', 'performance']),
                title=fake.sentence(nb_words=4),
                description=fake.text(100),
                generated_by=admin,
                report_data=json.dumps({'data': fake.text(200)}),
                status=random.choice(['pending', 'completed', 'failed']),
                created_at=timezone.now() - timedelta(days=random.randint(1, 30))
            )

def create_activity_logs():
    """Crear logs de actividad"""
    print('📝 Creando logs de actividad...')
    usuarios = User.objects.all()
    
    activities = [
        'login', 'logout', 'create_project', 'apply_project', 'update_profile',
        'upload_document', 'create_evaluation', 'send_notification'
    ]
    
    for usuario in usuarios:
        # 5-15 logs por usuario
        for _ in range(random.randint(5, 15)):
            ActivityLog.objects.create(
                user=usuario,
                action=random.choice(activities),
                details=fake.text(100),
                ip_address=fake.ipv4(),
                user_agent=fake.user_agent(),
                created_at=timezone.now() - timedelta(days=random.randint(1, 90))
            )

def create_data_backups():
    """Crear backups de datos"""
    print('💾 Creando backups de datos...')
    admins = User.objects.filter(role='admin')
    
    for admin in admins:
        # 1-3 backups por admin
        for _ in range(random.randint(1, 3)):
            DataBackup.objects.create(
                backup_type=random.choice(['full', 'incremental', 'differential']),
                description=fake.text(100),
                file_size=random.randint(10000000, 100000000),  # 10MB - 100MB
                created_by=admin,
                status=random.choice(['completed', 'failed', 'in_progress']),
                created_at=timezone.now() - timedelta(days=random.randint(1, 30))
            )

def create_disciplinary_records():
    """Crear registros disciplinarios"""
    print('⚠️ Creando registros disciplinarios...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    
    for estudiante in estudiantes:
        # 0-2 registros disciplinarios por estudiante
        for _ in range(random.randint(0, 2)):
            empresa = random.choice(empresas)
            
            DisciplinaryRecord.objects.create(
                student=estudiante,
                company=empresa,
                incident_date=timezone.now().date() - timedelta(days=random.randint(1, 100)),
                description=fake.text(200),
                severity=random.choice(['low', 'medium', 'high']),
                action_taken=fake.text(150),
                created_by=empresa.user,
                is_resolved=random.choice([True, False])
            )

def create_strikes():
    """Crear strikes"""
    print('🚨 Creando strikes...')
    estudiantes = Estudiante.objects.all()
    empresas = Empresa.objects.all()
    proyectos = Proyecto.objects.all()
    
    for estudiante in estudiantes:
        # 0-3 strikes por estudiante
        for _ in range(random.randint(0, 3)):
            empresa = random.choice(empresas)
            proyecto = random.choice(proyectos)
            
            Strike.objects.create(
                student=estudiante,
                company=empresa,
                project=proyecto,
                reason=fake.text(100),
                description=fake.text(150),
                severity=random.choice(['low', 'medium', 'high']),
                issued_by=empresa.user,
                expires_at=timezone.now() + timedelta(days=random.randint(30, 365)) if random.choice([True, False]) else None,
                is_active=random.choice([True, False])
            )

def main():
    """Función principal que ejecuta todo el proceso de población"""
    print("🚀 Iniciando población completa de la base de datos...")
    print(f"📊 Usando usuarios existentes: {User.objects.count()} usuarios")
    
    # Crear datos de referencia
    areas = create_areas()
    trl_levels = create_trl_levels()
    project_statuses = create_project_statuses()
    evaluation_categories = create_evaluation_categories()
    questionnaires = create_questionnaires()
    
    # Crear configuraciones
    create_platform_settings()
    create_notification_templates()
    
    # Poblar perfiles existentes
    populate_student_profiles()
    populate_company_profiles()
    
    # Crear datos principales
    proyectos = create_projects()
    aplicaciones, asignaciones = create_applications_and_assignments()
    
    # Crear datos relacionados
    create_work_hours()
    create_calendar_events()
    create_notifications()
    create_evaluations()
    create_ratings()
    create_interviews()
    create_documents()
    create_reports()
    create_activity_logs()
    create_data_backups()
    create_disciplinary_records()
    create_strikes()
    
    print("✅ ¡Población completa de la base de datos finalizada!")
    print(f"📊 Resumen:")
    print(f"   - Áreas: {len(areas)}")
    print(f"   - Niveles TRL: {len(trl_levels)}")
    print(f"   - Estados de proyecto: {len(project_statuses)}")
    print(f"   - Categorías de evaluación: {len(evaluation_categories)}")
    print(f"   - Cuestionarios: {len(questionnaires)}")
    print(f"   - Proyectos: {len(proyectos)}")
    print(f"   - Aplicaciones: {len(aplicaciones)}")
    print(f"   - Asignaciones: {len(asignaciones)}")

if __name__ == "__main__":
    main() 