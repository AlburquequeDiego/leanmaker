#!/usr/bin/env python
"""
Script para verificar los campos en la base de datos.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from users.models import User

def check_database_fields():
    """Verificar los campos en la base de datos."""
    try:
        print("🔍 Verificando estructura de la tabla users...")
        
        # Verificar estructura de la tabla
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' 
                AND COLUMN_NAME IN ('position', 'department', 'phone', 'bio')
                ORDER BY COLUMN_NAME
            """)
            
            columns = cursor.fetchall()
            print("\n📋 Estructura de campos:")
            for column in columns:
                print(f"   {column[0]}: {column[1]} (NULL: {column[2]}, DEFAULT: {column[3]})")
        
        print("\n👤 Verificando datos de usuarios administradores...")
        
        # Verificar datos de usuarios
        admin_users = User.objects.filter(role='admin')
        
        for user in admin_users:
            print(f"\n📝 Usuario: {user.email}")
            print(f"   ID: {user.id}")
            print(f"   Nombre: {user.first_name} {user.last_name}")
            print(f"   Teléfono: {user.phone}")
            print(f"   Cargo: {user.position}")
            print(f"   Departamento: {user.department}")
            print(f"   Bio: {user.bio}")
            print(f"   Última actualización: {user.updated_at}")
            
            # Verificar si los campos existen en el modelo
            print(f"   position field exists: {hasattr(user, 'position')}")
            print(f"   department field exists: {hasattr(user, 'department')}")
            
            # Verificar valores directamente desde la base de datos
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT position, department, phone, bio 
                    FROM users 
                    WHERE id = %s
                """, [str(user.id)])
                
                row = cursor.fetchone()
                if row:
                    print(f"   DB position: {row[0]}")
                    print(f"   DB department: {row[1]}")
                    print(f"   DB phone: {row[2]}")
                    print(f"   DB bio: {row[3]}")
        
        # Verificar si hay migraciones pendientes
        print("\n🔄 Verificando migraciones...")
        from django.core.management import call_command
        from io import StringIO
        
        out = StringIO()
        call_command('showmigrations', 'users', stdout=out)
        migrations_output = out.getvalue()
        
        print(migrations_output)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_database_fields() 