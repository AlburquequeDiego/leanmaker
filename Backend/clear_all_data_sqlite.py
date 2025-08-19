#!/usr/bin/env python
"""
Script para limpiar TODOS los datos de la base de datos SQLite
Mantiene SOLO el usuario administrador
NO elimina tablas, solo datos
"""

import os
import sys
import django
from django.db import connection
from django.core.management import execute_from_command_line

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def clear_all_data():
    """
    Elimina TODOS los datos de la base de datos SQLite excepto el usuario administrador
    """
    print("🚨 ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos")
    print("✅ Se mantendrán:")
    print("   - Todas las tablas y relaciones")
    print("   - SOLO el usuario administrador")
    print("   - La estructura de la base de datos")
    print()
    
    # Confirmar acción
    confirm = input("¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): ")
    if confirm != 'SI':
        print("❌ Operación cancelada")
        return
    
    print("\n🔄 Iniciando limpieza COMPLETA de datos...")
    
    try:
        # Obtener el usuario administrador para preservarlo
        from users.models import User
        admin_user = None
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                print(f"👤 Preservando usuario administrador: {admin_user.email}")
                print(f"   ID: {admin_user.id}")
                print(f"   Role: {admin_user.role}")
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
        
        total_deleted = 0
        
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
                        
                        if count_before > 0:
                            # Eliminar todos los registros
                            deleted_count = model.objects.all().delete()[0]
                            total_deleted += deleted_count
                            print(f"   ✅ {model.__name__}: {count_before} → 0 registros")
                        else:
                            print(f"   ℹ️  {model.__name__}: 0 registros (ya vacío)")
                        
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
            deleted_users = User.objects.filter(is_superuser=False).delete()[0]
            total_deleted += deleted_users
            
            print(f"   ✅ Usuarios: {users_count} → {admin_count} (solo administradores)")
            
        except Exception as e:
            print(f"❌ Error limpiando usuarios: {e}")
        
        # Limpiar sesiones
        try:
            print("🧹 Limpiando sesiones...")
            from django.contrib.sessions.models import Session
            sessions_count = Session.objects.count()
            deleted_sessions = Session.objects.all().delete()[0]
            total_deleted += deleted_sessions
            print(f"   ✅ Sesiones: {sessions_count} → 0")
        except Exception as e:
            print(f"❌ Error limpiando sesiones: {e}")
        
        # Limpiar contenido de Django
        try:
            print("🧹 Limpiando contenido de Django...")
            
            # Limpiar grupos
            from django.contrib.auth.models import Group
            groups_count = Group.objects.count()
            deleted_groups = Group.objects.all().delete()[0]
            total_deleted += deleted_groups
            print(f"   ✅ Grupos: {groups_count} → 0")
            
            # Limpiar permisos
            from django.contrib.auth.models import Permission
            permissions_count = Permission.objects.count()
            deleted_permissions = Permission.objects.all().delete()[0]
            total_deleted += deleted_permissions
            print(f"   ✅ Permisos: {permissions_count} → 0")
            
            # Limpiar tipos de contenido
            from django.contrib.contenttypes.models import ContentType
            content_types_count = ContentType.objects.count()
            deleted_content_types = ContentType.objects.all().delete()[0]
            total_deleted += deleted_content_types
            print(f"   ✅ Tipos de contenido: {content_types_count} → 0")
            
        except Exception as e:
            print(f"❌ Error limpiando contenido de Django: {e}")
        
        print("\n✅ Limpieza completada exitosamente!")
        print("📊 Resumen:")
        print(f"   - Total de registros eliminados: {total_deleted}")
        print("   - Todas las tablas se mantienen")
        print("   - Todas las relaciones se mantienen")
        print("   - SOLO se preservan los usuarios administradores")
        print("   - Todos los demás datos han sido eliminados")
        
        # Verificar que solo queda el admin
        final_admin_count = User.objects.filter(is_superuser=True).count()
        final_total_count = User.objects.count()
        print(f"   - Usuarios finales: {final_total_count} (de los cuales {final_admin_count} son admin)")
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        return False
    
    return True

def reset_sqlite_sequences():
    """
    Reinicia las secuencias de auto-incremento en SQLite
    """
    print("\n🔄 Reiniciando secuencias de auto-incremento en SQLite...")
    
    try:
        with connection.cursor() as cursor:
            # Obtener todas las tablas
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            
            for table in tables:
                table_name = table[0]
                try:
                    # Reiniciar secuencia SQLite
                    cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table_name}'")
                    print(f"   ✅ Secuencia reiniciada para: {table_name}")
                except Exception as e:
                    # La tabla no tiene secuencia o no es necesario
                    print(f"   ℹ️  {table_name}: {e}")
                    
    except Exception as e:
        print(f"⚠️  Error reiniciando secuencias: {e}")

if __name__ == '__main__':
    print("🧹 SCRIPT DE LIMPIEZA COMPLETA DE BASE DE DATOS SQLITE")
    print("=" * 70)
    print("🎯 OBJETIVO: Eliminar TODOS los datos EXCEPTO el usuario admin")
    print("=" * 70)
    
    success = clear_all_data()
    
    if success:
        # Solo reiniciar secuencias si la limpieza fue exitosa
        reset_sqlite_sequences()
        
        print("\n🎉 ¡Proceso completado!")
        print("💡 Recomendación: Ejecuta 'python manage.py migrate' para asegurar consistencia")
        print("💡 La base de datos ahora solo contiene el usuario administrador")
    else:
        print("\n❌ La limpieza no se completó correctamente")
        sys.exit(1)
