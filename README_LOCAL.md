# 🚀 LeanMaker - Configuración Local Completa

Este documento te guiará para configurar **LeanMaker** completamente en tu entorno local para desarrollo y pruebas.

## 📋 Requisitos Previos

- **Python 3.8+** (recomendado 3.12)
- **Node.js 16+** (para el frontend)
- **Git**

## ⚡ Configuración Rápida (Recomendada)

### Opción 1: Script Automático (Windows)

```bash
# Ejecutar el script que configura todo automáticamente
start_all_local.bat
```

### Opción 2: Configuración Manual

#### Paso 1: Configurar Backend

```bash
# Navegar al directorio del backend
cd Backend

# Ejecutar configuración automática
python setup_local.py

# O configurar manualmente:
pip install -r requirements_local.txt
python manage.py makemigrations --settings=core.settings_local
python manage.py migrate --settings=core.settings_local
python manage.py createsuperuser --settings=core.settings_local
```

#### Paso 2: Configurar Frontend

```bash
# Navegar al directorio del frontend
cd Frontend

# Instalar dependencias
npm install

# Crear archivo de configuración
copy env.local.example .env.local
```

#### Paso 3: Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd Backend
python manage.py runserver --settings=core.settings_local
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

## 🎯 URLs del Sistema

Una vez configurado, podrás acceder a:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin

## 🗄️ Base de Datos

### SQLite (Configuración por defecto)

- **Ventajas:** No requiere instalación adicional, perfecta para desarrollo
- **Archivo:** `Backend/db.sqlite3` (se crea automáticamente)
- **Configuración:** Ya incluida en `core/settings_local.py`

### PostgreSQL (Opcional)

Si prefieres usar PostgreSQL:

1. **Instalar PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`

2. **Crear base de datos:**
   ```sql
   CREATE DATABASE leanmaker_local;
   CREATE USER leanmaker_user WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE leanmaker_local TO leanmaker_user;
   ```

3. **Modificar configuración:**
   Editar `Backend/core/settings_local.py`:
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

4. **Instalar dependencia:**
   ```bash
   pip install psycopg2-binary
   ```

## 🔧 Comandos Útiles

### Backend

```bash
# Ejecutar servidor
python manage.py runserver --settings=core.settings_local

# Crear migraciones
python manage.py makemigrations --settings=core.settings_local

# Aplicar migraciones
python manage.py migrate --settings=core.settings_local

# Crear superusuario
python manage.py createsuperuser --settings=core.settings_local

# Shell de Django
python manage.py shell --settings=core.settings_local

# Ejecutar tests
python manage.py test --settings=core.settings_local
```

### Frontend

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

## 📁 Estructura de Archivos

```
leanmaker/
├── Backend/
│   ├── core/
│   │   ├── settings.py          # Configuración original (SQL Server)
│   │   └── settings_local.py    # Configuración local (SQLite)
│   ├── requirements.txt         # Dependencias completas
│   ├── requirements_local.txt   # Dependencias para desarrollo
│   ├── setup_local.py          # Script de configuración automática
│   ├── start_local.bat         # Iniciador Windows
│   ├── start_local.sh          # Iniciador Linux/Mac
│   ├── db.sqlite3              # Base de datos SQLite
│   └── .env                    # Variables de entorno
├── Frontend/
│   ├── env.local.example       # Configuración de ejemplo
│   ├── .env.local              # Configuración local
│   └── start_local.bat         # Iniciador Windows
├── start_all_local.bat         # Iniciador completo Windows
└── README_LOCAL.md             # Este archivo
```

## 🐛 Solución de Problemas

### Error: "No module named 'django'"
```bash
cd Backend
pip install -r requirements_local.txt
```

### Error: "Database is locked"
- Cerrar el servidor Django
- Esperar unos segundos
- Reiniciar el servidor

### Error: "Port already in use"
```bash
# Cambiar puerto del backend
python manage.py runserver 8001 --settings=core.settings_local

# Cambiar puerto del frontend
npm run dev -- --port 5174
```

### Error: "CORS error"
- Verificar que el backend esté ejecutándose en http://localhost:8000
- Verificar que `CORS_ALLOWED_ORIGINS` incluya http://localhost:5173
- Reiniciar el servidor Django

### Error: "Module not found" en frontend
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Python no está en PATH"
- Instalar Python desde https://python.org
- Marcar "Add Python to PATH" durante la instalación
- Reiniciar la terminal

### Error: "Node.js no está en PATH"
- Instalar Node.js desde https://nodejs.org
- Reiniciar la terminal

## 🔍 Verificar Instalación

### 1. Backend
```bash
cd Backend
python manage.py check --settings=core.settings_local
```
Debería mostrar: "System check identified no issues"

### 2. Frontend
```bash
cd Frontend
npm run build
```
Debería completarse sin errores

### 3. Base de datos
```bash
cd Backend
python manage.py dbshell --settings=core.settings_local
```
Debería abrir el shell de SQLite

## 📞 Soporte

Si tienes problemas:

1. **Verifica requisitos:** Python 3.8+, Node.js 16+
2. **Revisa logs:** `Backend/logs/django.log`
3. **Usa configuración local:** `--settings=core.settings_local`
4. **Reinstala dependencias:** `pip install -r requirements_local.txt` y `npm install`

## 🎉 ¡Listo!

Con esta configuración podrás:

- ✅ Desarrollar y probar LeanMaker completamente en local
- ✅ Usar SQLite para desarrollo rápido
- ✅ Acceder al admin de Django
- ✅ Probar la API completa
- ✅ Desarrollar el frontend con hot reload

¡Disfruta desarrollando LeanMaker! 🚀 