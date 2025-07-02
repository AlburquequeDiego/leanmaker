# 🛠️ Comandos Útiles - LeanMaker

## 🚀 Comandos de Inicio Rápido

### Iniciar todo el sistema
```bash
# Terminal 1 - Backend
cd Backend
venv312\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### Verificar estado del sistema
```bash
# Verificar backend
curl http://localhost:8000/api/

# Verificar frontend
curl http://localhost:5173/

# Verificar base de datos
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(f'Usuarios: {User.objects.count()}')"
```

## 🔧 Backend - Django

### Gestión de Entorno Virtual
```bash
# Crear entorno virtual
python -m venv venv312

# Activar (Windows)
venv312\Scripts\activate

# Activar (Linux/Mac)
source venv312/bin/activate

# Desactivar
deactivate

# Verificar dependencias
pip list
```

### Gestión de Dependencias
```bash
# Instalar dependencias
pip install -r requirements.txt

# Actualizar dependencias
pip install --upgrade -r requirements.txt

# Generar requirements.txt
pip freeze > requirements.txt

# Instalar nueva dependencia
pip install nombre-paquete
```

### Base de Datos
```bash
# Crear migraciones
python manage.py makemigrations

# Ver migraciones pendientes
python manage.py showmigrations

# Aplicar migraciones
python manage.py migrate

# Revertir migración específica
python manage.py migrate app_name 0001

# Resetear base de datos
python manage.py flush

# Backup de datos
python manage.py dumpdata > backup.json

# Restaurar datos
python manage.py loaddata backup.json

# Shell de base de datos
python manage.py dbshell
```

### Usuarios y Autenticación
```bash
# Crear superusuario
python manage.py createsuperuser

# Cambiar contraseña
python manage.py changepassword username

# Listar usuarios
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print([u.email for u in User.objects.all()])"
```

### Desarrollo
```bash
# Verificar configuración
python manage.py check

# Verificar configuración de producción
python manage.py check --deploy

# Shell de Django
python manage.py shell

# Servidor de desarrollo
python manage.py runserver

# Servidor en puerto específico
python manage.py runserver 8001

# Servidor accesible desde red
python manage.py runserver 0.0.0.0:8000
```

### Archivos Estáticos
```bash
# Recolectar archivos estáticos
python manage.py collectstatic

# Limpiar archivos estáticos
python manage.py collectstatic --clear

# Verificar archivos estáticos
python manage.py findstatic admin/css/base.css
```

### Testing
```bash
# Ejecutar todos los tests
python manage.py test

# Test de app específica
python manage.py test users

# Test con verbosidad
python manage.py test -v 2

# Test con cobertura
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Logs
```bash
# Ver logs en tiempo real
tail -f logs/django.log

# Limpiar logs
> logs/django.log
```

## ⚛️ Frontend - React

### Gestión de Dependencias
```bash
# Instalar dependencias
npm install

# Instalar nueva dependencia
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install --save-dev nombre-paquete

# Actualizar dependencias
npm update

# Ver dependencias obsoletas
npm outdated

# Limpiar cache
npm cache clean --force
```

### Desarrollo
```bash
# Servidor de desarrollo
npm run dev

# Servidor en puerto específico
npm run dev -- --port 3000

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Verificar tipos TypeScript
npm run type-check
```

### Testing
```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm run test -- --testNamePattern="Login"
```

### Linting y Formateo
```bash
# Verificar código
npm run lint

# Corregir problemas automáticamente
npm run lint:fix

# Formatear código
npm run format

# Verificar tipos
npm run type-check
```

### Build y Deploy
```bash
# Construir para producción
npm run build

# Analizar bundle
npm run build -- --analyze

# Construir con source maps
npm run build -- --sourcemap
```

## 🗄️ Base de Datos - SQL Server

