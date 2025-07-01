import { useState, useCallback } from 'react';
import { apiService } from '../services/api.service';
import type { ApiResponse } from '../types';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      requestFn: () => Promise<T>,
      options: UseApiOptions<T> = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await requestFn();
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        options.onFinally?.();
      }
    },
    []
  );

  const get = useCallback(
    (endpoint: string, options?: UseApiOptions<T>) => {
      return execute(() => apiService.get<T>(endpoint), options);
    },
    [execute]
  );

  const post = useCallback(
    (endpoint: string, data?: any, options?: UseApiOptions<T>) => {
      return execute(() => apiService.post<T>(endpoint, data), options);
    },
    [execute]
  );

  const put = useCallback(
    (endpoint: string, data?: any, options?: UseApiOptions<T>) => {
      return execute(() => apiService.put<T>(endpoint, data), options);
    },
    [execute]
  );

  const patch = useCallback(
    (endpoint: string, data?: any, options?: UseApiOptions<T>) => {
      return execute(() => apiService.patch<T>(endpoint, data), options);
    },
    [execute]
  );

  const del = useCallback(
    (endpoint: string, options?: UseApiOptions<T>) => {
      return execute(() => apiService.delete<T>(endpoint), options);
    },
    [execute]
  );

  const uploadFile = useCallback(
    (endpoint: string, file: File, fieldName?: string, options?: UseApiOptions<T>) => {
      return execute(() => apiService.uploadFile<T>(endpoint, file, fieldName), options);
    },
    [execute]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
    clearError,
    reset,
  };
}