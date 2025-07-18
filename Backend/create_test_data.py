#!/usr/bin/env python
"""
Script para crear datos de prueba con estudiantes que tengan historial en proyectos
y horas trabajadas para que la búsqueda de estudiantes funcione correctamente.
"""

import os
import sys
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
from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
from work_hours.models import WorkHour
from assignments.models import Assignment
from applications.models import Aplicacion, Asignacion
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus
from notifications.models import Notification

User = get_user_model()

def crear_usuarios_estudiantes():
    """Crear usuarios estudiantes con datos reales"""
    estudiantes_data = [
        {
            'email': 'maria.garcia@estudiante.com',
            'full_name': 'María García López',
            'career': 'Ingeniería en Sistemas Computacionales',
            'semester': 8,
            'university': 'Universidad Nacional Autónoma de México',
            'api_level': 3,
            'completed_projects': 2,
            'total_hours': 120,
            'skills': ['Python', 'Django', 'React', 'JavaScript', 'SQL'],
            'languages': ['Español', 'Inglés'],
            'gpa': 4.2,
            'rating': 4.5
        },
        {
            'email': 'carlos.rodriguez@estudiante.com',
            'full_name': 'Carlos Rodríguez Martínez',
            'career': 'Ingeniería en Tecnologías de la Información',
            'semester': 6,
            'university': 'Instituto Politécnico Nacional',
            'api_level': 2,
            'completed_projects': 1,
            'total_hours': 80,
            'skills': ['Java', 'Spring Boot', 'MySQL', 'Git'],
            'languages': ['Español', 'Inglés'],
            'gpa': 3.8,
            'rating': 4.0
        },
        {
            'email': 'ana.martinez@estudiante.com',
            'full_name': 'Ana Martínez Silva',
            'career': 'Ingeniería en Software',
            'semester': 10,
            'university': 'Universidad de Guadalajara',
            'api_level': 4,
            'completed_projects': 4,
            'total_hours': 200,
            'skills': ['Python', 'Machine Learning', 'TensorFlow', 'Docker', 'AWS'],
            'languages': ['Español', 'Inglés', 'Francés'],
            'gpa': 4.5,
            'rating': 4.8
        },
        {
            'email': 'luis.hernandez@estudiante.com',
            'full_name': 'Luis Hernández Pérez',
            'career': 'Ingeniería en Computación',
            'semester': 7,
            'university': 'Universidad Autónoma de Nuevo León',
            'api_level': 2,
            'completed_projects': 1,
            'total_hours': 60,
            'skills': ['C++', 'Algoritmos', 'Estructuras de Datos'],
            'languages': ['Español', 'Inglés'],
            'gpa': 3.9,
            'rating': 4.2
        },
        {
            'email': 'sofia.torres@estudiante.com',
            'full_name': 'Sofía Torres Vega',
            'career': 'Ingeniería en Informática',
            'semester': 9,
            'university': 'Universidad de Monterrey',
            'api_level': 3,
            'completed_projects': 3,
            'total_hours': 150,
            'skills': ['React', 'Node.js', 'MongoDB', 'TypeScript'],
            'languages': ['Español', 'Inglés'],
            'gpa': 4.1,
            'rating': 4.6
        },
        {
            'email': 'juan.morales@estudiante.com',
            'full_name': 'Juan Morales Ruiz',
            'career': 'Ingeniería en Sistemas',
            'semester': 5,
            'university': 'Universidad Veracruzana',
            'api_level': 1,
            'completed_projects': 0,
            'total_hours': 0,
            'skills': ['HTML', 'CSS', 'JavaScript'],
            'languages': ['Español'],
            'gpa': 3.5,
            'rating': 0.0
        },
        {
            'email': 'patricia.flores@estudiante.com',
            'full_name': 'Patricia Flores Mendoza',
            'career': 'Ingeniería en Tecnologías de la Información',
            'semester': 11,
            'university': 'Universidad Autónoma de Yucatán',
            'api_level': 4,
            'completed_projects': 5,
            'total_hours': 280,
            'skills': ['Python', 'Django', 'React', 'PostgreSQL', 'Redis', 'Docker'],
            'languages': ['Español', 'Inglés', 'Alemán'],
            'gpa': 4.3,
            'rating': 4.9
        },
        {
            'email': 'roberto.sanchez@estudiante.com',
            'full_name': 'Roberto Sánchez Jiménez',
            'career': 'Ingeniería en Software',
            'semester': 8,
            'university': 'Universidad de Colima',
            'api_level': 3,
            'completed_projects': 2,
            'total_hours': 100,
            'skills': ['Java', 'Spring', 'Angular', 'MySQL'],
            'languages': ['Español', 'Inglés'],
            'gpa': 3.7,
            'rating': 4.1
        }
    ]
    
    estudiantes_creados = []
    
    for data in estudiantes_data:
        # Crear usuario
        # Separar nombre completo en first_name y last_name
        name_parts = data['full_name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': 'student',
                'is_verified': True,
                'is_active': True,
                'password': 'testpass123'  # Contraseña simple para pruebas
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"Usuario creado: {user.full_name}")
        
        # Crear perfil de estudiante
        estudiante, created = Estudiante.objects.get_or_create(
            user=user,
            defaults={
                'career': data['career'],
                'semester': data['semester'],
                'university': data['university'],
                'api_level': data['api_level'],
                'completed_projects': data['completed_projects'],
                'total_hours': data['total_hours'],
                'gpa': data['gpa'],
                'rating': data['rating'],
                'status': 'approved',
                'trl_level': data['api_level'] * 2,  # TRL basado en API level
                'skills': json.dumps(data['skills']),
                'languages': json.dumps(data['languages']),
                'availability': 'flexible',
                'location': 'México'
            }
        )
        
        if created:
            print(f"Estudiante creado: {estudiante.user.full_name} - API Level: {estudiante.api_level}")
        
        estudiantes_creados.append(estudiante)
    
    return estudiantes_creados

