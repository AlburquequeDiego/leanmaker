# 🎯 Base de Datos LeanMaker - Documentación Completa

## 📋 Resumen del Proyecto

**LeanMaker** es una plataforma que conecta estudiantes con empresas para realizar proyectos de práctica profesional. El sistema maneja tres tipos de usuarios: **Administradores**, **Empresas** y **Estudiantes**.

### 🎯 **Objetivo Principal**
Facilitar la conexión entre estudiantes universitarios y empresas para realizar proyectos reales, permitiendo a los estudiantes ganar experiencia práctica mientras las empresas obtienen talento joven y fresco.

## 🗂️ Estructura de la Base de Datos

### **Tablas Principales**
1. **users** - Usuarios del sistema (admins, empresas, estudiantes)
2. **admins** - Permisos y datos de administradores
3. **companies** - Información detallada de empresas
4. **students** - Perfiles completos de estudiantes
5. **projects** - Proyectos disponibles para postulación
6. **applications** - Postulaciones de estudiantes a proyectos
7. **assignments** - Asignaciones activas de estudiantes a proyectos
8. **work_hours** - Registro de horas trabajadas por estudiantes
9. **evaluations** - Evaluaciones de desempeño
10. **evaluation_categories** - Categorías de evaluación
11. **notifications** - Sistema de notificaciones
12. **strikes** - Sistema de strikes para mal comportamiento
13. **interviews** - Entrevistas entre empresas y estudiantes
14. **disciplinary_records** - Registro disciplinario

### **Vistas Optimizadas**
- `v_project_stats` - Estadísticas completas de proyectos
- `v_student_stats` - Estadísticas completas de estudiantes
- `v_evaluations_complete` - Evaluaciones con información detallada
- `v_admin_dashboard` - Dashboard administrativo con KPIs

### **Procedimientos Almacenados (si están implementados)**
- `sp_UpdateProjectStats` - Actualizar estadísticas de proyecto
- `sp_AssignStrike` - Asignar strike con validaciones
- `sp_CreateNotification` - Crear notificación automática
- `sp_ApproveWorkHours` - Aprobar horas trabajadas
- `sp_CompleteProject` - Completar proyecto


## 🔧 Características Técnicas

### **Constraints de Integridad**
- Validación de formato de email
- Límite de estudiantes por proyecto
- Una postulación por estudiante por proyecto
- Strike resuelto debe tener resolución
- Foreign keys con CASCADE solo donde es permitido por SQL Server (evitando multiple cascade paths)

### **Índices Optimizados**
- Índices en campos de búsqueda frecuente (email, status, api_level, etc.)
- Índices compuestos para consultas frecuentes
- Todos los índices se crean con verificación previa para evitar errores si ya existen

### **Validaciones de Negocio**
- API Levels: 1-4 (1=básico, 4=avanzado)
- Strikes: Máximo 10, 3 strikes = suspensión automática
- Ratings: 1-5 con decimales
- Estados: Validaciones específicas por entidad
- Fechas: Lógica temporal coherente

## 📊 Consultas de Prueba

```sql
-- Total de usuarios por rol
SELECT role, COUNT(*) AS cantidad FROM users GROUP BY role;

-- Total de estudiantes
SELECT COUNT(*) AS total_estudiantes FROM students;

-- Total de empresas
SELECT COUNT(*) AS total_empresas FROM companies;

-- Total de administradores
SELECT COUNT(*) AS total_admins FROM admins;

-- Listar los 10 usuarios más recientes
SELECT TOP 10 email, role, date_joined FROM users ORDER BY date_joined DESC;

-- Verificar que los estudiantes tengan correos válidos
SELECT email FROM users WHERE role = 'student' AND email NOT LIKE '%@inacap.cl'
    AND email NOT LIKE '%@duoc.cl'
    AND email NOT LIKE '%@uchile.cl'
    AND email NOT LIKE '%@usach.cl'
    AND email NOT LIKE '%@udec.cl'
    AND email NOT LIKE '%@usm.cl'
    AND email NOT LIKE '%@uv.cl'
    AND email NOT LIKE '%@uach.cl'
    AND email NOT LIKE '%@uc.cl'
    AND email NOT LIKE '%@puc.cl'
    AND email NOT LIKE '%@unab.cl';
```

## 🚀 Instalación y Configuración

### **Paso 1: Crear Esquema de Base de Datos**
Ejecuta el archivo de esquema en SSMS o tu herramienta favorita:
```sql
:r database/schema.sql
GO
```

### **Paso 2: Insertar Datos de Ejemplo**
Ejecuta el archivo de datos de prueba:
```sql
:r database/test_data_final.sql
GO
```

### **Paso 3: Verificar Instalación**
```sql
-- Verificar que todo esté correcto
SELECT 'Tablas' as tipo, COUNT(*) as cantidad FROM information_schema.tables WHERE table_type = 'BASE TABLE'
UNION ALL
SELECT 'Vistas', COUNT(*) FROM information_schema.views
UNION ALL
SELECT 'Procedimientos', COUNT(*) FROM information_schema.routines WHERE routine_type = 'PROCEDURE';
```

### **Paso 4: Probar Conexión y Datos**
```sql
-- Verificar usuarios creados
SELECT role, COUNT(*) as cantidad FROM users GROUP BY role;

-- Verificar empresas y estudiantes
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM students;
```

## 📈 Flujo de Trabajo Típico

1. Registro y aprobación de usuarios
2. Publicación y postulación a proyectos
3. Asignación y seguimiento de horas
4. Evaluaciones y notificaciones
5. Finalización y estadísticas

## 🔒 Seguridad y Validaciones

- Formato de email válido
- URLs con formato correcto
- Fechas lógicas y coherentes
- Estados válidos según contexto
- Límites de valores numéricos
- Integridad referencial y constraints únicos
- Foreign keys y cascadas controladas

## 🎯 Casos de Uso Principales

- **Administradores:** Gestionar usuarios, monitorear proyectos, revisar reportes, manejar strikes
- **Empresas:** Publicar proyectos, revisar postulaciones, aprobar horas, evaluar estudiantes
- **Estudiantes:** Buscar proyectos, postular, registrar horas, ver evaluaciones

## 📱 Integración con Frontend

- Endpoints REST documentados y alineados con la estructura de la base de datos
- Autenticación, proyectos, postulaciones, horas, evaluaciones, notificaciones

## 🚨 Troubleshooting Común

- Verificar servicio SQL Server y permisos
- Revisar constraints y claves foráneas
- Analizar índices y planes de ejecución para consultas lentas

## ✅ **Estado Actual: LISTO PARA DESARROLLO**

La base de datos está **completamente funcional** y lista para:
- Integración con Django (backend)
- Desarrollo de frontend (React/TypeScript)
- Testing completo con datos realistas
- Demo para profesores con credenciales de prueba

---

**¡La base de datos está lista para que el equipo comience a desarrollar! 🚀**
