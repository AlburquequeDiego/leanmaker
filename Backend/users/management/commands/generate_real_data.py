from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Usuario
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto, MiembroProyecto, AplicacionProyecto
from calendar_events.models import CalendarEvent
from evaluations.models import Evaluation
from strikes.models import Strike
from notifications.models import Notification
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Genera datos realistas para dashboards: admins, empresas, estudiantes, proyectos, aplicaciones, evaluaciones, strikes, eventos y notificaciones.'

    def handle(self, *args, **options):
        User = get_user_model()
        self.stdout.write(self.style.SUCCESS('--- Generando datos realistas para Leanmaker ---'))

        # 1. Crear administradores
        admins = [
            {'email': 'admin1@leanmaker.cl', 'password': 'Admin123!', 'first_name': 'Ana', 'last_name': 'García'},
            {'email': 'admin2@leanmaker.cl', 'password': 'Admin123!', 'first_name': 'Luis', 'last_name': 'Pérez'},
        ]
        admin_objs = []
        for adm in admins:
            user, created = User.objects.get_or_create(email=adm['email'], defaults={
                'first_name': adm['first_name'], 'last_name': adm['last_name'], 'role': 'admin', 'is_staff': True, 'is_superuser': True
            })
            user.set_password(adm['password'])
            user.save()
            admin_objs.append(user)

        # 2. Crear empresas
        empresas = []
        for i in range(1, 6):
            email = f'empresa{i}@leanmaker.cl'
            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': f'Empresa{i}', 'last_name': 'SpA', 'role': 'company', 'is_active': True
            })
            user.set_password('Empresa123!')
            user.save()
            empresa, _ = Empresa.objects.get_or_create(user=user, defaults={
                'company_name': f'Empresa {i} SpA',
                'rut': f'76.123.45{i}-{i}',
                'business_name': f'Empresa {i} SpA',
                'company_address': f'Calle Falsa {i*10}, Santiago',
                'company_phone': f'91234567{i}',
                'company_email': email,
                'rating': round(random.uniform(3.5, 5.0), 1),
                'total_hours_offered': random.randint(100, 500),
                'status': 'active',
                'country': 'Chile',
                'city': 'Santiago',
                'size': random.choice(['Pequeña', 'Mediana', 'Grande', 'Startup']),
                'industry': random.choice(['Tecnología', 'Educación', 'Salud', 'Finanzas', 'Retail']),
                'website': f'https://empresa{i}.cl',
            })
            empresas.append((user, empresa))

        # 3. Crear estudiantes
        instituciones = [
            ('INACAP', 'inacap.cl'),
            ('UChile', 'uchile.cl'),
            ('PUC', 'uc.cl'),
            ('USM', 'usm.cl'),
            ('UdeC', 'udec.cl'),
        ]
        estudiantes = []
        for i in range(1, 21):
            inst, dom = random.choice(instituciones)
            email = f'estudiante{i}@{dom}'
            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': f'Estudiante{i}', 'last_name': f'Apellido{i}', 'role': 'student', 'is_active': True
            })
            user.set_password('Estudiante123!')
            user.save()
            estudiante, _ = Estudiante.objects.get_or_create(user=user, defaults={
                'university': inst,
                'career': f'Carrera {random.randint(1,5)}',
                'gpa': round(random.uniform(3.5, 5.0), 2),
                'strikes': random.randint(0, 2),
                'total_hours': random.randint(50, 200),
                'rating': round(random.uniform(3.5, 5.0), 1)
            })
            estudiantes.append((user, estudiante))

        # 4. Crear proyectos
        proyectos = []
        for i in range(1, 21):
            empresa = random.choice(empresas)[1]
            status = random.choice(['active', 'completed', 'published'])
            proyecto, _ = Proyecto.objects.get_or_create(
                nombre=f'Proyecto {i} - {empresa.company_name}',
                empresa=empresa,
                defaults={
                    'descripcion': f'Descripción del proyecto {i}',
                    'status_id': 1 if status == 'active' else 2 if status == 'completed' else 3,
                    'fecha_inicio': timezone.now() - timezone.timedelta(days=random.randint(10, 100)),
                    'fecha_fin': timezone.now() + timezone.timedelta(days=random.randint(10, 100)),
                }
            )
            proyectos.append(proyecto)

        # 5. Crear aplicaciones y miembros de proyecto
        for estudiante_user, estudiante in estudiantes:
            # Aplica a 3 proyectos aleatorios
            applied = random.sample(proyectos, 3)
            for proyecto in applied:
                status = random.choice(['pending', 'accepted'])
                AplicacionProyecto.objects.get_or_create(
                    estudiante=estudiante,
                    proyecto=proyecto,
                    defaults={'status': status}
                )
                # Si aceptado, es miembro
                if status == 'accepted':
                    MiembroProyecto.objects.get_or_create(
                        estudiante=estudiante,
                        proyecto=proyecto
                    )

        # 6. Crear evaluaciones
        for proyecto in proyectos:
            for _ in range(random.randint(1, 3)):
                Evaluation.objects.get_or_create(
                    proyecto=proyecto,
                    evaluador=random.choice(empresas)[0],
                    evaluado=random.choice(estudiantes)[0],
                    defaults={
                        'nota': round(random.uniform(4.0, 7.0), 1),
                        'comentario': 'Buen desempeño',
                        'fecha': timezone.now() - timezone.timedelta(days=random.randint(1, 30))
                    }
                )

        # 7. Crear strikes
        for estudiante_user, estudiante in estudiantes:
            for _ in range(estudiante.strikes):
                Strike.objects.get_or_create(
                    estudiante=estudiante,
                    motivo='No entregar proyecto a tiempo',
                    fecha=timezone.now() - timezone.timedelta(days=random.randint(1, 60))
                )

        # 8. Crear eventos de calendario
        for empresa_user, empresa in empresas:
            for _ in range(2):
                CalendarEvent.objects.get_or_create(
                    empresa=empresa,
                    titulo=f'Evento {random.randint(1,100)} de {empresa.company_name}',
                    descripcion='Reunión de coordinación',
                    fecha_inicio=timezone.now() + timezone.timedelta(days=random.randint(1, 30)),
                    fecha_fin=timezone.now() + timezone.timedelta(days=random.randint(31, 60)),
                )

        # 9. Crear notificaciones
        for estudiante_user, estudiante in estudiantes:
            Notification.objects.get_or_create(
                usuario=estudiante_user,
                mensaje='Tienes una nueva aplicación aceptada',
                tipo='success',
                leida=False
            )

        self.stdout.write(self.style.SUCCESS('--- Datos generados exitosamente ---'))
        self.stdout.write(self.style.SUCCESS('Credenciales de acceso:'))
        for adm in admins:
            self.stdout.write(f"Admin: {adm['email']} / {adm['password']}")
        for i, (user, empresa) in enumerate(empresas, 1):
            self.stdout.write(f"Empresa {i}: {user.email} / Empresa123!")
        for i, (user, estudiante) in enumerate(estudiantes, 1):
            self.stdout.write(f"Estudiante {i}: {user.email} / Estudiante123!") 