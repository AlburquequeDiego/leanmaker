#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from evaluations.models import Evaluation
from users.models import User

def check_evaluations():
    print("=== VERIFICANDO EVALUACIONES ===")
    
    # Verificar total de evaluaciones
    total_evaluations = Evaluation.objects.count()
    print(f"Total evaluaciones en BD: {total_evaluations}")
    
    # Buscar estudiante
    student = User.objects.filter(role='student').first()
    if student:
        print(f"Estudiante encontrado: {student.email}")
        
        # Verificar evaluaciones del estudiante
        student_evaluations = Evaluation.objects.filter(student=student)
        print(f"Evaluaciones del estudiante: {student_evaluations.count()}")
        
        if student_evaluations.count() > 0:
            print("\n=== EVALUACIONES DEL ESTUDIANTE ===")
            for eval in student_evaluations[:5]:  # Mostrar solo las primeras 5
                print(f"✅ {eval.project.title if eval.project else 'Sin proyecto'} - {eval.evaluator.email if eval.evaluator else 'Sin evaluador'} - Puntuación: {eval.overall_rating}")
        else:
            print("❌ No hay evaluaciones para este estudiante")
    else:
        print("❌ No se encontró ningún estudiante")

if __name__ == "__main__":
    check_evaluations() 