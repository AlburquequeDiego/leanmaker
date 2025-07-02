# 🚀 LeanMaker - Plataforma de Conexión Estudiantil-Empresarial

## 📋 Descripción

LeanMaker es una plataforma integral que conecta estudiantes con oportunidades profesionales en empresas, facilitando la gestión de proyectos, evaluaciones y el desarrollo de habilidades prácticas.

## 🎯 Características Principales

### 👥 **Gestión de Usuarios**
- **Estudiantes**: Perfiles completos, habilidades, GPA, historial de proyectos
- **Empresas**: Gestión de proyectos, evaluaciones, entrevistas
- **Administradores**: Control total del sistema y validaciones

### 📊 **Sistema de Proyectos**
- Publicación de proyectos por empresas
- Postulaciones de estudiantes
- Seguimiento de progreso
- Gestión de entregables

### ⭐ **Sistema de Evaluaciones**
- Evaluaciones bidireccionales (empresa ↔ estudiante)
- Múltiples categorías de evaluación
- Historial de calificaciones
- Métricas de rendimiento

### 📅 **Gestión de Eventos**
- Entrevistas programadas
- Reuniones de proyecto
- Calendario integrado
- Notificaciones automáticas

### ⚡ **Sistema de Strikes**
- Control de cumplimiento
- Penalizaciones automáticas
- Gestión de incidencias
- Seguimiento de comportamiento

## 🏗️ Arquitectura del Sistema

### Backend (Django REST Framework)
```
Backend/
├── Django 4.2+           # Framework principal
├── SQL Server           # Base de datos
├── JWT Authentication   # Autenticación segura
├── REST API             # APIs RESTful
└── 15+ Apps Django      # Módulos especializados
```

### Frontend (React + TypeScript)
```
Frontend/
├── React 18            # Biblioteca de UI
├── TypeScript          # Tipado estático
├── Material-UI         # Componentes modernos
├── Vite                # Build tool rápido
└── Responsive Design   # Diseño adaptativo
```

## 🚀 Instalación Rápida

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- SQL Server
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd leanmaker
```

### 2. Configurar Backend
```bash
cd Backend
python -m venv venv312
venv312\Scripts\activate  # Windows
# source venv312/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 3. Configurar Base de Datos
Editar `Backend/leanmaker_backend/settings.py`:
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

### 4. Ejecutar Migraciones
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 5. Configurar Frontend
```bash
cd ../Frontend
npm install
```

### 6. Configurar Variables de Entorno
Crear `.env` en `Frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 7. Ejecutar Frontend
```bash
npm run dev
```

## 🌐 Acceso al Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin
- **Documentación API**: http://localhost:8000/api/schema/swagger-ui/

## 👤 Roles y Funcionalidades

### 🎓 **Estudiante**
- **Dashboard Personal**: Estadísticas, proyectos activos, horas acumuladas
- **Explorar Proyectos**: Buscar y postular a proyectos disponibles
- **Mis Aplicaciones**: Seguimiento de postulaciones
- **Mis Proyectos**: Gestión de proyectos asignados
- **Evaluaciones**: Ver evaluaciones recibidas
- **Calendario**: Eventos y entrevistas programadas
- **Perfil**: Gestión de información personal y habilidades

### 🏢 **Empresa**
- **Dashboard Empresarial**: Estadísticas, proyectos activos, postulaciones
- **Gestión de Proyectos**: Crear, editar y gestionar proyectos
- **Postulaciones**: Revisar y gestionar candidatos
- **Evaluaciones**: Evaluar estudiantes y ver evaluaciones recibidas
- **Entrevistas**: Programar y gestionar entrevistas
- **Calendario**: Eventos y reuniones
- **Strikes**: Gestión de incidencias con estudiantes

### 👨‍💼 **Administrador**
- **Dashboard Administrativo**: Estadísticas globales del sistema
- **Gestión de Usuarios**: Administrar estudiantes, empresas y admins
- **Validación de Horas**: Aprobar horas trabajadas por estudiantes
- **Gestión de Empresas**: Validar y gestionar empresas
- **Gestión de Estudiantes**: Control de estudiantes y strikes
- **Gestión de Proyectos**: Supervisión de proyectos
- **Configuración**: Ajustes del sistema

## 📊 Modelos de Datos Principales

### Usuario
```json
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

### Estudiante
```json
{
  "id": 1,
  "user": 1,
  "career": "Ingeniería de Sistemas",
  "semester": 8,
  "graduation_year": 2024,
  "gpa": 4.2,
  "api_level": 2,
  "strikes": 0,
  "total_hours": 180,
  "skills": ["React", "Python", "SQL"],
  "languages": ["Español", "Inglés"]
}
```

### Empresa
```json
{
  "id": 1,
  "user": 2,
  "name": "TechCorp Solutions",
  "industry": "Tecnología",
  "size": "medium",
  "description": "Empresa de desarrollo de software",
  "website": "https://techcorp.com",
  "technologies_used": ["React", "Node.js", "Python"],
  "benefits_offered": ["Horario flexible", "Capacitación"]
}
```

