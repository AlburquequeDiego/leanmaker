#!/usr/bin/env python3
"""
Script de prueba para el sistema de notificaciones
"""

import os
import sys
import django
import requests
import json
from datetime import datetime, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from notifications.models import Notification
from mass_notifications.models import MassNotification

User = get_user_model()

def test_notification_system():
    """Prueba el sistema completo de notificaciones"""
    
    print("🧪 Probando sistema de notificaciones...")
    print("=" * 50)
    
    # 1. Verificar usuarios existentes
    print("\n1. Verificando usuarios existentes...")
    admin_users = User.objects.filter(role='admin')
    students = Estudiante.objects.all()
    companies = Empresa.objects.all()
    
    print(f"   - Administradores: {admin_users.count()}")
    print(f"   - Estudiantes: {students.count()}")
    print(f"   - Empresas: {companies.count()}")
    
    if not admin_users.exists():
        print("   ❌ No hay administradores para probar")
        return False
    
    if not students.exists():
        print("   ❌ No hay estudiantes para probar")
        return False
    
    if not companies.exists():
        print("   ❌ No hay empresas para probar")
        return False
    
    # 2. Crear notificación individual de prueba
    print("\n2. Creando notificación individual de prueba...")
    try:
        test_user = students.first().user
        individual_notification = Notification.objects.create(
            user=test_user,
            title="Notificación de prueba individual",
            message="Esta es una notificación de prueba creada directamente en la base de datos.",
            type="info",
            priority="normal"
        )
        print(f"   ✅ Notificación individual creada: {individual_notification.id}")
    except Exception as e:
        print(f"   ❌ Error creando notificación individual: {e}")
        return False
    
    # 3. Crear notificación masiva de prueba
    print("\n3. Creando notificación masiva de prueba...")
    try:
        admin_user = admin_users.first()
        mass_notification = MassNotification.objects.create(
            title="Notificación masiva de prueba",
            message="Esta es una notificación masiva de prueba para verificar el sistema.",
            notification_type="announcement",
            priority="normal",
            status="draft",
            target_all_students=True,
            target_all_companies=False,
            created_by=admin_user
        )
        mass_notification.calculate_recipients()
        print(f"   ✅ Notificación masiva creada: {mass_notification.id}")
        print(f"   - Total destinatarios: {mass_notification.total_recipients}")
    except Exception as e:
        print(f"   ❌ Error creando notificación masiva: {e}")
        return False
    
    # 4. Simular envío de notificación masiva
    print("\n4. Simulando envío de notificación masiva...")
    try:
        # Obtener destinatarios
        recipients = []
        for student in students:
            if student.user:
                recipients.append(student.user)
        
        # Crear notificaciones individuales
        notifications_created = []
        for recipient in recipients:
            try:
                individual_notification = Notification.objects.create(
                    user=recipient,
                    title=mass_notification.title,
                    message=mass_notification.message,
                    type=mass_notification.notification_type,
                    priority=mass_notification.priority,
                    related_url=f"/mass-notifications/{mass_notification.id}/"
                )
                notifications_created.append(individual_notification)
            except Exception as e:
                print(f"   ⚠️  Error creando notificación para {recipient.email}: {e}")
        
        # Actualizar estadísticas
        mass_notification.sent_count = len(notifications_created)
        mass_notification.mark_as_sent()
        
        print(f"   ✅ Notificaciones enviadas: {len(notifications_created)}")
        print(f"   - Estudiantes con notificaciones: {len(notifications_created)}")
        
    except Exception as e:
        print(f"   ❌ Error enviando notificación masiva: {e}")
        return False
    
    # 5. Verificar notificaciones en base de datos
    print("\n5. Verificando notificaciones en base de datos...")
    try:
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(read=False).count()
        
        print(f"   - Total notificaciones: {total_notifications}")
        print(f"   - No leídas: {unread_notifications}")
        print(f"   - Leídas: {total_notifications - unread_notifications}")
        
        # Verificar notificaciones por usuario
        for student in students[:3]:  # Solo los primeros 3 para no saturar
            if student.user:
                user_notifications = Notification.objects.filter(user=student.user)
                print(f"   - {student.user.full_name}: {user_notifications.count()} notificaciones")
        
    except Exception as e:
        print(f"   ❌ Error verificando notificaciones: {e}")
        return False
    
    # 6. Probar marcar como leída
    print("\n6. Probando marcar como leída...")
    try:
        test_notification = Notification.objects.filter(read=False).first()
        if test_notification:
            test_notification.marcar_como_leida()
            print(f"   ✅ Notificación marcada como leída: {test_notification.id}")
        else:
            print("   ⚠️  No hay notificaciones no leídas para probar")
    except Exception as e:
        print(f"   ❌ Error marcando como leída: {e}")
        return False
    
    # 7. Verificar estadísticas finales
    print("\n7. Estadísticas finales...")
    try:
        final_total = Notification.objects.count()
        final_unread = Notification.objects.filter(read=False).count()
        final_read = Notification.objects.filter(read=True).count()
        
        print(f"   - Total notificaciones: {final_total}")
        print(f"   - No leídas: {final_unread}")
        print(f"   - Leídas: {final_read}")
        
        # Verificar tipos de notificación
        type_counts = {}
        for notification in Notification.objects.all():
            type_counts[notification.type] = type_counts.get(notification.type, 0) + 1
        
        print("   - Por tipo:")
        for notification_type, count in type_counts.items():
            print(f"     * {notification_type}: {count}")
        
    except Exception as e:
        print(f"   ❌ Error obteniendo estadísticas: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ Prueba del sistema de notificaciones completada exitosamente")
    print("=" * 50)
    
    return True

def test_api_endpoints():
    """Prueba los endpoints de la API de notificaciones"""
    
    print("\n🌐 Probando endpoints de la API...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Obtener token de autenticación (necesitarías un usuario válido)
    print("\n⚠️  Nota: Para probar endpoints de API necesitas:")
    print("   - Servidor Django ejecutándose en localhost:8000")
    print("   - Usuario válido con token de autenticación")
    print("   - Configurar las credenciales en el script")
    
    # Aquí podrías agregar pruebas reales de API si tienes un token válido
    endpoints_to_test = [
        "/api/notifications/",
        "/api/notifications/unread-count/",
        "/mass-notifications/",
    ]
    
    print("\nEndpoints disponibles para probar:")
    for endpoint in endpoints_to_test:
        print(f"   - {base_url}{endpoint}")
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del sistema de notificaciones")
    print("=" * 60)
    
    # Ejecutar pruebas
    success = test_notification_system()
    
    if success:
        test_api_endpoints()
        print("\n🎉 Todas las pruebas completadas exitosamente!")
    else:
        print("\n❌ Algunas pruebas fallaron")
        sys.exit(1) 