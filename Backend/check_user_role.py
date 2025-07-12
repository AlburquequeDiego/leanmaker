#!/usr/bin/env python
"""
Script para verificar el rol del usuario
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def check_user_role():
    """Verificar el rol del usuario juan.perez@uchile.cl"""
    try:
        user = User.objects.get(email='juan.perez@uchile.cl')
        print(f"Usuario: {user.email}")
        print(f"Rol: {user.role}")
        print(f"Nombre: {user.first_name} {user.last_name}")
        print(f"ID: {user.id}")
        return user.role
    except User.DoesNotExist:
        print("❌ Usuario juan.perez@uchile.cl no encontrado")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    check_user_role() 