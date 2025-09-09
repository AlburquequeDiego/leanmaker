import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api.service';

interface DashboardStats {
  strikes: number;
  gpa: number;
  total_hours: number;
  active_projects: number;
  total_applications: number;
  available_projects: number;
  completed_projects: number;
  api_level: number;
  unread_notifications: number;
  application_distribution: any[];
  monthly_activity: any[];
}

interface UseOptimizedDashboardStatsReturn {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isPolling: boolean;
  refetch: () => Promise<void>;
}

/**
 * 🚀 HOOK OPTIMIZADO PARA ESTADÍSTICAS DEL DASHBOARD
 * 
 * CARACTERÍSTICAS:
 * - Polling reducido (30 segundos en lugar de constante)
 * - Cache de datos para evitar requests innecesarios
 * - Debounce en actualizaciones
 * - Manejo inteligente de errores
 */
export const useOptimizedDashboardStats = (
  userType: 'student' | 'company' | 'admin' | 'teacher',
  options: {
    pollingInterval?: number;
    enablePolling?: boolean;
    cacheTime?: number;
  } = {}
): UseOptimizedDashboardStatsReturn => {
  const {
    pollingInterval = 30000, // 30 segundos por defecto
    enablePolling = true,
    cacheTime = 60000 // 1 minuto de cache
  } = options;

  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const cacheRef = useRef<{ data: DashboardStats; timestamp: number } | null>(null);
  const pollingRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const endpoint = `/api/dashboard/${userType}_stats/`;

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      // Verificar cache si no es la carga inicial
      if (!isInitial && cacheRef.current) {
        const now = Date.now();
        if (now - cacheRef.current.timestamp < cacheTime) {
          console.log('[useOptimizedDashboardStats] 🚀 Usando datos del cache');
          return;
        }
      }

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo controller
      abortControllerRef.current = new AbortController();

      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      console.log(`[useOptimizedDashboardStats] 🔍 Fetching ${userType} stats...`);
      
      const response = await apiService.get(endpoint);

      const statsData = (response as any).data || response;
      
      // Actualizar cache
      cacheRef.current = {
        data: statsData,
        timestamp: Date.now()
      };

      setData(statsData);
      setLastUpdate(new Date());
      setError(null);
      
      console.log(`[useOptimizedDashboardStats] ✅ ${userType} stats loaded successfully`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[useOptimizedDashboardStats] ⏹️ Request cancelled');
        return;
      }
      
      console.error(`[useOptimizedDashboardStats] ❌ Error fetching ${userType} stats:`, err);
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [userType, endpoint, cacheTime]);

  const startPolling = useCallback(() => {
    if (!enablePolling || pollingRef.current) return;

    console.log(`[useOptimizedDashboardStats] 🔄 Starting polling for ${userType} (${pollingInterval}ms)`);
    
    pollingRef.current = setInterval(() => {
      setIsPolling(true);
      fetchData(false).finally(() => setIsPolling(false));
    }, pollingInterval);
  }, [enablePolling, pollingInterval, userType, fetchData]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log(`[useOptimizedDashboardStats] ⏹️ Stopping polling for ${userType}`);
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      setIsPolling(false);
    }
  }, [userType]);

  const refetch = useCallback(async () => {
    console.log(`[useOptimizedDashboardStats] 🔄 Manual refetch for ${userType}`);
    await fetchData(false);
  }, [fetchData, userType]);

  // Carga inicial
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Iniciar/detener polling
  useEffect(() => {
    if (enablePolling && !loading) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enablePolling, loading, startPolling, stopPolling]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    isPolling,
    refetch
  };
};
