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
  DashboardStats,
  StrikeReport 
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
  position: backendUser.position,         // <--- INCLUIDO
  department: backendUser.department,     // <--- INCLUIDO
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
  name: backendStudent.name || backendStudent.user_data?.full_name || backendStudent.email || 'Sin nombre',
  email: backendStudent.email || backendStudent.user_data?.email || 'Sin email',
  career: backendStudent.career,
  semester: backendStudent.semester,
  graduation_year: backendStudent.graduation_year,
  status: backendStudent.status,
  api_level: backendStudent.api_level,
  trl_level: backendStudent.trl_level, // <-- Añadido correctamente
  strikes: backendStudent.strikes,
  gpa: Number(backendStudent.gpa),
  completed_projects: backendStudent.completed_projects,
  total_hours: backendStudent.total_hours || 0,
  experience_years: backendStudent.experience_years || 0,
  portfolio_url: backendStudent.portfolio_url,
  github_url: backendStudent.github_url,
  linkedin_url: backendStudent.linkedin_url,
  cv_link: backendStudent.cv_link, // <-- AÑADIDO
  certificado_link: backendStudent.certificado_link, // <-- AÑADIDO
  availability: backendStudent.availability || 'flexible',
  location: backendStudent.location,
  area: backendStudent.area, // <-- AÑADIDO
  rating: backendStudent.rating || 0,
  skills: parseJsonArray(backendStudent.skills),
  languages: parseJsonArray(backendStudent.languages),
  created_at: backendStudent.created_at,
  updated_at: backendStudent.updated_at,
  user_data: backendStudent.user_data, // <-- Añadido
  perfil_detallado: backendStudent.perfil_detallado, // <-- AÑADIDO
  bio: backendStudent.bio, // <-- AÑADIDO para carta de presentación
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
  // Campos adicionales del registro de empresa
  rut: backendCompany.rut,
  personality: backendCompany.personality,
  business_name: backendCompany.business_name,
});

/**
 * Adapta un proyecto del backend al formato del frontend
 */
export const adaptProject = (backendProject: any): Project => {
  // Mapeo de status_name del backend a status del frontend
  let status = 'published'; // Por defecto 'published' para que siempre se muestre
  
  // Manejar diferentes formatos de status que puede devolver el backend
  const statusValue = backendProject.status_name || backendProject.status;
  if (statusValue) {
    switch (statusValue.toLowerCase()) {
      case 'publicado':
      case 'published':
        status = 'published'; break;
      case 'activo':
      case 'active':
        status = 'active'; break;
      case 'completado':
      case 'completed':
        status = 'completed'; break;
      case 'deleted':
        status = 'deleted'; break;
      default:
        status = 'published'; // Por defecto publicado
    }
  }
  
  return {
    id: String(backendProject.id),
    title: backendProject.title || backendProject.titulo || 'Sin título',
    description: backendProject.description || backendProject.descripcion || 'Sin descripción',
    company: String(backendProject.company_id || backendProject.company || ''),
    area: String(backendProject.area_name || backendProject.area || ''),
    status,
    requirements: backendProject.requirements || backendProject.requisitos || 'Sin requisitos especificados',
    min_api_level: backendProject.api_level || backendProject.min_api_level || 1,
    max_students: backendProject.max_students || backendProject.max_estudiantes || 1,
    current_students: backendProject.current_students || 0,
    applications_count: backendProject.applications_count || 0,
    modality: backendProject.modality || backendProject.modalidad || 'remote',
    duration_weeks: backendProject.duration_weeks || backendProject.duracion_semanas || 12,
    hours_per_week: backendProject.hours_per_week || backendProject.horas_por_semana || 20,
    required_hours: backendProject.required_hours || 0,
    stipend_amount: backendProject.stipend_amount || backendProject.monto_stipendio || 0,
    stipend_currency: backendProject.stipend_currency || backendProject.moneda_stipendio || 'CLP',
    technologies: backendProject.technologies || [],
    benefits: backendProject.benefits || backendProject.beneficios || [],
    application_deadline: backendProject.application_deadline || backendProject.fecha_limite_postulacion || null,
    start_date: backendProject.start_date || backendProject.fecha_inicio || null,
    estimated_end_date: backendProject.estimated_end_date || backendProject.end_date || backendProject.fecha_fin_estimado || null,
    location: backendProject.location || 'No especificada',
    difficulty: translateDifficulty(backendProject.difficulty || 'intermediate'),
    is_featured: backendProject.is_featured || false,
    is_urgent: backendProject.is_urgent || false,
    created_by: String(backendProject.created_by || ''),
    created_at: backendProject.created_at || new Date().toISOString(),
    updated_at: backendProject.updated_at || new Date().toISOString(),
  };
};

