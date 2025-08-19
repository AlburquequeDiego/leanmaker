# 🧹 Instrucciones para Limpiar Todos los Datos de la Base de Datos

## ⚠️ ADVERTENCIA IMPORTANTE
**Este proceso eliminará TODOS los datos de tu base de datos de forma PERMANENTE.**
- ✅ Se mantienen: Tablas, relaciones, estructura de la base de datos
- ❌ Se eliminan: Todos los registros, usuarios, configuraciones
- 🔒 Se preservan: Solo usuarios administradores (si existen)

## 🚀 Opción 1: Script Completo (Recomendado)

### Paso 1: Navegar al directorio Backend
```bash
cd Backend
```

### Paso 2: Ejecutar el script de limpieza
```bash
python clear_all_data.py
```

### Paso 3: Confirmar la acción
El script te pedirá confirmación escribiendo 'SI'

### Paso 4: Verificar la limpieza
El script mostrará el progreso y confirmará cuando termine

## 🚀 Opción 2: Script Simple con Django

### Paso 1: Navegar al directorio Backend
```bash
cd Backend
```

### Paso 2: Ejecutar el script simple
```bash
python clear_data_simple.py
```

### Paso 3: Confirmar la acción
Escribir 'SI' cuando se solicite

## 🚀 Opción 3: Comando Directo de Django

### Paso 1: Navegar al directorio Backend
```bash
cd Backend
```

### Paso 2: Ejecutar comando flush
```bash
python manage.py flush --noinput
```

### Paso 3: Crear usuario administrador
```bash
python manage.py createsuperuser
```

## 🔧 Después de la Limpieza

### 1. Ejecutar migraciones (Recomendado)
```bash
python manage.py migrate
```

### 2. Crear usuario administrador (si no existe)
```bash
python manage.py createsuperuser
```

### 3. Verificar que el servidor funcione
```bash
python manage.py runserver
```

## 📊 Qué se Elimina

- **Usuarios**: Todos excepto administradores
- **Empresas**: Todas las empresas registradas
- **Estudiantes**: Todos los perfiles de estudiantes
- **Proyectos**: Todos los proyectos y aplicaciones
- **Evaluaciones**: Todas las evaluaciones y calificaciones
- **Notificaciones**: Todas las notificaciones
- **Horas de trabajo**: Todos los registros de horas
- **Entrevistas**: Todas las entrevistas programadas
- **Eventos de calendario**: Todos los eventos
- **Strikes**: Todos los strikes registrados
- **Cuestionarios**: Todas las respuestas
- **Niveles TRL**: Todos los niveles
- **Áreas**: Todas las áreas definidas
- **Estados de proyecto**: Todos los estados
- **Asignaciones**: Todas las asignaciones

## 📊 Qué se Mantiene

- **Estructura de la base de datos**
- **Todas las tablas**
- **Relaciones entre tablas**
- **Configuraciones de Django**
- **Migraciones aplicadas**
- **Usuarios administradores existentes**

## 🚨 Consideraciones de Seguridad

1. **Hacer backup antes de ejecutar**
2. **Verificar que estés en el entorno correcto**
3. **No ejecutar en producción sin confirmación**
4. **Tener acceso al servidor para recrear usuarios si es necesario**

## 🔍 Verificación Post-Limpieza

### 1. Verificar que las tablas existen
```bash
python manage.py dbshell
.tables
.quit
```

### 2. Verificar que no hay datos
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
from companies.models import Company
from students.models import Student

print(f"Usuarios: {User.objects.count()}")
print(f"Empresas: {Company.objects.count()}")
print(f"Estudiantes: {Student.objects.count()}")
```

### 3. Verificar que el servidor funciona
```bash
python manage.py runserver
```

## 🆘 Solución de Problemas

### Error: "No module named 'django'"
```bash
pip install -r requirements.txt
```

### Error: "Database is locked"
- Cerrar todas las conexiones a la base de datos
- Reiniciar el servidor Django
- Verificar que no hay otros procesos usando la BD

### Error: "Permission denied"
- Ejecutar como administrador
- Verificar permisos del directorio
- Verificar permisos de la base de datos

## 📞 Soporte

Si encuentras problemas durante la limpieza:
1. Revisar los logs de Django
2. Verificar la configuración de la base de datos
3. Consultar la documentación de Django
4. Contactar al equipo de desarrollo

---

**⚠️ RECUERDA: Esta operación es IRREVERSIBLE. Asegúrate de tener backups antes de proceder.**
