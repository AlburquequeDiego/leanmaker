/**
 * Adaptadores para mapear campos del backend (español) a tipos del frontend (inglés)
 * Mantiene la compatibilidad sin modificar el backend
 */

import type { 
  User, 
  Student, 
  Company, 
  Project, 
  Application, 
  Evaluation, 
  Notification, 
  Strike, 
  WorkHour, 
  Interview, 
  CalendarEvent,
  DashboardStats 
} from '../types';

// ============================================================================
// ADAPTADORES PRINCIPALES
// ============================================================================

/**
 * Adapta un usuario del backend al formato del frontend
 */
export const adaptUser = (backendUser: any): User => ({
  id: backendUser.id,
  email: backendUser.email,
  first_name: backendUser.first_name,
  last_name: backendUser.last_name,
  username: backendUser.username,
  phone: backendUser.phone,
  avatar: backendUser.avatar,
  bio: backendUser.bio,
  role: backendUser.role,
  is_active: backendUser.is_active,
  is_verified: backendUser.is_verified,
  is_staff: backendUser.is_staff,
  is_superuser: backendUser.is_superuser,
  date_joined: backendUser.date_joined,
  last_login: backendUser.last_login,
  created_at: backendUser.created_at,
  updated_at: backendUser.updated_at,
  full_name: backendUser.full_name,
  // Perfiles anidados se manejan por separado
  student_profile: backendUser.student_profile ? adaptStudent(backendUser.student_profile) : undefined,
  company_profile: backendUser.company_profile ? adaptCompany(backendUser.company_profile) : undefined,
});

/**
 * Adapta un estudiante del backend al formato del frontend
 */
export const adaptStudent = (backendStudent: any): Student => ({
  id: String(backendStudent.id),
  user: String(backendStudent.user),
  career: backendStudent.career,
  semester: backendStudent.semester,
  graduation_year: backendStudent.graduation_year,
  status: backendStudent.status,
  api_level: backendStudent.api_level,
  strikes: backendStudent.strikes,
  gpa: Number(backendStudent.gpa),
  completed_projects: backendStudent.completed_projects,
  total_hours: backendStudent.total_hours || 0,
  experience_years: backendStudent.experience_years || 0,
  portfolio_url: backendStudent.portfolio_url,
  github_url: backendStudent.github_url,
  linkedin_url: backendStudent.linkedin_url,
  availability: backendStudent.availability || 'flexible',
  location: backendStudent.location,
  rating: backendStudent.rating || 0,
  skills: parseJsonArray(backendStudent.skills),
  languages: parseJsonArray(backendStudent.languages),
  created_at: backendStudent.created_at,
  updated_at: backendStudent.updated_at,
});

/**
 * Adapta una empresa del backend al formato del frontend
 */
export const adaptCompany = (backendCompany: any): Company => ({
  id: String(backendCompany.id),
  user: backendCompany.user ? String(backendCompany.user) : undefined,
  company_name: backendCompany.company_name,
  description: backendCompany.description,
  industry: backendCompany.industry,
  size: backendCompany.size,
  website: backendCompany.website,
  address: backendCompany.address,
  city: backendCompany.city,
  country: backendCompany.country,
  founded_year: backendCompany.founded_year,
  logo_url: backendCompany.logo_url,
  verified: backendCompany.verified || false,
  rating: backendCompany.rating || 0,
  total_projects: backendCompany.total_projects || 0,
  projects_completed: backendCompany.projects_completed || 0,
  total_hours_offered: backendCompany.total_hours_offered || 0,
  technologies_used: parseJsonArray(backendCompany.technologies_used),
  benefits_offered: parseJsonArray(backendCompany.benefits_offered),
  remote_work_policy: backendCompany.remote_work_policy,
  internship_duration: backendCompany.internship_duration,
  stipend_range: backendCompany.stipend_range,
  contact_email: backendCompany.contact_email,
  contact_phone: backendCompany.contact_phone,
  status: backendCompany.status || 'active',
  created_at: backendCompany.created_at,
  updated_at: backendCompany.updated_at,
});

/**
 * Adapta un proyecto del backend al formato del frontend
 */
