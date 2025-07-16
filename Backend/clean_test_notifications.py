#!/usr/bin/env python
"""
Script para limpiar notificaciones de prueba de la base de datos.
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from mass_notifications.models import MassNotification
from notifications.models import Notification

def clean_test_notifications():
    """Limpia las notificaciones de prueba creadas durante el desarrollo"""
    
    print("🧹 Limpiando notificaciones de prueba...")
    
    # Limpiar notificaciones masivas de prueba
    test_mass_notifications = MassNotification.objects.filter(
        title__icontains='prueba'
    ).delete()
    
    print(f"✅ Eliminadas {test_mass_notifications[0]} notificaciones masivas de prueba")
    
    # Limpiar notificaciones individuales de prueba
    test_notifications = Notification.objects.filter(
        title__icontains='prueba'
    ).delete()
    
    print(f"✅ Eliminadas {test_notifications[0]} notificaciones individuales de prueba")
    
    # Limpiar notificaciones antiguas (más de 7 días) que parezcan de prueba
    week_ago = timezone.now() - timedelta(days=7)
    old_test_notifications = Notification.objects.filter(
        created_at__lt=week_ago,
        title__icontains='test'
    ).delete()
    
    print(f"✅ Eliminadas {old_test_notifications[0]} notificaciones antiguas de prueba")
    
    print("🎉 Limpieza completada exitosamente!")

if __name__ == '__main__':
    try:
        clean_test_notifications()
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        sys.exit(1) 