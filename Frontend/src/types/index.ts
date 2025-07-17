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
  position?: string;         // <--- INCLUIDO
  department?: string;       // <--- INCLUIDO
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
  // Campos del perfil de estudiante si aplica
  student_profile?: Student;
  // Campos del perfil de empresa si aplica
  company_profile?: Company;
}

// Tipos de estudiante - Coinciden con el modelo Estudiante del backend
export interface Student {
  id: string; // Cambiado a string para UUID
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
  // Campo adicional para datos del usuario (nueva estructura del backend)
  user_data?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    is_active: boolean;
    is_verified: boolean;
    date_joined: string;
    last_login?: string;
    full_name?: string;
  };
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
  area: string; // UUID del área
  status: string; // UUID del estado del proyecto
  requirements: string;
  min_api_level: number;
  max_students: number;
  current_students: number;
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
  created_by: string; // UUID del creador
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
  // Campos adicionales para información anidada del backend
  project_title?: string;
  project_description?: string;
  student_name?: string;
  student_email?: string;
  company_name?: string;
}

// Tipos de evaluación - Coinciden con el modelo Evaluacion del backend
export interface Evaluation {
  id: string;
  project_id: string; // UUID del proyecto
  project_title: string; // Título del proyecto
  student_id: string; // UUID del estudiante
  student_name: string; // Nombre del estudiante
  company_id: string; // UUID de la empresa
  company_name: string; // Nombre de la empresa
  evaluator_id: string; // UUID del evaluador
  evaluator_name: string; // Nombre del evaluador
  evaluator_type: 'company' | 'admin' | 'student'; // Tipo de evaluador
  score: number; // Calificación (1-5 estrellas)
  comments?: string; // Comentarios de la evaluación
  evaluation_date: string; // Fecha de evaluación
  status: 'pending' | 'completed' | 'flagged'; // Estado de la evaluación
  created_at: string;
  updated_at: string;
  // Campos adicionales para compatibilidad
  strengths?: string; // Fortalezas del evaluado
  areas_for_improvement?: string; // Áreas de mejora
  project_duration?: string; // Duración del proyecto
  technologies?: string; // Tecnologías utilizadas
  deliverables?: string; // Entregables del proyecto
  category_scores?: Array<{
    category_id: string;
    category_name: string;
    rating: number;
  }>; // Puntajes por categoría
}

// Tipos de notificación - Coinciden con el modelo Notificacion del backend
export interface Notification {
  id: string;
  user: string; // UUID del usuario
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
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
  // Campos adicionales para información anidada
  student_name?: string;
  company_name?: string;
  project_title?: string;
  issued_by_name?: string;
}

// Tipos de reporte de strike - Para reportes de empresas sobre estudiantes
export interface StrikeReport {
  id: string;
  company_id: string;
  company_name: string;
  student_id: string;
  student_name: string;
  project_id: string;
  project_title: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_id?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
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
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  attendees: string[]; // Array de UUIDs de usuarios
  created_by: string; // UUID del creador
  created_at: string;
  updated_at: string;
}

// Tipos de cuestionario - Coinciden con el modelo Cuestionario del backend
export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  created_by: string; // UUID del creador
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  questionnaire: string; // UUID del cuestionario
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  required: boolean;
  choices?: Choice[];
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  question: string; // UUID de la pregunta
  text: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question: string; // UUID de la pregunta
  user: string; // UUID del usuario
  value: string;
  created_at: string;
  updated_at: string;
}

// Tipos de área - Coinciden con el modelo Area del backend
export interface Area {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de nivel TRL - Coinciden con el modelo TRLLevel del backend
export interface TRLLevel {
  id: string;
  name: string;
  description?: string;
  level: number;
  created_at: string;
  updated_at: string;
}

// Tipos de estado de proyecto - Coinciden con el modelo ProjectStatus del backend
export interface ProjectStatus {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de asignación - Coinciden con el modelo Assignment del backend
export interface Assignment {
  id: string;
  project: string; // UUID del proyecto
  student: string; // UUID del estudiante
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  assigned_by: string; // UUID del asignador
  created_at: string;
  updated_at: string;
}

// Tipos de categoría de evaluación - Coinciden con el modelo EvaluationCategory del backend
export interface EvaluationCategory {
  id: string;
  name: string;
  description?: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

// Tipos de calificación - Coinciden con el modelo Rating del backend
export interface Rating {
  id: string;
  rater: string; // UUID del evaluador
  rated: string; // UUID del evaluado
  project?: string; // UUID del proyecto
  score: number;
  comments?: string;
  category?: string; // UUID de la categoría
  created_at: string;
  updated_at: string;
}

// Tipos de respuesta de API genérica
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

// Tipos de respuesta de login
export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

// Tipos de datos de registro
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

// Tipos de formulario de login
export interface LoginFormData {
  email: string;
  password: string;
}

// Tipos de cambio de contraseña
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Tipos de estadísticas del dashboard
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

// Universidades disponibles
export const UNIVERSITIES = [
  'Universidad Nacional Autónoma de México (UNAM)',
  'Instituto Politécnico Nacional (IPN)',
  'Universidad Autónoma Metropolitana (UAM)',
  'Instituto Tecnológico y de Estudios Superiores de Monterrey (ITESM)',
  'Universidad Iberoamericana (UIA)',
  'Universidad Anáhuac',
  'Universidad del Valle de México (UVM)',
  'Universidad La Salle',
  'Universidad Panamericana',
  'Instituto Tecnológico Autónomo de México (ITAM)',
  'Otra'
] as const;

export type University = typeof UNIVERSITIES[number]; 