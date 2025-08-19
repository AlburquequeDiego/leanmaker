#!/usr/bin/env python
"""
Script simple para limpiar todos los datos usando comandos de Django
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def clear_data_with_django():
    """
    Limpia datos usando comandos de Django
    """
    print("🧹 LIMPIEZA DE DATOS CON DJANGO")
    print("=" * 40)
    
    # Lista de comandos para ejecutar
    commands = [
        ['flush', '--noinput'],  # Limpia toda la base de datos
    ]
    
    for command in commands:
        try:
            print(f"🔄 Ejecutando: python manage.py {' '.join(command)}")
            
            # Importar y ejecutar el comando
            from django.core.management import call_command
            call_command(*command)
            
            print(f"✅ Comando ejecutado exitosamente")
            
        except Exception as e:
            print(f"❌ Error ejecutando comando: {e}")
            return False
    
    return True

def create_admin_user():
    """
    Crea un usuario administrador si no existe
    """
    try:
        from django.contrib.auth.models import User
        
        if not User.objects.filter(is_superuser=True).exists():
            print("👤 Creando usuario administrador...")
            
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            
            print(f"✅ Usuario administrador creado: {admin_user.username}")
            print("🔑 Contraseña: admin123")
            print("⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        else:
            print("✅ Usuario administrador ya existe")
            
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")

if __name__ == '__main__':
    print("🚨 ADVERTENCIA: Este script eliminará TODOS los datos")
    print("✅ Se mantendrán las tablas y estructura")
    print()
    
    confirm = input("¿Continuar? (escribe 'SI'): ")
    if confirm != 'SI':
        print("❌ Operación cancelada")
        sys.exit(0)
    
    success = clear_data_with_django()
    
    if success:
        print("\n🔄 Creando usuario administrador...")
        create_admin_user()
        
        print("\n🎉 ¡Limpieza completada!")
        print("💡 Ejecuta 'python manage.py migrate' para asegurar consistencia")
    else:
        print("\n❌ La limpieza no se completó correctamente")
        sys.exit(1)
