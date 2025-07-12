import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { User, LoginResponse, RegisterData } from '../types';


export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Get user data from profile endpoint
    try {
        const user = await apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
      localStorage.setItem('user', JSON.stringify(user));
      return { ...response, user };
    } catch (error) {
      console.warn('Could not fetch user profile, using basic response');
      return response;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<{ message: string; user: User }> {
    try {
      const response = await apiService.post<{ message: string; user: User }>(API_ENDPOINTS.AUTH_REGISTER, userData);
    return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiService.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.warn('Logout endpoint not available, clearing local storage only');
    } finally {
      // Clear all stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get user from API endpoint
      const user = await apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
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

    try {
      const response = await apiService.post<{ access: string }>(API_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken
    });

    // Update stored access token
    localStorage.setItem('accessToken', response.access);
    return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>(API_ENDPOINTS.PASSWORDS_CHANGE, data);
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
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