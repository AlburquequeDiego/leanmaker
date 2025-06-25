# LeanMaker Backend 🚀

## Descripción
Backend de la plataforma LeanMaker desarrollado con Django 3.2 y Django REST Framework. Conecta estudiantes de INACAP con empresas a través de proyectos temporales.

**Estado actual:** ✅ **FUNCIONANDO** - Servidor corriendo con SQLite local

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

## 🚀 Inicio Rápido (PASO A PASO)

### 1. Abrir PowerShell y navegar al proyecto
```powershell
cd C:\Users\albur\Desktop\leanmaker\Backend
```

### 2. Activar entorno virtual (YA CREADO)
```powershell
.\venv312\Scripts\Activate.ps1
```
**Deberías ver:** `(venv312) PS C:\Users\albur\Desktop\leanmaker\Backend>`

### 3. Verificar que todo esté bien
```powershell
python manage.py check
```
**Deberías ver:** `System check identified no issues (0 silenced).`

### 4. Iniciar servidor
```powershell
python manage.py runserver
```

### 5. ¡Listo! El backend está funcionando
- **URL Principal:** http://127.0.0.1:8000
- **Admin Django:** http://127.0.0.1:8000/admin
- **Documentación API:** http://127.0.0.1:8000/api/schema/swagger-ui/
- **Health Check:** http://127.0.0.1:8000/api/health/

---

## 📊 Estado Actual del Proyecto

### ✅ Lo que YA está funcionando:
- **Servidor Django** corriendo en puerto 8000
- **Base de datos SQLite** local (sin conexiones externas)
- **Todas las aplicaciones** creadas y configuradas
- **API REST** con autenticación JWT
- **Documentación automática** con Swagger
- **CORS configurado** para frontend React/Vite
- **Sistema de logs** activo

### 📁 Aplicaciones Django creadas:
- ✅ `users` - Gestión de usuarios
- ✅ `companies` - Gestión de empresas  
- ✅ `students` - Gestión de estudiantes
- ✅ `projects` - Gestión de proyectos
- ✅ `applications` - Postulaciones a proyectos
- ✅ `evaluations` - Evaluaciones
- ✅ `notifications` - Sistema de notificaciones
- ✅ `work_hours` - Control de horas trabajadas
- ✅ `interviews` - Gestión de entrevistas
- ✅ `calendar_events` - Eventos de calendario
- ✅ `platform_settings` - Configuración de plataforma
- ✅ `strikes` - Sistema de strikes
- ✅ `questionnaires` - Cuestionarios

---

## 🔧 Configuración Actual

### Base de Datos (SQLite Local)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Características activas:
- **DEBUG = True** (modo desarrollo)
- **Idioma:** Español Chile (es-cl)
- **Zona horaria:** America/Santiago
- **Autenticación:** JWT (JSON Web Tokens)
- **CORS:** Habilitado para localhost:3000 y 5173
- **Documentación:** Swagger UI automática

---

## 🧪 Cómo Probar el Backend

### 1. Verificar que el servidor esté corriendo
```powershell
# En PowerShell, deberías ver:
(venv312) PS C:\Users\albur\Desktop\leanmaker\Backend>
```

### 2. Abrir navegador y probar URLs:

#### ✅ Página principal
- **URL:** http://127.0.0.1:8000
- **Resultado esperado:** Página de Django funcionando

#### ✅ Documentación de la API
- **URL:** http://127.0.0.1:8000/api/schema/swagger-ui/
- **Resultado esperado:** Interfaz Swagger con todos los endpoints

#### ✅ Health Check
- **URL:** http://127.0.0.1:8000/api/health/
- **Resultado esperado:** JSON con estado del servidor

#### ✅ Admin Django
- **URL:** http://127.0.0.1:8000/admin
- **Resultado esperado:** Página de login del admin

### 3. Crear superusuario (opcional)
```powershell
python manage.py createsuperuser
```
Luego podrás acceder al admin con esas credenciales.

---

## 📋 Endpoints de la API Disponibles

### Autenticación
- `POST /api/token/` - Obtener token JWT
- `POST /api/token/refresh/` - Renovar token JWT

### Usuarios
- `GET /api/users/` - Listar usuarios
- `POST /api/users/` - Crear usuario

### Empresas
- `GET /api/companies/` - Listar empresas
- `POST /api/companies/` - Crear empresa

