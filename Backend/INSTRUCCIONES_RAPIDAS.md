# 🚀 LEANMAKER - INSTRUCCIONES RÁPIDAS DE MIGRACIÓN

cd Frontend
npm install --legacy-peer-deps
npm run dev

cd Backend
pip install -r requirements.txt
python manage.py runserver


opciones avanzadas
# Ver estructura de la BD
python manage.py inspectdb

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Entrar al shell
python manage.py shell


timezone.now