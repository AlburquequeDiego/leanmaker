import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface UseRealTimeDataOptions {
  endpoint: string;
  interval?: number; // Intervalo en milisegundos
  enabled?: boolean;
  onDataUpdate?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useRealTimeData = <T = any>({
  endpoint,
  interval = 30000, // 30 segundos por defecto
  enabled = true,
  onDataUpdate,
  onError
}: UseRealTimeDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;

    try {
      console.log(`[useRealTimeData] Fetching data from: ${endpoint}`);
      setLoading(true);
      setError(null);
      
      const response = await apiService.get<T>(endpoint);
      console.log(`[useRealTimeData] Response received:`, response);
      
      if (isMountedRef.current) {
        // Verificar que la respuesta no esté vacía
        if (response && (typeof response === 'object' ? Object.keys(response).length > 0 : true)) {
        setData(response);
        setError(null);
        setLastUpdate(new Date());
        onDataUpdate?.(response);
        } else {
          console.warn(`[useRealTimeData] Empty response received from: ${endpoint}`);
          setData(null);
          setError('No hay datos disponibles');
        }
      }
    } catch (err: any) {
      console.error(`[useRealTimeData] Error fetching data from ${endpoint}:`, err);
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        setData(null);
        onError?.(err);
        
        // Si es un error 401/403, detener el polling
        if (err.message?.includes('401') || err.message?.includes('403')) {
          console.warn(`[useRealTimeData] Auth error detected, stopping polling for ${endpoint}`);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        hasInitializedRef.current = true;
      }
    }
  }, [endpoint, enabled, onDataUpdate, onError]);

  // Inicializar datos solo una vez
  useEffect(() => {
    if (!hasInitializedRef.current && enabled) {
      console.log(`[useRealTimeData] Initializing data fetch for: ${endpoint}`);
    fetchData();
    }
  }, [fetchData, enabled]);

  // Configurar polling solo después de la inicialización
  useEffect(() => {
    if (!enabled || !hasInitializedRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Solo iniciar polling si no hay error de autenticación
    if (!error || (!error.includes('401') && !error.includes('403'))) {
      console.log(`[useRealTimeData] Starting polling for: ${endpoint} (interval: ${interval}ms)`);
    intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalRef.current) {
        console.log(`[useRealTimeData] Stopping polling for: ${endpoint}`);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, interval, enabled, error]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      console.log(`[useRealTimeData] Component unmounting, cleaning up: ${endpoint}`);
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const refresh = useCallback(() => {
    console.log(`[useRealTimeData] Manual refresh triggered for: ${endpoint}`);
    fetchData();
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    console.log(`[useRealTimeData] Manual stop polling for: ${endpoint}`);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!intervalRef.current && enabled && hasInitializedRef.current) {
      console.log(`[useRealTimeData] Manual start polling for: ${endpoint}`);
      intervalRef.current = setInterval(fetchData, interval);
    }
  }, [fetchData, interval, enabled]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    stopPolling,
    startPolling,
    isPolling: !!intervalRef.current
  };
};

// Hook específico para estadísticas del dashboard
export const useDashboardStats = (userRole: 'student' | 'company' | 'admin') => {
  let endpoint = '';
  if (userRole === 'student') endpoint = `${API_ENDPOINTS.DASHBOARD}student_stats/`;
  else if (userRole === 'company') endpoint = `${API_ENDPOINTS.DASHBOARD}company_stats/`;
  else if (userRole === 'admin') endpoint = `${API_ENDPOINTS.DASHBOARD}admin_stats/`;
  
  console.log(`[useDashboardStats] Initializing for role: ${userRole}, endpoint: ${endpoint}`);
  console.log(`[useDashboardStats] API_ENDPOINTS.DASHBOARD: ${API_ENDPOINTS.DASHBOARD}`);
  
  return useRealTimeData({
    endpoint,
    interval: 30000, // Actualizar cada 30 segundos
    enabled: true,
    onError: (error) => {
      console.error(`[useDashboardStats] Error for ${userRole}:`, error);
    }
  });
};

// Hook específico para proyectos
export const useProjects = () => {
  return useRealTimeData({
    endpoint: `${API_ENDPOINTS.PROJECTS}my-projects/`,
    interval: 45000, // Actualizar cada 45 segundos
    enabled: true
  });
};

// Hook específico para aplicaciones
export const useApplications = () => {
  return useRealTimeData({
    endpoint: `${API_ENDPOINTS.PROJECT_APPLICATIONS}my-applications/`,
    interval: 30000, // Actualizar cada 30 segundos
    enabled: true
  });
};

// Hook específico para eventos del calendario
export const useCalendarEvents = (userRole: 'student' | 'company') => {
  const endpoint = `${API_ENDPOINTS.CALENDAR_EVENTS}${userRole}-events/`;
  
  return useRealTimeData({
    endpoint,
    interval: 60000, // Actualizar cada minuto
    enabled: true
  });
}; 