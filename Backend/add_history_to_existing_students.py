#!/usr/bin/env python
"""
Script para agregar historial simple y coherente a los estudiantes existentes
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
from assignments.models import Assignment

User = get_user_model()

def agregar_historial_estudiantes_existentes():
    """Agregar historial a estudiantes existentes"""
    print("=== Agregando historial a estudiantes existentes ===")
    
    # 1. Obtener estudiantes existentes
    estudiantes_existentes = Estudiante.objects.filter(status='approved')
    print(f"Estudiantes encontrados: {estudiantes_existentes.count()}")
    
    if estudiantes_existentes.count() == 0:
        print("No hay estudiantes aprobados para agregar historial")
        return
    
    # 2. Crear áreas básicas si no existen
    print("1. Verificando áreas...")
    area_web, _ = Area.objects.get_or_create(
        name='Desarrollo Web',
        defaults={'description': 'Proyectos de desarrollo web'}
    )
    area_ia, _ = Area.objects.get_or_create(
        name='Inteligencia Artificial',
        defaults={'description': 'Proyectos de IA y ML'}
    )
    area_mobile, _ = Area.objects.get_or_create(
        name='Desarrollo Móvil',
        defaults={'description': 'Aplicaciones móviles'}
    )
    
    # 3. Crear niveles TRL si no existen
    print("2. Verificando niveles TRL...")
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
    
    # 4. Crear estado de proyecto completado
    estado_completado, _ = ProjectStatus.objects.get_or_create(
        name='completed',
        defaults={'description': 'Proyecto completado'}
    )
    
    # 5. Crear empresas de ejemplo si no existen
    print("3. Verificando empresas...")
    empresas_data = [
        {
            'email': 'techcorp@example.com',
            'name': 'TechCorp Solutions',
            'description': 'Empresa líder en desarrollo de software'
        },
        {
            'email': 'innovatelab@example.com',
            'name': 'InnovateLab',
            'description': 'Startup especializada en inteligencia artificial'
        },
        {
            'email': 'digitalflow@example.com',
            'name': 'DigitalFlow Systems',
            'description': 'Consultoría en transformación digital'
        }
    ]
    
    empresas = []
    for data in empresas_data:
        user_empresa, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'first_name': data['name'],
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
                'company_name': data['name'],
                'description': data['description'],
                'industry': 'Tecnología',
                'size': 'medium'
            }
        )
        empresas.append(empresa)
    
    # 6. Proyectos de ejemplo según nivel API
    proyectos_ejemplo = [
        {
            'title': 'Sistema de Gestión de Inventarios',
            'description': 'Desarrollo de sistema web para gestión de inventarios',
            'area': area_web,
            'skills': ['React', 'Django', 'PostgreSQL'],
            'api_levels': [2, 3]
        },
        {
            'title': 'Chatbot con IA para Atención al Cliente',
            'description': 'Desarrollo de chatbot inteligente usando machine learning',
            'area': area_ia,
            'skills': ['Python', 'Machine Learning', 'NLP'],
            'api_levels': [3, 4]
        },
        {
            'title': 'App Móvil de Fitness',
            'description': 'Aplicación móvil para seguimiento de ejercicios',
            'area': area_mobile,
            'skills': ['React Native', 'Firebase'],
            'api_levels': [1, 2]
        },
        {
            'title': 'Dashboard de Analytics',
            'description': 'Dashboard para visualización de datos empresariales',
            'area': area_web,
            'skills': ['Vue.js', 'Node.js', 'MongoDB'],
            'api_levels': [2, 3]
        },
        {
            'title': 'Sistema de Recomendaciones',
            'description': 'Algoritmo de recomendaciones basado en IA',
            'area': area_ia,
            'skills': ['Python', 'TensorFlow', 'Pandas'],
            'api_levels': [3, 4]
        }
    ]
    
    # 7. Agregar historial a cada estudiante
    print("4. Agregando historial a estudiantes...")
    estudiantes_con_historial = 0
    
    for estudiante in estudiantes_existentes:
        # Solo agregar historial si no tiene proyectos completados
        if estudiante.completed_projects > 0:
            print(f"   - {estudiante.user.full_name} ya tiene {estudiante.completed_projects} proyectos, saltando...")
            continue
        
        # Determinar cuántos proyectos agregar según el nivel API
        if estudiante.api_level == 1:
            num_proyectos = random.randint(0, 1)  # 0-1 proyectos
        elif estudiante.api_level == 2:
            num_proyectos = random.randint(1, 2)  # 1-2 proyectos
        elif estudiante.api_level == 3:
            num_proyectos = random.randint(1, 3)  # 1-3 proyectos
        else:  # API level 4
            num_proyectos = random.randint(2, 4)  # 2-4 proyectos
        
        if num_proyectos == 0:
            print(f"   - {estudiante.user.full_name} (API {estudiante.api_level}): Sin proyectos")
            continue
        
        print(f"   - {estudiante.user.full_name} (API {estudiante.api_level}): {num_proyectos} proyectos")
        
        total_horas_estudiante = 0
        
        for i in range(num_proyectos):
            # Seleccionar proyecto apropiado para el nivel API
            proyecto_ejemplo = random.choice([p for p in proyectos_ejemplo if estudiante.api_level in p['api_levels']])
            
            # Calcular horas según nivel API
            horas_proyecto = estudiante.api_level * random.randint(15, 25)  # 15-25 horas por nivel API
            trl_proyecto = estudiante.api_level * 2  # TRL basado en API level
            
            # Seleccionar empresa al azar
            empresa = random.choice(empresas)
            
            # Crear proyecto
            proyecto = Proyecto.objects.create(
                company=empresa,
                status=estado_completado,
                area=proyecto_ejemplo['area'],
                title=f"{proyecto_ejemplo['title']} - {estudiante.user.first_name}",
                description=proyecto_ejemplo['description'],
                requirements=f"Requerimientos para nivel API {estudiante.api_level}",
                trl=trl_levels[trl_proyecto],
                api_level=estudiante.api_level,
                required_hours=horas_proyecto,
                min_api_level=estudiante.api_level,
                max_students=1,
                current_students=1,
                duration_weeks=8,
                hours_per_week=horas_proyecto // 8,
                difficulty='intermediate',
                modality='remote',
                start_date=timezone.now().date() - timedelta(days=random.randint(60, 180)),
                estimated_end_date=timezone.now().date() - timedelta(days=random.randint(30, 60)),
                real_end_date=timezone.now().date() - timedelta(days=random.randint(30, 60)),
                required_skills=json.dumps(proyecto_ejemplo['skills']),
                technologies=json.dumps(proyecto_ejemplo['skills']),
                tags=json.dumps(['Completado', f'API {estudiante.api_level}']),
                benefits=json.dumps(['Certificación', 'Experiencia']),
                published_at=timezone.now() - timedelta(days=random.randint(90, 200))
            )
            
            # Crear aplicación aceptada
            aplicacion = AplicacionProyecto.objects.create(
                proyecto=proyecto,
                estudiante=estudiante.user,
                cover_letter=f"Carta de motivación de {estudiante.user.full_name}",
                estado='accepted',
                compatibility_score=random.randint(75, 95),
                applied_at=proyecto.published_at,
                reviewed_at=proyecto.published_at + timedelta(days=5),
                responded_at=proyecto.published_at + timedelta(days=7)
            )
            
            # Crear aplicación legacy
            aplicacion_legacy = Aplicacion.objects.create(
                project=proyecto,
                student=estudiante,
                status='accepted',
                compatibility_score=aplicacion.compatibility_score,
                cover_letter=aplicacion.cover_letter,
                applied_at=aplicacion.applied_at,
                reviewed_at=aplicacion.reviewed_at,
                responded_at=aplicacion.responded_at
            )
            
            # Crear asignación del modelo correcto (Asignacion)
            from applications.models import Asignacion
            asignacion = Asignacion.objects.create(
                application=aplicacion_legacy,
                fecha_inicio=proyecto.start_date,
                fecha_fin=proyecto.real_end_date,
                estado='completado',
                hours_worked=horas_proyecto,
                tasks_completed=random.randint(5, 15)
            )
            
            # Crear horas trabajadas distribuidas
            crear_horas_trabajadas_simples(estudiante, proyecto, empresa, horas_proyecto, asignacion)
            
            total_horas_estudiante += horas_proyecto
        
        # Actualizar estadísticas del estudiante
        estudiante.completed_projects = num_proyectos
        estudiante.total_hours = total_horas_estudiante
        estudiante.save()
        
        estudiantes_con_historial += 1
        print(f"     ✓ {num_proyectos} proyectos, {total_horas_estudiante} horas totales")
    
    print(f"\n=== Historial agregado exitosamente ===")
    print(f"Estudiantes con historial agregado: {estudiantes_con_historial}")
    print(f"Empresas utilizadas: {len(empresas)}")
    
    print("\nAhora los estudiantes pueden ver:")
    print("- Proyectos completados en sus dashboards")
    print("- Horas trabajadas según su nivel API")
    print("- Experiencia real en proyectos")

def crear_horas_trabajadas_simples(estudiante, proyecto, empresa, total_horas, asignacion):
    """Crear horas trabajadas de forma simple"""
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
    dias_seleccionados = random.sample(dias_trabajo, min(len(dias_trabajo), max(1, total_horas // 8)))
    
    if not dias_seleccionados:
        return
    
    horas_por_dia = total_horas // len(dias_seleccionados)
    horas_restantes = total_horas % len(dias_seleccionados)
    
    for i, fecha in enumerate(dias_seleccionados):
        horas_del_dia = horas_por_dia + (1 if i < horas_restantes else 0)
        
        # Crear hora trabajada
        WorkHour.objects.create(
            assignment=asignacion,
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
    agregar_historial_estudiantes_existentes() 