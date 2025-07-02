import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface Student {
  id: number;
  user: number;
  student_id: string;
  career: string;
  semester: number;
  gpa: number;
  bio?: string;
  skills?: string;
  interests?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: number;
  student: number;
  avatar?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at: string;
}

class StudentService {
  // Students
  async getStudents(params?: any): Promise<Student[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiService.get<Student[]>(`${API_ENDPOINTS.STUDENTS}${queryString}`);
  }

  async getStudent(id: number): Promise<Student> {
    return await apiService.get<Student>(`${API_ENDPOINTS.STUDENTS}${id}/`);
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    return await apiService.post<Student>(API_ENDPOINTS.STUDENTS, studentData);
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student> {
    return await apiService.put<Student>(`${API_ENDPOINTS.STUDENTS}${id}/`, studentData);
  }

  async deleteStudent(id: number): Promise<void> {
    return await apiService.delete(`${API_ENDPOINTS.STUDENTS}${id}/`);
  }

  // Student Profiles - Using students endpoint since profiles are part of student model
  async getStudentProfiles(params?: any): Promise<StudentProfile[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiService.get<StudentProfile[]>(`${API_ENDPOINTS.STUDENTS}${queryString}`);
  }

  async getStudentProfile(id: number): Promise<StudentProfile> {
    return await apiService.get<StudentProfile>(`${API_ENDPOINTS.STUDENTS}${id}/`);
  }

  async createStudentProfile(profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    return await apiService.post<StudentProfile>(API_ENDPOINTS.STUDENTS, profileData);
  }

  async updateStudentProfile(id: number, profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    return await apiService.put<StudentProfile>(`${API_ENDPOINTS.STUDENTS}${id}/`, profileData);
  }

  async deleteStudentProfile(id: number): Promise<void> {
    return await apiService.delete(`${API_ENDPOINTS.STUDENTS}${id}/`);
  }

  // Get current user's student profile
  async getMyStudentProfile(): Promise<Student | null> {
    try {
      return await apiService.get<Student>(`${API_ENDPOINTS.STUDENTS}me/`);
    } catch (error) {
      return null;
    }
  }
}

export const studentService = new StudentService(); 