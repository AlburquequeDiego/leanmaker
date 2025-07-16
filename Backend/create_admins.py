#!/usr/bin/env python
"""
Script para convertir ambos administradores en superusuarios y staff.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def make_admins_superusers():
    emails = ['admin1@leanmaker.com', 'admin2@leanmaker.com']
    for email in emails:
        user = User.objects.filter(email=email).first()
        if user:
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"✅ {email} ahora es superusuario y staff.")
        else:
            print(f"❌ {email} no existe en la base de datos.")

if __name__ == '__main__':
    make_admins_superusers() 