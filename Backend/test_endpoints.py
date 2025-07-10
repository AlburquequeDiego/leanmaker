#!/usr/bin/env python
"""
Script de prueba para verificar que los endpoints del dashboard estén funcionando correctamente.
Este script simula las llamadas que hace el frontend y verifica que los datos se devuelvan correctamente.
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def create_test_user(email, role):
    """Crear un usuario de prueba"""
    try:
        user = User.objects.get(email=email)
        print(f"Usuario {email} ya existe")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            password='testpass123',
            role=role,
            first_name='Test',
            last_name='User'
        )
        print(f"Usuario {email} creado")
    
    return user

def get_auth_token(user):
    """Obtener token de autenticación para el usuario"""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

def test_endpoint(url, token=None, description=""):
    """Probar un endpoint específico"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\n{description}")
        print(f"URL: {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error conectando a {url}: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("=== PRUEBA DE ENDPOINTS DEL DASHBOARD ===")
    print(f"Fecha: {datetime.now()}")
    
    # Crear usuarios de prueba
    print("\n1. Creando usuarios de prueba...")
    student_user = create_test_user('student@test.com', 'student')
    company_user = create_test_user('company@test.com', 'company')
    admin_user = create_test_user('admin@test.com', 'admin')
    
    # Obtener tokens
    print("\n2. Obteniendo tokens de autenticación...")
    student_token = get_auth_token(student_user)
    company_token = get_auth_token(company_user)
    admin_token = get_auth_token(admin_user)
    
    base_url = "http://localhost:8000"
    
    # Probar endpoints
    print("\n3. Probando endpoints del dashboard...")
    
    # Health check
    test_endpoint(
        f"{base_url}/api/health-simple/",
        description="Health Check"
    )
    
    # Dashboard de estudiante
    test_endpoint(
        f"{base_url}/api/dashboard/student_stats/",
        token=student_token,
        description="Dashboard de Estudiante"
    )
    
    # Dashboard de empresa
    test_endpoint(
        f"{base_url}/api/dashboard/company_stats/",
        token=company_token,
        description="Dashboard de Empresa"
    )
    
    # Dashboard de administrador
    test_endpoint(
        f"{base_url}/api/dashboard/admin_stats/",
        token=admin_token,
        description="Dashboard de Administrador"
    )
    
    # Perfil de usuario
    test_endpoint(
        f"{base_url}/api/users/profile/",
        token=student_token,
        description="Perfil de Usuario"
    )
    
    print("\n=== PRUEBA COMPLETADA ===")

if __name__ == "__main__":
    main() 