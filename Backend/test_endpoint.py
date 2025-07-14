#!/usr/bin/env python
"""
Script para probar el endpoint del dashboard de estudiante
"""

import requests
import json

def test_student_dashboard():
    """Probar el endpoint del dashboard de estudiante"""
    print("=== Probando Endpoint del Dashboard de Estudiante ===")
    
    # Token generado anteriormente
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDRiOGU0NzMtNWNiZi00NjNkLWEzNTQtMGI1MDU4MGRjNWExIiwiZW1haWwiOiJlc3R1ZGlhbnRlMjZAdW5pdmVyc2lkYWQuY2wiLCJyb2xlIjoic3R1ZGVudCIsImV4cCI6MTc1MjQ3MDU3NiwiaWF0IjoxNzUyNDY2OTc2fQ.r8VDX3Kuv5e_wXfFFgGZW4TSyafffIkzVT4fYVnxsqI"
    
    url = "http://localhost:8000/api/dashboard/student_stats/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito! Datos recibidos:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Error! Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error data: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error text: {response.text}")
                
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_student_dashboard() 