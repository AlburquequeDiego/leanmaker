import { useState, useEffect, useCallback } from 'react';
import { studentService, StudentProfileResponse } from '../services/student.service';

interface UseStudentProfileReturn {
  profile: StudentProfileResponse | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

/**
 * Hook personalizado para obtener y gestionar perfiles de estudiantes
 * @param studentId - ID del estudiante (opcional, se puede establecer después)
 * @returns Objeto con el perfil, estado de carga, errores y funciones de control
 */
export const useStudentProfile = (studentId?: string): UseStudentProfileReturn => {
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene el perfil del estudiante
   */
  const fetchProfile = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useStudentProfile] Obteniendo perfil para estudiante:', id);
      console.log('🔍 [useStudentProfile] ID del estudiante es válido:', !!id);
      console.log('🔍 [useStudentProfile] Tipo del ID:', typeof id);
      
      const studentProfile = await studentService.getStudentProfile(id);
      setProfile(studentProfile);
      
      console.log('✅ [useStudentProfile] Perfil obtenido exitosamente:', studentProfile);
    } catch (err: any) {
      console.error('❌ [useStudentProfile] Error obteniendo perfil:', err);
      console.error('❌ [useStudentProfile] Error completo:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Error al obtener el perfil del estudiante';
      setError(errorMessage);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresca el perfil del estudiante
   */
  const refreshProfile = useCallback(async () => {
    if (profile?.student?.id) {
      await fetchProfile(profile.student.id);
    }
  }, [profile?.student?.id, fetchProfile]);

  /**
   * Limpia el perfil actual
   */
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setLoading(false);
  }, []);

  // Efecto para cargar el perfil cuando cambie el studentId
  useEffect(() => {
    console.log('🔄 [useStudentProfile] useEffect ejecutado');
    console.log('🔍 [useStudentProfile] studentId recibido:', studentId);
    console.log('🔍 [useStudentProfile] studentId es válido:', !!studentId);
    console.log('🔍 [useStudentProfile] fetchProfile function:', typeof fetchProfile);
    console.log('🔍 [useStudentProfile] clearProfile function:', typeof clearProfile);
    
    if (studentId) {
      console.log('🚀 [useStudentProfile] Iniciando fetchProfile para:', studentId);
      console.log('🚀 [useStudentProfile] Llamando a fetchProfile...');
      fetchProfile(studentId);
      console.log('🚀 [useStudentProfile] fetchProfile llamado');
    } else {
      console.log('⚠️ [useStudentProfile] No hay studentId, limpiando perfil');
      clearProfile();
    }
  }, [studentId, fetchProfile, clearProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    clearProfile
  };
};

/**
 * Hook para obtener múltiples perfiles de estudiantes
 * @param studentIds - Array de IDs de estudiantes
 * @returns Objeto con los perfiles, estado de carga y errores
 */
export const useMultipleStudentProfiles = (studentIds: string[]) => {
  const [profiles, setProfiles] = useState<StudentProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (studentIds.length === 0) {
        setProfiles([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [useMultipleStudentProfiles] Obteniendo perfiles para:', studentIds);
        
        const studentProfiles = await studentService.getMultipleStudentProfiles(studentIds);
        setProfiles(studentProfiles);
        
        console.log('✅ [useMultipleStudentProfiles] Perfiles obtenidos:', studentProfiles.length);
      } catch (err: any) {
        console.error('❌ [useMultipleStudentProfiles] Error obteniendo perfiles:', err);
        
        const errorMessage = err.response?.data?.error || err.message || 'Error al obtener los perfiles';
        setError(errorMessage);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [studentIds]);

  return { profiles, loading, error };
};
