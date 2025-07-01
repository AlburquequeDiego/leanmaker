export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/token/',
  REFRESH_TOKEN: '/api/token/refresh/',
  VERIFY_TOKEN: '/api/token/verify/',
  REGISTER: '/api/auth/register/',
  
  // User endpoints
  USER_PROFILE: '/api/users/me/',
  USERS: '/api/users/',
  
  // Dashboard
  DASHBOARD: '/api/dashboard/',
  
  // Projects
  PROJECTS: '/api/projects/',
  PROJECT_APPLICATIONS: '/api/applications/',
  PROJECT_MEMBERS: '/api/project-members/',
  
  // Students
  STUDENTS: '/api/students/',
  STUDENT_PROFILES: '/api/student-profiles/',
  
  // Companies
  COMPANIES: '/api/companies/',
  COMPANY_RATINGS: '/api/company-ratings/',
  
  // Evaluations
  EVALUATIONS: '/api/evaluations/',
  EVALUATION_CATEGORIES: '/api/evaluation-categories/',
  EVALUATION_TEMPLATES: '/api/evaluation-templates/',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications/',
  NOTIFICATION_TEMPLATES: '/api/notification-templates/',
  MASS_NOTIFICATIONS: '/api/mass-notifications/',
  
  // Calendar
  CALENDAR_EVENTS: '/api/calendar/',
  EVENT_REMINDERS: '/api/event-reminders/',
  CALENDAR_SETTINGS: '/api/calendar-settings/',
  
  // Work Hours
  WORK_HOURS: '/api/work-hours/',
  
  // Strikes
  STRIKES: '/api/strikes/',
  
  // Questionnaires
  QUESTIONNAIRES: '/api/questionnaires/',
  QUESTIONS: '/api/questions/',
  CHOICES: '/api/choices/',
  ANSWERS: '/api/answers/',
  
  // Interviews
  INTERVIEWS: '/api/interviews/',
  
  // Documents
  DOCUMENTS: '/api/documents/',
  
  // Reports
  REPORTS: '/api/reports/',
  
  // Search
  SEARCH: '/api/search/',
  
  // Health check
  HEALTH: '/api/health-simple/',
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;