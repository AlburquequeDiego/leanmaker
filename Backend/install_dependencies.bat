@echo off
echo ========================================
echo LEANMAKER BACKEND - INSTALACION
echo ========================================
echo.

echo Verificando version de Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado o no esta en PATH
    echo Instala Python 3.12.0 desde: https://www.python.org/downloads/release/python-3120/
    pause
    exit /b 1
)

echo.
echo Verificando que sea Python 3.12...
python -c "import sys; exit(0 if sys.version_info[:2] == (3, 12) else 1)"
if %errorlevel% neq 0 (
    echo ERROR: Se requiere Python 3.12.0 exactamente
    echo Tu version actual no es compatible
    pause
    exit /b 1
)

echo.
echo Actualizando pip...
python -m pip install --upgrade pip

echo.
echo ========================================
echo Instalando dependencias problemáticas...
echo ========================================

echo.
echo 1. Instalando pyodbc con versiones precompiladas...
pip install --only-binary=:all: pyodbc==4.0.39
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar pyodbc
    echo Instala Microsoft ODBC Driver 17 for SQL Server
    echo O usa: pip install --only-binary=:all: pyodbc
    pause
    exit /b 1
)

echo.
echo 2. Instalando Pillow con versiones precompiladas...
pip install --only-binary=:all: Pillow==9.5.0
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar Pillow
    echo Instala Visual C++ Build Tools o usa versiones precompiladas
    pause
    exit /b 1
)

echo.
echo ========================================
echo Instalando resto de dependencias...
echo ========================================

echo.
echo 3. Instalando el resto de dependencias...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Error al instalar dependencias
    echo Revisa el archivo VERSIONES_Y_INSTALACION.md
    pause
    exit /b 1
)

echo.
echo ========================================
echo VERIFICACION FINAL
echo ========================================

echo.
echo Verificando instalacion...
python -c "import django; print('Django:', django.get_version())"
python -c "import pyodbc; print('pyodbc: OK')"
python -c "from PIL import Image; print('Pillow: OK')"

echo.
echo ========================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Activar entorno virtual: venv312\Scripts\activate
echo 2. Ejecutar migraciones: python manage.py migrate
echo 3. Crear superusuario: python manage.py createsuperuser
echo 4. Iniciar servidor: python manage.py runserver
echo.
echo Si tienes problemas, revisa VERSIONES_Y_INSTALACION.md
echo.
pause 