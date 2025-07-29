#!/usr/bin/env python3
"""
Script de configuración para desarrollo local de LeanMaker
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado exitosamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Error: {e.stderr}")
        return False

def create_directories():
    """Crea directorios necesarios"""
    directories = ['logs', 'media', 'staticfiles', 'backups', 'reports']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"📁 Directorio {directory} creado/verificado")

def setup_environment():
    """Configura el entorno de desarrollo"""
    print("🚀 Configurando entorno de desarrollo local para LeanMaker")
    
    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")
    
    # Crear directorios
    create_directories()
    
    # Instalar dependencias
    if not run_command("pip install -r requirements_local.txt", "Instalando dependencias"):
        return False
    
    # Configurar variables de entorno
    env_file = Path('.env')
    if not env_file.exists():
        env_content = """# Configuración local para LeanMaker
SECRET_KEY=django-insecure-local-development-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos SQLite (automática)
DATABASE_URL=sqlite:///db.sqlite3

# Configuración de CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Configuración de JWT
JWT_SECRET_KEY=local-jwt-secret-key-change-in-production

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=logs/django.log
"""
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ Archivo .env creado")
    
    return True

def run_migrations():
    """Ejecuta las migraciones de la base de datos"""
    print("\n🗄️ Configurando base de datos...")
    
    # Usar configuración local
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings_local'
    
    commands = [
        ("python manage.py makemigrations", "Creando migraciones"),
        ("python manage.py migrate", "Aplicando migraciones"),
        ("python manage.py collectstatic --noinput", "Recopilando archivos estáticos"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    
    return True

def create_superuser():
    """Crea un superusuario para pruebas"""
    print("\n👤 Creando superusuario para pruebas...")
    print("Por favor, ingresa los datos del superusuario:")
    
    try:
        subprocess.run("python manage.py createsuperuser", shell=True, check=True)
        print("✅ Superusuario creado exitosamente")
        return True
    except subprocess.CalledProcessError:
        print("⚠️ No se pudo crear el superusuario (puede que ya exista)")
        return True

def main():
    """Función principal"""
    print("=" * 60)
    print("🔧 CONFIGURADOR LOCAL DE LEANMAKER")
    print("=" * 60)
    
    # Cambiar al directorio del backend
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Configurar entorno
    if not setup_environment():
        print("❌ Error en la configuración del entorno")
        sys.exit(1)
    
    # Ejecutar migraciones
    if not run_migrations():
        print("❌ Error en las migraciones")
        sys.exit(1)
    
    # Crear superusuario
    create_superuser()
    
    # Preguntar si crear datos de prueba
    print("\n" + "=" * 60)
    print("🎯 ¿CREAR DATOS DE PRUEBA?")
    print("=" * 60)
    print("¿Quieres crear usuarios y datos de prueba basados en tu archivo de conexiones?")
    print("Esto incluirá:")
    print("- 1 Admin (Laura Martínez)")
    print("- 10 Estudiantes (diego.alburqueque@inacapmail.cl, etc.)")
    print("- 10 Empresas (informatica@contrucciones.cL, etc.)")
    print("- Proyectos de ejemplo")
    print("\nResponde 's' para sí, 'n' para no: ", end="")
    
    try:
        response = input().lower().strip()
        if response in ['s', 'si', 'sí', 'y', 'yes']:
            print("\n🔄 Creando datos de prueba...")
            if run_command("python create_sample_data.py", "Creando datos de prueba"):
                print("✅ Datos de prueba creados exitosamente")
            else:
                print("⚠️ Error creando datos de prueba")
        else:
            print("⏭️ Saltando creación de datos de prueba")
    except:
        print("⏭️ Saltando creación de datos de prueba")
    
    print("\n" + "=" * 60)
    print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    print("=" * 60)
    print("\n📋 Próximos pasos:")
    print("1. Ejecuta el servidor: python manage.py runserver --settings=core.settings_local")
    print("2. Abre http://localhost:8000/admin en tu navegador")
    print("3. Inicia el frontend: cd ../Frontend && npm run dev")
    print("\n🔗 URLs importantes:")
    print("   - Admin: http://localhost:8000/admin")
    print("   - API: http://localhost:8000/api/")
    print("   - Frontend: http://localhost:5173")
    print("\n💡 Para usar la configuración local:")
    print("   export DJANGO_SETTINGS_MODULE=core.settings_local")
    print("   o")
    print("   python manage.py runserver --settings=core.settings_local")

if __name__ == "__main__":
    main() 