#!/bin/bash

echo "========================================"
echo "    LEANMAKER - INICIADOR LOCAL"
echo "========================================"
echo

# Verificar si existe el entorno virtual
if [ -f "venv/bin/activate" ]; then
    echo "Activando entorno virtual..."
    source venv/bin/activate
else
    echo "No se encontró entorno virtual. Continuando sin él..."
fi

# Verificar si existe la configuración local
if [ ! -f "core/settings_local.py" ]; then
    echo "Error: No se encontró core/settings_local.py"
    echo "Ejecuta primero: python setup_local.py"
    exit 1
fi

# Verificar si existe la base de datos
if [ ! -f "db.sqlite3" ]; then
    echo "Creando base de datos..."
    python manage.py makemigrations --settings=core.settings_local
    python manage.py migrate --settings=core.settings_local
fi

echo
echo "Iniciando servidor Django..."
echo "URL: http://localhost:8000"
echo "Admin: http://localhost:8000/admin"
echo
echo "Presiona Ctrl+C para detener el servidor"
echo

python manage.py runserver --settings=core.settings_local 