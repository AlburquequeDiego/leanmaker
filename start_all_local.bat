@echo off
echo ========================================
echo    LEANMAKER - INICIADOR COMPLETO
echo ========================================
echo.
echo Este script iniciará tanto el backend como el frontend
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo Configurando backend...
cd Backend

REM Verificar si existe la configuración local
if not exist "core\settings_local.py" (
    echo Configurando backend por primera vez...
    python setup_local.py
    if errorlevel 1 (
        echo Error en la configuración del backend
        pause
        exit /b 1
    )
)

echo.
echo Iniciando backend en segundo plano...
start "LeanMaker Backend" cmd /k "python manage.py runserver --settings=core.settings_local"

REM Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

echo.
echo Configurando frontend...
cd ..\Frontend

REM Verificar si existe node_modules
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install
)

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo Creando archivo de configuración del frontend...
    copy env.local.example .env.local
)

echo.
echo Iniciando frontend...
start "LeanMaker Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    SISTEMA INICIADO EXITOSAMENTE
echo ========================================
echo.
echo URLs disponibles:
echo - Backend: http://localhost:8000
echo - Admin: http://localhost:8000/admin
echo - Frontend: http://localhost:5173
echo.
echo Los servidores se ejecutan en ventanas separadas.
echo Cierra las ventanas para detener los servidores.
echo.
pause 