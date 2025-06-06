# Leanmaker 🚀

## Descripción
Leanmaker es una plataforma web de inserción laboral que conecta a estudiantes de INACAP con empresas a través de proyectos temporales. El objetivo principal es mejorar la empleabilidad de los estudiantes mediante la gestión de proyectos reales, prácticas laborales y la evaluación de su desempeño.

## Características Principales
- 🔐 Sistema de autenticación para estudiantes y empresas
- 📊 Dashboard personalizado para estudiantes y empresas
- 📝 Gestión de proyectos y postulaciones
- 📅 Calendario de entrevistas y reuniones
- 🔔 Sistema de notificaciones
- 📱 Diseño responsivo para escritorio y móvil

## Stack Tecnológico
### Frontend
- React 18+
- TypeScript
- React Router v6
- Formik + Yup para validación de formularios
- CSS Modules / Styled Components
- Context API / Redux (para gestión de estado)

### Backend (Futuro)
- Django
- SQL Server

## Estructura del Proyecto Frontend
```
src/
├── assets/           # Imágenes, iconos y recursos estáticos
├── components/       # Componentes reutilizables
│   ├── common/      # Componentes base (botones, inputs, etc.)
│   ├── layout/      # Componentes de estructura (header, footer, etc.)
│   └── features/    # Componentes específicos de funcionalidades
├── pages/           # Páginas principales de la aplicación
├── hooks/           # Custom hooks
├── services/        # Servicios y llamadas a API
├── utils/           # Utilidades y helpers
├── types/           # Definiciones de tipos TypeScript
├── styles/          # Estilos globales y temas
└── context/         # Contextos de React
```

## Requisitos Previos
- Node.js (v18 o superior)
- npm o yarn
- Git

