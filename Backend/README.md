# Backend - LeanMaker API

## Estructura del Proyecto


Backend/
├── leanmaker_api/          # Proyecto principal Django
│   ├── __init__.py
│   ├── settings.py         # Configuración del proyecto
│   ├── urls.py            # URLs principales
│   ├── wsgi.py            # Configuración WSGI
│   └── asgi.py            # Configuración ASGI
├── apps/                   # Aplicaciones Django
│   ├── users/             # Gestión de usuarios
│   ├── companies/         # Gestión de empresas
│   ├── students/          # Gestión de estudiantes
│   ├── projects/          # Gestión de proyectos
│   ├── evaluations/       # Sistema de evaluaciones
│   ├── interviews/        # Gestión de entrevistas
│   └── notifications/     # Sistema de notificaciones
├── requirements.txt        # Dependencias Python
├── manage.py              # Comando de gestión Django
└── .env                   # Variables de entorno
```

## Tecnologías

- **Django 4.2+** - Framework web
- **Django REST Framework** - API REST
- **SQL Server** - Base de datos
- **Django CORS Headers** - CORS para frontend
- **JWT Authentication** - Autenticación
- **Django Filter** - Filtros avanzados

## Configuración Inicial

1. Crear entorno virtual: `python -m venv venv`
2. Activar entorno: `source venv/bin/activate` (Linux/Mac) o `venv\Scripts\activate` (Windows)
3. Instalar dependencias: `pip install -r requirements.txt`
4. Configurar variables de entorno en `.env`
5. Ejecutar migraciones: `python manage.py migrate`
6. Crear superusuario: `python manage.py createsuperuser`
7. Ejecutar servidor: `python manage.py runserver`

## Endpoints Principales

### Autenticación
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Registro
- `POST /api/auth/refresh/` - Refresh token

### Usuarios
- `GET /api/users/profile/` - Perfil del usuario
- `PUT /api/users/profile/` - Actualizar perfil

### Empresas
- `GET /api/companies/projects/` - Listar proyectos
- `POST /api/companies/projects/` - Crear proyecto
- `GET /api/companies/evaluations/` - Evaluaciones
- `GET /api/companies/interviews/` - Entrevistas

### Estudiantes
- `GET /api/students/search/` - Búsqueda de estudiantes
- `GET /api/students/applications/` - Postulaciones

### Proyectos
- `GET /api/projects/` - Listar proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/projects/{id}/` - Detalle de proyecto
- `PUT /api/projects/{id}/` - Actualizar proyecto
- `DELETE /api/projects/{id}/` - Eliminar proyecto 