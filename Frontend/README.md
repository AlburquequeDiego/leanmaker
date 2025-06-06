# LeanMaker - Plataforma de Inserción Laboral

## Descripción
LeanMaker es una plataforma web diseñada para conectar estudiantes con oportunidades laborales reales. Facilita la participación de estudiantes en proyectos temporales y mejora su empleabilidad a través de la gestión de proyectos reales y prácticas laborales.

## Características Principales
- Sistema de autenticación multi-rol (Estudiantes, Empresas, Administradores)
- Dashboard personalizado según el rol del usuario
- Gestión de proyectos y aplicaciones
- Sistema de evaluaciones
- Notificaciones en tiempo real
- Calendario de actividades

## Estado Actual del Proyecto
El proyecto se encuentra en fase de desarrollo. Actualmente:
- ✅ Frontend básico implementado
- ✅ Sistema de autenticación (simulado)
- ✅ Rutas protegidas y navegación
- ✅ Dashboard de estudiante (UI básica)
- ⏳ Backend en desarrollo
- ⏳ Base de datos pendiente
- ⏳ Integración con API pendiente

## Tecnologías Utilizadas
- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Material-UI (MUI)
  - React Router v6
  - Formik + Yup (validación de formularios)
  - Context API (gestión de estado)

## Estructura del Proyecto
```
Frontend/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── auth/          # Componentes de autenticación
│   │   ├── common/        # Componentes comunes (botones, inputs, etc.)
│   │   ├── features/      # Componentes específicos de funcionalidades
│   │   └── layout/        # Componentes de estructura (DashboardLayout)
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.tsx    # Hook de autenticación
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Dashboard/     # Dashboards por rol
│   │   ├── Home/          # Página principal
│   │   ├── Login/         # Página de inicio de sesión
│   │   ├── Register/      # Página de registro
│   │   └── ForgotPassword/# Página de recuperación de contraseña
│   ├── routes/            # Configuración de rutas
│   ├── types/             # Definiciones de tipos TypeScript
│   ├── App.tsx           # Componente raíz
│   └── main.tsx          # Punto de entrada
```

## Roles de Usuario
1. **Estudiante**
   - Ver proyectos disponibles
   - Aplicar a proyectos
   - Gestionar aplicaciones
   - Ver evaluaciones
   - Acceder a calendario

2. **Empresa**
   - Publicar proyectos
   - Gestionar postulantes
   - Evaluar estudiantes
   - Gestionar calendario

3. **Administrador**
   - Gestionar usuarios
   - Gestionar empresas
   - Gestionar estudiantes
   - Gestionar proyectos
   - Configuración del sistema

## Instalación y Ejecución

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Pasos de Instalación
1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd Frontend
```

2. Instalar dependencias
```bash
npm install
# o
yarn install
```

3. Ejecutar en modo desarrollo
```bash
npm run dev
# o
yarn dev
```

4. Construir para producción
```bash
npm run build
# o
yarn build
```

## Estado de Desarrollo
### Completado
- ✅ Estructura base del proyecto
- ✅ Sistema de autenticación (simulado)
- ✅ Rutas protegidas
- ✅ UI de login y registro
- ✅ Dashboard de estudiante (UI básica)
- ✅ Recuperación de contraseña (UI)

### En Desarrollo
- 🔄 Integración con backend
- 🔄 Sistema de notificaciones
- 🔄 Gestión de proyectos
- 🔄 Sistema de evaluaciones

### Pendiente
- ⏳ Dashboard de empresa
- ⏳ Dashboard de administrador
- ⏳ Sistema de mensajería
- ⏳ Calendario de actividades
- ⏳ Reportes y estadísticas

## Notas de Desarrollo
- Actualmente el sistema usa datos simulados (mock data)
- La autenticación está implementada con localStorage
- Las rutas están protegidas según el rol del usuario
- El diseño sigue las guías de Material-UI

## Contribución
1. Clonar el repositorio Front-end.inicial
2. Crear una nueva rama para tu feature (`git add .`)
3. Realizar los cambios necesarios
4. Commit tus cambios (`git commit -m ' '`)
5. Push a la rama (`git push`)
6. Abrir un Pull Request hacia la rama main del repositorio Front-end.inicial

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto
[Información de contacto pendiente] 