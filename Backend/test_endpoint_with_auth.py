#!/usr/bin/env python
import requests
import json

def test_endpoint_with_auth():
    print("=== PROBANDO ENDPOINT CON AUTENTICACIÓN ===")
    
    # Credenciales del admin
    login_data = {
        "email": "adminprueba@leanmaker.com",
        "password": "admin123"
    }
    
    try:
        # 1. Obtener token de autenticación
        print("🔐 Obteniendo token de autenticación...")
        login_url = "http://localhost:8000/api/token/"
        login_response = requests.post(login_url, json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"Contenido: {login_response.text}")
            return
        
        login_data_response = login_response.json()
        access_token = login_data_response.get('access')
        
        if not access_token:
            print("❌ No se obtuvo token de acceso")
            return
        
        print("✅ Token obtenido exitosamente")
        
        # 2. Llamar al endpoint de evaluaciones con el token
        print("\n🔍 Llamando al endpoint de evaluaciones...")
        evaluations_url = "http://localhost:8000/api/admin/evaluations/"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(evaluations_url, headers=headers, timeout=10)
        
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
    test_endpoint_with_auth() 