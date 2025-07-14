#!/usr/bin/env python
"""
Script para generar un token de prueba para un usuario estudiante
"""

import os
import django
import jwt
from datetime import datetime, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from users.models import User

def generate_test_token():
    """Generar un token de prueba para un usuario estudiante"""
    print("=== Generando Token de Prueba ===")
    
    # Buscar un usuario estudiante
    try:
        user = User.objects.filter(role='student').first()
        if not user:
            print("❌ No se encontraron usuarios estudiantes")
            return
        
        print(f"Usuario: {user.email}")
        print(f"Rol: {user.role}")
        print(f"ID: {user.id}")
        
        # Verificar si tiene perfil de estudiante
        try:
            student_profile = user.estudiante_profile
            print(f"✅ Tiene perfil de estudiante: {student_profile.id}")
        except Exception as e:
            print(f"❌ Error con perfil de estudiante: {e}")
            return
        
        # Generar token JWT
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        print(f"\n=== TOKEN GENERADO ===")
        print(f"Token: {token}")
        print(f"\n=== PARA PROBAR ===")
        print(f"curl -X GET http://localhost:8000/api/dashboard/student_stats/ \\")
        print(f"  -H 'Authorization: Bearer {token}' \\")
        print(f"  -H 'Content-Type: application/json'")
        
        return token
        
    except Exception as e:
        print(f"❌ Error generando token: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    generate_test_token() 