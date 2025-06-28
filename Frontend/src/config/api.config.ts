export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login/',
  REFRESH_TOKEN: '/api/auth/refresh/',
  REGISTER: '/api/auth/register/',
  
  // User endpoints
  USER_PROFILE: '/api/users/me/',
  
  // Add more endpoints as needed
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;