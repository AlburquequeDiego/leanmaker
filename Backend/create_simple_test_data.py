#!/usr/bin/env python
"""
Script simple para crear datos de prueba con estudiantes que tengan historial real
de proyectos y horas trabajadas según la escala TRL.
"""

import os
import django
from datetime import datetime, timedelta
import random
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto, AplicacionProyecto
from work_hours.models import WorkHour
from applications.models import Aplicacion
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus
from notifications.models import Notification

User = get_user_model()

def crear_datos_simples():
    """Crear datos simples de prueba"""
    print("=== Creando datos simples de prueba ===")
    
    # 1. Crear áreas básicas
    print("1. Creando áreas...")
    area_web, _ = Area.objects.get_or_create(
        name='Desarrollo Web',
        defaults={'description': 'Proyectos de desarrollo web'}
    )
    area_ia, _ = Area.objects.get_or_create(
        name='Inteligencia Artificial',
        defaults={'description': 'Proyectos de IA y ML'}
    )
    
    # 2. Crear niveles TRL
    print("2. Creando niveles TRL...")
    trl_levels = {}
    for i in range(1, 10):
        trl, _ = TRLLevel.objects.get_or_create(
            level=i,
            defaults={
                'name': f'TRL {i}',
                'description': f'Descripción del nivel TRL {i}'
            }
        )
        trl_levels[i] = trl
    
    # 3. Crear estados de proyecto
    print("3. Creando estados de proyecto...")
    estado_completado, _ = ProjectStatus.objects.get_or_create(
        name='completed',
        defaults={'description': 'Proyecto completado'}
    )
    
    # 4. Crear una empresa
    print("4. Creando empresa...")
    user_empresa, created = User.objects.get_or_create(
        email='techcorp@test.com',
        defaults={
            'first_name': 'TechCorp',
            'role': 'company',
            'is_verified': True,
            'is_active': True
        }
    )
    if created:
        user_empresa.set_password('testpass123')
        user_empresa.save()
    
    empresa, _ = Empresa.objects.get_or_create(
        user=user_empresa,
        defaults={
            'company_name': 'TechCorp Solutions',
            'description': 'Empresa de desarrollo de software',
            'industry': 'Tecnología',
            'size': 'medium'
        }
    )
    
    # 5. Crear estudiantes con diferentes niveles API
    print("5. Creando estudiantes...")
    estudiantes_data = [
        {
            'email': 'maria.test@estudiante.com',
            'first_name': 'María',
            'last_name': 'García',
            'career': 'Ingeniería en Sistemas',
            'api_level': 3,
            'completed_projects': 2,
            'skills': ['Python', 'Django', 'React', 'JavaScript'],
            'languages': ['Español', 'Inglés']
        },
        {
            'email': 'carlos.test@estudiante.com',
            'first_name': 'Carlos',
            'last_name': 'Rodríguez',
            'career': 'Ingeniería en Software',
            'api_level': 2,
            'completed_projects': 1,
            'skills': ['Java', 'Spring Boot', 'MySQL'],
            'languages': ['Español', 'Inglés']
        },
        {
            'email': 'ana.test@estudiante.com',
            'first_name': 'Ana',
            'last_name': 'Martínez',
            'career': 'Ingeniería en Computación',
            'api_level': 4,
            'completed_projects': 3,
            'skills': ['Python', 'Machine Learning', 'TensorFlow', 'Docker'],
            'languages': ['Español', 'Inglés', 'Francés']
        }
    ]
    
    estudiantes_creados = []
    for data in estudiantes_data:
        # Crear usuario
        user, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'role': 'student',
                'is_verified': True,
                'is_active': True
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
        
        # Crear estudiante
        estudiante, created = Estudiante.objects.get_or_create(
            user=user,
            defaults={
                'career': data['career'],
                'api_level': data['api_level'],
                'completed_projects': data['completed_projects'],
                'status': 'approved',
                'trl_level': data['api_level'] * 2,
                'skills': json.dumps(data['skills']),
                'languages': json.dumps(data['languages']),
                'availability': 'flexible',
                'location': 'México'
            }
        )
        
        if created:
            print(f"   - Estudiante creado: {estudiante.user.full_name} (API {estudiante.api_level})")
        
        estudiantes_creados.append(estudiante)
    
    # 6. Crear proyectos según el nivel API de los estudiantes
    print("6. Creando proyectos...")
    proyectos_creados = []
    
    for i, estudiante in enumerate(estudiantes_creados):
        # Crear proyecto según el nivel API del estudiante
        trl_proyecto = estudiante.api_level * 2  # TRL basado en API level
        horas_proyecto = estudiante.api_level * 20  # Horas según API level
        
        proyecto = Proyecto.objects.create(
            company=empresa,
            status=estado_completado,
            area=area_web if i % 2 == 0 else area_ia,
            title=f"Proyecto {i+1} - {estudiante.user.first_name}",
            description=f"Proyecto completado por {estudiante.user.full_name}",
            requirements=f"Requerimientos para nivel API {estudiante.api_level}",
            trl=trl_levels[trl_proyecto],
            api_level=estudiante.api_level,
            required_hours=horas_proyecto,
            min_api_level=estudiante.api_level,
            max_students=1,
            current_students=1,
            duration_weeks=12,
            hours_per_week=horas_proyecto // 12,
            difficulty='intermediate',
            modality='remote',
            start_date=timezone.now().date() - timedelta(days=90),
            estimated_end_date=timezone.now().date() - timedelta(days=30),
            real_end_date=timezone.now().date() - timedelta(days=30),
            required_skills=json.dumps(estudiante.get_skills_list()),
            technologies=json.dumps(estudiante.get_skills_list()),
            tags=json.dumps(['Completado', f'API {estudiante.api_level}']),
            benefits=json.dumps(['Certificación', 'Experiencia']),
            published_at=timezone.now() - timedelta(days=120)
        )
        
        print(f"   - Proyecto creado: {proyecto.title} (TRL {trl_proyecto}, {horas_proyecto}h)")
        proyectos_creados.append(proyecto)
        
        # 7. Crear aplicación aceptada
        aplicacion = AplicacionProyecto.objects.create(
            proyecto=proyecto,
            estudiante=estudiante.user,
            cover_letter=f"Carta de motivación de {estudiante.user.full_name}",
            estado='accepted',
            compatibility_score=85,
            applied_at=timezone.now() - timedelta(days=120),
            reviewed_at=timezone.now() - timedelta(days=115),
            responded_at=timezone.now() - timedelta(days=110)
        )
        
        # 8. Crear aplicación legacy
        aplicacion_legacy = Aplicacion.objects.create(
            project=proyecto,
            student=estudiante,
            status='accepted',
            compatibility_score=85,
            cover_letter=f"Carta de motivación de {estudiante.user.full_name}",
            applied_at=timezone.now() - timedelta(days=120),
            reviewed_at=timezone.now() - timedelta(days=115),
            responded_at=timezone.now() - timedelta(days=110)
        )
        
        # 9. Crear asignación para las horas trabajadas
        from assignments.models import Assignment
        assignment = Assignment.objects.create(
            project=proyecto,
            application=aplicacion,
            assigned_by=empresa.user,
            assigned_to=estudiante.user,
            title=f"Asignación para {proyecto.title}",
            description=f"Trabajo asignado a {estudiante.user.full_name}",
            due_date=timezone.now() + timedelta(days=30),
            priority='normal',
            status='completed',
            estimated_hours=horas_proyecto,
            actual_hours=horas_proyecto
        )
        
        # 10. Crear horas trabajadas distribuidas en el tiempo
        print(f"   - Creando horas trabajadas para {estudiante.user.first_name}...")
        crear_horas_trabajadas(estudiante, proyecto, empresa, horas_proyecto, assignment)
        
        # 10. Actualizar estadísticas del estudiante
        estudiante.total_hours = horas_proyecto
        estudiante.completed_projects = data['completed_projects']
        estudiante.save()
        
        print(f"   - {estudiante.user.first_name}: {horas_proyecto}h trabajadas, {data['completed_projects']} proyectos")
    
    # 11. Crear algunas notificaciones de ejemplo
    print("7. Creando notificaciones de ejemplo...")
    mensajes = [
        "Hemos revisado tu perfil y nos interesa colaborar contigo.",
        "Tu experiencia en desarrollo web es exactamente lo que necesitamos.",
        "¿Te interesaría trabajar en nuestro próximo proyecto?"
    ]
    
    for estudiante in estudiantes_creados:
        mensaje = random.choice(mensajes)
        Notification.objects.create(
            user=estudiante.user,
            title=f"Mensaje de {empresa.company_name}",
            message=mensaje,
            type='info',
            read=False,
            notification_type='company_message',
            is_read=False,
            created_at=timezone.now() - timedelta(days=random.randint(1, 7))
        )
    
    print("\n=== Datos de prueba creados exitosamente ===")
    print(f"Estudiantes creados: {len(estudiantes_creados)}")
    print(f"Proyectos creados: {len(proyectos_creados)}")
    print(f"Empresa creada: {empresa.company_name}")
    
    print("\nCredenciales de acceso:")
    print("Empresa: techcorp@test.com / testpass123")
    for estudiante in estudiantes_creados:
        print(f"Estudiante: {estudiante.user.email} / testpass123")
    
    print("\nAhora puedes:")
    print("1. Iniciar sesión como empresa y buscar estudiantes")
    print("2. Ver estudiantes con experiencia real en proyectos")
    print("3. Ver horas trabajadas según nivel API")
    print("4. Enviar mensajes a estudiantes")

