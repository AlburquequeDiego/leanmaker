# 🚀 Instrucciones del Proyecto Leanmaker

## 📋 Descripción
Leanmaker es una plataforma integral para la gestión de proyectos, prácticas y vinculación entre empresas y estudiantes universitarios, desarrollada con React, TypeScript y Material-UI.

## 🛠️ Requisitos Previos

### Software Necesario
- **Node.js** (versión 18.0.0 o superior) ⚠️ **IMPORTANTE**
- **npm** (versión 9.0.0 o superior) ⚠️ **IMPORTANTE**
- **Git** (para clonar el repositorio)
- **Visual Studio Code** (recomendado) o cualquier editor de código

### ⚠️ PASO CRÍTICO: Actualizar Node.js y npm

**Si ya tienes Node.js instalado, verifica la versión:**
```bash
node --version
npm --version
```

**Si tu versión es menor a 18.0.0, ACTUALIZA AHORA:**

#### Windows:
1. Ve a https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador y sigue los pasos
4. Reinicia tu terminal/CMD

#### macOS:
```bash
# Si tienes Homebrew:
brew update
brew upgrade node

# O descarga desde https://nodejs.org/
```

#### Linux:
```bash
# Usando nvm (recomendado):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### Verificar Instalaciones
```bash
# Verificar Node.js (debe ser 18.0.0 o superior)
node --version

# Verificar npm (debe ser 9.0.0 o superior)
npm --version

# Verificar Git
git --version
```

## 📥 Instalación y Configuración

### Paso 1: Clonar el Repositorio
```bash
# Navegar al directorio donde quieres clonar el proyecto
cd /ruta/donde/quieres/el/proyecto

# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd leanmaker
```

### Paso 2: Navegar al Frontend
```bash
# Entrar al directorio del frontend
cd Frontend
```

### Paso 3: LIMPIAR CACHE Y NODE_MODULES (IMPORTANTE)
```bash
# Eliminar node_modules y package-lock.json si existen
rm -rf node_modules package-lock.json

# Limpiar cache de npm
npm cache clean --force
```

### Paso 4: Instalar Dependencias
```bash
# Instalar todas las dependencias del proyecto
npm install
```

**Si aparece algún error, ejecuta:**
```bash
# Forzar la instalación
npm install --force

# O usar legacy peer deps si hay conflictos
npm install --legacy-peer-deps
```

### Paso 5: Verificar la Instalación
```bash
# Verificar que todas las dependencias se instalaron correctamente
npm list --depth=0
```

## 🚀 Ejecutar el Proyecto

### Desarrollo Local
```bash
# Iniciar el servidor de desarrollo
npm run dev
```

**El proyecto se abrirá automáticamente en:** `http://localhost:5173`

### Otros Comandos Disponibles
```bash
# Construir para producción
npm run build

# Vista previa de la construcción
npm run preview

# Ejecutar linting
npm run lint

# Ejecutar linting con corrección automática
npm run lint:fix

# Verificar tipos de TypeScript
npm run type-check
```

## 📁 Estructura del Proyecto

```
Frontend/
├── public/                 # Archivos estáticos
│   ├── imagenes/          # Imágenes del proyecto
│   └── index.html         # HTML principal
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas principales
│   │   ├── Home/         # Página de inicio
│   │   ├── Dashboard/    # Panel de control
│   │   │   ├── Company/  # Dashboard de empresa
│   │   │   └── Student/  # Dashboard de estudiante
│   │   ├── Login/        # Página de login
│   │   └── Register/     # Página de registro
│   ├── contexts/         # Contextos de React
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios y APIs
│   ├── types/            # Definiciones de TypeScript
│   ├── utils/            # Funciones utilitarias
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── vite-env.d.ts     # Tipos de Vite
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración de TypeScript
├── vite.config.ts        # Configuración de Vite
└── .eslintrc.cjs         # Configuración de ESLint
```

## 🔧 Configuración del Editor (VS Code)

### Extensiones Recomendadas
1. **ES7+ React/Redux/React-Native snippets**
2. **TypeScript Importer**
3. **Prettier - Code formatter**
4. **ESLint**
5. **Material Icon Theme** (opcional, para iconos)

### Configuración de VS Code
Crear archivo `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Module not found" o "Cannot find module"
```bash
# SOLUCIÓN COMPLETA:
cd Frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### ❌ Error: "Port already in use"
```bash
# Cambiar puerto manualmente
npm run dev -- --port 3000
```

### ❌ Error: "TypeScript compilation failed"
```bash
# Verificar tipos
npm run type-check

# Limpiar cache de TypeScript
rm -rf node_modules/.cache
```

### ❌ Error: "BOM characters detected"
Si encuentras errores de BOM (Byte Order Mark):
1. Abrir el archivo en VS Code
2. Ir a "File" → "Save with Encoding" → "UTF-8"
3. Guardar el archivo

### ❌ Error: "Peer dependency conflicts"
```bash
# Usar legacy peer deps
npm install --legacy-peer-deps
```

### ❌ Error: "EACCES: permission denied"
```bash
# En Windows: Ejecutar CMD como administrador
# En macOS/Linux:
sudo npm install
```

### ❌ Error: "Network timeout" o "ECONNRESET"
```bash
# Cambiar registro de npm
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

### ❌ Error: "React is not defined" o errores de React
```bash
# Reinstalar React específicamente
npm install react react-dom @types/react @types/react-dom
```

### ❌ Error: "Material-UI components not found"
```bash
# Reinstalar Material-UI
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## 📱 Navegadores Soportados
- Chrome (recomendado)
- Firefox
- Safari
- Edge

## 🔒 Variables de Entorno
Si el proyecto requiere variables de entorno, crear archivo `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Leanmaker
```

## 📞 Soporte
Si encuentras problemas:

### 1. Verificar Versiones (OBLIGATORIO)
```bash
node --version  # Debe ser 18.0.0+
npm --version   # Debe ser 9.0.0+
```

### 2. Reinstalación Completa
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### 3. Verificar Errores
- Revisar la consola del navegador (F12)
- Verificar la consola de terminal para errores de compilación
- Contactar al equipo de desarrollo

## 🎯 Próximos Pasos
Una vez que el proyecto esté ejecutándose:
1. Explorar las diferentes páginas y funcionalidades
2. Revisar el código en `src/pages/` para entender la estructura
3. Familiarizarse con los componentes de Material-UI
4. Revisar la configuración de rutas en `App.tsx`

---

## ⚠️ RESUMEN RÁPIDO PARA COMPAÑEROS

**Si tienes problemas, sigue ESTOS PASOS EN ORDEN:**

1. **Actualiza Node.js a versión 18+** (https://nodejs.org/)
2. **Limpia todo:**
   ```bash



   cd Frontend && npm run dev



   rm -rf node_modules package-lock.json
   npm cache clean --force
   ```
3. **Reinstala:**
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Ejecuta:**
   ```bash
   npm run dev
   ```
