import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api.service';

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

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      const response = await apiService.get<T>(endpoint);
      
      if (isMountedRef.current) {
        setData(response);
        setError(null);
        setLastUpdate(new Date());
        onDataUpdate?.(response);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        onError?.(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, enabled, onDataUpdate, onError]);

  // Inicializar datos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configurar polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, interval, enabled]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
    if (!intervalRef.current && enabled) {
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
  const endpoint = `/api/dashboard/${userRole}_stats/`;
  
  return useRealTimeData({
    endpoint,
    interval: 30000, // Actualizar cada 30 segundos
    enabled: true
  });
};

// Hook específico para proyectos
export const useProjects = () => {
  return useRealTimeData({
    endpoint: '/api/projects/my_projects/',
    interval: 45000, // Actualizar cada 45 segundos
    enabled: true
  });
};

// Hook específico para aplicaciones
export const useApplications = () => {
  return useRealTimeData({
    endpoint: '/api/project-applications/my_applications/',
    interval: 30000, // Actualizar cada 30 segundos
    enabled: true
  });
};

// Hook específico para eventos del calendario
export const useCalendarEvents = (userRole: 'student' | 'company') => {
  const endpoint = `/api/calendar-events/${userRole}_events/`;
  
  return useRealTimeData({
    endpoint,
    interval: 60000, // Actualizar cada minuto
    enabled: true
  });
}; 