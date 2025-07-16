#!/usr/bin/env python
"""
Script de prueba para verificar que el modelo MassNotification funciona.
"""

import os
import sys
import django
from django.utils import timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from mass_notifications.models import MassNotification
from users.models import User
from mass_notifications.serializers import MassNotificationSerializer

def test_mass_notification():
    """Prueba la creación de una notificación masiva"""
    
    print("🧪 Probando creación de notificación masiva...")
    
    try:
        # Obtener un usuario admin
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            print("❌ No se encontró un usuario admin")
            return False
        
        print(f"✅ Usuario admin encontrado: {admin_user.email}")
        
        # Datos de prueba
        test_data = {
            'title': 'Prueba de notificación masiva',
            'message': 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
            'notification_type': 'announcement',
            'priority': 'normal',
            'target_all_students': True,
            'target_all_companies': False,
            'target_student_ids': [],
            'target_company_ids': [],
        }
        
        print("📝 Datos de prueba:", test_data)
        
        # Validar datos
        errors = MassNotificationSerializer.validate_data(test_data)
        if errors:
            print("❌ Errores de validación:", errors)
            return False
        
        print("✅ Validación exitosa")
        
        # Crear notificación
        notification = MassNotificationSerializer.create(test_data, admin_user)
        
        print(f"✅ Notificación creada exitosamente:")
        print(f"   ID: {notification.id}")
        print(f"   Título: {notification.title}")
        print(f"   Estado: {notification.status}")
        print(f"   Destinatarios totales: {notification.total_recipients}")
        
        # Limpiar notificación de prueba
        notification.delete()
        print("🧹 Notificación de prueba eliminada")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_mass_notification()
    if success:
        print("🎉 ¡Prueba exitosa! El modelo funciona correctamente.")
    else:
        print("💥 Prueba fallida. Hay un problema con el modelo.")
        sys.exit(1) 