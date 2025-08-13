# 🎓 Sistema de Perfiles de Estudiantes

## 📋 Descripción

Este sistema proporciona una forma unificada y reutilizable de obtener y mostrar perfiles completos de estudiantes en todas las interfaces de empresa. Resuelve el problema de datos vacíos en el modal de perfil del estudiante.

## 🏗️ Arquitectura

### 1. **StudentService** (`src/services/student.service.ts`)
- Servicio dedicado para obtener perfiles de estudiantes
- Maneja errores y fallbacks automáticamente
- Métodos para perfiles individuales y múltiples

### 2. **useStudentProfile Hook** (`src/hooks/useStudentProfile.ts`)
- Hook personalizado para gestionar el estado del perfil
- Manejo automático de carga, errores y refresco
- Reutilizable en cualquier componente

### 3. **StudentProfileModal** (`src/components/common/StudentProfileModal.tsx`)
- Componente modal reutilizable para mostrar perfiles
- Compatible con modo oscuro y claro
- Manejo de estados de carga y errores

## 🚀 Uso Básico

### En cualquier componente de empresa:

```tsx
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { StudentProfileModal } from '../../components/common/StudentProfileModal';

const MyComponent = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const { profile, loading, error, refreshProfile } = useStudentProfile(selectedStudentId);

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowProfile(true);
  };

  return (
    <>
      <Button onClick={() => handleViewProfile('student-id-here')}>
        Ver Perfil
      </Button>

      <StudentProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        studentId={selectedStudentId}
        projectTitle="Mi Proyecto"
        applicationStatus="pending"
        coverLetter="Carta de presentación del estudiante"
      />
    </>
  );
};
```

## 🔧 Configuración

### 1. **Endpoints de API requeridos:**

```typescript
// En src/config/api.config.ts
export const API_ENDPOINTS = {
  STUDENTS: '/api/students',
  // ... otros endpoints
};
```

### 2. **Estructura de respuesta esperada:**

```typescript
interface StudentProfileResponse {
  student: Student;
  user_data: {
    full_name: string;
    email: string;
    phone?: string;
    bio?: string;
    first_name: string;
    last_name: string;
  };
  perfil_detallado?: {
    fecha_nacimiento?: string;
    genero?: string;
    telefono?: string;
  };
}
```

## 📱 Características del Modal

### ✅ **Información Mostrada:**
- **Datos Personales**: Nombre, email, teléfono, fecha de nacimiento, género
- **Información Académica**: Carrera, universidad, nivel educativo, semestre, estado
- **Habilidades**: Skills, idiomas, área de interés, modalidad
- **Carta de Presentación**: Si está disponible

### 🎨 **Diseño:**
- **Modo Oscuro/Claro**: Adaptativo automáticamente
- **Responsivo**: Funciona en móviles y desktop
- **Indicadores de Estado**: Carga, errores, datos vacíos
- **Navegación**: Scroll suave, botones de acción

### 🔄 **Estados:**
- **Cargando**: Spinner con mensaje informativo
- **Error**: Alert con opción de reintentar
- **Sin Datos**: Mensajes informativos para campos vacíos
- **Cargado**: Perfil completo con toda la información

## 🛠️ Funcionalidades Avanzadas

### 1. **Manejo de Errores:**
```tsx
const { profile, loading, error, refreshProfile } = useStudentProfile(studentId);

if (error) {
  return (
    <Alert severity="error">
      Error: {error}
      <Button onClick={refreshProfile}>Reintentar</Button>
    </Alert>
  );
}
```

### 2. **Múltiples Perfiles:**
```tsx
import { useMultipleStudentProfiles } from '../../hooks/useStudentProfile';

const { profiles, loading, error } = useMultipleStudentProfiles(['id1', 'id2', 'id3']);
```

### 3. **Personalización del Modal:**
```tsx
<StudentProfileModal
  open={showProfile}
  onClose={() => setShowProfile(false)}
  studentId={studentId}
  projectTitle="Proyecto Personalizado"
  applicationStatus="accepted"
  coverLetter="Carta personalizada"
  onStatusChange={(newStatus) => console.log('Nuevo estado:', newStatus)}
/>
```

## 🔍 Debugging

### Logs del Sistema:
```bash
🚀 [StudentService] Obteniendo perfil del estudiante: student-id
✅ [StudentService] Perfil obtenido: {...}
🔄 [useStudentProfile] Obteniendo perfil para estudiante: student-id
✅ [useStudentProfile] Perfil obtenido exitosamente: {...}
```

### Verificar Datos:
1. **Console del Navegador**: Ver logs del servicio
2. **Network Tab**: Verificar llamadas a la API
3. **Estado del Hook**: Usar React DevTools para inspeccionar estado

## 🚨 Solución de Problemas

### **Problema: Modal vacío**
- **Causa**: `studentId` es `null` o inválido
- **Solución**: Verificar que `selectedStudentId` se establezca correctamente

### **Problema: Error 404**
- **Causa**: Endpoint de API no existe
- **Solución**: Verificar `API_ENDPOINTS.STUDENTS` en configuración

### **Problema: Datos incompletos**
- **Causa**: Backend no envía todos los campos
- **Solución**: Verificar estructura de respuesta del backend

## 📈 Beneficios

1. **🔄 Reutilizable**: Un solo componente para todas las interfaces
2. **📱 Responsivo**: Funciona en todos los dispositivos
3. **🎨 Temático**: Soporte completo para modo oscuro/claro
4. **⚡ Eficiente**: Carga datos solo cuando es necesario
5. **🛡️ Robusto**: Manejo de errores y estados de carga
6. **🔧 Mantenible**: Código centralizado y bien estructurado

## 🎯 Casos de Uso

### **Interfaces que pueden usar este sistema:**
- ✅ **Postulaciones**: Ver perfil del estudiante postulante
- ✅ **Búsqueda de Estudiantes**: Mostrar detalles del perfil
- ✅ **Asignaciones**: Ver perfil del estudiante asignado
- ✅ **Evaluaciones**: Mostrar perfil del estudiante evaluado
- ✅ **Reportes**: Incluir información del perfil en reportes

## 🔮 Futuras Mejoras

1. **📊 Estadísticas**: Agregar métricas del estudiante
2. **📝 Notas**: Sistema de notas privadas de la empresa
3. **📅 Historial**: Timeline de interacciones
4. **🔔 Notificaciones**: Alertas sobre cambios en el perfil
5. **📱 Offline**: Cache local para perfiles frecuentes

---

**Desarrollado para resolver el problema de datos vacíos en el modal de perfil del estudiante en la interfaz de postulaciones de empresa.**
