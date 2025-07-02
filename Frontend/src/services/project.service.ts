import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface Project {
  id: number;
  title: string;
  description: string;
  company: number;
  area: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  max_students?: number;
  requirements?: string;
  benefits?: string;
  duration?: string;
}

export interface ProjectApplication {
  id: number;
  project: number;
  student: number;
  status: string;
  applied_at: string;
  updated_at: string;
  motivation_letter?: string;
  resume?: string;
}

export interface ProjectMember {
  id: number;
  project: number;
  student: number;
  role: string;
  joined_at: string;
  is_active: boolean;
}

class ProjectService {
  // Projects
  async getProjects(params?: any): Promise<Project[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiService.get<Project[]>(`${API_ENDPOINTS.PROJECTS}${queryString}`);
  }

  async getProject(id: number): Promise<Project> {
    return await apiService.get<Project>(`${API_ENDPOINTS.PROJECTS}${id}/`);
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    return await apiService.post<Project>(API_ENDPOINTS.PROJECTS, projectData);
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    return await apiService.put<Project>(`${API_ENDPOINTS.PROJECTS}${id}/`, projectData);
  }

  async deleteProject(id: number): Promise<void> {
    return await apiService.delete(`${API_ENDPOINTS.PROJECTS}${id}/`);
  }

  // Project Applications
  async getProjectApplications(params?: any): Promise<ProjectApplication[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiService.get<ProjectApplication[]>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${queryString}`);
  }

  async getProjectApplication(id: number): Promise<ProjectApplication> {
    return await apiService.get<ProjectApplication>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`);
  }

  async createProjectApplication(applicationData: Partial<ProjectApplication>): Promise<ProjectApplication> {
    return await apiService.post<ProjectApplication>(API_ENDPOINTS.PROJECT_APPLICATIONS, applicationData);
  }

  async updateProjectApplication(id: number, applicationData: Partial<ProjectApplication>): Promise<ProjectApplication> {
    return await apiService.put<ProjectApplication>(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`, applicationData);
  }

  async deleteProjectApplication(id: number): Promise<void> {
    return await apiService.delete(`${API_ENDPOINTS.PROJECT_APPLICATIONS}${id}/`);
  }

  // Project Members - Using projects endpoint since members are part of project model
  async getProjectMembers(params?: any): Promise<ProjectMember[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiService.get<ProjectMember[]>(`${API_ENDPOINTS.PROJECTS}${queryString}`);
  }

  async getProjectMember(id: number): Promise<ProjectMember> {
    return await apiService.get<ProjectMember>(`${API_ENDPOINTS.PROJECTS}${id}/`);
  }

  async createProjectMember(memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    return await apiService.post<ProjectMember>(API_ENDPOINTS.PROJECTS, memberData);
  }

  async updateProjectMember(id: number, memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    return await apiService.put<ProjectMember>(`${API_ENDPOINTS.PROJECTS}${id}/`, memberData);
  }

  async deleteProjectMember(id: number): Promise<void> {
    return await apiService.delete(`${API_ENDPOINTS.PROJECTS}${id}/`);
  }
}

export const projectService = new ProjectService(); 