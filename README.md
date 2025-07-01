# LeanMaker - Plataforma de Gestión de Proyectos

Una plataforma completa para la gestión de proyectos entre estudiantes y empresas, construida con Django (Backend) y React (Frontend).

## 🚀 Características Principales

- **Gestión de Usuarios**: Sistema de autenticación JWT para estudiantes, empresas y administradores
- **Gestión de Proyectos**: Creación, aplicación y seguimiento de proyectos
- **Sistema de Evaluaciones**: Evaluación de estudiantes y proyectos
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Calendario**: Gestión de eventos y recordatorios
- **Reportes**: Generación de reportes y estadísticas
- **API REST**: API completa con documentación automática

## 🛠️ Tecnologías Utilizadas

### Backend (Django)
- Django 4.2+
- Django REST Framework
- Django CORS Headers
- Simple JWT
- SQLite (desarrollo) / PostgreSQL (producción)

### Frontend (React)
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Axios
- Formik + Yup

## 📋 Prerrequisitos

- Python 3.8+
- Node.js 16+
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd leanmaker
```

### 2. Configurar el Backend (Django)

```bash
# Navegar al directorio del backend
cd Backend

# Activar el entorno virtual (Windows)
activate_venv.bat

# O crear un nuevo entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar el servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en: http://localhost:8000

### 3. Configurar el Frontend (React)

```bash
# Navegar al directorio del frontend
cd Frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
echo "VITE_API_URL=http://localhost:8000" > .env

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📚 Endpoints de la API

### Autenticación
- `POST /api/v1/token/` - Login
- `POST /api/v1/token/refresh/` - Refresh token
- `POST /api/v1/token/verify/` - Verify token

### Usuarios
- `GET /api/v1/users/` - Listar usuarios
- `GET /api/v1/users/me/` - Perfil del usuario actual
- `POST /api/v1/auth/register/` - Registrar usuario

### Proyectos
- `GET /api/v1/projects/` - Listar proyectos
- `POST /api/v1/projects/` - Crear proyecto
- `GET /api/v1/project-applications/` - Aplicaciones a proyectos
- `GET /api/v1/project-members/` - Miembros de proyectos

### Estudiantes
- `GET /api/v1/students/` - Listar estudiantes
- `GET /api/v1/student-profiles/` - Perfiles de estudiantes

### Documentación de la API
- `GET /api/v1/schema/` - Esquema de la API
- `GET /api/v1/docs/` - Documentación interactiva

## 👥 Roles de Usuario

### Administrador
- Gestión completa de usuarios y proyectos
- Acceso a reportes y estadísticas
- Configuración del sistema

### Estudiante
- Ver y aplicar a proyectos
- Gestionar perfil y habilidades
- Ver evaluaciones y calificaciones

### Empresa
- Crear y gestionar proyectos
- Evaluar estudiantes
- Ver reportes de proyectos

## 🧪 Pruebas

### Backend
```bash
cd Backend
python manage.py test
```

### Frontend
```bash
cd Frontend
npm test
```

## 📦 Despliegue

### Backend (Producción)
```bash
# Configurar variables de entorno de producción
export DEBUG=False
export SECRET_KEY=your-production-secret-key
export DATABASE_URL=postgresql://...

# Recolectar archivos estáticos
python manage.py collectstatic

# Usar Gunicorn para producción
pip install gunicorn
gunicorn leanmaker_backend.wsgi:application
```

### Frontend (Producción)
```bash
# Construir para producción
npm run build

# Servir con nginx o similar
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de la API en `/api/v1/docs/`
2. Verifica los logs del servidor Django
3. Abre un issue en el repositorio

## 🔄 Próximos Pasos

1. **Configurar CORS**: Asegúrate de que el backend permita requests desde el frontend
2. **Probar Autenticación**: Usa el componente TestConnection para verificar la conectividad
3. **Crear Usuarios**: Usa el admin de Django para crear usuarios de prueba
4. **Desarrollar Funcionalidades**: Comienza con las funcionalidades principales según tu rol

¡Tu aplicación LeanMaker está lista para usar! 🎉
