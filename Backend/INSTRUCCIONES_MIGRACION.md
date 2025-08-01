# Instrucciones para Aplicar el Esquema de Base de Datos Reestructurado

## Resumen

Este documento proporciona las instrucciones paso a paso para aplicar el esquema de base de datos completamente reestructurado del sistema LeanMaker.

## ⚠️ IMPORTANTE: Antes de Comenzar

### 1. **Backup Completo**
```bash
# Crear backup de la base de datos actual
python manage.py dumpdata > backup_antes_migracion.json

# Backup de archivos de migración existentes
cp -r */migrations/ migrations_backup/
```

### 2. **Verificar Entorno**
- Asegúrate de estar en el entorno virtual correcto
- Verifica que tienes permisos de escritura en la base de datos
- Confirma que no hay procesos activos usando la base de datos

## Paso 1: Preparación

### 1.1 Detener el Servidor
```bash
# Detener cualquier proceso de Django en ejecución
# Ctrl+C en la terminal donde está corriendo el servidor
```

### 1.2 Limpiar Migraciones Existentes
```bash
# Navegar al directorio del proyecto
cd Backend/

# Eliminar migraciones existentes (excepto __init__.py)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
```

### 1.3 Verificar Estructura
```bash
# Verificar que las migraciones se eliminaron correctamente
ls */migrations/
# Solo debe mostrar __init__.py en cada carpeta
```

## Paso 2: Aplicar Migraciones Reestructuradas

### 2.1 Ejecutar Migración Inicial
```bash
# Aplicar la migración inicial reestructurada
python manage.py migrate core 0001_initial_restructured
```

### 2.2 Verificar Aplicación
```bash
# Verificar que las tablas se crearon correctamente
python manage.py showmigrations

# Verificar estructura de la base de datos
python manage.py dbshell
# En SQLite: .tables
# En PostgreSQL: \dt
# En MySQL: SHOW TABLES;
```

### 2.3 Aplicar Migración de Campos JSON
```bash
# Migrar campos JSON de TextField a JSONField
python manage.py migrate core 0002_migrate_json_fields
```

### 2.4 Aplicar Datos Iniciales
```bash
# Poblar datos iniciales de configuración
python manage.py migrate core 0003_initial_data
```

## Paso 3: Verificación

### 3.1 Verificar Tablas Creadas
```bash
# Verificar que todas las tablas principales existen
python manage.py shell

# En el shell de Django:
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print([table[0] for table in tables])

# Deberías ver tablas como:
# - users
# - companies
# - students
# - projects
# - applications
# - work_hours
# - evaluations
# - notifications
# - interviews
# - calendar_events
# - strikes
# - areas
# - trl_levels
# - project_status
# - evaluation_categories
# etc.
```

### 3.2 Verificar Datos Iniciales
```bash
python manage.py shell

# Verificar áreas creadas
from areas.models import Area
print(Area.objects.all().values_list('name', flat=True))

# Verificar niveles TRL
from trl_levels.models import TRLLevel
print(TRLLevel.objects.all().values_list('level', 'name', flat=True))

# Verificar estados de proyecto
from project_status.models import ProjectStatus
print(ProjectStatus.objects.all().values_list('name', flat=True))

# Verificar categorías de evaluación
from evaluation_categories.models import EvaluationCategory
print(EvaluationCategory.objects.all().values_list('name', flat=True))
```

### 3.3 Verificar Índices
```bash
python manage.py shell

# Verificar índices creados
from django.db import connection
cursor = connection.cursor()

# Para SQLite
cursor.execute("SELECT name FROM sqlite_master WHERE type='index';")
indexes = cursor.fetchall()
print([index[0] for index in indexes])

# Deberías ver índices como:
# - users_email_idx
# - users_role_idx
# - projects_status_idx
# - applications_status_idx
# - work_hours_student_idx
# etc.
```

## Paso 4: Migración de Datos Existentes (Si Aplica)

### 4.1 Si Tienes Datos Existentes
Si tienes datos en la base de datos anterior, necesitarás migrarlos:

```bash
# Crear script de migración de datos
python manage.py shell

# Ejemplo de migración de usuarios existentes
from users.models import User
from companies.models import Empresa
from students.models import Estudiante

# Migrar usuarios existentes
# (Adaptar según la estructura anterior)
```

### 4.2 Verificar Integridad de Datos
```bash
# Verificar que no hay datos duplicados
python manage.py shell

# Verificar relaciones
from users.models import User
from companies.models import Empresa

# Verificar que cada empresa tiene un usuario asociado
empresas_sin_usuario = Empresa.objects.filter(user__isnull=True)
print(f"Empresas sin usuario: {empresas_sin_usuario.count()}")

# Verificar que cada estudiante tiene un usuario asociado
from students.models import Estudiante
estudiantes_sin_usuario = Estudiante.objects.filter(user__isnull=True)
print(f"Estudiantes sin usuario: {estudiantes_sin_usuario.count()}")
```

