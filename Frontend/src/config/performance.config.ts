/**
 * 🚀 CONFIGURACIÓN DE RENDIMIENTO PARA LEAN MAKER
 * 
 * OBJETIVO:
 * - Optimizar la velocidad de carga de interfaces
 * - Reducir el uso de memoria
 * - Mejorar la experiencia del usuario
 * - Implementar mejores prácticas de React
 */

export const PERFORMANCE_CONFIG = {
  // Configuración de polling
  POLLING: {
    DASHBOARD_INTERVAL: 30000, // 30 segundos
    CACHE_TIME: 60000, // 1 minuto
    ENABLE_POLLING: true,
  },

  // Configuración de lazy loading
  LAZY_LOADING: {
    ENABLED: true,
    FALLBACK_DELAY: 200, // ms
    PRELOAD_THRESHOLD: 0.1, // 10% del viewport
  },

  // Configuración de skeleton loading
  SKELETON: {
    ENABLED: true,
    ANIMATION_DURATION: 1500, // ms
    SHOW_AFTER_DELAY: 100, // ms
  },

  // Configuración de memoización
  MEMOIZATION: {
    ENABLED: true,
    COMPONENT_MEMO: true,
    CALLBACK_MEMO: true,
  },

  // Configuración de debounce
  DEBOUNCE: {
    SEARCH_DELAY: 300, // ms
    SCROLL_DELAY: 100, // ms
    RESIZE_DELAY: 250, // ms
  },

  // Configuración de virtualización
  VIRTUALIZATION: {
    ENABLED: true,
    ITEM_HEIGHT: 80, // px
    OVERSCAN: 5, // items
  },

  // Configuración de cache
  CACHE: {
    ENABLED: true,
    MAX_SIZE: 100, // items
    TTL: 300000, // 5 minutos
  },

  // Configuración de bundle splitting
  BUNDLE: {
    CHUNK_SIZE: 244 * 1024, // 244KB
    MAX_CHUNKS: 10,
    MIN_CHUNK_SIZE: 20 * 1024, // 20KB
  },
};

/**
 * 🎯 FUNCIONES DE OPTIMIZACIÓN
 */

// Función para optimizar imágenes
export const optimizeImage = (src: string, width: number, quality: number = 80): string => {
  // Aquí se implementaría lógica de optimización de imágenes
  // Por ahora retornamos la imagen original
  return src;
};

// Función para preload componentes críticos
export const preloadCriticalComponents = () => {
  // Preload del dashboard principal
  import('./pages/Dashboard/Student/StudentDashboard');
};

// Función para limpiar cache
export const clearCache = () => {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

// Función para medir rendimiento
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
};

// Función para optimizar scroll
export const optimizeScroll = (callback: () => void, delay: number = 100) => {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Función para optimizar resize
export const optimizeResize = (callback: () => void, delay: number = 250) => {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};
