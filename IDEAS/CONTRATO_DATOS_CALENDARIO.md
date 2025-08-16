# CONTRATO DE DATOS - SISTEMA DE CALENDARIO

## ENDPOINT: `/api/projects/company_projects/`

### ESTRUCTURA DE RESPUESTA
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "title": "string",
      "description": "string",
      "status": "string (minúscula)",
      "status_id": "integer",
      "area": "string",
      "area_id": "integer",
      "trl_level": "integer",
      "trl_id": "integer", 
      "api_level": "integer",
      "max_students": "integer",
      "current_students": "integer",
      "applications_count": "integer",
      "start_date": "ISO string o null",
      "estimated_end_date": "ISO string o null",
      "location": "string",
      "modality": "string",
      "duration_weeks": "integer",
      "hours_per_week": "integer",
      "required_hours": "integer",
      "is_featured": "boolean",
      "is_urgent": "boolean",
      "created_at": "ISO string",
      "updated_at": "ISO string",
      "technologies": "array",
      "tags": "array",
      "estudiantes": [
        {
          "id": "string",
          "nombre": "string",
          "email": "string", 
          "status": "string",
          "applied_at": "ISO string o null",
          "type": "assigned|applied"
        }
      ]
    }
  ],
  "count": "integer"
}
```

### REGLAS CRÍTICAS PARA ESTUDIANTES

#### PROYECTOS ACTIVOS (status: 'active' o 'Activo')
- **estudiantes**: Solo estudiantes asignados
- **type**: Siempre 'assigned'
- **status**: Solo 'accepted', 'active', 'completed'

#### PROYECTOS PUBLICADOS (status: 'published' o 'Publicado')  
- **estudiantes**: Todos los postulantes
- **type**: Siempre 'applied'
- **status**: Cualquier status de aplicación

#### OTROS ESTADOS
- **estudiantes**: Combinación de ambos tipos
- **type**: 'assigned' o 'applied' según corresponda

## ENDPOINT: `/api/applications/received_applications/`

### ESTRUCTURA DE RESPUESTA (FALLBACK)
```json
[
  {
    "id": "string",
    "project": {
      "id": "string",
      "title": "string", 
      "description": "string",
      "status": "string"
    },
    "student": {
      "id": "string",
      "name": "string",
      "email": "string",
      "full_name": "string"
    },
    "status": "string",
    "created_at": "ISO string"
  }
]
```

## FRONTEND - VARIABLES CRÍTICAS

### projectStudents (viene de company_projects)
```typescript
interface ProjectStudent {
  id: string;
  nombre: string;
  email: string;
  status: string;
  applied_at?: string;
  type: 'assigned' | 'applied';
}
```

### users (fallback de received_applications)
```typescript
interface ApplicationUser {
  id: string;
  project: string; // ID del proyecto
  student: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
}
```

## COMPARACIONES DE ESTADO CRÍTICAS

### Backend (projects/views.py)
```python
# LÍNEA 870: Comparación de estados
if project_status in ['active', 'activo']:
    # Lógica para proyectos activos
elif project_status in ['published', 'publicado']:
    # Lógica para proyectos publicados
```

### Frontend (Calendar.tsx)
```typescript
// LÍNEA 2470: Comparación de estados
if (selectedProjectData.status === 'active') {
    // Lógica para proyectos activos
} else if (selectedProjectData.status === 'published') {
    // Lógica para proyectos publicados
}
```

## PROBLEMAS IDENTIFICADOS

### 1. Inconsistencia de Estados
- **Backend**: Compara con `['active', 'activo']` y `['published', 'publicado']`
- **Frontend**: Compara con `=== 'active'` y `=== 'published'`
- **BD**: Tiene estados duplicados con diferentes casos

### 2. Estructura de Datos Diferente
- **projectStudents**: Campos `id`, `nombre`, `email`, `status`, `type`
- **users**: Campos `id`, `project`, `student.name`, `student.email`, `status`

### 3. Lógica de Fallback Frágil
- Si `projectStudents` está vacío, busca en `users`
- Estructuras incompatibles pueden causar errores

## SOLUCIONES RECOMENDADAS

### 1. Normalización de Estados
```python
# Backend: Normalizar a minúsculas
project_status = project.status.name.lower() if project.status else 'sin_estado'

# Frontend: Normalizar antes de comparar
const normalizedStatus = selectedProjectData.status?.toLowerCase();
```

### 2. Validación de Campos
```typescript
// Frontend: Validar estructura antes de procesar
const isValidStudent = (student: any): student is ProjectStudent => {
  return student && 
         typeof student.id === 'string' &&
         typeof student.nombre === 'string' &&
         typeof student.email === 'string' &&
         typeof student.status === 'string' &&
         typeof student.type === 'string';
};
```

### 3. Fallback Robusto
```typescript
// Frontend: Transformar datos del fallback
const transformFallbackData = (users: ApplicationUser[]) => {
  return users.map(user => ({
    id: user.student.id,
    nombre: user.student.name,
    email: user.student.email,
    status: user.status,
    type: 'applied' as const
  }));
};
```

## ADVERTENCIAS

⚠️ **NO MODIFICAR** la estructura de datos sin actualizar ambos lados
⚠️ **NO CAMBIAR** los nombres de campos sin migración
⚠️ **NO ELIMINAR** estados duplicados sin plan de migración
⚠️ **SIEMPRE VALIDAR** que los datos tengan la estructura esperada

## ARCHIVOS CRÍTICOS

- `Backend/projects/views.py` - Líneas 860-950
- `Frontend/src/pages/Dashboard/Company/Calendar.tsx` - Líneas 2440-2520
- `Backend/applications/views.py` - Líneas 260-320
- `Backend/project_status/models.py` - Estados de proyecto