## Paso 5: Testing

### 5.1 Ejecutar Tests
```bash
# Ejecutar tests del sistema
python manage.py test

# Si hay tests específicos para modelos
python manage.py test users.tests
python manage.py test projects.tests
python manage.py test applications.tests
```

### 5.2 Verificar Funcionalidad Básica
```bash
# Crear superusuario para testing
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver

# Probar endpoints básicos en el navegador
# http://localhost:8000/admin/
# http://localhost:8000/api/
```

## Paso 6: Limpieza y Optimización

### 6.1 Limpiar Cache
```bash
# Limpiar cache de Django
python manage.py clearcache

# Limpiar archivos .pyc
find . -name "*.pyc" -delete
```

### 6.2 Optimizar Base de Datos
```bash
# Para SQLite
python manage.py dbshell
# En SQLite shell:
VACUUM;
ANALYZE;

# Para PostgreSQL
python manage.py dbshell
# En PostgreSQL shell:
VACUUM ANALYZE;

# Para MySQL
python manage.py dbshell
# En MySQL shell:
OPTIMIZE TABLE nombre_tabla;
```

## Paso 7: Documentación

### 7.1 Actualizar Documentación
```bash
# Generar documentación de modelos
python manage.py graph_models -a -o models_diagram.png

# Generar documentación de API (si usas drf-spectacular)
python manage.py spectacular --file schema.yml
```

### 7.2 Crear Reporte de Migración
```bash
# Crear reporte de lo que se migró
python manage.py shell

# Generar reporte de estadísticas
from django.db import connection
cursor = connection.cursor()

# Contar registros en cada tabla
tables = ['users', 'companies', 'students', 'projects', 'applications']
for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table};")
    count = cursor.fetchone()[0]
    print(f"{table}: {count} registros")
```

## Solución de Problemas

### Error: "Table already exists"
```bash
# Si hay conflictos con tablas existentes
python manage.py migrate --fake-initial
```

### Error: "No such table"
```bash
# Si faltan tablas, verificar migraciones
python manage.py showmigrations
python manage.py migrate --run-syncdb
```

### Error: "IntegrityError"
```bash
# Si hay problemas de integridad
python manage.py shell

# Verificar datos problemáticos
from django.db import IntegrityError
try:
    # Operación problemática
    pass
except IntegrityError as e:
    print(f"Error de integridad: {e}")
```

### Error: "JSONField not supported"
```bash
# Si tu versión de Django no soporta JSONField
pip install django-jsonfield
# O actualizar Django a una versión más reciente
pip install --upgrade django
```

## Rollback (En Caso de Problemas)

### 1. Restaurar Backup
```bash
# Restaurar base de datos desde backup
python manage.py loaddata backup_antes_migracion.json

# Restaurar migraciones
cp -r migrations_backup/* */migrations/
```

### 2. Limpiar y Reintentar
```bash
# Limpiar base de datos
python manage.py flush

# Reintentar migración desde el principio
```

## Verificación Final

### Checklist de Verificación
- [ ] Todas las tablas se crearon correctamente
- [ ] Los índices están presentes
- [ ] Los datos iniciales se cargaron
- [ ] Los campos JSON funcionan correctamente
- [ ] Las relaciones entre tablas son correctas
- [ ] Los tests pasan
- [ ] El servidor inicia sin errores
- [ ] La funcionalidad básica funciona

### Comandos de Verificación Final
```bash
# Verificar estado general
python manage.py check

# Verificar migraciones
python manage.py showmigrations

# Verificar base de datos
python manage.py dbshell
# Verificar tablas e índices

# Ejecutar tests completos
python manage.py test --verbosity=2

# Iniciar servidor y probar
python manage.py runserver
```

## Notas Importantes

1. **Siempre hacer backup antes de migrar**
2. **Probar en ambiente de desarrollo primero**
3. **Verificar cada paso antes de continuar**
4. **Documentar cualquier problema encontrado**
5. **Tener un plan de rollback preparado**

## Soporte

Si encuentras problemas durante la migración:

1. Revisar los logs de Django
2. Verificar la documentación del esquema reestructurado
3. Consultar los archivos de migración generados
4. Revisar la documentación de Django sobre migraciones

## Conclusión

Una vez completados todos los pasos, tendrás un esquema de base de datos completamente reestructurado, normalizado y optimizado que proporcionará:

- Mejor rendimiento
- Mayor integridad de datos
- Facilidad de mantenimiento
- Escalabilidad para futuras funcionalidades
- Compatibilidad con el frontend existente

El sistema estará listo para continuar con el desarrollo y crecimiento de LeanMaker. 