import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptApplication, adaptApplicationList } from '../../../utils/adapters';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { Application, Student } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStudentProfile } from '../../../hooks/useStudentProfile';

const cantidadOpciones = [5, 10, 50, 100, 150, 200, 'todas'];

// Componente para mostrar el perfil rápido del estudiante
const QuickProfileContent: React.FC<{ studentId: string; onClose: () => void; application?: Application }> = ({ studentId, onClose, application }) => {
  const { profile, loading, error } = useStudentProfile(studentId);

  // Debug: Log the profile structure
  console.log('🔍 [QuickProfileContent] Profile structure:', profile);
  console.log('🔍 [QuickProfileContent] student_data:', profile?.student);
  console.log('🔍 [QuickProfileContent] user_data:', profile?.user_data);
  console.log('🔍 [QuickProfileContent] Application data:', application);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
          Cargando perfil...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar el perfil: {error}
        </Alert>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No se pudo cargar el perfil del estudiante.
        </Typography>
        <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Box>
    );
  }

  // Extract data from nested structure
  const studentData = profile.student || {};
  const userData = profile.user_data || {};

  return (
    <Box sx={{ p: 2 }}>
      {/* Información Personal */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Información Personal
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Nombre:</strong> {userData.full_name || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {userData.email || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Teléfono:</strong> {userData.phone || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Fecha de Nacimiento:</strong> {userData.birthdate || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Género:</strong> {userData.gender || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Carta de Presentación:</strong> {userData.bio || 'No se ha proporcionado carta de presentación'}
          </Typography>
        </Box>
      </Paper>

      {/* Información Académica */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Información Académica
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Carrera:</strong> {studentData.career || 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Universidad:</strong> {studentData.university || 'No disponible'}
          </Typography>
        </Box>
      </Paper>

      {/* Habilidades y Experiencia */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Habilidades y Experiencia
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Experiencia:</strong> {studentData.experience_years || 0} años
          </Typography>
          <Typography variant="body2">
            <strong>Horas semanales:</strong> {studentData.hours_per_week || 0} horas
          </Typography>
          <Typography variant="body2">
            <strong>Habilidades:</strong> {studentData.skills?.join(', ') || 'No especificadas'}
          </Typography>
          <Typography variant="body2">
            <strong>Área de Interés:</strong> {studentData.area || 'No especificado'}
          </Typography>
          <Typography variant="body2">
            <strong>Modalidad:</strong> {studentData.availability || 'No especificado'}
          </Typography>
        </Box>
      </Paper>

      {/* Enlaces Profesionales */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Enlaces Profesionales
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>LinkedIn:</strong> {studentData.linkedin_url ? (
              <a href={studentData.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline' }}>
                Ver perfil
              </a>
            ) : 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>GitHub:</strong> {studentData.github_url ? (
              <a href={studentData.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'underline' }}>
                Ver repositorio
              </a>
            ) : 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Portafolio:</strong> {studentData.portfolio_url ? (
              <a href={studentData.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                Ver portafolio
              </a>
            ) : 'No disponible'}
          </Typography>
        </Box>
      </Paper>

      {/* Documentos */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Documentos
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>CV:</strong> {studentData.cv_link ? (
              <a href={studentData.cv_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                Ver CV
              </a>
            ) : 'No disponible'}
          </Typography>
          <Typography variant="body2">
            <strong>Certificado:</strong> {studentData.certificado_link ? (
              <a href={studentData.certificado_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                Ver certificado
              </a>
            ) : 'No disponible'}
          </Typography>
        </Box>
      </Paper>

      {/* Botón para cerrar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </Box>
    </Box>
  );
};

export const CompanyApplications: React.FC = () => {
  const api = useApi();
  const { themeMode } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(1);
  
  // Log cuando cambia el tab seleccionado
  useEffect(() => {
    console.log(`🔄 Tab cambiado a: ${selectedTab}, Filtro: ${getStatusFilter(selectedTab)}`);
  }, [selectedTab]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5, 5]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Hook para obtener el perfil del estudiante seleccionado
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { profile: studentProfile, loading: profileLoading, error: profileError, isLoaded } = useStudentProfile(selectedStudentId);
  
  // Estado para almacenar los perfiles de todos los estudiantes mostrados en las tarjetas
  const [studentProfiles, setStudentProfiles] = useState<Record<string, any>>({});
  
  // Debug: Log cuando cambie el perfil
  useEffect(() => {
    console.log('🔄 [Applications] selectedStudentId cambió:', selectedStudentId);
    console.log('🔄 [Applications] studentProfile actualizado:', studentProfile);
    console.log('🔄 [Applications] profileLoading:', profileLoading);
    console.log('🔄 [Applications] profileError:', profileError);
  }, [selectedStudentId, studentProfile, profileLoading, profileError]);
  
  // Log cuando cambia studentProfiles
  useEffect(() => {
    console.log('🔄 [useEffect] studentProfiles cambió:', studentProfiles);
    console.log('🔄 [useEffect] Keys de studentProfiles:', Object.keys(studentProfiles));
    console.log('🔄 [useEffect] Valores de studentProfiles:', studentProfiles);
  }, [studentProfiles]);

  // Estados para diálogos de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    applicationId: string;
    newStatus: Application['status'];
    actionType: 'review' | 'accept' | 'reject';
  } | null>(null);
  
  // Estado para modal de perfil rápido
  const [showQuickProfileDialog, setShowQuickProfileDialog] = useState(false);
  const [quickProfileStudentId, setQuickProfileStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Agregar un pequeño delay para evitar múltiples llamadas simultáneas
    const timer = setTimeout(() => {
      loadApplications();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Cargando aplicaciones desde:', API_ENDPOINTS.APPLICATIONS_RECEIVED);
      
      const response = await api.get(API_ENDPOINTS.APPLICATIONS_RECEIVED);
      console.log('🔍 Response completa:', response);
      console.log('🔍 Response.results:', response.results);
      console.log('🔍 Response.total:', response.total);
      
      // Verificar si la respuesta tiene la estructura esperada
      const applicationsData = response.data || response.results || response.data?.results || [];
      console.log('📊 Datos de aplicaciones sin adaptar:', applicationsData);
      
      // Aplicar adaptador a cada aplicación individualmente para mejor manejo
      const adaptedApplications = Array.isArray(applicationsData) 
        ? applicationsData.map(app => {
            const adapted = adaptApplication(app);
            console.log('🔍 Aplicación adaptada:', adapted);
            console.log('🔍 student_data en aplicación adaptada:', adapted.student_data);
            return adapted;
          })
        : [];
      console.log('✅ Aplicaciones adaptadas:', adaptedApplications);
      
      setApplications(adaptedApplications);
      
      // Cargar los perfiles de todos los estudiantes DESPUÉS de adaptar las aplicaciones
      console.log('📞 [loadApplications] Llamando a loadStudentProfiles con:', adaptedApplications);
      console.log('📞 [loadApplications] Tipo de adaptedApplications:', typeof adaptedApplications);
      console.log('📞 [loadApplications] Es array:', Array.isArray(adaptedApplications));
      console.log('📞 [loadApplications] Longitud:', adaptedApplications.length);
      await loadStudentProfiles(adaptedApplications);
      
    } catch (err: any) {
      console.error('❌ Error cargando aplicaciones:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Error al cargar aplicaciones';
      if (err.response?.status === 401) {
        errorMessage = 'No tienes permisos para ver estas aplicaciones';
      } else if (err.response?.status === 403) {
        errorMessage = 'Acceso denegado. Solo empresas pueden ver aplicaciones recibidas.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los perfiles de todos los estudiantes
  const loadStudentProfiles = async (applicationsData: any[]) => {
    console.log('🚀 [loadStudentProfiles] Función iniciada con:', applicationsData);
    try {
      const profiles: Record<string, any> = {};
      
      // Extraer IDs únicos de estudiantes de las aplicaciones adaptadas
      const studentIds = [...new Set(applicationsData.map(app => {
        // Las aplicaciones ya están adaptadas, usar el campo student directamente
        return String(app.student || '');
      }))].filter(Boolean);
      
      console.log('🔍 Cargando perfiles para estudiantes:', studentIds);
      console.log('🔍 Estructura de la primera aplicación adaptada:', applicationsData[0]);
      console.log('🔍 Campo student de la primera aplicación:', applicationsData[0]?.student);
      console.log('🔍 Tipo del campo student:', typeof applicationsData[0]?.student);
      
      // Cargar cada perfil individualmente
      for (const studentId of studentIds) {
        console.log(`🔍 [loadStudentProfiles] Intentando cargar perfil para: ${studentId}`);
        try {
          const response = await api.get(`/api/students/${studentId}/profile/`);
          console.log(`🔍 [loadStudentProfiles] Response completa para ${studentId}:`, response);
          console.log(`🔍 [loadStudentProfiles] Response.status para ${studentId}:`, response.status);
          console.log(`🔍 [loadStudentProfiles] Response.data para ${studentId}:`, response);
          console.log(`🔍 [loadStudentProfiles] Response.bio para ${studentId}:`, response?.bio);
          console.log(`🔍 [loadStudentProfiles] Response.user_data para ${studentId}:`, response?.user_data);
          console.log(`🔍 [loadStudentProfiles] Response.user_data.bio para ${studentId}:`, response?.user_data?.bio);
          console.log(`🔍 [loadStudentProfiles] Keys de response:`, Object.keys(response));
          console.log(`🔍 [loadStudentProfiles] Tipo de response:`, typeof response);
          console.log(`🔍 [loadStudentProfiles] Es objeto:`, typeof response === 'object');
          
          // Verificar si la respuesta tiene datos
          if (response && (response.student || response.user_data)) {
            console.log(`✅ [loadStudentProfiles] Respuesta válida para ${studentId}`);
            // Normalizar la estructura del perfil para mayor compatibilidad
            const profileData = response;
            console.log(`🔍 [loadStudentProfiles] Perfil original para ${studentId}:`, profileData);
            
            // Crear estructura normalizada
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
            console.log(`✅ Perfil normalizado para estudiante ${studentId}:`, normalizedProfile);
            console.log(`✅ [loadStudentProfiles] profiles[${studentId}] después de asignar:`, profiles[studentId]);
            console.log(`✅ [loadStudentProfiles] Object.keys(profiles) después de asignar:`, Object.keys(profiles));
          } else {
            console.warn(`⚠️ [loadStudentProfiles] Respuesta inválida para ${studentId}:`, {
              response: response,
              hasResponse: !!response,
              hasStudent: !!response?.student,
              hasUserData: !!response?.user_data,
              responseType: typeof response,
              responseKeys: response ? Object.keys(response) : []
            });
          }
        } catch (error) {
          console.warn(`⚠️ Error al cargar perfil del estudiante ${studentId}:`, error);
          console.warn(`⚠️ Error completo:`, error);
          console.warn(`⚠️ Error.message:`, error.message);
          console.warn(`⚠️ Error.response:`, error.response);
          // Crear perfil básico con datos de la aplicación como fallback
          const fallbackProfile = {
            user_data: {
              bio: applicationsData.find(app => String(app.student || app.student_data?.id) === studentId)?.student_bio || '',
              full_name: applicationsData.find(app => String(app.student || app.student_data?.id) === studentId)?.student_name || '',
              email: applicationsData.find(app => String(app.student || app.student_data?.id) === studentId)?.student_email || ''
            },
            student: {
              career: applicationsData.find(app => String(app.student || app.student_data?.id) === studentId)?.student_major || '',
              university: applicationsData.find(app => String(app.student || app.student_data?.id) === studentId)?.student_university || ''
            }
          };
          profiles[studentId] = fallbackProfile;
          console.log(`⚠️ Perfil fallback creado para estudiante ${studentId}:`, fallbackProfile);
        }
      }
      
      console.log('📊 [loadStudentProfiles] Antes de setStudentProfiles, profiles:', profiles);
      setStudentProfiles(profiles);
      console.log('📊 [loadStudentProfiles] Después de setStudentProfiles');
      console.log('📊 Perfiles de estudiantes cargados:', profiles);
      console.log('📊 Keys de studentProfiles:', Object.keys(profiles));
      console.log('📊 Valores de studentProfiles:', profiles);
    } catch (error) {
      console.error('❌ Error al cargar perfiles de estudiantes:', error);
      console.error('❌ Error completo:', error);
      console.error('❌ Error.message:', error.message);
      console.error('❌ Error.response:', error.response);
    }
  };

  const handleCantidadChange = (tabIdx: number, value: number | string) => {
    setCantidadPorTab(prev => prev.map((v, i) => (i === tabIdx ? value : v)));
  };

  const getStatusFilter = (tabIdx: number) => {
    switch (tabIdx) {
      case 0: return undefined; // Todas
      case 1: return 'pending';
      case 2: return 'reviewing';
      case 3: return 'accepted';
      case 4: return 'rejected';
      default: return undefined;
    }
  };

  const filteredApplications = applications.filter(app => {
    const status = getStatusFilter(selectedTab);
    const matches = status ? app.status === status : true;
    if (selectedTab === 4) { // Tab de rechazadas
      console.log(`🔍 Aplicación ${app.id} (${app.student_name}): status=${app.status}, matches=${matches}`);
    }
    return matches;
  });
  
  console.log(`📋 Tab seleccionado: ${selectedTab}, Filtro: ${getStatusFilter(selectedTab)}, Aplicaciones filtradas: ${filteredApplications.length}`);

  const cantidadActual = cantidadPorTab[selectedTab];
  const aplicacionesMostradas = cantidadActual === 'todas' ? filteredApplications : filteredApplications.slice(0, Number(cantidadActual));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'interviewed':
        return 'info';
      case 'reviewing':
        return 'warning';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'reviewing':
        return 'En Revisión';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'interviewed':
        return 'Entrevistada';
      case 'withdrawn':
        return 'Retirada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      setUpdatingStatus(applicationId);
      
      console.log('🔄 Actualizando aplicación:', applicationId, 'a estado:', newStatus);
      
      const response = await api.patch(`/api/applications/${applicationId}/`, {
        status: newStatus,
      });

      const updatedApplication = response.data;
      console.log('✅ Aplicación actualizada:', updatedApplication);

      if (!updatedApplication) {
        // Si la respuesta es inválida, recarga toda la lista
        await loadApplications();
        return;
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? {
            ...app,
            status: updatedApplication.status,
            company_notes: updatedApplication.company_notes,
            reviewed_at: updatedApplication.reviewed_at,
            responded_at: updatedApplication.responded_at,
          } : app
        )
      );
    } catch (error: any) {
      console.error('❌ Error actualizando estado de aplicación:', error);
      // Si hay error, recarga la lista para mantener la app funcional
      await loadApplications();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (application: Application) => {
    console.log('🔄 [Applications] handleViewDetails llamado');
    console.log('🔍 [Applications] Aplicación seleccionada:', application);
    console.log('🔍 [Applications] application.student:', application.student);
    console.log('🔍 [Applications] application.student_data:', application.student_data);
    
    setSelectedApplication(application);
    
    // Extraer el ID del estudiante de la aplicación
    const studentId = application.student || application.student_data?.id;
    console.log('🔍 [Applications] studentId extraído:', studentId);
    
    if (studentId) {
      console.log('✅ [Applications] Estableciendo selectedStudentId:', studentId);
      setSelectedStudentId(studentId);
      console.log('🔄 [Applications] selectedStudentId establecido:', studentId);
    } else {
      console.warn('⚠️ [Applications] No se pudo obtener ID del estudiante de la aplicación:', application);
    }
    
    setShowDetailDialog(true);
  };

  const handleViewQuickProfile = (application: Application) => {
    console.log('🔄 [Applications] handleViewQuickProfile llamado');
    const studentId = application.student || application.student_data?.id;
    
    if (studentId) {
      setQuickProfileStudentId(studentId);
      setShowQuickProfileDialog(true);
    } else {
      console.warn('⚠️ [Applications] No se pudo obtener ID del estudiante para perfil rápido');
    }
  };

  // Función para mostrar diálogo de confirmación antes de cambiar estado
  const handleStatusChangeWithConfirmation = (applicationId: string, newStatus: Application['status']) => {
    let actionType: 'review' | 'accept' | 'reject';
    
    if (newStatus === 'reviewing') actionType = 'review';
    else if (newStatus === 'accepted') actionType = 'accept';
    else if (newStatus === 'rejected') actionType = 'reject';
    else {
      // Para otros estados, ejecutar directamente sin confirmación
      handleStatusChange(applicationId, newStatus);
      return;
    }

    setConfirmAction({ applicationId, newStatus, actionType });
    setShowConfirmDialog(true);
  };

  // Función para ejecutar el cambio de estado después de confirmación
  const executeStatusChange = async () => {
    if (!confirmAction) return;
    
    setShowConfirmDialog(false);
    await handleStatusChange(confirmAction.applicationId, confirmAction.newStatus);
    setConfirmAction(null);
  };

  // Función para cancelar la confirmación
  const cancelStatusChange = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Función para obtener el mensaje de advertencia según el tipo de acción
  const getWarningMessage = (actionType: 'review' | 'accept' | 'reject') => {
    switch (actionType) {
      case 'review':
        return {
          title: '⚠️ Confirmar Cambio a "En Revisión"',
          message: '¿Estás seguro de que quieres marcar esta postulación como "En Revisión"?',
          consequences: [
            '• El estudiante será notificado de que su postulación está siendo revisada',
            '• Se activará el proceso de evaluación formal',
            '• Este cambio puede afectar la experiencia del estudiante',
            '• Se registrará la fecha de inicio de revisión'
          ],
          severity: 'warning' as const
        };
      case 'accept':
        return {
          title: '✅ Confirmar Aceptación de Postulación',
          message: '¿Estás seguro de que quieres ACEPTAR esta postulación?',
          consequences: [
            '• El estudiante será notificado de la aceptación',
            '• Se iniciará el proceso de incorporación al proyecto',
            '• Esta acción NO se puede deshacer fácilmente',
            '• Se registrará la fecha de aceptación oficial',
            '• El estudiante tendrá acceso a recursos del proyecto'
          ],
          severity: 'success' as const
        };
      case 'reject':
        return {
          title: '❌ Confirmar Rechazo de Postulación',
          message: '¿Estás seguro de que quieres RECHAZAR esta postulación?',
          consequences: [
            '• El estudiante será notificado del rechazo',
            '• Esta acción NO se puede deshacer fácilmente',
            '• Se registrará la fecha de rechazo oficial',
            '• El estudiante no podrá volver a postularse al mismo proyecto',
            '• Se enviará notificación al sistema de seguimiento'
          ],
          severity: 'error' as const
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: '¿Estás seguro de que quieres realizar esta acción?',
          consequences: [],
          severity: 'info' as const
        };
    }
  };

  // Logs de depuración para verificar estados
  console.log('🔍 Aplicaciones cargadas:', applications.length);
  console.log('🔍 Estados de aplicaciones:', applications.map(app => ({ id: app.id, status: app.status, student: app.student_name })));
  
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewing: applications.filter(app => app.status === 'reviewing').length,
    interviewed: applications.filter(app => app.status === 'interviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };
  
  console.log('📊 Estadísticas calculadas:', stats);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f7fafd',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f7fafd',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadApplications} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f7fafd', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Revisión de Postulaciones
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Gestiona y revisa todas las solicitudes de estudiantes para tus proyectos
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>



      {/* Estadísticas mejoradas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          bgcolor: '#1976d2', 
          color: 'white',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(25, 118, 210, 0.4)' : 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="body1" fontWeight={600}>Total Postulaciones</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          bgcolor: '#fb8c00', 
          color: 'white',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(251, 140, 0, 0.4)' : 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{stats.pending}</Typography>
                <Typography variant="body1" fontWeight={600}>Pendientes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          bgcolor: '#388e3c', 
          color: 'white',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(56, 142, 60, 0.4)' : 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{stats.accepted}</Typography>
                <Typography variant="body1" fontWeight={600}>Aceptadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          bgcolor: '#f44336', 
          color: 'white',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(244, 67, 54, 0.4)' : 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CancelIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{stats.rejected}</Typography>
                <Typography variant="body1" fontWeight={600}>Rechazadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs mejorados con control de cantidad integrado */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56,
                color: themeMode === 'dark' ? '#cbd5e1' : 'inherit'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
              }
            }}
          >
            <Tab label={`Todas (${stats.total})`} />
            <Tab label={`Pendientes (${stats.pending})`} />
            <Tab label={`En Revisión (${stats.reviewing})`} />
            <Tab label={`Aceptadas (${stats.accepted})`} />
            <Tab label={`Rechazadas (${stats.rejected})`} />
          </Tabs>
          
          {/* Control de cantidad integrado */}
          <FormControl size="small" sx={{ minWidth: 120, my: 1 }}>
            <InputLabel id="cantidad-label" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>Mostrar</InputLabel>
            <Select
              labelId="cantidad-label"
              value={cantidadActual}
              label="Mostrar"
              onChange={e => handleCantidadChange(selectedTab, e.target.value)}
              sx={{ 
                borderRadius: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                }
              }}
            >
              {cantidadOpciones.map(opt => (
                <MenuItem key={opt} value={opt}>{opt === 'todas' ? 'Todas' : opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Lista de Postulaciones mejorada */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
        gap: 3 
      }}>
        {aplicacionesMostradas.length === 0 ? (
          <Box sx={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            py: 6,
            bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 2,
            border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
          }}>
            <PersonIcon sx={{ fontSize: 80, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'text.secondary' }}>
              No hay postulaciones en esta categoría
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
              Las nuevas postulaciones aparecerán aquí cuando los estudiantes se postulen a tus proyectos.
            </Typography>
          </Box>
        ) : (
          aplicacionesMostradas.map((application) => {
            return (
              <Card key={application.id} sx={{ 
                borderRadius: 3,
                boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 3,
                bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : 6,
                  transform: 'translateY(-4px)',
                  borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      mr: 2, 
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56
                    }}>
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                        {application.student_name || application.student_data?.user_data?.full_name || 'Estudiante no encontrado'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                        Postuló a: {application.project_title || 'Proyecto no encontrado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                        {new Date(application.applied_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {/* Carta de Presentación */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }}>
                      Carta de Presentación:
                    </Typography>
                    <Box sx={{ 
                      p: 2,
                      bgcolor: themeMode === 'dark' ? '#334155' : '#fafafa',
                      borderRadius: 1,
                      border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {(() => {
                        const studentId = application.student;
                        const profile = studentProfiles[studentId];
                        
                        console.log(`🔍 [TARJETA] application.student:`, application.student);
                        console.log(`🔍 [TARJETA] studentId extraído:`, studentId);
                        console.log(`🔍 [TARJETA] studentProfiles completo:`, studentProfiles);
                        console.log(`🔍 [TARJETA] studentProfiles keys:`, Object.keys(studentProfiles));
                        console.log(`🔍 [TARJETA] Profile encontrado:`, profile);
                        console.log(`🔍 [TARJETA] Tipo de studentProfiles:`, typeof studentProfiles);
                        console.log(`🔍 [TARJETA] studentProfiles es array:`, Array.isArray(studentProfiles));
                        
                        // Mostrar loading si no hay perfil cargado, pero solo por un tiempo limitado
                        if (!profile) {
                          console.log(`🔍 [TARJETA] No se encontró perfil para ${studentId}`);
                          console.log(`🔍 [TARJETA] studentProfiles actual:`, studentProfiles);
                          console.log(`🔍 [TARJETA] studentProfiles[${studentId}]:`, studentProfiles[studentId]);
                          
                          // Fallback: usar datos de la aplicación si están disponibles
                          const fallbackBio = application.student_bio || application.student_data?.bio;
                          
                          if (fallbackBio) {
                            return (
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                  lineHeight: 1.6,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                                  width: '100%'
                                }}>
                                  {fallbackBio}
                                </Typography>
                                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                                  ⚠️ Carta de presentación desde datos de aplicación (perfil en carga...)
                                </Typography>
                              </Box>
                            );
                          }
                          
                          // Si no hay datos de fallback, mostrar loading con botón de reintentar
                          return (
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                                  Cargando carta de presentación... (ID: {studentId})
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                  // Reintentar cargar el perfil
                                  if (studentId) {
                                    loadStudentProfiles([application]);
                                  }
                                }}
                                sx={{ 
                                  fontSize: '0.75rem',
                                  textTransform: 'none',
                                  mt: 1
                                }}
                              >
                                Reintentar
                              </Button>
                            </Box>
                          );
                        }
                        
                        // Intentar obtener bio de múltiples fuentes para mayor compatibilidad
                        const bio = profile?.user_data?.bio || 
                                   profile?.bio || 
                                   profile?.student?.bio ||
                                   application.student_bio; // Fallback a datos de la aplicación
                        
                        console.log(`🔍 [TARJETA] ID estudiante: ${studentId}`);
                        console.log(`🔍 [TARJETA] Perfil completo:`, profile);
                        console.log(`🔍 [TARJETA] Bio encontrada:`, bio);
                        console.log(`🔍 [TARJETA] Fuentes de bio:`, {
                          'profile.user_data.bio': profile?.user_data?.bio,
                          'profile.bio': profile?.bio,
                          'profile.student.bio': profile?.student?.bio,
                          'application.student_bio': application.student_bio
                        });
                        
                        return (
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              lineHeight: 1.6,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                              width: '100%'
                            }}>
                              {bio || 'No se ha proporcionado carta de presentación'}
                            </Typography>
                            {bio && bio.length > 150 && (
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="text"
                                  color="primary"
                                  onClick={() => handleViewQuickProfile(application)}
                                  sx={{ 
                                    p: 0, 
                                    minWidth: 'auto',
                                    fontSize: '0.75rem',
                                    textTransform: 'none'
                                  }}
                                >
                                  Ver más...
                                </Button>
                              </Box>
                            )}
                          </Box>
                        );
                      })()}
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                    Postuló: {new Date(application.applied_at).toLocaleDateString()}
                  </Typography>
                  

                </CardContent>
                <CardActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewQuickProfile(application)}
                    startIcon={<PersonIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      fontWeight: 600,
                      color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                      '&:hover': {
                        borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                        backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                      }
                    }}
                  >
                    Ver Perfil
                  </Button>
                  


                  {/* Botones de Acción */}
                  {application.status === 'pending' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      onClick={() => handleStatusChangeWithConfirmation(application.id, 'reviewing')}
                      disabled={updatingStatus === application.id}
                      startIcon={<InfoIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        fontWeight: 600,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {updatingStatus === application.id ? <CircularProgress size={16} /> : 'En Revisión'}
                    </Button>
                  )}

                  {(application.status === 'pending' || application.status === 'reviewing') && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChangeWithConfirmation(application.id, 'accepted')}
                        disabled={updatingStatus === application.id}
                        startIcon={<CheckCircleIcon />}
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 600,
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {updatingStatus === application.id ? <CircularProgress size={16} /> : '✓ Aceptar'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleStatusChangeWithConfirmation(application.id, 'rejected')}
                        disabled={updatingStatus === application.id}
                        startIcon={<CancelIcon />}
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 600,
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {updatingStatus === application.id ? <CircularProgress size={16} /> : '✗ Rechazar'}
                      </Button>
                    </>
                  )}

                  {application.status === 'accepted' && (
                    <Chip
                      label="Postulación Aceptada"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}

                  {application.status === 'rejected' && (
                    <Chip
                      label="Postulación Rechazada"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </CardActions>
              </Card>
            );
          })
        )}
      </Box>

      {/* Dialog de Detalles mejorado */}
      <Dialog 
        open={showDetailDialog} 
        onClose={() => setShowDetailDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
            border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : 'primary.main', 
          color: 'white',
          fontWeight: 600,
          borderBottom: themeMode === 'dark' ? '1px solid #475569' : 'none'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 28 }} />
            Perfil Completo del Estudiante
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 0, 
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: themeMode === 'dark' ? '#334155' : '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: themeMode === 'dark' ? '#475569' : '#cbd5e1',
            borderRadius: '4px',
          },
        }}>
          {selectedApplication && (
            <>
              {/* Indicador de carga del perfil */}
              {profileLoading && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  p: 4,
                  bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' 
                    }}>
                      Cargando perfil del estudiante...
                    </Typography>
              </Box>
                </Box>
              )}

              {/* Error al cargar el perfil */}
              {profileError && !profileLoading && (
                <Box sx={{ 
                  p: 3, 
                  bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' 
                }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Error al cargar el perfil
                    </Typography>
                    <Typography variant="body2">
                      {profileError}
                    </Typography>
                  </Alert>
                  <Button 
                    variant="outlined" 
                    onClick={() => setSelectedStudentId(selectedApplication.student || selectedApplication.student_data?.id || '')}
                    sx={{ mr: 1 }}
                  >
                    Reintentar
                  </Button>
                  <Button 
                    variant="text" 
                    onClick={() => setShowDetailDialog(false)}
                  >
                    Cerrar
                  </Button>
                </Box>
              )}

              {/* Contenido del perfil cuando está cargado */}
              {!profileLoading && !profileError && (
                <Box sx={{ p: 3 }}>
                  {/* Debug: Mostrar datos del perfil */}
              {(() => {
                console.log('🔍 [DEBUG] studentProfile completo:', studentProfile);
                console.log('🔍 [DEBUG] studentProfile.student:', studentProfile?.student);
                console.log('🔍 [DEBUG] studentProfile.user_data:', studentProfile?.user_data);
                console.log('🔍 [DEBUG] studentProfile.perfil_detallado:', studentProfile?.perfil_detallado);
                return null;
              })()}

                  {/* Header con información principal */}
             <Paper sx={{ 
               p: 3, 
               mb: 3, 
               borderRadius: 3, 
               bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
               border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
             }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
               <Avatar sx={{ 
                 width: 80, 
                 height: 80, 
                 mr: 3, 
                 bgcolor: 'primary.main', 
                 boxShadow: 3,
                 border: themeMode === 'dark' ? '3px solid #60a5fa' : '3px solid #1976d2'
               }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
               <Box sx={{ flex: 1 }}>
                                      <Typography variant="h4" fontWeight={700} sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    mb: 1
                  }}>
                    {studentProfile?.user_data?.full_name || selectedApplication.student_name || 'Estudiante'}
                </Typography>
                  <Typography variant="h6" sx={{ 
                    color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                    mb: 1,
                    fontWeight: 600
                  }}>
                    {studentProfile?.user_data?.email || selectedApplication.student_email || 'Email no disponible'}
                </Typography>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    mb: 1
                  }}>
                    {studentProfile?.user_data?.phone || studentProfile?.perfil_detallado?.telefono_emergencia || 'Teléfono no disponible'}
                </Typography>
                 <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                   <Chip 
                     label={`Proyecto: ${selectedApplication.project_title || 'No disponible'}`}
                     color="primary"
                     variant="outlined"
                     sx={{ 
                       borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                       color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                     }}
                   />
                   <Chip 
                     label={`Estado: ${getStatusLabel(selectedApplication.status)}`}
                     color={getStatusColor(selectedApplication.status) as any}
                     sx={{ fontWeight: 600 }}
                   />
              </Box>
            </Box>
             </Box>
           </Paper>

           {/* Información personal */}
           <Paper sx={{ 
             p: 3, 
             mb: 3, 
             borderRadius: 3, 
             bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
             border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
           }}>
             <Typography variant="h6" fontWeight={600} sx={{ 
               color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
               mb: 2,
               display: 'flex',
               alignItems: 'center',
               gap: 1
             }}>
               <PersonIcon sx={{ fontSize: 20 }} />
               Información Personal
             </Typography>
             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
               <Box>
                 <Typography variant="body2" sx={{ 
                   color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                   mb: 1,
                   fontWeight: 500
                 }}>
                   Fecha de Nacimiento:
                 </Typography>
                                      <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 600
                  }}>
                    {studentProfile?.perfil_detallado?.fecha_nacimiento || 'No disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Género:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 600
                  }}>
                    {studentProfile?.perfil_detallado?.genero || 'No disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Carrera:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 600
                  }}>
                    {studentProfile?.student?.career || 'No disponible'}
                  </Typography>
              </Box>

                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Universidad:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 600
                  }}>
                    {studentProfile?.student?.university || studentProfile?.perfil_detallado?.universidad || 'No disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Nivel Educativo:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    fontWeight: 600
                  }}>
                    {studentProfile?.student?.education_level || 'No disponible'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

                            {/* Habilidades básicas */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon sx={{ fontSize: 20 }} />
                Habilidades Básicas
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Habilidades:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {studentProfile?.student?.skills && Array.isArray(studentProfile.student.skills) && studentProfile.student.skills.length > 0 ? (
                      studentProfile.student.skills.map((skill: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                            color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                            fontWeight: 600
                          }}
                        />
                ))
              ) : (
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                  No hay habilidades registradas
                </Typography>
              )}
                  </Box>
            </Box>

                <Box>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    mb: 1,
                    fontWeight: 500
                  }}>
                    Idiomas:
               </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {studentProfile?.student?.languages && Array.isArray(studentProfile.student.languages) && studentProfile.student.languages.length > 0 ? (
                      studentProfile.student.languages.map((language: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={language} 
                          color="secondary" 
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderColor: themeMode === 'dark' ? '#a78bfa' : 'secondary.main',
                            color: themeMode === 'dark' ? '#a78bfa' : 'secondary.main',
                            fontWeight: 600
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                        No hay idiomas registrados
               </Typography>
             )}
                  </Box>
             </Box>

               </Box>
                
                <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                      mb: 1,
                      fontWeight: 500
                    }}>
                      Área de Interés:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      fontWeight: 600
                    }}>
                      {studentProfile?.student?.area || 'No especificado'}
                    </Typography>
               </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                      mb: 1,
                      fontWeight: 500
                    }}>
                      Modalidad:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      fontWeight: 600
                    }}>
                      {studentProfile?.student?.availability || selectedApplication?.student_data?.availability || 'No especificado'}
                    </Typography>
             </Box>
                </Box>
                </Paper>

                            {/* Información académica básica */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                    Información Académica
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Semestre:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile?.student?.semester || 'No especificado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Estado:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile?.student?.status || 'No especificado'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

               {/* Documentos */}
               <Paper sx={{ 
                 p: 3, 
                 mb: 3, 
                 borderRadius: 3, 
                 bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                 border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
               }}>
                 <Typography variant="h6" fontWeight={600} sx={{ 
                   color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                   mb: 2,
                   display: 'flex',
                   alignItems: 'center',
                   gap: 1
                 }}>
                   <AssignmentIcon sx={{ fontSize: 20 }} />
                   Documentos y Enlaces
                   </Typography>
                 <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                                     {studentProfile?.student?.cv_link && (
                     <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', borderRadius: 2 }}>
                       <Typography variant="subtitle2" fontWeight={600} sx={{ 
                         color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                         mb: 1
                       }}>
                         CV:
                       </Typography>
                       <Button
                         href={studentProfile.student.cv_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#93c5fd' : 'primary.dark',
                            bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        Ver CV
                      </Button>
                    </Box>
                  )}
                                     {studentProfile?.student?.certificado_link && (
                     <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', borderRadius: 2 }}>
                       <Typography variant="body2" fontWeight={600} sx={{ 
                         color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                         mb: 1
                       }}>
                         Certificado:
                  </Typography>
                       <Button
                         href={studentProfile.student.certificado_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#93c5fd' : 'primary.dark',
                            bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        Ver Certificado
                      </Button>
                    </Box>
                  )}
                                     {(!studentProfile?.student?.cv_link && !studentProfile?.student?.certificado_link) && (
                    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', p: 3 }}>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                        No hay documentos disponibles
                  </Typography>
                    </Box>
                )}
              </Box>
              </Paper>

              {/* Enlaces profesionales */}
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <LanguageIcon sx={{ fontSize: 20 }} />
                  Enlaces Profesionales
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                                     {studentProfile?.student?.linkedin_url && (
                     <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', borderRadius: 2 }}>
                       <Typography variant="subtitle2" fontWeight={600} sx={{ 
                         color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                         mb: 1
                       }}>
                         LinkedIn:
                       </Typography>
                       <Button
                         href={studentProfile.student.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<LinkedInIcon />}
                        sx={{ 
                          borderColor: '#0077b5',
                          color: '#0077b5',
                          '&:hover': {
                            borderColor: '#005885',
                            bgcolor: 'rgba(0, 119, 181, 0.1)'
                          }
                        }}
                      >
                        Ver Perfil
                      </Button>
                    </Box>
                  )}
                                     {studentProfile?.student?.github_url && (
                     <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', borderRadius: 2 }}>
                       <Typography variant="body2" fontWeight={600} sx={{ 
                         color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                         mb: 1
                       }}>
                         GitHub:
                       </Typography>
                       <Button
                         href={studentProfile.student.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<GitHubIcon />}
                        sx={{ 
                          borderColor: '#333',
                          color: '#333',
                          '&:hover': {
                            borderColor: '#000',
                            bgcolor: 'rgba(51, 51, 51, 0.1)'
                          }
                        }}
                      >
                        Ver Repositorio
                      </Button>
                    </Box>
                  )}
                                     {studentProfile?.student?.portfolio_url && (
                     <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', borderRadius: 2 }}>
                       <Typography variant="body2" fontWeight={600} sx={{ 
                         color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                         mb: 1
                       }}>
                         Portafolio:
                       </Typography>
                       <Button
                         href={studentProfile.student.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#93c5fd' : 'primary.dark',
                            bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        Ver Portafolio
                      </Button>
                    </Box>
                  )}
                                     {(!studentProfile?.student?.linkedin_url && !studentProfile?.student?.github_url && !studentProfile?.student?.portfolio_url) && (
                    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', p: 3 }}>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                        No hay enlaces profesionales disponibles
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Carta de Presentación */}
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AssignmentIcon sx={{ fontSize: 20 }} />
                  Carta de Presentación
                </Typography>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', 
                  borderRadius: 2,
                  border: themeMode === 'dark' ? '1px solid #64748b' : '1px solid #cbd5e1'
                }}>
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    lineHeight: 1.6,
                    fontStyle: studentProfile?.user_data?.bio ? 'normal' : 'italic'
                  }}>
                    {studentProfile?.user_data?.bio || 'No se ha proporcionado carta de presentación'}
                  </Typography>
                </Box>
              </Paper>
            </Box>
               )}
             </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', 
          gap: 2,
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
        }}>
          {/* Botones de Acción */}
          {selectedApplication && selectedApplication.status === 'pending' && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleStatusChangeWithConfirmation(selectedApplication.id, 'reviewing');
                setShowDetailDialog(false);
              }}
              disabled={updatingStatus === selectedApplication.id}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600,
                boxShadow: 2
              }}
            >
              {updatingStatus === selectedApplication.id ? <CircularProgress size={16} /> : 'Marcar en Revisión'}
            </Button>
          )}

          {selectedApplication && (selectedApplication.status === 'pending' || selectedApplication.status === 'reviewing') && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleStatusChangeWithConfirmation(selectedApplication.id, 'accepted');
                  setShowDetailDialog(false);
                }}
                disabled={updatingStatus === selectedApplication.id}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                {updatingStatus === selectedApplication.id ? <CircularProgress size={16} /> : '✓ Aceptar Postulación'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleStatusChangeWithConfirmation(selectedApplication.id, 'rejected');
                  setShowDetailDialog(false);
                }}
                disabled={updatingStatus === selectedApplication.id}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                {updatingStatus === selectedApplication.id ? <CircularProgress size={16} /> : '✗ Rechazar Postulación'}
              </Button>
            </>
          )}

          <Button 
            onClick={() => setShowDetailDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              fontWeight: 600,
              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
              color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
              '&:hover': {
                borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

             {/* Dialog de Confirmación con Advertencias */}
       <Dialog
         open={showConfirmDialog}
         onClose={cancelStatusChange}
         aria-labelledby="confirm-dialog-title"
         aria-describedby="confirm-dialog-description"
         maxWidth="md"
         fullWidth
       >
         {confirmAction && (
           <>
             <DialogTitle 
               id="confirm-dialog-title" 
               sx={{ 
                 bgcolor: getWarningMessage(confirmAction.actionType).severity === 'error' ? 'error.main' : 
                         getWarningMessage(confirmAction.actionType).severity === 'success' ? 'success.main' : 'warning.main', 
                 color: 'white', 
                 fontWeight: 600,
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}
             >
               {getWarningMessage(confirmAction.actionType).severity === 'error' ? <WarningIcon /> : 
                getWarningMessage(confirmAction.actionType).severity === 'success' ? <CheckCircleIcon /> : <InfoIcon />}
               {getWarningMessage(confirmAction.actionType).title}
             </DialogTitle>
             
             <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
               <Alert 
                 severity={getWarningMessage(confirmAction.actionType).severity} 
                 sx={{ mb: 3 }}
                 icon={false}
               >
                 <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                   {getWarningMessage(confirmAction.actionType).message}
                 </Typography>
                 
                 <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                   Esta acción tendrá las siguientes consecuencias:
                 </Typography>
                 
                 <Box sx={{ pl: 2 }}>
                   {getWarningMessage(confirmAction.actionType).consequences.map((consequence, index) => (
                     <Typography 
                       key={index} 
                       variant="body2" 
                       sx={{ 
                         mb: 1,
                         color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                         display: 'flex',
                         alignItems: 'flex-start',
                         gap: 1
                       }}
                     >
                       <Box 
                         component="span" 
                         sx={{ 
                           color: getWarningMessage(confirmAction.actionType).severity === 'error' ? 'error.main' : 
                                   getWarningMessage(confirmAction.actionType).severity === 'success' ? 'success.main' : 'warning.main',
                           fontWeight: 'bold',
                           mt: 0.2
                         }}
                       >
                         •
                       </Box>
                       {consequence}
                     </Typography>
                   ))}
                 </Box>
                 
                 {confirmAction.actionType === 'accept' || confirmAction.actionType === 'reject' ? (
                   <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                     <Typography variant="body2" fontWeight={600}>
                       ⚠️ IMPORTANTE: Esta acción NO se puede deshacer fácilmente y tendrá consecuencias permanentes.
                     </Typography>
                   </Alert>
                 ) : (
                   <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 152, 0, 0.1)' }}>
                     <Typography variant="body2" fontWeight={600}>
                       ⚠️ ATENCIÓN: Este cambio activará notificaciones y procesos automáticos.
                     </Typography>
                   </Alert>
                 )}
               </Alert>
             </DialogContent>
             
             <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', gap: 2 }}>
               <Button
                 variant="contained"
                 color={getWarningMessage(confirmAction.actionType).severity}
                 onClick={executeStatusChange}
                 disabled={updatingStatus === confirmAction.applicationId}
                 sx={{ 
                   borderRadius: 2, 
                   px: 3,
                   fontWeight: 600,
                   minWidth: 120
                 }}
                 startIcon={getWarningMessage(confirmAction.actionType).severity === 'error' ? <CancelIcon /> : 
                           getWarningMessage(confirmAction.actionType).severity === 'success' ? <CheckCircleIcon /> : <ScheduleIcon />}
               >
                 {updatingStatus === confirmAction.applicationId ? (
                   <CircularProgress size={16} />
                 ) : (
                   confirmAction.actionType === 'review' ? 'Marcar en Revisión' :
                   confirmAction.actionType === 'accept' ? 'Sí, Aceptar' :
                   confirmAction.actionType === 'reject' ? 'Sí, Rechazar' : 'Confirmar'
                 )}
               </Button>
               
               <Button
                 variant="outlined"
                 onClick={cancelStatusChange}
                 sx={{ 
                   borderRadius: 2, 
                   px: 3,
                   fontWeight: 600,
                   minWidth: 120
                 }}
               >
                 Cancelar
               </Button>
             </DialogActions>
           </>
         )}
       </Dialog>

      {/* Modal de Perfil Rápido */}
      <Dialog
        open={showQuickProfileDialog}
        onClose={() => setShowQuickProfileDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
            border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : 'primary.main', 
          color: 'white',
          fontWeight: 600,
          borderBottom: themeMode === 'dark' ? '1px solid #475569' : 'none'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 28 }} />
            Perfil del Estudiante
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {quickProfileStudentId && (
            <QuickProfileContent 
              studentId={quickProfileStudentId}
              onClose={() => setShowQuickProfileDialog(false)}
              application={selectedApplication}
            />
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default CompanyApplications; 