/**
 * Adapta una aplicación del backend al formato del frontend
 * Maneja la estructura anidada que devuelve el backend Django
 */
export const adaptApplication = (backendApplication: any): Application => {
  // Extraer datos del proyecto (estructura anidada del backend)
  const project = backendApplication.project || {};
  const student = backendApplication.student || {};
  const company = project.company || {};

  return {
    id: String(backendApplication.id),
    project: String(project.id || backendApplication.project || ''),
    // CAMBIO: student ahora es el objeto adaptado
    student: adaptStudent(student),
    status: backendApplication.status || 'pending',
    cover_letter: backendApplication.cover_letter || '',
    company_notes: backendApplication.company_notes || '',
    student_notes: backendApplication.student_notes || '',
    portfolio_url: backendApplication.portfolio_url || '',
    github_url: backendApplication.github_url || '',
    linkedin_url: backendApplication.linkedin_url || '',
    applied_at: backendApplication.applied_at || backendApplication.created_at || new Date().toISOString(),
    reviewed_at: backendApplication.reviewed_at || null,
    responded_at: backendApplication.responded_at || null,
    created_at: backendApplication.created_at || new Date().toISOString(),
    updated_at: backendApplication.updated_at || new Date().toISOString(),
    // Campos adicionales extraídos de la estructura anidada del backend
    project_title: project.title || backendApplication.project_title || 'Proyecto no encontrado',
    project_description: project.description || 'Sin descripción',
    requirements: project.requirements || '',
    projectDuration: project.duration_weeks ? `${project.duration_weeks} semanas` : '',
    location: project.location || '',
    modality: project.modality || '',
    difficulty: project.difficulty || '',
    required_hours: project.required_hours || '',
    hours_per_week: project.hours_per_week || '',
    max_students: project.max_students || '',
    current_students: project.current_students || '',
    trl_level: project.trl_level || '',
    api_level: project.api_level || '',
    area: project.area || '',
    company: project.company_name || company.company_name || company.name || backendApplication.company_name || 'Sin empresa',
    // Campos adicionales para el perfil completo del estudiante
    student_name: student.name || student.full_name || backendApplication.student_name || 'Estudiante no encontrado',
    student_email: student.email || backendApplication.student_email || 'Sin email',
    // Skills y requisitos
    requiredSkills: Array.isArray(project.requirements) ? project.requirements : (typeof project.requirements === 'string' && project.requirements ? project.requirements.split(',').map((s: string) => s.trim()) : []),
    compatibility: backendApplication.compatibility_score || 0,
    notes: backendApplication.student_notes || backendApplication.cover_letter || undefined,
  };
};

/**
 * Adapta una evaluación del backend al formato del frontend
 */
export const adaptEvaluation = (backendEvaluation: any): Evaluation => {
  // Extraer datos del proyecto si está anidado
  const project = backendEvaluation.project || {};
  const student = backendEvaluation.student || {};
  const company = project.company || {};
  
  return {
    id: String(backendEvaluation.id),
    project_id: String(backendEvaluation.project_id || project.id || backendEvaluation.project || ''),
    project_title: backendEvaluation.project_title || project.title || 'Sin título',
    student_id: String(backendEvaluation.student_id || student.id || backendEvaluation.student || ''),
    student_name: backendEvaluation.student_name || student.name || student.full_name || 'Sin nombre',
    company_id: String(backendEvaluation.company_id || company.id || backendEvaluation.company || ''),
    company_name: backendEvaluation.company_name || company.company_name || company.name || 'Sin empresa',
    evaluator_id: String(backendEvaluation.evaluator_id || backendEvaluation.evaluator || ''),
    evaluator_name: backendEvaluation.evaluator_name || 'Sin evaluador',
    evaluator_type: backendEvaluation.evaluator_type || backendEvaluation.evaluator_role || 'company',
    score: Number(backendEvaluation.score || backendEvaluation.overall_rating || 0),
    comments: backendEvaluation.comments || '',
    evaluation_date: backendEvaluation.evaluation_date || backendEvaluation.created_at || new Date().toISOString(),
    status: backendEvaluation.status || 'pending',
    created_at: backendEvaluation.created_at || new Date().toISOString(),
    updated_at: backendEvaluation.updated_at || new Date().toISOString(),
    // Campos adicionales para compatibilidad
    strengths: backendEvaluation.strengths || '',
    areas_for_improvement: backendEvaluation.areas_for_improvement || '',
    project_duration: backendEvaluation.project_duration || '',
    technologies: backendEvaluation.technologies || '',
    deliverables: backendEvaluation.deliverables || '',
    category_scores: backendEvaluation.category_scores || [],
  };
};

