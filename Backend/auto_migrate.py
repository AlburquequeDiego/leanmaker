#!/usr/bin/env python
"""
Script para crear migraciones automáticamente
Responde a todas las preguntas de Django
"""

import subprocess
import sys

def run_makemigrations():
    """
    Ejecuta makemigrations con respuestas automáticas
    """
    print("🔄 Creando migraciones automáticamente...")
    
    # Respuestas a las preguntas de Django
    responses = [
        "y\n",  # calendarevent.end_time -> end_date
        "y\n",  # calendarevent.recurrence_pattern -> representative_name
        "y\n",  # calendarevent.start_time -> start_date
        "y\n",  # empresa.verification_notes -> address
        "y\n",  # empresa.phone -> company_phone
        "y\n",  # empresa.company_size -> internship_duration
        "y\n",  # empresa.revenue_range -> personality
        "y\n",  # empresa.is_verified -> verified
        "y\n",  # apilevelrequest.admin_notes -> feedback
        "y\n",  # apilevelrequest.estudiante -> student
        "y\n",  # apilevelrequest.created_at -> submitted_at
        "y\n",  # user.date_of_birth -> birthdate
        "y\n",  # user.nationality -> career
        "1\n",  # Opción 1 para el campo created_by
        "None\n"  # Valor por defecto None
    ]
    
    # Crear el input completo
    input_data = "".join(responses)
    
    try:
        # Ejecutar makemigrations con las respuestas
        process = subprocess.Popen(
            [sys.executable, "manage.py", "makemigrations"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd="."
        )
        
        stdout, stderr = process.communicate(input=input_data)
        
        if process.returncode == 0:
            print("✅ Migraciones creadas exitosamente!")
            print("📝 Salida:")
            print(stdout)
        else:
            print("❌ Error creando migraciones:")
            print(stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando makemigrations: {e}")
        return False
    
    return True

def run_migrate():
    """
    Ejecuta las migraciones
    """
    print("\n🔄 Aplicando migraciones...")
    
    try:
        process = subprocess.run(
            [sys.executable, "manage.py", "migrate"],
            capture_output=True,
            text=True,
            cwd="."
        )
        
        if process.returncode == 0:
            print("✅ Migraciones aplicadas exitosamente!")
            print("📝 Salida:")
            print(process.stdout)
        else:
            print("❌ Error aplicando migraciones:")
            print(process.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando migrate: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🚀 SCRIPT DE MIGRACIÓN AUTOMÁTICA")
    print("=" * 40)
    
    # Crear migraciones
    if run_makemigrations():
        # Aplicar migraciones
        if run_migrate():
            print("\n🎉 ¡Proceso de migración completado!")
            print("💡 Próximos pasos:")
            print("   1. Crear usuario administrador: python manage.py createsuperuser")
            print("   2. Verificar servidor: python manage.py runserver")
        else:
            print("\n❌ Error aplicando migraciones")
            sys.exit(1)
    else:
        print("\n❌ Error creando migraciones")
        sys.exit(1)