### Proyecto
```json
{
  "id": 1,
  "company": 1,
  "title": "Desarrollo Web Frontend",
  "description": "Proyecto de desarrollo web con React",
  "requirements": ["React", "TypeScript", "Git"],
  "preferred_skills": ["Material-UI", "Redux"],
  "duration": "3 meses",
  "status": "active",
  "max_students": 2,
  "benefits": ["Certificación", "Referencia laboral"],
  "technologies": ["React", "TypeScript", "Material-UI"]
}
```

## 🔌 APIs Principales

### Autenticación
```bash
POST /api/auth/login/          # Iniciar sesión
POST /api/auth/refresh/        # Renovar token
POST /api/auth/logout/         # Cerrar sesión
POST /api/auth/register/       # Registro
```

### Usuarios
```bash
GET    /api/users/             # Listar usuarios
GET    /api/users/{id}/        # Obtener usuario
PUT    /api/users/{id}/        # Actualizar usuario
DELETE /api/users/{id}/        # Eliminar usuario
```

### Estudiantes
```bash
GET    /api/students/          # Listar estudiantes
POST   /api/students/          # Crear estudiante
GET    /api/students/{id}/     # Obtener estudiante
PUT    /api/students/{id}/     # Actualizar estudiante
```

### Empresas
```bash
GET    /api/companies/         # Listar empresas
POST   /api/companies/         # Crear empresa
GET    /api/companies/{id}/    # Obtener empresa
PUT    /api/companies/{id}/    # Actualizar empresa
```

### Proyectos
```bash
GET    /api/projects/          # Listar proyectos
POST   /api/projects/          # Crear proyecto
GET    /api/projects/{id}/     # Obtener proyecto
PUT    /api/projects/{id}/     # Actualizar proyecto
```

### Aplicaciones
```bash
GET    /api/applications/      # Listar aplicaciones
POST   /api/applications/      # Crear aplicación
GET    /api/applications/{id}/ # Obtener aplicación
PUT    /api/applications/{id}/ # Actualizar aplicación
```

## 🎨 Interfaz de Usuario

### Características del Frontend
- **Diseño Responsivo**: Adaptable a móviles, tablets y desktop
- **Tema Moderno**: Material-UI con diseño profesional
- **Navegación Intuitiva**: Menús organizados por rol
- **Componentes Reutilizables**: Código modular y mantenible
- **Estados de Carga**: Feedback visual para todas las acciones
- **Validación en Tiempo Real**: Formularios con validación inmediata

### Componentes Principales
- **DashboardLayout**: Layout principal con sidebar y header
- **ProjectCard**: Tarjetas de proyecto con información completa
- **StudentCard**: Tarjetas de estudiante con estadísticas
- **EvaluationForm**: Formularios de evaluación avanzados
- **Calendar**: Calendario integrado para eventos
- **NotificationSystem**: Sistema de notificaciones en tiempo real

## 🔒 Seguridad

### Autenticación JWT
- Tokens de acceso y refresh
- Renovación automática de tokens
- Logout seguro
- Protección de rutas

### Autorización por Roles
- Control de acceso basado en roles
- Permisos granulares
- Validación de permisos en frontend y backend

### Protección de Datos
- Validación de entrada
- Sanitización de datos
- Protección CSRF
- Headers de seguridad

## 📈 Métricas y Analytics

### Dashboard de Administrador
- Total de usuarios registrados
- Proyectos activos
- Aplicaciones pendientes
- Evaluaciones completadas
- Horas acumuladas por estudiantes

### Dashboard de Empresa
- Proyectos publicados
- Postulaciones recibidas
- Estudiantes evaluados
- Entrevistas programadas

### Dashboard de Estudiante
- Proyectos aplicados
- Horas acumuladas
- Evaluaciones recibidas
- Strikes actuales

## 🚀 Deployment

### Backend (Django)
```bash
# Configuración para producción
DEBUG = False
ALLOWED_HOSTS = ['tu-dominio.com']
SECRET_KEY = 'clave-super-secreta'
DATABASE_URL = 'mssql://usuario:password@servidor:1433/leanmaker_prod'

# Comandos de deployment
python manage.py collectstatic
python manage.py migrate
gunicorn leanmaker_backend.wsgi:application
```

### Frontend (React)
```bash
# Construir para producción
npm run build

# Variables de entorno de producción
VITE_API_BASE_URL=https://api.tu-dominio.com/api
VITE_APP_NAME=LeanMaker
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend
python manage.py test
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests
```bash
cd Frontend
npm run test
npm run test:coverage
```

## 📚 Documentación

- **[Backend README](Backend/README.md)**: Documentación completa del backend
- **[Frontend README](Frontend/README.md)**: Documentación completa del frontend
- **[API Documentation](http://localhost:8000/api/schema/swagger-ui/)**: Documentación interactiva de APIs

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo completo* - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Django Team
- React Team
- Material-UI Team
- Comunidad de desarrolladores
- Todos los que contribuyeron al proyecto

---

**LeanMaker** - Conectando talento con oportunidades profesionales 🚀

*Desarrollado con ❤️ para facilitar la conexión entre estudiantes y empresas*
