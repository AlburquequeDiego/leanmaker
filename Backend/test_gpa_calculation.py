#!/usr/bin/env python
"""
Script para probar el cálculo del GPA en el endpoint de empresas para administradores
"""
import requests
import json

def test_gpa_calculation():
    # URL base
    base_url = "http://localhost:8000"

    # 1. Primero hacer login para obtener token
    login_data = {
        "email": "admin@gmail.com",
        "password": "admin123"
    }

    print("🔐 Intentando hacer login...")
    try:
        login_response = requests.post(f"{base_url}/api/token/", json=login_data)
        print(f"Status code login: {login_response.status_code}")

        if login_response.status_code == 200:
            login_result = login_response.json()
            print(f"Login exitoso: {login_result}")

            # Extraer token
            if 'access' in login_result:
                token = login_result['access']
                print(f"✅ Token obtenido: {token[:50]}...")

                # 2. Probar endpoint del listado de empresas para admin
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }

                print("\n🏢 Probando endpoint de empresas para admin...")
                companies_response = requests.get(f"{base_url}/api/companies/admin/companies/", headers=headers)
                print(f"Status code empresas: {companies_response.status_code}")

                if companies_response.status_code == 200:
                    companies_data = companies_response.json()
                    print("✅ Datos de empresas obtenidos:")
                    
                    # Verificar el cálculo del GPA
                    print(f"\n📊 Verificando cálculo del GPA:")
                    print(f"Total empresas: {companies_data.get('count', 0)}")
                    
                    if 'results' in companies_data and companies_data['results']:
                        for i, company in enumerate(companies_data['results'][:5]):  # Mostrar solo las primeras 5
                            company_name = company.get('company_name', 'Sin nombre')
                            rating = company.get('rating', 0)
                            gpa = company.get('gpa', 0)
                            
                            print(f"\n  Empresa {i+1}: {company_name}")
                            print(f"    Rating: {rating}")
                            print(f"    GPA: {gpa}")
                            
                            # Verificar que el GPA esté en el rango correcto (0-5)
                            if 0 <= gpa <= 5:
                                print(f"    ✅ GPA válido (0-5)")
                            else:
                                print(f"    ❌ GPA fuera de rango (0-5)")
                            
                            # Verificar que el GPA coincida con el rating
                            if abs(gpa - rating) < 0.01:  # Tolerancia para decimales
                                print(f"    ✅ GPA coincide con rating")
                            else:
                                print(f"    ❌ GPA no coincide con rating")
                    else:
                        print("❌ No hay resultados de empresas")
                        
                else:
                    print(f"❌ Error en empresas: {companies_response.text}")

            else:
                print("❌ No se pudo obtener el token del login")

        else:
            print(f"❌ Error en login: {login_response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor. Asegúrate de que esté corriendo en puerto 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_gpa_calculation()
