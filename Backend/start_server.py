#!/usr/bin/env python3
"""
Script para iniciar el servidor Django
"""
import subprocess
import sys
from pathlib import Path

def start_server():
    project_root = Path(__file__).parent
    venv_python = project_root / "venv312" / "Scripts" / "python.exe"
    
    print("🚀 Iniciando servidor Django...")
    print("📱 El servidor estará disponible en: http://127.0.0.1:8000")
    print("📚 Documentación API: http://127.0.0.1:8000/api/schema/swagger-ui/")
    print("🔐 Admin Django: http://127.0.0.1:8000/admin")
    print("\nPresiona Ctrl+C para detener el servidor\n")
    
    try:
        subprocess.run([str(venv_python), "manage.py", "runserver"], 
                      cwd=project_root, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar servidor: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")

if __name__ == "__main__":
    start_server()
