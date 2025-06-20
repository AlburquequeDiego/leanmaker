# 🚀 TUTORIAL COMPLETO - LEANMAKER DESDE CERO

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Herramientas](#instalación-de-herramientas)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración del Backend](#configuración-del-backend)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Ejecutar el Proyecto](#ejecutar-el-proyecto)
7. [Probar la Aplicación](#probar-la-aplicación)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🛠️ Requisitos Previos

### Software Necesario:
- **Windows 10/11** (este tutorial está optimizado para Windows)
- **Python 3.12** o superior
- **Node.js 18** o superior
- **SQL Server** (Express o Developer Edition)
- **Git** para clonar el repositorio

### Conocimientos Básicos:
- Saber usar la línea de comandos (PowerShell/CMD)
- Conocimientos básicos de bases de datos
- Entender conceptos básicos de desarrollo web

---

## 🔧 Instalación de Herramientas

### Paso 1: Instalar Python 3.12

1. **Descargar Python:**
   - Ve a: https://www.python.org/downloads/
   - Descarga Python 3.12.x para Windows
   - **IMPORTANTE**: Marca la casilla "Add Python to PATH"

2. **Verificar instalación:**
   ```bash
   python --version
   # Debe mostrar: Python 3.12.x
   ```

### Paso 2: Instalar Node.js 18

1. **Descargar Node.js:**
   - Ve a: https://nodejs.org/
   - Descarga la versión LTS (18.x o superior)
   - Instala con configuración por defecto

2. **Verificar instalación:**
   ```bash
   node --version
   # Debe mostrar: v18.x.x
   
   npm --version
   # Debe mostrar: 9.x.x
   ```

### Paso 3: Instalar SQL Server

1. **Descargar SQL Server:**
   - Ve a: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Descarga SQL Server Express (gratuito)
   - O SQL Server Developer Edition (gratuito para desarrollo)

2. **Instalar SQL Server:**
   - Ejecuta el instalador
   - Selecciona "Basic" para instalación simple
   - Anota la contraseña del usuario SA
   - Completa la instalación

3. **Instalar SQL Server Management Studio (SSMS):**
   - Ve a: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
   - Descarga e instala SSMS
   - Conecta a tu instancia local de SQL Server

### Paso 4: Instalar Git

1. **Descargar Git:**
   - Ve a: https://git-scm.com/download/win
   - Descarga e instala Git para Windows

2. **Verificar instalación:**
   ```bash
   git --version
   # Debe mostrar: git version 2.x.x
   ```

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear la Base de Datos

1. **Abrir SQL Server Management Studio (SSMS)**

2. **Conectar al servidor:**
   - Server name: `localhost` o `.\SQLEXPRESS`
   - Authentication: `Windows Authentication`
   - Click "Connect"

3. **Crear la base de datos:**
   ```sql
   -- Ejecutar en SSMS
   CREATE DATABASE leanmaker_db;
   GO
   ```

4. **Verificar que se creó:**
   ```sql
   -- Verificar que la base de datos existe
   SELECT name FROM sys.databases WHERE name = 'leanmaker_db';
   ```

### Paso 2: Configurar Autenticación de Windows

1. **Verificar que tu usuario de Windows tiene permisos:**
   ```sql
   -- En SSMS, ejecutar:
   USE leanmaker_db;
   GO
   
   -- Crear usuario para tu cuenta de Windows
   CREATE USER [TU_USUARIO_WINDOWS] FOR LOGIN [TU_USUARIO_WINDOWS];
   GO
   
   -- Dar permisos de propietario
   ALTER ROLE db_owner ADD MEMBER [TU_USUARIO_WINDOWS];
   GO
   ```

2. **Reemplazar `TU_USUARIO_WINDOWS` con tu usuario real:**
   - Ejemplo: Si tu usuario es "Juan", sería `[Juan]`
   - O usar tu dominio: `[DOMINIO\Juan]`

---

## 🐍 Configuración del Backend

### Paso 1: Clonar el Repositorio

1. **Abrir PowerShell o CMD**

2. **Navegar a donde quieres el proyecto:**
   ```bash
   cd C:\Users\TuUsuario\Desktop
   ```

3. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd leanmaker
   ```

### Paso 2: Configurar Entorno Virtual

1. **Navegar al backend:**
   ```bash
   cd Backend
   ```

2. **Crear entorno virtual:**
   ```bash
   python -m venv venv312
   ```

3. **Activar entorno virtual:**
   ```bash
   venv312\Scripts\activate
   ```
   
   **Deberías ver `(venv312)` al inicio de la línea de comandos**

### Paso 3: Instalar Dependencias

1. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Si hay errores, instalar manualmente:**
   ```bash
   pip install django==3.2.23
   pip install djangorestframework==3.14.0
   pip install djangorestframework-simplejwt==5.3.0
   pip install django-cors-headers==3.14.0
   pip install mssql-django==1.5
   pip install pyodbc==5.2.0
   pip install drf-spectacular==0.26.5
   pip install drf-nested-routers==0.94.0
   pip install python-decouple==3.8
   pip install Pillow==9.5.0
   pip install django-filter==22.1
   ```

### Paso 4: Configurar Variables de Entorno

1. **Crear archivo `.env`:**
   - En la carpeta `Backend`, crear archivo llamado `.env`
   - Usar Notepad o cualquier editor de texto

2. **Añadir configuración:**
   ```env
   DEBUG=True
   SECRET_KEY=tu-clave-secreta-muy-segura-aqui-123456789
   DATABASE_URL=mssql://localhost/leanmaker_db?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
   ```

3. **Guardar el archivo**

### Paso 5: Ejecutar Migraciones

1. **Crear migraciones:**
   ```bash
   python manage.py makemigrations
   ```

2. **Aplicar migraciones:**
   ```bash
   python manage.py migrate
   ```

3. **Crear superusuario:**
   ```bash
   python manage.py createsuperuser
   ```
   
   **Sigue las instrucciones:**
   - Email: `admin@leanmaker.com`
   - Contraseña: `Admin123!Secure` (o una contraseña segura)
   - Confirmar contraseña: `Admin123!Secure`

### Paso 6: Verificar Backend

1. **Iniciar servidor:**
   ```bash
   python manage.py runserver
   ```

2. **Verificar que funciona:**
   - Abrir navegador
   - Ir a: `http://127.0.0.1:8000/admin/`
   - Iniciar sesión con las credenciales del superusuario
   - Deberías ver el panel de administración de Django

3. **Verificar APIs:**
   - Ir a: `http://127.0.0.1:8000/api/health/`
   - Deberías ver un error 401 (normal, requiere autenticación)
   - Ir a: `http://127.0.0.1:8000/api/schema/`
   - Deberías ver la documentación de las APIs

4. **Detener servidor:**
   - En la terminal: `Ctrl + C`

---

## ⚛️ Configuración del Frontend

### Paso 1: Navegar al Frontend

1. **Abrir nueva terminal (mantener la del backend abierta)**

2. **Navegar al frontend:**
   ```bash
   cd C:\Users\TuUsuario\Desktop\leanmaker\Frontend
   ```

### Paso 2: Instalar Dependencias

1. **Instalar dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Si hay errores, limpiar e instalar:**
   ```bash
   npm run clean
   npm install --legacy-peer-deps
   ```

### Paso 3: Verificar Configuración

1. **Verificar tipos TypeScript:**
   ```bash
   npm run type-check
   ```

2. **Si hay errores, ignorarlos por ahora (son normales con datos mock)**

---

## 🚀 Ejecutar el Proyecto

### Paso 1: Iniciar Backend

1. **En la primera terminal (Backend):**
   ```bash
   cd C:\Users\TuUsuario\Desktop\leanmaker\Backend
   venv312\Scripts\activate
   python manage.py runserver
   ```

2. **Verificar que está corriendo:**
   - Deberías ver: `Starting development server at http://127.0.0.1:8000/`
   - **NO cerrar esta terminal**

### Paso 2: Iniciar Frontend

1. **En la segunda terminal (Frontend):**
   ```bash
   cd C:\Users\TuUsuario\Desktop\leanmaker\Frontend
   npm run dev
   ```

2. **Verificar que está corriendo:**
   - Deberías ver: `Local: http://localhost:3000/`
   - **NO cerrar esta terminal**

### Paso 3: Verificar Ambos Servidores

1. **Backend:** `http://127.0.0.1:8000`
2. **Frontend:** `http://localhost:3000`

---

## 🧪 Probar la Aplicación

### Paso 1: Acceder al Frontend

1. **Abrir navegador**
2. **Ir a:** `http://localhost:3000`
3. **Deberías ver la página principal de Leanmaker**

### Paso 2: Probar Login

1. **Hacer clic en "Iniciar Sesión"**
2. **Usar credenciales de prueba:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@leanmaker.com` | `Admin123!` |
| **Empresa** | `empresa@leanmaker.com` | `Empresa123!` |
| **Estudiante** | `estudiante@leanmaker.com` | `Estudiante123!` |

### Paso 3: Explorar Dashboards

1. **Dashboard de Admin:**
   - Gestión de usuarios
   - Validación de horas
   - Configuración de plataforma

2. **Dashboard de Empresa:**
   - Gestión de proyectos
   - Revisión de postulantes
   - Evaluaciones

3. **Dashboard de Estudiante:**
   - Proyectos disponibles
   - Mis aplicaciones
   - Evaluaciones

### Paso 4: Verificar Backend

1. **Ir a:** `http://127.0.0.1:8000/admin/`
2. **Iniciar sesión con el superusuario que creaste**
3. **Explorar las tablas de la base de datos**

---

## 🔧 Solución de Problemas

### Error: "No module named 'django'"
```bash
# Activar entorno virtual
venv312\Scripts\activate

# Reinstalar dependencias
pip install -r requirements.txt
```

### Error: "Port already in use"
```bash
# Cambiar puerto del backend
python manage.py runserver 8001

# Cambiar puerto del frontend
# Editar Frontend/vite.config.ts
```

### Error: "Login failed for user"
```bash
# Verificar que SQL Server está corriendo
# Verificar permisos de usuario de Windows
# Usar autenticación de Windows
```

### Error: "npm install failed"
```bash
# Limpiar cache
npm run clean

# Instalar con legacy peer deps
npm install --legacy-peer-deps

# Si persiste, eliminar node_modules y reinstalar
rm -rf node_modules
npm install --legacy-peer-deps
```

### Error: "Database connection failed"
```bash
# Verificar que la base de datos existe
# Verificar que SQL Server está corriendo
# Verificar la cadena de conexión en .env
```

### Error: "Module not found"
```bash
# Verificar que estás en el directorio correcto
# Verificar que el entorno virtual está activado
# Reinstalar dependencias
```

---

## 📋 Checklist de Verificación

### ✅ Antes de Empezar:
- [ ] Python 3.12 instalado
- [ ] Node.js 18+ instalado
- [ ] SQL Server instalado y corriendo
- [ ] Git instalado
- [ ] Repositorio clonado

### ✅ Backend:
- [ ] Entorno virtual creado y activado
- [ ] Dependencias instaladas
- [ ] Archivo .env creado
- [ ] Base de datos creada
- [ ] Migraciones aplicadas
- [ ] Superusuario creado
- [ ] Servidor corriendo en puerto 8000

### ✅ Frontend:
- [ ] Dependencias instaladas
- [ ] Servidor corriendo en puerto 3000
- [ ] Página principal cargando
- [ ] Login funcionando

### ✅ Integración:
- [ ] Backend respondiendo
- [ ] Frontend conectado
- [ ] Credenciales de prueba funcionando
- [ ] Dashboards cargando

---

## 🎯 Próximos Pasos

Una vez que tengas todo funcionando:

1. **Explorar el código** para entender la estructura
2. **Probar todas las funcionalidades** por rol
3. **Conectar frontend con backend real** (reemplazar datos mock)
4. **Personalizar según necesidades**
5. **Añadir nuevas funcionalidades**

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar la sección de solución de problemas**
2. **Verificar que sigues todos los pasos exactamente**
3. **Comprobar que las versiones de software son correctas**
4. **Revisar logs de error en las terminales**

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí, tienes **Leanmaker funcionando completamente** con:
- ✅ Backend Django con APIs REST
- ✅ Frontend React con interfaces por rol
- ✅ Base de datos SQL Server conectada
- ✅ Sistema de autenticación funcionando

**¡Estás listo para desarrollar y personalizar el proyecto!** 🚀 