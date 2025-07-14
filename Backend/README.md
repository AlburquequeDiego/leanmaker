# LEANMAKER BACKEND

## Descripción
Backend de Django para la plataforma LEANMAKER. Sistema de gestión para empresas, estudiantes y administradores.

## Requisitos Previos

### Python
- Python 3.12 o superior
- pip (gestor de paquetes de Python)

### Base de Datos
- SQL Server (Azure o local)
- ODBC Driver para SQL Server

### Otros
- Redis (para tareas en segundo plano)
- Node.js (para el frontend)

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd leanmaker/Backend
```

### 2. Crear entorno virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Crear archivo `.env` en la carpeta `Backend/`:
```env
# Configuración de Django
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos SQL Server
DB_NAME=leanmaker_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_servidor_sql
DB_PORT=1433

# Redis (para Celery)
REDIS_URL=redis://localhost:6379/0

# Configuración de email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_password_app

# Configuración de archivos
MEDIA_URL=/media/
STATIC_URL=/static/
```

### 5. Configurar base de datos
1. Crear base de datos en SQL Server
2. Ejecutar migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear superusuario
```bash
python manage.py createsuperuser
```

### 7. Poblar base de datos (opcional)
```bash
python manage.py shell
```
```python
exec(open('populate_all_tables_simple.py').read())
```

## Ejecución

### Servidor de desarrollo
```bash
python manage.py runserver
```
El servidor estará disponible en: http://127.0.0.1:8000/

### Panel de administración
Acceder a: http://127.0.0.1:8000/admin/

### Celery (tareas en segundo plano)
```bash
# Terminal 1: Worker de Celery
celery -A core worker --loglevel=info

# Terminal 2: Beat scheduler (si es necesario)
celery -A core beat --loglevel=info
```

## Estructura del Proyecto

```
Backend/
├── core/                   # Configuración principal de Django
├── users/                  # Gestión de usuarios
├── companies/              # Gestión de empresas
├── students/               # Gestión de estudiantes
├── projects/               # Gestión de proyectos
├── applications/           # Gestión de aplicaciones
├── evaluations/            # Sistema de evaluaciones
├── notifications/          # Sistema de notificaciones
├── documents/              # Gestión de documentos
├── reports/                # Generación de reportes
├── activity_logs/          # Registro de actividades
├── templates/              # Plantillas HTML
├── static/                 # Archivos estáticos
├── media/                  # Archivos subidos por usuarios
└── logs/                   # Archivos de log
```

## Comandos Útiles

### Desarrollo
```bash
# Ejecutar tests
python manage.py test

# Verificar código
black .
flake8 .
isort .

# Generar documentación
sphinx-build -b html docs/ docs/_build/html
```

### Base de datos
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Crear backup
python manage.py dumpdata > backup.json

# Restaurar backup
python manage.py loaddata backup.json
```

### Shell de Django
```bash
python manage.py shell
```

## Roles de Usuario

1. **Admin**: Acceso completo al sistema
2. **Company**: Gestión de proyectos y aplicaciones
3. **Student**: Participación en proyectos y evaluaciones

## API Endpoints

El sistema utiliza Django puro sin APIs REST. Las vistas están organizadas por roles:

- `/admin/` - Panel de administración
- `/company/` - Dashboard de empresas
- `/student/` - Dashboard de estudiantes
- `/` - Página principal

## Troubleshooting

### Error de conexión a SQL Server
1. Verificar que el ODBC Driver esté instalado
2. Comprobar credenciales en `.env`
3. Verificar que el servidor SQL esté ejecutándose

### Error de Redis
1. Verificar que Redis esté instalado y ejecutándose
2. Comprobar la URL de Redis en `.env`

### Error de migraciones
```bash
python manage.py migrate --fake-initial
```

### Limpiar cache
```bash
python manage.py clearcache
```

## Contribución

1. Crear rama para nueva funcionalidad
2. Seguir estándares de código (Black, Flake8)
3. Agregar tests para nuevas funcionalidades
4. Crear pull request

## Contacto

Para dudas o problemas, contactar al equipo de desarrollo. 