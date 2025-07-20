# Sistema de Validación de Horas de Proyectos

## Flujo Completo del Sistema

### 1. Proyecto en Curso
- **Empresa** marca proyecto como "Activo" → Proyecto está en curso
- **Estudiantes** trabajan en el proyecto
- **Empresa** puede calificar estudiantes con estrellas (1-5)
- **Estudiantes** pueden calificar empresas con estrellas (1-5)

### 2. Proyecto Terminado
- **Empresa** marca proyecto como "Completado" → Se ejecuta automáticamente:
  - Se calculan las horas totales del proyecto (`required_hours` o `hours_per_week * duration_weeks`)
  - Se crea un registro de `WorkHour` automáticamente para cada estudiante activo
  - Se marca como `approved = False` (pendiente de validación del admin)
  - Se finaliza la asignación del estudiante
  - Se registra el cambio de estado en el historial

### 3. Validación por Administrador
- **Admin** ve las horas pendientes en "Validación de Horas de Proyectos"
- **Admin** puede ver:
  - Nombre del estudiante y empresa
  - Nombre del proyecto con indicador "Completado"
  - Horas trabajadas vs horas requeridas del proyecto
  - Duración del proyecto
  - Calificaciones mutuas (estrellas)
  - Descripción automática del proyecto

### 4. Validación Obligatoria
- **Admin** DEBE validar las horas (no se puede rechazar)
- **Admin** puede agregar comentario opcional
- Al validar:
  - Se aprueban las horas automáticamente
  - Se suman al total de horas acumuladas del estudiante
  - Se actualiza el estado de la asignación
  - Se registra el admin que validó y la fecha

## Estructura de Datos

### WorkHour (Horas Trabajadas)
```python
class WorkHour:
    id: UUID
    assignment: Asignacion  # Relación con la asignación
    student: Estudiante     # Estudiante
    project: Proyecto       # Proyecto
    company: Empresa        # Empresa
    
    # Campos básicos
    date: Date              # Fecha de las horas
    hours_worked: Integer   # Horas trabajadas
    description: Text       # Descripción
    
    # Campos de validación
    approved: Boolean       # Si está aprobada
    approved_by: User       # Quién aprobó
    approved_at: DateTime   # Cuándo se aprobó
    
    # Campos adicionales
    is_project_completion: Boolean  # Si es de proyecto completado
    project_duration_weeks: Integer # Duración del proyecto
    project_required_hours: Integer # Horas requeridas
    company_rating: Integer         # Calificación empresa→estudiante
    student_rating: Integer         # Calificación estudiante→empresa
```

### Proyecto
```python
class Proyecto:
    # Campos de horas
    required_hours: Integer     # Horas totales requeridas
    hours_per_week: Integer     # Horas por semana
    duration_weeks: Integer     # Duración en semanas
    
    # Método especial
    def marcar_como_completado(user):
        # Genera horas automáticamente
        # Finaliza asignaciones
        # Registra historial
```

## Endpoints

### Backend
- `POST /api/admin/work-hours/{id}/approve/` - Validar horas (solo admin)
- `GET /api/admin/work-hours/` - Listar horas para validación

### Frontend
- `ValidacionHorasAdmin.tsx` - Interfaz de validación
- Solo muestra botón "Validar Horas" (no rechazar)
- Modal con detalles completos del proyecto

## Reglas de Negocio

1. **Validación Obligatoria**: Las horas DEBEN ser validadas por el admin
2. **No Rechazo**: No se pueden rechazar horas de proyectos completados
3. **Horas Automáticas**: Se calculan automáticamente al completar proyecto
4. **Acumulación**: Las horas validadas se suman al total del estudiante
5. **Calificaciones**: Se muestran las calificaciones mutuas empresa↔estudiante
6. **Historial**: Se registra todo el proceso de validación

## Interfaz de Usuario

### Tabla de Validación
- Estudiante (nombre + email)
- Proyecto (título + indicador "Completado")
- Empresa (nombre + email)
- Horas trabajadas
- GPA empresa y estudiante
- Detalles del proyecto (horas requeridas, duración)
- Botón "Validar Horas" (solo para pendientes)

### Modal de Validación
- Detalles completos del proyecto
- Información del estudiante y empresa
- Horas trabajadas vs requeridas
- Duración del proyecto
- Comentario opcional del admin
- Botón "Validar Horas" (obligatorio)

## Seguridad y Permisos

- Solo administradores pueden validar horas
- Las empresas no pueden validar sus propias horas
- Los estudiantes no pueden modificar horas validadas
- Se registra quién validó y cuándo
- No se pueden rechazar horas (solo aprobar) 