/**
 * 🚀 SERVICIO DE CACHE PARA LEAN MAKER FRONTEND
 * 
 * OBJETIVO:
 * - Cache inteligente de datos de API
 * - Reducción de peticiones innecesarias
 * - Mejora de velocidad de carga
 * - Cache automático con TTL
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto

  /**
   * Guarda datos en cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Obtiene datos del cache si no han expirado
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Verifica si existe un item en cache y no ha expirado
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Elimina un item específico del cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpia items expirados del cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Genera clave de cache basada en endpoint y parámetros
   */
  generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsStr}`;
  }
}

// Instancia singleton
export const cacheService = new CacheService();

// Limpiar cache automáticamente cada 10 minutos
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

/**
 * 🎯 HOOK PARA USAR CACHE EN COMPONENTES
 */
export const useCache = () => {
  return {
    get: cacheService.get.bind(cacheService),
    set: cacheService.set.bind(cacheService),
    has: cacheService.has.bind(cacheService),
    delete: cacheService.delete.bind(cacheService),
    clear: cacheService.clear.bind(cacheService),
    generateKey: cacheService.generateKey.bind(cacheService),
  };
};

/**
 * 🚀 WRAPPER PARA API CALLS CON CACHE
 */
export const withCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Verificar cache primero
  const cached = cacheService.get<T>(key);
  if (cached !== null) {
    console.log(`🚀 Cache hit: ${key}`);
    return cached;
  }

  // Si no está en cache, hacer la llamada API
  console.log(`🌐 API call: ${key}`);
  const data = await apiCall();
  
  // Guardar en cache
  cacheService.set(key, data, ttl);
  
  return data;
};

export default cacheService;
