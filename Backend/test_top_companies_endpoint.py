#!/usr/bin/env python3
"""
Script para probar el endpoint de top companies y verificar que devuelve el correo empresarial
"""

import os
import sys
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_top_companies_endpoint():
    """Prueba el endpoint de top companies"""
    
    print("🧪 [TEST] Probando endpoint de top companies...")
    
    try:
        # Hacer request al endpoint
        response = requests.get('http://localhost:8000/api/hub/analytics/')
        
        if response.status_code == 200:
            data = response.json()
            top_companies = data.get('topCompanies', [])
            
            print(f"✅ [TEST] Endpoint respondió correctamente")
            print(f"📊 [TEST] Total de empresas: {len(top_companies)}")
            
            if top_companies:
                print("\n🔍 [TEST] Detalles de las primeras 5 empresas:")
                for i, company in enumerate(top_companies[:5]):
                    print(f"  {i+1}. {company.get('name', 'Sin nombre')}")
                    print(f"     Correo (industry): {company.get('industry', 'Sin industry')}")
                    print(f"     Proyectos: {company.get('totalProjects', 0)}")
                    print(f"     Rating: {company.get('averageRating', 0)}")
                    print()
                
                # Verificar que no hay 'Tecnología' como industry
                companies_with_tech = [c for c in top_companies if c.get('industry') == 'Tecnología']
                if companies_with_tech:
                    print(f"⚠️ [TEST] ADVERTENCIA: {len(companies_with_tech)} empresas aún muestran 'Tecnología' como industry")
                else:
                    print("✅ [TEST] Todas las empresas muestran correo empresarial en lugar de 'Tecnología'")
                
                # Verificar que hay correos válidos
                companies_with_email = [c for c in top_companies if '@' in str(c.get('industry', ''))]
                print(f"✅ [TEST] {len(companies_with_email)} empresas tienen correo válido en industry")
                
            else:
                print("ℹ️ [TEST] No hay empresas en la base de datos")
                
        else:
            print(f"❌ [TEST] Error en el endpoint: {response.status_code}")
            print(f"Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ [TEST] No se pudo conectar al servidor. Asegúrate de que esté ejecutándose.")
    except Exception as e:
        print(f"❌ [TEST] Error inesperado: {str(e)}")

if __name__ == '__main__':
    test_top_companies_endpoint()
