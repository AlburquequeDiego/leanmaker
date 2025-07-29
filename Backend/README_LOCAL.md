# 🚀 LeanMaker - Configuración Local

Este documento te guiará para configurar LeanMaker en tu entorno local para desarrollo y pruebas.

## 📋 Requisitos Previos

- **Python 3.8+** (recomendado 3.12)
- **Node.js 16+** (para el frontend)
- **Git**

## 🎯 Opciones de Configuración

### Opción 1: SQLite (Recomendada para desarrollo)

**Ventajas:**
- ✅ Configuración rápida y sencilla
- ✅ No requiere servidor de base de datos
- ✅ Perfecta para desarrollo y pruebas
- ✅ Base de datos en un solo archivo

**Desventajas:**
- ❌ No es recomendable para producción
- ❌ Limitaciones en concurrencia

### Opción 2: PostgreSQL Local

**Ventajas:**
- ✅ Más robusto que SQLite
- ✅ Mejor para desarrollo avanzado
- ✅ Similar a producción

**Desventajas:**
- ❌ Requiere instalar PostgreSQL
- ❌ Configuración más compleja

## 🛠️ Configuración Rápida con SQLite

### Paso 1: Clonar y configurar el proyecto

```bash
# Navegar al directorio del backend
cd Backend

# Activar entorno virtual (si usas uno)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Ejecutar el script de configuración automática
python setup_local.py
```

### Paso 2: Verificar la instalación

```bash
# Verificar que Django funciona
python manage.py check --settings=core.settings_local

# Ejecutar el servidor
python manage.py runserver --settings=core.settings_local
```

### Paso 3: Acceder al sistema

1. **Admin Django:** http://localhost:8000/admin
2. **API:** http://localhost:8000/api/
3. **Frontend:** http://localhost:5173

## 🔧 Configuración Manual

Si prefieres configurar manualmente:

### 1. Instalar dependencias

```bash
pip install -r requirements_local.txt
```

### 2. Configurar variables de entorno

Crear archivo `.env` en el directorio `Backend/`:

```env
# Configuración local para LeanMaker
SECRET_KEY=django-insecure-local-development-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos SQLite (automática)
DATABASE_URL=sqlite:///db.sqlite3

# Configuración de CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Configuración de JWT
JWT_SECRET_KEY=local-jwt-secret-key-change-in-production

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=logs/django.log
```

### 3. Ejecutar migraciones

```bash
# Usar configuración local
export DJANGO_SETTINGS_MODULE=core.settings_local

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recopilar archivos estáticos
python manage.py collectstatic --noinput
```

### 4. Ejecutar el servidor

```bash
python manage.py runserver --settings=core.settings_local
```

## 🗄️ Configuración con PostgreSQL (Opcional)

Si prefieres usar PostgreSQL:

### 1. Instalar PostgreSQL

**Windows:**
- Descargar desde: https://www.postgresql.org/download/windows/
- Usar el instalador oficial

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

### 2. Crear base de datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE leanmaker_local;
CREATE USER leanmaker_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE leanmaker_local TO leanmaker_user;
\q
```

### 3. Configurar Django

Modificar `core/settings_local.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'leanmaker_local',
        'USER': 'leanmaker_user',
        'PASSWORD': 'tu_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 4. Instalar dependencias adicionales

```bash
pip install psycopg2-binary
```

## 🎨 Configurar el Frontend

### 1. Instalar dependencias

```bash
cd Frontend
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env` en el directorio `Frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=LeanMaker
```

### 3. Ejecutar el frontend

```bash
npm run dev
```

## 🔍 Verificar que todo funciona

### 1. Backend
- ✅ http://localhost:8000/admin (debe mostrar login)
- ✅ http://localhost:8000/api/ (debe mostrar endpoints)

### 2. Frontend
- ✅ http://localhost:5173 (debe mostrar la aplicación)

### 3. Base de datos
- ✅ Verificar que `db.sqlite3` se creó en `Backend/`
- ✅ Verificar que las tablas se crearon correctamente

## 🐛 Solución de Problemas

### Error: "No module named 'django'"
```bash
pip install -r requirements_local.txt
```

### Error: "Database is locked"
- Cerrar el servidor Django
- Esperar unos segundos
- Reiniciar el servidor

### Error: "Port already in use"
```bash
# Cambiar puerto
python manage.py runserver 8001 --settings=core.settings_local
```

### Error: "CORS error"
- Verificar que `CORS_ALLOWED_ORIGINS` incluya tu URL del frontend
- Reiniciar el servidor Django

### Error: "Module not found"
```bash
# Verificar que estás en el directorio correcto
cd Backend
# Reinstalar dependencias
pip install -r requirements_local.txt
```

## 📁 Estructura de Archivos Importantes

```
Backend/
├── core/
│   ├── settings.py          # Configuración original (SQL Server)
│   └── settings_local.py    # Configuración local (SQLite)
├── requirements.txt         # Dependencias completas
├── requirements_local.txt   # Dependencias para desarrollo
├── setup_local.py          # Script de configuración automática
├── db.sqlite3              # Base de datos SQLite (se crea automáticamente)
└── .env                    # Variables de entorno (se crea automáticamente)
```

## 🚀 Comandos Útiles

```bash
# Ejecutar servidor con configuración local
python manage.py runserver --settings=core.settings_local

# Ejecutar tests
python manage.py test --settings=core.settings_local

# Crear migraciones
python manage.py makemigrations --settings=core.settings_local

# Aplicar migraciones
python manage.py migrate --settings=core.settings_local

# Shell de Django
python manage.py shell --settings=core.settings_local

# Crear superusuario
python manage.py createsuperuser --settings=core.settings_local
```

## 📞 Soporte

Si tienes problemas:

1. Verifica que sigues todos los pasos
2. Revisa los logs en `Backend/logs/django.log`
3. Asegúrate de usar la configuración local (`--settings=core.settings_local`)
4. Verifica que Python y las dependencias están instaladas correctamente

¡Con esta configuración podrás desarrollar y probar LeanMaker completamente en tu entorno local! 🎉 