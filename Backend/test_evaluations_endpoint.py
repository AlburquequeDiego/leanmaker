#!/usr/bin/env python
import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from evaluations.models import Evaluation
from users.models import User

def test_evaluations_endpoint():
    print("=== PROBANDO ENDPOINT DE EVALUACIONES ===")
    
    # Verificar datos en la base de datos
    print("\n📊 Estado de la base de datos:")
    total = Evaluation.objects.count()
    company_count = Evaluation.objects.filter(evaluator_role='company').count()
    student_count = Evaluation.objects.filter(evaluator_role='student').count()
    
    print(f"Total evaluaciones: {total}")
    print(f"Empresa → Estudiante: {company_count}")
    print(f"Estudiante → Empresa: {student_count}")
    
    # Obtener un token de admin (simular)
    try:
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            print("❌ No se encontró usuario admin")
            return
        
        print(f"\n✅ Usuario admin encontrado: {admin_user.email}")
        
        # Simular llamada al endpoint
        print("\n🔍 Probando endpoint /api/admin/evaluations/")
        
        # Crear una sesión de Django para simular la llamada
        from django.test import Client
        from django.contrib.auth import get_user_model
        
        client = Client()
        
        # Simular login del admin
        client.force_login(admin_user)
        
        # Hacer la llamada al endpoint
        response = client.get('/api/admin/evaluations/')
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total en respuesta: {data.get('count', 0)}")
            print(f"Evaluaciones en results: {len(data.get('results', []))}")
            
            # Analizar las evaluaciones
            evaluations = data.get('results', [])
            company_evaluations = [e for e in evaluations if e.get('evaluator_type') == 'company']
            student_evaluations = [e for e in evaluations if e.get('evaluator_type') == 'student']
            
            print(f"\n📋 Evaluaciones por tipo:")
            print(f"Empresa → Estudiante: {len(company_evaluations)}")
            print(f"Estudiante → Empresa: {len(student_evaluations)}")
            
            # Mostrar algunas evaluaciones de ejemplo
            if company_evaluations:
                print(f"\n📝 Ejemplo de evaluación Empresa → Estudiante:")
                example = company_evaluations[0]
                print(f"  ID: {example.get('id')}")
                print(f"  Proyecto: {example.get('project_title')}")
                print(f"  Estudiante: {example.get('student_name')}")
                print(f"  Empresa: {example.get('company_name')}")
                print(f"  Evaluator Type: {example.get('evaluator_type')}")
                print(f"  Score: {example.get('score')}")
            
            if student_evaluations:
                print(f"\n📝 Ejemplo de evaluación Estudiante → Empresa:")
                example = student_evaluations[0]
                print(f"  ID: {example.get('id')}")
                print(f"  Proyecto: {example.get('project_title')}")
                print(f"  Estudiante: {example.get('student_name')}")
                print(f"  Empresa: {example.get('company_name')}")
                print(f"  Evaluator Type: {example.get('evaluator_type')}")
                print(f"  Score: {example.get('score')}")
                
        else:
            print(f"❌ Error en la respuesta: {response.content}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_evaluations_endpoint() 