// Debug: Log all environment variables
console.log('[API Config] All env variables:', import.meta.env);
console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Config] VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('[API Config] Final API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/token/',
  REFRESH_TOKEN: '/api/token/refresh/',
  VERIFY_TOKEN: '/api/token/verify/',
  
  // User endpoints
  USERS: '/api/users/',
  USER_PROFILE: '/api/users/profile/',
  AUTH_REGISTER: '/api/auth/register/',
  AUTH_LOGOUT: '/api/auth/logout/',
  PASSWORDS_CHANGE: '/api/passwords/change/',
  
  // Dashboard
  DASHBOARD: '/api/dashboard/',
  DASHBOARD_COMPANY_STATS: '/api/dashboard/company_stats/',
  DASHBOARD_STUDENT_STATS: '/api/dashboard/student_stats/',
  DASHBOARD_ADMIN_STATS: '/api/test-admin-stats/', // Temporalmente usando endpoint de prueba
  
  // Students
  STUDENTS: '/api/students/',
  STUDENT_PROFILES: '/api/student-profiles/',
  
  // Companies
  COMPANIES: '/api/companies/',
  COMPANY_RATINGS: '/api/company-ratings/',
  
  // Projects
  PROJECTS: '/api/projects/',
  PROJECT_MY_PROJECTS: '/api/projects/my_projects/',
  PROJECT_APPLICATIONS: '/api/project-applications/',
  PROJECT_APPLICATIONS_RECEIVED: '/api/project-applications/received_applications/',
  PROJECT_APPLICATIONS_MY_APPLICATIONS: '/api/project-applications/my_applications/',
  PROJECT_MEMBERS: '/api/project-members/',
  
  // Areas
  AREAS: '/api/areas/',
  
  // TRL Levels
  TRL_LEVELS: '/api/trl-levels/',
  
  // Project Status
  PROJECT_STATUS: '/api/project-status/',
  
  // Assignments
  ASSIGNMENTS: '/api/assignments/',
  
  // Evaluations
  EVALUATIONS: '/api/evaluations/',
  EVALUATION_CATEGORIES: '/api/evaluation-categories/',
  EVALUATION_TEMPLATES: '/api/evaluation-templates/',
  
  // Ratings
  RATINGS: '/api/ratings/',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications/',
  NOTIFICATION_TEMPLATES: '/api/notification-templates/',
  MASS_NOTIFICATIONS: '/api/mass-notifications/',
  MASS_NOTIFICATION_TEMPLATES: '/api/mass-notification-templates/',
  
  // Calendar
  CALENDAR_EVENTS: '/api/calendar-events/',
  CALENDAR_COMPANY_EVENTS: '/api/calendar-events/company_events/',
  CALENDAR_STUDENT_EVENTS: '/api/calendar-events/student_events/',
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
  
  // Platform Settings
  PLATFORM_SETTINGS: '/api/platform-settings/',
  SYSTEM_CONFIGURATIONS: '/api/system-configurations/',
  FEATURE_FLAGS: '/api/feature-flags/',
  
  // Search
  SEARCH: '/api/search/',
  
  // API Management
  API_KEYS: '/api/api-keys/',
  API_USAGE: '/api/api-usage/',
  API_RATE_LIMITS: '/api/api-rate-limits/',
  
  // Documents
  DOCUMENTS: '/api/documents/',
  
  // Disciplinary Records
  DISCIPLINARY_RECORDS: '/api/disciplinary-records/',
  
  // Activity Logs
  ACTIVITY_LOGS: '/api/activity-logs/',
  
  // Reports
  REPORTS: '/api/reports/',
  
  // Data Backups
  DATA_BACKUPS: '/api/data-backups/',
  
  // Health check
  HEALTH: '/api/health-simple/',
};

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;