### Estudiantes
- `GET /api/students/` - Listar estudiantes
- `POST /api/students/` - Crear estudiante

### Proyectos
- `GET /api/projects/` - Listar proyectos
- `POST /api/projects/` - Crear proyecto

### Y muchos más...
Ver todos los endpoints en: http://127.0.0.1:8000/api/schema/swagger-ui/

---

## 🐛 Solución de Problemas

### Error: "No module named 'cgi'"
- **Causa:** Python 3.13 no es compatible con Django 3.2
- **Solución:** Usar Python 3.12

### Error: "No se encontró Python"
- **Causa:** Python no está en PATH
- **Solución:** Instalar Python 3.12 y marcar "Add to PATH"

### Error: "No module named 'users'"
- **Causa:** Las aplicaciones Django no están creadas
- **Solución:** Ya están creadas, verificar que el entorno virtual esté activado

### Error de conexión a base de datos
- **Causa:** Intentando conectar a SQL Server externo
- **Solución:** Ya está configurado para usar SQLite local

### El servidor no inicia
- **Solución:** Verificar que estés en el directorio correcto y el entorno virtual esté activado

---

## 🛠️ Comandos Útiles

```powershell
# Verificar estado del proyecto
python manage.py check

# Crear superusuario
python manage.py createsuperuser

# Ver migraciones pendientes
python manage.py showmigrations

# Ejecutar migraciones
python manage.py migrate

# Crear nuevas migraciones
python manage.py makemigrations

# Shell de Django
python manage.py shell

# Ejecutar tests
python manage.py test

# Recolectar archivos estáticos
python manage.py collectstatic
```

---

## 📞 Soporte para Compañeros

### Si algo no funciona:

1. **Verificar Python 3.12:**
   ```powershell
   py --list
   ```

2. **Verificar entorno virtual:**
   ```powershell
   # Deberías ver (venv312) al inicio
   (venv312) PS C:\Users\albur\Desktop\leanmaker\Backend>
   ```

3. **Verificar que estés en el directorio correcto:**
   ```powershell
   pwd
   # Debería mostrar: C:\Users\albur\Desktop\leanmaker\Backend
   ```

4. **Reiniciar desde cero:**
   ```powershell
   # Detener servidor (Ctrl+C)
   # Luego:
   .\venv312\Scripts\Activate.ps1
   python manage.py runserver
   ```

---

## 🎯 Flujo de Trabajo para Pruebas

### Inicio de Sesión de Pruebas:
```powershell
cd C:\Users\albur\Desktop\leanmaker\Backend
.\venv312\Scripts\Activate.ps1
python manage.py runserver
```

### Durante las Pruebas:
- Mantén la terminal abierta
- El servidor se reinicia automáticamente con cambios
- Usa otra terminal para comandos adicionales

### URLs para Probar:
1. http://127.0.0.1:8000 (página principal)
2. http://127.0.0.1:8000/api/schema/swagger-ui/ (documentación API)
3. http://127.0.0.1:8000/api/health/ (health check)
4. http://127.0.0.1:8000/admin (admin Django)

### Fin de Pruebas:
- Presiona `Ctrl+C` para detener el servidor
- O cierra la terminal

---

## 📊 URLs Disponibles

| URL | Descripción | Estado |
|-----|-------------|--------|
| http://127.0.0.1:8000 | Página principal | ✅ Funcionando |
| http://127.0.0.1:8000/admin | Admin Django | ✅ Funcionando |
| http://127.0.0.1:8000/api/schema/swagger-ui/ | API Docs | ✅ Funcionando |
| http://127.0.0.1:8000/api/health/ | Health Check | ✅ Funcionando |
| http://127.0.0.1:8000/api/token/ | Login JWT | ✅ Funcionando |

---

## 🔄 Reinicio Completo (Si algo se rompe)

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

---

## 🎉 ¡Listo para Probar!

El backend está **100% funcional** y listo para que tus compañeros lo prueben. Solo necesitan seguir los pasos del "Inicio Rápido" y tendrán acceso a toda la API.

**Comandos finales para recordar:**
```powershell
cd Backend
venv312\Scripts\Activate
python manage.py runserver
```

**URLs principales:**
- **API Docs:** http://127.0.0.1:8000/api/schema/swagger-ui/
- **Health Check:** http://127.0.0.1:8000/api/health/
- **Admin:** http://127.0.0.1:8000/admin