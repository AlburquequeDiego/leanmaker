export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/v1/token/',
  REFRESH_TOKEN: '/api/v1/token/refresh/',
  VERIFY_TOKEN: '/api/v1/token/verify/',
  REGISTER: '/api/v1/auth/register/',
  
  // User endpoints
  USER_PROFILE: '/api/v1/users/me/',
  USERS: '/api/v1/users/',
  
  // Dashboard
  DASHBOARD: '/api/v1/dashboard/',
  
  // Projects
  PROJECTS: '/api/v1/projects/',
  PROJECT_APPLICATIONS: '/api/v1/project-applications/',
  PROJECT_MEMBERS: '/api/v1/project-members/',
  
  // Students
  STUDENTS: '/api/v1/students/',
  STUDENT_PROFILES: '/api/v1/student-profiles/',
  
  // Companies
  COMPANIES: '/api/v1/companies/',
  COMPANY_RATINGS: '/api/v1/company-ratings/',
  
  // Evaluations
  EVALUATIONS: '/api/v1/evaluations/',
  EVALUATION_CATEGORIES: '/api/v1/evaluation-categories/',
  EVALUATION_TEMPLATES: '/api/v1/evaluation-templates/',
  
  // Notifications
  NOTIFICATIONS: '/api/v1/notifications/',
  NOTIFICATION_TEMPLATES: '/api/v1/notification-templates/',
  MASS_NOTIFICATIONS: '/api/v1/mass-notifications/',
  
  // Calendar
  CALENDAR_EVENTS: '/api/v1/calendar-events/',
  EVENT_REMINDERS: '/api/v1/event-reminders/',
  CALENDAR_SETTINGS: '/api/v1/calendar-settings/',
  
  // Work Hours
  WORK_HOURS: '/api/v1/work-hours/',
  
  // Strikes
  STRIKES: '/api/v1/strikes/',
  
  // Questionnaires
  QUESTIONNAIRES: '/api/v1/questionnaires/',
  QUESTIONS: '/api/v1/questions/',
  CHOICES: '/api/v1/choices/',
  ANSWERS: '/api/v1/answers/',
  
  // Interviews
  INTERVIEWS: '/api/v1/interviews/',
  
  // Documents
  DOCUMENTS: '/api/v1/documents/',
  
  // Reports
  REPORTS: '/api/v1/reports/',
  
  // Search
  SEARCH: '/api/v1/search/',
  
  // Health check
  HEALTH: '/api/v1/health/',
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;