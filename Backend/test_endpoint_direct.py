#!/usr/bin/env python
import requests
import json

def test_endpoint_direct():
    print("=== PROBANDO ENDPOINT DIRECTAMENTE ===")
    
    # URL del endpoint
    url = "http://localhost:8000/api/admin/evaluations/"
    
    try:
        # Hacer la llamada GET
        print(f"🔍 Llamando a: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Respuesta exitosa")
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
                print(f"  Status: {example.get('status')}")
            
            if student_evaluations:
                print(f"\n📝 Ejemplo de evaluación Estudiante → Empresa:")
                example = student_evaluations[0]
                print(f"  ID: {example.get('id')}")
                print(f"  Proyecto: {example.get('project_title')}")
                print(f"  Estudiante: {example.get('student_name')}")
                print(f"  Empresa: {example.get('company_name')}")
                print(f"  Evaluator Type: {example.get('evaluator_type')}")
                print(f"  Score: {example.get('score')}")
                print(f"  Status: {example.get('status')}")
                
        else:
            print(f"❌ Error en la respuesta: {response.status_code}")
            print(f"Contenido: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al servidor")
        print("Asegúrate de que el servidor esté ejecutándose en http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_endpoint_direct() 