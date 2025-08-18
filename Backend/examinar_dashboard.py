#!/usr/bin/env python
"""
Script para examinar las evaluaciones y entender el problema del dashboard
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from students.models import Estudiante
from evaluations.models import Evaluation
from projects.models import Proyecto

def examinar_evaluaciones_dashboard():
    print("🔍 EXAMINANDO EVALUACIONES PARA DASHBOARD")
    print("=" * 60)
    
    # 1. Buscar empresa específica
    empresa = Empresa.objects.filter(company_name__icontains='lucia.amaya@gmail.com').first()
    if empresa:
        print(f"\n📊 EMPRESA: {empresa.company_name}")
        print(f"  - Rating en BD: {empresa.rating}")
        print(f"  - Rating calculado: {empresa.calcular_gpa_real()}")
        
        # Evaluaciones donde la empresa es evaluada por estudiantes
        evaluaciones_empresa = Evaluation.objects.filter(
            project__company=empresa,
            status='completed',
            evaluation_type='student_to_company'
        )
        print(f"  - Evaluaciones recibidas: {evaluaciones_empresa.count()}")
        
        if evaluaciones_empresa.exists():
            print("  - Detalle de evaluaciones:")
            for eval in evaluaciones_empresa:
                print(f"    * Proyecto: {eval.project.title}")
                print(f"      Estudiante: {eval.student.user.full_name}")
                print(f"      Score: {eval.score}")
                print(f"      Fecha: {eval.evaluation_date}")
                print(f"      Status: {eval.status}")
                print()
    
    # 2. Buscar estudiante específico
    estudiante = Estudiante.objects.filter(user__email__icontains='juan.perez').first()
    if estudiante:
        print(f"\n📊 ESTUDIANTE: {estudiante.user.full_name}")
        print(f"  - GPA en BD: {estudiante.gpa}")
        print(f"  - GPA calculado: {estudiante.calcular_gpa_real()}")
        
        # Evaluaciones donde el estudiante es evaluado por empresas
        evaluaciones_estudiante = Evaluation.objects.filter(
            student=estudiante,
            status='completed',
            evaluation_type='company_to_student'
        )
        print(f"  - Evaluaciones recibidas: {evaluaciones_estudiante.count()}")
        
        if evaluaciones_estudiante.exists():
            print("  - Detalle de evaluaciones:")
            for eval in evaluaciones_estudiante:
                print(f"    * Proyecto: {eval.project.title}")
                print(f"      Empresa: {eval.project.company.company_name}")
                print(f"      Score: {eval.score}")
                print(f"      Fecha: {eval.evaluation_date}")
                print(f"      Status: {eval.status}")
                print()
    
    # 3. Examinar todas las evaluaciones
    print("\n📊 TODAS LAS EVALUACIONES EN EL SISTEMA:")
    total_evaluaciones = Evaluation.objects.count()
    print(f"Total: {total_evaluaciones}")
    
    # Por tipo
    company_to_student = Evaluation.objects.filter(evaluation_type='company_to_student').count()
    student_to_company = Evaluation.objects.filter(evaluation_type='student_to_company').count()
    print(f"Empresa → Estudiante: {company_to_student}")
    print(f"Estudiante → Empresa: {student_to_company}")
    
    # Por status
    pending = Evaluation.objects.filter(status='pending').count()
    completed = Evaluation.objects.filter(status='completed').count()
    flagged = Evaluation.objects.filter(status='flagged').count()
    print(f"Status - Pendiente: {pending}, Completada: {completed}, Marcada: {flagged}")
    
    # 4. Examinar evaluaciones específicas
    print("\n🔍 EVALUACIONES ESPECÍFICAS:")
    
    # Evaluaciones de empresa a estudiante
    print("\n📤 EVALUACIONES EMPRESA → ESTUDIANTE:")
    eval_company_to_student = Evaluation.objects.filter(
        evaluation_type='company_to_student',
        status='completed'
    ).select_related('project__company', 'student__user')[:5]
    
    for eval in eval_company_to_student:
        print(f"  - {eval.project.company.company_name} → {eval.student.user.full_name}")
        print(f"    Proyecto: {eval.project.title}")
        print(f"    Score: {eval.score}")
        print(f"    Fecha: {eval.evaluation_date}")
        print()
    
    # Evaluaciones de estudiante a empresa
    print("\n📥 EVALUACIONES ESTUDIANTE → EMPRESA:")
    eval_student_to_company = Evaluation.objects.filter(
        evaluation_type='student_to_company',
        status='completed'
    ).select_related('project__company', 'student__user')[:5]
    
    for eval in eval_student_to_company:
        print(f"  - {eval.student.user.full_name} → {eval.project.company.company_name}")
        print(f"    Proyecto: {eval.project.title}")
        print(f"    Score: {eval.score}")
        print(f"    Fecha: {eval.evaluation_date}")
        print()

def verificar_problemas_dashboard():
    print("\n🔧 VERIFICANDO PROBLEMAS POTENCIALES:")
    print("=" * 50)
    
    # 1. Verificar si hay evaluaciones con status incorrecto
    evaluaciones_problema = Evaluation.objects.filter(
        status__in=['pending', 'flagged']
    ).count()
    print(f"Evaluaciones con status problemático: {evaluaciones_problema}")
    
    # 2. Verificar si hay evaluaciones sin evaluation_type
    evaluaciones_sin_tipo = Evaluation.objects.filter(
        evaluation_type__isnull=True
    ).count()
    print(f"Evaluaciones sin tipo: {evaluaciones_sin_tipo}")
    
    # 3. Verificar si hay evaluaciones con scores inválidos
    evaluaciones_score_invalido = Evaluation.objects.filter(
        score__lt=1
    ).count()
    print(f"Evaluaciones con score < 1: {evaluaciones_score_invalido}")
    
    # 4. Verificar proyectos sin evaluaciones
    proyectos_sin_evaluaciones = Proyecto.objects.filter(
        evaluations__isnull=True
    ).count()
    print(f"Proyectos sin evaluaciones: {proyectos_sin_evaluaciones}")

if __name__ == "__main__":
    try:
        examinar_evaluaciones_dashboard()
        verificar_problemas_dashboard()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
