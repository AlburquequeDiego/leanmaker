# LeanMaker Frontend

## 📋 Descripción

Frontend de la plataforma LeanMaker desarrollado con React, TypeScript y Material-UI. Interfaz moderna y responsiva para conectar estudiantes con oportunidades profesionales en empresas.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Vite**: Herramienta de construcción rápida
- **Material-UI (MUI)**: Componentes de UI modernos
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para APIs
- **React Hook Form**: Manejo de formularios
- **Yup**: Validación de esquemas

### Estructura del Proyecto
```
Frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── common/         # Componentes comunes
│   │   ├── features/       # Componentes específicos
│   │   └── layout/         # Componentes de layout
│   ├── pages/              # Páginas principales
│   │   ├── Dashboard/      # Dashboards por rol
│   │   ├── Login/          # Página de login
│   │   └── Register/       # Página de registro
│   ├── services/           # Servicios de API
│   ├── hooks/              # Custom hooks
│   ├── types/              # Definiciones de tipos TypeScript
│   ├── config/             # Configuraciones
│   ├── styles/             # Estilos globales
│   └── assets/             # Recursos estáticos
├── public/                 # Archivos públicos
└── imagenes/              # Imágenes del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd leanmaker/Frontend
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del frontend:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=LeanMaker
VITE_APP_VERSION=1.0.0
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 🔐 Autenticación y Autorización

### Flujo de Autenticación
1. **Login**: Usuario ingresa credenciales
2. **JWT Token**: Backend devuelve access y refresh tokens
3. **Almacenamiento**: Tokens se guardan en localStorage
4. **Autorización**: Tokens se incluyen en headers de API
5. **Refresh**: Token se renueva automáticamente

### Roles de Usuario
- **Admin**: Panel de administración completo
- **Company**: Gestión de proyectos y evaluaciones
- **Student**: Postulación y participación en proyectos

## 🎨 Componentes Principales

### Layout Components
- **DashboardLayout**: Layout principal con sidebar y header
- **AuthLayout**: Layout para páginas de autenticación
- **LoadingButton**: Botón con estado de carga
- **CustomDialog**: Diálogos personalizados

### Feature Components
- **ProjectCard**: Tarjeta de proyecto
- **StudentCard**: Tarjeta de estudiante
- **EvaluationForm**: Formulario de evaluación
- **NotificationItem**: Item de notificación

## 📱 Páginas y Rutas

### Rutas Públicas
- `/` - Página de inicio
- `/login` - Iniciar sesión
- `/register` - Registro de usuarios
- `/forgot-password` - Recuperar contraseña

### Rutas Protegidas - Admin
- `/dashboard/admin` - Dashboard principal
- `/dashboard/admin/usuarios` - Gestión de usuarios
- `/dashboard/admin/gestion-estudiantes` - Gestión de estudiantes
- `/dashboard/admin/gestion-empresas` - Gestión de empresas
- `/dashboard/admin/gestion-proyectos` - Gestión de proyectos

### Rutas Protegidas - Empresa
- `/dashboard/company` - Dashboard principal
- `/dashboard/company/projects` - Mis proyectos
- `/dashboard/company/applications` - Postulaciones
- `/dashboard/company/evaluations` - Evaluaciones
- `/dashboard/company/interviews` - Entrevistas
- `/dashboard/company/calendar` - Calendario

### Rutas Protegidas - Estudiante
- `/dashboard/student` - Dashboard principal
- `/dashboard/student/available-projects` - Proyectos disponibles
- `/dashboard/student/my-applications` - Mis postulaciones
- `/dashboard/student/my-projects` - Mis proyectos
- `/dashboard/student/evaluations` - Evaluaciones
- `/dashboard/student/calendar` - Calendario

## 🔌 Integración con API

### Configuración de API
```typescript
// config/api.config.ts
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Servicios de API
- **api.service.ts**: Cliente HTTP base
- **auth.service.ts**: Servicios de autenticación
- **project.service.ts**: Servicios de proyectos
- **user.service.ts**: Servicios de usuarios

### Ejemplo de uso
```typescript
import { apiService } from '../services/api.service';

// GET request
const projects = await apiService.get('/projects/');

// POST request
const newProject = await apiService.post('/projects/', {
  title: 'Nuevo Proyecto',
  description: 'Descripción del proyecto',
});

// PUT request
const updatedProject = await apiService.put(`/projects/${id}/`, {
  title: 'Proyecto Actualizado',
});

// DELETE request
await apiService.delete(`/projects/${id}/`);
```

## 🎯 Estados de la Aplicación

### Estados de Autenticación
- **unauthenticated**: Usuario no autenticado
- **authenticated**: Usuario autenticado
- **loading**: Cargando estado de autenticación

### Estados de Datos
- **loading**: Cargando datos
- **success**: Datos cargados exitosamente
- **error**: Error al cargar datos
- **empty**: Sin datos disponibles

### Estados de Formularios
- **idle**: Formulario en espera
- **submitting**: Enviando formulario
- **success**: Formulario enviado exitosamente
- **error**: Error al enviar formulario

## 🎨 Temas y Estilos

### Material-UI Theme
```typescript
// styles/theme.ts
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Estilos Globales
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Dark/Light Mode**: Soporte para temas claro y oscuro
- **Custom Components**: Componentes personalizados con MUI

## 🧪 Testing

### Ejecutar tests
```bash
npm run test
# o
yarn test
```

### Tests de componentes
```bash
npm run test:components
```

### Cobertura de tests
```bash
npm run test:coverage
```

## 📦 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de producción
```

### Testing
```bash
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura de tests
```

### Linting y Formateo
```bash
npm run lint         # Verificar código
npm run lint:fix     # Corregir problemas de linting
npm run format       # Formatear código
```

## 🚀 Deployment

### Construir para producción
```bash
npm run build
```

### Configuración de variables de entorno para producción
```env
VITE_API_BASE_URL=https://api.tu-dominio.com/api
VITE_APP_NAME=LeanMaker
VITE_APP_VERSION=1.0.0
```

### Servir archivos estáticos
Los archivos construidos se encuentran en `dist/` y pueden ser servidos por:
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

## 🔧 Configuración Avanzada

### Configuración de Vite
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Configuración de TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 📊 Performance

### Optimizaciones Implementadas
- **Code Splitting**: Carga lazy de componentes
- **Bundle Optimization**: Optimización de bundles
- **Image Optimization**: Optimización de imágenes
- **Caching**: Caché de API responses
- **Memoization**: Uso de React.memo y useMemo

### Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Seguridad

### Medidas Implementadas
- **HTTPS**: Uso obligatorio en producción
- **CORS**: Configuración segura de CORS
- **XSS Protection**: Protección contra XSS
- **CSRF Protection**: Protección CSRF
- **Input Validation**: Validación de entrada
- **JWT Security**: Tokens seguros

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

- React Team
- Material-UI Team
- Vite Team
- Comunidad de desarrolladores

---

**LeanMaker Frontend** - Interfaz moderna para conectar talento con oportunidades 🚀 