def crear_empresas():
    """Crear empresas de prueba"""
    empresas_data = [
        {
            'company_name': 'TechCorp Solutions',
            'email': 'contacto@techcorp.com',
            'description': 'Empresa líder en desarrollo de software empresarial'
        },
        {
            'company_name': 'InnovateLab',
            'email': 'info@innovatelab.com',
            'description': 'Startup especializada en inteligencia artificial'
        },
        {
            'company_name': 'DigitalFlow Systems',
            'email': 'hello@digitalflow.com',
            'description': 'Consultoría en transformación digital'
        }
    ]
    
    empresas_creadas = []
    
    for data in empresas_data:
        # Crear usuario empresa
        user, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'first_name': data['company_name'],
                'role': 'company',
                'is_verified': True,
                'is_active': True,
                'password': 'testpass123'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"Usuario empresa creado: {user.full_name}")
        
        # Crear empresa
        empresa, created = Empresa.objects.get_or_create(
            user=user,
            defaults={
                'company_name': data['company_name'],
                'description': data['description'],
                'industry': 'Tecnología',
                'size': 'medium',
                'website': f"https://{data['company_name'].lower().replace(' ', '')}.com"
            }
        )
        
        if created:
            print(f"Empresa creada: {empresa.company_name}")
        
        empresas_creadas.append(empresa)
    
    return empresas_creadas

def crear_areas_y_trl():
    """Crear áreas y niveles TRL"""
    # Crear áreas
    areas_data = [
        {'name': 'Desarrollo Web', 'description': 'Proyectos de desarrollo web'},
        {'name': 'Inteligencia Artificial', 'description': 'Proyectos de IA y ML'},
        {'name': 'Desarrollo Móvil', 'description': 'Aplicaciones móviles'},
        {'name': 'Base de Datos', 'description': 'Proyectos de bases de datos'},
        {'name': 'DevOps', 'description': 'Infraestructura y DevOps'}
    ]
    
    areas = []
    for data in areas_data:
        area, created = Area.objects.get_or_create(
            name=data['name'],
            defaults={'description': data['description']}
        )
        if created:
            print(f"Área creada: {area.name}")
        areas.append(area)
    
    # Crear niveles TRL
    trl_levels = []
    for i in range(1, 10):
        trl, created = TRLLevel.objects.get_or_create(
            level=i,
            defaults={
                'name': f'TRL {i}',
                'description': f'Descripción del nivel TRL {i}'
            }
        )
        if created:
            print(f"Nivel TRL creado: {trl.name}")
        trl_levels.append(trl)
    
    return areas, trl_levels

