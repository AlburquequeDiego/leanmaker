# 🎯 Base de Datos LeanMaker - Documentación Completa

## 📋 Resumen del Proyecto

**LeanMaker** es una plataforma que conecta estudiantes con empresas para realizar proyectos de práctica profesional. El sistema maneja tres tipos de usuarios: **Administradores**, **Empresas** y **Estudiantes**.

### 🎯 **Objetivo Principal**
Facilitar la conexión entre estudiantes universitarios y empresas para realizar proyectos reales, permitiendo a los estudiantes ganar experiencia práctica mientras las empresas obtienen talento joven y fresco.

## 🗂️ Estructura de la Base de Datos

### **Tablas Principales (13)**
1. **users** - Usuarios del sistema (admins, empresas, estudiantes)
2. **companies** - Información detallada de empresas
3. **students** - Perfiles completos de estudiantes
4. **projects** - Proyectos disponibles para postulación
5. **applications** - Postulaciones de estudiantes a proyectos
6. **assignments** - Asignaciones activas de estudiantes a proyectos
7. **work_hours** - Registro de horas trabajadas por estudiantes
8. **evaluations** - Evaluaciones de desempeño
9. **evaluation_categories** - Categorías de evaluación (técnico, puntualidad, comunicación)
10. **notifications** - Sistema de notificaciones
11. **strikes** - Sistema de strikes para mal comportamiento
12. **interviews** - Entrevistas entre empresas y estudiantes
13. **disciplinary_records** - Registro disciplinario

### **Vistas Optimizadas (4)**
- `v_project_stats` - Estadísticas completas de proyectos
- `v_student_stats` - Estadísticas completas de estudiantes
- `v_evaluations_complete` - Evaluaciones con información detallada
- `v_admin_dashboard` - Dashboard administrativo con KPIs

### **Procedimientos Almacenados (5)**
- `sp_UpdateProjectStats` - Actualizar estadísticas de proyecto
- `sp_AssignStrike` - Asignar strike con validaciones
- `sp_CreateNotification` - Crear notificación automática
- `sp_ApproveWorkHours` - Aprobar horas trabajadas
- `sp_CompleteProject` - Completar proyecto

## 👥 Usuarios del Sistema

### **1. Administradores (2 usuarios)**
- **admin@leanmaker.com** - Administrador Principal
- **supervisor@leanmaker.com** - Supervisor General
- **Contraseña**: `test123` (para ambos)

### **2. Empresas (10 empresas)**
| ID | Email | Empresa | Industria | Tamaño |
|----|-------|---------|-----------|---------|
| 3 | empresa@leanmaker.com | Tech Solutions Chile | Tecnología | Mediana |
| 4 | rrhh@innovatech.com | InnovaTech | IA/ML | Grande |
| 5 | manager@datasciencecorp.io | Data Science Corp | Consultoría | Mediana |
| 6 | admin@cybersecure.cl | CyberSecure | Ciberseguridad | Pequeña |
| 7 | info@mobilefirst.dev | Mobile First | Desarrollo Móvil | Mediana |
| 8 | hola@webmasters.com | WebMasters | Desarrollo Web | Pequeña |
| 9 | jobs@cloudservices.net | Cloud Services | Cloud Computing | Grande |
| 10 | support@fintechglobal.com | FinTech Global | Fintech | Mediana |
| 11 | contact@healthtech.co | HealthTech | Salud Digital | Pequeña |
| 12 | hiring@gamestudios.com | Game Studios | Gaming | Mediana |

### **3. Estudiantes (10 estudiantes)**
| ID | Email | Nombre | Carrera | Semestre | Estado |
|----|-------|--------|---------|----------|---------|
| 13 | estudiante@leanmaker.com | Juan Pérez | Ing. Civil Informática | 8 | Aprobado |
| 14 | maria.gomez@email.com | María Gómez | Ing. Civil Computación | 6 | Aprobado |
| 15 | carlos.lopez@email.com | Carlos López | Ing. Informática | 9 | Suspendido |
| 16 | ana.martinez@email.com | Ana Martínez | Diseño Gráfico | 7 | Aprobado |
| 17 | diego.hernandez@email.com | Diego Hernández | Periodismo | 8 | Aprobado |
| 18 | sofia.garcia@email.com | Sofía García | Ing. Comercial | 10 | Aprobado |
| 19 | javier.diaz@email.com | Javier Díaz | Ing. Civil Industrial | 8 | Aprobado |
| 20 | laura.fernandez@email.com | Laura Fernández | Psicología | 9 | Aprobado |
| 21 | pablo.moreno@email.com | Pablo Moreno | Ing. Civil Informática | 7 | Aprobado |
| 22 | valentina.romero@email.com | Valentina Romero | Ing. Computación | 8 | Aprobado |

**Contraseña para todos**: `test123`

## 🔧 Características Técnicas

### **Constraints de Integridad**
```sql
-- Validación de formato de email
CONSTRAINT CK_users_email_format CHECK (email LIKE '%_@__%.__%')

-- Límite de estudiantes por proyecto
CONSTRAINT CK_projects_current_vs_max CHECK (current_students <= max_students)

-- Una postulación por estudiante por proyecto
CONSTRAINT CK_applications_unique_student_project UNIQUE (project_id, student_id)

-- Strike resuelto debe tener resolución
CONSTRAINT CK_strikes_resolution_when_resolved CHECK (status != 'resolved' OR resolution IS NOT NULL)
```

### **Índices Optimizados**
```sql
-- Búsquedas rápidas por estado y nivel API
CREATE INDEX idx_projects_status_api ON projects(status, api_level);

-- Postulaciones por estado y fecha
CREATE INDEX idx_applications_status_date ON applications(status, applied_at);

-- Notificaciones no leídas
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = 0;

-- Horas pendientes de aprobación
CREATE INDEX idx_work_hours_pending ON work_hours(status) WHERE status = 'pending';
```

### **Validaciones de Negocio**
- **API Levels**: 1-4 (1=básico, 4=avanzado)
- **Strikes**: Máximo 10, 3 strikes = suspensión automática
- **Ratings**: 1-5 con decimales
- **Estados**: Validaciones específicas por entidad
- **Fechas**: Lógica temporal coherente

## 📊 Datos de Ejemplo Incluidos

### **Proyectos Activos (4)**
1. **Plataforma E-commerce React** - Tech Solutions Chile
2. **Motor de Recomendaciones IA** - InnovaTech
3. **Dashboard de Analytics** - Data Science Corp
4. **App de Telemedicina** - Mobile First

### **Postulaciones y Asignaciones**
- **5 postulaciones** con diferentes estados (aceptadas, pendientes, rechazadas)
- **4 asignaciones activas** con progreso real
- **15 horas trabajadas** registradas y aprobadas

### **Evaluaciones y Calificaciones**
- **5 evaluaciones completadas** con comentarios detallados
- **Sistema de ratings** funcionando
- **Categorías de evaluación** (técnico, puntualidad, comunicación)

## 🚀 Instalación y Configuración

### **Paso 1: Crear Esquema de Base de Datos**
```sql
-- Ejecutar el archivo de esquema
EXECUTE('database/schema.sql');
```

### **Paso 2: Insertar Datos de Ejemplo**
```sql
-- Ejecutar datos de prueba
EXECUTE('database/seed_data.sql');
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

### **Paso 4: Probar Conexión**
```sql
-- Verificar usuarios creados
SELECT role, COUNT(*) as cantidad FROM users GROUP BY role;

-- Verificar proyectos activos
SELECT title, status FROM projects WHERE status = 'open';
```

## 📈 Flujo de Trabajo Típico

### **1. Registro y Aprobación**
1. Empresa se registra → Admin aprueba
2. Estudiante se registra → Admin aprueba
3. Empresa publica proyecto → Admin revisa

### **2. Postulación y Asignación**
1. Estudiante postula a proyecto
2. Empresa revisa postulación
3. Empresa acepta/rechaza
4. Se crea asignación automáticamente

### **3. Desarrollo y Seguimiento**
1. Estudiante registra horas trabajadas
2. Empresa aprueba horas
3. Empresa evalúa desempeño
4. Sistema genera notificaciones

### **4. Finalización**
1. Proyecto se marca como completado
2. Se generan evaluaciones finales
3. Se actualizan estadísticas
4. Se liberan recursos

## 🔒 Seguridad y Validaciones

### **Validaciones Implementadas**
- ✅ **Formato de email** válido
- ✅ **URLs** con formato correcto
- ✅ **Fechas** lógicas y coherentes
- ✅ **Estados** válidos según contexto
- ✅ **Límites** de valores numéricos

### **Integridad Referencial**
- ✅ **Foreign keys** con CASCADE apropiado
- ✅ **Constraints únicos** donde corresponde
- ✅ **Validaciones de negocio** en triggers
- ✅ **Transacciones** para operaciones críticas

## 🎯 Casos de Uso Principales

### **Para Administradores**
- Gestionar usuarios (aprobar/rechazar)
- Monitorear proyectos activos
- Revisar reportes y estadísticas
- Manejar disputas y strikes

### **Para Empresas**
- Publicar proyectos
- Revisar postulaciones
- Aprobar horas trabajadas
- Evaluar estudiantes

### **Para Estudiantes**
- Buscar proyectos disponibles
- Postular a proyectos
- Registrar horas trabajadas
- Ver evaluaciones recibidas

## 📱 Integración con Frontend

### **Endpoints Principales Necesarios**
```typescript
// Autenticación
POST /api/auth/login
POST /api/auth/register

// Proyectos
GET /api/projects
POST /api/projects
GET /api/projects/{id}

// Postulaciones
POST /api/applications
GET /api/applications/student/{id}

// Horas trabajadas
POST /api/work-hours
GET /api/work-hours/student/{id}

// Evaluaciones
POST /api/evaluations
GET /api/evaluations/student/{id}
```

## 🚨 Troubleshooting Común

### **Problema: Error de conexión a SQL Server**
```sql
-- Verificar que el servicio esté corriendo
SELECT @@VERSION;

-- Verificar permisos de Windows Authentication
SELECT SYSTEM_USER, USER_NAME();
```

### **Problema: Datos no se insertan**
```sql
-- Verificar constraints
SELECT * FROM sys.check_constraints;

-- Verificar foreign keys
SELECT * FROM sys.foreign_keys;
```

### **Problema: Consultas lentas**
```sql
-- Verificar índices
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('projects');

-- Analizar plan de ejecución
SET STATISTICS IO ON;
SELECT * FROM projects WHERE status = 'open';
```

## ✅ **Estado Actual: LISTO PARA DESARROLLO**

La base de datos está **completamente funcional** y lista para:
- ✅ **Integración con Django** (backend)
- ✅ **Desarrollo de frontend** (React/TypeScript)
- ✅ **Testing completo** con datos realistas
- ✅ **Demo para profesores** con credenciales de prueba

### **Próximos Pasos**
1. **Configurar Django** con SQL Server
2. **Crear modelos** basados en el esquema
3. **Implementar API** REST completa
4. **Conectar frontend** con backend
5. **Testing end-to-end**

---

**¡La base de datos está lista para que el equipo comience a desarrollar! 🚀**
