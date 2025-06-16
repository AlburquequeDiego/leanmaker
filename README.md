# Leanmaker 🚀

## Descripción
Leanmaker es una plataforma web de inserción laboral que conecta a estudiantes de INACAP con empresas a través de proyectos temporales. El objetivo principal es mejorar la empleabilidad de los estudiantes mediante la gestión de proyectos reales, prácticas laborales y la evaluación de su desempeño.

---

# ⚡ Guía Rápida de Instalación y Ejecución

## Requisitos Previos
- **Node.js 18+** y **npm 9+** (https://nodejs.org/)
- **Python 3.10+** (recomendado 3.10 o 3.11 para compatibilidad con dependencias)
- **Git**
- **Visual Studio Code** (opcional, recomendado)

## 1. Clonar el repositorio
```bash
# Clona el repositorio y entra a la carpeta
 git clone [URL_DEL_REPOSITORIO]
 cd leanmaker
```

## 2. Frontend (React)
```bash
cd Frontend
# Limpia dependencias previas (si existen)
rm -rf node_modules package-lock.json
npm cache clean --force
# Instala dependencias (usa siempre --legacy-peer-deps para evitar conflictos)
npm install --legacy-peer-deps
# Ejecuta el servidor de desarrollo
npm run dev
```
- Accede a: http://localhost:5173

## 3. Backend (Django)
```bash
cd Backend
# Crea y activa un entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instala dependencias (recomendado: primero Pillow binario)
pip install --upgrade pip
pip install --only-binary=:all: Pillow
pip install -r requirements.txt

# Ejecuta migraciones y el servidor (ajusta según tu estructura)
python manage.py migrate
python manage.py runserver
```
- Accede a: http://localhost:8000

## 4. Variables de entorno
- Copia y renombra `Backend/env.example` a `.env` y configura tus variables.

---

# 🐛 Solución de Problemas Frecuentes
- **Conflictos de dependencias en Node:**
  - Usa siempre `npm install --legacy-peer-deps`.
- **Error al instalar Pillow en Windows:**
  - Ejecuta primero: `pip install --only-binary=:all: Pillow`
  - Si falla, prueba con: `pip install Pillow==9.5.0`
- **Error de compilador C++ en Windows:**
  - Instala [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- **Error de puerto ocupado:**
  - Cambia el puerto: `npm run dev -- --port 3001`

---

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




