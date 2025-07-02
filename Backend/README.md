# LeanMaker Backend API

## 📋 Descripción

Backend API para la plataforma LeanMaker, un sistema integral de gestión de proyectos y conexión entre estudiantes y empresas. Desarrollado con Django REST Framework y autenticación JWT.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Django 4.2+**: Framework web principal
- **Django REST Framework**: API REST
- **SQL Server**: Base de datos principal
- **JWT Authentication**: Autenticación segura
- **CORS**: Soporte para frontend React
- **drf-spectacular**: Documentación automática de API

### Estructura de Apps
```
Backend/
├── users/                 # Gestión de usuarios y autenticación
├── students/             # Gestión de estudiantes
├── companies/            # Gestión de empresas
├── projects/             # Gestión de proyectos
├── applications/         # Postulaciones a proyectos
├── evaluations/          # Sistema de evaluaciones
├── interviews/           # Gestión de entrevistas
├── notifications/        # Sistema de notificaciones
├── calendar_events/      # Eventos de calendario
├── work_hours/           # Control de horas trabajadas
├── strikes/              # Sistema de strikes
├── documents/            # Gestión de documentos
├── reports/              # Generación de reportes
└── platform_settings/    # Configuración de plataforma
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- SQL Server
- pip

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd leanmaker/Backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv312
# Windows
venv312\Scripts\activate
# Linux/Mac
source venv312/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar base de datos
Editar `leanmaker_backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'sql_server.pyodbc',
        'NAME': 'leanmaker_db',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_password',
        'HOST': 'localhost',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

### 5. Configurar variables de entorno
Crear archivo `.env` en la raíz del backend:
```env
SECRET_KEY=tu_clave_secreta_muy_larga
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=mssql://usuario:password@localhost:1433/leanmaker_db
```

### 6. Ejecutar migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Crear superusuario
```bash
python manage.py createsuperuser
```

### 8. Ejecutar el servidor
```bash
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000`

## 🔐 Autenticación y Autorización

### JWT Authentication
El sistema utiliza JWT (JSON Web Tokens) para autenticación:

```bash
# Login
POST /api/auth/login/
{
    "email": "usuario@ejemplo.com",
    "password": "password123"
}

# Response
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Company**: Gestión de proyectos y evaluaciones
- **Student**: Postulación y participación en proyectos

## 📊 Modelos Principales

### Usuario (User)
```python
{
    "id": 1,
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "student",
    "is_active": true,
    "date_joined": "2024-01-01T00:00:00Z"
}
```

### Estudiante (Student)
```python
{
    "id": 1,
    "user": 1,
    "career": "Ingeniería de Sistemas",
    "semester": 8,
    "graduation_year": 2024,
    "gpa": 4.2,
    "api_level": 2,
    "strikes": 0,
    "total_hours": 180
}
```

### Empresa (Company)
```python
{
    "id": 1,
    "user": 2,
    "name": "TechCorp Solutions",
    "industry": "Tecnología",
    "size": "medium",
    "description": "Empresa de desarrollo de software",
    "website": "https://techcorp.com"
}
```

### Proyecto (Project)
```python
{
    "id": 1,
    "company": 1,
    "title": "Desarrollo Web Frontend",
    "description": "Proyecto de desarrollo web",
    "requirements": ["React", "TypeScript"],
    "duration": "3 meses",
    "status": "active",
    "max_students": 2
}
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/refresh/` - Renovar token
- `POST /api/auth/logout/` - Cerrar sesión
- `POST /api/auth/register/` - Registro de usuarios

### Usuarios
- `GET /api/users/` - Listar usuarios
- `GET /api/users/{id}/` - Obtener usuario
- `PUT /api/users/{id}/` - Actualizar usuario
- `DELETE /api/users/{id}/` - Eliminar usuario

### Estudiantes
- `GET /api/students/` - Listar estudiantes
- `POST /api/students/` - Crear estudiante
- `GET /api/students/{id}/` - Obtener estudiante
- `PUT /api/students/{id}/` - Actualizar estudiante

### Empresas
- `GET /api/companies/` - Listar empresas
- `POST /api/companies/` - Crear empresa
- `GET /api/companies/{id}/` - Obtener empresa
- `PUT /api/companies/{id}/` - Actualizar empresa

### Proyectos
- `GET /api/projects/` - Listar proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/projects/{id}/` - Obtener proyecto
- `PUT /api/projects/{id}/` - Actualizar proyecto

### Aplicaciones
- `GET /api/applications/` - Listar aplicaciones
- `POST /api/applications/` - Crear aplicación
- `GET /api/applications/{id}/` - Obtener aplicación
- `PUT /api/applications/{id}/` - Actualizar aplicación

## 📚 Documentación de API

### Swagger UI
Accede a la documentación interactiva en:
```
http://localhost:8000/api/schema/swagger-ui/
```

### ReDoc
Documentación alternativa en:
```
http://localhost:8000/api/schema/redoc/
```

## 🧪 Testing

### Ejecutar tests
```bash
python manage.py test
```

### Cobertura de tests
```bash
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Verificar configuración
python manage.py check

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Shell de Django
python manage.py shell

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic
```

### Base de datos
```bash
# Resetear base de datos
python manage.py flush

# Backup de datos
python manage.py dumpdata > backup.json

# Restaurar datos
python manage.py loaddata backup.json
```

## 🚀 Deployment

### Configuración para producción
1. Cambiar `DEBUG = False`
2. Configurar `ALLOWED_HOSTS`
3. Usar `SECRET_KEY` segura
4. Configurar base de datos de producción
5. Configurar CORS para dominio de producción

### Variables de entorno de producción
```env
DEBUG=False
SECRET_KEY=clave_super_secreta_y_larga
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
DATABASE_URL=mssql://usuario:password@servidor:1433/leanmaker_prod
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
```

## 📝 Logs

Los logs se guardan en:
```
logs/django.log
```

### Configuración de logging
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Django REST Framework
- SQL Server
- Comunidad de desarrolladores

---

**LeanMaker Backend** - Conectando estudiantes con oportunidades profesionales 🚀