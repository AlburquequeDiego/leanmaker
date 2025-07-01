// Tipos de usuario - Coinciden con el modelo Usuario del backend
export type UserRole = 'admin' | 'student' | 'company';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

// Tipos de estudiante - Coinciden con el modelo Estudiante del backend
export interface Student {
  id: number;
  user: string; // UUID del usuario
  career?: string;
  semester?: number;
  graduation_year?: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  api_level: number;
  strikes: number;
  gpa: number;
  completed_projects: number;
  total_hours: number;
  experience_years: number;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  availability: 'full-time' | 'part-time' | 'flexible';
  location?: string;
  rating: number;
  skills?: string[]; // JSON array
  languages?: string[]; // JSON array
  created_at: string;
  updated_at: string;
}

// Tipos de empresa - Coinciden con el modelo Empresa del backend
export interface Company {
  id: string;
  user?: string; // UUID del usuario
  company_name: string;
  description?: string;
  industry?: string;
  size?: 'Pequeña' | 'Mediana' | 'Grande' | 'Startup';
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  founded_year?: number;
  logo_url?: string;
  verified: boolean;
  rating: number;
  total_projects: number;
  projects_completed: number;
  total_hours_offered: number;
  technologies_used?: string[]; // JSON array
  benefits_offered?: string[]; // JSON array
  remote_work_policy?: 'full-remote' | 'hybrid' | 'onsite';
  internship_duration?: string;
  stipend_range?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

// Tipos de proyecto - Coinciden con el modelo Proyecto del backend
export interface Project {
  id: string;
  title: string;
  description: string;
  company: string; // UUID de la empresa
  requirements: string;
  min_api_level: number;
  max_students: number;
  current_students: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  modality: 'remote' | 'hybrid' | 'onsite';
  duration_weeks: number;
  hours_per_week: number;
  stipend_amount?: number;
  stipend_currency?: string;
  technologies: string[]; // JSON array
  benefits: string[]; // JSON array
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de aplicación - Coinciden con el modelo Aplicacion del backend
export interface Application {
  id: string;
  project: string; // UUID del proyecto
  student: string; // UUID del estudiante
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  compatibility_score?: number;
  cover_letter?: string;
  company_notes?: string;
  student_notes?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  applied_at: string;
  reviewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de evaluación - Coinciden con el modelo Evaluacion del backend
export interface Evaluation {
  id: string;
  project: string; // UUID del proyecto
  student: string; // UUID del estudiante
  evaluator: string; // UUID del evaluador
  category: string; // UUID de la categoría
  score: number;
  comments?: string;
  evaluation_date: string;
  created_at: string;
  updated_at: string;
}

// Tipos de notificación - Coinciden con el modelo Notificacion del backend
export interface Notification {
  id: string;
  user: string; // UUID del usuario
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_url?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de strike - Coinciden con el modelo Strike del backend
export interface Strike {
  id: string;
  student: string; // UUID del estudiante
  project?: string; // UUID del proyecto
  reason: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
  issued_by: string; // UUID del usuario que emitió el strike
  issued_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de horas trabajadas - Coinciden con el modelo WorkHour del backend
export interface WorkHour {
  id: string;
  student: string; // UUID del estudiante
  project: string; // UUID del proyecto
  date: string;
  hours_worked: number;
  description?: string;
  approved: boolean;
  approved_by?: string; // UUID del aprobador
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de entrevista - Coinciden con el modelo Entrevista del backend
export interface Interview {
  id: string;
  application: string; // UUID de la aplicación
  interviewer: string; // UUID del entrevistador
  interview_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

// Tipos de evento de calendario - Coinciden con el modelo CalendarEvent del backend
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'meeting' | 'deadline' | 'reminder' | 'interview' | 'other';
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  attendees: string[]; // Array de UUIDs de usuarios
  created_by: string; // UUID del creador
  created_at: string;
  updated_at: string;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  username?: string;
  phone?: string;
}

// Tipos para formularios
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Tipos para dashboard
export interface DashboardStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  students: number;
  companies: number;
  total_projects: number;
  active_projects: number;
  total_applications: number;
  pending_applications: number;
}

// Tipos para universidades (las 10 permitidas)
export const UNIVERSITIES = [
  'Universidad de Chile',
  'Pontificia Universidad Católica de Chile',
  'Universidad de Concepción',
  'Universidad Técnica Federico Santa María',
  'Universidad de Santiago de Chile',
  'Universidad Austral de Chile',
  'Universidad de Valparaíso',
  'Universidad de La Frontera',
  'Universidad de Talca',
  'Universidad de Antofagasta'
] as const;

export type University = typeof UNIVERSITIES[number]; 