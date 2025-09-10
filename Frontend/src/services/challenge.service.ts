/**
 * 🎯 SERVICIO PARA DESAFÍOS COLECTIVOS
 * 
 * Este servicio maneja todas las operaciones relacionadas con desafíos colectivos
 * que las empresas pueden publicar para la academia.
 */

import { 
  CollectiveChallenge, 
  ChallengeListResponse, 
  ChallengeDetailResponse,
  ChallengeCreateResponse,
  ChallengeUpdateResponse,
  ChallengeDeleteResponse,
  ChallengeFormData 
} from '../types';

class ChallengeService {
  private baseUrl = '/api/challenges';

  /**
   * Obtiene la lista de desafíos colectivos con filtros y paginación
   */
  async getChallenges(params: {
    page?: number;
    limit?: number;
    status?: string;
    period?: string;
    search?: string;
  } = {}): Promise<ChallengeListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.period) searchParams.append('period', params.period);
    if (params.search) searchParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener desafíos');
    }

    return response.json();
  }

  /**
   * Obtiene los detalles de un desafío específico
   */
  async getChallengeById(challengeId: string): Promise<ChallengeDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${challengeId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el desafío');
    }

    return response.json();
  }

  /**
   * Obtiene los desafíos de la empresa autenticada
   */
  async getCompanyChallenges(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ChallengeListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${this.baseUrl}/company/challenges/?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener desafíos de la empresa');
    }

    return response.json();
  }

  /**
   * Crea un nuevo desafío colectivo
   */
  async createChallenge(challengeData: ChallengeFormData): Promise<ChallengeCreateResponse> {
    const response = await fetch(`${this.baseUrl}/company/challenges/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(challengeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el desafío');
    }

    return response.json();
  }

  /**
   * Actualiza un desafío existente
   */
  async updateChallenge(challengeId: string, challengeData: Partial<ChallengeFormData>): Promise<ChallengeUpdateResponse> {
    const response = await fetch(`${this.baseUrl}/company/challenges/${challengeId}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(challengeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el desafío');
    }

    return response.json();
  }

  /**
   * Elimina un desafío
   */
  async deleteChallenge(challengeId: string): Promise<ChallengeDeleteResponse> {
    const response = await fetch(`${this.baseUrl}/company/challenges/${challengeId}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar el desafío');
    }

    return response.json();
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }
    return token;
  }

  /**
   * Valida los datos del formulario antes de enviar
   */
  validateChallengeData(data: ChallengeFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones obligatorias
    if (!data.title || data.title.trim().length < 5) {
      errors.push('El título debe tener al menos 5 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!data.requirements || data.requirements.trim().length < 10) {
      errors.push('Los requisitos deben tener al menos 10 caracteres');
    }

    if (!data.academic_year || data.academic_year.trim().length === 0) {
      errors.push('El año académico es obligatorio');
    }

    if (!data.semester || data.semester.trim().length === 0) {
      errors.push('El semestre es obligatorio');
    }

    // Validaciones numéricas
    if (data.max_teams < 1 || data.max_teams > 20) {
      errors.push('El número máximo de equipos debe estar entre 1 y 20');
    }

    if (data.students_per_team < 1 || data.students_per_team > 10) {
      errors.push('El número de estudiantes por equipo debe estar entre 1 y 10');
    }

    if (data.duration_weeks < 1 || data.duration_weeks > 52) {
      errors.push('La duración debe estar entre 1 y 52 semanas');
    }

    if (data.hours_per_week < 1 || data.hours_per_week > 40) {
      errors.push('Las horas por semana deben estar entre 1 y 40');
    }

    // Validaciones de fechas
    const registrationStart = new Date(data.registration_start);
    const registrationEnd = new Date(data.registration_end);
    const challengeStart = new Date(data.challenge_start);
    const challengeEnd = new Date(data.challenge_end);

    if (registrationStart >= registrationEnd) {
      errors.push('La fecha de fin de inscripciones debe ser posterior a la de inicio');
    }

    if (registrationEnd >= challengeStart) {
      errors.push('El inicio del desafío debe ser posterior al fin de inscripciones');
    }

    if (challengeStart >= challengeEnd) {
      errors.push('La fecha de fin del desafío debe ser posterior a la de inicio');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea los datos del desafío para mostrar en la UI
   */
  formatChallengeForDisplay(challenge: CollectiveChallenge) {
    return {
      ...challenge,
      formatted_dates: {
        registration_start: new Date(challenge.registration_start).toLocaleDateString('es-CL'),
        registration_end: new Date(challenge.registration_end).toLocaleDateString('es-CL'),
        challenge_start: new Date(challenge.challenge_start).toLocaleDateString('es-CL'),
        challenge_end: new Date(challenge.challenge_end).toLocaleDateString('es-CL'),
      },
      status_display: this.getStatusDisplay(challenge.status),
      period_display: this.getPeriodDisplay(challenge.period_type),
      modality_display: this.getModalityDisplay(challenge.modality),
    };
  }

  /**
   * Obtiene el texto de estado para mostrar
   */
  private getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Borrador',
      'published': 'Publicado',
      'active': 'Activo',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
  }

  /**
   * Obtiene el texto de período para mostrar
   */
  private getPeriodDisplay(period: string): string {
    const periodMap: Record<string, string> = {
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual',
    };
    return periodMap[period] || period;
  }

  /**
   * Obtiene el texto de modalidad para mostrar
   */
  private getModalityDisplay(modality: string): string {
    const modalityMap: Record<string, string> = {
      'remote': 'Remoto',
      'onsite': 'Presencial',
      'hybrid': 'Híbrido',
    };
    return modalityMap[modality] || modality;
  }
}

// Exportar instancia única del servicio
export const challengeService = new ChallengeService();
export default challengeService;
