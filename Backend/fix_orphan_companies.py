#!/usr/bin/env python
"""
Script para arreglar empresas sin usuario asociado.
Ejecutar desde la carpeta donde está manage.py:
python fix_orphan_companies.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from users.models import User
import uuid

def fix_orphan_companies():
    """Arregla empresas que no tienen usuario asociado"""
    print("🔍 Buscando empresas sin usuario asociado...")
    
    orphan_companies = Empresa.objects.filter(user__isnull=True)
    
    if not orphan_companies.exists():
        print("✅ No hay empresas sin usuario asociado.")
        return
    
    print(f"📋 Encontradas {orphan_companies.count()} empresas sin usuario:")
    
    for company in orphan_companies:
        print(f"\n🏢 Empresa: {company.company_name}")
        
        # Intentar encontrar usuario existente por email
        user_email = company.company_name  # Asumimos que el nombre de la empresa es el email
        existing_user = User.objects.filter(email=user_email, role='company').first()
        
        if existing_user:
            print(f"   ✅ Usuario encontrado: {existing_user.email}")
            company.user = existing_user
            company.save()
            print(f"   🔗 Empresa asociada al usuario {existing_user.email}")
        else:
            # Crear nuevo usuario
            try:
                new_user = User.objects.create(
                    id=str(uuid.uuid4()),
                    email=user_email,
                    username=user_email.split('@')[0],  # Usar parte antes del @ como username
                    role='company',
                    is_active=True,
                    is_verified=True,
                    first_name=company.company_name.split('@')[0] if '@' in company.company_name else company.company_name,
                    last_name='',
                )
                company.user = new_user
                company.save()
                print(f"   ✅ Usuario creado: {new_user.email}")
                print(f"   🔗 Empresa asociada al nuevo usuario")
            except Exception as e:
                print(f"   ❌ Error al crear usuario: {e}")
    
    print(f"\n🎉 Proceso completado!")
    
    # Verificar resultado
    remaining_orphans = Empresa.objects.filter(user__isnull=True).count()
    if remaining_orphans == 0:
        print("✅ Todas las empresas ahora tienen usuario asociado.")
    else:
        print(f"⚠️  Aún quedan {remaining_orphans} empresas sin usuario.")

if __name__ == '__main__':
    fix_orphan_companies() 