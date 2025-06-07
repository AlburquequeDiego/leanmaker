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



## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

