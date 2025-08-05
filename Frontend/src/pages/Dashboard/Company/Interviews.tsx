import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Divider,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Work as WorkIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  MailOutline as MailOutlineIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptCalendarEvent } from '../../../utils/adapters';

export const CompanyInterviews: React.FC = () => {
  const api = useApi();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const now = new Date();
  
  // Filtros y datos procesados
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.attendees?.some((attendee: string) => 
          attendee.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        event.project_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    return filtered;
  }, [events, searchTerm, statusFilter]);

  const pendingInterviews = filteredEvents.filter(ev =>
    ev.status === 'scheduled' && new Date(ev.start_date) > now
  );
  
  const completedInterviews = filteredEvents.filter(ev =>
    ev.status === 'completed' || (ev.status === 'scheduled' && new Date(ev.start_date) <= now)
  );

  // Estadísticas
  const stats = useMemo(() => {
    const total = events.length;
    const pending = pendingInterviews.length;
    const completed = completedInterviews.length;
    const thisWeek = pendingInterviews.filter(ev => {
      const eventDate = new Date(ev.start_date);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate <= weekFromNow;
    }).length;
    
    return { total, pending, completed, thisWeek };
  }, [events, pendingInterviews, completedInterviews]);

  useEffect(() => {
    loadInterviewEvents();
  }, []);

  const loadInterviewEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Entrevistas] Iniciando carga de entrevistas...');
      const response = await api.get('/api/calendar/events/company_events/?event_type=interview');
      console.log('[Entrevistas] Respuesta recibida:', response);
      const data = response.results && Array.isArray(response.results)
        ? response.results
        : [];
      const adaptedEvents = data.map(adaptCalendarEvent);
      setEvents(adaptedEvents);
    } catch (err: any) {
      console.error('[Entrevistas] Error al cargar entrevistas:', err);
      setError(err.response?.data?.error || 'Error al cargar entrevistas');
      setEvents([]);
    } finally {
      setLoading(false);
      console.log('[Entrevistas] Fin de carga.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#1976d2';
      case 'completed': return '#388e3c';
      case 'cancelled': return '#d32f2f';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const diff = eventDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Menos de 1 hora';
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Cargando entrevistas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
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
                  Gestión de Entrevistas
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Administra y supervisa todas las entrevistas con estudiantes
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={loadInterviewEvents} 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={
            <Button color="inherit" size="small" onClick={loadInterviewEvents}>
              Reintentar
            </Button>
          }>
            {error}
          </Alert>
        )}

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <GroupIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Total Entrevistas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ScheduleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {stats.pending}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {stats.completed}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#2c3e50',
            boxShadow: '0 8px 25px rgba(168, 237, 234, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(44, 62, 80, 0.2)', width: 56, height: 56 }}>
                  <AccessTimeIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {stats.thisWeek}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Esta Semana
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de navegación */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 48,
              px: 3,
              py: 1.5,
              '&.Mui-selected': {
                color: '#1976d2',
                '& .MuiSvgIcon-root': {
                  color: '#1976d2'
                }
              },
              '&:not(.Mui-selected)': {
                color: '#666',
                '& .MuiSvgIcon-root': {
                  color: '#666'
                }
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <ScheduleIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Próximas Entrevistas
                </Typography>
                <Badge 
                  badgeContent={pendingInterviews.length} 
                  color="error" 
                  sx={{ 
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                      borderRadius: 10
                    }
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <CheckCircleIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Completadas
                </Typography>
                <Badge 
                  badgeContent={completedInterviews.length} 
                  color="success" 
                  sx={{ 
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                      borderRadius: 10
                    }
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <AssessmentIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Historial Completo
                </Typography>
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Contenido de las tabs */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1976d2' }}>
              Próximas Entrevistas
          </Typography>
            
            {pendingInterviews.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <ScheduleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay entrevistas pendientes
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  Todas las entrevistas han sido completadas o no hay nuevas programadas.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingInterviews.map((event) => {
                  const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                  const iniciales = nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
                  const timeUntil = getTimeUntil(event.start_date);
                  
                return (
                    <Grid item xs={12} md={6} lg={4} key={event.id}>
                      <Card sx={{ 
                        height: '100%',
                    borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                    '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                    },
                    position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)'
                        }} />
                        
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: '#ff6b6b',
                              width: 50,
                              height: 50,
                              fontSize: '1.2rem',
                              fontWeight: 700
                            }}>
                              {iniciales}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="#1976d2">
                          {nombre}
                        </Typography>
                              <Typography variant="body2" color="text.secondary">
                          {event.project_title || event.title}
                        </Typography>
                      </Box>
                            <Chip 
                              label="Pendiente" 
                              color="warning" 
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ space: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <CalendarIcon sx={{ mr: 1.5, color: '#ff6b6b', fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatDate(event.start_date)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  En {timeUntil}
                                </Typography>
                              </Box>
                            </Box>

                            {event.project_title && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ mr: 1.5, color: '#ff6b6b', fontSize: 20 }} />
                                <Typography variant="body2">
                                  <strong>Proyecto:</strong> {event.project_title}
                                </Typography>
                    </Box>
                            )}

                                                         {event.description && (
                               <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                 <InfoIcon sx={{ mr: 1.5, color: '#ff6b6b', fontSize: 20, mt: 0.2 }} />
                                 <Typography variant="body2">
                                   <strong>Motivo:</strong> {event.description}
                                 </Typography>
                    </Box>
                             )}

                             {event.location && (
                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                 <WorkIcon sx={{ mr: 1.5, color: '#ff6b6b', fontSize: 20 }} />
                                 <Typography variant="body2">
                                   <strong>Ubicación:</strong> {event.location}
                                 </Typography>
                    </Box>
                             )}
                    </Box>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewDetails(event)}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#388e3c' }}>
            Entrevistas Completadas
          </Typography>
            
            {completedInterviews.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay entrevistas completadas
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  Las entrevistas completadas aparecerán aquí.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {completedInterviews.map((event) => {
                  const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                  const iniciales = nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
                  
                return (
                    <Grid item xs={12} md={6} lg={4} key={event.id}>
                      <Card sx={{ 
                        height: '100%',
                    borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                    '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                    },
                    position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)'
                        }} />
                        
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: '#4ecdc4',
                              width: 50,
                              height: 50,
                              fontSize: '1.2rem',
                              fontWeight: 700
                            }}>
                              {iniciales}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="#388e3c">
                          {nombre}
                        </Typography>
                              <Typography variant="body2" color="text.secondary">
                          {event.project_title || event.title}
                        </Typography>
                      </Box>
                            <Chip 
                              label="Completada" 
                              color="success" 
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ space: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <CalendarIcon sx={{ mr: 1.5, color: '#4ecdc4', fontSize: 20 }} />
                              <Typography variant="body2" fontWeight={600}>
                                {formatDate(event.start_date)}
                              </Typography>
                            </Box>

                            {event.project_title && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ mr: 1.5, color: '#4ecdc4', fontSize: 20 }} />
                                <Typography variant="body2">
                                  <strong>Proyecto:</strong> {event.project_title}
                                </Typography>
                    </Box>
                            )}

                                                         {event.description && (
                               <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                 <InfoIcon sx={{ mr: 1.5, color: '#4ecdc4', fontSize: 20, mt: 0.2 }} />
                                 <Typography variant="body2">
                                   <strong>Motivo:</strong> {event.description}
                                 </Typography>
                    </Box>
                             )}

                             {event.location && (
                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                 <WorkIcon sx={{ mr: 1.5, color: '#4ecdc4', fontSize: 20 }} />
                                 <Typography variant="body2">
                                   <strong>Ubicación:</strong> {event.location}
                                 </Typography>
                    </Box>
                             )}
                    </Box>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewDetails(event)}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#2c3e50' }}>
              Historial Completo
            </Typography>
            
            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Estudiante</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Proyecto</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                      return (
                        <TableRow key={event.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: getStatusColor(event.status) }}>
                                {nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {nombre}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{event.project_title || '-'}</TableCell>
                          <TableCell>{formatDate(event.start_date)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(event.status)} 
                              color={event.status === 'completed' ? 'success' : event.status === 'scheduled' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary" onClick={() => handleViewDetails(event)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                                    {filteredEvents.map((event) => {
                      const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                  const iniciales = nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={event.id}>
                      <Card sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        }
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${getStatusColor(event.status)} 0%, ${getStatusColor(event.status)}80 100%)`
                        }} />
                        
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: getStatusColor(event.status),
                              width: 40,
                              height: 40,
                              fontSize: '1rem'
                            }}>
                              {iniciales}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.project_title || event.title}
                    </Typography>
                  </Box>
                            <Chip 
                              label={getStatusLabel(event.status)} 
                              color={event.status === 'completed' ? 'success' : event.status === 'scheduled' ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {formatDate(event.start_date)}
                          </Typography>

                                                     {event.project_title && (
                             <Typography variant="body2" sx={{ mb: 0.5 }}>
                               <strong>Proyecto:</strong> {event.project_title}
                             </Typography>
                           )}
                           
                           {event.location && (
                             <Typography variant="body2" sx={{ mb: 0.5 }}>
                               <strong>Ubicación:</strong> {event.location}
                             </Typography>
                           )}
                        </CardContent>
                        
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewDetails(event)}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
      </Box>

      {/* Modal de detalles de la entrevista */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 48, 
                  height: 48,
                  fontSize: '1.2rem',
                  fontWeight: 700
                }}>
                  {(selectedEvent.attendees?.[0]?.full_name || selectedEvent.attendees?.[0]?.email || 'NA').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedEvent.project_title || selectedEvent.title}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {selectedEvent.attendees?.[0]?.full_name || selectedEvent.attendees?.[0]?.email || 'Estudiante no asignado'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Información básica */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
                      Información General
                    </Typography>
                    
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Fecha y Hora
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedEvent.start_date)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Duración
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.duration || '1 hora'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={getStatusLabel(selectedEvent.status)} 
                          color={selectedEvent.status === 'completed' ? 'success' : selectedEvent.status === 'scheduled' ? 'warning' : 'error'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Detalles del proyecto */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
                      Detalles del Proyecto
                    </Typography>
                    
                    {selectedEvent.project_title ? (
                      <Box sx={{ space: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WorkIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Proyecto
                            </Typography>
                            <Typography variant="body1">
                              {selectedEvent.project_title}
                            </Typography>
                          </Box>
                        </Box>

                        {selectedEvent.description && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <InfoIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24, mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Motivo de la Entrevista
                              </Typography>
                              <Typography variant="body1">
                                {selectedEvent.description}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay información del proyecto disponible
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Información del Estudiante */}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && selectedEvent.attendees[0] && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
                        Información del Estudiante
                      </Typography>
                      
                      <Box sx={{ space: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PersonIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Nombre Completo
                            </Typography>
                            <Typography variant="body1">
                              {selectedEvent.attendees[0].full_name || 'No disponible'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <MailOutlineIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {selectedEvent.attendees[0].email || 'No disponible'}
                            </Typography>
                          </Box>
                        </Box>

                        {selectedEvent.attendees[0].phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Teléfono
                              </Typography>
                              <Typography variant="body1">
                                {selectedEvent.attendees[0].phone}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {selectedEvent.attendees[0].career && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <WorkIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Carrera
                              </Typography>
                              <Typography variant="body1">
                                {selectedEvent.attendees[0].career}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {selectedEvent.attendees[0].role && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ mr: 2, color: '#1976d2', fontSize: 24 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Rol
                              </Typography>
                              <Typography variant="body1">
                                {selectedEvent.attendees[0].role === 'student' ? 'Estudiante' : 
                                 selectedEvent.attendees[0].role === 'company' ? 'Empresa' : 
                                 selectedEvent.attendees[0].role === 'admin' ? 'Administrador' : 
                                 selectedEvent.attendees[0].role}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Información adicional */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
                      Información Adicional
                    </Typography>
                    
                    <Grid container spacing={2}>

                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight={600}>
                          Tipo de Evento:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Entrevista
                        </Typography>
                      </Grid>
                      
                                             {selectedEvent.location && (
                         <Grid item xs={12} sm={6}>
                           <Typography variant="body2" fontWeight={600}>
                             Ubicación:
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             {selectedEvent.location}
                           </Typography>
                         </Grid>
                       )}
                       
                       <Grid item xs={12} sm={6}>
                         <Typography variant="body2" fontWeight={600}>
                           Sala:
                         </Typography>
                                                  <Typography variant="body2" color="text.secondary">
                           {selectedEvent.room || 'No especificada'}
                </Typography>
                       </Grid>
                      
                      {selectedEvent.attendees && selectedEvent.attendees.length > 1 && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" fontWeight={600}>
                            Participantes:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                            {selectedEvent.attendees.map((att: any) => att.full_name || att.email || att.id).join(', ')}
                </Typography>
                        </Grid>
                      )}
                    </Grid>
              </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={handleCloseDetails}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CompanyInterviews;
