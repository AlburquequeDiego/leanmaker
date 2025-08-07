export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints (estos sí existen en el backend)
  LOGIN: '/api/token/',
  REFRESH_TOKEN: '/api/token/refresh/',
  VERIFY_TOKEN: '/api/token/verify/',
  AUTH_REGISTER: '/api/auth/register/',
  AUTH_LOGOUT: '/api/auth/logout/',
  
  // User endpoints
  USERS: '/api/users/',
  USER_PROFILE: '/api/users/profile/',
  PASSWORDS_CHANGE: '/api/users/change-password/',
  
  // Dashboard (estos existen)
  DASHBOARD: '/api/dashboard/',
  DASHBOARD_COMPANY_STATS: '/api/dashboard/company_stats/',
  DASHBOARD_STUDENT_STATS: '/api/dashboard/student_stats/',
  DASHBOARD_ADMIN_STATS: '/api/dashboard/admin_stats/',
  
  // Students (endpoints reales del backend)
  STUDENTS: '/api/students/',
  STUDENT_ME: '/api/students/me/',
  STUDENT_DETAIL: '/api/students/{id}/',
  STUDENT_API_LEVEL_REQUEST: '/api/students/api-level-request/',
  STUDENT_API_LEVEL_REQUESTS: '/api/students/api-level-requests/',
  STUDENT_ADMIN_API_LEVEL_REQUESTS: '/api/students/admin/api-level-requests/',
  STUDENT_ADMIN_SUSPEND: '/api/students/admin/{id}/suspend/',
  STUDENT_ADMIN_ACTIVATE: '/api/students/admin/{id}/activate/',
  STUDENT_ADMIN_BLOCK: '/api/students/admin/{id}/block/',
  
  // Companies (endpoints reales del backend)
  COMPANIES: '/api/companies/',
  COMPANY_DETAIL: '/api/companies/{id}/',
  COMPANY_UPDATE: '/api/companies/{id}/update/',
  COMPANY_ME: '/api/companies/company_me/',
  COMPANY_ADMIN_SUSPEND: '/api/companies/admin/{id}/suspend/',
  COMPANY_ADMIN_ACTIVATE: '/api/companies/admin/{id}/activate/',
  COMPANY_ADMIN_BLOCK: '/api/companies/admin/{id}/block/',
  
  // Projects (endpoints reales del backend)
  PROJECTS: '/api/projects/',
  PROJECT_CREATE: '/api/projects/create/',
  PROJECT_DETAIL: '/api/projects/{id}/detail/',
  PROJECT_UPDATE: '/api/projects/{id}/',
  PROJECT_DELETE: '/api/projects/{id}/delete/',
  PROJECT_MY_PROJECTS: '/api/projects/my_projects/',
  PROJECT_COMPANY_PROJECTS: '/api/projects/company_projects/',
  
  // Applications (endpoints reales del backend)
  APPLICATIONS: '/api/applications/',
  APPLICATIONS_RECEIVED: '/api/applications/received_applications/',
  APPLICATIONS_MY: '/api/applications/my_applications/',
  
  // Areas (endpoints reales del backend)
  AREAS: '/api/areas/',
  
  // Evaluations (endpoints reales del backend)
  EVALUATIONS: '/api/evaluations/',
  EVALUATIONS_BY_PROJECT: '/api/evaluations/by_project/{project_id}/',
  EVALUATIONS_CREATE: '/api/evaluations/create/',
  EVALUATIONS_DETAIL: '/api/evaluations/{id}/',
  EVALUATIONS_UPDATE: '/api/evaluations/{id}/update/',
  
  // Notifications (endpoints reales del backend)
  NOTIFICATIONS: '/api/notifications/',
  MASS_NOTIFICATIONS: '/api/mass-notifications/',
  
  // Calendar Events (endpoints reales del backend)
  CALENDAR_EVENTS: '/api/calendar/events/',
  
  // Work Hours (endpoints reales del backend)
  WORK_HOURS: '/api/work-hours/',
  
  // Interviews (endpoints reales del backend)
  INTERVIEWS: '/interviews/',
  
  // Strikes (endpoints reales del backend)
  STRIKES: '/api/strikes/',
  
  // Questionnaires (endpoints reales del backend)
  QUESTIONNAIRES: '/questionnaires/',
  
  // TRL Levels (endpoints reales del backend)
  TRL_LEVELS: '/trl-levels/',
  
  // Project Status (endpoints reales del backend)
  PROJECT_STATUS: '/project-status/',
  
  // Assignments (endpoints reales del backend)
  ASSIGNMENTS: '/assignments/',
  
  // Evaluation Categories (endpoints reales del backend)
  EVALUATION_CATEGORIES: '/evaluation-categories/',
  
  // Ratings (endpoints reales del backend)
  RATINGS: '/ratings/',
  
  // Admin (endpoints reales del backend)
  ADMIN: '/api/admin/',
  
  // Health check
  HEALTH: '/api/health-simple/',
  
  // Test endpoints (temporales)
  TEST_PROJECTS: '/api/test-projects/',
  TEST_ADMIN_STATS: '/api/test-admin-stats/',
  TEST_AUTH_ADMIN_STATS: '/api/test-auth-admin-stats/',
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;

// Función para reemplazar parámetros en URLs
export const buildUrl = (endpoint: string, params: Record<string, string | number> = {}): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, String(value));
  });
  return url;
};