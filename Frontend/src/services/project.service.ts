import { apiService } from './api.service';
import { adaptProjectList, adaptProject } from '../utils/adapters';


export interface Project {
  id: string; // Cambiado a string para UUID
  title: string;
  description: string;
  company: string; // Cambiado a string para UUID
  area: string; // Cambiado a string para UUID
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string; // Cambiado a string para UUID
  max_students?: number;
  requirements?: string;
  benefits?: string;
  duration?: string;
}

export interface ProjectApplication {
  id: string; // Cambiado a string para UUID
  project: string; // Cambiado a string para UUID
  student: string; // Cambiado a string para UUID
  status: string;
  applied_at: string;
  updated_at: string;
  motivation_letter?: string;
  resume?: string;
}

export interface ProjectMember {
  id: string; // Cambiado a string para UUID
  project: string; // Cambiado a string para UUID
  student: string; // Cambiado a string para UUID
  role: string;
  joined_at: string;
  is_active: boolean;
}

export class ProjectService {
  // Obtener proyectos de la empresa autenticada
  async getMyProjects(): Promise<any[]> {
    const response = await apiService.get('/api/projects/my_projects/');
    // El backend responde { success, data: [...] }
    return adaptProjectList(response.data?.data || response.data);
  }

  // Crear un nuevo proyecto (adaptando los campos al backend real)
  async createProject(projectData: any): Promise<any> {
    // Adaptar los campos al formato esperado por el backend
    const backendData = {
      titulo: projectData.title,
      descripcion: projectData.description,
      area: projectData.area, // UUID
      requisitos: Array.isArray(projectData.requirements) ? projectData.requirements.join(', ') : projectData.requirements,
      beneficios: Array.isArray(projectData.benefits) ? projectData.benefits.join(', ') : projectData.benefits,
      modalidad: projectData.modality,
      dificultad: projectData.difficulty,
      duracion_semanas: projectData.duration_weeks,
      horas_por_semana: projectData.hours_per_week,
      max_estudiantes: projectData.max_students,
      fecha_limite_postulacion: projectData.application_deadline,
      fecha_inicio: projectData.start_date,
      fecha_fin_estimado: projectData.end_date,
      monto_stipendio: projectData.stipend_amount,
      moneda_stipendio: projectData.stipend_currency,
      tecnologias: JSON.stringify(projectData.technologies || []),
      area_id: projectData.area, // si el backend espera area_id
      // Agrega otros campos según lo que espera el backend
    };
    const response = await apiService.post('/api/projects/', backendData);
    return adaptProject(response.data);
  }

  async getProject(id: string): Promise<Project> {
    try {
      return await apiService.get<Project>(`${API_ENDPOINTS.PROJECTS}${id}/`);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    try {
      return await apiService.put<Project>(`${API_ENDPOINTS.PROJECTS}${id}/`, projectData);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      return await apiService.delete(`${API_ENDPOINTS.PROJECTS}${id}/`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  // Project Applications
  async getProjectApplications(params?: any): Promise<ProjectApplication[]> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await apiService.get<ProjectApplication[]>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${queryString}`);
    } catch (error) {
      console.error('Error fetching project applications:', error);
      throw error;
    }
  }

  async getProjectApplication(id: string): Promise<ProjectApplication> {
    try {
      return await apiService.get<ProjectApplication>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`);
    } catch (error) {
      console.error(`Error fetching project application ${id}:`, error);
      throw error;
    }
  }

  async createProjectApplication(applicationData: Partial<ProjectApplication>): Promise<ProjectApplication> {
    try {
      return await apiService.post<ProjectApplication>(API_ENDPOINTS.PROJECT_APPLICATIONS, applicationData);
    } catch (error) {
      console.error('Error creating project application:', error);
      throw error;
    }
  }

  async updateProjectApplication(id: string, applicationData: Partial<ProjectApplication>): Promise<ProjectApplication> {
    try {
      return await apiService.put<ProjectApplication>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`, applicationData);
    } catch (error) {
      console.error(`Error updating project application ${id}:`, error);
      throw error;
    }
  }

  async deleteProjectApplication(id: string): Promise<void> {
    try {
      return await apiService.delete(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`);
    } catch (error) {
      console.error(`Error deleting project application ${id}:`, error);
      throw error;
    }
  }

  // Project Members
  async getProjectMembers(params?: any): Promise<ProjectMember[]> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await apiService.get<ProjectMember[]>(`${API_ENDPOINTS.PROJECT_MEMBERS}${queryString}`);
    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  }

  async getProjectMember(id: string): Promise<ProjectMember> {
    try {
      return await apiService.get<ProjectMember>(`${API_ENDPOINTS.PROJECT_MEMBERS}${id}/`);
    } catch (error) {
      console.error(`Error fetching project member ${id}:`, error);
      throw error;
    }
  }

  async createProjectMember(memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    try {
      return await apiService.post<ProjectMember>(API_ENDPOINTS.PROJECT_MEMBERS, memberData);
    } catch (error) {
      console.error('Error creating project member:', error);
      throw error;
    }
  }

  async updateProjectMember(id: string, memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    try {
      return await apiService.put<ProjectMember>(`${API_ENDPOINTS.PROJECT_MEMBERS}${id}/`, memberData);
    } catch (error) {
      console.error(`Error updating project member ${id}:`, error);
      throw error;
    }
  }

  async deleteProjectMember(id: string): Promise<void> {
    try {
      return await apiService.delete(`${API_ENDPOINTS.PROJECT_MEMBERS}${id}/`);
    } catch (error) {
      console.error(`Error deleting project member ${id}:`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService(); 