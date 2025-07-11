#!/usr/bin/env python
"""
Script para verificar la estructura exacta del modelo User en la base de datos.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from users.models import User

def check_user_model_structure():
    """Verificar la estructura del modelo User en la base de datos."""
    print("🔍 Verificando estructura del modelo User...")
    print("=" * 60)
    
    # Verificar columnas de la tabla users
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'users'
            ORDER BY ORDINAL_POSITION
        """)
        columns = cursor.fetchall()
        
        print("📋 Columnas de la tabla 'users':")
        for col in columns:
            col_name, data_type, nullable, default = col
            print(f"   - {col_name}: {data_type} ({nullable}) [Default: {default}]")
        print()
    
    # Verificar un usuario específico
    try:
        user = User.objects.get(email='contacto@ecologistica.com')
        print(f"👤 Usuario de prueba: {user.email}")
        print(f"   - ID (tipo): {type(user.id)}")
        print(f"   - ID (valor): {user.id}")
        print(f"   - ID (str): {str(user.id)}")
        print(f"   - ID (repr): {repr(user.id)}")
        print()
        
        # Verificar si el ID es un UUID
        import uuid
        try:
            uuid_obj = uuid.UUID(str(user.id))
            print(f"✅ El ID es un UUID válido: {uuid_obj}")
        except ValueError:
            print(f"❌ El ID no es un UUID válido")
        print()
        
    except User.DoesNotExist:
        print("❌ Usuario no encontrado")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    check_user_model_structure() 