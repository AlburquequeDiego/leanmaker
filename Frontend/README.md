# LeanMaker - Plataforma de Inserción Laboral
## Documentación Técnica Completa del Frontend

## 📋 Descripción General
LeanMaker es una plataforma web desarrollada en React con TypeScript que conecta estudiantes con oportunidades laborales reales. El frontend está diseñado como un mockup funcional con navegación completa, autenticación simulada y interfaces para tres roles principales: Estudiantes, Empresas y Administradores.
 
## 🛠️ Instalación rápida (recomendado)

```bash
# 1. Limpiar dependencias previas
npm run clean
# 2. Instalar dependencias evitando conflictos
npm install --legacy-peer-deps
# 3. Ejecutar el servidor de desarrollo
npm run dev
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
Frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── auth/            # Componentes de autenticación
│   │   │   ├── ProtectedRoute.tsx    # Componente de protección de rutas
│   │   │   └── index.ts
│   │   ├── common/          # Componentes comunes (botones, inputs, etc.)
│   │   ├── features/        # Componentes específicos de funcionalidades
│   │   └── layout/          # Componentes de estructura
│   │       └── DashboardLayout/      # Layout principal del dashboard
│   │           └── index.tsx         # Componente principal del layout
│   ├── hooks/               # Custom hooks
│   │   └── useAuth.tsx      # Hook de autenticación con Context API
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Dashboard/       # Dashboards por rol
│   │   │   ├── Student/     # Páginas del dashboard de estudiante
│   │   │   │   ├── StudentDashboard.tsx      # Dashboard principal
│   │   │   │   ├── Profile.tsx               # Perfil del estudiante
│   │   │   │   ├── Notifications.tsx         # Notificaciones
│   │   │   │   ├── MyApplications.tsx        # Mis aplicaciones
│   │   │   │   ├── MyProjects.tsx            # Mis proyectos
│   │   │   │   ├── Evaluations.tsx           # Evaluaciones
│   │   │   │   ├── Calendar.tsx              # Calendario
│   │   │   │   ├── APIQuestionnaire.tsx      # Cuestionario API
│   │   │   │   ├── APIResults.tsx            # Resultados API
│   │   │   │   └── Projects/                 # Proyectos disponibles
│   │   │   ├── Admin/       # Páginas del dashboard de administrador
│   │   │   │   ├── AdminDashboard.tsx        # Dashboard principal
│   │   │   │   ├── UsuariosAdmin.tsx         # Gestión de usuarios
│   │   │   │   ├── ValidacionHorasAdmin.tsx  # Validación de horas
│   │   │   │   ├── PerfilAdmin.tsx           # Perfil del admin
│   │   │   │   ├── NotificacionesAdmin.tsx   # Notificaciones admin
│   │   │   │   ├── GestionEmpresasAdmin.tsx  # Gestión de empresas
│   │   │   │   ├── GestionEstudiantesAdmin.tsx # Gestión de estudiantes
│   │   │   │   ├── GestionProyectosAdmin.tsx # Gestión de proyectos
│   │   │   │   ├── GestionEvaluacionesAdmin.tsx # Gestión de evaluaciones
│   │   │   │   └── ConfiguracionPlataformaAdmin.tsx # Configuración
│   │   │   └── Company/     # Páginas del dashboard de empresa
│   │   ├── Home/            # Página principal
│   │   ├── Login/           # Página de inicio de sesión
│   │   ├── Register/        # Página de registro
│   │   └── ForgotPassword/  # Página de recuperación de contraseña
│   ├── routes/              # Configuración de rutas
│   │   └── index.tsx        # Configuración principal de rutas
│   ├── types/               # Definiciones de tipos TypeScript
│   │   └── index.ts         # Interfaces y tipos principales
│   ├── styles/              # Estilos globales
│   ├── assets/              # Recursos estáticos
│   ├── App.tsx              # Componente raíz de la aplicación
│   ├── main.tsx             # Punto de entrada de la aplicación
│   └── index.css            # Estilos CSS globales
├── public/                  # Archivos públicos
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
├── vite.config.ts           # Configuración de Vite
└── README.md                # Esta documentación
```

## 🛠️ Stack Tecnológico

