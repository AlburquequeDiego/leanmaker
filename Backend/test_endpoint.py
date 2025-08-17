#!/usr/bin/env python
"""
Script para probar el endpoint del dashboard admin
"""
import requests
import json

def test_admin_dashboard():
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
                
                # 2. Probar endpoint del dashboard admin
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                print("\n📊 Probando endpoint del dashboard admin...")
                dashboard_response = requests.get(f"{base_url}/api/dashboard/admin_stats/", headers=headers)
                print(f"Status code dashboard: {dashboard_response.status_code}")
                
                if dashboard_response.status_code == 200:
                    dashboard_data = dashboard_response.json()
                    print("✅ Datos del dashboard:")
                    print(json.dumps(dashboard_data, indent=2, ensure_ascii=False))
                else:
                    print(f"❌ Error en dashboard: {dashboard_response.text}")
                    
            else:
                print("❌ No se pudo obtener el token del login")
                
        else:
            print(f"❌ Error en login: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor. Asegúrate de que esté corriendo en puerto 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_admin_dashboard()
