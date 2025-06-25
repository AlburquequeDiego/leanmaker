@echo off
echo 🚀 Activando entorno virtual de LeanMaker Backend...
call venv312\Scripts\activate.bat
echo ✅ Entorno virtual activado!
echo.
echo Comandos disponibles:
echo   python manage.py runserver    - Iniciar servidor
echo   python manage.py createsuperuser - Crear superusuario
echo   python manage.py check        - Verificar configuración
echo.
cmd /k