export const adaptProject = (backendProject: any): Project => {
  // Mapeo de status_name del backend a status del frontend
  let status = 'draft';
  switch ((backendProject.status_name || '').toLowerCase()) {
    case 'abierto':
      status = 'open'; break;
    case 'en progreso':
      status = 'active'; break;
    case 'completado':
      status = 'completed'; break;
    case 'cancelado':
      status = 'cancelled'; break;
    case 'publicado':
      status = 'published'; break;
    default:
      status = (backendProject.status_name || '').toLowerCase() || 'draft';
  }
  return {
    id: String(backendProject.id),
    title: backendProject.title || backendProject.titulo,
    description: backendProject.description || backendProject.descripcion,
    company: String(backendProject.company_id),
    area: String(backendProject.area_id),
    status,
    requirements: backendProject.requirements || backendProject.requisitos,
    min_api_level: backendProject.min_api_level,
    max_students: backendProject.max_students || backendProject.max_estudiantes,
    current_students: backendProject.current_students,
    modality: backendProject.modality || backendProject.modalidad,
    duration_weeks: backendProject.duration_weeks || backendProject.duracion_semanas,
    hours_per_week: backendProject.hours_per_week || backendProject.horas_por_semana,
    stipend_amount: backendProject.stipend_amount || backendProject.monto_stipendio,
    stipend_currency: backendProject.stipend_currency || backendProject.moneda_stipendio,
    technologies: backendProject.technologies,
    benefits: backendProject.benefits || backendProject.beneficios,
    application_deadline: backendProject.application_deadline || backendProject.fecha_limite_postulacion,
    start_date: backendProject.start_date || backendProject.fecha_inicio,
    end_date: backendProject.end_date || backendProject.fecha_fin_estimado,
    created_by: String(backendProject.created_by),
    created_at: backendProject.created_at,
    updated_at: backendProject.updated_at,
  };
};

/**
 * Adapta una aplicación del backend al formato del frontend
 */
export const adaptApplication = (backendApplication: any): Application => ({
  id: String(backendApplication.id),
  project: String(backendApplication.project),
  student: String(backendApplication.student),
  status: backendApplication.status,
  compatibility_score: backendApplication.compatibility_score,
  cover_letter: backendApplication.cover_letter,
  company_notes: backendApplication.company_notes,
  student_notes: backendApplication.student_notes,
  portfolio_url: backendApplication.portfolio_url,
  github_url: backendApplication.github_url,
  linkedin_url: backendApplication.linkedin_url,
  applied_at: backendApplication.applied_at,
  reviewed_at: backendApplication.reviewed_at,
  responded_at: backendApplication.responded_at,
  created_at: backendApplication.created_at,
  updated_at: backendApplication.updated_at,
});

/**
 * Adapta una evaluación del backend al formato del frontend
 */
export const adaptEvaluation = (backendEvaluation: any): Evaluation => ({
  id: String(backendEvaluation.id),
  project: String(backendEvaluation.project),
  student: String(backendEvaluation.student),
  evaluator: String(backendEvaluation.evaluator),
  category: String(backendEvaluation.category),
  score: backendEvaluation.score,
  comments: backendEvaluation.comments,
  evaluation_date: backendEvaluation.evaluation_date,
  created_at: backendEvaluation.created_at,
  updated_at: backendEvaluation.updated_at,
});

/**
 * Adapta una notificación del backend al formato del frontend
 */
export const adaptNotification = (backendNotification: any): Notification => ({
  id: String(backendNotification.id),
  user: String(backendNotification.user_id || backendNotification.user || ''),
  title: backendNotification.title,
  message: backendNotification.message,
  type: backendNotification.type,
  read: backendNotification.read,
  related_url: backendNotification.related_url,
  created_at: backendNotification.created_at,
  updated_at: backendNotification.updated_at,
});

/**
 * Adapta un strike del backend al formato del frontend
 */
export const adaptStrike = (backendStrike: any): Strike => ({
  id: String(backendStrike.id),
  student: String(backendStrike.student),
  project: backendStrike.project ? String(backendStrike.project) : undefined,
  reason: backendStrike.reason,
  description: backendStrike.description,
  severity: backendStrike.severity,
  issued_by: String(backendStrike.issued_by),
  issued_at: backendStrike.issued_at,
  expires_at: backendStrike.expires_at,
  is_active: backendStrike.is_active,
  created_at: backendStrike.created_at,
  updated_at: backendStrike.updated_at,
});

/**
 * Adapta horas trabajadas del backend al formato del frontend
 */
