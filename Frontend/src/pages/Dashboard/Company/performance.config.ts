/**
 * ⚡ CONFIGURACIÓN DE RENDIMIENTO PARA DASHBOARD DE EMPRESA
 * 
 * Este archivo contiene configuraciones optimizadas para mejorar el rendimiento
 * del dashboard de empresa, incluyendo intervalos de polling, caché y lazy loading.
 */

// Configuración de polling y caché
export const COMPANY_DASHBOARD_CONFIG = {
  // Intervalo de actualización de datos (en milisegundos)
  POLLING_INTERVAL: 30000, // 30 segundos
  
  // Tiempo de caché para datos (en milisegundos)
  CACHE_TIME: 60000, // 1 minuto
  
  // Habilitar polling automático
  ENABLE_POLLING: true,
  
  // Tiempo de retry en caso de error (en milisegundos)
  RETRY_DELAY: 5000, // 5 segundos
  
  // Número máximo de reintentos
  MAX_RETRIES: 3
};

// Configuración de skeleton loading
export const SKELETON_CONFIG = {
  // Duración de la animación del skeleton (en milisegundos)
  ANIMATION_DURATION: 1500,
  
  // Número de tarjetas skeleton a mostrar
  CARDS_COUNT: 9,
  
  // Altura de las tarjetas skeleton
  CARD_HEIGHT: 160,
  
  // Altura de los gráficos skeleton
  CHART_HEIGHT: 400
};

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
  // Tiempo de espera antes de cargar componentes (en milisegundos)
  LOADING_DELAY: 100,
  
  // Umbral de intersección para lazy loading
  INTERSECTION_THRESHOLD: 0.1,
  
  // Margen de raíz para lazy loading
  ROOT_MARGIN: '50px'
};

// Configuración de memoización
export const MEMOIZATION_CONFIG = {
  // Habilitar memoización de componentes
  ENABLE_MEMO: true,
  
  // Profundidad máxima de comparación para memo
  MAX_COMPARISON_DEPTH: 3
};

// Configuración de debounce
export const DEBOUNCE_CONFIG = {
  // Tiempo de debounce para búsquedas (en milisegundos)
  SEARCH_DELAY: 300,
  
  // Tiempo de debounce para filtros (en milisegundos)
  FILTER_DELAY: 200,
  
  // Tiempo de debounce para actualizaciones (en milisegundos)
  UPDATE_DELAY: 500
};

// Configuración de virtualización (para listas largas)
export const VIRTUALIZATION_CONFIG = {
  // Habilitar virtualización
  ENABLE_VIRTUALIZATION: true,
  
  // Tamaño del item virtualizado
  ITEM_SIZE: 60,
  
  // Número de items a renderizar por adelantado
  OVERSCAN_COUNT: 5
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
  // Habilitar code splitting
  ENABLE_CODE_SPLITTING: true,
  
  // Tamaño mínimo del chunk (en bytes)
  MIN_CHUNK_SIZE: 10000,
  
  // Tamaño máximo del chunk (en bytes)
  MAX_CHUNK_SIZE: 500000
};

// Funciones de utilidad para rendimiento
export const PERFORMANCE_UTILS = {
  // Medir tiempo de renderizado
  measureRenderTime: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`[${componentName}] Render time: ${(end - start).toFixed(2)}ms`);
    };
  },
  
  // Limpiar caché
  clearCache: () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  },
  
  // Preload de recursos críticos
  preloadCriticalResources: () => {
    const criticalResources = [
      '/dashboard/company/projects',
      '/dashboard/company/applications',
      '/dashboard/company/students'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }
};

// Configuración de monitoreo de rendimiento
export const MONITORING_CONFIG = {
  // Habilitar monitoreo de rendimiento
  ENABLE_MONITORING: true,
  
  // Umbral de rendimiento crítico (en milisegundos)
  CRITICAL_THRESHOLD: 1000,
  
  // Umbral de rendimiento de advertencia (en milisegundos)
  WARNING_THRESHOLD: 500,
  
  // Intervalo de reporte de métricas (en milisegundos)
  REPORTING_INTERVAL: 30000
};
