#!/usr/bin/env python3
"""
Script de configuración automática para LeanMaker Backend
Configura todo el entorno necesario para que funcione el backend Django
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path
import urllib.request
import zipfile
import json

class BackendSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.venv_path = self.project_root / "venv312"
        self.python_version = "3.12"
        self.requirements_file = self.project_root / "requirements_simple.txt"
        
    def print_header(self, message):
        print("\n" + "="*60)
        print(f"🚀 {message}")
        print("="*60)
        
    def print_step(self, message):
        print(f"\n📋 {message}")
        
    def print_success(self, message):
        print(f"✅ {message}")
        
    def print_error(self, message):
        print(f"❌ {message}")
        
    def print_warning(self, message):
        print(f"⚠️ {message}")
        
    def check_python_version(self):
        """Verifica que Python 3.12 esté instalado"""
        self.print_step("Verificando versión de Python...")
        
        try:
            version = sys.version_info
            if version.major == 3 and version.minor == 12:
                self.print_success(f"Python {version.major}.{version.minor}.{version.micro} detectado ✅")
                return True
            else:
                self.print_error(f"Se requiere Python 3.12, pero se detectó {version.major}.{version.minor}.{version.micro}")
                self.print_warning("Por favor instala Python 3.12 desde: https://www.python.org/downloads/release/python-3120/")
                return False
        except Exception as e:
            self.print_error(f"Error al verificar Python: {e}")
            return False
    
    def check_pip(self):
        """Verifica que pip esté disponible"""
        self.print_step("Verificando pip...")
        
        try:
            result = subprocess.run([sys.executable, "-m", "pip", "--version"], 
                                  capture_output=True, text=True, check=True)
            self.print_success("pip está disponible ✅")
            return True
        except subprocess.CalledProcessError:
            self.print_error("pip no está disponible")
            return False
    
    def create_venv(self):
        """Crea el entorno virtual si no existe"""
        self.print_step("Configurando entorno virtual...")
        
        if self.venv_path.exists():
            self.print_success("Entorno virtual ya existe ✅")
            return True
        
        try:
            subprocess.run([sys.executable, "-m", "venv", str(self.venv_path)], 
                          check=True, capture_output=True)
            self.print_success("Entorno virtual creado exitosamente ✅")
            return True
        except subprocess.CalledProcessError as e:
            self.print_error(f"Error al crear entorno virtual: {e}")
            return False
    
    def get_venv_python(self):
        """Obtiene la ruta al Python del entorno virtual"""
        if platform.system() == "Windows":
            return self.venv_path / "Scripts" / "python.exe"
        else:
            return self.venv_path / "bin" / "python"
    
    def get_venv_pip(self):
        """Obtiene la ruta al pip del entorno virtual"""
        if platform.system() == "Windows":
            return self.venv_path / "Scripts" / "pip.exe"
        else:
            return self.venv_path / "bin" / "pip"
    
    def upgrade_pip(self):
        """Actualiza pip en el entorno virtual"""
        self.print_step("Actualizando pip...")
        
        try:
            pip_path = self.get_venv_pip()
            subprocess.run([str(pip_path), "install", "--upgrade", "pip"], 
                          check=True, capture_output=True)
            self.print_success("pip actualizado ✅")
            return True
        except subprocess.CalledProcessError as e:
            self.print_error(f"Error al actualizar pip: {e}")
            return False
    
    def install_requirements(self):
        """Instala las dependencias del proyecto"""
        self.print_step("Instalando dependencias...")
        
        if not self.requirements_file.exists():
            self.print_error(f"Archivo {self.requirements_file.name} no encontrado")
            return False
        
        try:
            pip_path = self.get_venv_pip()
            # Instalar dependencias una por una para mejor manejo de errores
            with open(self.requirements_file, 'r') as f:
                requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            
            for req in requirements:
                self.print_step(f"Instalando {req}...")
                try:
                    subprocess.run([str(pip_path), "install", req], 
                                  check=True, capture_output=True)
                    self.print_success(f"{req} instalado ✅")
                except subprocess.CalledProcessError as e:
                    self.print_warning(f"Error al instalar {req}, intentando continuar...")
                    # Continuar con las siguientes dependencias
            
            self.print_success("Instalación de dependencias completada ✅")
            return True
        except Exception as e:
            self.print_error(f"Error al instalar dependencias: {e}")
            return False
    
    def check_django(self):
        """Verifica que Django esté instalado correctamente"""
        self.print_step("Verificando instalación de Django...")
        
        try:
            python_path = self.get_venv_python()
            result = subprocess.run([str(python_path), "-c", "import django; print(django.get_version())"], 
                                  capture_output=True, text=True, check=True)
            version = result.stdout.strip()
            self.print_success(f"Django {version} instalado correctamente ✅")
            return True
        except subprocess.CalledProcessError:
            self.print_error("Django no está instalado correctamente")
            return False
    
    def run_django_check(self):
        """Ejecuta el comando check de Django"""
        self.print_step("Verificando configuración de Django...")
        
        try:
            python_path = self.get_venv_python()
            result = subprocess.run([str(python_path), "manage.py", "check"], 
                                  cwd=self.project_root, capture_output=True, text=True, check=True)
            self.print_success("Configuración de Django verificada ✅")
            return True
        except subprocess.CalledProcessError as e:
            self.print_error(f"Error en configuración de Django: {e.stderr}")
            return False
    
    def run_migrations(self):
        """Ejecuta las migraciones de Django"""
        self.print_step("Ejecutando migraciones...")
        
        try:
            python_path = self.get_venv_python()
            subprocess.run([str(python_path), "manage.py", "migrate"], 
                          cwd=self.project_root, capture_output=True, check=True)
            self.print_success("Migraciones ejecutadas exitosamente ✅")
            return True
        except subprocess.CalledProcessError as e:
            self.print_error(f"Error al ejecutar migraciones: {e}")
            return False
    
    def create_superuser_script(self):
        """Crea un script para crear superusuario"""
        self.print_step("Creando script para superusuario...")
        
        script_content = '''#!/usr/bin/env python3
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
        print("\\n❌ Operación cancelada por el usuario")

if __name__ == "__main__":
    create_superuser()
'''
        
        script_path = self.project_root / "create_superuser.py"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        self.print_success("Script de superusuario creado ✅")
        return True
    
    def create_start_script(self):
        """Crea un script para iniciar el servidor"""
        self.print_step("Creando script de inicio...")
        
        script_content = '''#!/usr/bin/env python3
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
    print("\\nPresiona Ctrl+C para detener el servidor\\n")
    
    try:
        subprocess.run([str(venv_python), "manage.py", "runserver"], 
                      cwd=project_root, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar servidor: {e}")
    except KeyboardInterrupt:
        print("\\n🛑 Servidor detenido")

if __name__ == "__main__":
    start_server()
'''
        
        script_path = self.project_root / "start_server.py"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        self.print_success("Script de inicio creado ✅")
        return True
    
    def create_batch_files(self):
        """Crea archivos .bat para Windows"""
        self.print_step("Creando archivos .bat para Windows...")
        
        # Script para activar entorno virtual
        activate_content = '''@echo off
echo 🚀 Activando entorno virtual de LeanMaker Backend...
call venv312\\Scripts\\activate.bat
echo ✅ Entorno virtual activado!
echo.
echo Comandos disponibles:
echo   python manage.py runserver    - Iniciar servidor
echo   python manage.py createsuperuser - Crear superusuario
echo   python manage.py check        - Verificar configuración
echo.
cmd /k
'''
        
        activate_path = self.project_root / "activate_venv.bat"
        with open(activate_path, 'w', encoding='utf-8') as f:
            f.write(activate_content)
        
        # Script para iniciar servidor
        start_content = '''@echo off
echo 🚀 Iniciando servidor LeanMaker Backend...
call venv312\\Scripts\\activate.bat
python manage.py runserver
pause
'''
        
        start_path = self.project_root / "start_server.bat"
        with open(start_path, 'w', encoding='utf-8') as f:
            f.write(start_content)
        
        self.print_success("Archivos .bat creados ✅")
        return True
    
    def show_final_instructions(self):
        """Muestra las instrucciones finales"""
        self.print_header("¡CONFIGURACIÓN COMPLETADA!")
        
        print("""
