# 📋 Versiones y Guía de Instalación - LeanMaker Backend

## 🐍 Versión de Python
**Versión exacta utilizada en el proyecto: Python 3.12.0**

### Verificar tu versión de Python:
```bash
python --version
```

**IMPORTANTE**: Este proyecto está configurado específicamente para Python 3.12.0. Si usas otra versión, tendrás problemas de compatibilidad.

## 📦 Versiones Exactas de Librerías

### Core Django
- **Django**: 3.2.23
- **djangorestframework**: 3.14.0
- **django-cors-headers**: 3.14.0
- **django-filter**: 22.1

### Autenticación
- **djangorestframework-simplejwt**: 5.3.0

### Base de Datos SQL Server
- **pyodbc**: >=4.0.39,<5.0.0
- **django-mssql-backend**: 2.8.1

### Utilidades
- **Pillow**: >=9.5.0,<10.0.0
- **django-storages**: 1.14.2
- **python-decouple**: 3.8

### Desarrollo y Testing
- **django-debug-toolbar**: 3.8.1
- **pytest**: 7.4.3
- **pytest-django**: 4.5.2

### Documentación API
- **drf-spectacular**: 0.26.5

### Validación
- **marshmallow**: 3.19.0

### Health Check
- **django-health-check**: 3.17.0

### Nested Routers
- **drf-nested-routers**: 0.93.4

### Django Admin Interface
- **django-admin-interface**: 0.26.0
- **django-colorfield**: 0.11.0

### File Handling
- **python-magic**: 0.4.27

### Date Handling
- **python-dateutil**: 2.8.2

### JSON Handling
- **simplejson**: 3.18.4

### Email Handling
- **django-anymail**: 10.2

### Caching
- **django-redis**: 5.3.0

### Background Tasks
- **celery**: 5.3.4
- **redis**: 4.6.0

### Monitoring
- **django-prometheus**: 2.3.1

### Security
- **django-ratelimit**: 4.1.0

### Logging
- **structlog**: 23.2.0

## 🚀 Guía de Instalación Paso a Paso

### 1. Verificar Python 3.12.0
```bash
python --version
```
**Si no tienes Python 3.12.0, descárgalo de: https://www.python.org/downloads/release/python-3120/**

### 2. Crear entorno virtual
```bash
# Windows
python -m venv venv312

# Activar entorno virtual
venv312\Scripts\activate
```

### 3. Actualizar pip
```bash
python -m pip install --upgrade pip
```

### 4. Instalar dependencias problemáticas primero
```bash
# Instalar pyodbc con versiones precompiladas
pip install --only-binary=:all: pyodbc

# Instalar Pillow con versiones precompiladas
pip install --only-binary=:all: Pillow==9.5.0
```

### 5. Instalar el resto de dependencias
```bash
pip install -r requirements.txt
```

## ⚠️ Problemas Comunes y Soluciones

### Error 1: "Microsoft Visual C++ 14.0 is required"
**Solución:**
1. Descargar e instalar "Microsoft Visual C++ Build Tools"
2. O usar versiones precompiladas:
```bash
pip install --only-binary=:all: pyodbc
pip install --only-binary=:all: Pillow
```

### Error 2: "Unable to find vcvarsall.bat"
**Solución:**
```bash
# Usar versiones precompiladas
pip install --only-binary=:all: [nombre-del-paquete]
```

### Error 3: "ODBC Driver 17 for SQL Server not found"
**Solución:**
1. Descargar "Microsoft ODBC Driver 17 for SQL Server" desde Microsoft
2. O usar SQLite temporalmente cambiando la configuración en `settings.py`

### Error 4: "Version conflict with Django"
**Solución:**
```bash
# Limpiar entorno virtual
deactivate
rmdir /s venv312
python -m venv venv312
venv312\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Error 5: "Pillow installation failed"
**Solución:**
```bash
# Instalar dependencias del sistema primero (Windows)
# Luego instalar Pillow
pip install --only-binary=:all: Pillow==9.5.0
```

## 🔧 Script de Instalación Automática

Usar el archivo `install_dependencies.bat` que ya está en el proyecto:

```bash
# Windows
install_dependencies.bat
```

## 📋 Checklist de Verificación

Antes de ejecutar el proyecto, verifica:

- [ ] Python 3.12.0 instalado
- [ ] Entorno virtual creado y activado
- [ ] pip actualizado
- [ ] pyodbc instalado correctamente
- [ ] Pillow instalado correctamente
- [ ] Todas las dependencias instaladas
- [ ] Microsoft ODBC Driver 17 instalado
- [ ] Visual C++ Build Tools instalado (si es necesario)

## 🐛 Comandos de Diagnóstico

### Verificar instalación de paquetes
```bash
pip list
```

### Verificar versión de Python en el entorno virtual
```bash
python --version
```

### Verificar que pyodbc funciona
```python
import pyodbc
print("pyodbc instalado correctamente")
```

### Verificar que Pillow funciona
```python
from PIL import Image
print("Pillow instalado correctamente")
```

## 📞 Soporte

Si sigues teniendo problemas:

1. Verifica que estás usando **exactamente** Python 3.12.0
2. Usa el script `install_dependencies.bat`
3. Instala las dependencias problemáticas primero (pyodbc, Pillow)
4. Asegúrate de tener Microsoft ODBC Driver 17
5. En caso extremo, usa SQLite temporalmente cambiando la configuración



Esto te permitirá trabajar con el proyecto mientras resuelves los problemas de SQL Server. 