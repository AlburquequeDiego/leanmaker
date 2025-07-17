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
from applications.models import Aplicacion
from evaluation_categories.models import EvaluationCategory

def create_company_evaluations():
    print("=== CREANDO EVALUACIONES DE EMPRESA A ESTUDIANTE ===")
    
    # Buscar o crear categoría de evaluación
    category, created = EvaluationCategory.objects.get_or_create(
        name='Evaluación General',
        defaults={
            'description': 'Evaluación general del desempeño en el proyecto',
            'is_active': True
        }
    )
    print(f"✅ Categoría de evaluación: {category.name}")
    
    # Buscar estudiante
    user = User.objects.filter(email='juan.perez@uchile.cl').first()
    if not user:
        print("❌ Usuario juan.perez@uchile.cl no encontrado")
        return
    print(f"✅ Usuario encontrado: {user.first_name} {user.last_name}")

    from students.models import Estudiante
    estudiante = Estudiante.objects.filter(user=user).first()
    if not estudiante:
        print("❌ No se encontró el objeto Estudiante para el usuario")
        return
    print(f"✅ Estudiante encontrado: {estudiante}")

    # Buscar aplicaciones aceptadas del estudiante
    accepted_applications = Aplicacion.objects.filter(
        student=estudiante,
        status='accepted'
    )
    
    if not accepted_applications.exists():
        print("❌ No hay aplicaciones aceptadas para crear evaluaciones")
        return
    
    print(f"✅ Aplicaciones aceptadas encontradas: {accepted_applications.count()}")
    
    # Crear evaluaciones de empresa a estudiante
    evaluations_created = 0
    
    for application in accepted_applications[:3]:  # Crear evaluaciones para las primeras 3
        project = application.project
        
        # Verificar si ya existe una evaluación de empresa para este proyecto
        existing_evaluation = Evaluation.objects.filter(
            student=user,
            project=project,
            evaluator_role='company'
        ).first()
        
        if existing_evaluation:
            print(f"⚠️ Evaluación de empresa ya existe para proyecto: {project.title}")
            continue
        
        # Crear evaluador (empresa)
        evaluator = project.company.user if project.company else None
        
        if not evaluator:
            print(f"⚠️ No hay empresa asociada al proyecto: {project.title}")
            continue
        
        # Generar puntuación aleatoria (1-5 estrellas)
        score = random.uniform(3.0, 5.0)
        
        # Crear evaluación de empresa a estudiante
        evaluation = Evaluation.objects.create(
            student=user,
            project=project,
            evaluator=evaluator,
            category=category,
            score=score,
            overall_rating=score,
            comments=f"Evaluación de empresa: El estudiante demostró excelente desempeño en {project.title}. Cumplió con todas las expectativas del proyecto.",
            strengths="Responsabilidad, Habilidades técnicas, Trabajo en equipo",
            areas_for_improvement="Documentación técnica",
            evaluation_date=datetime.now() - timedelta(days=random.randint(1, 30)),
            status='completed',
            evaluator_role='company'
        )
        
        print(f"✅ Evaluación de empresa creada: {project.title} - Puntuación: {score:.1f}/5")
        evaluations_created += 1
    
    print(f"\n🎉 Se crearon {evaluations_created} evaluaciones de empresa a estudiante")
    
    # Mostrar resumen
    company_evaluations = Evaluation.objects.filter(student=user, evaluator_role='company').count()
    admin_evaluations = Evaluation.objects.filter(student=user, evaluator_role='admin').count()
    print(f"\n📊 Total evaluaciones del estudiante:")
    print(f"   - Empresa → Estudiante: {company_evaluations}")
    print(f"   - Admin → Estudiante: {admin_evaluations}")

if __name__ == "__main__":
    create_company_evaluations() 