# 📋 Guía de Instalación Completa - LeanMaker

## 🎯 Objetivo
Esta guía te llevará paso a paso para instalar y configurar completamente el sistema LeanMaker en tu entorno local.

## 📋 Prerrequisitos

### Software Requerido
- **Python 3.12** - [Descargar Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Descargar Node.js](https://nodejs.org/)
- **SQL Server** - [Descargar SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git** - [Descargar Git](https://git-scm.com/)

### Verificar Instalaciones
```bash
# Verificar Python
python --version
# Debe mostrar: Python 3.11.x o superior

# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar: 9.x.x o superior

# Verificar Git
git --version
# Debe mostrar: git version 2.x.x
```

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
# Clonar el repositorio
git clone <repository-url>
cd leanmaker

# Verificar estructura
ls
# Debe mostrar: Backend/, Frontend/, README.md, etc.
```

### Paso 2: Configurar Base de Datos SQL Server

#### 2.1 Instalar SQL Server
1. Descargar SQL Server desde Microsoft
2. Instalar con configuración básica
3. Anotar credenciales de administrador

#### 2.2 Crear Base de Datos
```sql
-- Conectar a SQL Server Management Studio
-- Ejecutar los siguientes comandos:

-- Crear base de datos
CREATE DATABASE leanmaker_db;
GO

-- Crear usuario para la aplicación
CREATE LOGIN leanmaker_user WITH PASSWORD = 'TuPassword123!';
GO

-- Asignar usuario a la base de datos
USE leanmaker_db;
CREATE USER leanmaker_user FOR LOGIN leanmaker_user;
GO

-- Dar permisos
EXEC sp_addrolemember 'db_owner', 'leanmaker_user';
GO
```

### Paso 3: Configurar Backend (Django)

#### 3.1 Navegar al directorio Backend
```bash
cd Backend
```

#### 3.2 Crear entorno virtual
```bash
# Windows
python -m venv venv312
venv312\Scripts\activate

# Linux/Mac
python -m venv venv312
source venv312/bin/activate
```

#### 3.3 Instalar dependencias
```bash
pip install -r requirements.txt
```

#### 3.4 Configurar variables de entorno
Crear archivo `.env` en la raíz del Backend:
```env
# Configuración de Django
SECRET_KEY=django-insecure-tu-clave-secreta-muy-larga-y-segura-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Configuración de base de datos
DATABASE_URL=mssql://leanmaker_user:TuPassword123!@localhost:1433/leanmaker_db

# Configuración de CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Configuración de JWT
JWT_SECRET_KEY=tu-jwt-secret-key-muy-segura
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1
```

#### 3.5 Configurar base de datos en settings.py
Editar `leanmaker_backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'sql_server.pyodbc',
        'NAME': 'leanmaker_db',
        'USER': 'leanmaker_user',
        'PASSWORD': 'TuPassword123!',
        'HOST': 'localhost',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

#### 3.6 Ejecutar migraciones
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Verificar que las tablas se crearon
python manage.py dbshell
# En el shell de SQL Server:
# SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
# Debe mostrar todas las tablas de Django
```

#### 3.7 Crear superusuario
```bash
python manage.py createsuperuser
# Seguir las instrucciones para crear el administrador
```

#### 3.8 Probar el backend
```bash
python manage.py runserver
```

Abrir navegador en: http://localhost:8000/admin
- Deberías poder hacer login con el superusuario creado

### Paso 4: Configurar Frontend (React)

#### 4.1 Navegar al directorio Frontend
```bash
cd ../Frontend
```

#### 4.2 Instalar dependencias
```bash
npm install
```

#### 4.3 Configurar variables de entorno
Crear archivo `.env` en la raíz del Frontend:
```env
# Configuración de la API
VITE_API_BASE_URL=http://localhost:8000/api

# Configuración de la aplicación
VITE_APP_NAME=LeanMaker
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
VITE_DEV_MODE=true
```

#### 4.4 Probar el frontend
```bash
npm run dev
```

Abrir navegador en: http://localhost:5173
- Deberías ver la página de login de LeanMaker

### Paso 5: Verificar Integración

#### 5.1 Probar login
1. Ir a http://localhost:5173
2. Hacer clic en "Iniciar Sesión"
3. Usar las credenciales del superusuario creado
4. Deberías acceder al dashboard

#### 5.2 Verificar APIs
1. Ir a http://localhost:8000/api/schema/swagger-ui/
2. Deberías ver la documentación de todas las APIs
3. Probar algunos endpoints

## 🔧 Configuración Avanzada

### Configuración de Logs
```bash
# Crear directorio de logs
mkdir Backend/logs

# Verificar que Django puede escribir logs
python manage.py shell -c "import logging; logging.info('Test log')"
```

### Configuración de Archivos Estáticos
```bash
# Recolectar archivos estáticos
python manage.py collectstatic

# Verificar que se creó el directorio staticfiles
ls Backend/staticfiles/
```

### Configuración de CORS
Si tienes problemas de CORS, verificar en `Backend/leanmaker_backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

## 🧪 Testing del Sistema

### Test del Backend
```bash
cd Backend
python manage.py test
```

### Test del Frontend
```bash
cd Frontend
npm run test
```

### Test de Integración
1. Crear un usuario de prueba
2. Hacer login desde el frontend
3. Navegar por las diferentes secciones
4. Verificar que las APIs responden correctamente

## 🚨 Solución de Problemas Comunes

### Error: "Invalid object name 'users'"
**Causa**: Las migraciones no se ejecutaron
**Solución**:
```bash
cd Backend
python manage.py migrate
```

### Error: "Module not found"
**Causa**: Dependencias no instaladas
**Solución**:
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Error: "Connection refused"
**Causa**: SQL Server no está ejecutándose
**Solución**:
1. Verificar que SQL Server esté iniciado
2. Verificar credenciales de conexión
3. Verificar que el puerto 1433 esté abierto

### Error: "CORS policy"
**Causa**: Configuración de CORS incorrecta
**Solución**:
1. Verificar `CORS_ALLOWED_ORIGINS` en settings.py
2. Reiniciar el servidor Django

### Error: "JWT token invalid"
**Causa**: Configuración de JWT incorrecta
**Solución**:
1. Verificar `JWT_SECRET_KEY` en .env
2. Limpiar localStorage del navegador
3. Hacer logout y login nuevamente

## 📊 Verificación Final

### Checklist de Verificación
- [ ] SQL Server ejecutándose
- [ ] Base de datos `leanmaker_db` creada
- [ ] Usuario de base de datos configurado
- [ ] Backend ejecutándose en puerto 8000
- [ ] Frontend ejecutándose en puerto 5173
- [ ] Superusuario creado
- [ ] Login funcionando
- [ ] APIs respondiendo
- [ ] Documentación accesible

### Comandos de Verificación
```bash
# Verificar backend
curl http://localhost:8000/api/

# Verificar frontend
curl http://localhost:5173/

# Verificar base de datos
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(f'Usuarios: {User.objects.count()}')"
```

## 🎉 ¡Instalación Completada!

Si has seguido todos los pasos correctamente, ahora tienes:

✅ **Backend Django** funcionando en http://localhost:8000  
✅ **Frontend React** funcionando en http://localhost:5173  
✅ **Base de datos SQL Server** configurada  
✅ **Superusuario** creado  
✅ **APIs** funcionando  
✅ **Documentación** accesible  

## 📞 Soporte

Si encuentras algún problema durante la instalación:

1. **Revisar logs**: Verificar archivos de log en `Backend/logs/`
2. **Verificar configuración**: Revisar archivos `.env` y `settings.py`
3. **Consultar documentación**: Revisar README.md de Backend y Frontend
4. **Buscar errores comunes**: Revisar sección de solución de problemas

---

**¡Bienvenido a LeanMaker!** 🚀 