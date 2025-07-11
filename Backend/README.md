# 🚀 LeanMaker Backend - Django Puro + TypeScript

## 📋 Descripción

Backend completamente reescrito para la plataforma LeanMaker con **Django 4.2+ puro** y **integración TypeScript**, sin APIs REST complejas.

## 🎯 Características

- ✅ **Django 4.2+ Puro** - Sin DRF, sin APIs REST complejas
- ✅ **TypeScript Integration** - Integración directa con frontend TypeScript
- ✅ **Autenticación por Sesiones** - Sistema tradicional de Django
- ✅ **SQL Server** - Base de datos empresarial
- ✅ **Templates Django** - Renderizado del lado del servidor
- ✅ **Formularios Django** - Validación y procesamiento nativo
- ✅ **Archivos Estáticos** - WhiteNoise para producción
- ✅ **CORS Configurado** - Compatible con frontend React
- ✅ **Arquitectura Simple** - Fácil de mantener y extender

## 🏗️ Arquitectura

```
Backend-NEW/
├── core/                 # Configuración principal
│   ├── settings.py      # Configuración Django
│   ├── urls.py          # URLs principales
│   └── views.py         # Vistas core
├── users/               # App de usuarios
│   ├── models.py        # Modelo User personalizado
│   ├── forms.py         # Formularios Django
│   ├── views.py         # Vistas Django
│   └── urls.py          # URLs de usuarios
├── templates/           # Templates Django
│   ├── base.html        # Template base
│   └── home.html        # Página de inicio
├── static/              # Archivos estáticos
│   └── js/
│       └── typescript-integration.ts
├── requirements.txt     # Dependencias Python
├── manage.py           # Comando Django
└── setup.py            # Script de configuración
```

## 🚀 Instalación Rápida

### 1. Prerrequisitos
- Python 3.11+
- SQL Server (Azure o local)
- Git

### 2. Clonar y configurar
```bash
# Navegar al directorio
cd Backend-NEW

# Ejecutar script de configuración
python setup.py
```

### 3. Configuración manual (alternativa)
```bash
# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones

# Migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

## 🌐 Endpoints Principales

### Páginas Web
- `/` - Página de inicio
- `/login/` - Página de login
- `/register/` - Página de registro
- `/dashboard/` - Dashboard principal
- `/users/profile/` - Perfil de usuario

### Endpoints JSON (para TypeScript)
- `GET /users/api/data/` - Datos del usuario actual
- `POST /users/api/login/` - Login via JSON
- `POST /users/api/register/` - Registro via JSON
- `GET /api-data/` - Datos generales del sistema

### Admin
- `/admin/` - Panel de administración Django

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# Django
SECRET_KEY=tu-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=leanmaker_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host
DB_PORT=1433

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Base de Datos
El proyecto está configurado para SQL Server Azure por defecto. Para cambiar:

1. Edita `core/settings.py`
2. Modifica la configuración `DATABASES`
3. Ejecuta las migraciones

## 📊 Modelos Principales

### User (Usuario)
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(choices=ROLES)  # admin, student, company
    phone = models.CharField()
    avatar = models.URLField()
    bio = models.TextField()
    is_verified = models.BooleanField()
```

## 🔐 Autenticación

### Sistema de Sesiones
- **Sesiones Django** - Autenticación tradicional
- **CSRF Protection** - Protección contra ataques CSRF
- **Login/Logout** - Sistema nativo de Django

### Roles de Usuario
- **admin**: Administradores del sistema
- **student**: Estudiantes
- **company**: Empresas

## 💻 Integración TypeScript

### Configuración Global
```typescript
window.LEANMAKER_CONFIG = {
    apiBaseUrl: 'http://localhost:8000',
    csrfToken: 'token-csrf',
    user: { /* datos del usuario */ },
    debug: true
};
```

### Clases TypeScript
```typescript
// API Client
const api = new LeanMakerAPI();

// Form Handler
const formHandler = new FormHandler();

// Dashboard Utils
const dashboardUtils = new DashboardUtils();
```

### Ejemplo de Uso
```typescript
// Login
const response = await api.login({
    email: 'user@example.com',
    password: 'password123'
});

// Obtener datos del usuario
const userData = await api.getUserData();

// Actualizar perfil
const updateResponse = await api.updateUser({
    firstName: 'Nuevo Nombre'
});
```

## 🛠️ Desarrollo

### Comandos útiles
```bash
# Ejecutar servidor
python manage.py runserver

# Crear migraciones
python manage.py makemigrations

# Ejecutar migraciones
python manage.py migrate

# Shell de Django
python manage.py shell

# Tests
python manage.py test

# Collect static
python manage.py collectstatic
```

### Estructura de Apps
Cada app sigue la estructura Django estándar:
```
app_name/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── forms.py
├── views.py
├── urls.py
└── migrations/
```

## 📝 Templates Django

### Template Base
```html
{% extends 'base.html' %}

{% block title %}Mi Página{% endblock %}

{% block content %}
    <h1>Contenido de la página</h1>
{% endblock %}
```

### Integración TypeScript
```html
<script>
    window.LEANMAKER_CONFIG = {
        apiBaseUrl: '{{ request.scheme }}://{{ request.get_host }}',
        csrfToken: '{{ csrf_token }}',
        user: {% if user.is_authenticated %}{/* datos del usuario */}{% else %}null{% endif %},
        debug: {% if debug %}true{% else %}false{% endif %}
    };
</script>
<script src="{% static 'js/typescript-integration.js' %}"></script>
```

## 🔍 Testing

```bash
# Ejecutar todos los tests
python manage.py test

# Tests específicos
python manage.py test users
python manage.py test companies
```

## 📦 Deployment

### Producción
1. Cambiar `DEBUG = False`
2. Configurar `SECRET_KEY` segura
3. Configurar base de datos de producción
4. Configurar `ALLOWED_HOSTS`
5. Configurar `CORS_ALLOWED_ORIGINS`
6. Ejecutar `python manage.py collectstatic`

### Docker (opcional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## 🐛 Troubleshooting

### Error de conexión a base de datos
1. Verificar credenciales en `.env`
2. Verificar que SQL Server esté ejecutándose
3. Verificar firewall y puertos

### Error de migraciones
```bash
# Resetear migraciones
python manage.py migrate --fake-initial
```

### Error de CORS
1. Verificar `CORS_ALLOWED_ORIGINS` en `.env`
2. Verificar que el frontend esté en los orígenes permitidos

### Error de TypeScript
1. Verificar que el archivo JS esté compilado
2. Verificar la configuración global en el template
3. Revisar la consola del navegador

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en `logs/django.log`
2. Verificar configuración en `.env`
3. Ejecutar `python manage.py check`
4. Revisar la consola del navegador para errores TypeScript

## 🎉 ¡Listo!

Tu backend está configurado y listo para usar. El sistema funciona con Django puro y tiene integración TypeScript para el frontend.

---

**LeanMaker Backend - Versión 2.0 (Django Puro + TypeScript)** 🚀 