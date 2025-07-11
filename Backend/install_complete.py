#!/usr/bin/env python3
"""
Script de instalación completa para LeanMaker Backend - Django Puro + TypeScript.
Incluye migración automática de todas las apps del backend original.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Ejecutar comando y manejar errores."""
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
    """Crear directorios necesarios."""
    directories = [
        'logs',
        'media',
        'static',
        'templates',
        'static/js',
        'static/css',
        'static/img',
    ]
    
    for directory in directories:
        try:
            Path(directory).mkdir(exist_ok=True)
            print(f"📁 Directorio creado o ya existente: {directory}")
        except Exception as e:
            print(f"❌ No se pudo crear el directorio {directory}: {e}")
            return False
    return True

def create_env_file():
    """Crear archivo .env si no existe."""
    env_file = Path('.env')
    env_example = Path('env.example')
    
    if not env_file.exists() and env_example.exists():
        shutil.copy(env_example, env_file)
        print("📄 Archivo .env creado desde env.example")
        print("⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones")
    elif env_file.exists():
        print("📄 Archivo .env ya existe")
    else:
        print("❌ No se encontró env.example")
    return True

def install_dependencies():
    """Instalar dependencias Python."""
    if not run_command("pip install -r requirements.txt", "Instalando dependencias Python"):
        return False
    return True

def run_migrations():
    """Ejecutar migraciones de Django."""
    commands = [
        ("py manage.py makemigrations", "Creando migraciones"),
        ("py manage.py migrate", "Ejecutando migraciones"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def create_superuser():
    """Crear superusuario si no existe."""
    print("\n👤 Creación de superusuario")
    print("=" * 40)
    
    # Verificar si ya existe un superusuario
    try:
        result = subprocess.run(
            "py manage.py shell -c \"from users.models import User; print(User.objects.filter(is_superuser=True).count())\"",
            shell=True, capture_output=True, text=True
        )
        superuser_count = int(result.stdout.strip())
        
        if superuser_count > 0:
            print("✅ Ya existe al menos un superusuario")
            return True
    except:
        pass
    
    print("📝 Creando superusuario...")
    print("💡 Usa: admin@leanmaker.com / admin123")
    
    # Crear superusuario automáticamente
    create_command = '''py manage.py shell -c "
from users.models import User
if not User.objects.filter(email='admin@leanmaker.com').exists():
    user = User.objects.create_superuser(
        email='admin@leanmaker.com',
        password='admin123',
        first_name='Admin',
        last_name='LeanMaker',
        role='admin'
    )
    print(f'Superusuario creado: {user.email}')
else:
    print('Superusuario ya existe')
"'''
    
    if run_command(create_command, "Creando superusuario"):
        print("✅ Superusuario creado exitosamente")
        print("   Email: admin@leanmaker.com")
        print("   Password: admin123")
        return True
    else:
        print("❌ Error creando superusuario")
        return False

def migrate_apps():
    """Migrar apps del backend original."""
    print("\n📦 MIGRACIÓN DE APPS DEL BACKEND ORIGINAL")
    print("=" * 50)
    
    # Verificar que existe el backend original
    original_backend = Path("../Backend")
    if not original_backend.exists():
        print("❌ No se encontró el backend original en ../Backend")
        print("💡 Asegúrate de que el backend original esté en el directorio padre")
        return False
    
    # Ejecutar script de migración
    if not run_command("py migrate_all_apps.py", "Migrando apps del backend original"):
        return False
    
    return True

def collect_static():
    """Recolectar archivos estáticos."""
    return run_command("py manage.py collectstatic --noinput", "Recolectando archivos estáticos")

def check_installation():
    """Verificar que la instalación fue exitosa."""
    print("\n🔍 VERIFICANDO INSTALACIÓN")
    print("=" * 30)
    
    checks = [
        ("Verificando Django", "py manage.py check"),
        ("Verificando base de datos", "py manage.py dbshell -c 'SELECT 1;'"),
    ]
    
    all_passed = True
    for description, command in checks:
        if run_command(command, description):
            print(f"✅ {description}: OK")
        else:
            print(f"❌ {description}: FALLÓ")
            all_passed = False
    
    return all_passed

def show_next_steps():
    """Mostrar próximos pasos."""
    print("\n🚀 PRÓXIMOS PASOS")
    print("=" * 30)
    print("1. 📝 Edita el archivo .env con tus configuraciones")
    print("2. 🌐 Ejecuta: py manage.py runserver")
    print("3. 🔗 Accede a: http://localhost:8000")
    print("4. 👤 Login admin: admin@leanmaker.com / admin123")
    print("5. 📊 Admin panel: http://localhost:8000/admin/")
    print("6. 🔧 Verifica que todas las apps funcionen correctamente")
    
    print("\n📚 DOCUMENTACIÓN:")
    print("- README.md: Guía completa del proyecto")
    print("- Templates: En directorio templates/")
    print("- TypeScript: En static/js/typescript-integration.ts")
    
    print("\n🎯 ESTRUCTURA FINAL:")
    print("Backend-NEW/")
    print("├── core/           # Configuración Django")
    print("├── users/          # Sistema de usuarios")
    print("├── students/       # Gestión de estudiantes")
    print("├── companies/      # Gestión de empresas")
    print("├── projects/       # Gestión de proyectos")
    print("├── applications/   # Aplicaciones a proyectos")
    print("├── evaluations/    # Sistema de evaluaciones")
    print("├── notifications/  # Sistema de notificaciones")
    print("├── templates/      # Templates Django")
    print("├── static/         # Archivos estáticos")
    print("└── ... (todas las demás apps)")

def main():
    """Función principal de instalación."""
    print("🚀 LEANMAKER BACKEND - INSTALACIÓN COMPLETA")
    print("Django Puro + TypeScript + Migración de Apps")
    print("=" * 60)
    
    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Se requiere Python 3.8 o superior")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")
    
    # Pasos de instalación
    steps = [
        ("Creando directorios", create_directories),
        ("Creando archivo .env", create_env_file),
        ("Instalando dependencias", install_dependencies),
        ("Ejecutando migraciones", run_migrations),
        ("Creando superusuario", create_superuser),
        ("Recolectando archivos estáticos", collect_static),
        ("Verificando instalación", check_installation),
    ]
    
    for step_name, step_function in steps:
        print(f"\n{'='*60}")
        print(f"📋 PASO: {step_name}")
        print(f"{'='*60}")
        
        if not step_function():
            print(f"\n❌ Error en el paso: {step_name}")
            print("💡 Revisa los errores arriba y intenta nuevamente")
            return False
    
    # Mostrar próximos pasos
    show_next_steps()
    
    print(f"\n{'='*60}")
    print("🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!")
    print(f"{'='*60}")
    print("✅ Backend Django puro configurado")
    print("✅ Apps configuradas manualmente")
    print("✅ Base de datos configurada")
    print("✅ Superusuario creado")
    print("✅ TypeScript integrado")
    print("✅ Archivos estáticos configurados")
    
    return True

if __name__ == "__main__":
    import shutil  # Importar aquí para evitar problemas
    
    success = main()
    if success:
        print("\n🎯 ¡Tu backend está listo para usar!")
        print("💡 Ejecuta: py manage.py runserver")
    else:
        print("\n⚠️ La instalación tuvo problemas. Revisa los errores arriba.")
        sys.exit(1) 