def crear_estados_proyecto():
    """Crear estados de proyecto"""
    estados_data = [
        {'name': 'open', 'description': 'Proyecto abierto para aplicaciones'},
        {'name': 'in-progress', 'description': 'Proyecto en progreso'},
        {'name': 'completed', 'description': 'Proyecto completado'},
        {'name': 'cancelled', 'description': 'Proyecto cancelado'}
    ]
    
    estados = []
    for data in estados_data:
        estado, created = ProjectStatus.objects.get_or_create(
            name=data['name'],
            defaults={'description': data['description']}
        )
        if created:
            print(f"Estado de proyecto creado: {estado.name}")
        estados.append(estado)
    
    return estados

def crear_proyectos(empresas, areas, trl_levels, estados):
    """Crear proyectos de prueba"""
    proyectos_data = [
        {
            'title': 'Sistema de Gestión de Inventarios',
            'description': 'Desarrollo de un sistema web para gestión de inventarios con React y Django',
            'requirements': 'Conocimientos en React, Django, PostgreSQL. Nivel API 2+',
            'area': areas[0],  # Desarrollo Web
            'trl': trl_levels[3],  # TRL 4
            'api_level': 2,
            'required_hours': 80,
            'min_api_level': 2,
            'max_students': 2,
            'duration_weeks': 12,
            'hours_per_week': 20,
            'difficulty': 'intermediate',
            'modality': 'remote',
            'required_skills': ['React', 'Django', 'PostgreSQL'],
            'technologies': ['React', 'Django', 'PostgreSQL', 'Docker'],
            'tags': ['Web Development', 'Inventory Management'],
            'benefits': ['Certificación', 'Referencia laboral', 'Pago por hora']
        },
        {
            'title': 'Chatbot con IA para Atención al Cliente',
            'description': 'Desarrollo de un chatbot inteligente usando machine learning',
            'requirements': 'Conocimientos en Python, Machine Learning, NLP. Nivel API 3+',
            'area': areas[1],  # IA
            'trl': trl_levels[5],  # TRL 6
            'api_level': 3,
            'required_hours': 120,
            'min_api_level': 3,
            'max_students': 1,
            'duration_weeks': 16,
            'hours_per_week': 25,
            'difficulty': 'advanced',
            'modality': 'hybrid',
            'required_skills': ['Python', 'Machine Learning', 'NLP'],
            'technologies': ['Python', 'TensorFlow', 'NLTK', 'FastAPI'],
            'tags': ['AI', 'Chatbot', 'Customer Service'],
            'benefits': ['Certificación en IA', 'Publicación técnica', 'Pago por hora']
        },
        {
            'title': 'App Móvil de Fitness',
            'description': 'Desarrollo de aplicación móvil para seguimiento de ejercicios',
            'requirements': 'Conocimientos en React Native, Firebase. Nivel API 1+',
            'area': areas[2],  # Desarrollo Móvil
            'trl': trl_levels[2],  # TRL 3
            'api_level': 1,
            'required_hours': 60,
            'min_api_level': 1,
            'max_students': 3,
            'duration_weeks': 10,
            'hours_per_week': 15,
            'difficulty': 'beginner',
            'modality': 'remote',
            'required_skills': ['React Native', 'JavaScript'],
            'technologies': ['React Native', 'Firebase', 'Expo'],
            'tags': ['Mobile Development', 'Fitness', 'Health'],
            'benefits': ['Certificación móvil', 'Experiencia en app store']
        }
    ]
    
    proyectos_creados = []
    
    for i, data in enumerate(proyectos_data):
        empresa = empresas[i % len(empresas)]
        estado = estados[0] if i == 0 else estados[1]  # Primer proyecto abierto, otros en progreso
        
        proyecto = Proyecto.objects.create(
            company=empresa,
            status=estado,
            area=data['area'],
            title=data['title'],
            description=data['description'],
            requirements=data['requirements'],
            trl=data['trl'],
            api_level=data['api_level'],
            required_hours=data['required_hours'],
            min_api_level=data['min_api_level'],
            max_students=data['max_students'],
            current_students=0,
            duration_weeks=data['duration_weeks'],
            hours_per_week=data['hours_per_week'],
            difficulty=data['difficulty'],
            modality=data['modality'],
            start_date=timezone.now().date(),
            estimated_end_date=(timezone.now().date() + timedelta(weeks=data['duration_weeks'])),
            required_skills=json.dumps(data['required_skills']),
            technologies=json.dumps(data['technologies']),
            tags=json.dumps(data['tags']),
            benefits=json.dumps(data['benefits']),
            published_at=timezone.now()
        )
        
        print(f"Proyecto creado: {proyecto.title}")
        proyectos_creados.append(proyecto)
    
    return proyectos_creados

