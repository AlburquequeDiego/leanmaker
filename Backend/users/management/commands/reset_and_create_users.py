from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
from users.models import Usuario
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto, AplicacionProyecto
from applications.models import Aplicacion
from evaluations.models import Evaluation
from interviews.models import Interview
from notifications.models import Notification
from mass_notifications.models import MassNotification
from activity_logs.models import ActivityLog
from data_backups.models import DataBackup
from disciplinary_records.models import DisciplinaryRecord
from documents.models import Document
from evaluation_categories.models import EvaluationCategory
from calendar_events.models import CalendarEvent
from work_hours.models import WorkHour
from strikes.models import Strike
from ratings.models import Rating
from reports.models import Report
from questionnaires.models import Questionnaire, Answer
from trl_levels.models import TRLLevel
from areas.models import Area
from assignments.models import Assignment
from project_status.models import ProjectStatus

User = get_user_model()

class Command(BaseCommand):
    help = 'Limpiar completamente la base de datos y crear usuarios desde cero con reglas de validación'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirmar que quieres limpiar la base de datos',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.ERROR(
                    '⚠️  ADVERTENCIA: Este comando eliminará TODOS los datos de la base de datos.\n'
                    'Para continuar, ejecuta: python manage.py reset_and_create_users --confirm'
                )
            )
            return

        self.stdout.write('🧹 Limpiando completamente la base de datos...')
        
        # Lista de todas las tablas a limpiar (en orden de dependencias)
        tables_to_clean = [
            'project_applications',
            'applications',
            'evaluations',
            'interviews',
            'notifications',
            'mass_notifications',
            'activity_logs',
            'data_backups',
            'disciplinary_records',
            'documents',
            'evaluation_categories',
            'calendar_events',
            'work_hours',
            'strikes',
            'ratings',
            'reports',
            'questionnaire_responses',
            'questionnaires',
            'trl_levels',
            'areas',
            'assignments',
            'project_status',
            'projects',
            'students',
            'companies',
            'users',
        ]

        # Limpiar todas las tablas
        with connection.cursor() as cursor:
            for table in tables_to_clean:
                try:
                    cursor.execute(f"DELETE FROM {table}")
                    self.stdout.write(f"✅ Limpiada tabla: {table}")
                except Exception as e:
                    self.stdout.write(f"⚠️  No se pudo limpiar {table}: {e}")

        self.stdout.write('✅ Base de datos limpiada completamente')
        
        # Crear usuarios con las reglas correctas
        self.create_users_with_rules()
        
        self.stdout.write(
            self.style.SUCCESS('🎉 Usuarios creados exitosamente con las reglas de validación correctas!')
        )

    def create_users_with_rules(self):
        """Crear usuarios con las reglas de validación correctas"""
        
        # Universidades chilenas con dominios institucionales
        universidades = [
            {
                'nombre': 'Universidad de Chile',
                'dominio': 'uchile.cl',
                'abreviacion': 'UCH'
            },
            {
                'nombre': 'Pontificia Universidad Católica de Chile',
                'dominio': 'uc.cl',
                'abreviacion': 'PUC'
            },
            {
                'nombre': 'Universidad de Concepción',
                'dominio': 'udec.cl',
                'abreviacion': 'UDEC'
            },
            {
                'nombre': 'Universidad Técnica Federico Santa María',
                'dominio': 'usm.cl',
                'abreviacion': 'USM'
            },
            {
                'nombre': 'Universidad de Santiago de Chile',
                'dominio': 'usach.cl',
                'abreviacion': 'USACH'
            },
            {
                'nombre': 'Universidad Austral de Chile',
                'dominio': 'uach.cl',
                'abreviacion': 'UACH'
            },
            {
                'nombre': 'Universidad de Valparaíso',
                'dominio': 'uv.cl',
                'abreviacion': 'UV'
            },
            {
                'nombre': 'Universidad de La Frontera',
                'dominio': 'ufro.cl',
                'abreviacion': 'UFRO'
            },
            {
                'nombre': 'Universidad de Talca',
                'dominio': 'utalca.cl',
                'abreviacion': 'UTALCA'
            },
            {
                'nombre': 'Universidad de Antofagasta',
                'dominio': 'uantof.cl',
                'abreviacion': 'UANTOF'
            }
        ]

        # Contraseñas que cumplen las reglas: mayúscula + caracter especial
        passwords = [
            'Test123!',
            'Secure456@',
            'Password789#',
            'Admin2024$',
            'User2024%',
            'Demo2024^',
            'Test2024&',
            'Secure2024*',
            'Pass2024+',
            'User2024='
        ]

        # Crear administrador
        admin_email = 'admin@leanmaker.cl'
        if not Usuario.objects.filter(email=admin_email).exists():
            admin_user = Usuario.objects.create_user(
                email=admin_email,
                password='Admin2024!',
                first_name='Administrador',
                last_name='Sistema',
                role='admin',
                is_verified=True,
                is_active=True,
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'👑 Administrador creado: {admin_email} (Admin2024!)')
            )

        # Crear estudiantes (uno por universidad)
        for i, universidad in enumerate(universidades):
            email_estudiante = f'estudiante{i+1}@{universidad["dominio"]}'
            password = passwords[i % len(passwords)]
            
            if not Usuario.objects.filter(email=email_estudiante).exists():
                estudiante_user = Usuario.objects.create_user(
                    email=email_estudiante,
                    password=password,
                    first_name=f'Estudiante{i+1}',
                    last_name=f'Apellido{i+1}',
                    role='student',
                    is_verified=True,
                    is_active=True
                )
                
                # Crear perfil de estudiante
                Estudiante.objects.create(
                    user=estudiante_user,
                    career='Ingeniería Civil Informática',
                    semester=6,
                    graduation_year=2025,
                    status='approved',
                    api_level=1,
                    strikes=0,
                    gpa=5.5,
                    completed_projects=0,
                    total_hours=0,
                    experience_years=0,
                    availability='flexible',
                    location='Santiago, Chile',
                    rating=0.0
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'🎓 Estudiante creado: {email_estudiante} ({password})')
                )

        # Crear empresas (una por universidad)
        for i, universidad in enumerate(universidades):
            email_empresa = f'empresa{i+1}@{universidad["dominio"]}'
            password = passwords[(i + 5) % len(passwords)]  # Diferente contraseña
            
            if not Usuario.objects.filter(email=email_empresa).exists():
                empresa_user = Usuario.objects.create_user(
                    email=email_empresa,
                    password=password,
                    first_name=f'Empresa{i+1}',
                    last_name=f'Corporación{i+1}',
                    role='company',
                    is_verified=True,
                    is_active=True
                )
                
                # Crear perfil de empresa
                Empresa.objects.create(
                    user=empresa_user,
                    company_name=f'Empresa {universidad["abreviacion"]}',
                    industry='Tecnología',
                    size='Mediana',
                    website=f'https://www.empresa{i+1}.cl',
                    address=f'Av. Principal {i+1}',
                    city='Santiago',
                    country='Chile',
                    description=f'Empresa de tecnología asociada a {universidad["nombre"]}',
                    founded_year=2020,
                    verified=True,
                    status='active'
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'🏢 Empresa creada: {email_empresa} ({password})')
                )

        # Crear algunos proyectos de ejemplo
        self.create_sample_projects()

    def create_sample_projects(self):
        """Crear algunos proyectos de ejemplo"""
        empresas = Empresa.objects.all()[:5]  # Tomar las primeras 5 empresas
        
        proyectos_ejemplo = [
            {
                'title': 'Desarrollo de Aplicación Móvil',
                'description': 'Crear una aplicación móvil para gestión de inventarios',
                'requirements': 'React Native, Firebase, Node.js',
                'duration': '3 meses',
                'budget': 5000000,
                'max_students': 2
            },
            {
                'title': 'Sistema de Análisis de Datos',
                'description': 'Desarrollar un sistema de análisis de datos para retail',
                'requirements': 'Python, Pandas, SQL, Power BI',
                'duration': '4 meses',
                'budget': 8000000,
                'max_students': 3
            },
            {
                'title': 'Plataforma Web E-commerce',
                'description': 'Crear una plataforma de comercio electrónico completa',
                'requirements': 'React, Node.js, MongoDB, Stripe',
                'duration': '6 meses',
                'budget': 12000000,
                'max_students': 4
            },
            {
                'title': 'API REST para Microservicios',
                'description': 'Desarrollar una API REST para sistema de microservicios',
                'requirements': 'Java, Spring Boot, Docker, Kubernetes',
                'duration': '2 meses',
                'budget': 3000000,
                'max_students': 2
            },
            {
                'title': 'Sistema de Machine Learning',
                'description': 'Implementar algoritmos de ML para predicción de ventas',
                'requirements': 'Python, Scikit-learn, TensorFlow, AWS',
                'duration': '5 meses',
                'budget': 10000000,
                'max_students': 3
            }
        ]

        for i, proyecto_data in enumerate(proyectos_ejemplo):
            if i < len(empresas):
                from projects.models import Proyecto
                from project_status.models import ProjectStatus
                
                # Crear estado del proyecto
                status, created = ProjectStatus.objects.get_or_create(
                    name='published',
                    defaults={'description': 'Proyecto publicado y disponible'}
                )
                
                proyecto = Proyecto.objects.create(
                    company=empresas[i],
                    title=proyecto_data['title'],
                    description=proyecto_data['description'],
                    required_skills=proyecto_data['requirements'],
                    duration_months=int(proyecto_data['duration'].split()[0]),
                    required_hours=proyecto_data['budget'],
                    max_students=proyecto_data['max_students'],
                    current_students=0,
                    status=status,
                    location='Santiago, Chile',
                    modality='remote',
                    difficulty='intermediate'
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'📋 Proyecto creado: {proyecto.title}')
                )

        # Mostrar resumen final
        total_users = Usuario.objects.count()
        total_students = Estudiante.objects.count()
        total_companies = Empresa.objects.count()
        total_projects = Proyecto.objects.count()
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 RESUMEN FINAL:'))
        self.stdout.write(f'👥 Total usuarios: {total_users}')
        self.stdout.write(f'🎓 Estudiantes: {total_students}')
        self.stdout.write(f'🏢 Empresas: {total_companies}')
        self.stdout.write(f'📋 Proyectos: {total_projects}')
        self.stdout.write('='*50)
        
        self.stdout.write('\n🔑 CREDENCIALES DE ACCESO:')
        self.stdout.write('👑 Admin: admin@leanmaker.cl / Admin2024!')
        self.stdout.write('🎓 Estudiantes: estudiante1@uchile.cl / Test123!')
        self.stdout.write('🏢 Empresas: empresa1@uchile.cl / Secure456@')
        self.stdout.write('\n📝 NOTA: Las contraseñas cumplen las reglas de validación (mayúscula + caracter especial)') 