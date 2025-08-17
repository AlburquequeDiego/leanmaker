#!/usr/bin/env python3
"""
Script para verificar evaluaciones de empresas en la base de datos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from evaluations.models import Evaluation
from django.db import connection

def check_evaluations():
    """Verificar evaluaciones de empresas"""
    print("🔍 VERIFICANDO EVALUACIONES DE EMPRESAS")
    print("=" * 50)
    
    # 1. Verificar empresas
    empresas = Empresa.objects.all()
    print(f"📊 Total de empresas: {empresas.count()}")
    
    for empresa in empresas:
        print(f"\n🏢 Empresa: {empresa.company_name}")
        print(f"   - ID: {empresa.id}")
        print(f"   - Rating en modelo: {empresa.rating}")
        print(f"   - Tipo de rating: {type(empresa.rating)}")
        
        # 2. Verificar evaluaciones de esta empresa
        try:
            evaluaciones = Evaluation.objects.filter(
                project__company=empresa,
                evaluation_type='student_to_company'
            )
            print(f"   - Evaluaciones totales: {evaluaciones.count()}")
            
            evaluaciones_completadas = evaluaciones.filter(status='completed')
            print(f"   - Evaluaciones completadas: {evaluaciones_completadas.count()}")
            
            if evaluaciones_completadas.exists():
                print("   - Detalle de evaluaciones completadas:")
                for eval in evaluaciones_completadas[:5]:
                    print(f"     * Proyecto: {eval.project.title if eval.project else 'N/A'}")
                    print(f"       Score: {eval.score}")
                    print(f"       Tipo: {eval.evaluation_type}")
                    print(f"       Status: {eval.status}")
                    print(f"       Fecha: {eval.evaluation_date}")
            else:
                print("   - ⚠️ No hay evaluaciones completadas")
                
        except Exception as e:
            print(f"   - ❌ Error al buscar evaluaciones: {e}")
    
    # 3. Verificar tabla de evaluaciones directamente
    print(f"\n🔍 VERIFICANDO TABLA DE EVALUACIONES")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    e.id,
                    e.score,
                    e.status,
                    e.evaluation_type,
                    e.evaluation_date,
                    p.title as proyecto,
                    c.company_name as empresa
                FROM evaluations_evaluation e
                LEFT JOIN projects_proyecto p ON e.project_id = p.id
                LEFT JOIN companies_empresa c ON p.company_id = c.id
                WHERE e.evaluation_type = 'student_to_company'
                ORDER BY e.evaluation_date DESC
                LIMIT 10
            """)
            
            rows = cursor.fetchall()
            print(f"📊 Evaluaciones de estudiantes a empresas: {len(rows)}")
            
            for row in rows:
                print(f"   - ID: {row[0]}, Score: {row[1]}, Status: {row[2]}, Tipo: {row[3]}")
                print(f"     Fecha: {row[4]}, Proyecto: {row[5]}, Empresa: {row[6]}")
                
    except Exception as e:
        print(f"❌ Error al consultar tabla: {e}")
        import traceback
        traceback.print_exc()
    
    # 4. Verificar tabla de empresas
    print(f"\n🔍 VERIFICANDO TABLA DE EMPRESAS")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    company_name,
                    rating,
                    verified,
                    status
                FROM companies_empresa
                ORDER BY rating DESC
                LIMIT 10
            """)
            
            rows = cursor.fetchall()
            print(f"📊 Empresas en BD: {len(rows)}")
            
            for row in rows:
                print(f"   - ID: {row[0]}, Nombre: {row[1]}, Rating: {row[2]}, Verified: {row[3]}, Status: {row[4]}")
                
    except Exception as e:
        print(f"❌ Error al consultar tabla: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Iniciando verificación de evaluaciones...")
    check_evaluations()
    print("\n✅ Verificación completada")
