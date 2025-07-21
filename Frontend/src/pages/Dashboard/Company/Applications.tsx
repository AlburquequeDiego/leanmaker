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

  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptApplication, adaptApplicationList } from '../../../utils/adapters';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { Application } from '../../../types';

const cantidadOpciones = [5, 10, 50, 100, 150, 200, 'todas'];

export const CompanyApplications: React.FC = () => {
  const api = useApi();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
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
      
      // Aplicar adaptador a cada aplicación individualmente para mejor manejo
      const adaptedApplications = Array.isArray(applicationsData) 
        ? applicationsData.map(app => adaptApplication(app))
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
      case 2: return 'accepted';
      case 3: return 'rejected';
      default: return undefined;
    }
  };

  const filteredApplications = applications.filter(app => {
    const status = getStatusFilter(selectedTab);
    return status ? app.status === status : true;
  });

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

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewing: applications.filter(app => app.status === 'reviewing').length,
    interviewed: applications.filter(app => app.status === 'interviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
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
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Revisión de Postulaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona y revisa todas las solicitudes de estudiantes para tus proyectos
        </Typography>
      </Box>

      {/* Estadísticas mejoradas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          bgcolor: '#1976d2', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
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
          boxShadow: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{stats.pending + stats.reviewing}</Typography>
                <Typography variant="body1" fontWeight={600}>Pendientes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          bgcolor: '#388e3c', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
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
      </Box>

      {/* Tabs mejorados con control de cantidad integrado */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56
              }
            }}
          >
            <Tab label={`Todas (${stats.total})`} />
            <Tab label={`Pendientes (${stats.pending + stats.reviewing})`} />
            <Tab label={`Aceptadas (${stats.accepted})`} />
            <Tab label={`Rechazadas (${stats.rejected})`} />
          </Tabs>
          
          {/* Control de cantidad integrado */}
          <FormControl size="small" sx={{ minWidth: 120, my: 1 }}>
            <InputLabel id="cantidad-label">Mostrar</InputLabel>
            <Select
              labelId="cantidad-label"
              value={cantidadActual}
              label="Mostrar"
              onChange={e => handleCantidadChange(selectedTab, e.target.value)}
              sx={{ borderRadius: 2 }}
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
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No hay postulaciones en esta categoría
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Las nuevas postulaciones aparecerán aquí cuando los estudiantes se postulen a tus proyectos.
            </Typography>
          </Box>
        ) : (
          aplicacionesMostradas.map((application) => (
            <Card key={application.id} sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                borderColor: 'primary.main'
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
                    <Typography variant="h6" fontWeight={700}>
                      {application.student_name || 'Estudiante no encontrado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Postuló a: {application.project_title || 'Proyecto no encontrado'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Carta de Presentación:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    p: 2,
                    bgcolor: '#fafafa',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    {application.cover_letter || application.student?.bio || application.student?.user_data?.bio || 'No se ha proporcionado carta de presentación'}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
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
                    onClick={() => handleStatusChange(application.id, 'reviewing')}
                    disabled={updatingStatus === application.id}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
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
                      onClick={() => handleStatusChange(application.id, 'accepted')}
                      disabled={updatingStatus === application.id}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      {updatingStatus === application.id ? <CircularProgress size={16} /> : '✓ Aceptar'}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      disabled={updatingStatus === application.id}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
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
        <DialogContent sx={{ p: 3 }}>
          {selectedApplication && (
            <Box>
              {/* Header con nombre y apellido */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', boxShadow: 3 }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {(selectedApplication.student?.user_data?.first_name || '') + ' ' + (selectedApplication.student?.user_data?.last_name || '') || selectedApplication.student?.name || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplication.student?.user_data?.email || selectedApplication.student?.email || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplication.student?.user_data?.phone || selectedApplication.student?.phone || '-'}
                  </Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary">Fecha de Nacimiento:</Typography>
                    <Typography variant="body1">{selectedApplication.student?.perfil_detallado?.fecha_nacimiento || '-'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary">Género:</Typography>
                    <Typography variant="body1">{selectedApplication.student?.perfil_detallado?.genero || '-'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary">Carrera:</Typography>
                    <Typography variant="body1">{selectedApplication.student?.career || '-'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary">Nivel Educativo:</Typography>
                    <Typography variant="body1">{selectedApplication.student?.api_level || '-'}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Habilidades */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Habilidades</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(selectedApplication.student?.skills || []).map((h: string) => (
                  <Chip key={h} label={h} color="primary" />
                ))}
                {(!selectedApplication.student?.skills || selectedApplication.student.skills.length === 0) && <Typography variant="body2" color="text.secondary">-</Typography>}
              </Box>

              {/* Documentos */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Documentos</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedApplication.student?.cv_link && (
                  <Typography variant="body2">
                    <strong>CV:</strong> <a href={selectedApplication.student.cv_link} target="_blank" rel="noopener noreferrer">{selectedApplication.student.cv_link}</a>
                  </Typography>
                )}
                {selectedApplication.student?.certificado_link && (
                  <Typography variant="body2">
                    <strong>Certificado:</strong> <a href={selectedApplication.student.certificado_link} target="_blank" rel="noopener noreferrer">{selectedApplication.student.certificado_link}</a>
                  </Typography>
                )}
                {(!selectedApplication.student?.cv_link && !selectedApplication.student?.certificado_link) && <Typography variant="body2" color="text.secondary">No hay documentos</Typography>}
              </Box>

              {/* Área de interés y modalidades */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Área y Modalidad</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary">Área de interés:</Typography>
                  <Typography variant="body1">{selectedApplication.student?.area || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary">Modalidad:</Typography>
                  <Typography variant="body1">{selectedApplication.student?.availability || '-'}</Typography>
                </Box>
              </Box>

              {/* Experiencia previa */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Experiencia Previa</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedApplication.student?.experience_years ? `${selectedApplication.student.experience_years} años` : '-'}</Typography>

              {/* Enlaces */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Enlaces</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedApplication.student?.linkedin_url && (
                  <Typography variant="body2">
                    <strong>LinkedIn:</strong> <a href={selectedApplication.student.linkedin_url} target="_blank" rel="noopener noreferrer">{selectedApplication.student.linkedin_url}</a>
                  </Typography>
                )}
                {selectedApplication.student?.github_url && (
                  <Typography variant="body2">
                    <strong>GitHub:</strong> <a href={selectedApplication.student.github_url} target="_blank" rel="noopener noreferrer">{selectedApplication.student.github_url}</a>
                  </Typography>
                )}
                {selectedApplication.student?.portfolio_url && (
                  <Typography variant="body2">
                    <strong>Portafolio:</strong> <a href={selectedApplication.student.portfolio_url} target="_blank" rel="noopener noreferrer">{selectedApplication.student.portfolio_url}</a>
                  </Typography>
                )}
                {(!selectedApplication.student?.linkedin_url && !selectedApplication.student?.github_url && !selectedApplication.student?.portfolio_url) && <Typography variant="body2" color="text.secondary">No hay enlaces</Typography>}
              </Box>

              {/* Carta de Presentación */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600}>Carta de Presentación</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedApplication.cover_letter || selectedApplication.student?.bio || selectedApplication.student?.user_data?.bio || '-'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
          {/* Botones de Acción */}
          {selectedApplication && selectedApplication.status === 'pending' && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleStatusChange(selectedApplication.id, 'reviewing');
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
                  handleStatusChange(selectedApplication.id, 'accepted');
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
                  handleStatusChange(selectedApplication.id, 'rejected');
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


    </Box>
  );
};

export default CompanyApplications; 