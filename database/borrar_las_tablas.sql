-- =====================================================
-- SCRIPT NUCLEAR - LIMPIEZA TOTAL DE BASE DE DATOS
-- Elimina ABSOLUTAMENTE TODO de la base de datos
-- Último recurso para empezar desde cero
-- =====================================================

-- SOLO USAR EN CASO DE EMERGENCIA
-- NO SE RECOMIENDA USAR ESTE SCRIPT
-- SOLO USAR EN CASO DE EMERGENCIA
-- NO SE RECOMIENDA USAR ESTE SCRIPT
-- SOLO USAR EN CASO DE EMERGENCIA
-- NO SE RECOMIENDA USAR ESTE SCRIPT
-- SOLO USAR EN CASO DE EMERGENCIA
-- NO SE RECOMIENDA USAR ESTE SCRIPT


USE leanmaker_db;
GO

-- =====================================================
-- ELIMINAR TODAS LAS RESTRICCIONES FK
-- =====================================================

PRINT 'Eliminando TODAS las restricciones de claves foráneas...';

DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql + 
    'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + 
    ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';' + CHAR(13)
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id;

IF LEN(@sql) > 0
BEGIN
    EXEC sp_executesql @sql;
    PRINT 'Todas las restricciones FK eliminadas.';
END

-- =====================================================
-- ELIMINAR TODAS LAS TABLAS DINÁMICAMENTE
-- =====================================================

PRINT 'Eliminando TODAS las tablas...';

DECLARE @dropTableSQL NVARCHAR(MAX) = '';

SELECT @dropTableSQL = @dropTableSQL + 
    'IF OBJECT_ID(''' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ''', ''U'') IS NOT NULL ' +
    'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ';' + CHAR(13)
FROM sys.tables t
WHERE t.is_ms_shipped = 0;

IF LEN(@dropTableSQL) > 0
BEGIN
    EXEC sp_executesql @dropTableSQL;
    PRINT 'Todas las tablas eliminadas.';
END

-- =====================================================
-- ELIMINAR TODAS LAS VISTAS
-- =====================================================

PRINT 'Eliminando TODAS las vistas...';

DECLARE @dropViewSQL NVARCHAR(MAX) = '';

SELECT @dropViewSQL = @dropViewSQL + 
    'IF OBJECT_ID(''' + QUOTENAME(SCHEMA_NAME(v.schema_id)) + '.' + QUOTENAME(v.name) + ''', ''V'') IS NOT NULL ' +
    'DROP VIEW ' + QUOTENAME(SCHEMA_NAME(v.schema_id)) + '.' + QUOTENAME(v.name) + ';' + CHAR(13)
FROM sys.views v;

IF LEN(@dropViewSQL) > 0
BEGIN
    EXEC sp_executesql @dropViewSQL;
    PRINT 'Todas las vistas eliminadas.';
END

-- =====================================================
-- ELIMINAR TODOS LOS PROCEDIMIENTOS ALMACENADOS
-- =====================================================

PRINT 'Eliminando TODOS los procedimientos almacenados...';

DECLARE @dropProcSQL NVARCHAR(MAX) = '';

SELECT @dropProcSQL = @dropProcSQL + 
    'IF OBJECT_ID(''' + QUOTENAME(SCHEMA_NAME(p.schema_id)) + '.' + QUOTENAME(p.name) + ''', ''P'') IS NOT NULL ' +
    'DROP PROCEDURE ' + QUOTENAME(SCHEMA_NAME(p.schema_id)) + '.' + QUOTENAME(p.name) + ';' + CHAR(13)
FROM sys.procedures p
WHERE p.is_ms_shipped = 0;

IF LEN(@dropProcSQL) > 0
BEGIN
    EXEC sp_executesql @dropProcSQL;
    PRINT 'Todos los procedimientos eliminados.';
END

-- =====================================================
-- ELIMINAR TODAS LAS FUNCIONES
-- =====================================================

PRINT 'Eliminando TODAS las funciones...';

DECLARE @dropFuncSQL NVARCHAR(MAX) = '';

SELECT @dropFuncSQL = @dropFuncSQL + 
    'IF OBJECT_ID(''' + QUOTENAME(SCHEMA_NAME(f.schema_id)) + '.' + QUOTENAME(f.name) + ''', ''FN'') IS NOT NULL ' +
    'DROP FUNCTION ' + QUOTENAME(SCHEMA_NAME(f.schema_id)) + '.' + QUOTENAME(f.name) + ';' + CHAR(13)
FROM sys.objects f
WHERE f.type IN ('FN', 'IF', 'TF') AND f.is_ms_shipped = 0;

IF LEN(@dropFuncSQL) > 0
BEGIN
    EXEC sp_executesql @dropFuncSQL;
    PRINT 'Todas las funciones eliminadas.';
END

-- =====================================================
-- ELIMINAR TODOS LOS ÍNDICES
-- =====================================================

PRINT 'Eliminando TODOS los índices...';

DECLARE @dropIndexSQL NVARCHAR(MAX) = '';

SELECT @dropIndexSQL = @dropIndexSQL + 
    'IF EXISTS (SELECT * FROM sys.indexes WHERE name = ''' + i.name + ''' AND object_id = OBJECT_ID(''' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ''')) ' +
    'DROP INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ';' + CHAR(13)
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.is_primary_key = 0 AND i.is_unique_constraint = 0 AND i.name IS NOT NULL;

IF LEN(@dropIndexSQL) > 0
BEGIN
    EXEC sp_executesql @dropIndexSQL;
    PRINT 'Todos los índices eliminados.';
END

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

PRINT '';
PRINT '=== VERIFICACIÓN NUCLEAR COMPLETADA ===';
PRINT 'Tablas restantes:';

SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Vistas restantes:';

SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'VIEW'
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Procedimientos restantes:';

SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS ProcedureName
FROM sys.procedures
WHERE is_ms_shipped = 0
ORDER BY name;

PRINT '';
PRINT 'Funciones restantes:';

SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS FunctionName
FROM sys.objects
WHERE type IN ('FN', 'IF', 'TF') AND is_ms_shipped = 0
ORDER BY name;

PRINT '';
PRINT '=== LIMPIEZA NUCLEAR COMPLETADA ===';
PRINT 'La base de datos está COMPLETAMENTE limpia.';
PRINT 'Ejecuta: python manage.py migrate'; 