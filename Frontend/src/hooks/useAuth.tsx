import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, role: UserRole, name: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar llamada real a la API
      // Por ahora, simulamos una respuesta exitosa con credenciales mock
      let mockUser: User;

      // Credenciales de administrador
      if (email === 'admin@leanmaker.com' && password === 'Admin123!') {
        mockUser = {
          id: '1',
          email,
          role: 'admin',
          name: 'Administrador',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } 
      // Credenciales de empresa
      else if (email === 'empresa@leanmaker.com' && password === 'Empresa123!') {
        mockUser = {
          id: '2',
          email,
          role: 'company',
          name: 'Empresa Demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      // Credenciales de estudiante
      else if (email === 'estudiante@leanmaker.com' && password === 'Estudiante123!') {
        mockUser = {
          id: '3',
          email,
          role: 'student',
          name: 'Estudiante Demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      else {
        throw new Error('Credenciales inválidas');
      }

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (email: string, role: UserRole, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar llamada real a la API
      // Por ahora, simulamos una respuesta exitosa
      const mockUser: User = {
        id: '1',
        email,
        role,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 