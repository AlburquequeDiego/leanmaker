#!/usr/bin/env python
"""
Script para examinar las evaluaciones y entender el problema con el rating de empresas
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

def examinar_evaluaciones():
    print("🔍 EXAMINANDO EVALUACIONES Y RATINGS")
    print("=" * 50)
    
    # 1. Examinar empresas y sus ratings
    print("\n📊 EMPRESAS Y SUS RATINGS:")
    empresas = Empresa.objects.all()
    for empresa in empresas:
        print(f"Empresa: {empresa.company_name}")
        print(f"  - Rating actual: {empresa.rating}")
        print(f"  - Rating calculado: {empresa.calcular_gpa_real()}")
        
        # Buscar evaluaciones donde la empresa es evaluada
        evaluaciones_empresa = Evaluation.objects.filter(
            project__company=empresa,
            status='completed',
            evaluation_type='student_to_company'
        )
        print(f"  - Evaluaciones recibidas: {evaluaciones_empresa.count()}")
        
        if evaluaciones_empresa.exists():
            for eval in evaluaciones_empresa[:3]:  # Mostrar solo las primeras 3
                print(f"    * Proyecto: {eval.project.title}")
                print(f"      Estudiante: {eval.student.user.full_name}")
                print(f"      Score: {eval.score}")
                print(f"      Fecha: {eval.evaluation_date}")
        print()
    
    # 2. Examinar estudiantes y sus GPAs
    print("\n📊 ESTUDIANTES Y SUS GPAS:")
    estudiantes = Estudiante.objects.all()[:5]  # Solo los primeros 5
    for estudiante in estudiantes:
        print(f"Estudiante: {estudiante.user.full_name}")
        print(f"  - GPA actual: {estudiante.gpa}")
        
        # Buscar evaluaciones donde el estudiante es evaluado
        evaluaciones_estudiante = Evaluation.objects.filter(
            student=estudiante,
            status='completed',
            evaluation_type='company_to_student'
        )
        print(f"  - Evaluaciones recibidas: {evaluaciones_estudiante.count()}")
        
        if evaluaciones_estudiante.exists():
            for eval in evaluaciones_estudiante[:3]:  # Mostrar solo las primeras 3
                print(f"    * Proyecto: {eval.project.title}")
                print(f"      Empresa: {eval.project.company.company_name}")
                print(f"      Score: {eval.score}")
                print(f"      Fecha: {eval.evaluation_date}")
        print()
    
    # 3. Examinar todas las evaluaciones
    print("\n📊 TODAS LAS EVALUACIONES:")
    evaluaciones = Evaluation.objects.all()
    print(f"Total de evaluaciones: {evaluaciones.count()}")
    
    # Contar por tipo
    company_to_student = evaluaciones.filter(evaluation_type='company_to_student').count()
    student_to_company = evaluaciones.filter(evaluation_type='student_to_company').count()
    
    print(f"Evaluaciones empresa → estudiante: {company_to_student}")
    print(f"Evaluaciones estudiante → empresa: {student_to_company}")
    
    # 4. Examinar proyectos
    print("\n📊 PROYECTOS:")
    proyectos = Proyecto.objects.all()
    print(f"Total de proyectos: {proyectos.count()}")
    
    for proyecto in proyectos[:3]:  # Solo los primeros 3
        print(f"Proyecto: {proyecto.title}")
        print(f"  - Empresa: {proyecto.company.company_name}")
        print(f"  - Estado: {proyecto.status}")
        
        # Buscar evaluaciones del proyecto
        evaluaciones_proyecto = Evaluation.objects.filter(project=proyecto)
        print(f"  - Evaluaciones: {evaluaciones_proyecto.count()}")
        
        for eval in evaluaciones_proyecto:
            print(f"    * Tipo: {eval.evaluation_type}")
            print(f"      Score: {eval.score}")
            print(f"      Status: {eval.status}")
        print()

def verificar_calculos():
    print("\n🔧 VERIFICANDO CÁLCULOS:")
    print("=" * 50)
    
    # Verificar una empresa específica
    empresa = Empresa.objects.first()
    if empresa:
        print(f"Verificando empresa: {empresa.company_name}")
        
        # Método actual
        rating_actual = empresa.rating
        print(f"Rating actual en BD: {rating_actual}")
        
        # Método de cálculo
        rating_calculado = empresa.calcular_gpa_real()
        print(f"Rating calculado: {rating_calculado}")
        
        # Verificar si hay diferencia
        if rating_actual != rating_calculado:
            print(f"⚠️  PROBLEMA: Rating en BD ({rating_actual}) != Rating calculado ({rating_calculado})")
            
            # Forzar actualización
            print("🔄 Forzando actualización...")
            empresa.actualizar_calificacion()
            empresa.refresh_from_db()
            print(f"Rating después de actualización: {empresa.rating}")
        else:
            print("✅ Rating correcto")

if __name__ == "__main__":
    try:
        examinar_evaluaciones()
        verificar_calculos()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