## Instalación
1. Clonar el repositorio:
```bash
git clone https://github.com/AlburquequeDiego/leanmaker
cd leanmaker
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## Scripts Disponibles
- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter
- `npm run type-check`: Verifica los tipos de TypeScript

## Convenciones de Código
- Usar TypeScript para todo el código
- Seguir el patrón de componentes funcionales con hooks
- Implementar CSS Modules para estilos
- Mantener los componentes pequeños y reutilizables
- Documentar props y funciones importantes

## Contribución
1. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

Frontend 
1. Carpeta “src” (o “Frontend/src”)
Esta es la carpeta raíz de tu código fuente. Aquí se concentran todos los archivos que conforman tu aplicación (componentes, páginas, estilos, utilidades, etc.). Dentro de “src” se suelen organizar subcarpetas para separar responsabilidades:

2. Subcarpetas dentro de “src”
• “assets”
  – Aquí se guardan recursos estáticos (imágenes, iconos, fuentes, etc.).
  – Útil para importar (por ejemplo, un logo) en tus componentes.
“components”
  – Contiene todos los componentes reutilizables de tu aplicación.
  – Se suele dividir en subcarpetas (por ejemplo, “common” para botones, inputs, “layout” para header, footer, “features” para componentes específicos de alguna funcionalidad).
  – Es un buen punto de partida si quieres crear (o reutilizar) componentes de UI (por ejemplo, un botón, un formulario, un modal, etc.).
“pages”
  – Aquí se definen las páginas principales de tu aplicación (por ejemplo, “Home”, “Login”, “Register”, “Dashboard”).
  – Cada página suele ser un componente que “orquesta” (o “renderiza”) varios componentes (por ejemplo, en “Login” se usa un formulario, un botón, etc.).
  – Es un buen lugar para empezar a “maquetar” (o “diseñar”) la interfaz de cada vista.
“hooks”
  – Contiene “custom hooks” (funciones que encapsulan lógica reutilizable, por ejemplo, un hook para manejar formularios, un hook para llamar a una API, etc.).
  – Útil si quieres separar la lógica de tus componentes (por ejemplo, la validación de un formulario) en funciones independientes.
“services”
  – Aquí se suelen definir funciones (o “servicios”) que realizan llamadas a APIs externas (por ejemplo, un servicio para autenticar, un servicio para obtener datos de proyectos, etc.).
  – Es un buen lugar para “centralizar” la lógica de comunicación con el backend (o con cualquier API).
“utils”
  – Contiene funciones “de utilidad” (por ejemplo, formatear fechas, validar datos, etc.).
  – Útil para tener código “helper” que se reutiliza en varios lugares.
“types”
  – Aquí se definen (o “declaran”) los tipos (o “interfaces”) de TypeScript que se usan en tu proyecto.
  – Por ejemplo, si tienes un “User” o un “Project”, aquí defines qué propiedades (o “campos”) tienen.
“styles”
  – Aquí se guardan los estilos globales (por ejemplo, un archivo “global.css” o “theme.ts” si usas Material‑UI, Styled‑Components, etc.).
  – Útil para definir variables (colores, espaciados, fuentes, etc.) o “resetear” estilos (por ejemplo, con “normalize.css”).
“context”
  – Si usas Context API (o Redux) para manejar el estado global de tu aplicación, aquí se definen los “contextos” (o “providers”) que “envuelven” (o “proveen”) datos a tus componentes.
  – Por ejemplo, un “AuthContext” para guardar (o “compartir”) el estado de autenticación (si el usuario está logueado, su token, etc.).
3. Archivos “de configuración” (en la raíz de “Frontend”)
• “vite.config.ts”
  – Es el archivo de configuración de Vite (la herramienta que “compila” y “sirve” tu aplicación).
  – Aquí defines alias (por ejemplo, “@” para “src”), plugins (por ejemplo, el plugin de React), puerto del servidor, etc.
“tsconfig.json” (y “tsconfig.node.json”)
  – Son archivos de configuración de TypeScript.
  – Definen reglas (por ejemplo, “strict”, “esModuleInterop”, “jsx”, “moduleResolution”, etc.) y “paths” (alias) para que TypeScript “entienda” tu código.
“package.json”
  – Contiene la lista de dependencias (y “devDependencies”) de tu proyecto, así como “scripts” (por ejemplo, “npm run dev”, “npm run build”, “npm run lint”, etc.).
  – Es el “manifesto” de tu proyecto (versión, nombre, scripts, etc.).
¿Por dónde empezar a desarrollar tus interfaces?
• Paso 1: Revisa (o “maqueta”) la interfaz de cada “página” (por ejemplo, “Login”, “Register”, “Dashboard”) en la carpeta “pages”.
  – Cada página suele “orquestar” (o “renderizar”) varios componentes (por ejemplo, un formulario, un botón, un “layout” (header, footer, sidebar), etc.).
  – Puedes empezar “dibujando” (o “escribiendo”) el JSX (o “TSX”) de la página (por ejemplo, en “Login” un formulario con un input de email, un input de password, un botón “Iniciar Sesión”, etc.).
Paso 2: Si necesitas “reutilizar” (o “compartir”) componentes (por ejemplo, un botón, un input, un “card”, etc.), crea (o “extrae”) esos componentes en la carpeta “components” (por ejemplo, en “common” o “features”).
  – Por ejemplo, si en “Login” y “Register” usas un “TextField” (o un “Button”), puedes crear un componente “TextField” (o “Button”) en “components/common” y luego importarlo en ambas páginas.
Paso 3: Si tu página (o componente) necesita “estilos” (por ejemplo, CSS, CSS Modules, Styled‑Components, Material‑UI, etc.), puedes definirlos en la carpeta “styles” (o “inline” en el componente).
  – Por ejemplo, si usas Material‑UI, puedes “importar” (o “usar”) componentes como “Box”, “Typography”, “Button”, etc., y “estilizarlos” (o “personalizarlos”) con “sx” (o “styled”).
Paso 4: Si tu página (o componente) necesita “lógica” (por ejemplo, validar un formulario, llamar a una API, etc.), puedes “extraer” esa lógica en un “custom hook” (en la carpeta “hooks”) o en un “servicio” (en la carpeta “services”).
  – Por ejemplo, si en “Login” necesitas “enviar” (o “postear”) un formulario, puedes crear un “useLogin” (o “loginService”) que “llame” (o “fetch”) a tu API.
En resumen:
• La carpeta “src” (o “Frontend/src”) es el “corazón” de tu código.
Dentro de “src” tienes subcarpetas (por ejemplo, “assets”, “components”, “pages”, “hooks”, “services”, “utils”, “types”, “styles”, “context”) que “organizan” (o “separan”) responsabilidades.
Para “empezar” a desarrollar tus interfaces, revisa (o “maqueta”) cada “página” (en “pages”) y, si es necesario, “extrae” (o “reutiliza”) componentes (en “components”), estilos (en “styles”) o lógica (en “hooks” o “services”).
También es importante revisar (o “configurar”) archivos como “vite.config.ts”, “tsconfig.json” y “package.json” para que tu entorno de desarrollo (o “build”) funcione correctamente.






