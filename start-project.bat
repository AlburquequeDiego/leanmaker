@echo off
echo ========================================
echo    LEANMAKER - INICIADOR DEL PROYECTO
echo ========================================
echo.

echo [1/4] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo [2/4] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo [3/4] Iniciando Backend Django...
cd Backend
call activate_venv.bat
start "Backend Django" cmd /k "python manage.py runserver"

echo [4/4] Iniciando Frontend React...
cd ..\Frontend
start "Frontend React" cmd /k "npm run dev"

echo.
echo ========================================
echo    PROYECTO INICIADO EXITOSAMENTE
echo ========================================
echo.
echo Backend Django: http://localhost:8000
echo Frontend React: http://localhost:3000
echo Admin Django:   http://localhost:8000/admin/
echo API Docs:       http://localhost:8000/api/v1/docs/
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul 