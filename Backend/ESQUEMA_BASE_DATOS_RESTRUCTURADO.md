# Esquema de Base de Datos Reestructurado - LeanMaker

## Resumen Ejecutivo

Este documento describe el esquema de base de datos completamente reestructurado para el sistema LeanMaker. El nuevo esquema resuelve los problemas identificados en el análisis y proporciona una base sólida, normalizada y optimizada para el funcionamiento del sistema.

## Problemas Identificados y Solucionados

### 1. **Duplicación de Modelos**
- **Problema**: Existían dos modelos de aplicación (`Aplicacion` y `AplicacionProyecto`)
- **Solución**: Consolidado en un solo modelo `Aplicacion` optimizado

### 2. **Campos JSON como Texto**
- **Problema**: Se usaban campos `TextField` para almacenar JSON
- **Solución**: Migrado a campos `JSONField` nativos de Django

### 3. **Falta de Normalización**
- **Problema**: Algunos datos estaban mal estructurados y duplicados
- **Solución**: Normalización completa siguiendo 3FN

### 4. **Falta de Índices**
- **Problema**: No había índices optimizados para consultas frecuentes
- **Solución**: Agregados índices estratégicos en campos clave

### 5. **Inconsistencias en Relaciones**
- **Problema**: Algunas relaciones no estaban bien definidas
- **Solución**: Relaciones claras y consistentes con claves foráneas apropiadas

## Estructura de Tablas

### 1. **Tabla: users**
**Propósito**: Almacena todos los usuarios del sistema (estudiantes, empresas, administradores)

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `email` (EmailField, unique): Email del usuario
- `role` (CharField): Rol del usuario (admin, student, company)
- `is_verified` (BooleanField): Si el usuario está verificado
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Índices**:
- `users_email_idx`: Para búsquedas por email
- `users_role_idx`: Para filtrar por rol
- `users_active_idx`: Para usuarios activos

### 2. **Tabla: companies**
**Propósito**: Perfiles de empresas

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `user` (OneToOneField): Relación con usuario
- `company_name` (CharField): Nombre de la empresa
- `verified` (BooleanField): Si está verificada
- `rating` (DecimalField): Calificación promedio
- `technologies_used` (JSONField): Tecnologías utilizadas
- `benefits_offered` (JSONField): Beneficios ofrecidos

### 3. **Tabla: students**
**Propósito**: Perfiles de estudiantes

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `user` (OneToOneField): Relación con usuario
- `api_level` (IntegerField): Nivel API (1-4)
- `trl_level` (IntegerField): Nivel TRL (1-9)
- `strikes` (IntegerField): Número de strikes
- `skills` (JSONField): Habilidades del estudiante
- `languages` (JSONField): Idiomas del estudiante

### 4. **Tabla: areas**
**Propósito**: Áreas de conocimiento

**Campos principales**:
- `id` (AutoField, PK): Identificador único
- `name` (CharField, unique): Nombre del área
- `color` (CharField): Color hexadecimal
- `is_active` (BooleanField): Si está activa

### 5. **Tabla: trl_levels**
**Propósito**: Niveles TRL (Technology Readiness Level)

**Campos principales**:
- `id` (AutoField, PK): Identificador único
- `level` (IntegerField, unique): Nivel TRL (1-9)
- `name` (CharField): Nombre del nivel
- `min_hours` (IntegerField): Horas mínimas requeridas

### 6. **Tabla: project_status**
**Propósito**: Estados de proyectos

**Campos principales**:
- `id` (AutoField, PK): Identificador único
- `name` (CharField, unique): Nombre del estado
- `color` (CharField): Color hexadecimal
- `is_active` (BooleanField): Si está activo

### 7. **Tabla: projects**
**Propósito**: Proyectos publicados por empresas

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `company` (ForeignKey): Empresa que publica
- `area` (ForeignKey): Área del proyecto
- `status` (ForeignKey): Estado del proyecto
- `trl` (ForeignKey): Nivel TRL
- `title` (CharField): Título del proyecto
- `description` (TextField): Descripción
- `requirements` (TextField): Requisitos
- `required_skills` (JSONField): Habilidades requeridas
- `preferred_skills` (JSONField): Habilidades preferidas
- `technologies` (JSONField): Tecnologías
- `benefits` (JSONField): Beneficios
- `max_students` (IntegerField): Máximo de estudiantes
- `current_students` (IntegerField): Estudiantes actuales

**Índices**:
- `projects_status_idx`: Para filtrar por estado
- `projects_company_idx`: Para proyectos por empresa
- `projects_area_idx`: Para proyectos por área
- `projects_created_idx`: Para ordenar por fecha
- `projects_featured_idx`: Para proyectos destacados

### 8. **Tabla: applications**
**Propósito**: Aplicaciones de estudiantes a proyectos

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `project` (ForeignKey): Proyecto al que aplica
- `student` (ForeignKey): Estudiante que aplica
- `status` (CharField): Estado de la aplicación
- `cover_letter` (TextField): Carta de presentación
- `applied_at` (DateTimeField): Fecha de aplicación

**Restricciones**:
- `unique_together`: ['project', 'student'] - Un estudiante solo puede aplicar una vez por proyecto

**Índices**:
- `applications_status_idx`: Para filtrar por estado
- `applications_project_idx`: Para aplicaciones por proyecto
- `applications_student_idx`: Para aplicaciones por estudiante
- `applications_applied_idx`: Para ordenar por fecha

### 9. **Tabla: application_assignments**
**Propósito**: Asignaciones de estudiantes a proyectos

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `application` (OneToOneField): Aplicación relacionada
- `fecha_inicio` (DateField): Fecha de inicio
- `fecha_fin` (DateField): Fecha de fin
- `estado` (CharField): Estado de la asignación
- `hours_worked` (IntegerField): Horas trabajadas

### 10. **Tabla: work_hours**
**Propósito**: Registro de horas trabajadas

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `assignment` (ForeignKey): Asignación relacionada
- `student` (ForeignKey): Estudiante
- `project` (ForeignKey): Proyecto
- `company` (ForeignKey): Empresa
- `date` (DateField): Fecha
- `hours_worked` (IntegerField): Horas trabajadas
- `approved` (BooleanField): Si está aprobada
- `approved_by` (ForeignKey): Quien aprobó
- `approved_at` (DateTimeField): Cuándo se aprobó

**Índices**:
- `work_hours_student_idx`: Para horas por estudiante
- `work_hours_project_idx`: Para horas por proyecto
- `work_hours_date_idx`: Para horas por fecha
- `work_hours_approved_idx`: Para horas aprobadas

### 11. **Tabla: evaluations**
**Propósito**: Evaluaciones de estudiantes

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `project` (ForeignKey): Proyecto evaluado
- `student` (ForeignKey): Estudiante evaluado
- `evaluator` (ForeignKey): Quien evalúa
- `category` (ForeignKey): Categoría de evaluación
- `score` (FloatField): Puntuación (1-5)
- `comments` (TextField): Comentarios
- `status` (CharField): Estado de la evaluación

**Índices**:
- `evaluations_student_idx`: Para evaluaciones por estudiante
- `evaluations_project_idx`: Para evaluaciones por proyecto
- `evaluations_evaluator_idx`: Para evaluaciones por evaluador
- `evaluations_status_idx`: Para evaluaciones por estado

### 12. **Tabla: notifications**
**Propósito**: Notificaciones del sistema

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `user` (ForeignKey): Usuario destinatario
- `title` (CharField): Título
- `message` (TextField): Mensaje
- `type` (CharField): Tipo de notificación
- `read` (BooleanField): Si está leída
- `priority` (CharField): Prioridad

**Índices**:
- `notifications_user_idx`: Para notificaciones por usuario
- `notifications_read_idx`: Para notificaciones leídas
- `notifications_created_idx`: Para ordenar por fecha

### 13. **Tabla: interviews**
**Propósito**: Entrevistas programadas

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `application` (ForeignKey): Aplicación relacionada
- `interviewer` (ForeignKey): Entrevistador
- `interview_date` (DateTimeField): Fecha de entrevista
- `status` (CharField): Estado de la entrevista
- `rating` (IntegerField): Calificación (1-5)

### 14. **Tabla: calendar_events**
**Propósito**: Eventos de calendario

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `title` (CharField): Título del evento
- `start_date` (DateTimeField): Fecha de inicio
- `end_date` (DateTimeField): Fecha de fin
- `event_type` (CharField): Tipo de evento
- `attendees` (ManyToManyField): Participantes
- `created_by` (ForeignKey): Creador del evento

**Índices**:
- `calendar_user_start_idx`: Para eventos por usuario y fecha
- `calendar_event_type_idx`: Para eventos por tipo
- `calendar_status_idx`: Para eventos por estado

### 15. **Tabla: strikes**
**Propósito**: Amonestaciones a estudiantes

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `student` (ForeignKey): Estudiante amonestado
- `company` (ForeignKey): Empresa que emite
- `project` (ForeignKey): Proyecto relacionado
- `reason` (TextField): Motivo
- `severity` (CharField): Severidad
- `is_active` (BooleanField): Si está activo

**Índices**:
- `strikes_student_idx`: Para strikes por estudiante
- `strikes_active_idx`: Para strikes activos
- `strikes_issued_idx`: Para strikes por fecha

### 16. **Tabla: strike_reports**
**Propósito**: Reportes de strikes por empresas

**Campos principales**:
- `id` (UUID, PK): Identificador único
- `company` (ForeignKey): Empresa que reporta
- `student` (ForeignKey): Estudiante reportado
- `project` (ForeignKey): Proyecto relacionado
- `reason` (CharField): Motivo
- `status` (CharField): Estado del reporte
- `reviewed_by` (ForeignKey): Quien revisó

## Relaciones Principales

### 1. **Usuarios y Perfiles**
- `User` ↔ `Empresa` (OneToOne)
- `User` ↔ `Estudiante` (OneToOne)

### 2. **Proyectos**
- `Empresa` → `Proyecto` (OneToMany)
- `Area` → `Proyecto` (OneToMany)
- `ProjectStatus` → `Proyecto` (OneToMany)
- `TRLLevel` → `Proyecto` (OneToMany)

### 3. **Aplicaciones y Asignaciones**
- `Proyecto` → `Aplicacion` (OneToMany)
- `Estudiante` → `Aplicacion` (OneToMany)
- `Aplicacion` → `Asignacion` (OneToOne)

### 4. **Horas Trabajadas**
- `Asignacion` → `WorkHour` (OneToMany)
- `Estudiante` → `WorkHour` (OneToMany)
- `Proyecto` → `WorkHour` (OneToMany)
- `Empresa` → `WorkHour` (OneToMany)

### 5. **Evaluaciones**
- `Proyecto` → `Evaluation` (OneToMany)
- `Estudiante` → `Evaluation` (OneToMany)
- `User` → `Evaluation` (OneToMany como evaluador)
- `EvaluationCategory` → `Evaluation` (OneToMany)

### 6. **Notificaciones**
- `User` → `Notification` (OneToMany)

### 7. **Entrevistas**
- `Aplicacion` → `Interview` (OneToMany)
- `User` → `Interview` (OneToMany como entrevistador)

### 8. **Eventos de Calendario**
- `User` → `CalendarEvent` (OneToMany como creador)
- `User` ↔ `CalendarEvent` (ManyToMany como participantes)
- `Proyecto` → `CalendarEvent` (OneToMany)

### 9. **Strikes**
- `Estudiante` → `Strike` (OneToMany)
- `Empresa` → `Strike` (OneToMany como emisora)
- `Proyecto` → `Strike` (OneToMany)

## Mejoras Implementadas

### 1. **Normalización (3FN)**
- Eliminación de datos duplicados
- Separación de entidades en tablas independientes
- Uso de claves foráneas para relaciones

### 2. **Optimización de Consultas**
- Índices en campos frecuentemente consultados
- Índices compuestos para consultas complejas
- Índices en campos de ordenamiento

### 3. **Integridad de Datos**
- Restricciones `unique_together` donde corresponde
- Validadores en campos críticos
- Claves foráneas con `CASCADE` apropiado

### 4. **Campos JSON Nativos**
- Migración de `TextField` a `JSONField` para datos estructurados
- Mejor rendimiento en consultas JSON
- Validación automática de formato JSON

### 5. **Timestamps Consistentes**
- `created_at` y `updated_at` en todas las tablas principales
- Auditoría completa de cambios

### 6. **Estados y Validaciones**
- Campos de estado con opciones predefinidas
- Validadores de rango para campos numéricos
- Campos booleanos para flags de estado

## Migración de Datos

### Pasos para Migrar

1. **Backup de datos existentes**
2. **Ejecutar migración inicial**
3. **Migrar datos JSON de TextField a JSONField**
4. **Verificar integridad de relaciones**
5. **Actualizar índices**

### Scripts de Migración

```python
# Ejemplo de migración de datos JSON
from django.db import migrations

def migrate_json_fields(apps, schema_editor):
    Proyecto = apps.get_model('projects', 'Proyecto')
    
    for proyecto in Proyecto.objects.all():
        # Migrar required_skills
        if proyecto.required_skills:
            try:
                import json
                skills = json.loads(proyecto.required_skills)
                proyecto.required_skills = skills
                proyecto.save()
            except:
                proyecto.required_skills = []
                proyecto.save()

class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0001_initial_restructured'),
    ]
    
    operations = [
        migrations.RunPython(migrate_json_fields),
    ]
```

## Consideraciones de Rendimiento

### 1. **Índices Estratégicos**
- Índices en campos de búsqueda frecuente
- Índices en campos de ordenamiento
- Índices compuestos para consultas complejas

### 2. **Optimización de Consultas**
- Uso de `select_related()` para relaciones OneToOne
- Uso de `prefetch_related()` para relaciones ManyToMany
- Paginación en listados grandes

### 3. **Campos JSON**
- Consultas eficientes en campos JSON
- Índices en campos JSON específicos si es necesario

## Seguridad

### 1. **Validación de Datos**
- Validadores en modelos
- Validación en formularios
- Sanitización de datos JSON

### 2. **Permisos**
- Control de acceso basado en roles
- Permisos granulares por modelo
- Auditoría de cambios

### 3. **Integridad Referencial**
- Claves foráneas con `CASCADE` apropiado
- Restricciones `unique_together`
- Validación de datos antes de guardar

## Mantenimiento

### 1. **Backups Regulares**
- Backup automático de la base de datos
- Backup de archivos de migración
- Documentación de cambios

### 2. **Monitoreo**
- Monitoreo de rendimiento de consultas
- Monitoreo de uso de índices
- Alertas de errores de base de datos

### 3. **Actualizaciones**
- Migraciones incrementales
- Testing de migraciones en ambiente de desarrollo
- Rollback plan en caso de problemas

## Conclusión

El esquema reestructurado proporciona:

1. **Mejor rendimiento** con índices optimizados
2. **Mayor integridad** con normalización completa
3. **Facilidad de mantenimiento** con estructura clara
4. **Escalabilidad** para futuras funcionalidades
5. **Compatibilidad** con el frontend existente

Este esquema está listo para ser implementado y proporcionará una base sólida para el crecimiento del sistema LeanMaker. 