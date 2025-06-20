# LeanMaker Backend 🚀

## Descripción
Backend de la plataforma LeanMaker desarrollado con Django 3.2 y Django REST Framework. Conecta estudiantes de INACAP con empresas a través de proyectos temporales.

---
## ⚠️ IMPORTANTE: Compatibilidad de Python

**Django 3.2 NO es compatible con Python 3.13** debido a que Python 3.13 eliminó el módulo `cgi` que Django 3.2 requiere.

### Solución: Usar Python 3.12

1. **Instalar Python 3.12:**
   - Descarga desde: https://www.python.org/downloads/release/python-3120/
   - Marca la casilla **"Add Python 3.12 to PATH"** durante la instalación

2. **Verificar instalación:**
   ```powershell
   py --list
   ```
   Debe mostrar Python 3.12 en la lista.

---

## 🚀 Inicio Rápido

### 1. Crear entorno virtual
```powershell
cd Backend
py -3.12 -m venv venv312
```

### 2. Activar entorno virtual
```powershell
.\venv312\Scripts\Activate.ps1
```
**Deberías ver:** `(venv312) PS C:\Users\albur\Desktop\leanmaker\Backend>`

### 3. Instalar dependencias
```powershell
pip install -r requirements.txt
```

### 4. Ejecutar migraciones
```powershell
python manage.py migrate
```

### 5. Iniciar servidor
```powershell
python manage.py runserver
```

### 6. Acceder al backend
- **URL:** http://127.0.0.1:8000
- **Admin:** http://127.0.0.1:8000/admin
- **API Docs:** http://127.0.0.1:8000/api/schema/

---

## 🐛 Solución de Problemas

### Error: "No module named 'cgi'"
- **Causa:** Python 3.13 no es compatible con Django 3.2
- **Solución:** Usar Python 3.10, 3.11 o 3.12

### Error: "No module named 'pkg_resources'"
- **Causa:** Falta setuptools
- **Solución:** `pip install setuptools`

### Error: "No module named 'users'"
- **Causa:** Las aplicaciones Django no están creadas
- **Solución:** Comentar temporalmente las apps en `settings.py`

### Error: "Microsoft Visual C++ 14.0 or greater is required"
- **Causa:** psycopg2-binary requiere compilación
- **Solución:** Usar SQLite temporalmente o instalar Build Tools

---

## 📁 Estructura del Proyecto

```
Backend/
├── leanmaker_backend/     # Configuración principal de Django
│   ├── settings.py       # Configuración del proyecto
│   ├── urls.py          # URLs principales
│   └── wsgi.py          # Configuración WSGI
├── users/               # Aplicación de usuarios (por crear)
├── companies/           # Aplicación de empresas (por crear)
├── students/            # Aplicación de estudiantes (por crear)
├── projects/            # Aplicación de proyectos (por crear)
├── applications/        # Aplicación de postulaciones (por crear)
├── evaluations/         # Aplicación de evaluaciones (por crear)
├── notifications/       # Aplicación de notificaciones (por crear)
├── work_hours/          # Aplicación de horas trabajadas (por crear)
├── interviews/          # Aplicación de entrevistas (por crear)
├── calendar_events/     # Aplicación de eventos de calendario (por crear)
├── manage.py           # Script de gestión de Django
├── requirements.txt    # Dependencias de Python
└── README.md          # Este archivo
```

---

## 🔧 Configuración de Base de Datos

### SQLite (Desarrollo)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### SQL Server (Producción)
```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'leanmaker_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

---

## 📋 Próximos Pasos

1. **Crear las aplicaciones Django:**
   ```powershell
   python manage.py startapp users
   python manage.py startapp companies
   python manage.py startapp students
   # ... etc para todas las apps
   ```

2. **Descomentar las apps en settings.py**

3. **Crear modelos y migraciones**

4. **Configurar URLs y vistas**

5. **Conectar con SQL Server**

---

## 🛠️ Comandos Útiles

```powershell
# Crear superusuario
python manage.py createsuperuser

# Crear migraciones
python manage.py makemigrations

# Ejecutar migraciones
python manage.py migrate

# Ejecutar tests
python manage.py test

# Shell de Django
python manage.py shell

# Recolectar archivos estáticos
python manage.py collectstatic

# Verificar configuración
python manage.py check
```

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que estés usando Python 3.12
2. Asegúrate de que el entorno virtual esté activado
3. Revisa que todas las dependencias estén instaladas
4. Consulta la sección de solución de problemas arriba

---

## 🎯 Flujo de Trabajo Simple

### Inicio de Desarrollo:
```powershell
cd Backend
.\venv312\Scripts\Activate.ps1
python manage.py runserver
```

### Durante el Desarrollo:
- El servidor se reinicia automáticamente cuando detecta cambios
- Mantén la terminal abierta
- Desarrolla en otra terminal o IDE

### Fin de Desarrollo:
- Presiona `Ctrl+C` para detener el servidor
- O cierra la terminal

---

## 📊 URLs Disponibles

| URL | Descripción | Estado |
|-----|-------------|--------|
| http://127.0.0.1:8000 | Página principal | ✅ Disponible |
| http://127.0.0.1:8000/admin | Admin Django | ✅ Disponible |
| http://127.0.0.1:8000/api/schema/ | API Schema | ⚠️ Por implementar |

---

## 🔄 Reinicio Completo

Si necesitas empezar desde cero:

```powershell
# 1. Detener servidor (Ctrl+C)
# 2. Eliminar entorno virtual
Remove-Item -Recurse -Force venv312

# 3. Recrear entorno virtual
py -3.12 -m venv venv312

# 4. Activar entorno virtual
.\venv312\Scripts\Activate.ps1

# 5. Instalar dependencias
pip install -r requirements.txt

# 6. Ejecutar migraciones
python manage.py migrate

# 7. Iniciar servidor
python manage.py runserver
```


correo:diego.alburqueque@inacapmail.cl
usuario: admin
contraseña: admintesis