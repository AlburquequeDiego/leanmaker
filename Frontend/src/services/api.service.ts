import { authService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';
import { adaptUser, adaptProject, adaptApplication, adaptStudent, adaptCompany, adaptNotification, adaptDashboardStats } from '../utils/adapters';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Construir URL completa - usar proxy en desarrollo
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Log solo en desarrollo y para endpoints importantes
    if (import.meta.env.DEV && (endpoint.includes('/api/') || endpoint.includes('/auth/'))) {
      console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
    }
    
    // Get access token
    const token = authService.getAccessToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        try {
          await authService.refreshToken();
          // Retry the request with new token
          const newToken = authService.getAccessToken();
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(url, config);
            if (retryResponse.ok) {
              const contentType = retryResponse.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return await retryResponse.json();
              }
              return {} as T;
            }
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[API Error] ${response.status} ${endpoint}:`, errorData);
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Log respuestas importantes en desarrollo
        if (import.meta.env.DEV && (endpoint.includes('/api/projects/') || endpoint.includes('/api/students/') || endpoint.includes('/api/evaluations/'))) {
          const itemCount = data.data?.length || data.results?.length || (Array.isArray(data) ? data.length : 0);
          console.log(`[API Success] ${endpoint} - ${itemCount} items`);
        }
        
        // Aplicar adaptadores según el endpoint
        return this.applyAdapter(data, endpoint) as T;
      }
      
      return {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Aplica adaptadores según el endpoint para convertir campos del backend
   */
  private applyAdapter(data: any, endpoint: string): any {
    // Si es una respuesta de error, no aplicar adaptador
    if (data.error) {
      return data;
    }

    // Aplicar adaptadores según el endpoint
    if (endpoint.includes('/api/users/profile/')) {
      return adaptUser(data);
    }
    
    if (endpoint.includes('/api/projects/')) {
      if (Array.isArray(data)) {
        return data.map(adaptProject);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptProject)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptProject)
        };
      }
      return adaptProject(data);
    }
    
    if (endpoint.includes('/api/project-applications/')) {
      if (Array.isArray(data)) {
        return data.map(adaptApplication);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptApplication)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptApplication)
        };
      }
      return adaptApplication(data);
    }
    
    if (endpoint.includes('/api/students/')) {
      if (Array.isArray(data)) {
        return data.map(adaptStudent);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptStudent)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptStudent)
        };
      }
      return adaptStudent(data);
    }
    
    if (endpoint.includes('/api/companies/')) {
      if (Array.isArray(data)) {
        return data.map(adaptCompany);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptCompany)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptCompany)
        };
      }
      return adaptCompany(data);
    }
    
    if (endpoint.includes('/api/notifications/')) {
      if (Array.isArray(data)) {
        return data.map(adaptNotification);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptNotification)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptNotification)
        };
      }
      return adaptNotification(data);
    }
    
    if (endpoint.includes('/api/dashboard/')) {
      // Solo aplicar adaptador si es el dashboard de admin
      if (endpoint.includes('/admin_stats/')) {
        return adaptDashboardStats(data);
      }
      // Para otros dashboards (company, student), devolver datos tal como están
      return data;
    }
    
    // Si no hay adaptador específico, devolver los datos tal como están
    return data;
  }

  // Upload file method
  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const token = authService.getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiService = new ApiService();