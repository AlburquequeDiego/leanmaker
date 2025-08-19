#!/usr/bin/env python
"""
Script para crear un usuario administrador desde cero
Útil después de limpiar la base de datos
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def create_admin():
    """
    Crea un usuario administrador desde cero
    """
    print("👑 CREANDO USUARIO ADMINISTRADOR")
    print("=" * 50)
    
    try:
        from users.models import User
        
        # Verificar si ya existe un admin
        existing_admin = User.objects.filter(is_superuser=True).first()
        if existing_admin:
            print(f"⚠️  Ya existe un usuario administrador:")
            print(f"   Email: {existing_admin.email}")
            print(f"   ID: {existing_admin.id}")
            print(f"   Role: {existing_admin.role}")
            return
        
        print("📝 Configurando nuevo usuario administrador...")
        
        # Datos del admin
        admin_email = input("📧 Email del administrador (ej: admin@leanmaker.com): ").strip()
        if not admin_email:
            admin_email = "admin@leanmaker.com"
            print(f"   Usando email por defecto: {admin_email}")
        
        admin_password = input("🔒 Contraseña del administrador: ").strip()
        if not admin_password:
            admin_password = "Admin123!"
            print(f"   Usando contraseña por defecto: {admin_password}")
        
        admin_first_name = input("👤 Nombre del administrador (ej: Admin): ").strip()
        if not admin_first_name:
            admin_first_name = "Admin"
            print(f"   Usando nombre por defecto: {admin_first_name}")
        
        admin_last_name = input("👤 Apellido del administrador (ej: LeanMaker): ").strip()
        if not admin_last_name:
            admin_last_name = "LeanMaker"
            print(f"   Usando apellido por defecto: {admin_last_name}")
        
        # Crear el usuario administrador
        admin_user = User.objects.create_user(
            email=admin_email,
            password=admin_password,
            first_name=admin_first_name,
            last_name=admin_last_name,
            username=admin_email,  # Usar email como username
            role='admin',
            is_superuser=True,
            is_staff=True,
            is_active=True,
            is_verified=True
        )
        
        print("\n✅ Usuario administrador creado exitosamente!")
        print("📊 Detalles del admin:")
        print(f"   ID: {admin_user.id}")
        print(f"   Email: {admin_user.email}")
        print(f"   Nombre: {admin_user.first_name} {admin_user.last_name}")
        print(f"   Role: {admin_user.role}")
        print(f"   Superusuario: {admin_user.is_superuser}")
        print(f"   Staff: {admin_user.is_staff}")
        print(f"   Activo: {admin_user.is_active}")
        print(f"   Verificado: {admin_user.is_verified}")
        
        print("\n🔑 Credenciales de acceso:")
        print(f"   Email: {admin_email}")
        print(f"   Contraseña: {admin_password}")
        
        print("\n💡 Ahora puedes iniciar sesión en el sistema con estas credenciales")
        
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        return False
    
    return True

def create_default_admin():
    """
    Crea un usuario administrador con valores por defecto
    """
    print("👑 CREANDO ADMINISTRADOR POR DEFECTO")
    print("=" * 50)
    
    try:
        from users.models import User
        
        # Verificar si ya existe un admin
        existing_admin = User.objects.filter(is_superuser=True).first()
        if existing_admin:
            print(f"⚠️  Ya existe un usuario administrador:")
            print(f"   Email: {existing_admin.email}")
            print(f"   ID: {existing_admin.id}")
            return
        
        # Crear admin por defecto
        admin_user = User.objects.create_user(
            email="admin@leanmaker.com",
            password="Admin123!",
            first_name="Admin",
            last_name="LeanMaker",
            username="admin@leanmaker.com",
            role='admin',
            is_superuser=True,
            is_staff=True,
            is_active=True,
            is_verified=True
        )
        
        print("✅ Usuario administrador por defecto creado exitosamente!")
        print("📊 Detalles:")
        print(f"   Email: admin@leanmaker.com")
        print(f"   Contraseña: Admin123!")
        print(f"   ID: {admin_user.id}")
        print(f"   Role: {admin_user.role}")
        
        print("\n💡 Usa estas credenciales para acceder al sistema")
        
    except Exception as e:
        print(f"❌ Error creando admin por defecto: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("👑 SCRIPT DE CREACIÓN DE ADMINISTRADOR")
    print("=" * 50)
    print("1. Crear admin personalizado")
    print("2. Crear admin por defecto (recomendado)")
    print("3. Salir")
    
    choice = input("\nSelecciona una opción (1-3): ").strip()
    
    if choice == "1":
        create_admin()
    elif choice == "2":
        create_default_admin()
    elif choice == "3":
        print("👋 ¡Hasta luego!")
        sys.exit(0)
    else:
        print("❌ Opción inválida")
        sys.exit(1)
