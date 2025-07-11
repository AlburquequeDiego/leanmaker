#!/usr/bin/env python
"""
Script para verificar las tablas existentes en la base de datos Azure SQL Server.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def check_existing_tables():
    """Verificar tablas existentes en la base de datos."""
    print("🔍 Verificando tablas existentes en Azure SQL Server...")
    
    try:
        with connection.cursor() as cursor:
            # Obtener todas las tablas
            cursor.execute("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            """)
            tables = cursor.fetchall()
            
            print(f"\n📋 Se encontraron {len(tables)} tablas:")
            print("=" * 50)
            
            for table in tables:
                table_name = table[0]
                print(f"✅ {table_name}")
                
                # Verificar columnas de cada tabla
                cursor.execute(f"""
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '{table_name}'
                    ORDER BY ORDINAL_POSITION
                """)
                columns = cursor.fetchall()
                
                print(f"   📊 Columnas ({len(columns)}):")
                for col in columns:
                    col_name, data_type, nullable = col
                    null_status = "NULL" if nullable == "YES" else "NOT NULL"
                    print(f"      - {col_name}: {data_type} ({null_status})")
                print()
            
            return tables
            
    except Exception as e:
        print(f"❌ Error al verificar tablas: {e}")
        return []

def check_django_tables():
    """Verificar si las tablas de Django existen."""
    print("\n🔍 Verificando tablas específicas de Django...")
    
    django_tables = [
        'django_migrations',
        'django_content_type',
        'django_admin_log',
        'django_session',
        'auth_group',
        'auth_group_permissions',
        'auth_permission',
        'users',  # Tu tabla de usuarios personalizada
    ]
    
    try:
        with connection.cursor() as cursor:
            for table in django_tables:
                cursor.execute(f"""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = '{table}'
                """)
                exists = cursor.fetchone()[0] > 0
                status = "✅ Existe" if exists else "❌ No existe"
                print(f"   {status}: {table}")
                
    except Exception as e:
        print(f"❌ Error al verificar tablas de Django: {e}")

def check_user_data():
    """Verificar si hay datos de usuarios."""
    print("\n👥 Verificando datos de usuarios...")
    
    try:
        with connection.cursor() as cursor:
            # Verificar tabla de usuarios
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"   👤 Usuarios en la base de datos: {user_count}")
            
            if user_count > 0:
                # Mostrar algunos usuarios
                cursor.execute("SELECT TOP 5 id, email, first_name, last_name, role FROM users")
                users = cursor.fetchall()
                print("   📋 Primeros 5 usuarios:")
                for user in users:
                    user_id, email, first_name, last_name, role = user
                    print(f"      - {email} ({first_name} {last_name}) - {role}")
                    
    except Exception as e:
        print(f"❌ Error al verificar datos de usuarios: {e}")

if __name__ == '__main__':
    print("🚀 Iniciando verificación de base de datos Azure SQL Server...")
    print("=" * 60)
    
    # Verificar tablas existentes
    tables = check_existing_tables()
    
    # Verificar tablas de Django
    check_django_tables()
    
    # Verificar datos de usuarios
    check_user_data()
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada") 