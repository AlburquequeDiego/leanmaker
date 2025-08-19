#!/usr/bin/env python
"""
Script para limpiar todos los datos de SQLite
Mantiene las tablas pero elimina todos los registros
"""

import sqlite3
import os
import sys

def clear_sqlite_data():
    """
    Elimina todos los datos de la base de datos SQLite
    """
    db_path = 'db.sqlite3'
    
    if not os.path.exists(db_path):
        print(f"❌ No se encontró la base de datos: {db_path}")
        return False
    
    print("🚨 ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos")
    print("✅ Se mantendrán:")
    print("   - Todas las tablas y relaciones")
    print("   - La estructura de la base de datos")
    print("❌ Se eliminarán:")
    print("   - Todos los registros de todas las tablas")
    print("   - Todos los usuarios (incluyendo administradores)")
    print()
    
    # Confirmar acción
    confirm = input("¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): ")
    if confirm != 'SI':
        print("❌ Operación cancelada")
        return False
    
    print("\n🔄 Iniciando limpieza de datos...")
    
    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Obtener todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"📊 Encontradas {len(tables)} tablas")
        
        # Lista de tablas del sistema que NO debemos tocar
        system_tables = {
            'sqlite_sequence',  # Secuencias de SQLite
            'django_migrations',  # Migraciones de Django
            'django_content_type',  # Tipos de contenido
            'django_admin_log',  # Logs del admin
            'django_session',  # Sesiones
            'auth_permission',  # Permisos
            'auth_group',  # Grupos
            'auth_user',  # Usuarios
        }
        
        # Contar y eliminar datos de cada tabla
        total_deleted = 0
        
        for table in tables:
            table_name = table[0]
            
            # Saltar tablas del sistema
            if table_name in system_tables:
                print(f"⏭️  Saltando tabla del sistema: {table_name}")
                continue
            
            try:
                # Contar registros antes de eliminar
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count_before = cursor.fetchone()[0]
                
                if count_before > 0:
                    # Eliminar todos los registros
                    cursor.execute(f"DELETE FROM {table_name}")
                    deleted_count = cursor.rowcount
                    
                    print(f"   ✅ {table_name}: {count_before} → 0 registros")
                    total_deleted += deleted_count
                else:
                    print(f"   ℹ️  {table_name}: Ya está vacía")
                    
            except Exception as e:
                print(f"   ❌ Error en {table_name}: {e}")
        
        # Limpiar tablas del sistema (excepto migraciones)
        print("\n🧹 Limpiando tablas del sistema...")
        
        # Limpiar usuarios (todos)
        try:
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            users_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM auth_user")
            print(f"   ✅ Usuarios: {users_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando usuarios: {e}")
        
        # Limpiar sesiones
        try:
            cursor.execute("SELECT COUNT(*) FROM django_session")
            sessions_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM django_session")
            print(f"   ✅ Sesiones: {sessions_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando sesiones: {e}")
        
        # Limpiar grupos
        try:
            cursor.execute("SELECT COUNT(*) FROM auth_group")
            groups_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM auth_group")
            print(f"   ✅ Grupos: {groups_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando grupos: {e}")
        
        # Limpiar permisos
        try:
            cursor.execute("SELECT COUNT(*) FROM auth_permission")
            permissions_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM auth_permission")
            print(f"   ✅ Permisos: {permissions_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando permisos: {e}")
        
        # Limpiar tipos de contenido
        try:
            cursor.execute("SELECT COUNT(*) FROM django_content_type")
            content_types_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM django_content_type")
            print(f"   ✅ Tipos de contenido: {content_types_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando tipos de contenido: {e}")
        
        # Limpiar logs del admin
        try:
            cursor.execute("SELECT COUNT(*) FROM django_admin_log")
            admin_logs_count = cursor.fetchone()[0]
            cursor.execute("DELETE FROM django_admin_log")
            print(f"   ✅ Logs del admin: {admin_logs_count} → 0")
        except Exception as e:
            print(f"   ❌ Error limpiando logs del admin: {e}")
        
        # Reiniciar secuencias de auto-incremento
        print("\n🔄 Reiniciando secuencias de auto-incremento...")
        try:
            cursor.execute("DELETE FROM sqlite_sequence")
            print("   ✅ Secuencias reiniciadas")
        except Exception as e:
            print(f"   ⚠️  Error reiniciando secuencias: {e}")
        
        # Confirmar cambios
        conn.commit()
        conn.close()
        
        print(f"\n✅ Limpieza completada exitosamente!")
        print(f"📊 Total de registros eliminados: {total_deleted}")
        print("📊 Resumen:")
        print("   - Todas las tablas se mantienen")
        print("   - Todas las relaciones se mantienen")
        print("   - Todos los datos han sido eliminados")
        print("   - La estructura de la BD está intacta")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        return False

def create_admin_user():
    """
    Crea un usuario administrador usando Django
    """
    print("\n👤 Creando usuario administrador...")
    
    try:
        # Configurar Django
        import os
        import django
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        django.setup()
        
        from django.contrib.auth.models import User
        
        # Crear usuario administrador
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        
        print(f"✅ Usuario administrador creado: {admin_user.username}")
        print("🔑 Contraseña: admin123")
        print("⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        print("💡 Puedes crear el usuario manualmente con: python manage.py createsuperuser")

if __name__ == '__main__':
    print("🧹 SCRIPT DE LIMPIEZA COMPLETA DE SQLITE")
    print("=" * 50)
    
    success = clear_sqlite_data()
    
    if success:
        print("\n🎉 ¡Proceso completado!")
        print("💡 Recomendaciones:")
        print("   1. Ejecuta 'python manage.py migrate' para asegurar consistencia")
        print("   2. Crea un usuario administrador con 'python manage.py createsuperuser'")
        print("   3. Verifica que el servidor funcione con 'python manage.py runserver'")
        
        # Preguntar si crear usuario administrador
        create_admin = input("\n¿Quieres que cree un usuario administrador ahora? (s/n): ")
        if create_admin.lower() in ['s', 'si', 'y', 'yes']:
            create_admin_user()
    else:
        print("\n❌ La limpieza no se completó correctamente")
        sys.exit(1)
