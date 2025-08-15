import { apiService } from './api.service';
import type { Student, StudentProfileResponse, CompanyStudentsResponse } from '../types';

class StudentService {
  /**
   * Obtiene el historial de estudiantes únicos que han postulado a proyectos de la empresa
   */
  async getCompanyStudentsHistory(): Promise<CompanyStudentsResponse> {
    try {
      console.log('🚀 [StudentService] Obteniendo historial de estudiantes de la empresa');
      console.log('🔍 [StudentService] URL que se va a llamar: /api/applications/company/students/');
      const response = await apiService.get('/api/applications/company/students/');
      console.log('✅ [StudentService] Historial obtenido:', response);
      console.log('🔍 [StudentService] Tipo de respuesta:', typeof response);
      console.log('🔍 [StudentService] Keys de la respuesta:', response ? Object.keys(response) : 'No hay respuesta');
      if (response && response.results) {
        console.log('🔍 [StudentService] Primer resultado:', response.results[0]);
        console.log('🔍 [StudentService] Keys del primer resultado:', response.results[0] ? Object.keys(response.results[0]) : 'No hay primer resultado');
      }
      return response;
    } catch (error: any) {
      console.error('❌ [StudentService] Error obteniendo historial:', error);
      throw new Error(error.message || 'Error al obtener el historial de estudiantes');
    }
  }

  /**
   * Obtiene el perfil detallado de un estudiante específico
   */
  async getStudentProfileDetails(studentId: string): Promise<StudentProfileResponse> {
    try {
      console.log('🚀 [StudentService] Obteniendo perfil del estudiante:', studentId);
      const response = await apiService.get(`/api/students/${studentId}/profile/`);
      console.log('✅ [StudentService] Perfil obtenido:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [StudentService] Error obteniendo perfil:', error);
      throw new Error(error.message || 'Error al obtener el perfil del estudiante');
    }
  }

  /**
   * Obtiene múltiples perfiles de estudiantes
   */
  async getMultipleStudentProfiles(studentIds: string[]): Promise<StudentProfileResponse[]> {
    try {
      console.log('🚀 [StudentService] Obteniendo múltiples perfiles:', studentIds);
      const promises = studentIds.map(id => this.getStudentProfileDetails(id));
      const profiles = await Promise.all(promises);
      console.log('✅ [StudentService] Perfiles múltiples obtenidos:', profiles.length);
      return profiles;
    } catch (error: any) {
      console.error('❌ [StudentService] Error obteniendo perfiles múltiples:', error);
      throw new Error(error.message || 'Error al obtener múltiples perfiles');
    }
  }

  /**
   * Busca estudiantes por criterios específicos
   */
  async searchStudents(params: {
    search?: string;
    skills?: string[];
    university?: string;
    career?: string;
    api_level?: number;
    experience_min?: number;
    experience_max?: number;
  }): Promise<Student[]> {
    try {
      console.log('🚀 [StudentService] Buscando estudiantes con criterios:', params);
      
      // Primero obtener todos los estudiantes
      const response = await this.getCompanyStudentsHistory();
      let students = response.results;
      
      // Aplicar filtros
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        students = students.filter(student => 
          student.name.toLowerCase().includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm) ||
          student.university.toLowerCase().includes(searchTerm) ||
          student.career.toLowerCase().includes(searchTerm) ||
          student.skills.some(skill => skill.toLowerCase().includes(searchTerm))
        );
      }
      
      if (params.skills && params.skills.length > 0) {
        students = students.filter(student =>
          params.skills!.some(requiredSkill =>
            student.skills.some(skill => 
              skill.toLowerCase().includes(requiredSkill.toLowerCase())
            )
          )
        );
      }
      
      if (params.university) {
        students = students.filter(student =>
          student.university.toLowerCase().includes(params.university!.toLowerCase())
        );
      }
      
      if (params.career) {
        students = students.filter(student =>
          student.career.toLowerCase().includes(params.career!.toLowerCase())
        );
      }
      
      if (params.api_level) {
        students = students.filter(student => student.api_level >= params.api_level!);
      }
      
      if (params.experience_min !== undefined) {
        students = students.filter(student => student.experience_years >= params.experience_min!);
      }
      
      if (params.experience_max !== undefined) {
        students = students.filter(student => student.experience_years <= params.experience_max!);
      }
      
      console.log('✅ [StudentService] Estudiantes filtrados:', students.length);
      return students;
      
    } catch (error: any) {
      console.error('❌ [StudentService] Error en búsqueda:', error);
      throw new Error(error.message || 'Error al buscar estudiantes');
    }
  }

  /**
   * Obtiene estadísticas de los estudiantes
   */
  async getStudentsStats(): Promise<{
    total: number;
    by_university: Record<string, number>;
    by_career: Record<string, number>;
    by_api_level: Record<string, number>;
    by_experience: Record<string, number>;
    skills_distribution: Record<string, number>;
  }> {
    try {
      console.log('🚀 [StudentService] Obteniendo estadísticas de estudiantes');
      const response = await this.getCompanyStudentsHistory();
      const students = response.results;
      
      const stats = {
        total: students.length,
        by_university: {} as Record<string, number>,
        by_career: {} as Record<string, number>,
        by_api_level: {} as Record<string, number>,
        by_experience: {} as Record<string, number>,
        skills_distribution: {} as Record<string, number>
      };
      
      students.forEach(student => {
        // Contar por universidad
        const university = student.university || 'No especificada';
        stats.by_university[university] = (stats.by_university[university] || 0) + 1;
        
        // Contar por carrera
        const career = student.career || 'No especificada';
        stats.by_career[career] = (stats.by_career[career] || 0) + 1;
        
        // Contar por API level
        const apiLevel = `Nivel ${student.api_level}`;
        stats.by_api_level[apiLevel] = (stats.by_api_level[apiLevel] || 0) + 1;
        
        // Contar por experiencia
        let experienceRange = 'Sin experiencia';
        if (student.experience_years > 0 && student.experience_years <= 1) {
          experienceRange = '0-1 años';
        } else if (student.experience_years <= 3) {
          experienceRange = '1-3 años';
        } else if (student.experience_years <= 5) {
          experienceRange = '3-5 años';
        } else if (student.experience_years > 5) {
          experienceRange = '5+ años';
        }
        stats.by_experience[experienceRange] = (stats.by_experience[experienceRange] || 0) + 1;
        
        // Contar habilidades
        student.skills.forEach(skill => {
          stats.skills_distribution[skill] = (stats.skills_distribution[skill] || 0) + 1;
        });
      });
      
      console.log('✅ [StudentService] Estadísticas generadas:', stats);
      return stats;
      
    } catch (error: any) {
      console.error('❌ [StudentService] Error obteniendo estadísticas:', error);
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }
}

export const studentService = new StudentService();