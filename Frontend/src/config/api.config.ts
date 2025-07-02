export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/token/',
  REFRESH_TOKEN: '/api/token/refresh/',
  VERIFY_TOKEN: '/api/token/verify/',
  REGISTER: '/api/users/register/',
  LOGOUT: '/api/auth/logout/',
  CHANGE_PASSWORD: '/api/users/passwords/change/',
  
  // User endpoints
  USERS: '/api/users/',
  
  // Dashboard
  DASHBOARD: '/api/dashboard/',
  
  // Projects
  PROJECTS: '/api/projects/',
  PROJECT_APPLICATIONS: '/api/applications/',
  
  // Students
  STUDENTS: '/api/students/',
  
  // Companies
  COMPANIES: '/api/companies/',
  
  // Evaluations
  EVALUATIONS: '/api/evaluations/',
  EVALUATION_CATEGORIES: '/api/evaluation-categories/',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications/',
  MASS_NOTIFICATIONS: '/api/mass-notifications/',
  
  // Calendar
  CALENDAR_EVENTS: '/api/calendar/',
  
  // Work Hours
  WORK_HOURS: '/api/work-hours/',
  
  // Strikes
  STRIKES: '/api/strikes/',
  
  // Questionnaires
  QUESTIONNAIRES: '/api/questionnaires/',
  
  // Interviews
  INTERVIEWS: '/api/interviews/',
  
  // Documents
  DOCUMENTS: '/api/documents/',
  
  // Reports
  REPORTS: '/api/reports/',
  
  // Health check
  HEALTH: '/api/health-simple/',
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;