# Base de Datos - LeanMaker

## Estructura

```
database/
├── schema.sql          # Esquema completo de la base de datos
├── seed_data.sql       # Datos de ejemplo para desarrollo
├── scripts/            # Scripts adicionales
│   └── create_database.sql
└── diagram/            # Diagramas de la base de datos
    └── database.diagram
```

## Tecnologías

- **SQL Server** - Sistema de gestión de base de datos
- **T-SQL** - Lenguaje de consulta transaccional

## Configuración

### Requisitos Previos

1. **SQL Server** instalado y configurado
2. **SQL Server Management Studio** (SSMS) o Azure Data Studio
3. **ODBC Driver 17 for SQL Server** instalado

### Instalación

1. **Crear la base de datos:**
   ```sql
   -- Ejecutar en SSMS o Azure Data Studio
   -- Abrir schema.sql y ejecutar todo el script
   ```

2. **Poblar con datos de ejemplo:**
   ```sql
   -- Ejecutar seed_data.sql para datos de prueba
   ```

3. **Verificar la instalación:**
   ```sql
   USE leanmaker_db;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM companies;
   SELECT COUNT(*) FROM students;
   SELECT COUNT(*) FROM projects;
   ```

## Estructura de Tablas

### Tablas Principales

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `users` | Usuarios del sistema | ~100 |
| `companies` | Empresas registradas | ~50 |
| `students` | Estudiantes registrados | ~200 |
| `projects` | Proyectos publicados | ~100 |
| `applications` | Postulaciones a proyectos | ~500 |
| `evaluations` | Evaluaciones de estudiantes | ~300 |
| `interviews` | Entrevistas programadas | ~150 |
| `strikes` | Reportes de incidencias | ~50 |
| `notifications` | Notificaciones del sistema | ~1000 |
| `ratings` | Calificaciones bidireccionales | ~200 |

### Relaciones Principales

- **users** → **companies** (1:1)
- **users** → **students** (1:1)
- **companies** → **projects** (1:N)
- **projects** → **applications** (1:N)
- **students** → **applications** (1:N)
- **projects** → **evaluations** (1:N)
- **projects** → **interviews** (1:N)
- **projects** → **strikes** (1:N)

## Vistas Útiles

### `v_project_stats`
Estadísticas de proyectos con información de la empresa:
```sql
SELECT * FROM v_project_stats;
```

### `v_student_stats`
Estadísticas de estudiantes con información personal:
```sql
SELECT * FROM v_student_stats;
```

## Procedimientos Almacenados

### `sp_GetProjectApplications(@ProjectId)`
Obtiene todas las postulaciones de un proyecto específico:
```sql
EXEC sp_GetProjectApplications 1;
```

### `sp_UpdateProjectStats(@ProjectId)`
Actualiza las estadísticas de un proyecto:
```sql
EXEC sp_UpdateProjectStats 1;
```

## Índices de Rendimiento

La base de datos incluye índices optimizados para:

- Búsquedas por email y username
- Filtros por estado de proyectos
- Consultas de postulaciones por proyecto/estudiante
- Evaluaciones por proyecto/estudiante
- Entrevistas por proyecto/estudiante
- Notificaciones por usuario

## Mantenimiento

### Backup
```sql
BACKUP DATABASE leanmaker_db 
TO DISK = 'C:\Backups\leanmaker_db.bak'
WITH FORMAT, COMPRESSION;
```

### Restore
```sql
RESTORE DATABASE leanmaker_db 
FROM DISK = 'C:\Backups\leanmaker_db.bak'
WITH REPLACE;
```

### Estadísticas de Rendimiento
```sql
-- Verificar fragmentación de índices
SELECT 
    OBJECT_NAME(ind.OBJECT_ID) AS TableName,
    ind.name AS IndexName,
    indexstats.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, NULL) indexstats
INNER JOIN sys.indexes ind ON ind.object_id = indexstats.object_id 
    AND ind.index_id = indexstats.index_id
WHERE indexstats.avg_fragmentation_in_percent > 10;
```

## Datos de Ejemplo

El archivo `seed_data.sql` incluye:

- **3 empresas** de ejemplo
- **5 estudiantes** con perfiles completos
- **5 proyectos** en diferentes estados
- **8 postulaciones** de ejemplo
- **3 evaluaciones** completadas
- **3 entrevistas** programadas
- **3 strikes** reportados
- **5 notificaciones** de ejemplo
- **6 calificaciones** bidireccionales

## Seguridad

### Usuarios de Base de Datos

```sql
-- Crear usuario para la aplicación
CREATE LOGIN leanmaker_app WITH PASSWORD = 'StrongPassword123!';
CREATE USER leanmaker_app FOR LOGIN leanmaker_app;

-- Asignar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO leanmaker_app;
GRANT EXECUTE ON SCHEMA::dbo TO leanmaker_app;
```

### Encriptación

```sql
-- Habilitar encriptación de datos sensibles
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'MasterKeyPassword123!';
CREATE CERTIFICATE LeanMakerCert WITH SUBJECT = 'LeanMaker Certificate';
```

## Monitoreo

### Consultas de Monitoreo

```sql
-- Conexiones activas
SELECT * FROM sys.dm_exec_sessions WHERE database_id = DB_ID('leanmaker_db');

-- Consultas lentas
SELECT TOP 10 
    qs.sql_handle,
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count as avg_elapsed_time,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) as statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;
``` 