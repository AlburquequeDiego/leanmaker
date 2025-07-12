#!/usr/bin/env python
"""
Script para verificar el modelo de usuario y sus relaciones
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from companies.models import Empresa

def check_user_company_profile():
    """Verificar si los usuarios con rol 'company' tienen perfil de empresa"""
    print("=== Verificando usuarios con rol 'company' ===")
    
    # Obtener todos los usuarios con rol 'company'
    company_users = User.objects.filter(role='company')
    
    if not company_users.exists():
        print("❌ No hay usuarios con rol 'company' en la base de datos")
        return False
    
    print(f"✅ Encontrados {company_users.count()} usuarios con rol 'company'")
    
    for user in company_users:
        print(f"\n--- Usuario: {user.email} (ID: {user.id}) ---")
        
        # Verificar si tiene perfil de empresa
        try:
            empresa_profile = user.empresa_profile
            print(f"✅ Tiene perfil de empresa: {empresa_profile.company_name}")
        except Empresa.DoesNotExist:
            print("❌ NO tiene perfil de empresa")
            print("   Creando perfil de empresa...")
            
            # Crear perfil de empresa
            empresa = Empresa.objects.create(
                user=user,
                company_name=f"Empresa de {user.first_name} {user.last_name}",
                description="Perfil creado automáticamente",
                status='active'
            )
            print(f"✅ Perfil de empresa creado: {empresa.company_name}")
        except Exception as e:
            print(f"❌ Error al verificar perfil de empresa: {e}")
    
    return True

def check_empresa_model():
    """Verificar el modelo Empresa"""
    print("\n=== Verificando modelo Empresa ===")
    
    # Verificar campos del modelo
    empresa_fields = Empresa._meta.get_fields()
    print(f"✅ Modelo Empresa tiene {len(empresa_fields)} campos")
    
    # Verificar relación con User
    user_field = Empresa._meta.get_field('user')
    print(f"✅ Campo 'user': {user_field}")
    print(f"   Tipo: {user_field.__class__.__name__}")
    print(f"   Related name: {user_field._related_name}")
    
    return True

def check_user_model():
    """Verificar el modelo User"""
    print("\n=== Verificando modelo User ===")
    
    # Verificar campos del modelo
    user_fields = User._meta.get_fields()
    print(f"✅ Modelo User tiene {len(user_fields)} campos")
        
    # Verificar si tiene relación con Empresa
        try:
        empresa_related = User._meta.get_field('empresa_profile')
        print(f"✅ Relación 'empresa_profile' encontrada: {empresa_related}")
    except:
        print("❌ No se encontró la relación 'empresa_profile' en el modelo User")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 Diagnóstico del modelo de usuario y empresa")
    print("=" * 50)
        
    try:
        # Verificar modelos
        user_ok = check_user_model()
        empresa_ok = check_empresa_model()
        
        if user_ok and empresa_ok:
            # Verificar perfiles de empresa
            profiles_ok = check_user_company_profile()
            
            if profiles_ok:
                print("\n✅ Diagnóstico completado exitosamente")
            else:
                print("\n❌ Problema con los perfiles de empresa")
        else:
            print("\n❌ Problema con los modelos")
            
    except Exception as e:
        print(f"\n❌ Error durante el diagnóstico: {e}")
        import traceback
        traceback.print_exc() 