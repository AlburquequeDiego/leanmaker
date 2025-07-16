# 🚀 Tutorial Leanmaker - Guía Completa de Instalación

Este tutorial te guiará paso a paso para hacer funcionar el proyecto Leanmaker en tu entorno local. **La base de datos ya está configurada y accesible desde tu IP pública.**




-



## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Python 3.12** (o superior)
- **Node.js 18+** y **npm**
- **Git** (para clonar el repositorio)
- **Acceso a la base de datos SQL Server** (ya configurado)
- **https://visualstudio.microsoft.com/es/visual-cpp-build-tools/** descargar c++
-**https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server** descargar el ODBC for sql server  

---



PRIMERO ENTRA AL BACKEND: 

## cd Backend 

antes de tienes que Elimina el entorno virtual actual:
En la carpeta Backend, elimina la carpeta venv312 (puedes hacerlo desde el explorador de archivos o con este comando en PowerShell):
Remove-Item -Recurse -Force venv312

## Crea un nuevo entorno virtual:
python -m venv venv312

## Actívalo:
venv312\Scripts\activate

## Instala setuptools primero (base para otras dependencias):
pip install setuptools

## Instala las dependencias base:
pip install -r requirements.txt

## Desinstala el backend antiguo e instala el recomendado:
pip uninstall django-mssql-backend
pip install mssql-django

## Ahora puedes hacer las migraciones correctamente:
python manage.py migrate


###  Crear superusuario (opcional)

python manage.py createsuperuser


###  Iniciar el servidor backend

python manage.py runserver


✅ **Backend funcionando en:** http://127.0.0.1:8000

---

## ⚛️ Paso 3: Configurar y Ejecutar el Frontend (React + Vite)

### 3.1 Abrir nueva terminal y navegar al frontend
```bash
cd Frontend
```

### 3.2 Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 3.3 Iniciar el servidor frontend
```bash
npm run dev
```

✅ **Frontend funcionando en:** http://localhost:3000

---

## 🔗 Paso 4: Verificar Conexiones

### URLs importantes:
- **Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:8000
- **Admin Django:** http://127.0.0.1:8000/admin
- **Documentación API:** http://127.0.0.1:8000/api/schema/

### Verificar que todo funciona:
1. Abre http://localhost:3000 en tu navegador
2. Deberías ver la página de login del sistema
3. Prueba hacer login con las credenciales que te proporcionaron

---

## 🛠️ Solución de Problemas Comunes

### Error en el frontend: "npm install"
```bash
# Si hay problemas de dependencias, usa:
npm install --legacy-peer-deps
```

### Error en el backend: "Module not found"
```bash
# Asegúrate de estar en el entorno virtual:
venv312\Scripts\activate  # Windows
source venv312/bin/activate  # Linux/Mac
```

### Error de conexión a la base de datos
- Verifica que tu IP tenga acceso a la base de datos SQL Server
- Contacta al administrador si no puedes conectarte

### Puerto ocupado
```bash
# Si el puerto 8000 está ocupado:
python manage.py runserver 8000

# Si el puerto 3000 está ocupado:
npm run dev -- --port 3000
```

---

## 📚 Comandos Útiles

### Backend
```bash
# Ver logs del servidor
python manage.py runserver --verbosity 2

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Shell de Django
python manage.py shell
```

### Frontend
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 🔐 Autenticación y APIs

### Login
```bash
POST http://127.0.0.1:8000/api/auth/login/
{
    "email": "tu_email@ejemplo.com",
    "password": "tu_password"
}
```

### Usar token en requests
```bash
Authorization: Bearer <tu_token_jwt>
```

---

## 📝 Notas para Desarrollo

1. **Siempre mantén ambos servidores corriendo:**
   - Backend en puerto 8000
   - Frontend en puerto 3000

2. **Para desarrollo en equipo:**
   - Usa el entorno virtual del backend
   - Usa `--legacy-peer-deps` en npm
   - Comunica cambios en la base de datos

3. **Buenas prácticas:**
   - Haz commit de tus cambios regularmente
   - Prueba las APIs antes de hacer cambios
   - Documenta nuevos endpoints

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs** del servidor backend y frontend
2. **Verifica la conexión** a la base de datos
3. **Consulta este tutorial** paso a paso
4. **Contacta al equipo** si el problema persiste

---

✅ **¡Listo! Tu entorno de desarrollo está configurado y funcionando.**

Ahora puedes desarrollar y probar Leanmaker en tu máquina local.


terminar con la logica de las interfaces 
probarlo en front y el backend y la base de datos