export const adaptWorkHour = (backendWorkHour: any): WorkHour => ({
  id: String(backendWorkHour.id),
  student: String(backendWorkHour.student),
  project: String(backendWorkHour.project),
  date: backendWorkHour.date,
  hours_worked: backendWorkHour.hours_worked,
  description: backendWorkHour.description,
  approved: backendWorkHour.approved,
  approved_by: backendWorkHour.approved_by ? String(backendWorkHour.approved_by) : undefined,
  approved_at: backendWorkHour.approved_at,
  created_at: backendWorkHour.created_at,
  updated_at: backendWorkHour.updated_at,
});

/**
 * Adapta una entrevista del backend al formato del frontend
 */
export const adaptInterview = (backendInterview: any): Interview => ({
  id: String(backendInterview.id),
  application: String(backendInterview.application),
  interviewer: String(backendInterview.interviewer),
  interview_date: backendInterview.interview_date,
  duration_minutes: backendInterview.duration_minutes,
  status: backendInterview.status,
  notes: backendInterview.notes,
  feedback: backendInterview.feedback,
  rating: backendInterview.rating,
  created_at: backendInterview.created_at,
  updated_at: backendInterview.updated_at,
});

/**
 * Adapta un evento de calendario del backend al formato del frontend
 */
export const adaptCalendarEvent = (backendEvent: any): CalendarEvent => ({
  id: String(backendEvent.id),
  title: backendEvent.title,
  description: backendEvent.description,
  event_type: backendEvent.event_type,
  start_date: backendEvent.start_date,
  end_date: backendEvent.end_date,
  all_day: backendEvent.all_day,
  location: backendEvent.location,
  attendees: backendEvent.attendees?.map((id: any) => String(id)) || [],
  created_by: String(backendEvent.created_by),
  created_at: backendEvent.created_at,
  updated_at: backendEvent.updated_at,
});

/**
 * Adapta estadísticas del dashboard del backend al formato del frontend
 */
export const adaptDashboardStats = (backendStats: any): DashboardStats => ({
  total_users: backendStats.total_users || 0,
  active_users: backendStats.active_users || 0,
  verified_users: backendStats.verified_users || 0,
  students: backendStats.students || 0,
  companies: backendStats.companies || 0,
  total_projects: backendStats.total_projects || 0,
  active_projects: backendStats.active_projects || 0,
  total_applications: backendStats.total_applications || 0,
  pending_applications: backendStats.pending_applications || 0,
});

// ============================================================================
// ADAPTADORES PARA LISTAS
// ============================================================================

/**
 * Adapta una lista de usuarios del backend
 */
export const adaptUserList = (backendUsers: any[]): User[] => 
  backendUsers.map(adaptUser);

/**
 * Adapta una lista de estudiantes del backend
 */
export const adaptStudentList = (backendStudents: any[]): Student[] => 
  backendStudents.map(adaptStudent);

/**
 * Adapta una lista de empresas del backend
 */
export const adaptCompanyList = (backendCompanies: any[]): Company[] => 
  backendCompanies.map(adaptCompany);

/**
 * Adapta una lista de proyectos del backend
 */
export const adaptProjectList = (backendProjects: any[]): Project[] => 
  backendProjects.map(adaptProject);

/**
 * Adapta una lista de aplicaciones del backend
 */
export const adaptApplicationList = (backendApplications: any[]): Application[] => 
  backendApplications.map(adaptApplication);

/**
 * Adapta una lista de notificaciones del backend
 */
export const adaptNotificationList = (backendNotifications: any[]): Notification[] => 
  backendNotifications.map(adaptNotification);

/**
 * Adapta una lista de entrevistas del backend
 */
export const adaptInterviewList = (backendInterviews: any[]): Interview[] => 
  backendInterviews.map(adaptInterview);

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Parsea un campo JSON del backend a un array
 */
const parseJsonArray = (field: any): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Adapta una respuesta paginada del backend
 */
export const adaptPaginatedResponse = <T>(
  backendResponse: any, 
  adapter: (item: any) => T
): { data: T[]; pagination: any } => {
  return {
    data: Array.isArray(backendResponse.results) 
      ? backendResponse.results.map(adapter)
      : Array.isArray(backendResponse.data)
      ? backendResponse.data.map(adapter)
      : [],
    pagination: {
      page: backendResponse.current_page || backendResponse.page || 1,
      limit: backendResponse.per_page || backendResponse.limit || 20,
      total: backendResponse.count || backendResponse.total || 0,
      pages: backendResponse.total_pages || backendResponse.pages || 1,
      has_next: backendResponse.has_next || false,
      has_previous: backendResponse.has_previous || false,
    }
  };
}; 