#!/usr/bin/env python
"""
Script de prueba para verificar endpoints de admin
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "adminprueba@leanmaker.com"
ADMIN_PASSWORD = "admin123"

def test_admin_endpoints():
    """Probar endpoints de admin"""
    
    # 1. Login como admin
    print("🔐 Iniciando sesión como admin...")
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    login_response = requests.post(f"{BASE_URL}/api/token/", json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login exitoso")
    
    # 2. Probar endpoint de estudiantes
    print("\n👥 Probando endpoint de estudiantes...")
    students_response = requests.get(f"{BASE_URL}/api/students/?limit=5&offset=0", headers=headers)
    if students_response.status_code == 200:
        students_data = students_response.json()
        print(f"✅ Estudiantes: {students_data.get('count', 0)} encontrados")
        if students_data.get('results'):
            first_student = students_data['results'][0]
            print(f"   Primer estudiante: {first_student.get('name', 'Sin nombre')} - {first_student.get('email', 'Sin email')}")
    else:
        print(f"❌ Error en estudiantes: {students_response.status_code}")
        print(students_response.text)
    
    # 3. Probar endpoint de proyectos de admin
    print("\n📋 Probando endpoint de proyectos de admin...")
    projects_response = requests.get(f"{BASE_URL}/api/admin/projects/?limit=5&offset=0", headers=headers)
    if projects_response.status_code == 200:
        projects_data = projects_response.json()
        print(f"✅ Proyectos: {projects_data.get('count', 0)} encontrados")
        if projects_data.get('results'):
            first_project = projects_data['results'][0]
            print(f"   Primer proyecto: {first_project.get('title', 'Sin título')}")
    else:
        print(f"❌ Error en proyectos: {projects_response.status_code}")
        print(projects_response.text)
    
    # 4. Probar endpoint de empresas de admin
    print("\n🏢 Probando endpoint de empresas de admin...")
    companies_response = requests.get(f"{BASE_URL}/api/admin/companies/?limit=5&offset=0", headers=headers)
    if companies_response.status_code == 200:
        companies_data = companies_response.json()
        print(f"✅ Empresas: {companies_data.get('count', 0)} encontradas")
        if companies_data.get('results'):
            first_company = companies_data['results'][0]
            print(f"   Primera empresa: {first_company.get('name', 'Sin nombre')}")
    else:
        print(f"❌ Error en empresas: {companies_response.status_code}")
        print(companies_response.text)

if __name__ == "__main__":
    test_admin_endpoints() 