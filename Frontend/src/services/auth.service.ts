import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: RegisterData): Promise<any> {
    return await apiService.post(API_ENDPOINTS.REGISTER, userData);
  }

  async logout(): Promise<void> {
    localStorage.clear();
  }

  async getCurrentUser(): Promise<any> {
    return await apiService.get(API_ENDPOINTS.USER_PROFILE);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();