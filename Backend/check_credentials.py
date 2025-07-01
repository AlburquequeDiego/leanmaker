#!/usr/bin/env python
"""
Script para verificar las credenciales de los usuarios
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import Usuario

def check_credentials():
    print("🔍 Verificando credenciales de usuarios...")
    
    # Listar todos los usuarios
    print("\n📋 Usuarios en la base de datos:")
    usuarios = Usuario.objects.all()
    for usuario in usuarios:
        print(f"   • {usuario.email} (role: {usuario.role}, active: {usuario.is_active})")
    
    # Probar credenciales específicas
    print("\n🔑 Probando credenciales:")
    
    # Admin
    print("\n1️⃣ Probando admin:")
    admin_user = authenticate(email='alburqueque511gmail.com', password='admin')
    if admin_user:
        print(f"   ✅ Admin autenticado: {admin_user.email}")
    else:
        print(f"   ❌ Admin NO autenticado")
    
    # Estudiantes
    estudiantes_creds = [
        ('maria.gonzalez@estudiante.cl', 'estudiante123'),
        ('carlos.rodriguez@estudiante.cl', 'estudiante123'),
        ('ana.martinez@estudiante.cl', 'estudiante123')
    ]
    
    for i, (email, password) in enumerate(estudiantes_creds, 2):
        print(f"\n{i}️⃣ Probando estudiante {email}:")
        user = authenticate(email=email, password=password)
        if user:
            print(f"   ✅ Estudiante autenticado: {user.email}")
        else:
            print(f"   ❌ Estudiante NO autenticado")
    
    # Verificar si los usuarios tienen contraseñas
    print("\n🔐 Verificando contraseñas:")
    for usuario in usuarios:
        if usuario.has_usable_password():
            print(f"   ✅ {usuario.email} tiene contraseña válida")
        else:
            print(f"   ❌ {usuario.email} NO tiene contraseña válida")

if __name__ == '__main__':
    check_credentials() 