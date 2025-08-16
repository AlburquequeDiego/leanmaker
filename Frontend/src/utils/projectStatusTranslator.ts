/**
 * TRADUCTOR DE ESTADOS DE PROYECTO
 * 
 * IMPORTANTE: Esta función es CRÍTICA para el funcionamiento del sistema.
 * Convierte estados internos en inglés a etiquetas visibles en español.
 * 
 * REGLAS:
 * 1. Los estados internos SIEMPRE deben ser en inglés (minúsculas)
 * 2. Las etiquetas visibles SIEMPRE deben ser en español
 * 3. Si no se encuentra traducción, devolver el estado original
 * 
 * ESTADOS SOPORTADOS:
 * - active → Activo
 * - published → Publicado
 * - completed → Completado
 * - draft → Borrador
 * - deleted → Eliminado
 * - suspended → Suspendido
 * - pending → Pendiente
 * - reviewing → En Revisión
 * - accepted → Aceptado
 * - rejected → Rechazado
 * - open → Abierto
 * - in-progress → En Progreso
 * - cancelled → Cancelado
 * - overdue → Atrasado
 * - closed → Cerrado
 * - terminated → Terminado
 */

export const getProjectStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Sin Estado';
  
  const statusMap: Record<string, string> = {
    // Estados principales de proyecto
    'active': 'Activo',
    'published': 'Publicado',
    'completed': 'Completado',
    'draft': 'Borrador',
    'deleted': 'Eliminado',
    'suspended': 'Suspendido',
    
    // Estados de aplicación
    'pending': 'Pendiente',
    'reviewing': 'En Revisión',
    'accepted': 'Aceptado',
    'rejected': 'Rechazado',
    'withdrawn': 'Retirado',
    
    // Estados adicionales
    'open': 'Abierto',
    'in-progress': 'En Progreso',
    'cancelled': 'Cancelado',
    'overdue': 'Atrasado',
    'closed': 'Cerrado',
    'terminated': 'Terminado',
    
    // Estados legacy (compatibilidad)
    'activo': 'Activo',
    'publicado': 'Publicado',
    'completado': 'Completado',
    'borrador': 'Borrador',
    'eliminado': 'Eliminado',
    'suspendido': 'Suspendido',
    'pendiente': 'Pendiente',
    'en_revision': 'En Revisión',
    'aceptado': 'Aceptado',
    'rechazado': 'Rechazado',
    'abierto': 'Abierto',
    'en_progreso': 'En Progreso',
    'cancelado': 'Cancelado',
    'atrasado': 'Atrasado',
    'cerrado': 'Cerrado',
    'terminado': 'Terminado'
  };
  
  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || status;
};

/**
 * Función para obtener el color del chip según el estado
 */
export const getProjectStatusColor = (status: string | null | undefined): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  if (!status) return 'default';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    // Estados positivos
    'active': 'success',
    'published': 'info',
    'completed': 'secondary',
    'accepted': 'success',
    'open': 'primary',
    
    // Estados neutrales
    'draft': 'default',
    'pending': 'warning',
    'reviewing': 'info',
    'in-progress': 'primary',
    
    // Estados negativos
    'deleted': 'error',
    'suspended': 'error',
    'rejected': 'error',
    'cancelled': 'error',
    'overdue': 'error',
    'closed': 'default',
    'terminated': 'default',
    
    // Estados legacy
    'activo': 'success',
    'publicado': 'info',
    'completado': 'secondary',
    'aceptado': 'success',
    'abierto': 'primary',
    'pendiente': 'warning',
    'en_revision': 'info',
    'en_progreso': 'primary',
    'eliminado': 'error',
    'suspendido': 'error',
    'rechazado': 'error',
    'cancelado': 'error',
    'atrasado': 'error',
    'cerrado': 'default',
    'terminado': 'default'
  };
  
  return colorMap[normalizedStatus] || 'default';
};

/**
 * Función para verificar si un estado es considerado "activo"
 */
export const isActiveStatus = (status: string | null | undefined): boolean => {
  if (!status) return false;
  
  const activeStatuses = [
    'active', 'published', 'open', 'in-progress',
    'activo', 'publicado', 'abierto', 'en_progreso'
  ];
  
  return activeStatuses.includes(status.toLowerCase().trim());
};

/**
 * Función para verificar si un estado es considerado "completado"
 */
export const isCompletedStatus = (status: string | null | undefined): boolean => {
  if (!status) return false;
  
  const completedStatuses = [
    'completed', 'closed', 'terminated',
    'completado', 'cerrado', 'terminado'
  ];
  
  return completedStatuses.includes(status.toLowerCase().trim());
};

/**
 * Función para verificar si un estado es considerado "finalizado"
 */
export const isFinalizedStatus = (status: string | null | undefined): boolean => {
  if (!status) return false;
  
  const finalizedStatuses = [
    'completed', 'deleted', 'cancelled', 'closed', 'terminated',
    'completado', 'eliminado', 'cancelado', 'cerrado', 'terminado'
  ];
  
  return finalizedStatuses.includes(status.toLowerCase().trim());
};

export default {
  getProjectStatusLabel,
  getProjectStatusColor,
  isActiveStatus,
  isCompletedStatus,
  isFinalizedStatus
};
