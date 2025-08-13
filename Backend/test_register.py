#!/usr/bin/env python3
"""
Script de prueba para el endpoint de registro
"""

import requests
import json
import time

# URL del endpoint de registro
url = "http://localhost:8000/api/auth/register/"

# Generar timestamp único para emails
timestamp = int(time.time())

# Datos de prueba para un estudiante con email único
student_data = {
    "email": f"test.student.{timestamp}@inacapmail.cl",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "Student",
    "phone": "912345678",
    "birthdate": "2000-01-01",
    "gender": "Masculino",
    "role": "student",
    "career": "Ingeniería Informática",
    "university": "INACAP",
    "education_level": "Universidad"
}

# Datos de prueba para una empresa con email único
company_data = {
    "email": f"test.company.{timestamp}@empresa.cl",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "Company",
    "phone": "912345678",
    "birthdate": "1980-01-01",
    "gender": "Masculino",
    "role": "company",
    "rut": f"12345678-{timestamp % 1000}",
    "personality": "Jurídica",
    "business_name": f"Empresa Test {timestamp} SPA",
    "company_name": f"Empresa Test {timestamp}",
    "company_address": "Av. Test 123, Santiago",
    "company_phone": "912345678",
    "company_email": f"contacto{timestamp}@empresatest.cl"
}

def test_student_registration():
    """Prueba el registro de un estudiante"""
    print("🔍 Probando registro de estudiante...")
    print(f"Email: {student_data['email']}")
    try:
        response = requests.post(url, json=student_data, headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registro de estudiante exitoso")
        else:
            print("❌ Error en registro de estudiante")
            
    except Exception as e:
        print(f"💥 Error de conexión: {e}")

def test_company_registration():
    """Prueba el registro de una empresa"""
    print("\n🔍 Probando registro de empresa...")
    print(f"Email: {company_data['email']}")
    try:
        response = requests.post(url, json=company_data, headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registro de empresa exitoso")
        else:
            print("❌ Error en registro de empresa")
            
    except Exception as e:
        print(f"💥 Error de conexión: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del endpoint de registro...")
    print(f"URL: {url}")
    print(f"Timestamp: {timestamp}")
    print("=" * 50)
    
    # Probar registro de estudiante
    test_student_registration()
    
    print("\n" + "=" * 50)
    
    # Probar registro de empresa
    test_company_registration()
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas")