def crear_horas_trabajadas(estudiante, proyecto, empresa, total_horas, assignment):
    """Crear horas trabajadas distribuidas en el tiempo"""
    # Distribuir horas en días de trabajo (lunes a viernes)
    fecha_inicio = proyecto.start_date
    fecha_fin = proyecto.real_end_date
    
    dias_trabajo = []
    fecha_actual = fecha_inicio
    while fecha_actual <= fecha_fin:
        if fecha_actual.weekday() < 5:  # Lunes a viernes
            dias_trabajo.append(fecha_actual)
        fecha_actual += timedelta(days=1)
    
    # Tomar una muestra de días para distribuir las horas
    dias_seleccionados = random.sample(dias_trabajo, min(len(dias_trabajo), total_horas // 4))
    
    if not dias_seleccionados:
        return
    
    horas_por_dia = total_horas // len(dias_seleccionados)
    horas_restantes = total_horas % len(dias_seleccionados)
    
    for i, fecha in enumerate(dias_seleccionados):
        horas_del_dia = horas_por_dia + (1 if i < horas_restantes else 0)
        
        # Crear hora trabajada
        WorkHour.objects.create(
            assignment=assignment,
            student=estudiante,
            project=proyecto,
            company=empresa,
            date=fecha,
            hours_worked=horas_del_dia,
            description=f"Trabajo en {proyecto.title}: desarrollo de funcionalidades",
            approved=True,
            approved_by=empresa.user,
            approved_at=timezone.now()
        )

if __name__ == '__main__':
    crear_datos_simples() 