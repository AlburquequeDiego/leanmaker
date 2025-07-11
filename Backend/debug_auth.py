#!/usr/bin/env python
"""
Script para debuggear el problema de autenticación.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from django.contrib.auth import authenticate

def debug_user_auth():
    """Debuggear la autenticación de usuarios."""
    print("🔍 Debuggeando autenticación de usuarios...")
    print("=" * 60)
    
    # Listar algunos usuarios
    users = User.objects.all()[:5]
    print(f"📋 Primeros 5 usuarios en la base de datos:")
    for user in users:
        print(f"   - ID: {user.id}")
        print(f"     Email: {user.email}")
        print(f"     Username: {user.username}")
        print(f"     First Name: {user.first_name}")
        print(f"     Last Name: {user.last_name}")
        print(f"     Role: {user.role}")
        print(f"     Is Active: {user.is_active}")
        print(f"     Password (hash): {user.password[:50]}...")
        print()
    
    # Probar autenticación con diferentes métodos
    test_email = "contacto@ecologistica.com"
    test_password = "Empresa123!"
    
    print(f"🧪 Probando autenticación para: {test_email}")
    print(f"   Contraseña: {test_password}")
    print()
    
    try:
        # Método 1: Buscar por email
        user = User.objects.get(email=test_email)
        print(f"✅ Usuario encontrado por email:")
        print(f"   - ID: {user.id}")
        print(f"   - Email: {user.email}")
        print(f"   - Username: {user.username}")
        print(f"   - Password hash: {user.password[:50]}...")
        print()
        
        # Método 2: Autenticar con username
        if user.username:
            auth_user = authenticate(username=user.username, password=test_password)
            print(f"🔐 Autenticación con username '{user.username}':")
            print(f"   - Resultado: {auth_user}")
            print()
        
        # Método 3: Autenticar con email (si el modelo lo soporta)
        auth_user_email = authenticate(email=test_email, password=test_password)
        print(f"🔐 Autenticación con email '{test_email}':")
        print(f"   - Resultado: {auth_user_email}")
        print()
        
        # Método 4: Verificar contraseña directamente
        is_valid = user.check_password(test_password)
        print(f"🔐 Verificación directa de contraseña:")
        print(f"   - Es válida: {is_valid}")
        print()
        
        # Método 5: Probar con contraseña en texto plano (si está así en la BD)
        if user.password == test_password:
            print(f"⚠️  La contraseña está en texto plano en la BD!")
        else:
            print(f"✅ La contraseña está hasheada correctamente")
        print()
        
    except User.DoesNotExist:
        print(f"❌ Usuario no encontrado: {test_email}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Verificar configuración del modelo
    print("⚙️  Configuración del modelo User:")
    print(f"   - USERNAME_FIELD: {User.USERNAME_FIELD}")
    print(f"   - REQUIRED_FIELDS: {User.REQUIRED_FIELDS}")
    print(f"   - AUTH_USER_MODEL: {User._meta.app_label}.{User._meta.model_name}")
    print()

if __name__ == '__main__':
    debug_user_auth() 