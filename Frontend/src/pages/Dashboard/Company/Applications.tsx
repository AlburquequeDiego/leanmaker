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
  TextField,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
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
import { adaptApplicationList } from '../../../utils/adapters';
import type { Application } from '../../../types';

const cantidadOpciones = [5, 10, 20, 50, 'todas'];

export const CompanyApplications: React.FC = () => {
  const api = useApi();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({ date: '', notes: '' });
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5, 5]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/applications/received_applications/');
      const adaptedApplications = adaptApplicationList(response.data.results || response.data);
      setApplications(adaptedApplications);
      
    } catch (err: any) {
      console.error('Error cargando aplicaciones:', err);
      setError(err.response?.data?.error || 'Error al cargar aplicaciones');
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
      case 2: return 'interviewed';
      case 3: return 'accepted';
      case 4: return 'rejected';
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
      
      const response = await api.patch(`/api/applications/${applicationId}/`, {
        status: newStatus,
      });

      const updatedApplication = response.data;
      
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? {
            ...app,
            status: updatedApplication.status,
            company_notes: updatedApplication.company_notes,
          } : app
        )
      );
    } catch (error: any) {
      console.error('Error actualizando estado de aplicación:', error);
      setError(error.response?.data?.error || 'Error al actualizar estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailDialog(true);
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setShowInterviewDialog(true);
  };

  const handleSaveInterview = async () => {
    if (selectedApplication) {
      try {
        const response = await api.patch(`/api/applications/${selectedApplication.id}/`, {
          status: 'interviewed',
          company_notes: interviewData.notes,
        });

        const updatedApplication = response.data;
        
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication.id ? {
              ...app,
              status: updatedApplication.status,
              company_notes: updatedApplication.company_notes,
            } : app
          )
        );
        setShowInterviewDialog(false);
        setInterviewData({ date: '', notes: '' });
        setSelectedApplication(null);
      } catch (error: any) {
        console.error('Error guardando entrevista:', error);
        setError(error.response?.data?.error || 'Error al guardar entrevista');
      }
    }
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Revisión de Postulaciones
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.total}</Typography>
                <Typography variant="body2">Total Postulaciones</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.pending + stats.reviewing}</Typography>
                <Typography variant="body2">Pendientes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.interviewed}</Typography>
                <Typography variant="body2">Entrevistadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.accepted}</Typography>
                <Typography variant="body2">Aceptadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label={`Todas (${stats.total})`} />
          <Tab label={`Pendientes (${stats.pending + stats.reviewing})`} />
          <Tab label={`Entrevistadas (${stats.interviewed})`} />
          <Tab label={`Aceptadas (${stats.accepted})`} />
          <Tab label={`Rechazadas (${stats.rejected})`} />
        </Tabs>
      </Paper>

      {/* Filtro de cantidad por tab */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="cantidad-label">Mostrar</InputLabel>
          <Select
            labelId="cantidad-label"
            value={cantidadActual}
            label="Mostrar"
            onChange={e => handleCantidadChange(selectedTab, e.target.value)}
          >
            {cantidadOpciones.map(opt => (
              <MenuItem key={opt} value={opt}>{opt === 'todas' ? 'Todas' : opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista de Postulaciones */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {aplicacionesMostradas.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay postulaciones en esta categoría
            </Typography>
          </Box>
        ) : (
          aplicacionesMostradas.map((application) => (
            <Card key={application.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {application.student ? 'Estudiante' : 'Estudiante no encontrado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.project || 'Proyecto no encontrado'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(application.status)}
                    color={getStatusColor(application.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  {application.compatibility_score && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Compatibilidad:</strong> {application.compatibility_score}%
                    </Typography>
                  )}
                </Box>

                {application.cover_letter && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {application.cover_letter.substring(0, 100)}...
                    </Typography>
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary">
                  Postuló: {new Date(application.applied_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleViewDetails(application)}
                >
                  Ver Detalles
                </Button>
                {(application.status === 'pending' || application.status === 'reviewing') && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleScheduleInterview(application)}
                  >
                    Entrevistar
                  </Button>
                )}
                {(application.status === 'pending' || application.status === 'reviewing') && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleStatusChange(application.id, 'accepted')}
                      disabled={updatingStatus === application.id}
                    >
                      {updatingStatus === application.id ? <CircularProgress size={16} /> : 'Aceptar'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      disabled={updatingStatus === application.id}
                    >
                      {updatingStatus === application.id ? <CircularProgress size={16} /> : 'Rechazar'}
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      {/* Dialog de Detalles */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Postulación</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {selectedApplication.student ? 'Estudiante' : 'Estudiante no encontrado'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedApplication.project || 'Proyecto no encontrado'}
                  </Typography>
                  {selectedApplication.compatibility_score && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1">
                        Compatibilidad: {selectedApplication.compatibility_score}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {selectedApplication.portfolio_url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <a href={selectedApplication.portfolio_url} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </Typography>
                  </Box>
                )}
                {selectedApplication.github_url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <a href={selectedApplication.github_url} target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    </Typography>
                  </Box>
                )}
                {selectedApplication.linkedin_url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <a href={selectedApplication.linkedin_url} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedApplication.cover_letter && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Carta de Presentación:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplication.cover_letter}
                  </Typography>
                </Box>
              )}

              {selectedApplication.company_notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Notas de la Empresa:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplication.company_notes}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Estado:</strong> {getStatusLabel(selectedApplication.status)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha de postulación:</strong> {new Date(selectedApplication.applied_at).toLocaleString()}
                </Typography>
                {selectedApplication.reviewed_at && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Revisada:</strong> {new Date(selectedApplication.reviewed_at).toLocaleString()}
                  </Typography>
                )}
                {selectedApplication.responded_at && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Respondida:</strong> {new Date(selectedApplication.responded_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Entrevista */}
      <Dialog open={showInterviewDialog} onClose={() => setShowInterviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Programar Entrevista</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedApplication.student ? 'Estudiante' : 'Estudiante no encontrado'} - {selectedApplication.project || 'Proyecto no encontrado'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Fecha y Hora de la Entrevista"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notas de la Entrevista"
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Agrega notas sobre la entrevista..."
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInterviewDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveInterview}
            variant="contained"
            disabled={!interviewData.date}
          >
            Programar Entrevista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyApplications; 