#!/usr/bin/env python
"""
Script de prueba para verificar endpoints de notificaciones
"""

import requests
import json

def test_notification_endpoint():
    """Prueba el endpoint de notificaciones"""
    
    # URL base
    base_url = "http://localhost:8000"
    
    # Endpoint de prueba
    test_url = f"{base_url}/api/notifications/test/"
    
    print("🧪 Probando endpoint de notificaciones...")
    print(f"URL: {test_url}")
    
    try:
        # Hacer petición POST
        response = requests.post(
            test_url,
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'  # Token de prueba
            },
            data=json.dumps({'test': 'data'}),
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 405:
            print("❌ Error 405: Método no permitido")
        elif response.status_code == 200:
            print("✅ Endpoint responde correctamente")
        else:
            print(f"⚠️ Status code inesperado: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se puede conectar al servidor")
    except requests.exceptions.Timeout:
        print("❌ Timeout: El servidor no respondió a tiempo")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    test_notification_endpoint() 