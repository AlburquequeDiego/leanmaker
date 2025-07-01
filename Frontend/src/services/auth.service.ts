import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  role?: 'admin' | 'student' | 'company';
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Get user profile and store it
    try {
      const user = await this.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<any> {
    return await apiService.post(API_ENDPOINTS.REGISTER, userData);
  }

  async logout(): Promise<void> {
    localStorage.clear();
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiService.post(API_ENDPOINTS.VERIFY_TOKEN, { token });
      return true;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();