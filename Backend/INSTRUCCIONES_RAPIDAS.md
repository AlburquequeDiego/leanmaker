# 🚀 LEANMAKER - INSTRUCCIONES RÁPIDAS DE MIGRACIÓN

## ⚡ Migración Automática (RECOMENDADO)

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


--
para ver la estructura de la base de datos :

📁 Para administrar tus tablas:
Django Admin: Accede a http://localhost:8000/admin/ para ver todas las tablas

Migraciones: Usa python manage.py makemigrations y python manage.py migrate

Shell: python manage.py shell para interactuar con los modelos

Inspect: python manage.py inspectdb para ver la estructura actual


## 🔑 Credenciales por Defecto

- **Email**: admin@leanmaker.com
- **Password**: admin123

## ✅ Verificación Rápida

Si todo salió bien, deberías ver:

```
🎉 ¡TODAS LAS VERIFICACIONES PASARON!
✅ La migración fue exitosa
🚀 El sistema está listo para usar
```

## 🚨 Si hay problemas

```bash
# Limpiar migraciones y empezar de nuevo
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Regenerar y aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# Verificar
python verify_migration.py
```