### Dependencias Principales
- **React 18.2.0**: Framework principal con hooks y funcionalidades modernas
- **TypeScript 5.2.2**: Tipado estático para mayor robustez del código
- **Vite 6.3.5**: Build tool y servidor de desarrollo ultra-rápido
- **Material-UI (MUI) 7.1.1**: Biblioteca de componentes UI con diseño Material
- **React Router DOM 6.22.1**: Enrutamiento y navegación SPA
- **Formik 2.4.5 + Yup 1.6.1**: Manejo de formularios y validación
- **Redux Toolkit 2.2.1 + React Redux 9.1.0**: Gestión de estado global
- **Axios 1.6.7**: Cliente HTTP para llamadas a API
- **Styled Components 6.1.8**: CSS-in-JS para estilos dinámicos

### Dependencias de Desarrollo
- **ESLint + Prettier**: Linting y formateo de código
- **TypeScript ESLint**: Reglas específicas para TypeScript
- **Vite Plugin React**: Plugin para React en Vite

## 🎯 Sistema de Autenticación

### Hook useAuth (Context API)
```typescript
// Ubicación: src/hooks/useAuth.tsx
interface AuthContextType {
  user: User | null;           // Usuario actual
  loading: boolean;            // Estado de carga
  error: string | null;        // Errores de autenticación
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, role: UserRole, name: string) => Promise<void>;
  isAuthenticated: boolean;    // Estado de autenticación
}
```

### Credenciales de Prueba
El sistema incluye credenciales mock para testing:
- **Admin**: `admin@leanmaker.com` / `Admin123!`
- **Empresa**: `empresa@leanmaker.com` / `Empresa123!`
- **Estudiante**: `estudiante@leanmaker.com` / `Estudiante123!`

### Almacenamiento
- **localStorage**: Persistencia de sesión del usuario
- **Context API**: Estado global de autenticación
- **Protección de rutas**: Redirección automática según rol

## 🗂️ Interfaces y Tipos

### Tipos Principales (src/types/index.ts)
```typescript
// Roles de usuario
export type UserRole = 'admin' | 'student' | 'company';

// Interfaz de usuario
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz de proyecto
export interface Project {
  id: string;
  title: string;
  description: string;
  companyId: string;
  requirements: string[];
  status: 'open' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Interfaz de aplicación/postulación
export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Interfaz de notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
```

## 🛣️ Sistema de Rutas

### Configuración Principal (src/routes/index.tsx)
El sistema utiliza **React Router v6** con rutas anidadas y protección por roles:

```typescript
// Estructura de rutas
/                           # Página principal (pública)
/login                      # Login (público)
/register                   # Registro (público)
/forgot-password            # Recuperación de contraseña (público)
/dashboard                  # Redirección según rol
/dashboard/admin/*          # Rutas del administrador
/dashboard/student/*        # Rutas del estudiante
/dashboard/company/*        # Rutas de la empresa


### Rutas del Administrador
- `/dashboard/admin` - Dashboard principal
- `/dashboard/admin/usuarios` - Gestión de usuarios
- `/dashboard/admin/validacion-horas` - Validación de horas de práctica
- `/dashboard/admin/perfil` - Perfil del administrador
- `/dashboard/admin/notificaciones` - Envío de notificaciones masivas
- `/dashboard/admin/gestion-empresas` - Gestión de empresas
- `/dashboard/admin/gestion-estudiantes` - Gestión de estudiantes
- `/dashboard/admin/gestion-proyectos` - Gestión de proyectos
- `/dashboard/admin/gestion-evaluaciones` - Gestión de evaluaciones
- `/dashboard/admin/configuracion-plataforma` - Configuración del sistema

### Rutas del Estudiante
- `/dashboard/student` - Dashboard principal
- `/dashboard/student/profile` - Perfil del estudiante
- `/dashboard/student/notifications` - Notificaciones
- `/dashboard/student/available-projects` - Proyectos disponibles
- `/dashboard/student/my-applications` - Mis aplicaciones
- `/dashboard/student/my-projects` - Mis proyectos
- `/dashboard/student/evaluations` - Evaluaciones
- `/dashboard/student/calendar` - Calendario de actividades
- `/dashboard/student/api-questionnaire` - Cuestionario API
- `/dashboard/student/api-results` - Resultados API

## 🎨 Componentes de Layout

### DashboardLayout (src/components/layout/DashboardLayout/index.tsx)
Componente principal que proporciona la estructura base para todos los dashboards:

#### Características:
- **Sidebar persistente**: Navegación lateral con 280px de ancho
- **AppBar responsive**: Barra superior con menú de usuario
- **Navegación por roles**: Menús específicos según el tipo de usuario
- **Responsive design**: Adaptación móvil con drawer temporal
- **Outlet rendering**: Renderizado de rutas hijas

#### Props:
```typescript
interface DashboardLayoutProps {
  userRole: 'admin' | 'company' | 'student';
}
```

#### Menús por Rol:
- **Admin**: Dashboard, Perfil, Notificaciones, Gestión de Usuarios, Validación de Horas, etc.
- **Estudiante**: Dashboard, Perfil, Notificaciones, Proyectos Disponibles, Mis Aplicaciones, etc.
- **Empresa**: Dashboard, Perfil, Notificaciones, Mis Proyectos, Postulantes, etc.

## 🔒 Sistema de Protección de Rutas

### ProtectedRoute (src/components/auth/ProtectedRoute.tsx)
Componente que protege rutas basándose en autenticación y roles:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'company' | 'student')[];
}
```

