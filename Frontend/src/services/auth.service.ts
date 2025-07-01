import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { User, LoginResponse, RegisterData } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Store user data from the response
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<{ message: string; user: User }> {
    const response = await apiService.post<{ message: string; user: User }>(API_ENDPOINTS.REGISTER, userData);
    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout endpoint not available, clearing local storage only');
    } finally {
      // Clear all stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const user = await apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiService.post(API_ENDPOINTS.VERIFY_TOKEN, { token });
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<{ access: string }>(API_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken
    });

    // Update stored access token
    localStorage.setItem('accessToken', response.access);
    return response;
  }

  async changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>(API_ENDPOINTS.CHANGE_PASSWORD, data);
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

  // Helper method to check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Helper method to check if user is student
  isStudent(): boolean {
    return this.hasRole('student');
  }

  // Helper method to check if user is company
  isCompany(): boolean {
    return this.hasRole('company');
  }
}

export const authService = new AuthService();