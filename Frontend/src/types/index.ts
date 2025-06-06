// Tipos de usuario
export type UserRole = 'student' | 'company';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de proyecto
export interface Project {
  id: string;
  title: string;
  description: string;
  companyId: string;
  requirements: string[];
  status: 'open' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Tipos de postulación
export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Tipos de notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
} 