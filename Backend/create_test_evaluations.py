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

def create_test_evaluations():
    print("=== CREANDO EVALUACIONES DE PRUEBA ===")
    
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
    
    # Crear evaluaciones para algunas aplicaciones
    evaluations_created = 0
    
    for application in accepted_applications[:5]:  # Crear evaluaciones para las primeras 5
        project = application.project
        
        # Verificar si ya existe una evaluación para este proyecto
        existing_evaluation = Evaluation.objects.filter(
            student=user,
            project=project
        ).first()
        
        if existing_evaluation:
            print(f"⚠️ Evaluación ya existe para proyecto: {project.title}")
            continue
        
        # Crear evaluador (empresa)
        evaluator = project.company.user if project.company else None
        
        # Generar puntuación aleatoria
        overall_rating = random.randint(70, 100)
        
        # Crear evaluación
        evaluation = Evaluation.objects.create(
            student=user,
            project=project,
            evaluator=evaluator,
            overall_rating=overall_rating,
            comments=f"Excelente trabajo en el proyecto {project.title}. El estudiante demostró habilidades técnicas sólidas y buena capacidad de trabajo en equipo.",
            strengths=["Trabajo en equipo", "Habilidades técnicas", "Puntualidad"],
            areas_for_improvement=["Documentación", "Comunicación"],
            evaluation_date=datetime.now() - timedelta(days=random.randint(1, 30)),
            status='completed'
        )
        
        print(f"✅ Evaluación creada: {project.title} - Puntuación: {overall_rating}")
        evaluations_created += 1
    
    print(f"\n🎉 Se crearon {evaluations_created} evaluaciones de prueba")
    
    # Mostrar resumen
    total_evaluations = Evaluation.objects.filter(student=user).count()
    print(f"\n📊 Total evaluaciones del estudiante: {total_evaluations}")

if __name__ == "__main__":
    create_test_evaluations() 