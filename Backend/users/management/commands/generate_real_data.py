from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Usuario
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto, MiembroProyecto, AplicacionProyecto
from calendar_events.models import CalendarEvent
from evaluations.models import Evaluation, EvaluationCategory
from strikes.models import Strike
from notifications.models import Notification
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus
from areas.models import Area
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Genera los 32 usuarios iniciales y datos históricos realistas para dashboards.'

    def handle(self, *args, **options):
        User = get_user_model()
        self.stdout.write(self.style.SUCCESS('--- Generando datos realistas para Leanmaker ---'))

        # 0. Poblar tablas de referencia primero
        self.stdout.write('Poblando tablas de referencia...')
        
        # Poblar TRL Levels
        trl_data = [
            {"level": 1, "name": "Principios básicos observados", "description": "Se han identificado y reportado los principios básicos de la tecnología.", "min_hours": 10},
            {"level": 2, "name": "Concepto de tecnología formulado", "description": "Se han formulado las aplicaciones potenciales de la tecnología.", "min_hours": 20},
            {"level": 3, "name": "Prueba experimental de concepto", "description": "Se ha validado experimentalmente el concepto de la tecnología.", "min_hours": 30},
            {"level": 4, "name": "Validación de componentes en laboratorio", "description": "Se han validado los componentes tecnológicos en un entorno de laboratorio.", "min_hours": 40},
            {"level": 5, "name": "Validación de componentes en entorno relevante", "description": "Los componentes han sido validados en un entorno relevante para su aplicación.", "min_hours": 50},
            {"level": 6, "name": "Modelo de sistema en entorno relevante", "description": "El sistema o subsistema ha sido demostrado en un entorno relevante.", "min_hours": 60},
            {"level": 7, "name": "Demostración de sistema en entorno real", "description": "El sistema prototipo ha sido demostrado en un entorno real.", "min_hours": 70},
            {"level": 8, "name": "Sistema completo y calificado", "description": "El sistema real ha sido completado y calificado a través de pruebas y demostraciones.", "min_hours": 80},
            {"level": 9, "name": "Sistema probado en operación real", "description": "El sistema ha sido probado con éxito en una operación real.", "min_hours": 90},
        ]
        
        for trl in trl_data:
            TRLLevel.objects.get_or_create(
                level=trl["level"],
                defaults={
                    "name": trl["name"],
                    "description": trl["description"],
                    "min_hours": trl["min_hours"],
                    "is_active": True,
                }
            )

        # Poblar Project Status
        status_data = [
            {"name": "Abierto", "description": "Proyecto abierto para aplicaciones", "color": "#28a745"},
            {"name": "En Progreso", "description": "Proyecto en desarrollo", "color": "#007bff"},
            {"name": "Completado", "description": "Proyecto finalizado exitosamente", "color": "#6c757d"},
            {"name": "Cancelado", "description": "Proyecto cancelado", "color": "#dc3545"},
        ]
        
        for status in status_data:
            ProjectStatus.objects.get_or_create(
                name=status["name"],
                defaults={
                    "description": status["description"],
                    "color": status["color"],
                    "is_active": True,
                }
            )

        # Poblar Areas
        areas_data = [
            {"name": "Tecnología", "description": "Proyectos relacionados con desarrollo de software, IA, etc."},
            {"name": "Salud", "description": "Proyectos en el área de la salud y medicina"},
            {"name": "Educación", "description": "Proyectos educativos y de formación"},
            {"name": "Finanzas", "description": "Proyectos financieros y de inversión"},
            {"name": "Medio Ambiente", "description": "Proyectos de sostenibilidad y ecología"},
            {"name": "Logística", "description": "Proyectos de transporte y distribución"},
            {"name": "Construcción", "description": "Proyectos de construcción e infraestructura"},
            {"name": "Agricultura", "description": "Proyectos agrícolas y agroindustriales"},
        ]
        
        for area in areas_data:
            Area.objects.get_or_create(
                name=area["name"],
                defaults={
                    "description": area["description"],
                    "is_active": True,
                }
            )

        # Poblar Evaluation Categories
        eval_categories_data = [
            {"name": "Habilidades Técnicas", "description": "Evaluación de competencias técnicas y conocimientos específicos"},
            {"name": "Trabajo en Equipo", "description": "Evaluación de habilidades de colaboración y comunicación"},
            {"name": "Liderazgo", "description": "Evaluación de capacidades de liderazgo y gestión"},
            {"name": "Innovación", "description": "Evaluación de creatividad y pensamiento innovador"},
            {"name": "Calidad del Trabajo", "description": "Evaluación de la calidad y precisión del trabajo entregado"},
        ]
        
        for category in eval_categories_data:
            EvaluationCategory.objects.get_or_create(
                name=category["name"],
                defaults={
                    "description": category["description"],
                    "is_active": True,
                }
            )

        # 1. Datos base
        admins = [
            {'email': 'admin1@leanmaker.com', 'password': 'Admin123!', 'first_name': 'Laura', 'last_name': 'Martínez'},
            {'email': 'admin2@leanmaker.com', 'password': 'Admin123!', 'first_name': 'Carlos', 'last_name': 'Ramírez'},
        ]
        empresas = [
            {'nombre': 'InovaTech S.A.', 'email': 'contacto@inovatech.com'},
            {'nombre': 'AgroSoluciones', 'email': 'contacto@agrosoluciones.com'},
            {'nombre': 'EcoLogística', 'email': 'contacto@ecologistica.com'},
            {'nombre': 'SaludVital', 'email': 'contacto@saludvital.com'},
            {'nombre': 'ConstruRed', 'email': 'contacto@construred.com'},
            {'nombre': 'FinanPlus', 'email': 'contacto@finanplus.com'},
            {'nombre': 'EducaFuturo', 'email': 'contacto@educafuturo.com'},
            {'nombre': 'MoviTrans', 'email': 'contacto@movitrans.com'},
            {'nombre': 'BioEnergía', 'email': 'contacto@bioenergia.com'},
            {'nombre': 'SegurMax', 'email': 'contacto@segurmax.com'},
            {'nombre': 'RedComercial', 'email': 'contacto@redcomercial.com'},
            {'nombre': 'AgroMarket', 'email': 'contacto@agromarket.com'},
            {'nombre': 'TecnoVision', 'email': 'contacto@tecnovision.com'},
            {'nombre': 'Medilab', 'email': 'contacto@medilab.com'},
            {'nombre': 'Urbaniza', 'email': 'contacto@urbaniza.com'},
        ]
        estudiantes = [
            {'nombre': 'Juan', 'apellido': 'Pérez', 'email': 'juan.perez@uchile.cl'},
            {'nombre': 'Ana', 'apellido': 'Gómez', 'email': 'ana.gomez@uc.cl'},
            {'nombre': 'Luis', 'apellido': 'Torres', 'email': 'luis.torres@udec.cl'},
            {'nombre': 'María', 'apellido': 'Rodríguez', 'email': 'maria.rodriguez@usm.cl'},
            {'nombre': 'Pedro', 'apellido': 'Sánchez', 'email': 'pedro.sanchez@usach.cl'},
            {'nombre': 'Sofía', 'apellido': 'Ramírez', 'email': 'sofia.ramirez@uach.cl'},
            {'nombre': 'Diego', 'apellido': 'Fernández', 'email': 'diego.fernandez@uv.cl'},
            {'nombre': 'Valentina', 'apellido': 'López', 'email': 'valentina.lopez@ufro.cl'},
            {'nombre': 'Daniel', 'apellido': 'Castro', 'email': 'daniel.castro@utalca.cl'},
            {'nombre': 'Camila', 'apellido': 'Herrera', 'email': 'camila.herrera@inacap.cl'},
            {'nombre': 'Mateo', 'apellido': 'Ruiz', 'email': 'mateo.ruiz@uchile.cl'},
            {'nombre': 'Isabella', 'apellido': 'Morales', 'email': 'isabella.morales@uc.cl'},
            {'nombre': 'Santiago', 'apellido': 'Vargas', 'email': 'santiago.vargas@udec.cl'},
            {'nombre': 'Paula', 'apellido': 'Jiménez', 'email': 'paula.jimenez@usm.cl'},
            {'nombre': 'Alejandro', 'apellido': 'Mendoza', 'email': 'alejandro.mendoza@usach.cl'},
        ]
        dominio_universidad = {
            'uchile.cl': 'Universidad de Chile',
            'uc.cl': 'Pontificia Universidad Católica de Chile',
            'udec.cl': 'Universidad de Concepción',
            'usm.cl': 'Universidad Técnica Federico Santa María',
            'usach.cl': 'Universidad de Santiago de Chile',
            'uach.cl': 'Universidad Austral de Chile',
            'uv.cl': 'Universidad de Valparaíso',
            'ufro.cl': 'Universidad de La Frontera',
            'utalca.cl': 'Universidad de Talca',
            'inacap.cl': 'INACAP',
        }

        # 2. Crear administradores
        admin_objs = []
        for adm in admins:
            user, created = User.objects.get_or_create(email=adm['email'], defaults={
                'first_name': adm['first_name'], 'last_name': adm['last_name'], 'role': 'admin', 'is_staff': True, 'is_superuser': False, 'is_active': True
            })
            user.set_password(adm['password'])
            user.save()
            admin_objs.append(user)

        # 3. Crear empresas
        empresa_objs = []
        for i, emp in enumerate(empresas, 1):
            user, created = User.objects.get_or_create(email=emp['email'], defaults={
                'first_name': emp['nombre'], 'last_name': '', 'role': 'company', 'is_active': True
            })
            user.set_password('Empresa123!')
            user.save()
            empresa, _ = Empresa.objects.get_or_create(user=user, defaults={
                'company_name': emp['nombre'],
                'rut': f'76.123.45{i}-{i}',
                'business_name': emp['nombre'],
                'company_address': f'Calle Falsa {i*10}, Santiago',
                'company_phone': f'91234567{i}',
                'company_email': emp['email'],
                'rating': round(random.uniform(3.5, 5.0), 2),
                'total_hours_offered': random.randint(100, 500),
                'status': 'active',
                'country': 'Chile',
                'city': 'Santiago',
                'size': random.choice(['Pequeña', 'Mediana', 'Grande', 'Startup']),
                'industry': random.choice(['Tecnología', 'Educación', 'Salud', 'Finanzas', 'Retail']),
                'website': f'https://{emp["email"].split("@")[1].replace(".com","")}.cl',
            })
            empresa_objs.append(empresa)

        # 4. Crear estudiantes
        estudiante_objs = []
        for est in estudiantes:
            dominio = est['email'].split('@')[1]
            universidad = dominio_universidad.get(dominio, 'Universidad Desconocida')
            user, created = User.objects.get_or_create(email=est['email'], defaults={
                'first_name': est['nombre'], 'last_name': est['apellido'], 'role': 'student', 'is_active': True
            })
            user.set_password('Estudiante123!')
            user.save()
            estudiante, _ = Estudiante.objects.get_or_create(user=user, defaults={
                'university': universidad,
                'career': random.choice(['Ingeniería', 'Administración', 'Salud', 'Educación', 'Tecnología']),
                'gpa': round(random.uniform(4.5, 6.9), 2),
                'strikes': random.randint(0, 2),
                'total_hours': random.randint(60, 200),
                'rating': round(random.uniform(3.5, 5.0), 2),
                'status': 'approved',
                'completed_projects': random.randint(1, 5),
                'experience_years': random.randint(0, 3),
                'semester': random.randint(2, 10),
                'graduation_year': random.choice([2024, 2025, 2026]),
                'availability': random.choice(['full-time', 'part-time', 'flexible']),
                'location': 'Santiago',
            })
            estudiante_objs.append(estudiante)

        # 5. Crear proyectos para empresas
        proyectos = []
        # Obtener IDs válidos de las tablas de referencia
        trl_ids = list(TRLLevel.objects.values_list('id', flat=True))
        status_ids = list(ProjectStatus.objects.values_list('id', flat=True))
        area_ids = list(Area.objects.values_list('id', flat=True))
        
        for empresa in empresa_objs:
            for _ in range(random.randint(1, 2)):
                proyecto = Proyecto.objects.create(
                    company=empresa,
                    title=f"Proyecto de {empresa.company_name} #{random.randint(1,100)}",
                    description=f"Proyecto realista generado para {empresa.company_name}.",
                    requirements="Requisitos del proyecto.",
                    status_id=random.choice(status_ids),
                    area_id=random.choice(area_ids),
                    trl_id=random.choice(trl_ids),
                    required_hours=random.randint(80, 200),
                    min_api_level=1,
                    max_students=random.randint(1, 3),
                    current_students=0,
                    duration_weeks=random.randint(8, 20),
                    hours_per_week=random.randint(10, 30),
                    start_date=timezone.now().date() - timezone.timedelta(days=random.randint(30, 180)),
                    estimated_end_date=timezone.now().date() + timezone.timedelta(days=random.randint(30, 180)),
                    modality=random.choice(['remote', 'onsite', 'hybrid']),
                    location='Santiago',
                    difficulty=random.choice(['beginner', 'intermediate', 'advanced']),
                    required_skills='["Trabajo en equipo", "Comunicación", "Python"]',
                    preferred_skills='["Liderazgo", "SQL"]',
                    tags='["innovación", "tecnología"]',
                    technologies='["Python", "Django", "React"]',
                    benefits='["Bono", "Certificado"]',
                    is_paid=random.choice([True, False]),
                    payment_amount=random.randint(0, 500000),
                    payment_currency='CLP',
                    stipend_amount=random.randint(0, 100000),
                    stipend_currency='CLP',
                    applications_count=0,
                    views_count=random.randint(10, 100),
                    is_featured=random.choice([True, False]),
                    is_urgent=random.choice([True, False]),
                    published_at=timezone.now(),
                )
                proyectos.append(proyecto)

        # 6. Asignar estudiantes a proyectos y empresas
        for estudiante in estudiante_objs:
            proyectos_asignados = random.sample(proyectos, k=min(random.randint(1, 2), len(proyectos)))
            for proyecto in proyectos_asignados:
                AplicacionProyecto.objects.get_or_create(
                    proyecto=proyecto,
                    estudiante=estudiante.user,
                    defaults={
                        'cover_letter': 'Me interesa este proyecto.',
                        'estado': random.choice(['accepted', 'completed', 'pending']),
                        'compatibility_score': random.randint(60, 100),
                    }
                )
                MiembroProyecto.objects.get_or_create(
                    proyecto=proyecto,
                    usuario=estudiante.user,
                    defaults={
                        'rol': 'estudiante',
                        'horas_trabajadas': random.randint(20, 120),
                        'tareas_completadas': random.randint(1, 10),
                        'evaluacion_promedio': round(random.uniform(3.5, 5.0), 2),
                        'esta_activo': True,
                        'es_verificado': True,
                    }
                )

        # 7. Crear evaluaciones y strikes
        # Obtener categorías de evaluación
        eval_categories = list(EvaluationCategory.objects.all())
        
        for estudiante in estudiante_objs:
            for _ in range(random.randint(1, 2)):
                Evaluation.objects.create(
                    project=random.choice(proyectos),
                    student=estudiante.user,
                    evaluator=random.choice(empresa_objs).user,
                    category=random.choice(eval_categories),
                    score=round(random.uniform(60.0, 100.0), 1),
                    comments='Evaluación generada automáticamente.',
                    evaluation_date=timezone.now().date() - timezone.timedelta(days=random.randint(1, 60)),
                    company=random.choice(empresa_objs),
                    evaluator_role='Supervisor',
                    status='completed',
                    type='final',
                    overall_rating=round(random.uniform(60.0, 100.0), 1),
                    strengths='Trabajo en equipo, Comunicación efectiva, Puntualidad',
                    areas_for_improvement='Gestión del tiempo, Documentación técnica',
                    project_duration=f'{random.randint(2, 6)} meses',
                    technologies='Python, Django, React, SQL',
                    deliverables='Aplicación web funcional, Documentación técnica',
                )
            
            # Crear strikes para estudiantes que los tengan
            for _ in range(estudiante.strikes):
                Strike.objects.create(
                    student=estudiante,
                    project=random.choice(proyectos),
                    company=random.choice(empresa_objs),
                    reason='No entregar proyecto a tiempo',
                    description='El estudiante no cumplió con los plazos establecidos para la entrega del proyecto.',
                    severity=random.choice(['low', 'medium', 'high']),
                    issued_by=random.choice(empresa_objs).user,
                    expires_at=timezone.now() + timezone.timedelta(days=random.randint(30, 90)),
                    is_active=True,
                )

        # 8. Crear eventos de calendario para empresas
        for empresa in empresa_objs:
            for _ in range(2):
                CalendarEvent.objects.create(
                    title=f'Evento {random.randint(1,100)} de {empresa.company_name}',
                    description='Reunión de coordinación y seguimiento del proyecto',
                    event_type=random.choice(['meeting', 'deadline', 'reminder']),
                    start_date=timezone.now() + timezone.timedelta(days=random.randint(1, 30)),
                    end_date=timezone.now() + timezone.timedelta(days=random.randint(1, 30), hours=random.randint(1, 3)),
                    all_day=False,
                    location='Santiago, Chile',
                    created_by=empresa.user,
                    priority=random.choice(['low', 'medium', 'high']),
                    status='scheduled',
                    is_online=random.choice([True, False]),
                    meeting_url='https://meet.google.com/abc-defg-hij' if random.choice([True, False]) else None,
                    color='#1976d2',
                    reminder_minutes=15,
                )

        # 9. Crear notificaciones para estudiantes
        for estudiante in estudiante_objs:
            Notification.objects.create(
                user=estudiante.user,
                title='Nueva aplicación aceptada',
                message='Tu aplicación al proyecto ha sido aceptada. ¡Felicidades!',
                type='success',
                read=False,
                priority='normal',
            )

        self.stdout.write(self.style.SUCCESS('--- Datos generados exitosamente ---'))
        self.stdout.write(self.style.SUCCESS('Credenciales de acceso:'))
        for adm in admins:
            self.stdout.write(f"Admin: {adm['email']} / {adm['password']}")
        for i, emp in enumerate(empresas, 1):
            self.stdout.write(f"Empresa {i}: {emp['email']} / Empresa123!")
        for i, est in enumerate(estudiantes, 1):
            self.stdout.write(f"Estudiante {i}: {est['email']} / Estudiante123!") 