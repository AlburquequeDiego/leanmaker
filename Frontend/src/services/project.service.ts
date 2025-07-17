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
    const response = await apiService.get<any>('/api/projects/company_projects/');
    // El apiService ya maneja la respuesta, devolvemos directamente los datos
    return adaptProjectList(Array.isArray(response) ? response : (response.data || response));
  }

  // Crear un nuevo proyecto (adaptando los campos al backend real)
  async createProject(projectData: any): Promise<any> {
    // Adaptar los campos al formato esperado por el backend
    const tags = [];
    if (projectData.encargado) tags.push(`encargado: ${projectData.encargado}`);
    if (projectData.contacto) tags.push(`contacto: ${projectData.contacto}`);
    const backendData = {
      title: projectData.title,
      description: projectData.description,
      requirements: Array.isArray(projectData.requirements) ? projectData.requirements.join(', ') : projectData.requirements,
      benefits: Array.isArray(projectData.benefits) ? projectData.benefits.join(', ') : projectData.benefits,
      modality: projectData.modalidad || projectData.modality,
      difficulty: projectData.dificultad || projectData.difficulty,
      duration_weeks: projectData.duration_weeks,
      hours_per_week: projectData.hours_per_week,
      max_students: projectData.max_students,
      application_deadline: projectData.application_deadline,
      start_date: projectData.fecha_inicio || projectData.start_date,
      estimated_end_date: projectData.fecha_fin_estimado || projectData.estimated_end_date,
      company_id: projectData.company_id,
      status_id: projectData.status_id,
      area_id: projectData.area_id || projectData.area,
      trl_id: projectData.trl_id,
      api_level: projectData.api_level,
      required_hours: projectData.required_hours,
      technologies: JSON.stringify(projectData.technologies || []),
      tags: JSON.stringify(tags),
      // Agrega otros campos según lo que espera el backend
    };
    const response = await apiService.post('/api/projects/create/', backendData);
    // El apiService ya maneja la respuesta y devuelve directamente los datos
    return response;
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

  // Obtener lista de áreas
  async getAreas(): Promise<any[]> {
    const response = await apiService.get<any>('/api/areas/');
    // El apiService ya maneja la respuesta, devolvemos directamente los datos
    return Array.isArray(response) ? response : (response.results || response.data || []);
  }
}

export const projectService = new ProjectService(); 