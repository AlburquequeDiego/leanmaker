

# 1. Navegar al directorio Backend
cd Backend

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar migración automática
python migrate_all_apps.py

# 4. Verificar que todo esté correcto
python verify_migration.py


