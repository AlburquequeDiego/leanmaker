#!/usr/bin/env python
"""
Script para probar el endpoint completed_pending_hours
"""

import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from users.models import User
from core.views import generate_access_token

def test_pending_hours_endpoint():
    """Probar el endpoint completed_pending_hours"""
    print("=== PROBANDO ENDPOINT completed_pending_hours ===")
    
    # Obtener un usuario admin
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        print("❌ No hay usuarios admin")
        return
    
    # Generar token JWT
    token = generate_access_token(admin_user)
    
    # Crear cliente de prueba
    client = Client()
    
    # Hacer request al endpoint
    response = client.get(
        '/api/projects/completed_pending_hours/',
        HTTP_AUTHORIZATION=f'Bearer {token}'
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total proyectos: {data.get('count', 0)}")
        
        for i, project in enumerate(data.get('results', [])):
            print(f"\nProyecto {i+1}:")
            print(f"  - ID: {project.get('id')}")
            print(f"  - Título: {project.get('title')}")
            print(f"  - Empresa: {project.get('company')}")
            print(f"  - Horas: {project.get('required_hours')}")
            print(f"  - Estudiante: {project.get('student_name', 'NO DEFINIDO')}")
            print(f"  - Email: {project.get('student_email', 'NO DEFINIDO')}")
            print(f"  - Fecha: {project.get('date', 'NO DEFINIDO')}")
            print(f"  - Participantes: {len(project.get('participantes', []))}")
            
            # Mostrar participantes
            for j, participante in enumerate(project.get('participantes', [])):
                print(f"    Participante {j+1}: {participante.get('nombre')} ({participante.get('email')})")
    else:
        print(f"❌ Error: {response.content}")

if __name__ == '__main__':
    test_pending_hours_endpoint() 