#### Funcionalidades:
- **Verificación de autenticación**: Redirección a login si no está autenticado
- **Verificación de roles**: Redirección si el rol no está permitido
- **Estado de carga**: Muestra spinner mientras verifica autenticación
- **Preservación de ubicación**: Guarda la ruta original para redirección post-login

## 📊 Dashboards por Rol

### Dashboard del Estudiante (src/pages/Dashboard/Student/StudentDashboard.tsx)
Dashboard principal con métricas clave:

#### Tarjetas de Información:
- **Horas Acumuladas**: Experiencia en proyectos (156 horas mock)
- **GPA Actual**: Promedio académico (4.2 mock)
- **Proyectos Disponibles**: Oportunidades activas (12 mock)
- **Mis Aplicaciones**: Aplicaciones en proceso (3 mock)
- **Strikes**: Sistema de advertencias (2/3 mock)
- **Proyectos Activos**: Proyectos en curso (2 mock)
- **Próximas Fechas**: Eventos y deadlines
- **Últimas Evaluaciones**: Evaluaciones recientes

#### Sistema de Strikes:
- **Lógica de colores**: Verde (0), Amarillo (1), Naranja (2), Rojo (3)
- **Mensajes dinámicos**: Advertencias según cantidad de strikes
- **Máximo 3 strikes**: Sistema de control de calidad

### Dashboard del Administrador (src/pages/Dashboard/Admin/AdminDashboard.tsx)
Panel de control con métricas del sistema:

#### Tarjetas de Resumen:
- **Total Usuarios**: 150 usuarios registrados
- **Empresas**: 25 empresas activas
- **Estudiantes**: 120 estudiantes activos
- **Proyectos**: 45 proyectos activos
- **Postulaciones**: 87 postulaciones realizadas
- **Alertas Pendientes**: Sistema de notificaciones críticas

#### Sistema de Alertas:
- **Lista dinámica**: Muestra hasta 3 alertas principales
- **Contador**: Indica total de alertas pendientes
- **Iconos visuales**: Indicadores de tipo de alerta
- **Truncamiento**: "+N más..." para alertas adicionales

## 🎯 Funcionalidades por Rol

### Funcionalidades del Estudiante
1. **Dashboard Personal**: Métricas de rendimiento y estado
2. **Gestión de Perfil**: Información personal y académica
3. **Exploración de Proyectos**: Búsqueda y aplicación a proyectos
4. **Seguimiento de Aplicaciones**: Estado de postulaciones
5. **Gestión de Proyectos**: Proyectos asignados y en curso
6. **Sistema de Evaluaciones**: Feedback y calificaciones
7. **Calendario**: Organización de actividades y deadlines
8. **Cuestionario API**: Evaluación de habilidades técnicas
9. **Resultados API**: Análisis de rendimiento técnico

