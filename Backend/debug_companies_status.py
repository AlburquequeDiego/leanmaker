#!/usr/bin/env python
"""
Script para debug del estado de empresas.
Ejecutar desde la carpeta donde está manage.py:
python debug_companies_status.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from users.models import User

def debug_companies_status():
    """Debug del estado de empresas"""
    print("🔍 DEBUG: Estado de todas las empresas")
    print("=" * 80)
    
    companies = Empresa.objects.select_related('user').all()
    
    print(f"📊 Total de empresas: {companies.count()}")
    print()
    
    for company in companies:
        print(f"🏢 Empresa: {company.company_name}")
        print(f"   ID Empresa: {company.id}")
        print(f"   Status Empresa (campo): {company.status}")
        
        if company.user:
            print(f"   👤 Usuario asociado: {company.user.email}")
            print(f"   ID Usuario: {company.user.id}")
            print(f"   is_active: {company.user.is_active}")
            print(f"   is_verified: {company.user.is_verified}")
            
            # Calcular status real
            if not company.user.is_verified:
                real_status = "blocked"
            elif not company.user.is_active:
                real_status = "suspended"
            else:
                real_status = "active"
            
            print(f"   🎯 Status real calculado: {real_status}")
        else:
            print(f"   ❌ SIN USUARIO ASOCIADO")
            print(f"   🎯 Status real calculado: blocked")
        
        print("-" * 40)
    
    print("\n📋 RESUMEN POR STATUS:")
    print("=" * 40)
    
    # Contar por status real
    active_count = 0
    suspended_count = 0
    blocked_count = 0
    no_user_count = 0
    
    for company in companies:
        if not company.user:
            no_user_count += 1
            blocked_count += 1
        else:
            if not company.user.is_verified:
                blocked_count += 1
            elif not company.user.is_active:
                suspended_count += 1
            else:
                active_count += 1
    
    print(f"✅ Activas: {active_count}")
    print(f"⚠️  Suspendidas: {suspended_count}")
    print(f"🚫 Bloqueadas: {blocked_count}")
    print(f"❌ Sin usuario: {no_user_count}")
    
    print("\n🔍 EMPRESAS SUSPENDIDAS (que deberían estar activas):")
    print("=" * 60)
    
    for company in companies:
        if company.user and not company.user.is_active and company.user.is_verified:
            print(f"🏢 {company.company_name} - {company.user.email}")
            print(f"   is_active: {company.user.is_active}")
            print(f"   is_verified: {company.user.is_verified}")

if __name__ == '__main__':
    debug_companies_status() 