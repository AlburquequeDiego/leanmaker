#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from evaluations.models import Evaluation
from users.models import User

def check_evaluations_data():
    print("=== VERIFICANDO DATOS DE EVALUACIONES ===")
    
    # Verificar datos en la base de datos
    print("\n📊 Estado de la base de datos:")
    total = Evaluation.objects.count()
    company_count = Evaluation.objects.filter(evaluator_role='company').count()
    student_count = Evaluation.objects.filter(evaluator_role='student').count()
    
    print(f"Total evaluaciones: {total}")
    print(f"Empresa → Estudiante: {company_count}")
    print(f"Estudiante → Empresa: {student_count}")
    
    # Mostrar algunas evaluaciones de ejemplo
    print("\n📝 Ejemplos de evaluaciones:")
    
    company_evaluations = Evaluation.objects.filter(evaluator_role='company')[:3]
    for eval in company_evaluations:
        print(f"  Empresa → Estudiante:")
        print(f"    ID: {eval.id}")
        print(f"    Proyecto: {eval.project.title if eval.project else 'Sin proyecto'}")
        print(f"    Estudiante: {eval.student.full_name if eval.student else 'Sin estudiante'}")
        print(f"    Evaluator Role: {eval.evaluator_role}")
        print(f"    Score: {eval.score}")
        print(f"    Status: {eval.status}")
        print()
    
    student_evaluations = Evaluation.objects.filter(evaluator_role='student')[:3]
    for eval in student_evaluations:
        print(f"  Estudiante → Empresa:")
        print(f"    ID: {eval.id}")
        print(f"    Proyecto: {eval.project.title if eval.project else 'Sin proyecto'}")
        print(f"    Estudiante: {eval.student.full_name if eval.student else 'Sin estudiante'}")
        print(f"    Evaluator Role: {eval.evaluator_role}")
        print(f"    Score: {eval.score}")
        print(f"    Status: {eval.status}")
        print()
    
    # Verificar que no hay evaluaciones de admin
    admin_count = Evaluation.objects.filter(evaluator_role='admin').count()
    print(f"❌ Evaluaciones de admin (no deberían existir): {admin_count}")
    
    if admin_count > 0:
        print("⚠️  ADVERTENCIA: Hay evaluaciones con evaluator_role='admin' que no deberían existir")
        admin_evaluations = Evaluation.objects.filter(evaluator_role='admin')
        for eval in admin_evaluations:
            print(f"    ID: {eval.id} - Proyecto: {eval.project.title if eval.project else 'Sin proyecto'}")

if __name__ == "__main__":
    check_evaluations_data() 