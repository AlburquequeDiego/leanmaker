#!/usr/bin/env python3
"""
Script de debug para verificar el campo rating de las empresas
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from evaluations.models import Evaluation

def debug_rating_empresas():
    """Debug del campo rating de las empresas"""
    
    print("🔍 [DEBUG] Verificando campo rating de empresas...")
    
    # Obtener todas las empresas
    empresas = Empresa.objects.all()
    print(f"📊 Total de empresas en BD: {empresas.count()}")
    
    if empresas.count() == 0:
        print("❌ No hay empresas en la base de datos")
        return
    
    # Verificar las primeras 5 empresas
    for i, empresa in enumerate(empresas[:5]):
        print(f"\n🏢 Empresa {i+1}: {empresa.company_name}")
        print(f"   - ID: {empresa.id}")
        print(f"   - Rating en BD: {empresa.rating}")
        print(f"   - Tipo de rating: {type(empresa.rating)}")
        print(f"   - Rating es None? {empresa.rating is None}")
        print(f"   - Rating es 0? {empresa.rating == 0}")
        
        # Verificar evaluaciones
        evaluaciones = Evaluation.objects.filter(
            project__company=empresa,
            status='completed',
            evaluation_type='student_to_company'
        )
        print(f"   - Evaluaciones encontradas: {evaluaciones.count()}")
        
        if evaluaciones.exists():
            scores = [e.score for e in evaluaciones]
            print(f"   - Scores: {scores}")
            promedio_manual = sum(scores) / len(scores)
            print(f"   - Promedio manual: {promedio_manual:.2f}")
            # Convertir a float para comparación
            rating_float = float(empresa.rating) if empresa.rating is not None else 0.0
            print(f"   - ¿Coincide con BD? {abs(rating_float - promedio_manual) < 0.01}")
        
        # Verificar proyectos
        proyectos = empresa.proyectos.all()
        print(f"   - Proyectos: {proyectos.count()}")
        
        # Verificar si hay proyectos con evaluaciones
        proyectos_con_evaluaciones = []
        for proyecto in proyectos:
            evals = Evaluation.objects.filter(
                project=proyecto,
                status='completed',
                evaluation_type='student_to_company'
            )
            if evals.exists():
                proyectos_con_evaluaciones.append(proyecto.title)
        
        if proyectos_con_evaluaciones:
            print(f"   - Proyectos con evaluaciones: {proyectos_con_evaluaciones}")
        
        # Llamar al método de actualización
        print(f"   - Llamando a actualizar_calificacion()...")
        try:
            rating_actualizado = empresa.actualizar_calificacion()
            print(f"   - Rating después de actualizar: {rating_actualizado}")
            print(f"   - ¿Cambió? {empresa.rating != rating_actualizado}")
        except Exception as e:
            print(f"   - ❌ Error al actualizar: {e}")
            import traceback
            traceback.print_exc()

def debug_evaluaciones():
    """Debug de las evaluaciones"""
    
    print("\n🔍 [DEBUG] Verificando evaluaciones...")
    
    # Obtener todas las evaluaciones
    evaluaciones = Evaluation.objects.all()
    print(f"📊 Total de evaluaciones: {evaluaciones.count()}")
    
    if evaluaciones.count() == 0:
        print("❌ No hay evaluaciones en la base de datos")
        return
    
    # Verificar las primeras 5 evaluaciones
    for i, eval in enumerate(evaluaciones[:5]):
        print(f"\n📝 Evaluación {i+1}:")
        print(f"   - ID: {eval.id}")
        print(f"   - Proyecto: {eval.project.title if eval.project else 'Sin proyecto'}")
        print(f"   - Empresa: {eval.project.company.company_name if eval.project and eval.project.company else 'Sin empresa'}")
        print(f"   - Estudiante: {eval.student.user.full_name if eval.student and eval.student.user else 'Sin estudiante'}")
        print(f"   - Score: {eval.score}")
        print(f"   - Status: {eval.status}")
        print(f"   - Tipo: {eval.evaluation_type}")
        print(f"   - Fecha: {eval.evaluation_date}")

if __name__ == "__main__":
    print("🚀 Iniciando debug del campo rating...")
    
    try:
        debug_rating_empresas()
        debug_evaluaciones()
    except Exception as e:
        print(f"❌ Error en debug: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🏁 Debug completado")
