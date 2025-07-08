@echo off
echo ========================================
echo Instalando dependencias de LeanMaker
echo ========================================

echo.
echo 1. Instalando pyodbc con versiones precompiladas...
pip install --only-binary=:all: pyodbc

echo.
echo 2. Instalando Pillow con versiones precompiladas...
pip install --only-binary=:all: Pillow

echo.
echo 3. Instalando el resto de dependencias...
pip install -r requirements.txt

echo.
echo ========================================
echo Instalacion completada!
echo ========================================
echo.
echo Si tienes errores, asegurate de:
echo 1. Tener Python 3.12 instalado
echo 2. Tener Microsoft ODBC Driver 17 for SQL Server
echo 3. Tener Visual C++ Build Tools (si es necesario)
echo.
pause 