### Funcionalidades del Administrador
1. **Dashboard de Control**: Métricas globales del sistema
2. **Gestión de Usuarios**: CRUD completo de usuarios
3. **Validación de Horas**: Aprobación de horas de práctica
4. **Gestión de Empresas**: Administración de empresas registradas
5. **Gestión de Estudiantes**: Control de estudiantes y sus estados
6. **Gestión de Proyectos**: Administración de proyectos del sistema
7. **Gestión de Evaluaciones**: Control de evaluaciones y feedback
8. **Notificaciones Masivas**: Envío de comunicaciones a usuarios
9. **Configuración de Plataforma**: Ajustes del sistema

### Funcionalidades de la Empresa
1. **Dashboard Empresarial**: Métricas de proyectos y postulantes
2. **Gestión de Proyectos**: Creación y administración de proyectos
3. **Gestión de Postulantes**: Revisión de candidatos
4. **Sistema de Evaluaciones**: Evaluación de estudiantes
5. **Calendario Empresarial**: Organización de actividades

## 🎨 Sistema de Diseño

### Material-UI (MUI) v7
- **Tema consistente**: Paleta de colores unificada
- **Componentes responsive**: Adaptación automática a diferentes pantallas
- **Iconografía**: Material Icons para consistencia visual
- **Tipografía**: Sistema de tipos escalable
- **Espaciado**: Sistema de espaciado consistente (theme.spacing)

### Paleta de Colores
- **Primary**: Azul principal para elementos de marca
- **Secondary**: Color secundario para acentos
- **Success**: Verde para estados positivos
- **Warning**: Amarillo/Naranja para advertencias
- **Error**: Rojo para errores y alertas críticas
- **Info**: Azul claro para información

### Responsive Design
- **Breakpoints**: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
- **Grid System**: Sistema de 12 columnas de Material-UI
- **Flexbox**: Layout flexible para diferentes tamaños de pantalla
- **Mobile-first**: Diseño optimizado para móviles

## 🔧 Configuración del Proyecto

### Vite (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### TypeScript (tsconfig.json)
- **Strict mode**: Habilitado para mayor seguridad de tipos
- **Path mapping**: Alias para imports más limpios
- **ES2020**: Target moderno para funcionalidades avanzadas
- **JSX**: React JSX transform

### ESLint + Prettier
- **Reglas estrictas**: Configuración para código limpio
- **TypeScript ESLint**: Reglas específicas para TS
- **React Hooks**: Reglas para hooks de React
- **Prettier**: Formateo automático de código

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo en puerto 3000

# Construcción
npm run build        # Build de producción
npm run preview      # Preview del build

# Linting y formateo
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 📱 Características Técnicas

### Performance
- **Code Splitting**: Carga lazy de componentes
- **Tree Shaking**: Eliminación de código no utilizado
- **Bundle Optimization**: Optimización automática de Vite
- **Fast Refresh**: Hot reload para desarrollo

### Accesibilidad
- **ARIA Labels**: Etiquetas para lectores de pantalla
- **Keyboard Navigation**: Navegación por teclado
- **Color Contrast**: Contraste adecuado para legibilidad
- **Semantic HTML**: Estructura semántica correcta

### SEO
- **Meta Tags**: Etiquetas meta para motores de búsqueda
- **Title Management**: Gestión dinámica de títulos
- **Structured Data**: Datos estructurados para SEO

## 🔄 Estado de Desarrollo

### ✅ Completado
- Arquitectura base del proyecto
- Sistema de autenticación (mock)
- Rutas protegidas y navegación
- Dashboard de estudiante completo
- Dashboard de administrador completo
- Sistema de layout responsive
- Componentes reutilizables
- Tipado TypeScript completo
- Configuración de build y desarrollo

### 🔄 En Desarrollo
- Dashboard de empresa
- Integración con backend real
- Sistema de notificaciones en tiempo real
- Optimizaciones de performance

### ⏳ Pendiente
- Backend API real
- Base de datos
- Sistema de mensajería
- Reportes avanzados
- Testing automatizado
- CI/CD pipeline

## 🐛 Solución de Problemas

### Errores Comunes
1. **Import errors**: Verificar rutas de importación
2. **Type errors**: Ejecutar `npm run type-check`
3. **Build errors**: Limpiar node_modules y reinstalar
4. **Port conflicts**: Cambiar puerto en vite.config.ts

