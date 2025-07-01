# Configuración del Frontend - LeanMaker

## Pasos para Configurar el Frontend

### 1. Instalar Dependencias

```bash
cd Frontend
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y renómbralo:

```bash
cp env.example .env
```

Edita el archivo `.env` y asegúrate de que la URL del backend sea correcta:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Verificar Configuración

Ejecuta la verificación de tipos para asegurarte de que todo esté configurado correctamente:

```bash
npm run type-check
```

### 4. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 5. Probar la Conexión

Ve a `http://localhost:3000/test-connection` para verificar que la conexión con el backend funcione correctamente.

## Estructura de Archivos Corregidos

### Tipos TypeScript (`src/types/index.ts`)
- ✅ Tipos actualizados para coincidir con los modelos del backend
- ✅ Interfaces para User, Student, Company, Project, Application, etc.
- ✅ Tipos para respuestas de API
- ✅ Constante de las 10 universidades permitidas

### Servicios (`src/services/`)
- ✅ `auth.service.ts`: Servicio de autenticación corregido
- ✅ `api.service.ts`: Servicio de API con manejo de tokens JWT
- ✅ Manejo automático de refresh de tokens

### Hooks (`src/hooks/`)
- ✅ `useAuth.tsx`: Hook de autenticación corregido
- ✅ `useApi.ts`: Hook para llamadas a API

### Componentes (`src/components/`)
- ✅ `LoadingButton.tsx`: Componente de botón con loading
- ✅ `ProtectedRoute.tsx`: Protección de rutas por roles
- ✅ `DashboardLayout/index.tsx`: Layout del dashboard
- ✅ `TestConnection.tsx`: Prueba de conexión con backend

### Páginas (`src/pages/`)
- ✅ `Login/index.tsx`: Login corregido
- ✅ `Register/index.tsx`: Registro con las 10 universidades
- ✅ `Dashboard/index.tsx`: Dashboard principal
- ✅ `Home/index.tsx`: Página de inicio
- ✅ `ForgotPassword/index.tsx`: Recuperación de contraseña

### Configuración (`src/config/`)
- ✅ `api.config.ts`: Endpoints de API
- ✅ `theme.ts`: Tema de Material-UI

### Rutas (`src/routes/`)
- ✅ `index.tsx`: Configuración de rutas con protección
- ✅ Rutas específicas para cada rol (admin, student, company)

## Características Implementadas

### Autenticación
- ✅ Login con email y contraseña
- ✅ Registro con validación de universidades
- ✅ Manejo de tokens JWT
- ✅ Refresh automático de tokens
- ✅ Logout
- ✅ Protección de rutas por roles

### Interfaz de Usuario
- ✅ Material-UI con tema personalizado
- ✅ Diseño responsive
- ✅ Navegación por roles
- ✅ Formularios con validación (Formik + Yup)
- ✅ Componentes de loading y error

### Integración con Backend
- ✅ Llamadas a API REST
- ✅ Manejo de errores
- ✅ Interceptores para tokens
- ✅ Tipos TypeScript coincidentes

### Universidades Permitidas
- ✅ Validación de las 10 universidades chilenas
- ✅ Selector en el formulario de registro
- ✅ Constante exportada para reutilización

## Pruebas

### 1. Prueba de Conexión
```bash
# Ve a http://localhost:3000/test-connection
# Debería mostrar "¡Conexión exitosa!"
```

### 2. Prueba de Registro
```bash
# Ve a http://localhost:3000/register
# Prueba registrar un estudiante con una de las 10 universidades
```

### 3. Prueba de Login
```bash
# Ve a http://localhost:3000/login
# Usa las credenciales de prueba del backend
```

### 4. Prueba de Dashboard
```bash
# Después del login, deberías ser redirigido al dashboard
# correspondiente a tu rol
```

## Solución de Problemas

### Error de Conexión
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa la configuración en `vite.config.ts`
- Verifica las variables de entorno

### Error de Tipos
```bash
npm run type-check
```

### Error de Linting
```bash
npm run lint
```

### Limpiar Cache
```bash
npm run clean
npm install
```

## Notas Importantes

1. **Backend Requerido**: El frontend necesita que el backend Django esté corriendo
2. **Base de Datos**: Asegúrate de que la base de datos Azure esté configurada
3. **Migraciones**: Verifica que las migraciones del backend estén aplicadas
4. **Usuarios de Prueba**: Usa el comando `python manage.py create_test_users` para crear usuarios de prueba 