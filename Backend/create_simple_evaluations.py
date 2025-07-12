#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from evaluations.models import Evaluation
from users.models import User
from projects.models import Proyecto
from evaluation_categories.models import EvaluationCategory

def create_simple_evaluations():
    print("=== CREANDO EVALUACIONES SIMPLES DE PRUEBA ===")
    
    # Buscar estudiante
    user = User.objects.filter(email='juan.perez@uchile.cl').first()
    if not user:
        print("❌ Usuario juan.perez@uchile.cl no encontrado")
        return
    print(f"✅ Usuario encontrado: {user.first_name} {user.last_name}")
    
    # Buscar o crear una categoría simple
    category, created = EvaluationCategory.objects.get_or_create(
        name='Evaluación General',
        defaults={
            'description': 'Evaluación general del proyecto'
        }
    )
    if created:
        print(f"✅ Categoría creada: {category.name}")
    else:
        print(f"✅ Categoría encontrada: {category.name}")
    
    # Buscar proyectos del estudiante
    student_projects = Proyecto.objects.filter(students=user)
    print(f"✅ Proyectos del estudiante encontrados: {student_projects.count()}")
    
    if student_projects.count() == 0:
        print("❌ No hay proyectos asociados al estudiante")
        return
    
    # Crear evaluaciones para algunos proyectos
    evaluations_created = 0
    for i, project in enumerate(student_projects[:3]):  # Solo los primeros 3
        # Verificar si ya existe una evaluación
        existing = Evaluation.objects.filter(student=user, project=project).first()
        if existing:
            print(f"⚠️ Evaluación ya existe para proyecto: {project.title}")
            continue
        
        # Crear evaluador (empresa)
        evaluator = project.company.user if project.company else None
        
        # Generar puntuación aleatoria
        score = random.randint(70, 100)
        
        # Crear evaluación
        evaluation = Evaluation.objects.create(
            project=project,
            student=user,
            evaluator=evaluator,
            category=category,
            score=score,
            comments=f"Excelente trabajo en el proyecto {project.title}. El estudiante demostró habilidades técnicas sólidas y buena capacidad de trabajo en equipo.",
            status='completed',
            type='final',
            overall_rating=score / 20,  # Convertir a escala 1-5
            strengths="Trabajo en equipo, Responsabilidad, Habilidades técnicas",
            areas_for_improvement="Comunicación, Documentación",
            project_duration="3 meses",
            technologies="React, Django, PostgreSQL, Docker",
            deliverables="Aplicación web completa, Documentación técnica, Manual de usuario"
        )
        
        print(f"✅ Evaluación creada: {project.title} - Puntuación: {score}")
        evaluations_created += 1
    
    print(f"\n🎉 Se crearon {evaluations_created} evaluaciones de prueba")
    
    # Verificar evaluaciones del estudiante
    student_evaluations = Evaluation.objects.filter(student=user)
    print(f"\n📊 Total evaluaciones del estudiante: {student_evaluations.count()}")
    
    for eval in student_evaluations:
        print(f"✅ {eval.project.title if eval.project else 'Sin proyecto'} - Puntuación: {eval.score}")

if __name__ == "__main__":
    create_simple_evaluations() 