#!/usr/bin/env python3
"""
Script para debuggear el cálculo de GPA de empresas
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

def debug_gpa_calculation():
    """Debug del cálculo de GPA de empresas"""
    print("🔍 DEBUG: Cálculo de GPA de empresas")
    print("=" * 50)
    
    # Obtener todas las empresas
    empresas = Empresa.objects.all()
    print(f"📊 Total de empresas: {empresas.count()}")
    
    for empresa in empresas:
        print(f"\n🏢 Empresa: {empresa.company_name}")
        print(f"   - ID: {empresa.id}")
        print(f"   - Rating en modelo: {empresa.rating}")
        print(f"   - Tipo de rating: {type(empresa.rating)}")
        
        # Intentar calcular GPA real
        try:
            gpa_real = empresa.calcular_gpa_real()
            print(f"   - GPA calculado: {gpa_real}")
            print(f"   - Tipo de GPA: {type(gpa_real)}")
        except Exception as e:
            print(f"   - ❌ Error al calcular GPA: {e}")
            continue
        
        # Verificar evaluaciones directamente
        try:
            evaluaciones = Evaluation.objects.filter(
                project__company=empresa,
                status='completed',
                evaluation_type='student_to_company'
            )
            print(f"   - Evaluaciones encontradas: {evaluaciones.count()}")
            
            if evaluaciones.exists():
                print("   - Detalle de evaluaciones:")
                for eval in evaluaciones[:5]:  # Mostrar solo las primeras 5
                    print(f"     * Proyecto: {eval.project.title if eval.project else 'N/A'}")
                    print(f"       Score: {eval.score}")
                    print(f"       Tipo: {eval.evaluation_type}")
                    print(f"       Status: {eval.status}")
            else:
                print("   - ⚠️ No hay evaluaciones completadas")
                
        except Exception as e:
            print(f"   - ❌ Error al buscar evaluaciones: {e}")
        
        # Verificar si hay proyectos
        try:
            proyectos = empresa.proyectos.all()
            print(f"   - Total proyectos: {proyectos.count()}")
        except Exception as e:
            print(f"   - ❌ Error al buscar proyectos: {e}")

def check_evaluations_table():
    """Verificar la tabla de evaluaciones"""
    print("\n🔍 DEBUG: Tabla de evaluaciones")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    e.id,
                    e.score,
                    e.status,
                    e.evaluation_type,
                    p.title as proyecto,
                    c.company_name as empresa
                FROM evaluations_evaluation e
                LEFT JOIN projects_proyecto p ON e.project_id = p.id
                LEFT JOIN companies_empresa c ON p.company_id = c.id
                WHERE e.evaluation_type = 'student_to_company'
                LIMIT 10
            """)
            
            rows = cursor.fetchall()
            print(f"📊 Evaluaciones de estudiantes a empresas: {len(rows)}")
            
            for row in rows:
                print(f"   - ID: {row[0]}, Score: {row[1]}, Status: {row[2]}, Tipo: {row[3]}")
                print(f"     Proyecto: {row[4]}, Empresa: {row[5]}")
                
    except Exception as e:
        print(f"❌ Error al consultar tabla: {e}")

def check_companies_table():
    """Verificar la tabla de empresas"""
    print("\n🔍 DEBUG: Tabla de empresas")
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
                LIMIT 10
            """)
            
            rows = cursor.fetchall()
            print(f"📊 Empresas en BD: {len(rows)}")
            
            for row in rows:
                print(f"   - ID: {row[0]}, Nombre: {row[1]}, Rating: {row[2]}, Verified: {row[3]}, Status: {row[4]}")
                
    except Exception as e:
        print(f"❌ Error al consultar tabla: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando debug de GPA de empresas...")
    
    # Debug principal
    debug_gpa_calculation()
    
    # Verificar tablas
    check_evaluations_table()
    check_companies_table()
    
    print("\n✅ Debug completado")
