# 🚀 LEANMAKER - Plataforma de Gestión de Proyectos Académicos

## 📋 ÍNDICE
1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Configuración del Backend](#configuración-del-backend)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Ejecución de Servidores](#ejecución-de-servidores)
7. [Modificaciones y Personalización](#modificaciones-y-personalización)
8. [Solución de Problemas](#solución-de-problemas)
9. [APIs Disponibles](#apis-disponibles)
10. [Funcionalidades Implementadas](#funcionalidades-implementadas)

---

## 🛠️ REQUISITOS PREVIOS

### Software Necesario:
- **Python 3.12** (versión específica para compatibilidad)
- **Node.js 18+** y npm
- **SQL Server** (ya configurado en tu entorno)
- **Git** para control de versiones

### Verificar Instalaciones:
```bash
python --version  # Debe mostrar Python 3.12.x
node --version   # Debe mostrar v18.x o superior
npm --version    # Debe mostrar 9.x o superior
```

**URLs de Verificación:**
- http://localhost:8000/admin/ - Panel de administración
- http://localhost:8000/api/health/ - Health check
- http://localhost:8000/api/config/ - Configuración de APIs

---

#### **Backend (http://localhost:8000)**
- ✅ **Admin Panel**: http://localhost:8000/admin/
- ✅ **Health Check**: http://localhost:8000/api/health/
- ✅ **API Config**: http://localhost:8000/api/config/
- ✅ **API Docs**: http://localhost:8000/api/schema/

#### **Frontend (http://localhost:3000)**
- ✅ **Página Principal**: http://localhost:3000/
- ✅ **Login**: http://localhost:3000/login
- ✅ **Dashboard**: http://localhost:3000/dashboard

### 🔐 Credenciales de Prueba

| Rol | Email | Contraseña | URL de Acceso |
|-----|-------|------------|---------------|
| **Admin** | `admin@leanmaker.com` | `Admin123!` | http://localhost:3000/dashboard/admin |
| **Empresa** | `empresa@leanmaker.com` | `Empresa123!` | http://localhost:3000/dashboard/company |
| **Estudiante** | `estudiante@leanmaker.com` | `Estudiante123!` | http://localhost:3000/dashboard/student |

### 🛠️ Scripts Útiles

#### **Backend (Terminal 1)**
```bash
# Desarrollo
python manage.py runserver          # Servidor de desarrollo
python manage.py makemigrations     # Crear migraciones
python manage.py migrate            # Aplicar migraciones
python manage.py collectstatic      # Recolectar archivos estáticos

# Administración
python manage.py createsuperuser    # Crear superusuario
python manage.py shell              # Shell de Django
python manage.py dbshell            # Shell de base de datos
```

#### **Frontend (Terminal 2)**
```bash
# Desarrollo
npm run dev                         # Servidor de desarrollo
npm run build                       # Build de producción
npm run preview                     # Preview del build

# Mantenimiento
npm run lint                        # Verificar código
npm run type-check                  # Verificar tipos
npm run clean                       # Limpiar dependencias
```
