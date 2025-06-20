# Integración Frontend-Backend

## Configuración del Backend

El backend de Django está configurado para permitir conexiones desde el frontend de React. Las configuraciones principales incluyen:

### CORS (Cross-Origin Resource Sharing)
- Orígenes permitidos: `localhost:3000`, `localhost:5173` (React/Vite)
- Credenciales habilitadas
- Headers permitidos configurados

### Endpoints de Configuración
- `/api/health/` - Health check del backend
- `/api/config/` - Configuración de endpoints para el frontend

## Configuración del Frontend

### 1. Variables de Entorno
Crear un archivo `.env` en el directorio del frontend:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_PREFIX=/api
```

### 2. Configuración de Axios
Crear un archivo de configuración para las peticiones HTTP:

```javascript
// src/config/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir al login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Servicios de API
Crear servicios para cada módulo:

```javascript
// src/services/authService.js
import api from '../config/api';

export const authService = {
  login: (credentials) => api.post('/api/token/', credentials),
  register: (userData) => api.post('/api/users/register/', userData),
  refreshToken: (refreshToken) => api.post('/api/token/refresh/', { refresh: refreshToken }),
};

// src/services/projectService.js
import api from '../config/api';

export const projectService = {
  getProjects: () => api.get('/api/projects/'),
  getProject: (id) => api.get(`/api/projects/${id}/`),
  createProject: (projectData) => api.post('/api/projects/', projectData),
  updateProject: (id, projectData) => api.put(`/api/projects/${id}/`, projectData),
  deleteProject: (id) => api.delete(`/api/projects/${id}/`),
};
```

### 4. Hook para Autenticación
Crear un hook personalizado para manejar la autenticación:

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Decodificar el token para obtener información del usuario
      const userData = JSON.parse(atob(access.split('.')[1]));
      setUser(userData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  useEffect(() => {
    // Verificar si hay un token al cargar la aplicación
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Ejemplos de Uso

### Dashboard de Administrador
```javascript
// src/pages/AdminDashboard.js
import { useState, useEffect } from 'react';
import api from '../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/users/admin_dashboard_stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Dashboard de Administrador</h1>
      <div>
        <p>Total de usuarios: {stats?.total_users}</p>
        <p>Total de proyectos: {stats?.total_projects}</p>
        <p>Total de postulaciones: {stats?.total_applications}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### Gestión de Proyectos
```javascript
// src/pages/Projects.js
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        setProjects(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      setProjects([...projects, response.data]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (loading) return <div>Cargando proyectos...</div>;

  return (
    <div>
      <h1>Proyectos</h1>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Estado: {project.status}</p>
        </div>
      ))}
    </div>
  );
};

export default Projects;
```

## Endpoints Principales

### Autenticación
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `POST /api/users/register/` - Registro

### Usuarios
- `GET /api/users/profile/` - Perfil del usuario
- `GET /api/users/admin_dashboard_stats/` - Estadísticas de admin
- `GET /api/users/user_activity_chart/` - Gráfico de actividad

### Empresas
- `GET /api/companies/profile/` - Perfil de empresa
- `GET /api/companies/dashboard_stats/` - Estadísticas de empresa
- `GET /api/companies/project_performance/` - Rendimiento de proyectos

### Estudiantes
- `GET /api/students/profile/` - Perfil de estudiante
- `GET /api/students/dashboard_stats/` - Estadísticas de estudiante
- `GET /api/students/application_history/` - Historial de postulaciones

### Proyectos
- `GET /api/projects/` - Lista de proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/projects/{id}/` - Detalle de proyecto
- `PUT /api/projects/{id}/` - Actualizar proyecto
- `DELETE /api/projects/{id}/` - Eliminar proyecto

### Postulaciones
- `GET /api/applications/` - Lista de postulaciones
- `POST /api/applications/` - Crear postulación
- `GET /api/applications/{id}/` - Detalle de postulación
- `PUT /api/applications/{id}/` - Actualizar postulación

### Notificaciones
- `GET /api/notifications/` - Lista de notificaciones
- `POST /api/notifications/mark_all_as_read/` - Marcar todas como leídas

### Evaluaciones
- `GET /api/projects/{id}/evaluations/` - Evaluaciones de proyecto
- `POST /api/projects/{id}/evaluations/` - Crear evaluación

### Amonestaciones
- `GET /api/strikes/` - Lista de amonestaciones
- `POST /api/strikes/` - Crear amonestación

### Cuestionarios
- `GET /api/questionnaires/questionnaires/` - Lista de cuestionarios
- `POST /api/questionnaires/questionnaires/{id}/submit_responses/` - Enviar respuestas

### Eventos de Calendario
- `GET /api/calendar/events/` - Lista de eventos
- `POST /api/calendar/events/` - Crear evento
- `GET /api/calendar/events/my_events/` - Mis eventos
- `GET /api/calendar/events/upcoming_events/` - Próximos eventos

### Horas de Trabajo
- `GET /api/work-hours/work-hours/` - Lista de horas
- `POST /api/work-hours/work-hours/` - Registrar horas
- `POST /api/work-hours/work-hours/{id}/approve/` - Aprobar horas
- `POST /api/work-hours/work-hours/{id}/reject/` - Rechazar horas
- `GET /api/work-hours/work-hours/my_summary/` - Resumen de horas

## Manejo de Errores

El backend devuelve errores en formato JSON con códigos de estado HTTP apropiados:

```javascript
// Ejemplo de manejo de errores
try {
  const response = await api.post('/api/projects/', projectData);
  // Éxito
} catch (error) {
  if (error.response) {
    // Error del servidor
    console.error('Error del servidor:', error.response.data);
    console.error('Código de estado:', error.response.status);
  } else if (error.request) {
    // Error de red
    console.error('Error de red:', error.request);
  } else {
    // Otro error
    console.error('Error:', error.message);
  }
}
```

## Consideraciones de Seguridad

1. **Tokens JWT**: Los tokens se almacenan en localStorage y se renuevan automáticamente
2. **CORS**: Configurado para permitir solo orígenes específicos
3. **Validación**: Todos los datos se validan tanto en frontend como backend
4. **Permisos**: Cada endpoint verifica los permisos del usuario

## Próximos Pasos

1. Implementar el frontend siguiendo esta documentación
2. Configurar las variables de entorno
3. Probar la integración con los endpoints
4. Implementar manejo de errores robusto
5. Añadir funcionalidades adicionales según sea necesario 