### Debugging
- **React DevTools**: Para debugging de componentes
- **Redux DevTools**: Para debugging de estado (cuando se implemente)
- **Browser DevTools**: Para debugging de red y performance

## 📝 Notas de Desarrollo

### Mock Data
- Todos los datos son simulados para demostración
- Credenciales hardcodeadas para testing
- Estados de carga simulados
- Respuestas de API mockeadas

### Estructura de Datos
- Interfaces TypeScript bien definidas
- Separación clara entre tipos y lógica
- Extensibilidad para futuras integraciones

### Patrones de Diseño
- **Component Composition**: Composición de componentes
- **Custom Hooks**: Lógica reutilizable
- **Context API**: Estado global de autenticación
- **Protected Routes**: Seguridad de navegación

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Reglas de linting automáticas
- **Prettier**: Formateo automático
- **Conventional Commits**: Formato de commits estándar

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📞 Contacto
Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consultar el repositorio del proyecto.


Stack Tecnológico
Dependencias Principales
React 18.2.0: Framework principal con hooks y funcionalidades modernas
TypeScript 5.2.2: Tipado estático para mayor robustez del código
Vite 6.3.5: Build tool y servidor de desarrollo ultra-rápido
Material-UI (MUI) 7.1.1: Biblioteca de componentes UI con diseño Material
React Router DOM 6.22.1: Enrutamiento y navegación SPA
Formik 2.4.5 + Yup 1.6.1: Manejo de formularios y validación
Redux Toolkit 2.2.1 + React Redux 9.1.0: Gestión de estado global
Axios 1.6.7: Cliente HTTP para llamadas a API
Styled Components 6.1.8: CSS-in-JS para estilos dinámicos
Dependencias de Desarrollo
ESLint + Prettier: Linting y formateo de código
TypeScript ESLint: Reglas específicas para TypeScript
Vite Plugin React: Plugin para React en Vite

Credenciales de Prueba
El sistema incluye credenciales mock para testing:
Admin: admin@leanmaker.com / Admin123!
Empresa: empresa@leanmaker.com / Empresa123!
Estudiante: estudiante@leanmaker.com / Estudiante123!
Almacenamiento
localStorage: Persistencia de sesión del usuario
Context API: Estado global de autenticación
Protección de rutas: Redirección automática según rol


Rutas del Administrador
/dashboard/admin - Dashboard principal
/dashboard/admin/usuarios - Gestión de usuarios
/dashboard/admin/validacion-horas - Validación de horas de práctica
/dashboard/admin/perfil - Perfil del administrador
/dashboard/admin/notificaciones - Envío de notificaciones masivas
/dashboard/admin/gestion-empresas - Gestión de empresas
/dashboard/admin/gestion-estudiantes - Gestión de estudiantes
/dashboard/admin/gestion-proyectos - Gestión de proyectos
/dashboard/admin/gestion-evaluaciones - Gestión de evaluaciones
/dashboard/admin/configuracion-plataforma - Configuración del sistema
Rutas del Estudiante
/dashboard/student - Dashboard principal
/dashboard/student/profile - Perfil del estudiante
/dashboard/student/notifications - Notificaciones
/dashboard/student/available-projects - Proyectos disponibles
/dashboard/student/my-applications - Mis aplicaciones
/dashboard/student/my-projects - Mis proyectos
/dashboard/student/evaluations - Evaluaciones
/dashboard/student/calendar - Calendario de actividades
/dashboard/student/api-questionnaire - Cuestionario API
/dashboard/student/api-results - Resultados API
🎨 Componentes de Layout
DashboardLayout (src/components/layout/DashboardLayout/index.tsx)
Componente principal que proporciona la estructura base para todos los dashboards:
Características:
Sidebar persistente: Navegación lateral con 280px de ancho
AppBar responsive: Barra superior con menú de usuario
Navegación por roles: Menús específicos según el tipo de usuario
Responsive design: Adaptación móvil con drawer temporal
Outlet rendering: Renderizado de rutas hijas


Funcionalidades:
Verificación de autenticación: Redirección a login si no está autenticado
Verificación de roles: Redirección si el rol no está permitido
Estado de carga: Muestra spinner mientras verifica autenticación
Preservación de ubicación: Guarda la ruta original para redirección post-login
