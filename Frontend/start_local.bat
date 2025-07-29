@echo off
echo ========================================
echo    LEANMAKER FRONTEND - INICIADOR
echo ========================================
echo.

REM Verificar si existe node_modules
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo Creando archivo de configuración local...
    copy env.local.example .env.local
    echo Archivo .env.local creado. Revisa la configuración si es necesario.
)

echo.
echo Iniciando servidor de desarrollo...
echo URL: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev

pause 