import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface StudentProfileResponse {
  student: {
    id: string;
    career?: string;
    university?: string;
    experience_years?: number;
    hours_per_week?: number;
    area?: string;
    availability?: string;
    skills?: string[];
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    cv_link?: string;
    certificado_link?: string;
  };
  user_data: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    bio?: string;
  };
  perfil_detallado: {
    fecha_nacimiento?: string;
    genero?: string;
    [key: string]: any;
  };
}

export const useStudentProfileDetails = (studentId: string | null) => {
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useStudentProfileDetails] Obteniendo perfil del estudiante:', id);
      console.log('🔍 [useStudentProfileDetails] Tipo de ID:', typeof id);
      console.log('🔍 [useStudentProfileDetails] Valor del ID:', id);

      const response = await apiService.getStudentProfileDetails(id);
      console.log('✅ [useStudentProfileDetails] Perfil obtenido:', response);
      console.log('🔍 [useStudentProfileDetails] Tipo de respuesta:', typeof response);
      console.log('🔍 [useStudentProfileDetails] Es objeto:', typeof response === 'object');
      console.log('🔍 [useStudentProfileDetails] Es null:', response === null);
      console.log('🔍 [useStudentProfileDetails] Es undefined:', response === undefined);
      
      if (response && typeof response === 'object') {
        console.log('🔍 [useStudentProfileDetails] Keys disponibles:', Object.keys(response));
        console.log('🔍 [useStudentProfileDetails] Tiene student:', 'student' in response);
        console.log('🔍 [useStudentProfileDetails] Tiene user_data:', 'user_data' in response);
        console.log('🔍 [useStudentProfileDetails] Tiene perfil_detallado:', 'perfil_detallado' in response);
      }
      
      // Type guard para verificar que la respuesta tiene la estructura esperada
      if (response && typeof response === 'object' && 'student' in response && 'user_data' in response) {
        // Estructura anidada (formato esperado)
        const typedResponse = response as StudentProfileResponse;
        
        console.log('🔍 [useStudentProfileDetails] Usando estructura anidada');
        
        console.log('🔍 [useStudentProfileDetails] Estructura de la respuesta:', {
          hasStudent: !!typedResponse.student,
          hasUserData: !!typedResponse.user_data,
          hasPerfilDetallado: !!typedResponse.perfil_detallado,
          studentKeys: typedResponse.student ? Object.keys(typedResponse.student) : [],
          userDataKeys: typedResponse.user_data ? Object.keys(typedResponse.user_data) : [],
          perfilKeys: typedResponse.perfil_detallado ? Object.keys(typedResponse.perfil_detallado) : []
        });
        
        // Log específico de campos problemáticos
        if (typedResponse.student) {
          console.log('🔍 [useStudentProfileDetails] Campos del estudiante:', {
            career: typedResponse.student.career,
            university: typedResponse.student.university,
            experience_years: typedResponse.student.experience_years,
            hours_per_week: typedResponse.student.hours_per_week,
            area: typedResponse.student.area,
            availability: typedResponse.student.availability,
            skills: typedResponse.student.skills,
            linkedin_url: typedResponse.student.linkedin_url,
            github_url: typedResponse.student.github_url,
            portfolio_url: typedResponse.student.portfolio_url,
            cv_link: typedResponse.student.cv_link,
            certificado_link: typedResponse.student.certificado_link
          });
        }
        
        if (typedResponse.user_data) {
          console.log('🔍 [useStudentProfileDetails] Campos del usuario:', {
            full_name: typedResponse.user_data.full_name,
            email: typedResponse.user_data.email,
            phone: typedResponse.user_data.phone,
            birthdate: typedResponse.user_data.birthdate,
            gender: typedResponse.user_data.gender,
            bio: typedResponse.user_data.bio
          });
        }

        setProfile(typedResponse);
      } else if (response && typeof response === 'object' && 'user_data' in response) {
        // Estructura híbrida (campos planos + campos anidados)
        console.log('🔍 [useStudentProfileDetails] Usando estructura híbrida');
        console.log('🔍 [useStudentProfileDetails] Campos disponibles en respuesta híbrida:', Object.keys(response));
        console.log('🔍 [useStudentProfileDetails] Respuesta híbrida completa:', response);
        
        // Convertir estructura híbrida a estructura anidada
        const hybridResponse = response as any;
        
        // Mapeo híbrido: combinar campos planos con campos anidados
        const convertedResponse: StudentProfileResponse = {
          student: {
            id: hybridResponse.id || '',
            career: hybridResponse.career || '',
            university: hybridResponse.university || '',
            experience_years: hybridResponse.experience_years || 0,
            hours_per_week: hybridResponse.hours_per_week || 20,
            area: hybridResponse.area || '',
            availability: hybridResponse.availability || 'flexible',
            skills: hybridResponse.skills || [],
            linkedin_url: hybridResponse.linkedin_url || '',
            github_url: hybridResponse.github_url || '',
            portfolio_url: hybridResponse.portfolio_url || '',
            cv_link: hybridResponse.cv_link || '',
            certificado_link: hybridResponse.certificado_link || ''
          },
          user_data: hybridResponse.user_data || {
            id: hybridResponse.user || '',
            full_name: hybridResponse.full_name || '',
            email: hybridResponse.email || '',
            phone: hybridResponse.phone || '',
            birthdate: hybridResponse.birthdate || '',
            gender: hybridResponse.gender || '',
            bio: hybridResponse.bio || ''
          },
          perfil_detallado: hybridResponse.perfil_detallado || {
            fecha_nacimiento: hybridResponse.fecha_nacimiento || '',
            genero: hybridResponse.genero || ''
          }
        };
        
        // Log detallado de los valores originales vs mapeados
        console.log('🔍 [useStudentProfileDetails] VALORES ORIGINALES de la API:');
        console.log('🔍 [useStudentProfileDetails] - career (original):', hybridResponse.career);
        console.log('🔍 [useStudentProfileDetails] - university (original):', hybridResponse.university);
        console.log('🔍 [useStudentProfileDetails] - experience_years (original):', hybridResponse.experience_years);
        console.log('🔍 [useStudentProfileDetails] - area (original):', hybridResponse.area);
        console.log('🔍 [useStudentProfileDetails] - skills (original):', hybridResponse.skills);
        console.log('🔍 [useStudentProfileDetails] - linkedin_url (original):', hybridResponse.linkedin_url);
        console.log('🔍 [useStudentProfileDetails] - github_url (original):', hybridResponse.github_url);
        console.log('🔍 [useStudentProfileDetails] - portfolio_url (original):', hybridResponse.portfolio_url);
        console.log('🔍 [useStudentProfileDetails] - cv_link (original):', hybridResponse.cv_link);
        console.log('🔍 [useStudentProfileDetails] - certificado_link (original):', hybridResponse.certificado_link);
        
        console.log('🔍 [useStudentProfileDetails] VALORES MAPEADOS:');
        console.log('🔍 [useStudentProfileDetails] - career (mapeado):', convertedResponse.student.career);
        console.log('🔍 [useStudentProfileDetails] - university (mapeado):', convertedResponse.student.university);
        console.log('🔍 [useStudentProfileDetails] - experience_years (mapeado):', convertedResponse.student.experience_years);
        console.log('🔍 [useStudentProfileDetails] - area (mapeado):', convertedResponse.student.area);
        console.log('🔍 [useStudentProfileDetails] - skills (mapeado):', convertedResponse.student.skills);
        console.log('🔍 [useStudentProfileDetails] - linkedin_url (mapeado):', convertedResponse.student.linkedin_url);
        console.log('🔍 [useStudentProfileDetails] - github_url (mapeado):', convertedResponse.student.github_url);
        console.log('🔍 [useStudentProfileDetails] - portfolio_url (mapeado):', convertedResponse.student.portfolio_url);
        console.log('🔍 [useStudentProfileDetails] - cv_link (mapeado):', convertedResponse.student.cv_link);
        console.log('🔍 [useStudentProfileDetails] - certificado_link (mapeado):', convertedResponse.student.certificado_link);
        
        console.log('🔍 [useStudentProfileDetails] Campos mapeados del estudiante:', {
          career: convertedResponse.student.career,
          university: convertedResponse.student.university,
          experience_years: convertedResponse.student.experience_years,
          hours_per_week: convertedResponse.student.hours_per_week,
          area: convertedResponse.student.area,
          availability: convertedResponse.student.availability,
          skills: convertedResponse.student.skills,
          linkedin_url: convertedResponse.student.linkedin_url,
          github_url: convertedResponse.student.github_url,
          portfolio_url: convertedResponse.student.portfolio_url,
          cv_link: convertedResponse.student.cv_link,
          certificado_link: convertedResponse.student.certificado_link
        });
        
        console.log('🔍 [useStudentProfileDetails] Campos mapeados del usuario:', {
          full_name: convertedResponse.user_data.full_name,
          email: convertedResponse.user_data.email,
          phone: convertedResponse.user_data.phone,
          birthdate: convertedResponse.user_data.birthdate,
          gender: convertedResponse.user_data.gender,
          bio: convertedResponse.user_data.bio
        });
        
        console.log('🔍 [useStudentProfileDetails] Respuesta convertida:', convertedResponse);
        
        setProfile(convertedResponse);
      } else {
        console.error('❌ [useStudentProfileDetails] Respuesta de la API no tiene la estructura esperada:', response);
        console.error('❌ [useStudentProfileDetails] Estructura actual:', {
          tipo: typeof response,
          esObjeto: typeof response === 'object',
          keys: response && typeof response === 'object' ? Object.keys(response) : 'N/A',
          respuestaCompleta: response
        });
        setError('La respuesta de la API no tiene la estructura esperada');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al cargar el perfil del estudiante';
      setError(errorMessage);
      console.error('❌ [useStudentProfileDetails] Error obteniendo perfil:', err);
      console.error('❌ [useStudentProfileDetails] Error completo:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 [useStudentProfileDetails] useEffect ejecutándose');
    console.log('🔍 [useStudentProfileDetails] studentId recibido:', studentId);
    console.log('🔍 [useStudentProfileDetails] Tipo de studentId:', typeof studentId);
    
    if (studentId) {
      console.log('🔍 [useStudentProfileDetails] Llamando a fetchProfile con:', studentId);
      fetchProfile(studentId);
    } else {
      console.log('🔍 [useStudentProfileDetails] studentId es null/undefined, limpiando estado');
      setProfile(null);
      setError(null);
    }
  }, [studentId, fetchProfile]);

  const refetch = useCallback(() => {
    if (studentId) {
      fetchProfile(studentId);
    }
  }, [studentId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
    // Helper method to check if profile is loaded
    isLoaded: !loading && !error && profile !== null
  };
};
