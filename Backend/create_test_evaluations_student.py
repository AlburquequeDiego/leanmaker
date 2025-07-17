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

def create_student_evaluations():
    print("=== CREANDO EVALUACIONES DE ESTUDIANTE A EMPRESA ===")
    
    # Buscar o crear categoría de evaluación
    category, created = EvaluationCategory.objects.get_or_create(
        name='Evaluación General',
        defaults={
            'description': 'Evaluación general del desempeño en el proyecto',
            'is_active': True
        }
    )
    print(f"✅ Categoría de evaluación: {category.name}")
    
    # Buscar estudiantes
    students = User.objects.filter(role='student')[:3]  # Tomar los primeros 3 estudiantes
    
    if not students.exists():
        print("❌ No se encontraron estudiantes")
        return
    
    print(f"✅ Estudiantes encontrados: {students.count()}")
    
    # Crear evaluaciones de estudiante a empresa
    evaluations_created = 0
    
    for student in students:
        # Buscar aplicaciones aceptadas del estudiante
        from students.models import Estudiante
        estudiante = Estudiante.objects.filter(user=student).first()
        
        if not estudiante:
            print(f"⚠️ No se encontró el objeto Estudiante para {student.email}")
            continue
        
        accepted_applications = Aplicacion.objects.filter(
            student=estudiante,
            status='accepted'
        )
        
        if not accepted_applications.exists():
            print(f"⚠️ No hay aplicaciones aceptadas para {student.first_name}")
            continue
        
        # Crear evaluación para el primer proyecto aceptado
        application = accepted_applications.first()
        project = application.project
        
        # Verificar si ya existe una evaluación de estudiante para este proyecto
        existing_evaluation = Evaluation.objects.filter(
            student=student,
            project=project,
            evaluator_role='student'
        ).first()
        
        if existing_evaluation:
            print(f"⚠️ Evaluación de estudiante ya existe para proyecto: {project.title}")
            continue
        
        # Generar puntuación aleatoria (1-5 estrellas)
        score = random.uniform(3.0, 5.0)
        
        # Crear evaluación de estudiante a empresa
        evaluation = Evaluation.objects.create(
            student=student,
            project=project,
            evaluator=student,  # El estudiante es el evaluador
            category=category,
            score=score,
            overall_rating=score,
            comments=f"Evaluación de estudiante: La empresa {project.company.company_name if project.company else 'Sin empresa'} proporcionó una excelente experiencia en {project.title}. El proyecto cumplió con todas las expectativas.",
            strengths="Comunicación clara, Recursos proporcionados, Apoyo técnico",
            areas_for_improvement="Documentación del proyecto",
            evaluation_date=datetime.now() - timedelta(days=random.randint(1, 30)),
            status='completed',
            evaluator_role='student'
        )
        
        print(f"✅ Evaluación de estudiante creada: {project.title} - Puntuación: {score:.1f}/5")
        evaluations_created += 1
    
    print(f"\n🎉 Se crearon {evaluations_created} evaluaciones de estudiante a empresa")
    
    # Mostrar resumen
    company_evaluations = Evaluation.objects.filter(evaluator_role='company').count()
    student_evaluations = Evaluation.objects.filter(evaluator_role='student').count()
    print(f"\n📊 Total evaluaciones:")
    print(f"   - Empresa → Estudiante: {company_evaluations}")
    print(f"   - Estudiante → Empresa: {student_evaluations}")

if __name__ == "__main__":
    create_student_evaluations() 