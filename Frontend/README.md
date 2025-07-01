# LeanMaker Frontend

Frontend de React/TypeScript para la plataforma LeanMaker.

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=LeanMaker
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se ejecutará en `http://localhost:3000`

### Construcción

```bash
npm run build
```

### Verificación de Tipos

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── common/         # Componentes comunes
│   ├── features/       # Componentes específicos de features
│   └── layout/         # Componentes de layout
├── config/             # Configuraciones
├── hooks/              # Hooks personalizados
├── pages/              # Páginas de la aplicación
├── routes/             # Configuración de rutas
├── services/           # Servicios de API
├── styles/             # Estilos y temas
└── types/              # Tipos TypeScript
```

## Características

- **Autenticación JWT**: Sistema completo de autenticación con tokens JWT
- **Roles de Usuario**: Admin, Estudiante y Empresa
- **Material-UI**: Interfaz moderna y responsive
- **TypeScript**: Tipado completo para mejor desarrollo
- **React Router**: Navegación entre páginas
- **Formik + Yup**: Manejo de formularios y validación
- **API Integration**: Integración completa con el backend Django

## Universidades Permitidas

El sistema solo permite registro de estudiantes de las siguientes 10 universidades chilenas:

1. Universidad de Chile
2. Pontificia Universidad Católica de Chile
3. Universidad de Concepción
4. Universidad Técnica Federico Santa María
5. Universidad de Santiago de Chile
6. Universidad Austral de Chile
7. Universidad de Valparaíso
8. Universidad de La Frontera
9. Universidad de Talca
10. Universidad de Antofagasta

## Interfaz de Usuario

### Admin (10 interfaces)
- Dashboard principal
- Gestión de usuarios
- Validación de horas
- Gestión de empresas
- Gestión de estudiantes
- Gestión de proyectos
- Gestión de evaluaciones
- Configuración de plataforma
- Perfil
- Notificaciones

### Empresa (10 interfaces)
- Dashboard principal
- Proyectos
- Postulaciones
- Buscar estudiantes
- Evaluaciones
- Entrevistas
- Calendario
- Strikes
- Perfil
- Notificaciones

### Estudiante (10 interfaces)
- Dashboard principal
- Proyectos disponibles
- Mis aplicaciones
- Mis proyectos
- Evaluaciones
- Calendario
- Cuestionario API
- Resultados API
- Perfil
- Notificaciones 