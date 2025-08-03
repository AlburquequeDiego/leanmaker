#!/usr/bin/env python
"""
Script para probar el endpoint de estadísticas de empresa
"""
import requests
import json

def test_company_stats_api():
    """Prueba el endpoint de estadísticas de empresa"""
    
    # URL del endpoint
    url = "http://localhost:8000/api/dashboard/company_stats/"
    
    # Headers (sin autenticación por ahora, solo para probar)
    headers = {
        'Content-Type': 'application/json',
    }
    
    print("🔍 PROBANDO ENDPOINT DE ESTADÍSTICAS DE EMPRESA")
    print("=" * 60)
    print(f"URL: {url}")
    print()
    
    try:
        # Hacer la petición
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"📡 Status Code: {response.status_code}")
        print(f"📡 Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ RESPUESTA EXITOSA:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
            except json.JSONDecodeError:
                print("❌ Error decodificando JSON:")
                print(response.text)
        else:
            print("❌ RESPUESTA CON ERROR:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: El servidor no está ejecutándose")
    except requests.exceptions.Timeout:
        print("❌ Timeout: La petición tardó demasiado")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    test_company_stats_api() 