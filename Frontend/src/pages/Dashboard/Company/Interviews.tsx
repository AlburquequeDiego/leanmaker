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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Rating,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptInterviewList } from '../../../utils/adapters';
import type { Interview, Application } from '../../../types';

const cantidadOpciones = [5, 10, 20, 50, 'todas'];

export const CompanyInterviews: React.FC = () => {
  const api = useApi();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: '',
  });

  // Filtros de cantidad por tab
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener entrevistas
      const interviewsResponse = await api.get('/api/interviews/');
      const adaptedInterviews = adaptInterviewList(interviewsResponse.data.results || interviewsResponse.data);
      setInterviews(adaptedInterviews);

      // Obtener aplicaciones para contexto
      const applicationsResponse = await api.get('/api/applications/');
      setApplications(applicationsResponse.data.results || applicationsResponse.data);

      // Obtener usuarios
      const usersResponse = await api.get('/api/users/');
      setUsers(usersResponse.data);
      
    } catch (err: any) {
      console.error('Error cargando entrevistas:', err);
      setError(err.response?.data?.error || 'Error al cargar entrevistas');
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (tabIdx: number, value: number | string) => {
    setCantidadPorTab(prev => prev.map((v, i) => (i === tabIdx ? value : v)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'no-show':
        return 'No se presentó';
      default:
        return status;
    }
  };

  const handleSaveFeedback = async () => {
    if (selectedInterview) {
      try {
        const updatedInterviewResponse = await api.patch(`/api/interviews/${selectedInterview.id}/`, {
          rating: feedbackData.rating,
          feedback: feedbackData.feedback,
          status: 'completed',
        });

        const updatedInterview = updatedInterviewResponse.data;

        setInterviews(prev =>
          prev.map(interview =>
            interview.id === selectedInterview.id ? {
              ...interview,
              rating: updatedInterview.rating,
              feedback: updatedInterview.feedback,
              status: updatedInterview.status,
            } : interview
          )
        );
        setShowFeedbackDialog(false);
        setSelectedInterview(null);
        setFeedbackData({ rating: 0, feedback: '' });
      } catch (error: any) {
        console.error('Error guardando feedback:', error);
        setError(error.response?.data?.error || 'Error al guardar feedback');
      }
    }
  };

  const handleCompleteInterview = async (interviewId: string) => {
    try {
      const response = await api.post(`/api/interviews/${interviewId}/complete/`);
      const updatedInterview = response.data;
      
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === interviewId ? {
            ...interview,
            status: updatedInterview.status,
          } : interview
        )
      );
      setShowDialog(false);
    } catch (error: any) {
      console.error('Error completando entrevista:', error);
      setError(error.response?.data?.error || 'Error al completar entrevista');
      }
  };

  const handleCancelInterview = async (interviewId: string) => {
    try {
      const response = await api.post(`/api/interviews/${interviewId}/cancel/`);
      const updatedInterview = response.data;
      
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === interviewId ? {
            ...interview,
            status: updatedInterview.status,
          } : interview
        )
      );
      setShowDialog(false);
    } catch (error: any) {
      console.error('Error cancelando entrevista:', error);
      setError(error.response?.data?.error || 'Error al cancelar entrevista');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    switch (selectedTab) {
      case 0: // Todas
        return true;
      case 1: // Programadas
        return interview.status === 'scheduled';
      case 2: // Completadas
        return interview.status === 'completed';
      case 3: // Canceladas
        return interview.status === 'cancelled' || interview.status === 'no-show';
      default:
        return true;
    }
  });

  const cantidadActual = cantidadPorTab[selectedTab];
  const entrevistasMostradas = cantidadActual === 'todas' ? filteredInterviews : filteredInterviews.slice(0, Number(cantidadActual));

  // Obtener información del estudiante y proyecto desde la aplicación
  const getInterviewInfo = (interview: Interview) => {
    const application = applications.find(app => app.id === interview.application);
    if (!application) return { student: null, project: null };
    
    const student = users.find(user => user.id === application.student);
    const project = application.project; // Asumiendo que el proyecto está en la aplicación
    
    return { student, project };
  };

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    cancelled: interviews.filter(i => i.status === 'cancelled' || i.status === 'no-show').length,
  };

  const resumen = [
    { label: 'Total', value: stats.total, icon: <ScheduleIcon />, color: '#42A5F5' },
    { label: 'Programadas', value: stats.scheduled, icon: <ScheduleIcon />, color: '#29B6F6' },
    { label: 'Completadas', value: stats.completed, icon: <CheckCircleIcon />, color: '#66BB6A' },
    { label: 'Canceladas', value: stats.cancelled, icon: <EventIcon />, color: '#EF5350' },
  ];

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
        <Button onClick={loadData} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Entrevistas
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {resumen.map((item, idx) => (
          <Box key={idx} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ bgcolor: item.color, color: '#fff', borderRadius: 3, boxShadow: 1, minHeight: 90 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{item.label}</Typography>
                <Box>{item.icon}</Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Todos" />
          <Tab label="Programados" />
          <Tab label="Completados" />
          <Tab label="Cancelados" />
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

      {/* Lista de Entrevistas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {entrevistasMostradas.map((interview) => {
          const { student, project } = getInterviewInfo(interview);
          const interviewer = users.find(user => user.id === interview.interviewer);
          
          return (
          <Box key={interview.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {student?.full_name || 'Estudiante no encontrado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {student?.email || 'Email no disponible'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(interview.status)}
                    color={getStatusColor(interview.status) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="body1" gutterBottom>
                    <strong>Proyecto:</strong> {project || 'Proyecto no encontrado'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                      label={`${interview.duration_minutes} min`}
                      color="secondary"
                      size="small"
                    />
                    {interview.rating && (
                      <Chip
                        label={`${interview.rating}/5`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                    )}
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                    {interview.notes || 'Sin notas'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    <strong>Fecha:</strong> {new Date(interview.interview_date).toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    <strong>Entrevistador:</strong> {interviewer?.full_name || 'No asignado'}
                </Typography>

                  {interview.feedback && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Feedback:</strong> {interview.feedback}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedInterview(interview);
                    setShowDialog(true);
                  }}
                >
                  Ver Detalles
                </Button>
                {interview.status === 'scheduled' && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedInterview(interview);
                        setShowFeedbackDialog(true);
                    }}
                  >
                    Completar
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
          );
        })}
      </Box>

      {/* Dialog para detalles de entrevista */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Entrevista</DialogTitle>
        <DialogContent>
          {selectedInterview && (() => {
            const { student, project } = getInterviewInfo(selectedInterview);
            const interviewer = users.find(user => user.id === selectedInterview.interviewer);
            
            return (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, width: 60, height: 60, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                      {student?.full_name || 'Estudiante no encontrado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                      {student?.email || 'Email no disponible'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={getStatusLabel(selectedInterview.status)}
                      color={getStatusColor(selectedInterview.status) as any}
                      size="small"
                    />
                      {selectedInterview.rating && (
                      <Chip
                          label={`${selectedInterview.rating}/5`}
                          color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                  Proyecto: {project || 'Proyecto no encontrado'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip label={`${selectedInterview.duration_minutes} minutos`} color="secondary" />
              </Box>

              <List dense>
                <ListItem>
                  <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Fecha y Hora"
                      secondary={new Date(selectedInterview.interview_date).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                      primary="Entrevistador"
                      secondary={interviewer?.full_name || 'No asignado'}
                  />
                </ListItem>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                      primary="Email del Estudiante"
                      secondary={student?.email || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                      primary="Teléfono del Estudiante"
                      secondary={student?.phone || 'No disponible'}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2" paragraph>
                  {selectedInterview.notes || 'Sin notas'}
              </Typography>

              {selectedInterview.feedback && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Feedback
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedInterview.feedback}
                  </Typography>
                </>
              )}

                {selectedInterview.rating && (
                <>
                  <Typography variant="h6" gutterBottom>
                      Calificación
                  </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={selectedInterview.rating} readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {selectedInterview.rating}/5
                  </Typography>
                    </Box>
                </>
              )}
            </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
          {selectedInterview?.status === 'scheduled' && (
            <>
              <Button
                onClick={() => handleCancelInterview(selectedInterview.id)}
                variant="outlined"
                color="error"
              >
                Cancelar
              </Button>
            <Button
              onClick={() => {
                setShowDialog(false);
                  setShowFeedbackDialog(true);
              }}
              variant="contained"
              color="success"
            >
                Completar Entrevista
            </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para feedback */}
      <Dialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Completar Entrevista</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography variant="body1" gutterBottom>
                Calificación:
              </Typography>
              <Rating
                value={feedbackData.rating}
                onChange={(_, value) => setFeedbackData(prev => ({ ...prev, rating: value || 0 }))}
                size="large"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback"
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveFeedback} variant="contained">
            Completar Entrevista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyInterviews;