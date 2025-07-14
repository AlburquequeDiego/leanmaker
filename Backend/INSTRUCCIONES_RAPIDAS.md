# 🚀 INSTRUCCIONES RÁPIDAS - LEANMAKER BACKEND

## ⚡ Configuración en 5 minutos

### 1. Prerrequisitos
- ✅ Python 3.12+ instalado
- ✅ SQL Server configurado
- ✅ Git instalado

### 2. Clonar y configurar
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd leanmaker/Backend

# Configuración automática
python setup.py
```

### 3. Configurar base de datos
1. Crear base de datos en SQL Server
2. Editar archivo `.env` con tus credenciales
3. Ejecutar migraciones (ya hecho por setup.py)

### 4. Ejecutar servidor
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Ejecutar servidor
python manage.py runserver
```

### 5. Acceder al sistema
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Admin**: http://127.0.0.1:8000/admin/
- 📊 **API**: http://127.0.0.1:8000/

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Ejecutar servidor
python manage.py runserver

# Shell de Django
python manage.py shell

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Ejecutar tests
python manage.py test
```

### Base de datos
```bash
# Crear superusuario
python manage.py createsuperuser

# Poblar con datos de ejemplo
python manage.py shell
exec(open('populate_all_tables_simple.py').read())

# Backup
python manage.py dumpdata > backup.json
```

### Utilidades
```bash
# Verificar código
black .
flake8 .
isort .

# Collect static
python manage.py collectstatic
```

---

## 📁 Estructura Importante

```
Backend/
├── core/                   # Configuración principal
├── users/                  # Usuarios y autenticación
├── companies/              # Gestión de empresas
├── students/               # Gestión de estudiantes
├── projects/               # Proyectos
├── applications/           # Aplicaciones
├── evaluations/            # Evaluaciones
├── notifications/          # Notificaciones
├── documents/              # Documentos
├── reports/                # Reportes
├── templates/              # Plantillas HTML
├── static/                 # Archivos estáticos
├── media/                  # Archivos subidos
├── .env                    # Variables de entorno
├── requirements.txt        # Dependencias
└── setup.py               # Script de configuración
```

---

## 🔐 Credenciales por Defecto

### Superusuario (creado por setup.py)
- **Email**: admin@leanmaker.com
- **Password**: admin123

### Usuarios de ejemplo (si usas populate)
- **Empresas**: company1@example.com a company50@example.com
- **Estudiantes**: student1@example.com a student50@example.com
- **Password**: password123

---

## 🐛 Problemas Comunes

### Error de conexión a SQL Server
```bash
# Verificar ODBC Driver
# Windows: Instalar Microsoft ODBC Driver 17 for SQL Server
# Linux: sudo apt-get install unixodbc-dev
```

### Error de Redis
```bash
# Instalar Redis
# Windows: Descargar desde https://redis.io/download
# Linux: sudo apt-get install redis-server
```

### Error de migraciones
```bash
python manage.py migrate --fake-initial
```

### Error de dependencias
```bash
pip install -r requirements.txt --upgrade
```

---

## 📞 Soporte

- 📧 **Email**: equipo@leanmaker.com
- 💬 **Slack**: #leanmaker-backend
- 📚 **Documentación**: README.md

---

## 🎯 Próximos Pasos

1. **Configurar frontend**: Ver carpeta `Frontend/`
2. **Configurar Celery**: Para tareas en segundo plano
3. **Configurar email**: Para notificaciones
4. **Configurar Redis**: Para cache y sesiones
5. **Configurar producción**: Cambiar DEBUG=False

---

**¡Listo! Tu backend está configurado y funcionando.** 🎉 