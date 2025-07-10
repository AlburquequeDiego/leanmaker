import { authService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Construir URL completa - usar proxy en desarrollo
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    console.log(`[apiService] Making request to: ${url}`);
    console.log(`[apiService] API_BASE_URL: ${API_BASE_URL}`);
    console.log(`[apiService] Endpoint: ${endpoint}`);
    
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
        console.error(`[apiService] HTTP error ${response.status}:`, errorData);
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`[apiService] Response data:`, data);
        return data;
      }
      
      console.warn(`[apiService] No JSON content type, returning empty object`);
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