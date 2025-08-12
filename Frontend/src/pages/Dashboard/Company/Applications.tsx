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

const cantidadOpciones = [5, 10, 50, 100, 150, 200, 'todas'];

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

  // Estados para diálogos de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    applicationId: string;
    newStatus: Application['status'];
    actionType: 'review' | 'accept' | 'reject';
  } | null>(null);

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
      const applicationsData = response.results || response.data?.results || response.data || [];
      console.log('📊 Datos de aplicaciones sin adaptar:', applicationsData);
      
      // Debug: Ver la primera aplicación sin adaptar
      if (applicationsData.length > 0) {
        console.log('🔍 Primera aplicación sin adaptar:', applicationsData[0]);
        console.log('🔍 Estructura del estudiante en la primera aplicación:', applicationsData[0].student);
        console.log('🔍 Tipo del campo student:', typeof applicationsData[0].student);
        if (applicationsData[0].student && typeof applicationsData[0].student === 'object') {
          console.log('🔍 Propiedades del objeto student:', Object.keys(applicationsData[0].student));
        }
      }
      
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
    setSelectedApplication(application);
    setShowDetailDialog(true);
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
          aplicacionesMostradas.map((application) => (
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
                      {application.student_name || 'Estudiante no encontrado'}
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
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    p: 2,
                    bgcolor: themeMode === 'dark' ? '#334155' : '#fafafa',
                    borderRadius: 1,
                    border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0',
                    color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                  }}>
                    {application.cover_letter || application.student?.bio || application.student?.user_data?.bio || 'No se ha proporcionado carta de presentación'}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                  Postuló: {new Date(application.applied_at).toLocaleDateString()}
                </Typography>
                

              </CardContent>
              <CardActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleViewDetails(application)}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Ver Perfil Completo
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
          ))
        )}
      </Box>

      {/* Dialog de Detalles mejorado */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Perfil Completo del Estudiante
        </DialogTitle>
                 <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#ffffff' : '#1e293b' }}>
           {selectedApplication && (
             <Box>
               {/* Debug: Mostrar estructura de datos */}
               <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, fontSize: '12px' }}>
                 <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Debug - Estructura de datos:</Typography>
                 <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                   {JSON.stringify(selectedApplication, null, 2)}
                 </pre>
               </Box>
                             {/* Header con nombre y apellido */}
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                 <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', boxShadow: 3 }}>
                   <PersonIcon sx={{ fontSize: 40 }} />
                 </Avatar>
                 <Box>
                   <Typography variant="h5" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                     {selectedApplication.student_data?.user_data?.full_name || 
                      (selectedApplication.student_data?.user_data ? 
                        `${selectedApplication.student_data.user_data.first_name || ''} ${selectedApplication.student_data.user_data.last_name || ''}`.trim() : '') ||
                      selectedApplication.student_name || 'Estudiante'}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                     {selectedApplication.student_data?.user_data?.email || selectedApplication.student_email || 'Email no disponible'}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                     {selectedApplication.student_data?.user_data?.phone || 'Teléfono no disponible'}
                   </Typography>
                 </Box>
               </Box>

                             <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa' }}>
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                   <Box sx={{ flex: 1, minWidth: 220 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Fecha de Nacimiento:</Typography>
                     <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                       {selectedApplication.student_data?.perfil_detallado?.fecha_nacimiento || 'No disponible'}
                     </Typography>
                   </Box>
                   <Box sx={{ flex: 1, minWidth: 220 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Género:</Typography>
                     <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                       {selectedApplication.student_data?.perfil_detallado?.genero || 'No disponible'}
                     </Typography>
                   </Box>
                 </Box>
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                   <Box sx={{ flex: 1, minWidth: 220 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Carrera:</Typography>
                     <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                       {selectedApplication.student_data?.career || 'No disponible'}
                     </Typography>
                   </Box>
                   <Box sx={{ flex: 1, minWidth: 220 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Nivel Educativo:</Typography>
                     <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                       {selectedApplication.student_data?.api_level || 'No disponible'}
                     </Typography>
                   </Box>
                 </Box>
               </Paper>

                             {/* Habilidades */}
               <Divider sx={{ my: 2 }} />
               <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Habilidades</Typography>
               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                 {selectedApplication.student_data?.skills && Array.isArray(selectedApplication.student_data.skills) && selectedApplication.student_data.skills.length > 0 ? (
                   selectedApplication.student_data.skills.map((h: string, index: number) => (
                     <Chip key={index} label={h} color="primary" />
                   ))
                 ) : (
                   <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                     No hay habilidades registradas
                   </Typography>
                 )}
               </Box>

              {/* Documentos */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Documentos</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedApplication.student_data?.cv_link && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>CV:</strong> <a href={selectedApplication.student_data.cv_link} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedApplication.student_data.cv_link}</a>
                  </Typography>
                )}
                {selectedApplication.student_data?.certificado_link && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>Certificado:</strong> <a href={selectedApplication.student_data.certificado_link} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedApplication.student_data.certificado_link}</a>
                  </Typography>
                )}
                {(!selectedApplication.student_data?.cv_link && !selectedApplication.student_data?.certificado_link) && <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>No hay documentos</Typography>}
              </Box>

              {/* Área de interés y modalidades */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Área y Modalidad</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Área de interés:</Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedApplication.student_data?.area || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Modalidad:</Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedApplication.student_data?.availability || '-'}</Typography>
                </Box>
              </Box>

              {/* Experiencia previa */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Experiencia Previa</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>{selectedApplication.student_data?.experience_years ? `${selectedApplication.student_data.experience_years} años` : '-'}</Typography>

              {/* Enlaces */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Enlaces</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedApplication.student_data?.linkedin_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>LinkedIn:</strong> <a href={selectedApplication.student_data.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedApplication.student_data.linkedin_url}</a>
                  </Typography>
                )}
                {selectedApplication.student_data?.github_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}> 
                    <strong>GitHub:</strong> <a href={selectedApplication.student_data.github_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedApplication.student_data.github_url}</a>
                  </Typography>
                )}
                {selectedApplication.student_data?.portfolio_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>Portafolio:</strong> <a href={selectedApplication.student_data.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedApplication.student_data.portfolio_url}</a>
                  </Typography>
                )}
                {(!selectedApplication.student_data?.linkedin_url && !selectedApplication.student_data?.github_url && !selectedApplication.student_data?.portfolio_url) && <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>No hay enlaces</Typography>}
              </Box>

              {/* Carta de Presentación */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Carta de Presentación</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                {selectedApplication.cover_letter || selectedApplication.student_data?.user_data?.bio || '-'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', gap: 2 }}>
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
              sx={{ borderRadius: 2, px: 3 }}
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
                sx={{ borderRadius: 2, px: 3 }}
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
                sx={{ borderRadius: 2, px: 3 }}
              >
                {updatingStatus === selectedApplication.id ? <CircularProgress size={16} /> : '✗ Rechazar Postulación'}
              </Button>
            </>
          )}

          <Button 
            onClick={() => setShowDetailDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
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


    </Box>
  );
};

export default CompanyApplications; 