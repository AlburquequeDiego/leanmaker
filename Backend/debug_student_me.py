#!/usr/bin/env python
"""
Script para depurar el endpoint /api/students/me/
"""

import os
import sys
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from core.views import verify_token, generate_access_token

def debug_student_me():
    """Depurar el endpoint /api/students/me/"""
    print("=== DEPURACIÓN ENDPOINT /api/students/me/ ===")
    
    # 1. Verificar usuario
    try:
        user = User.objects.get(email='juan.perez@uchile.cl')
        print(f"✅ Usuario encontrado: {user.email}, Rol: {user.role}, ID: {user.id}")
    except User.DoesNotExist:
        print("❌ Usuario juan.perez@uchile.cl no encontrado")
        return
    
    # 2. Generar token JWT
    try:
        token = generate_access_token(user)
        print(f"✅ Token JWT generado: {token[:50]}...")
    except Exception as e:
        print(f"❌ Error generando token: {e}")
        return
    
    # 3. Verificar token
    try:
        verified_user = verify_token(token)
        if verified_user:
            print(f"✅ Token verificado correctamente: {verified_user.email}, Rol: {verified_user.role}")
        else:
            print("❌ Token no se pudo verificar")
            return
    except Exception as e:
        print(f"❌ Error verificando token: {e}")
        return
    
    # 4. Probar endpoint directamente
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Probar endpoint de prueba primero
        print(f"\n=== PROBANDO ENDPOINT DE PRUEBA ===")
        response_test = requests.get('http://localhost:8000/api/students/test/', headers=headers)
        print(f"✅ Respuesta del endpoint de prueba: Status {response_test.status_code}")
        print(f"✅ Contenido: {response_test.text}")
        
        # Probar endpoint original
        print(f"\n=== PROBANDO ENDPOINT ORIGINAL ===")
        response = requests.get('http://localhost:8000/api/students/me/', headers=headers)
        print(f"✅ Respuesta del endpoint: Status {response.status_code}")
        print(f"✅ Contenido: {response.text}")
        
    except Exception as e:
        print(f"❌ Error haciendo request: {e}")
    
    # 5. Verificar configuración JWT
    from django.conf import settings
    print(f"\n=== CONFIGURACIÓN JWT ===")
    print(f"JWT_SECRET_KEY: {settings.JWT_SECRET_KEY}")
    print(f"JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
    print(f"JWT_ACCESS_TOKEN_EXPIRE_HOURS: {settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS}")

if __name__ == "__main__":
    debug_student_me() 