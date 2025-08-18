/**
 * Traducciones para tipos de notificaciones
 * Mapea los tipos en inglés del backend a nombres en español para el frontend
 */

export const notificationTypeTranslations: Record<string, string> = {
  // Tipos básicos de notificaciones
  'info': 'Información',
  'success': 'Éxito',
  'warning': 'Advertencia',
  'error': 'Error',
  
  // Tipos de notificaciones masivas
  'announcement': 'Anuncio',
  'reminder': 'Recordatorio',
  'alert': 'Alerta',
  'update': 'Actualización',
  'event': 'Evento',
  'deadline': 'Fecha límite',
  
  // Tipos adicionales que puedan existir
  'meeting': 'Reunión',
  'workshop': 'Taller',
  'conference': 'Conferencia',
  'networking': 'Networking',
  'presentation': 'Presentación',
  'other': 'Otro',
  
  // Fallback para tipos desconocidos
  'unknown': 'Desconocido'
};

/**
 * Obtiene la traducción en español de un tipo de notificación
 * @param type - Tipo de notificación en inglés
 * @returns Traducción en español o el tipo original si no se encuentra
 */
export const translateNotificationType = (type: string): string => {
  return notificationTypeTranslations[type] || type;
};

/**
 * Obtiene todas las traducciones disponibles
 * @returns Objeto con todas las traducciones
 */
export const getAllNotificationTypeTranslations = (): Record<string, string> => {
  return { ...notificationTypeTranslations };
};

/**
 * Filtra y traduce los tipos de notificación para mostrar en el dashboard
 * @param types - Array de tipos de notificación
 * @returns Array de tipos traducidos
 */
export const translateNotificationTypesForDashboard = (types: string[]): string[] => {
  return types.map(type => translateNotificationType(type));
};
