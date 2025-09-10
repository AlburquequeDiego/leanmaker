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
      this.clearLocalStorage();
    }
  }

  // Método para limpiar completamente el localStorage
  clearLocalStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Limpiar cualquier otro dato relacionado con la autenticación
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Primero intentar obtener el usuario del localStorage
      const storedUser = this.getUser();
      if (storedUser) {
        return storedUser;
      }
      
      // Si no hay usuario almacenado, obtenerlo del API
      console.log('Obteniendo usuario del API...');
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

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiService.post('/api/users/password-reset/request/', { email });
  }

  async validatePasswordResetCode(email: string, code: string): Promise<{ message: string }> {
    return apiService.post('/api/users/password-reset/validate/', { email, code });
  }

  async confirmPasswordReset(email: string, code: string, new_password: string): Promise<{ message: string }> {
    return apiService.post('/api/users/password-reset/confirm/', { email, code, new_password });
  }

  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }
    
    // Verificar si el token está expirado sin hacer request al backend
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Si el token expira en menos de 5 minutos, considerarlo como expirado
      if (payload.exp < now + 300) {
        this.clearLocalStorage();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      this.clearLocalStorage();
      return false;
    }
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

  // Helper method to check if user is teacher
  isTeacher(): boolean {
    return this.hasRole('teacher');
  }
}

export const authService = new AuthService();