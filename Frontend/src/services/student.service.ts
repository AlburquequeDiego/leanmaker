import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { Student, StudentProfileResponse } from '../types';

class StudentService {
  /**
   * Obtiene el perfil completo de un estudiante por ID
   * @param studentId - ID del estudiante
   * @returns Perfil completo del estudiante
   */
  async getStudentProfile(studentId: string): Promise<StudentProfileResponse> {
    try {
      console.log('🚀 [StudentService] Obteniendo perfil del estudiante:', studentId);
      console.log('🔍 [StudentService] URL del endpoint:', API_ENDPOINTS.STUDENT_PROFILE);
      console.log('🔍 [StudentService] URL construida:', API_ENDPOINTS.STUDENT_PROFILE.replace('{id}', studentId));
      console.log('🔍 [StudentService] URL completa:', `${API_ENDPOINTS.STUDENT_PROFILE.replace('{id}', studentId)}`);
      console.log('🔍 [StudentService] API_ENDPOINTS.STUDENT_PROFILE:', API_ENDPOINTS.STUDENT_PROFILE);
      
      const response = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE.replace('{id}', studentId));
      console.log('✅ [StudentService] Respuesta exitosa:', response);
      
      // La respuesta viene en response.data
      return (response as any).data as StudentProfileResponse;
    } catch (error: any) {
      console.error('❌ [StudentService] Error obteniendo perfil:', error);
      console.error('❌ [StudentService] Error completo:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Intentar obtener datos básicos como fallback
      console.log('🔄 [StudentService] Intentando obtener datos básicos...');
      try {
        const basicData = await this.getBasicStudentData(studentId);
        console.log('✅ [StudentService] Datos básicos obtenidos:', basicData);
        return basicData;
      } catch (fallbackError: any) {
        console.error('❌ [StudentService] Error obteniendo datos básicos:', fallbackError);
        throw new Error('No se pudo obtener el perfil del estudiante');
      }
    }
  }

  /**
   * Obtiene perfiles de múltiples estudiantes
   * @param studentIds - Array de IDs de estudiantes
   * @returns Array de perfiles de estudiantes
   */
  async getMultipleStudentProfiles(studentIds: string[]): Promise<StudentProfileResponse[]> {
    try {
      console.log('🚀 [StudentService] Obteniendo perfiles de múltiples estudiantes:', studentIds);
      
      const profiles = await Promise.all(
        studentIds.map(id => this.getStudentProfile(id))
      );
      
      console.log('✅ [StudentService] Perfiles obtenidos:', profiles.length);
      return profiles;
    } catch (error) {
      console.error('❌ [StudentService] Error obteniendo múltiples perfiles:', error);
      throw error;
    }
  }

  /**
   * Busca estudiantes por criterios
   * @param searchTerm - Término de búsqueda
   * @param filters - Filtros adicionales
   * @returns Lista de estudiantes que coinciden
   */
  async searchStudents(searchTerm: string, filters?: any): Promise<Student[]> {
    try {
      console.log('🔍 [StudentService] Buscando estudiantes:', searchTerm, filters);
      
      const response = await apiService.get(`${API_ENDPOINTS.STUDENTS}/search/?q=${searchTerm}`);
      
      console.log('✅ [StudentService] Estudiantes encontrados:', (response as any).data.length);
      return (response as any).data as Student[];
    } catch (error) {
      console.error('❌ [StudentService] Error buscando estudiantes:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de un estudiante
   * @param studentId - ID del estudiante
   * @returns Estadísticas del estudiante
   */
  async getStudentStats(studentId: string): Promise<any> {
    try {
      console.log('📊 [StudentService] Obteniendo estadísticas del estudiante:', studentId);
      
      const response = await apiService.get(`${API_ENDPOINTS.STUDENTS}/${studentId}/stats/`);
      
      console.log('✅ [StudentService] Estadísticas obtenidas:', (response as any).data);
      return (response as any).data;
    } catch (error) {
      console.error('❌ [StudentService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos básicos del estudiante como fallback
   * @param studentId - ID del estudiante
   * @returns Datos básicos del estudiante
   */
  private async getBasicStudentData(studentId: string): Promise<StudentProfileResponse> {
    try {
      console.log('🔄 [StudentService] Obteniendo datos básicos para:', studentId);
      
      const response = await apiService.get(API_ENDPOINTS.STUDENT_DETAIL.replace('{id}', studentId));
      console.log('🔄 [StudentService] Datos básicos obtenidos:', (response as any).data);
      
      // Crear respuesta básica
      return {
        student: (response as any).data as any,
        user_data: {
          full_name: ((response as any).data as any)?.user?.full_name || 'Nombre no disponible',
          email: ((response as any).data as any)?.user?.email || 'Email no disponible',
          phone: ((response as any).data as any)?.user?.phone,
          bio: ((response as any).data as any)?.user?.bio,
          first_name: ((response as any).data as any)?.user?.first_name || '',
          last_name: ((response as any).data as any)?.user?.last_name || ''
        },
        perfil_detallado: {}
      };
    } catch (error) {
      console.error('❌ [StudentService] Error obteniendo datos básicos:', error);
      throw error;
    }
  }
}

export const studentService = new StudentService();
export default studentService;