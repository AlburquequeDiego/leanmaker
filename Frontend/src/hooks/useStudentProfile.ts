import { useState, useCallback, useEffect } from 'react';
import { studentService } from '../services/student.service';
import type { StudentProfileResponse } from '../types';
import { authService } from '../services/auth.service';

export const useStudentProfile = (studentId: string | null) => {
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useStudentProfile] Obteniendo perfil del estudiante:', id);

      // Primero verificar si el estudiante existe
      console.log('🔍 [useStudentProfile] Verificando existencia del estudiante...');
      const studentExists = await studentService.checkStudentExists(id);
      
      if (!studentExists) {
        const errorMessage = `El estudiante con ID ${id} no existe en la base de datos`;
        setError(errorMessage);
        console.error('❌ [useStudentProfile] Estudiante no encontrado:', errorMessage);
        return;
      }

      console.log('✅ [useStudentProfile] Estudiante verificado, cargando perfil...');
      const response = await studentService.getStudentProfileDetails(id);
      console.log('✅ [useStudentProfile] Perfil obtenido exitosamente:', response);
      console.log('🔍 [useStudentProfile] Tipo de respuesta:', typeof response);
      console.log('🔍 [useStudentProfile] Keys de la respuesta:', response ? Object.keys(response) : 'No hay respuesta');
      
      if (response) {
        console.log('🔍 [useStudentProfile] Estructura del perfil:');
        console.log('🔍 [useStudentProfile] - user_data:', response.user_data);
        console.log('🔍 [useStudentProfile] - student:', response.student);
        console.log('🔍 [useStudentProfile] - perfil_detallado:', response.perfil_detallado);
        
        setProfile(response);
      } else {
        // Si no se pudo obtener el perfil completo, intentar obtener información básica
        console.log('⚠️ [useStudentProfile] Perfil completo no disponible, intentando información básica...');
        const basicInfo = await studentService.getStudentBasicInfo(id);
        
        if (basicInfo) {
          console.log('✅ [useStudentProfile] Información básica obtenida:', basicInfo);
          // Crear un perfil básico con la información disponible
          const fallbackProfile: any = {
            user_data: {
              full_name: basicInfo.name || basicInfo.full_name || basicInfo.email || 'Estudiante',
              email: basicInfo.email || 'Email no disponible',
              phone: basicInfo.phone || 'Teléfono no disponible',
              bio: 'Información básica del estudiante',
              first_name: (basicInfo.name || basicInfo.full_name || '').split(' ')[0] || 'Estudiante',
              last_name: (basicInfo.name || basicInfo.full_name || '').split(' ').slice(1).join(' ') || 'Estudiante'
            },
            student: {
              id: id,
              user: id,
              career: basicInfo.career || 'Carrera no disponible',
              university: basicInfo.university || 'Universidad no disponible',
              skills: basicInfo.skills || [],
              status: 'pending',
              api_level: 1,
              strikes: 0,
              gpa: 0,
              completed_projects: 0,
              total_hours: 0,
              experience_years: 0,
              hours_per_week: 20,
              availability: 'flexible',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            perfil_detallado: {},
            _isFallback: true // Marcar como perfil de fallback
          };
          
          setProfile(fallbackProfile);
        } else {
          throw new Error('No se pudo obtener información del estudiante desde ningún endpoint');
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar el perfil del estudiante';
      setError(errorMessage);
      console.error('❌ [useStudentProfile] Error obteniendo perfil:', err);
      console.error('❌ [useStudentProfile] Tipo de error:', typeof err);
      console.error('❌ [useStudentProfile] Stack del error:', err.stack);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 [useStudentProfile] useEffect ejecutándose');
    console.log('🔍 [useStudentProfile] studentId recibido:', studentId);
    
    if (studentId) {
      console.log('🔍 [useStudentProfile] Llamando a fetchProfile con:', studentId);
      fetchProfile(studentId);
    } else {
      console.log('🔍 [useStudentProfile] studentId es null/undefined, limpiando estado');
      setProfile(null);
      setError(null);
    }
  }, [studentId, fetchProfile]);

  const refreshProfile = useCallback(() => {
    if (studentId) {
      fetchProfile(studentId);
    }
  }, [studentId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    // Helper method to check if profile is loaded
    isLoaded: !loading && !error && profile !== null
  };
};

export const useMultipleStudentProfiles = (studentIds: string[]) => {
  const [profiles, setProfiles] = useState<StudentProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProfiles([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useMultipleStudentProfiles] Obteniendo múltiples perfiles:', ids);

      const response = await studentService.getMultipleStudentProfiles(ids);
      console.log('✅ [useMultipleStudentProfiles] Perfiles obtenidos exitosamente:', response.length);
      
      setProfiles(response);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar múltiples perfiles';
      setError(errorMessage);
      console.error('❌ [useMultipleStudentProfiles] Error obteniendo perfiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 [useMultipleStudentProfiles] useEffect ejecutándose');
    console.log('🔍 [useMultipleStudentProfiles] studentIds recibidos:', studentIds);
    
    if (studentIds.length > 0) {
      console.log('🔍 [useMultipleStudentProfiles] Llamando a fetchProfiles con:', studentIds);
      fetchProfiles(studentIds);
    } else {
      console.log('🔍 [useMultipleStudentProfiles] No hay IDs, limpiando estado');
      setProfiles([]);
      setError(null);
    }
  }, [studentIds, fetchProfiles]);

  const refreshProfiles = useCallback(() => {
    if (studentIds.length > 0) {
      fetchProfiles(studentIds);
    }
  }, [studentIds, fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refreshProfiles,
    // Helper method to check if profiles are loaded
    isLoaded: !loading && !error && profiles.length > 0
  };
};

export const useCompanyStudentsHistory = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, any>>({});

  const fetchStudents = async () => {
    console.log('🚀 [fetchStudents] INICIANDO - Obteniendo estudiantes de la empresa');
    setLoading(true);
    setError(null);
    
    try {
      // PASO 1: Obtener lista básica de estudiantes (IDs y datos mínimos)
      console.log('🔍 [fetchStudents] PASO 1: Llamando a getCompanyStudentsHistory...');
      const response = await studentService.getCompanyStudentsHistory();
      console.log('✅ [fetchStudents] PASO 1 COMPLETADO - Respuesta recibida:', response);
      
      if (response && response.results) {
        console.log('🔍 [fetchStudents] PASO 1: Estableciendo students con', response.results.length, 'estudiantes');
        setStudents(response.results);
        
        // PASO 2: Obtener el token ANTES de llamar a loadStudentProfiles
        console.log('🔍 [fetchStudents] PASO 2: Obteniendo token usando authService...');
        const token = authService.getAccessToken();
        console.log('🔑 [fetchStudents] Token obtenido:', token ? token.substring(0, 20) + '...' : 'No hay token');
        
        if (!token) {
          console.error('❌ [fetchStudents] No hay token disponible para cargar perfiles');
          setError('No hay token de autenticación disponible');
          return;
        }
        
        // PASO 3: Cargar perfiles completos de cada estudiante
        console.log('🔍 [fetchStudents] PASO 3: Iniciando carga de perfiles completos...');
        console.log('🔍 [fetchStudents] PASO 3: Llamando a loadStudentProfiles con:', response.results);
        
        // Llamar a loadStudentProfiles con los datos básicos Y el token
        await loadStudentProfiles(response.results, token);
        
        console.log('✅ [fetchStudents] PASO 3 COMPLETADO - Perfiles cargados');
      } else {
        console.error('❌ [fetchStudents] Respuesta inválida:', response);
        setError('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ [fetchStudents] Error general:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      console.log('🔍 [fetchStudents] FINALIZANDO - Estableciendo loading = false');
      setLoading(false);
    }
  };

  // Función para cargar perfiles individuales (igual que en Postulaciones)
  const loadStudentProfiles = async (studentsData: any[], token: string) => {
    console.log('🚀 [loadStudentProfiles] INICIANDO - Cargando perfiles completos para:', studentsData.length, 'estudiantes');
    console.log('🔍 [loadStudentProfiles] Datos de entrada:', studentsData);
    
    try {
      const profiles: Record<string, any> = {};
      
      // Extraer IDs únicos de estudiantes
      const studentIds = studentsData.map(student => String(student.id)).filter((id, index, arr) => arr.indexOf(id) === index);
      
      console.log('🔍 [loadStudentProfiles] IDs únicos de estudiantes:', studentIds);
      
      // Cargar cada perfil individualmente usando el MISMO endpoint que Postulaciones
      for (const studentId of studentIds) {
        console.log(`🔍 [loadStudentProfiles] Cargando perfil para estudiante: ${studentId}`);
        
        try {
          // LLAMAR AL MISMO ENDPOINT QUE POSTULACIONES
          const response = await fetch(`/api/students/${studentId}/profile/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`🔍 [loadStudentProfiles] Response status para ${studentId}:`, response.status);
          
          if (response.ok) {
            const profileData = await response.json();
            console.log(`✅ [loadStudentProfiles] Perfil obtenido para ${studentId}:`, profileData);
            
            // Normalizar la estructura del perfil (igual que en Postulaciones)
            const normalizedProfile = {
              ...profileData,
              // Asegurar que user_data esté disponible
              user_data: profileData.user_data || {
                bio: profileData.bio || profileData.student?.bio || '',
                full_name: profileData.full_name || profileData.student?.name || '',
                email: profileData.email || profileData.student?.email || '',
                phone: profileData.phone || profileData.student?.phone || '',
                birthdate: profileData.birthdate || profileData.student?.birthdate || '',
                gender: profileData.gender || profileData.student?.gender || ''
              },
              // Asegurar que student esté disponible
              student: profileData.student || {
                career: profileData.career || '',
                university: profileData.university || '',
                experience_years: profileData.experience_years || 0,
                hours_per_week: profileData.hours_per_week || 20,
                area: profileData.area || '',
                availability: profileData.availability || 'flexible',
                skills: profileData.skills || [],
                linkedin_url: profileData.linkedin_url || '',
                github_url: profileData.github_url || '',
                portfolio_url: profileData.portfolio_url || '',
                cv_link: profileData.cv_link || '',
                certificado_link: profileData.certificado_link || ''
              }
            };
            
            profiles[studentId] = normalizedProfile;
            console.log(`✅ [loadStudentProfiles] Perfil normalizado para ${studentId}:`, normalizedProfile);
          } else {
            console.warn(`⚠️ [loadStudentProfiles] Error HTTP para ${studentId}:`, response.status);
            if (response.status === 401) {
              console.error(`❌ [loadStudentProfiles] Error de autenticación para ${studentId}. Token:`, token.substring(0, 20) + '...');
            }
          }
        } catch (error) {
          console.warn(`⚠️ [loadStudentProfiles] Error cargando perfil de ${studentId}:`, error);
        }
      }
      
      console.log('📊 [loadStudentProfiles] Todos los perfiles cargados:', profiles);
      console.log('📊 [loadStudentProfiles] Actualizando estado studentProfiles con:', Object.keys(profiles).length, 'perfiles');
      setStudentProfiles(profiles);
      
    } catch (error) {
      console.error('❌ [loadStudentProfiles] Error general:', error);
    }
  };

  // useEffect para ejecutar fetchStudents al montar el componente
  useEffect(() => {
    console.log('🔧 [useCompanyStudentsHistory] useEffect ejecutándose - Llamando a fetchStudents');
    fetchStudents();
  }, []); // Solo se ejecuta al montar el componente

  const refreshStudents = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    stats,
    loading,
    error,
    refreshStudents,
    studentProfiles, // ✅ NUEVO: perfiles completos de cada estudiante
    // Helper method to check if data is loaded
    isLoaded: !loading && !error && students.length > 0
  };
};
