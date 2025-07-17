#!/usr/bin/env python
"""
Script para asociar un perfil de empresa a un usuario específico para pruebas.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from companies.models import Empresa

# Email del usuario a asociar
USER_EMAIL = 'contacto@finanplus.com'

try:
    user = User.objects.get(email=USER_EMAIL)
    if not hasattr(user, 'empresa_profile'):
        empresa = Empresa.objects.create(user=user, company_name='FinanPlus (Prueba)')
        print(f"✅ Perfil de empresa creado para {user.email}: {empresa.company_name}")
    else:
        print(f"ℹ️ El usuario {user.email} ya tiene perfil de empresa: {user.empresa_profile.company_name}")
except User.DoesNotExist:
    print(f"❌ Usuario no encontrado: {USER_EMAIL}") 