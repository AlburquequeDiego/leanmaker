#!/usr/bin/env python3
"""
Script para probar el endpoint de aplicaciones
"""

import os
import sys
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from applications.models import Aplicacion

User = get_user_model()

def test_applications_endpoint():
    """Prueba el endpoint de aplicaciones"""
    
    print("🧪 PROBANDO ENDPOINT DE APLICACIONES")
    print("=" * 50)
    
    # 1. Verificar que existe un estudiante
    try:
        student_user = User.objects.filter(role='student').first()
        if not student_user:
            print("❌ No se encontró ningún estudiante")
            return
        
        print(f"✅ Estudiante encontrado: {student_user.email}")
        
    except Exception as e:
        print(f"❌ Error al obtener estudiante: {e}")
        return
    
    # 2. Verificar aplicaciones en la base de datos
    try:
        applications_count = Aplicacion.objects.count()
        print(f"✅ Aplicaciones en BD: {applications_count}")
        
        # Mostrar algunas aplicaciones
        applications = Aplicacion.objects.all()[:5]
        for app in applications:
            print(f"   - {app.project.title if app.project else 'Sin proyecto'} (ID: {app.id})")
            
    except Exception as e:
        print(f"❌ Error al obtener aplicaciones: {e}")
        return
    
    # 3. Probar el endpoint directamente
    try:
        print("\n🌐 Probando endpoint GET /api/applications/")
        
        # Simular una petición GET al endpoint
        from django.test import RequestFactory
        from django.contrib.auth.models import AnonymousUser
        from applications.views import application_list
        
        factory = RequestFactory()
        request = factory.get('/api/applications/')
        request.user = AnonymousUser()
        
        # Agregar headers de autenticación simulados
        request.META['HTTP_AUTHORIZATION'] = 'Bearer test_token'
        
        response = application_list(request)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.content.decode()}")
        
        if response.status_code == 200:
            print("✅ Endpoint funcionando correctamente")
        else:
            print("❌ Endpoint con error")
            
    except Exception as e:
        print(f"❌ Error al probar endpoint: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_applications_endpoint() 