### Conexión y Consultas
```sql
-- Conectar a la base de datos
USE leanmaker_db;

-- Ver todas las tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Ver estructura de tabla
EXEC sp_help 'users';

-- Ver datos de tabla
SELECT TOP 10 * FROM users;

-- Ver usuarios activos
SELECT email, is_active, date_joined FROM users WHERE is_active = 1;

-- Ver estudiantes
SELECT u.email, s.career, s.semester FROM users u 
JOIN students s ON u.id = s.user_id;

-- Ver empresas
SELECT u.email, c.name, c.industry FROM users u 
JOIN companies c ON u.id = c.user_id;
```

### Mantenimiento
```sql
-- Backup de base de datos
BACKUP DATABASE leanmaker_db TO DISK = 'C:\backup\leanmaker_backup.bak';

-- Restaurar base de datos
RESTORE DATABASE leanmaker_db FROM DISK = 'C:\backup\leanmaker_backup.bak';

-- Verificar integridad
DBCC CHECKDB('leanmaker_db');

-- Optimizar base de datos
DBCC SHRINKDATABASE('leanmaker_db');
```

## 🔍 Debugging

### Backend Debugging
```bash
# Debug con pdb
python manage.py shell
import pdb; pdb.set_trace()

# Debug con ipdb (mejor)
pip install ipdb
import ipdb; ipdb.set_trace()

# Ver variables de entorno
python manage.py shell -c "import os; print([k for k in os.environ.keys() if 'DJANGO' in k])"

# Ver configuración de base de datos
python manage.py shell -c "from django.conf import settings; print(settings.DATABASES)"
```

### Frontend Debugging
```bash
# Debug en navegador
# Abrir DevTools (F12) y usar console.log()

# Debug con React DevTools
# Instalar extensión en navegador

# Debug con Redux DevTools
# Instalar extensión en navegador
```

## 📊 Monitoreo

### Verificar Estado del Sistema
```bash
# Verificar puertos en uso
netstat -an | findstr :8000
netstat -an | findstr :5173

# Verificar procesos
tasklist | findstr python
tasklist | findstr node

# Verificar uso de memoria
wmic process where name="python.exe" get ProcessId,WorkingSetSize
wmic process where name="node.exe" get ProcessId,WorkingSetSize
```

### Logs y Monitoreo
```bash
# Ver logs de Django en tiempo real
tail -f Backend/logs/django.log

# Ver logs de npm
npm run dev 2>&1 | tee npm.log

# Verificar errores en consola del navegador
# Abrir DevTools > Console
```

## 🚀 Comandos de Producción

### Backend Producción
```bash
# Configurar variables de producción
export DEBUG=False
export ALLOWED_HOSTS=tu-dominio.com

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Aplicar migraciones
python manage.py migrate

# Iniciar con gunicorn
gunicorn leanmaker_backend.wsgi:application --bind 0.0.0.0:8000

# Iniciar con supervisor
sudo supervisorctl start leanmaker
```

### Frontend Producción
```bash
# Construir para producción
npm run build

# Servir con nginx
# Configurar nginx para servir archivos de dist/

# Deploy a Vercel
vercel --prod

# Deploy a Netlify
netlify deploy --prod
```

## 🔧 Mantenimiento

### Limpieza
```bash
# Limpiar cache de pip
pip cache purge

# Limpiar cache de npm
npm cache clean --force

# Limpiar archivos temporales
rm -rf Backend/staticfiles/*
rm -rf Frontend/node_modules/.cache

# Limpiar logs
> Backend/logs/django.log
```

### Backup
```bash
# Backup de base de datos
python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json

# Backup de código
git add .
git commit -m "Backup $(date +%Y%m%d_%H%M%S)"
git push origin main
```

## 📚 Comandos de Ayuda

### Ayuda de Django
```bash
python manage.py help
python manage.py help runserver
python manage.py help migrate
```

### Ayuda de npm
```bash
npm help
npm help run
npm help install
```

### Ayuda de Git
```bash
git help
git help commit
git help push
```

---

**💡 Tip**: Guarda estos comandos como favoritos para acceso rápido durante el desarrollo. 