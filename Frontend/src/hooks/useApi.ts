import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await apiService.get<T>(url);
        setState({ data, loading: false, error: null });
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || error.message || 'Error desconocido',
        });
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiService.get<T>(url);
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || error.message || 'Error desconocido',
      });
    }
  };

  return { ...state, refetch };
}