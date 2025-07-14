#!/usr/bin/env python3
"""
Script de configuración automática para LEANMAKER BACKEND
Ejecutar: python setup.py
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_header():
    print("=" * 60)
    print("🚀 LEANMAKER BACKEND - CONFIGURACIÓN AUTOMÁTICA")
    print("=" * 60)

def check_python_version():
    """Verificar versión de Python"""
    print("📋 Verificando versión de Python...")
    if sys.version_info < (3, 11):
        print("❌ Error: Se requiere Python 3.11 o superior")
        print(f"   Versión actual: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} - OK")
    return True

def create_virtual_environment():
    """Crear entorno virtual"""
    print("\n🐍 Creando entorno virtual...")
    if os.path.exists("venv"):
        print("⚠️  El entorno virtual ya existe")
        response = input("¿Deseas recrearlo? (y/N): ").lower()
        if response == 'y':
            shutil.rmtree("venv")
        else:
            print("✅ Usando entorno virtual existente")
            return True
    
    try:
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Entorno virtual creado")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error al crear entorno virtual")
        return False

def activate_virtual_environment():
    """Activar entorno virtual"""
    print("\n🔧 Activando entorno virtual...")
    
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        python_path = "venv\\Scripts\\python.exe"
        pip_path = "venv\\Scripts\\pip.exe"
    else:  # Linux/Mac
        activate_script = "venv/bin/activate"
        python_path = "venv/bin/python"
        pip_path = "venv/bin/pip"
    
    if not os.path.exists(python_path):
        print("❌ Error: No se encontró el entorno virtual")
        return None, None
    
    print("✅ Entorno virtual activado")
    return python_path, pip_path

def install_dependencies(pip_path):
    """Instalar dependencias"""
    print("\n📦 Instalando dependencias...")
    try:
        subprocess.run([pip_path, "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencias instaladas")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error al instalar dependencias")
        return False

def create_env_file():
    """Crear archivo .env"""
    print("\n⚙️  Configurando variables de entorno...")
    
    if os.path.exists(".env"):
        print("⚠️  El archivo .env ya existe")
        response = input("¿Deseas sobrescribirlo? (y/N): ").lower()
        if response != 'y':
            print("✅ Usando archivo .env existente")
            return True
    
    if os.path.exists("env.example"):
        shutil.copy("env.example", ".env")
        print("✅ Archivo .env creado desde env.example")
        print("⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones")
        return True
    else:
        print("❌ No se encontró env.example")
        return False

def run_migrations(python_path):
    """Ejecutar migraciones"""
    print("\n🗄️  Ejecutando migraciones...")
    try:
        subprocess.run([python_path, "manage.py", "makemigrations"], check=True)
        subprocess.run([python_path, "manage.py", "migrate"], check=True)
        print("✅ Migraciones ejecutadas")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error al ejecutar migraciones")
        return False

def create_superuser(python_path):
    """Crear superusuario"""
    print("\n👤 Creando superusuario...")
    response = input("¿Deseas crear un superusuario? (Y/n): ").lower()
    if response != 'n':
        try:
            subprocess.run([python_path, "manage.py", "createsuperuser"], check=True)
            print("✅ Superusuario creado")
        except subprocess.CalledProcessError:
            print("⚠️  Error al crear superusuario (puedes crearlo manualmente después)")

def populate_database(python_path):
    """Poblar base de datos"""
    print("\n📊 Poblando base de datos...")
    response = input("¿Deseas poblar la base de datos con datos de ejemplo? (Y/n): ").lower()
    if response != 'n':
        if os.path.exists("populate_all_tables_simple.py"):
            try:
                subprocess.run([python_path, "manage.py", "shell", "-c", 
                              "exec(open('populate_all_tables_simple.py').read())"], check=True)
                print("✅ Base de datos poblada")
            except subprocess.CalledProcessError:
                print("⚠️  Error al poblar base de datos")
        else:
            print("⚠️  No se encontró el script de población")

def run_tests(python_path):
    """Ejecutar tests"""
    print("\n🧪 Ejecutando tests...")
    try:
        subprocess.run([python_path, "manage.py", "test"], check=True)
        print("✅ Tests ejecutados correctamente")
    except subprocess.CalledProcessError:
        print("⚠️  Algunos tests fallaron")

def print_success():
    """Mostrar mensaje de éxito"""
    print("\n" + "=" * 60)
    print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    print("=" * 60)
    print("\n📋 Próximos pasos:")
    print("1. Edita el archivo .env con tus configuraciones")
    print("2. Configura tu base de datos SQL Server")
    print("3. Instala y configura Redis (para Celery)")
    print("4. Ejecuta: python manage.py runserver")
    print("\n🌐 El servidor estará disponible en: http://127.0.0.1:8000/")
    print("🔧 Panel de admin: http://127.0.0.1:8000/admin/")
    print("\n📚 Para más información, consulta el README.md")

def main():
    """Función principal"""
    print_header()
    
    # Verificar versión de Python
    if not check_python_version():
        sys.exit(1)
    
    # Crear entorno virtual
    if not create_virtual_environment():
        sys.exit(1)
    
    # Activar entorno virtual
    python_path, pip_path = activate_virtual_environment()
    if not python_path:
        sys.exit(1)
    
    # Instalar dependencias
    if not install_dependencies(pip_path):
        sys.exit(1)
    
    # Crear archivo .env
    if not create_env_file():
        sys.exit(1)
    
    # Ejecutar migraciones
    if not run_migrations(python_path):
        sys.exit(1)
    
    # Crear superusuario
    create_superuser(python_path)
    
    # Poblar base de datos
    populate_database(python_path)
    
    # Ejecutar tests
    run_tests(python_path)
    
    # Mostrar mensaje de éxito
    print_success()

if __name__ == "__main__":
    main() 