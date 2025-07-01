#!/usr/bin/env python
"""
Script para corregir las credenciales y roles de los usuarios
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from users.models import Usuario

def fix_credentials():
    print("🔧 Corrigiendo credenciales y roles de usuarios...")
    
    # Corregir admin principal
    try:
        admin_user = Usuario.objects.get(email='alburqueque511@gmail.com')
        admin_user.role = 'admin'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.set_password('admin')
        admin_user.save()
        print("   ✅ Admin principal corregido: alburqueque511@gmail.com")
    except Usuario.DoesNotExist:
        print("   ❌ Admin principal no encontrado")
    
    # Corregir María González (asignar role)
    try:
        maria = Usuario.objects.get(email='maria.gonzalez@estudiante.cl')
        maria.role = 'student'
        maria.is_active = True
        maria.set_password('estudiante123')
        maria.save()
        print("   ✅ María González corregida: role asignado")
    except Usuario.DoesNotExist:
        print("   ❌ María González no encontrada")
    
    # Verificar que Ana Martínez tenga role
    try:
        ana = Usuario.objects.get(email='ana.martinez@estudiante.cl')
        if not ana.role:
            ana.role = 'student'
            ana.save()
            print("   ✅ Ana Martínez corregida: role asignado")
        else:
            print("   ℹ️  Ana Martínez ya tiene role")
    except Usuario.DoesNotExist:
        print("   ❌ Ana Martínez no encontrada")
    
    # Eliminar admin extra si existe
    try:
        admin_extra = Usuario.objects.get(email='admin@gmail.com')
        admin_extra.delete()
        print("   ✅ Admin extra eliminado: admin@gmail.com")
    except Usuario.DoesNotExist:
        print("   ℹ️  No hay admin extra para eliminar")
    
    print("\n🔍 Verificando correcciones...")
    usuarios = Usuario.objects.all()
    for usuario in usuarios:
        print(f"   • {usuario.email} (role: {usuario.role}, active: {usuario.is_active})")

if __name__ == '__main__':
    fix_credentials() 