🎉 ¡El backend está listo para usar!

📋 COMANDOS PARA USAR:

1. ACTIVAR ENTORNO VIRTUAL:
   - Opción 1: Doble clic en 'activate_venv.bat'
   - Opción 2: En PowerShell: .\\venv312\\Scripts\\Activate.ps1

2. INICIAR SERVIDOR:
   - Opción 1: Doble clic en 'start_server.bat'
   - Opción 2: python manage.py runserver
   - Opción 3: python start_server.py

3. CREAR SUPERUSUARIO (opcional):
   - python manage.py createsuperuser
   - O: python create_superuser.py

🌐 URLs DISPONIBLES:
   • Página principal: http://127.0.0.1:8000
   • Admin Django: http://127.0.0.1:8000/admin
   • API Docs: http://127.0.0.1:8000/api/schema/swagger-ui/
   • Health Check: http://127.0.0.1:8000/api/health/

📁 ARCHIVOS CREADOS:
   • activate_venv.bat - Activar entorno virtual
   • start_server.bat - Iniciar servidor
   • start_server.py - Script Python para iniciar servidor
   • create_superuser.py - Script para crear superusuario

⚠️ IMPORTANTE:
   • Mantén la terminal abierta mientras uses el servidor
   • Presiona Ctrl+C para detener el servidor
   • El servidor se reinicia automáticamente con cambios

¡Disfruta desarrollando! 🚀
""")
    
    def run_setup(self):
        """Ejecuta todo el proceso de configuración"""
        self.print_header("CONFIGURACIÓN AUTOMÁTICA DE LEANMAKER BACKEND")
        
        # Verificaciones iniciales
        if not self.check_python_version():
            return False
        
        if not self.check_pip():
            return False
        
        # Configuración del entorno
        if not self.create_venv():
            return False
        
        if not self.upgrade_pip():
            return False
        
        if not self.install_requirements():
            return False
        
        if not self.check_django():
            return False
        
        if not self.run_django_check():
            return False
        
        if not self.run_migrations():
            return False
        
        # Crear scripts útiles
        self.create_superuser_script()
        self.create_start_script()
        self.create_batch_files()
        
        # Mostrar instrucciones finales
        self.show_final_instructions()
        
        return True

def main():
    """Función principal"""
    setup = BackendSetup()
    
    try:
        success = setup.run_setup()
        if success:
            print("\n🎉 ¡Configuración completada exitosamente!")
            return 0
        else:
            print("\n❌ La configuración falló. Revisa los errores arriba.")
            return 1
    except KeyboardInterrupt:
        print("\n\n❌ Configuración cancelada por el usuario")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 