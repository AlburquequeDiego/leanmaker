import { authService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';
import { adaptUser, adaptProject, adaptApplication, adaptStudent, adaptCompany, adaptNotification, adaptDashboardStats, adaptEvaluation } from '../utils/adapters';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Construir URL completa - usar proxy en desarrollo
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else if (endpoint.startsWith('/api/')) {
      // En desarrollo, usar el proxy de Vite
      url = endpoint;
    } else {
      url = `${API_BASE_URL}${endpoint}`;
    }
    
    // Debug: Log URL being requested
    console.log(`🔍 [API] Requesting URL: ${url}`);
    console.log(`🔍 [API] Endpoint: ${endpoint}`);
    console.log(`🔍 [API] API_BASE_URL: ${API_BASE_URL}`);
    

    
    // Get access token
    const token = authService.getAccessToken();
    
    // Debug: Log token info for hub analytics endpoint
    if (endpoint.includes('/api/hub/analytics/')) {
      console.log('🔍 [API] Token para hub analytics:', token ? 'Presente' : 'Ausente');
      console.log('🔍 [API] Token value:', token);
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    // Debug: Log headers for hub analytics endpoint
    if (endpoint.includes('/api/hub/analytics/')) {
      console.log('🔍 [API] Headers configurados:', config.headers);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        try {
          await authService.refreshToken();
          // Retry the request with new token
          const newToken = authService.getAccessToken();
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(url, config);
            if (retryResponse.ok) {
              const contentType = retryResponse.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return await retryResponse.json();
              }
              return {} as T;
            }
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      // Cambiar esta validación para aceptar 200, 201 y 204 como éxito
      if (![200, 201, 204].includes(response.status)) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [API] HTTP error ${response.status} en ${endpoint}:`, errorData);
        
        // Para errores 400, preservar el mensaje específico del backend
        if (response.status === 400 && errorData.error) {
          throw new Error(errorData.error);
        }
        
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // DEBUG: Log datos recibidos para endpoints específicos
        if (endpoint.includes('/api/users/profile/') || endpoint.includes('/api/students/me/')) {
          console.log(`🔍 [API] Datos recibidos de ${endpoint}:`, data);
        }
        
        // DEBUG: Log datos de proyectos
        if (endpoint.includes('/api/projects/company_projects/')) {
          console.log(`🔍 [API] Datos de proyectos de empresa recibidos de ${endpoint}:`, data);
          console.log(`🔍 [API] Estructura de datos:`);
          console.log(`  - success: ${data?.success}`);
          console.log(`  - count: ${data?.count}`);
          console.log(`  - data length: ${data?.data?.length || 0}`);
          if (data?.data && Array.isArray(data.data)) {
            data.data.forEach((project: any, index: number) => {
              console.log(`  - Proyecto ${index + 1}: ${project.title}`);
              console.log(`    - estudiantes length: ${project.estudiantes?.length || 0}`);
              console.log(`    - estudiantes:`, project.estudiantes);
            });
          }
        }
        
        // DEBUG: Log datos de detalle de proyecto
        if (endpoint.includes('/api/projects/') && endpoint.match(/\/\d+\/$/)) { // Solo endpoints con ID numérico
          console.log(`🔍 [API] Datos de detalle de proyecto recibidos de ${endpoint}:`, data);
          console.log(`🔍 [API] Campos del proyecto:`);
          console.log(`  - title: ${data?.title}`);
          console.log(`  - status: ${data?.status}`);
          console.log(`  - estudiantes length: ${data?.estudiantes?.length || 0}`);
          console.log(`  - estudiantes:`, data?.estudiantes);
        }
        
        // DEBUG: Log datos de empresa
        if (endpoint.includes('/api/companies/company_me/')) {
          console.log(`🔍 [API] Datos de empresa recibidos de ${endpoint}:`, data);
          console.log(`🔍 [API] Campos específicos de empresa:`);
          console.log(`  - company_address: ${data?.company_address}`);
          console.log(`  - company_phone: ${data?.company_phone}`);
          console.log(`  - company_email: ${data?.company_email}`);
          console.log(`  - rut: ${data?.rut}`);
          console.log(`  - personality: ${data?.personality}`);
          console.log(`  - business_name: ${data?.business_name}`);
          console.log(`  - user_data.birthdate: ${data?.user_data?.birthdate}`);
          console.log(`  - user_data.gender: ${data?.user_data?.gender}`);
        }
        
        // Aplicar adaptadores según el endpoint
        return this.applyAdapter(data, endpoint) as T;
      }
      
      return {} as T;
    } catch (error) {
      console.error(`💥 [API] Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Envía una petición de subida de nivel API del estudiante
   */
  async requestApiLevelUpgrade(requestedLevel: number, currentLevel: number) {
    return this.post('/api/students/api-level-request/', {
      requested_level: requestedLevel,
      current_level: currentLevel,
    });
  }

  /**
   * Obtiene la lista de evaluaciones para el admin
   */
  async getEvaluations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    
    const endpoint = `/api/admin/evaluations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get(endpoint);
  }

  /**
   * Obtiene el detalle de una evaluación específica
   */
  async getEvaluationDetail(evaluationId: string) {
    return this.get(`/api/evaluations/${evaluationId}/`);
  }

  /**
   * Obtiene evaluaciones por proyecto
   */
  async getEvaluationsByProject(projectId: string) {
    return this.get(`/api/evaluations/by_project/${projectId}/`);
  }

  /**
   * Crea una nueva evaluación
   */
  async createEvaluation(evaluationData: {
    project_id: string;
    student_id: string;
    score: number;
    comments?: string;
    evaluator_type?: 'company' | 'admin' | 'student';
    status?: 'pending' | 'completed';
  }) {
    return this.post('/api/evaluations/create/', evaluationData);
  }

  /**
   * Actualiza una evaluación existente
   */
  async updateEvaluation(evaluationId: string, evaluationData: {
    score?: number;
    comments?: string;
    status?: string;
    strengths?: string;
    areas_for_improvement?: string;
  }) {
    return this.patch(`/api/evaluations/${evaluationId}/update/`, evaluationData);
  }

  /**
   * Aprueba una evaluación
   */
  async approveEvaluation(evaluationId: string) {
    return this.patch(`/api/evaluations/${evaluationId}/approve/`);
  }

  /**
   * Rechaza una evaluación
   */
  async rejectEvaluation(evaluationId: string) {
    return this.patch(`/api/evaluations/${evaluationId}/reject/`);
  }

  /**
   * Obtiene aplicaciones recibidas por empresa
   */
  async getReceivedApplications() {
    return this.get('/api/applications/received_applications/');
  }

  /**
   * Obtiene mis aplicaciones (estudiante)
   */
  async getMyApplications() {
    return this.get('/api/applications/my_applications/');
  }

  /**
   * Actualiza el estado de una aplicación
   */
  async updateApplicationStatus(applicationId: string, status: string, notes?: string) {
    return this.patch(`/api/applications/${applicationId}/`, {
      status,
      company_notes: notes
    });
  }

  /**
   * Acepta una aplicación
   */
  async acceptApplication(applicationId: string, notes?: string) {
    return this.post(`/api/applications/${applicationId}/accept/`, {
      company_notes: notes
    });
  }

  /**
   * Rechaza una aplicación
   */
  async rejectApplication(applicationId: string, notes?: string) {
    return this.post(`/api/applications/${applicationId}/reject/`, {
      company_notes: notes
    });
  }

  /**
   * Obtiene la lista de strikes
   */
  async getStrikes(params?: {
    page?: number;
    limit?: number;
    student?: string;
    company?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.student) queryParams.append('student', params.student);
    if (params?.company) queryParams.append('company', params.company);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/api/strikes/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get(endpoint);
  }



  /**
   * Aplica adaptadores según el endpoint para convertir campos del backend
   */
  private applyAdapter(data: any, endpoint: string): any {
    // Si es una respuesta de error, no aplicar adaptador
    if (data.error) {
      return data;
    }

    // Aplicar adaptadores según el endpoint
    if (endpoint.includes('/api/users/profile/')) {
      return adaptUser(data);
    }
    
    if (endpoint.includes('/api/projects/')) {
      // No aplicar adaptador para respuestas de actualización (PATCH/PUT)
      // Estas respuestas contienen solo campos específicos, no el proyecto completo
      if (endpoint.includes('/api/projects/') && 
          (endpoint.match(/\/[^\/]+\/$/) || endpoint.includes('/update/') || endpoint.includes('/delete/'))) {
        return data; // Devolver datos tal como están
      }
      
      if (Array.isArray(data)) {
        return data.map(adaptProject);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptProject)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptProject)
        };
      }
      return adaptProject(data);
    }
    
    if (endpoint.includes('/api/project-applications/') || endpoint.includes('/api/applications/')) {
      // Excluir el endpoint my_applications para que use su propio adaptador
      if (endpoint.includes('/api/applications/my_applications/')) {
        return data; // Devolver datos tal como están
      }
      
      if (Array.isArray(data)) {
        return data.map(adaptApplication);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptApplication)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptApplication)
        };
      }
      return adaptApplication(data);
    }
    
    // EXCLUIR los endpoints de peticiones de nivel API y evaluaciones
    if (
      endpoint.includes('/api/students/') &&
      !endpoint.includes('api-level-request') &&
      !endpoint.includes('/api/evaluations/')
    ) {
      if (Array.isArray(data)) {
        return data.map(adaptStudent);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptStudent)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptStudent)
        };
      }
      return adaptStudent(data);
    }
    
    if (endpoint.includes('/api/companies/')) {
      if (Array.isArray(data)) {
        return data.map(adaptCompany);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptCompany)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptCompany)
        };
      }
      return adaptCompany(data);
    }
    
    if (endpoint.includes('/api/notifications/')) {
      if (Array.isArray(data)) {
        return data.map(adaptNotification);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptNotification)
        };
      }
      if (data.data && Array.isArray(data.data)) {
        return {
          ...data,
          data: data.data.map(adaptNotification)
        };
      }
      return adaptNotification(data);
    }
    
    if (endpoint.includes('/api/admin/evaluations/')) {
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptEvaluation)
        };
      }
      return adaptEvaluation(data);
    }
    
    if (endpoint.includes('/api/evaluations/')) {
      // Para endpoints de evaluaciones mutuas, devolver datos tal como están
      if (endpoint.includes('student-companies-to-evaluate') || 
          endpoint.includes('company-students-to-evaluate') ||
          endpoint.includes('student-evaluate-company') ||
          endpoint.includes('company-evaluate-student') ||
          endpoint.includes('student-completed-evaluations')) {
        return data; // Devolver datos tal como están
      }
      
      // Para otros endpoints de evaluaciones, aplicar adaptador
      if (Array.isArray(data)) {
        return data.map(adaptEvaluation);
      }
      if (data.results && Array.isArray(data.results)) {
        return {
          ...data,
          results: data.results.map(adaptEvaluation)
        };
      }
      return adaptEvaluation(data);
    }
    
    if (endpoint.includes('/api/dashboard/')) {
      // Solo aplicar adaptador si es el dashboard de admin
      if (endpoint.includes('/admin_stats/')) {
        return adaptDashboardStats(data);
      }
      // Para otros dashboards (company, student), devolver datos tal como están
      return data;
    }
    
    // Si no hay adaptador específico, devolver los datos tal como están
    return data;
  }

  // Upload file method
  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const token = authService.getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }

  // NUEVOS MÉTODOS PARA EVALUACIONES MUTUAS
  async companyEvaluateStudent(evaluationData: {
    student_id: string;
    project_id: string;
    score: number;
    comments?: string;
    strike?: {
      reason: string;
      description?: string;
    };
  }) {
    return this.post('/api/evaluations/company-evaluate-student/', evaluationData);
  }

  async getCompanyStudentsToEvaluate() {
    return this.get('/api/evaluations/company-students-to-evaluate/');
  }

  async getCompanyCompletedEvaluations() {
    return this.get('/api/evaluations/company-completed-evaluations/');
  }

  async studentEvaluateCompany(evaluationData: {
    company_id: string;
    project_id: string;
    score: number;
    comments?: string;
  }) {
    return this.post('/api/evaluations/student-evaluate-company/', evaluationData);
  }

  async getStudentCompaniesToEvaluate() {
    return this.get('/api/evaluations/student-companies-to-evaluate/');
  }

  async getStudentCompletedEvaluations() {
    return this.get('/api/evaluations/student-completed-evaluations/');
  }

  async getProjectDetails(projectId: string) {
    return this.get(`/api/projects/${projectId}/`);
  }

  // MÉTODOS PARA ADMIN - GESTIÓN DE EVALUACIONES Y STRIKES
  async getAdminEvaluationsManagement(params?: {
    page?: number;
    limit?: number;
    evaluation_type?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.evaluation_type) queryParams.append('evaluation_type', params.evaluation_type);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/api/evaluations/admin/management/?${queryParams.toString()}`;
    return this.get(url);
  }

  async getAdminStrikesManagement(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/api/evaluations/admin/strikes-management/?${queryParams.toString()}`;
    return this.get(url);
  }

  // MÉTODOS PARA STRIKES
  async getStrikeReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/api/strikes/reports/?${queryParams.toString()}`;
    return this.get(url);
  }

  async getCompanyStrikeReports() {
    return this.get('/api/strikes/reports/company/');
  }

  async createStrikeReport(reportData: {
    student_id: string;
    project_id: string;
    reason: string;
    description?: string;
  }) {
    return this.post('/api/strikes/reports/create/', reportData);
  }

  async approveStrikeReport(reportId: string, adminNotes?: string) {
    const url = `/api/strikes/reports/${reportId}/approve/`;
    return this.patch(url, { admin_notes: adminNotes || '' });
  }

  async rejectStrikeReport(reportId: string, adminNotes?: string) {
    const url = `/api/strikes/reports/${reportId}/reject/`;
    return this.patch(url, { admin_notes: adminNotes || '' });
  }

  // MÉTODOS PARA ESTADÍSTICAS DEL DASHBOARD
  async getCompanyStats() {
    return this.get('/api/dashboard/company_stats/');
  }
}

export const apiService = new ApiService();