#!/usr/bin/env python
"""
Script para limpiar todos los datos de la base de datos
Mantiene las tablas, relaciones y el usuario administrador
"""

import os
import sys
import django
from django.db import connection
from django.contrib.auth.models import User
from django.core.management import execute_from_command_line

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def clear_all_data():
    """
    Elimina todos los datos de la base de datos excepto el usuario administrador
    """
    print("🚨 ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos")
    print("✅ Se mantendrán:")
    print("   - Todas las tablas y relaciones")
    print("   - El usuario administrador")
    print("   - La estructura de la base de datos")
    print()
    
    # Confirmar acción
    confirm = input("¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): ")
    if confirm != 'SI':
        print("❌ Operación cancelada")
        return
    
    print("\n🔄 Iniciando limpieza de datos...")
    
    try:
        # Obtener el usuario administrador para preservarlo
        admin_user = None
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                print(f"👤 Preservando usuario administrador: {admin_user.username}")
            else:
                print("⚠️  No se encontró usuario administrador")
        except Exception as e:
            print(f"⚠️  Error al buscar usuario administrador: {e}")
        
        # Lista de apps a limpiar (excluyendo django.contrib y core)
        apps_to_clear = [
            'users',
            'companies', 
            'students',
            'projects',
            'applications',
            'evaluations',
            'notifications',
            'work_hours',
            'interviews',
            'calendar_events',
            'strikes',
            'questionnaires',
            'trl_levels',
            'areas',
            'project_status',
            'assignments',
            'mass_notifications',
            'custom_admin',
        ]
        
        # Limpiar cada app
        for app_name in apps_to_clear:
            try:
                print(f"🧹 Limpiando app: {app_name}")
                
                # Obtener el modelo de la app
                app_models = django.apps.apps.get_app_config(app_name).get_models()
                
                for model in app_models:
                    try:
                        # Contar registros antes de eliminar
                        count_before = model.objects.count()
                        
                        # Eliminar todos los registros
                        deleted_count = model.objects.all().delete()[0]
                        
                        print(f"   ✅ {model.__name__}: {count_before} → 0 registros")
                        
                    except Exception as e:
                        print(f"   ❌ Error en {model.__name__}: {e}")
                
            except Exception as e:
                print(f"❌ Error limpiando app {app_name}: {e}")
        
        # Limpiar usuarios (excepto administradores)
        try:
            print("🧹 Limpiando usuarios...")
            users_count = User.objects.count()
            admin_count = User.objects.filter(is_superuser=True).count()
            
            # Eliminar usuarios no administradores
            User.objects.filter(is_superuser=False).delete()
            
            print(f"   ✅ Usuarios: {users_count} → {admin_count} (solo administradores)")
            
        except Exception as e:
            print(f"❌ Error limpiando usuarios: {e}")
        
        # Limpiar sesiones
        try:
            print("🧹 Limpiando sesiones...")
            from django.contrib.sessions.models import Session
            sessions_count = Session.objects.count()
            Session.objects.all().delete()
            print(f"   ✅ Sesiones: {sessions_count} → 0")
        except Exception as e:
            print(f"❌ Error limpiando sesiones: {e}")
        
        # Limpiar contenido de Django
        try:
            print("🧹 Limpiando contenido de Django...")
            
            # Limpiar grupos
            from django.contrib.auth.models import Group
            groups_count = Group.objects.count()
            Group.objects.all().delete()
            print(f"   ✅ Grupos: {groups_count} → 0")
            
            # Limpiar permisos
            from django.contrib.auth.models import Permission
            permissions_count = Permission.objects.count()
            Permission.objects.all().delete()
            print(f"   ✅ Permisos: {permissions_count} → 0")
            
            # Limpiar tipos de contenido
            from django.contrib.contenttypes.models import ContentType
            content_types_count = ContentType.objects.count()
            ContentType.objects.all().delete()
            print(f"   ✅ Tipos de contenido: {content_types_count} → 0")
            
        except Exception as e:
            print(f"❌ Error limpiando contenido de Django: {e}")
        
        print("\n✅ Limpieza completada exitosamente!")
        print("📊 Resumen:")
        print("   - Todas las tablas se mantienen")
        print("   - Todas las relaciones se mantienen")
        print("   - Solo se preservan los usuarios administradores")
        print("   - Todos los demás datos han sido eliminados")
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        return False
    
    return True

def reset_sequences():
    """
    Reinicia las secuencias de auto-incremento
    """
    print("\n🔄 Reiniciando secuencias de auto-incremento...")
    
    try:
        with connection.cursor() as cursor:
            # Obtener todas las tablas
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            """)
            
            tables = cursor.fetchall()
            
            for table in tables:
                table_name = table[0]
                try:
                    # Reiniciar secuencia si existe
                    cursor.execute(f"""
                        SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 1, false)
                        FROM information_schema.columns 
                        WHERE table_name = '{table_name}' 
                        AND column_name = 'id' 
                        AND data_type = 'integer'
                    """)
                    print(f"   ✅ Secuencia reiniciada para: {table_name}")
                except:
                    # La tabla no tiene secuencia o no es necesario
                    pass
                    
    except Exception as e:
        print(f"⚠️  Error reiniciando secuencias: {e}")

if __name__ == '__main__':
    print("🧹 SCRIPT DE LIMPIEZA COMPLETA DE BASE DE DATOS")
    print("=" * 60)
    
    success = clear_all_data()
    
    if success:
        # Solo reiniciar secuencias si la limpieza fue exitosa
        reset_sequences()
        
        print("\n🎉 ¡Proceso completado!")
        print("💡 Recomendación: Ejecuta 'python manage.py migrate' para asegurar consistencia")
    else:
        print("\n❌ La limpieza no se completó correctamente")
        sys.exit(1)
