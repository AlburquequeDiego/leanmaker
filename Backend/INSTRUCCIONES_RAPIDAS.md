# 🚀 LEANMAKER - INSTRUCCIONES RÁPIDAS DE MIGRACIÓN

```bash
# 1. Navegar al directorio Backend
cd Backend

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar migración automática
python migrate_all_apps.py

# 4. Verificar que todo esté correcto
python verify_migration.py
```

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