def crear_aplicaciones_y_asignaciones(estudiantes, proyectos):
    """Crear aplicaciones y asignaciones para los proyectos"""
    # Solo usar estudiantes con API level > 0 y proyectos con estudiantes
    estudiantes_activos = [e for e in estudiantes if e.api_level > 0 and e.completed_projects > 0]
    
    for proyecto in proyectos:
        # Asignar estudiantes según el nivel API requerido
        estudiantes_elegibles = [e for e in estudiantes_activos if e.api_level >= proyecto.min_api_level]
        
        if not estudiantes_elegibles:
            continue
        
        # Tomar hasta max_students estudiantes
        estudiantes_asignados = random.sample(
            estudiantes_elegibles, 
            min(len(estudiantes_elegibles), proyecto.max_students)
        )
        
        for estudiante in estudiantes_asignados:
            # Crear aplicación
            aplicacion = AplicacionProyecto.objects.create(
                proyecto=proyecto,
                estudiante=estudiante.user,
                cover_letter=f"Carta de motivación de {estudiante.user.full_name} para {proyecto.title}",
                estado='accepted',
                compatibility_score=random.randint(75, 95),
                applied_at=timezone.now() - timedelta(days=random.randint(30, 90)),
                reviewed_at=timezone.now() - timedelta(days=random.randint(25, 85)),
                responded_at=timezone.now() - timedelta(days=random.randint(20, 80))
            )
            
            # Crear aplicación en el modelo Aplicacion
            aplicacion_legacy = Aplicacion.objects.create(
                proyecto=proyecto,
                estudiante=estudiante.user,
                carta_motivacion=aplicacion.cover_letter,
                estado='aceptada',
                puntuacion_compatibilidad=aplicacion.compatibility_score,
                fecha_aplicacion=aplicacion.applied_at,
                fecha_revision=aplicacion.reviewed_at,
                fecha_respuesta=aplicacion.responded_at
            )
            
            # Crear asignación
            asignacion = Asignacion.objects.create(
                proyecto=proyecto,
                estudiante=estudiante.user,
                empresa=proyecto.company,
                fecha_asignacion=timezone.now() - timedelta(days=random.randint(20, 80)),
                estado='activa',
                horas_asignadas=proyecto.required_hours,
                horas_completadas=random.randint(proyecto.required_hours // 2, proyecto.required_hours),
                fecha_inicio=timezone.now() - timedelta(days=random.randint(30, 90)),
                fecha_fin=timezone.now() + timedelta(days=random.randint(10, 30))
            )
            
            # Crear miembro del proyecto
            miembro = MiembroProyecto.objects.create(
                proyecto=proyecto,
                usuario=estudiante.user,
                rol='estudiante',
                horas_trabajadas=asignacion.horas_completadas,
                tareas_completadas=random.randint(5, 15),
                evaluacion_promedio=random.uniform(3.5, 5.0),
                esta_activo=True,
                es_verificado=True
            )
            
            # Actualizar contador de estudiantes en el proyecto
            proyecto.current_students += 1
            proyecto.save()
            
            print(f"Asignación creada: {estudiante.user.full_name} -> {proyecto.title}")
            
            # Crear horas trabajadas
            crear_horas_trabajadas(estudiante, proyecto, asignacion, proyecto.company)

def crear_horas_trabajadas(estudiante, proyecto, asignacion, empresa):
    """Crear horas trabajadas para el estudiante en el proyecto"""
    # Crear horas trabajadas distribuidas en el tiempo
    fecha_inicio = asignacion.fecha_inicio
    fecha_fin = timezone.now().date()
    total_horas = asignacion.horas_completadas
    
    # Distribuir horas en días de trabajo (lunes a viernes)
    dias_trabajo = []
    fecha_actual = fecha_inicio
    while fecha_actual <= fecha_fin:
        if fecha_actual.weekday() < 5:  # Lunes a viernes
            dias_trabajo.append(fecha_actual)
        fecha_actual += timedelta(days=1)
    
    # Tomar una muestra de días para distribuir las horas
    dias_seleccionados = random.sample(dias_trabajo, min(len(dias_trabajo), total_horas // 4))
    
    horas_por_dia = total_horas // len(dias_seleccionados) if dias_seleccionados else 0
    horas_restantes = total_horas % len(dias_seleccionados) if dias_seleccionados else 0
    
    for i, fecha in enumerate(dias_seleccionados):
        horas_del_dia = horas_por_dia + (1 if i < horas_restantes else 0)
        
        # Crear asignación para work_hours
        assignment = Assignment.objects.create(
            project=proyecto,
            application=AplicacionProyecto.objects.get(proyecto=proyecto, estudiante=estudiante.user),
            assigned_by=empresa.user,
            assigned_to=estudiante.user,
            title=f"Tarea del {fecha.strftime('%d/%m/%Y')}",
            description=f"Trabajo realizado en {proyecto.title}",
            due_date=timezone.now(),
            priority='normal',
            status='completed',
            estimated_hours=horas_del_dia,
            actual_hours=horas_del_dia
        )
        
        # Crear hora trabajada
        work_hour = WorkHour.objects.create(
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
        
        print(f"  Hora trabajada: {estudiante.user.full_name} - {fecha} ({horas_del_dia}h)")

def crear_notificaciones_ejemplo(estudiantes, empresas):
    """Crear algunas notificaciones de ejemplo"""
    mensajes = [
        "Hemos revisado tu perfil y nos interesa colaborar contigo en nuestros proyectos.",
        "Tu experiencia en desarrollo web es exactamente lo que necesitamos para nuestro próximo proyecto.",
        "Nos gustaría programar una entrevista para discutir oportunidades de colaboración.",
        "Tu trabajo en proyectos anteriores nos ha impresionado. ¿Te interesaría trabajar con nosotros?",
        "Tenemos un proyecto que se ajusta perfectamente a tus habilidades. ¿Podrías contactarnos?"
    ]
    
    for empresa in empresas:
        # Seleccionar algunos estudiantes al azar
        estudiantes_seleccionados = random.sample(estudiantes, min(3, len(estudiantes)))
        
        for estudiante in estudiantes_seleccionados:
            mensaje = random.choice(mensajes)
            
            notification = Notification.objects.create(
                user=estudiante.user,
                title=f"Mensaje de {empresa.company_name}",
                message=mensaje,
                type='info',
                read=False,
                notification_type='company_message',
                is_read=False,
                created_at=timezone.now() - timedelta(days=random.randint(1, 30))
            )
            
            print(f"Notificación creada: {empresa.company_name} -> {estudiante.user.full_name}")

def main():
    """Función principal para crear todos los datos de prueba"""
    print("=== Creando datos de prueba para LeanMaker ===")
    
    # Crear áreas y niveles TRL
    print("\n1. Creando áreas y niveles TRL...")
    areas, trl_levels = crear_areas_y_trl()
    
    # Crear estados de proyecto
    print("\n2. Creando estados de proyecto...")
    estados = crear_estados_proyecto()
    
    # Crear empresas
    print("\n3. Creando empresas...")
    empresas = crear_empresas()
    
    # Crear estudiantes
    print("\n4. Creando estudiantes...")
    estudiantes = crear_usuarios_estudiantes()
    
    # Crear proyectos
    print("\n5. Creando proyectos...")
    proyectos = crear_proyectos(empresas, areas, trl_levels, estados)
    
    # Crear aplicaciones y asignaciones
    print("\n6. Creando aplicaciones y asignaciones...")
    crear_aplicaciones_y_asignaciones(estudiantes, proyectos)
    
    # Crear notificaciones de ejemplo
    print("\n7. Creando notificaciones de ejemplo...")
    crear_notificaciones_ejemplo(estudiantes, empresas)
    
    print("\n=== Datos de prueba creados exitosamente ===")
    print(f"Estudiantes creados: {len(estudiantes)}")
    print(f"Empresas creadas: {len(empresas)}")
    print(f"Proyectos creados: {len(proyectos)}")
    print(f"Áreas creadas: {len(areas)}")
    print(f"Niveles TRL creados: {len(trl_levels)}")
    
    print("\nCredenciales de acceso:")
    print("Estudiantes: email@estudiante.com / testpass123")
    print("Empresas: email@empresa.com / testpass123")
    
    print("\nAhora puedes:")
    print("1. Iniciar sesión como empresa y buscar estudiantes")
    print("2. Ver estudiantes con experiencia en proyectos")
    print("3. Enviar mensajes a estudiantes")
    print("4. Ver notificaciones en el sistema")

if __name__ == '__main__':
    main() 