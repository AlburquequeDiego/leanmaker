#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante

def test_my_projects_endpoint():
    print("🔍 TESTING MY_PROJECTS ENDPOINT")
    print("=" * 50)
    
    # 1. Obtener un estudiante para hacer la prueba
    try:
        student = Estudiante.objects.first()
        if not student:
            print("❌ No hay estudiantes en la base de datos")
            return
        
        user = student.user
        print(f"🔍 Usando estudiante: {user.email}")
        
        # 2. Obtener token (simular login)
        # Nota: Esto es una simulación, en producción necesitarías hacer login real
        print("🔍 Simulando autenticación...")
        
        # 3. Hacer request al endpoint
        url = "http://localhost:8000/api/projects/my_projects/"
        headers = {
            'Authorization': f'Bearer test_token_{user.id}',  # Token simulado
            'Content-Type': 'application/json'
        }
        
        print(f"🔍 Haciendo request a: {url}")
        print(f"🔍 Headers: {headers}")
        
        try:
            response = requests.get(url, headers=headers)
            print(f"🔍 Status Code: {response.status_code}")
            print(f"🔍 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"🔍 Response Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                if 'data' in data:
                    projects = data['data']
                    print(f"🔍 Cantidad de proyectos: {len(projects)}")
                    
                    for i, project in enumerate(projects):
                        print(f"🔍 Proyecto {i+1}:")
                        print(f"    - ID: {project.get('id')}")
                        print(f"    - Título: {project.get('title')}")
                        print(f"    - Status: {project.get('status')}")
                        print(f"    - Empresa: {project.get('company')}")
                        print()
                else:
                    print("❌ No se encontró el campo 'data' en la respuesta")
            else:
                print(f"❌ Error en la respuesta: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ No se pudo conectar al servidor. Asegúrate de que el servidor esté corriendo en localhost:8000")
        except Exception as e:
            print(f"❌ Error haciendo request: {e}")
            
    except Exception as e:
        print(f"❌ Error general: {e}")

if __name__ == "__main__":
    test_my_projects_endpoint() 