/**
 * Adapta una notificación del backend al formato del frontend
 */
export const adaptNotification = (backendNotification: any): Notification => ({
  id: String(backendNotification.id),
  user: String(backendNotification.user_id || backendNotification.user || ''),
  title: backendNotification.title,
  message: backendNotification.message,
  type: backendNotification.type,
  priority: backendNotification.priority || 'normal',
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
  student: String(backendStrike.student_id || backendStrike.student),
  project: backendStrike.project_id || backendStrike.project ? String(backendStrike.project_id || backendStrike.project) : undefined,
  reason: backendStrike.reason,
  description: backendStrike.description,
  severity: backendStrike.severity,
  issued_by: String(backendStrike.issued_by_id || backendStrike.issued_by),
  issued_at: backendStrike.issued_at,
  expires_at: backendStrike.expires_at,
  is_active: backendStrike.is_active,
  created_at: backendStrike.created_at,
  updated_at: backendStrike.updated_at,
  // Campos adicionales para información anidada
  student_name: backendStrike.student_name,
  company_name: backendStrike.company_name,
  project_title: backendStrike.project_title,
  issued_by_name: backendStrike.issued_by_name,
});

/**
 * Adapta un reporte de strike del backend al formato del frontend
 */
export const adaptStrikeReport = (backendReport: any): StrikeReport => ({
  id: String(backendReport.id),
  company_id: String(backendReport.company_id),
  company_name: backendReport.company_name,
  student_id: String(backendReport.student_id),
  student_name: backendReport.student_name,
  project_id: String(backendReport.project_id),
  project_title: backendReport.project_title,
  reason: backendReport.reason,
  description: backendReport.description,
  status: backendReport.status,
  reviewed_by_id: backendReport.reviewed_by_id ? String(backendReport.reviewed_by_id) : undefined,
  reviewed_by_name: backendReport.reviewed_by_name,
  reviewed_at: backendReport.reviewed_at,
  admin_notes: backendReport.admin_notes,
  created_at: backendReport.created_at,
  updated_at: backendReport.updated_at,
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
  priority: backendEvent.priority || 'normal',
  start: backendEvent.start_date ? new Date(backendEvent.start_date) : null,
  end: backendEvent.end_date ? new Date(backendEvent.end_date) : null,
  start_date: backendEvent.start_date,
  end_date: backendEvent.end_date,
  all_day: backendEvent.all_day,
  location: backendEvent.location,
  attendees: backendEvent.attendees?.map((id: any) => String(id)) || [],
  created_by: String(backendEvent.created_by),
  created_at: backendEvent.created_at,
  updated_at: backendEvent.updated_at,
  project: backendEvent.project ? String(backendEvent.project) : undefined,
  project_title: backendEvent.project_title || (backendEvent.project && backendEvent.project.title) || undefined,
});

/**
 * Adapta estadísticas del dashboard del backend al formato del frontend
 */
export const adaptDashboardStats = (backendStats: any): DashboardStats => ({
  total_users: backendStats.total_users || 0,
  active_users: backendStats.active_users || 0,
  verified_users: backendStats.verified_users || 0,
  students: backendStats.total_students || 0, // Corregido: total_students del backend
  companies: backendStats.total_companies || 0, // Corregido: total_companies del backend
  total_projects: backendStats.total_projects || 0,
  active_projects: backendStats.active_projects || 0,
  total_applications: backendStats.total_applications || 0,
  pending_applications: backendStats.pending_applications || 0,
  strikes_alerts: backendStats.strikes_alerts || 0, // Agregado para coincidir con el backend
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
  Array.isArray(backendProjects) ? backendProjects.map(adaptProject) : [];

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

export const translateDifficulty = (difficulty: string): string => {
  switch (difficulty) {
    case 'intermediate':
      return 'Intermedio';
    case 'intermediate-advanced':
      return 'Intermedio-Avanzado';
    case 'advanced':
      return 'Avanzado';
    default:
      return difficulty;
  }
}; 