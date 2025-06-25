#!/usr/bin/env python3
"""
Script para crear superusuario de Django
"""
import subprocess
import sys
from pathlib import Path

def create_superuser():
    project_root = Path(__file__).parent
    venv_python = project_root / "venv312" / "Scripts" / "python.exe"
    
    print("🔐 Creando superusuario para Django Admin...")
    print("Por favor ingresa los datos solicitados:")
    
    try:
        subprocess.run([str(venv_python), "manage.py", "createsuperuser"], 
                      cwd=project_root, check=True)
        print("✅ Superusuario creado exitosamente!")
        print("🌐 Puedes acceder al admin en: http://127.0.0.1:8000/admin")
    except subprocess.CalledProcessError:
        print("❌ Error al crear superusuario")
    except KeyboardInterrupt:
        print("\n❌ Operación cancelada por el usuario")

if __name__ == "__main__":
    create_superuser()
