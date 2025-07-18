import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  interval = 300000, // 5 minutos por defecto
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
      setLoading(true);
      setError(null);
      
      const response = await apiService.get<T>(endpoint);
      
      if (isMountedRef.current) {
        if (response && (typeof response === 'object' ? Object.keys(response).length > 0 : true)) {
          setData(response);
          setError(null);
          setLastUpdate(new Date());
        } else {
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
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        hasInitializedRef.current = true;
      }
    }
  }, [endpoint, enabled]);

  // Inicializar datos cuando el componente se monta
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [endpoint, enabled, fetchData]);

  // Sin polling automático - solo carga inicial
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true; // <-- Esto es CLAVE para evitar el bucle infinito
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endpoint]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    // No hacer nada - polling deshabilitado
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    stopPolling,
    startPolling,
    isPolling: false // Siempre false - sin polling automático
  };
};

// Hook específico para estadísticas del dashboard
export const useDashboardStats = (userRole: 'student' | 'company' | 'admin') => {
  let endpoint = '';
  if (userRole === 'student') endpoint = API_ENDPOINTS.DASHBOARD_STUDENT_STATS;
  else if (userRole === 'company') endpoint = API_ENDPOINTS.DASHBOARD_COMPANY_STATS;
  else if (userRole === 'admin') endpoint = API_ENDPOINTS.DASHBOARD_ADMIN_STATS;
  
  return useRealTimeData({
    endpoint,
    interval: 0, // Sin polling automático
    enabled: true
  });
};

// Hook específico para proyectos
export const useProjects = () => {
  return useRealTimeData({
    endpoint: API_ENDPOINTS.PROJECT_MY_PROJECTS,
    interval: 45000, // Actualizar cada 45 segundos
    enabled: true
  });
};

// Hook específico para aplicaciones
export const useApplications = () => {
  return useRealTimeData({
    endpoint: API_ENDPOINTS.PROJECT_APPLICATIONS_MY_APPLICATIONS,
    interval: 30000, // Actualizar cada 30 segundos
    enabled: true
  });
};

// Hook específico para eventos del calendario
export const useCalendarEvents = (userRole: 'student' | 'company') => {
  const endpoint = userRole === 'student' 
    ? API_ENDPOINTS.CALENDAR_STUDENT_EVENTS 
    : API_ENDPOINTS.CALENDAR_COMPANY_EVENTS;
  
  return useRealTimeData({
    endpoint,
    interval: 60000, // Actualizar cada minuto
    enabled: true
  });
}; 