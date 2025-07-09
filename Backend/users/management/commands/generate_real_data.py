# --- IMPORTS ORDENADOS ---
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from users.models import Usuario
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto, HistorialEstadosProyecto
from applications.models import Aplicacion, Asignacion
from assignments.models import Assignment
from work_hours.models import WorkHour
from evaluations.models import Evaluation, EvaluationCategory, StudentSkill, StudentPortfolio, StudentAchievement
from strikes.models import Strike
from notifications.models import Notification
from calendar_events.models import CalendarEvent
from reports.models import Report
from ratings.models import Rating
from disciplinary_records.models import DisciplinaryRecord
from interviews.models import Interview
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Genera datos completos: 2 admins, 50 empresas, 50 estudiantes, 150 proyectos con todas las relaciones (máx 150 por tabla).'

    def handle(self, *args, **options):
        self.stdout.write('--- Generando datos completos para Leanmaker (máx 150 por tabla) ---')
        
        # 1. Crear áreas básicas
        areas_data = [
            {'name': 'Tecnología de la Información', 'description': 'Proyectos relacionados con software y sistemas'},
            {'name': 'Ingeniería', 'description': 'Proyectos de ingeniería y desarrollo técnico'},
            {'name': 'Ciencias', 'description': 'Proyectos de investigación científica'},
            {'name': 'Negocios', 'description': 'Proyectos de administración y emprendimiento'},
            {'name': 'Arte y Diseño', 'description': 'Proyectos creativos y de diseño'},
        ]
        
        areas = []
        for area_data in areas_data:
            area, created = Area.objects.get_or_create(
                name=area_data['name'],
                defaults={'description': area_data['description']}
            )
            areas.append(area)
        
        # 2. Crear niveles TRL
        trl_levels = []
        for i in range(1, 6):
            trl, created = TRLLevel.objects.get_or_create(
                level=i,
                defaults={
                    'name': f'TRL {i}',
                    'description': f'Descripción del nivel TRL {i}'
                }
            )
            trl_levels.append(trl)
        
        # 3. Crear estados de proyecto
        status_data = [
            {'name': 'active', 'description': 'Proyecto activo y disponible'},
            {'name': 'in_progress', 'description': 'Proyecto en desarrollo'},
            {'name': 'completed', 'description': 'Proyecto completado'},
        ]
        
        status_objs = []
        for status_data_item in status_data:
            status, created = ProjectStatus.objects.get_or_create(
                name=status_data_item['name'],
                defaults={'description': status_data_item['description']}
            )
            status_objs.append(status)

        # 4. Crear categorías de evaluación
        eval_categories = []
        categories_data = ['Habilidades Técnicas', 'Trabajo en Equipo', 'Comunicación', 'Creatividad']
        for cat_name in categories_data:
            cat, created = EvaluationCategory.objects.get_or_create(
                name=cat_name,
                defaults={'description': f'Evaluación de {cat_name.lower()}'}
            )
            eval_categories.append(cat)

        # 5. Crear Administradores (2)
        admins_data = [
            {'email': 'admin@leanmaker.com', 'password': 'Admin123!', 'first_name': 'Administrador', 'last_name': 'Principal'},
            {'email': 'admin2@leanmaker.com', 'password': 'Admin123!', 'first_name': 'Administrador', 'last_name': 'Secundario'},
        ]
        
        admin_objs = []
        for admin_data in admins_data:
            admin, created = Usuario.objects.get_or_create(
                email=admin_data['email'],
                defaults={
                    'first_name': admin_data['first_name'],
                    'last_name': admin_data['last_name'],
                    'password': make_password(admin_data['password']),
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                    'role': 'admin',
                }
            )
            admin_objs.append(admin)

        # 6. Crear Empresas (50)
        empresas_data = []
        company_names = [
            'TechCorp Chile', 'InnovateLab', 'StartupHub', 'Digital Solutions', 'BioTech Solutions',
            'Green Energy Corp', 'Smart City Tech', 'HealthTech Innovations', 'EduTech Pro', 'FinTech Solutions',
            'AgroTech Systems', 'LogiTech Solutions', 'MediaTech Studios', 'SecurityTech Pro', 'CleanTech Energy',
            'FoodTech Innovations', 'TransportTech', 'RetailTech Solutions', 'ConstructionTech', 'TourismTech',
            'SportsTech Pro', 'MusicTech Studios', 'GamingTech Solutions', 'FashionTech', 'BeautyTech',
            'PetTech Solutions', 'HomeTech Systems', 'OfficeTech Pro', 'SchoolTech Solutions', 'HospitalTech',
            'BankTech Solutions', 'InsuranceTech', 'RealEstateTech', 'LegalTech Pro', 'MarketingTech',
            'SalesTech Solutions', 'HRTech Systems', 'AccountingTech', 'TaxTech Solutions', 'ConsultingTech',
            'ResearchTech Labs', 'DevelopmentTech', 'TestingTech Pro', 'DeploymentTech', 'MaintenanceTech',
            'SupportTech Solutions', 'TrainingTech', 'MentoringTech', 'CoachingTech', 'TherapyTech',
            'WellnessTech', 'FitnessTech', 'NutritionTech'
        ]
        
        empresa_objs = []
        for i in range(50):
            company_name = company_names[i] if i < len(company_names) else f'Empresa {i+1}'
            empresa_data = {
                'email': f'empresa{i+1}@example.com',
                'password': 'Empresa123!',
                'first_name': f'Director{i+1}',
                'last_name': f'Apellido{i+1}',
                'company_name': company_name
            }
            empresas_data.append(empresa_data)
            
            user, created = Usuario.objects.get_or_create(
                email=empresa_data['email'],
                defaults={
                    'first_name': empresa_data['first_name'],
                    'last_name': empresa_data['last_name'],
                    'password': make_password(empresa_data['password']),
                    'is_active': True,
                    'role': 'company',
                }
            )
            
            empresa, created = Empresa.objects.get_or_create(
                user=user,
                defaults={
                    'company_name': empresa_data['company_name'],
                    'industry': random.choice(['Tecnología', 'Consultoría', 'Investigación', 'Educación', 'Salud', 'Finanzas']),
                    'size': random.choice(['Pequeña', 'Mediana', 'Grande', 'Startup']),
                    'website': f'https://{empresa_data["company_name"].lower().replace(" ", "")}.com',
                    'description': f'Empresa líder en {random.choice(["tecnología", "innovación", "desarrollo", "investigación"])}',
                    'verified': True,
                }
            )
            empresa_objs.append(empresa)

        # 7. Crear Estudiantes (50)
        estudiantes_data = []
        first_names = ['Pedro', 'Laura', 'Diego', 'Camila', 'Andrés', 'Valentina', 'Sebastián', 'Isabella', 
                      'Mateo', 'Sofía', 'Alejandro', 'María', 'Luis', 'Ana', 'Paula', 'Santiago', 
                      'Valentina', 'Isabella', 'Daniel', 'Paula', 'Juan', 'Valentina', 'Isabella', 'Diego',
                      'Carlos', 'Elena', 'Roberto', 'Carmen', 'Miguel', 'Lucía', 'Fernando', 'Patricia',
                      'Ricardo', 'Monica', 'Eduardo', 'Claudia', 'Francisco', 'Verónica', 'Manuel', 'Adriana',
                      'Javier', 'Natalia', 'Alberto', 'Gabriela', 'Héctor', 'Mariana', 'Raúl', 'Diana',
                      'Oscar', 'Beatriz']
        last_names = ['López', 'Martínez', 'Herrera', 'Vargas', 'Morales', 'Rojas', 'Castro', 'Torres',
                     'Ruiz', 'Ramírez', 'Mendoza', 'Rodríguez', 'Torres', 'Gómez', 'Jiménez', 'Vargas',
                     'López', 'Morales', 'Castro', 'Jiménez', 'Pérez', 'López', 'Morales', 'Fernández',
                     'García', 'Rodríguez', 'González', 'López', 'Martínez', 'García', 'Rodríguez', 'González',
                     'Pérez', 'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'García',
                     'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'García', 'Martínez', 'López',
                     'González', 'Rodríguez']
        
        estudiante_objs = []
        for i in range(50):
            estudiante_data = {
                'email': f'estudiante{i+1}@example.com',
                'password': 'Estudiante123!',
                'first_name': first_names[i],
                'last_name': last_names[i]
            }
            estudiantes_data.append(estudiante_data)
            
            user, created = Usuario.objects.get_or_create(
                email=estudiante_data['email'],
                defaults={
                    'first_name': estudiante_data['first_name'],
                    'last_name': estudiante_data['last_name'],
                    'password': make_password(estudiante_data['password']),
                    'is_active': True,
                    'role': 'student',
                }
            )
            
            # Máximo 3 strikes por estudiante
            strikes_count = random.randint(0, 3)
            
            estudiante, created = Estudiante.objects.get_or_create(
                user=user,
                defaults={
                    'university': random.choice(['Universidad de Chile', 'Pontificia Universidad Católica', 'Universidad de Santiago', 'Universidad de Concepción']),
                    'career': random.choice(['Ingeniería Informática', 'Ingeniería Civil', 'Ciencias de la Computación', 'Ingeniería Industrial']),
                    'graduation_year': random.randint(2024, 2027),
                    'gpa': round(random.uniform(3.0, 4.0), 2),
                    'api_level': random.randint(1, 4),
                    'experience_years': random.randint(0, 3),
                    'availability': random.choice(['full-time', 'part-time', 'flexible']),
                    'rating': round(random.uniform(3.5, 5.0), 2),
                    'total_hours': random.randint(0, 200),
                    'completed_projects': random.randint(0, 5),
                    'strikes': strikes_count,
                }
            )
            estudiante_objs.append(estudiante)

        # 8. Crear Proyectos (150)
        proyectos = []
        project_types = ['Desarrollo Web', 'App Móvil', 'Análisis de Datos', 'IA', 'Blockchain', 'IoT', 
                        'Machine Learning', 'Big Data', 'Cloud Computing', 'Cybersecurity', 'DevOps',
                        'UX/UI Design', 'Game Development', 'E-commerce', 'Social Media', 'API Development']
        
        for i in range(150):
            proyecto = Proyecto.objects.create(
                company=random.choice(empresa_objs),
                status=random.choice(status_objs),
                area=random.choice(areas),
                title=f'Proyecto {i+1}: {random.choice(project_types)}',
                description=f'Descripción del proyecto {i+1}. Este proyecto busca desarrollar una solución innovadora.',
                requirements=f'Requisitos: Conocimientos en programación, trabajo en equipo, comunicación efectiva.',
                trl=random.choice(trl_levels),
                api_level=random.randint(1, 4),
                required_hours=random.randint(80, 200),
                min_api_level=random.randint(1, 3),
                max_students=random.randint(1, 3),
                duration_weeks=random.randint(8, 16),
                hours_per_week=random.randint(10, 30),
                start_date=timezone.now().date() + timedelta(days=random.randint(1, 30)),
                estimated_end_date=timezone.now().date() + timedelta(days=random.randint(60, 120)),
                application_deadline=timezone.now().date() + timedelta(days=random.randint(7, 21)),
                modality=random.choice(['remote', 'onsite', 'hybrid']),
                location='Santiago, Chile',
                difficulty=random.choice(['beginner', 'intermediate', 'advanced']),
                required_skills=f'["{random.choice(["Python", "JavaScript", "Java", "C++"])}", "{random.choice(["React", "Django", "Node.js", "Flutter"])}"]',
                preferred_skills=f'["{random.choice(["Git", "Docker", "AWS", "Azure"])}"]',
                tags=f'["{random.choice(["tecnología", "innovación", "desarrollo"])}"]',
                technologies=f'["{random.choice(["Python", "JavaScript", "Java"])}", "{random.choice(["React", "Django", "Node.js"])}"]',
                benefits=f'["{random.choice(["Certificación", "Experiencia práctica", "Networking"])}"]',
                is_paid=random.choice([True, False]),
                payment_amount=random.randint(1000, 5000) if random.choice([True, False]) else None,
                stipend_amount=random.randint(500, 2000) if random.choice([True, False]) else None,
                is_featured=random.choice([True, False]),
                is_urgent=random.choice([True, False]),
            )
            proyectos.append(proyecto)

        # 9. Crear Aplicaciones a Proyectos (máx 150)
        self.stdout.write('Creando aplicaciones a proyectos...')
        aplicaciones_creadas = 0
        for estudiante in estudiante_objs:
            if aplicaciones_creadas >= 150:
                break
            # Cada estudiante aplica a 2-3 proyectos
            for proyecto in random.sample(proyectos, k=min(random.randint(2, 3), len(proyectos))):
                if aplicaciones_creadas >= 150:
                    break
                AplicacionProyecto.objects.get_or_create(
                    proyecto=proyecto,
                    estudiante=estudiante.user,
                    defaults={
                        "cover_letter": f"Me interesa este proyecto {proyecto.title}.",
                        "estado": random.choice(["accepted", "completed", "pending", "rejected"]),
                        "compatibility_score": random.randint(60, 100),
                    }
                )
                aplicaciones_creadas += 1

        # 10. Crear Membresías en Proyectos (máx 150)
        self.stdout.write('Creando membresías en proyectos...')
        membresias_creadas = 0
        for estudiante in estudiante_objs:
            if membresias_creadas >= 150:
                break
            # Cada estudiante es miembro de 1-2 proyectos
            for proyecto in random.sample(proyectos, k=min(random.randint(1, 2), len(proyectos))):
                if membresias_creadas >= 150:
                    break
                MiembroProyecto.objects.get_or_create(
                    proyecto=proyecto,
                    usuario=estudiante.user,
                    defaults={
                        "rol": "estudiante",
                        "horas_trabajadas": random.randint(20, 120),
                        "tareas_completadas": random.randint(1, 10),
                        "evaluacion_promedio": round(random.uniform(3.5, 5.0), 2),
                        "esta_activo": True,
                        "es_verificado": True,
                    }
                )
                membresias_creadas += 1

        # 11. Historial de Estados de Proyectos (máx 150)
        self.stdout.write('Creando historial de estados de proyectos...')
        historiales_creados = 0
        for proyecto in proyectos:
            if historiales_creados >= 150:
                break
            for _ in range(random.randint(1, 2)):
                if historiales_creados >= 150:
                    break
                HistorialEstadosProyecto.objects.create(
                    project=proyecto,
                    status=random.choice(status_objs),
                    user=random.choice(admin_objs + [e.user for e in empresa_objs]),
                    comentario="Cambio de estado automático para pruebas."
                )
                historiales_creados += 1

        # 12. Skills de Estudiantes (máx 150)
        self.stdout.write('Creando skills de estudiantes...')
        skills = ["Python", "Django", "React", "SQL", "JavaScript", "Java", "C++", "Git", "Docker", "AWS", "Azure", "MongoDB", "PostgreSQL", "Node.js", "Flutter", "Trabajo en equipo", "Comunicación", "Liderazgo", "Resolución de problemas", "Creatividad"]
        skills_creados = 0
        for estudiante in estudiante_objs:
            if skills_creados >= 150:
                break
            # Cada estudiante tiene 2-3 skills
            for skill in random.sample(skills, k=random.randint(2, 3)):
                if skills_creados >= 150:
                    break
                StudentSkill.objects.get_or_create(
                    student=estudiante,
                    skill_name=skill,
                    defaults={
                        "level": random.choice(["beginner", "intermediate", "advanced", "expert"]),
                        "years_experience": random.randint(1, 5),
                        "is_verified": random.choice([True, False]),
                    }
                )
                skills_creados += 1

        # 13. Portafolio de Estudiantes (máx 150)
        self.stdout.write('Creando portafolio de estudiantes...')
        portafolios_creados = 0
        for estudiante in estudiante_objs:
            if portafolios_creados >= 150:
                break
            StudentPortfolio.objects.get_or_create(
                student=estudiante,
                title=f"Proyecto de {estudiante.user.first_name}",
                defaults={
                    "description": f"Proyecto destacado de {estudiante.user.first_name}.",
                    "project_url": f"https://github.com/{estudiante.user.first_name.lower()}",
                    "technologies": '["Python", "Django", "React"]',
                    "start_date": timezone.now().date() - timedelta(days=random.randint(30, 180)),
                    "end_date": timezone.now().date() - timedelta(days=random.randint(1, 29)),
                }
            )
            portafolios_creados += 1

        # 14. Logros de Estudiantes (máx 150)
        self.stdout.write('Creando logros de estudiantes...')
        logros_creados = 0
        for estudiante in estudiante_objs:
            if logros_creados >= 150:
                break
            StudentAchievement.objects.get_or_create(
                student=estudiante,
                title="Certificación Python",
                defaults={
                    "description": "Certificado de Python otorgado por Leanmaker.",
                    "achievement_type": "certification",
                    "issuer": "Leanmaker",
                    "issue_date": timezone.now().date() - timedelta(days=365),
                }
            )
            logros_creados += 1

        # 15. Eventos de Calendario (máx 150)
        self.stdout.write('Creando eventos de calendario...')
        eventos_creados = 0
        for empresa in empresa_objs:
            if eventos_creados >= 150:
                break
            for _ in range(2):
                if eventos_creados >= 150:
                    break
                CalendarEvent.objects.create(
                    title=f'Evento {random.randint(1,100)} de {empresa.company_name}',
                    description="Reunión de coordinación y seguimiento del proyecto",
                    event_type=random.choice(["meeting", "deadline", "reminder"]),
                    start_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                    end_date=timezone.now() + timedelta(days=random.randint(1, 30), hours=random.randint(1, 3)),
                    all_day=False,
                    location="Santiago, Chile",
                    created_by=empresa.user,
                    priority=random.choice(["low", "medium", "high"]),
                    status="scheduled",
                    is_online=random.choice([True, False]),
                    meeting_url="https://meet.google.com/abc-defg-hij" if random.choice([True, False]) else None,
                    color="#1976d2",
                    reminder_minutes=15,
                )
                eventos_creados += 1

        # 16. Reportes (máx 150)
        self.stdout.write('Creando reportes...')
        reportes_creados = 0
        for empresa in empresa_objs:
            if reportes_creados >= 150:
                break
            Report.objects.get_or_create(
                generated_by=empresa.user,
                title=f"Reporte de actividad - {empresa.company_name}",
                defaults={
                    "description": "Reporte generado automáticamente para pruebas.",
                    "report_type": "activity",
                    "status": "completed",
                }
            )
            reportes_creados += 1

        # 17. Aplicaciones (Aplicacion) y Asignaciones (máx 150)
        self.stdout.write('Creando aplicaciones y asignaciones...')
        asignaciones_creadas = 0
        for estudiante in estudiante_objs:
            if asignaciones_creadas >= 150:
                break
            for _ in range(1):  # Solo 1 asignación por estudiante
                if asignaciones_creadas >= 150:
                    break
                proyecto = random.choice(proyectos)
                application, created = Aplicacion.objects.get_or_create(
                    project=proyecto,
                    student=estudiante,
                    defaults={
                        "cover_letter": "Aplicación automática para asignación.",
                        "status": "accepted",
                        "compatibility_score": random.randint(60, 100),
                    }
                )
                
                asignacion, created = Asignacion.objects.get_or_create(
                    application=application,
                    defaults={
                        "fecha_inicio": timezone.now().date() - timedelta(days=random.randint(30, 60)),
                        "estado": "en curso",
                    }
                )
                
                assignment = Assignment.objects.create(
                    assigned_to=estudiante.user,
                    application=application,
                    assigned_by=random.choice(admin_objs + [e.user for e in empresa_objs]),
                    title=f"Tarea {random.randint(1,100)} para {estudiante.user.full_name}",
                    description="Descripción de la tarea asignada automáticamente.",
                    due_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                    status=random.choice(["pending", "completed"]),
                )
                
                WorkHour.objects.create(
                    student=estudiante,
                    project=proyecto,
                    company=proyecto.company,
                    assignment=asignacion,
                    date=timezone.now().date() - timedelta(days=random.randint(1, 30)),
                    hours_worked=random.randint(1, 8),
                    description="Horas trabajadas en el proyecto.",
                )
                asignaciones_creadas += 1

        # 18. Ratings (máx 150)
        self.stdout.write('Creando ratings...')
        ratings_creados = 0
        for estudiante in estudiante_objs:
            if ratings_creados >= 150:
                break
            Rating.objects.get_or_create(
                user=estudiante.user,
                project=random.choice(proyectos),
                defaults={
                    "rating": random.randint(3, 5),
                    "comment": "Calificación generada automáticamente.",
                }
            )
            ratings_creados += 1

        # 19. DisciplinaryRecord (máx 150)
        self.stdout.write('Creando registros disciplinarios...')
        registros_creados = 0
        for estudiante in estudiante_objs:
            if registros_creados >= 150:
                break
            # Solo crear registros para estudiantes con strikes
            if estudiante.strikes > 0:
                DisciplinaryRecord.objects.get_or_create(
                    student=estudiante,
                    company=random.choice(empresa_objs),
                    incident_date=timezone.now().date() - timedelta(days=random.randint(1, 60)),
                    description="Incumplimiento de normas. Registro disciplinario de ejemplo.",
                    action_taken="Advertencia escrita.",
                    severity=random.choice(["low", "medium", "high", "critical"]),
                    recorded_by=random.choice(admin_objs + [e.user for e in empresa_objs]),
                )
                registros_creados += 1

        # 20. Entrevistas (máx 150)
        self.stdout.write('Creando entrevistas...')
        entrevistas_creadas = 0
        for estudiante in estudiante_objs:
            if entrevistas_creadas >= 150:
                break
            proyecto = random.choice(proyectos)
            application, created = AplicacionProyecto.objects.get_or_create(
                proyecto=proyecto,
                estudiante=estudiante.user,
                defaults={
                    "cover_letter": "Aplicación para entrevista.",
                    "estado": "pending",
                    "compatibility_score": random.randint(60, 100),
                }
            )
            
            Interview.objects.get_or_create(
                application=application,
                interviewer=random.choice([e.user for e in empresa_objs]),
                defaults={
                    "interview_date": timezone.now() + timedelta(days=random.randint(1, 30)),
                    "status": random.choice(["scheduled", "completed", "cancelled"]),
                    "notes": "Entrevista generada automáticamente.",
                    "duration_minutes": random.randint(30, 120),
                }
            )
            entrevistas_creadas += 1

        # 21. Evaluaciones (máx 150)
        self.stdout.write('Creando evaluaciones...')
        evaluaciones_creadas = 0
        for estudiante in estudiante_objs:
            if evaluaciones_creadas >= 150:
                break
            for proyecto in random.sample(proyectos, k=min(1, len(proyectos))):  # Solo 1 evaluación por estudiante
                if evaluaciones_creadas >= 150:
                    break
                Evaluation.objects.get_or_create(
                    project=proyecto,
                    student=estudiante.user,
                    evaluator=random.choice([e.user for e in empresa_objs]),
                    category=random.choice(eval_categories),
                    defaults={
                        "score": random.randint(60, 100),
                        "comments": "Evaluación generada automáticamente.",
                    }
                )
                evaluaciones_creadas += 1

        # 22. Strikes (máximo 3 por estudiante, máx 150 total)
        self.stdout.write('Creando strikes...')
        strikes_creados = 0
        for estudiante in estudiante_objs:
            if strikes_creados >= 150:
                break
            # Solo crear strikes si el estudiante tiene menos de 3
            if estudiante.strikes < 3:
                strikes_to_add = min(random.randint(0, 3 - estudiante.strikes), 150 - strikes_creados)
                for _ in range(strikes_to_add):
                    if strikes_creados >= 150:
                        break
                    proyecto = random.choice(proyectos)
                    Strike.objects.get_or_create(
                        student=estudiante,
                        project=proyecto,
                        company=proyecto.company,
                        defaults={
                            "reason": "Incumplimiento de plazos. Strike generado automáticamente.",
                            "issued_by": random.choice(admin_objs + [e.user for e in empresa_objs]),
                            "issued_at": timezone.now() - timedelta(days=random.randint(1, 30)),
                            "severity": random.choice(["low", "medium", "high"]),
                        }
                    )
                    strikes_creados += 1

        # 23. Notificaciones (máx 150)
        self.stdout.write('Creando notificaciones...')
        notificaciones_creadas = 0
        for estudiante in estudiante_objs:
            if notificaciones_creadas >= 150:
                break
            Notification.objects.create(
                user=estudiante.user,
                title="Nueva asignación disponible",
                message="Se ha asignado una nueva tarea para ti.",
                type="info",
                read=random.choice([True, False]),
                created_at=timezone.now() - timedelta(days=random.randint(1, 30)),
            )
            notificaciones_creadas += 1

        self.stdout.write(self.style.SUCCESS('--- Datos generados exitosamente ---'))
        self.stdout.write(f'✅ 2 Administradores creados')
        self.stdout.write(f'✅ {len(empresa_objs)} Empresas creadas')
        self.stdout.write(f'✅ {len(estudiante_objs)} Estudiantes creados')
        self.stdout.write(f'✅ {len(proyectos)} Proyectos creados')
        self.stdout.write(f'✅ Máximo 150 registros por tabla')
        self.stdout.write(f'✅ Máximo 3 strikes por estudiante respetado')
        self.stdout.write(f'✅ Todas las relaciones establecidas correctamente')
        
        self.stdout.write(self.style.SUCCESS('Credenciales de acceso:'))
        for admin_data in admins_data:
            self.stdout.write(f"Admin: {admin_data['email']} / {admin_data['password']}")
        self.stdout.write(f"Empresas: empresa1@example.com a empresa50@example.com / Empresa123!")
        self.stdout.write(f"Estudiantes: estudiante1@example.com a estudiante50@example.com / Estudiante123!") 