@echo off
echo ========================================
echo    LEANMAKER - INICIADOR LOCAL
echo ========================================
echo.

REM Verificar si existe el entorno virtual
if exist "venv\Scripts\activate.bat" (
    echo Activando entorno virtual...
    call venv\Scripts\activate.bat
) else (
    echo No se encontró entorno virtual. Continuando sin él...
)

REM Verificar si existe la configuración local
if not exist "core\settings_local.py" (
    echo Error: No se encontró core\settings_local.py
    echo Ejecuta primero: python setup_local.py
    pause
    exit /b 1
)

REM Verificar si existe la base de datos
if not exist "db.sqlite3" (
    echo Creando base de datos...
    python manage.py makemigrations --settings=core.settings_local
    python manage.py migrate --settings=core.settings_local
)

echo.
echo Iniciando servidor Django...
echo URL: http://localhost:8000
echo Admin: http://localhost:8000/admin
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python manage.py runserver --settings=core.settings_local

pause 