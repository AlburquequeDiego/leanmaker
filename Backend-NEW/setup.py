#!/usr/bin/env python3
"""
Setup script for LeanMaker Backend.
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False


def create_directories():
    """Create necessary directories."""
    directories = [
        'logs',
        'media',
        'static',
        'templates',
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"📁 Directorio creado: {directory}")


def create_env_file():
    """Create .env file with default configuration."""
    env_content = """# LeanMaker Backend Configuration
# ========================================

# Django Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Settings
DB_NAME=leanmaker_db
DB_USER=administradortesis
DB_PASSWORD=Admin@tesis
DB_HOST=servidortesis.database.windows.net
DB_PORT=1433

# Email Settings (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
"""
    
    env_file = Path('.env')
    if not env_file.exists():
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("📄 Archivo .env creado")
    else:
        print("📄 Archivo .env ya existe")


def main():
    """Main setup function."""
    print("🚀 Configurando LeanMaker Backend...")
    
    # Create directories
    create_directories()
    
    # Create .env file
    create_env_file()
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Instalando dependencias"):
        print("❌ Error al instalar dependencias. Verifica que Python y pip estén instalados.")
        return False
    
    # Make migrations
    if not run_command("python manage.py makemigrations", "Creando migraciones"):
        print("❌ Error al crear migraciones.")
        return False
    
    # Run migrations
    if not run_command("python manage.py migrate", "Ejecutando migraciones"):
        print("❌ Error al ejecutar migraciones.")
        return False
    
    # Create superuser
    print("\n👤 Creando superusuario...")
    print("Por favor, ingresa los datos del superusuario:")
    email = input("Email: ").strip()
    if not email:
        email = "admin@leanmaker.com"
    
    password = input("Contraseña: ").strip()
    if not password:
        password = "admin123"
    
    create_superuser_cmd = f'python manage.py shell -c "from users.models import User; User.objects.create_superuser(email=\'{email}\', password=\'{password}\')"'
    if run_command(create_superuser_cmd, "Creando superusuario"):
        print(f"✅ Superusuario creado: {email}")
    
    # Collect static files
    run_command("python manage.py collectstatic --noinput", "Recopilando archivos estáticos")
    
    print("\n🎉 ¡Configuración completada!")
    print("\n📋 Próximos pasos:")
    print("1. Ejecuta: python manage.py runserver")
    print("2. Accede a: http://localhost:8000/admin")
    print("3. Accede a la API: http://localhost:8000/api/")
    print("4. Documentación: http://localhost:8000/api/schema/swagger-ui/")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 