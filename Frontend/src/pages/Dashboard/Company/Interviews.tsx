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
import { useTheme } from '../../../contexts/ThemeContext';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import ProjectDetailsModal from '../../../components/common/ProjectDetailsModal';
import { apiService } from '../../../services/api.service';
import StudentProfileModal from '../../../components/common/StudentProfileModal';

export const CompanyInterviews: React.FC = () => {
  const api = useApi();
  const { themeMode } = useTheme();
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
  const [showPendingInterviews, setShowPendingInterviews] = useState(5);
  const [showCompletedInterviews, setShowCompletedInterviews] = useState(5);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);

  // Hook para obtener el perfil detallado del estudiante
  const { profile: studentProfile, loading: profileLoading, error: profileError } = useStudentProfile(selectedStudentId);
  
  // Debug: Log del estado del perfil
  console.log('🔍 [Interviews] Estado del perfil del estudiante:');
  console.log('🔍 [Interviews] - selectedStudentId:', selectedStudentId);
  console.log('🔍 [Interviews] - studentProfile:', studentProfile);
  console.log('🔍 [Interviews] - profileLoading:', profileLoading);
  console.log('🔍 [Interviews] - profileError:', profileError);
  
  // Debug adicional: Log cuando cambia el perfil
  useEffect(() => {
    console.log('🔄 [Interviews] useEffect - Cambio en el perfil del estudiante:');
    console.log('🔄 [Interviews] - selectedStudentId:', selectedStudentId);
    console.log('🔄 [Interviews] - studentProfile:', studentProfile);
    console.log('🔄 [Interviews] - profileLoading:', profileLoading);
    console.log('🔄 [Interviews] - profileError:', profileError);
  }, [selectedStudentId, studentProfile, profileLoading, profileError]);
  
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
    const today = events.filter(ev => {
      const eventDate = new Date(ev.start_date);
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      return eventDateOnly.getTime() === todayDate.getTime();
    }).length;
    
    return { total, pending, completed, today };
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
      
      console.log('[Entrevistas] Datos del backend antes de adaptar:', data);
      
      // Preservar los datos originales del backend para acceso posterior
      const adaptedEvents = data.map((backendEvent: any) => {
        const adaptedEvent = adaptCalendarEvent(backendEvent);
        // Agregar los datos originales del backend para poder acceder a la estructura original
        adaptedEvent._originalData = backendEvent;
        return adaptedEvent;
      });
      
      console.log('[Entrevistas] Eventos adaptados:', adaptedEvents);
      if (adaptedEvents.length > 0) {
        console.log('[Entrevistas] Primera entrevista adaptada:', adaptedEvents[0]);
        console.log('[Entrevistas] Attendees de la primera entrevista adaptada:', adaptedEvents[0].attendees);
      }
      
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

  const handleViewProfile = (event: any) => {
    console.log('🔍 [Interviews] handleViewProfile ejecutándose para evento:', event);
    console.log('🔍 [Interviews] Estructura completa del evento:', JSON.stringify(event, null, 2));
    console.log('🔍 [Interviews] Event ID:', event.id);
    console.log('🔍 [Interviews] Event title:', event.title);
    console.log('🔍 [Interviews] Event attendees:', event.attendees);
    console.log('🔍 [Interviews] Attendees[0]:', event.attendees?.[0]);
    console.log('🔍 [Interviews] _originalData:', event._originalData);
    console.log('🔍 [Interviews] _originalData.attendees:', event._originalData?.attendees);
    console.log('🔍 [Interviews] Event student field:', event.student);
    console.log('🔍 [Interviews] Event application field:', event.application);
    console.log('🔍 [Interviews] Event project field:', event.project);
    
    // Verificar si hay datos de aplicación
    if (event._originalData?.application) {
      console.log('🔍 [Interviews] Application data:', event._originalData.application);
      console.log('🔍 [Interviews] Application student:', event._originalData.application.student);
      console.log('🔍 [Interviews] Application student ID:', event._originalData.application.student?.id);
    }
    
    // Extraer el ID del estudiante del evento - usar el mismo patrón que en postulaciones
    let studentId = null;
    
    // Opción 1: Desde attendees[0].id (si es objeto)
    if (event.attendees?.[0]?.id) {
      studentId = event.attendees[0].id;
      console.log('✅ [Interviews] ID encontrado en attendees[0].id:', studentId);
    }
    // Opción 2: Desde attendees[0] si es un string (ID directo)
    else if (event.attendees?.[0] && typeof event.attendees[0] === 'string') {
      studentId = event.attendees[0];
      console.log('✅ [Interviews] ID encontrado en attendees[0] (string):', studentId);
    }
    // Opción 3: Buscar en el objeto original del backend si existe
    else if (event._originalData?.attendees?.[0]?.id) {
      studentId = event._originalData.attendees[0].id;
      console.log('✅ [Interviews] ID encontrado en _originalData.attendees[0].id:', studentId);
    }
    // Opción 4: Buscar en el objeto original del backend si attendees[0] es string
    else if (event._originalData?.attendees?.[0] && typeof event._originalData.attendees[0] === 'string') {
      studentId = event._originalData.attendees[0];
      console.log('✅ [Interviews] ID encontrado en _originalData.attendees[0] (string):', studentId);
    }
    // Opción 5: Buscar en el campo student si existe
    else if (event.student?.id) {
      studentId = event.student.id;
      console.log('✅ [Interviews] ID encontrado en event.student.id:', studentId);
    }
    // Opción 6: Buscar en el campo student si es string
    else if (event.student && typeof event.student === 'string') {
      studentId = event.student;
      console.log('✅ [Interviews] ID encontrado en event.student (string):', studentId);
    }
    // Opción 7: Buscar en la aplicación si existe
    else if (event._originalData?.application?.student?.id) {
      studentId = event._originalData.application.student.id;
      console.log('✅ [Interviews] ID encontrado en application.student.id:', studentId);
    }
    // Opción 8: Buscar en la aplicación si student es string
    else if (event._originalData?.application?.student && typeof event._originalData.application.student === 'string') {
      studentId = event._originalData.application.student;
      console.log('✅ [Interviews] ID encontrado en application.student (string):', studentId);
    }
    
    if (studentId) {
      console.log('✅ [Interviews] Estableciendo selectedStudentId:', studentId);
      console.log('✅ [Interviews] Tipo de studentId:', typeof studentId);
      console.log('✅ [Interviews] studentId como string:', String(studentId));
      
      // Asegurar que el ID sea un string válido
      const cleanStudentId = String(studentId).trim();
      if (cleanStudentId) {
        setSelectedStudentId(cleanStudentId);
        setSelectedEvent(event); // Guardar el evento para obtener información del proyecto
        setShowProfileDialog(true);
        console.log('✅ [Interviews] Modal abierto con studentId:', cleanStudentId);
      } else {
        console.error('❌ [Interviews] studentId está vacío después de limpiar');
        alert('ID del estudiante inválido');
      }
    } else {
      console.error('❌ [Interviews] No se pudo obtener el ID del estudiante');
      console.error('❌ [Interviews] Estructura del evento:', event);
      console.error('❌ [Interviews] Attendees:', event.attendees);
      console.error('❌ [Interviews] _originalData:', event._originalData);
      console.error('❌ [Interviews] Student field:', event.student);
      console.error('❌ [Interviews] Application data:', event._originalData?.application);
      
      // Mostrar alerta al usuario
      alert('No se pudo obtener la información del estudiante. Revisa la consola para más detalles.');
    }
  };

  const handleViewProjectDetails = async (event: any) => {
    console.log('🔍 Abriendo detalles del proyecto:', event);
    
    try {
      // Obtener el ID del proyecto del evento
      const projectId = event.project || event.project_id || event.id;
      
      if (!projectId) {
        console.error('❌ No se pudo obtener el ID del proyecto');
        return;
      }

      // Obtener los datos completos del proyecto desde la API usando apiService
      const response = await apiService.getProjectDetails(projectId);
      console.log('🔍 Datos completos del proyecto obtenidos:', response);
      
      // Usar los datos reales del proyecto
      setSelectedProjectForDetails(response);
      setProjectDetailsModalOpen(true);
      
    } catch (error) {
      console.error('❌ Error al obtener detalles del proyecto:', error);
      
      // Fallback: crear un objeto con la información disponible
      const projectData = {
        id: event.project || event.project_id || event.id,
        title: event.project_title || event.title,
        description: event.description || 'Descripción no disponible',
        company_name: event.company || 'Empresa no especificada',
        // Agregar otros campos que puedan estar disponibles
      };
      setSelectedProjectForDetails(projectData);
      setProjectDetailsModalOpen(true);
    }
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
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 4 }, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
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
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 25px rgba(30, 64, 175, 0.4)' 
              : '0 8px 25px rgba(102, 126, 234, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <GroupIcon sx={{ fontSize: 28, color: 'white' }} />
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
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
              : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 25px rgba(220, 38, 38, 0.4)' 
              : '0 8px 25px rgba(255, 107, 107, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ScheduleIcon sx={{ fontSize: 28, color: 'white' }} />
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
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
              : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 25px rgba(5, 150, 105, 0.4)' 
              : '0 8px 25px rgba(78, 205, 196, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />
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
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
              : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: themeMode === 'dark' ? 'white' : '#2c3e50',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 25px rgba(124, 58, 237, 0.4)' 
              : '0 8px 25px rgba(168, 237, 234, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(44, 62, 80, 0.2)', 
                  width: 56, 
                  height: 56 
                }}>
                  <AccessTimeIcon sx={{ fontSize: 28, color: themeMode === 'dark' ? 'white' : '#2c3e50' }} />
                </Avatar>
              </Box>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {stats.today}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de navegación */}
      <Paper sx={{ 
        p: 2, 
        mb: 4, 
        borderRadius: 3, 
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
        boxShadow: themeMode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
        border: themeMode === 'dark' ? '1px solid #334155' : 'none'
      }}>
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
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                '& .MuiSvgIcon-root': {
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2'
                }
              },
              '&:not(.Mui-selected)': {
                color: themeMode === 'dark' ? '#cbd5e1' : '#666',
                '& .MuiSvgIcon-root': {
                  color: themeMode === 'dark' ? '#cbd5e1' : '#666'
                }
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
              height: 3,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <ScheduleIcon sx={{ fontSize: 20, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mr: 1 }}>
                  Próximas Entrevistas
                </Typography>
                <Badge 
                  badgeContent={pendingInterviews.length} 
                  color="error" 
                  sx={{ 
                    ml: 0.5,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mr: 1 }}>
                  Completadas
                </Typography>
                <Badge 
                  badgeContent={completedInterviews.length} 
                  color="success" 
                  sx={{ 
                    ml: 0.5,
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
                <AssessmentIcon sx={{ fontSize: 20, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }} />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' 
              }}>
                Próximas Entrevistas
              </Typography>
              <TextField
                select
                size="small"
                value={showPendingInterviews}
                onChange={e => setShowPendingInterviews(Number(e.target.value))}
                sx={{ 
                  minWidth: 110,
                  '& .MuiOutlinedInput-root': {
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  },
                  '& .MuiSelect-icon': {
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  },
                }}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={50}>Últimos 50</MenuItem>
                <MenuItem value={100}>Últimos 100</MenuItem>
                <MenuItem value={pendingInterviews.length}>Todas</MenuItem>
              </TextField>
            </Box>
            
            {pendingInterviews.length === 0 ? (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3,
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                boxShadow: themeMode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.08)',
                border: themeMode === 'dark' ? '1px solid #334155' : 'none'
              }}>
                <ScheduleIcon sx={{ 
                  fontSize: 80, 
                  color: themeMode === 'dark' ? '#64748b' : 'text.secondary', 
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', 
                  mb: 2
                }}>
                  No hay entrevistas pendientes
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' 
                }}>
                  Todas las entrevistas han sido completadas o no hay nuevas programadas.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingInterviews.slice(0, showPendingInterviews).map((event) => {
                  const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                  const iniciales = nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
                  const timeUntil = getTimeUntil(event.start_date);
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={event.id}>
                      <Card sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        boxShadow: themeMode === 'dark' 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: themeMode === 'dark' 
                            ? '0 15px 35px rgba(0,0,0,0.5)' 
                            : '0 15px 35px rgba(0,0,0,0.15)',
                        },
                        position: 'relative',
                        overflow: 'hidden',
                        border: themeMode === 'dark' ? '1px solid #334155' : 'none'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: themeMode === 'dark' 
                            ? 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)' 
                            : 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)'
                        }} />
                        
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: themeMode === 'dark' ? '#dc2626' : '#ff6b6b',
                              color: 'white'
                            }}>
                              {iniciales}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" fontWeight={700} sx={{ 
                                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' 
                              }}>
                                {nombre}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                              }}>
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

                          <Divider sx={{ 
                            my: 2,
                            borderColor: themeMode === 'dark' ? '#334155' : '#e0e0e0'
                          }} />

                          <Box sx={{ space: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <CalendarIcon sx={{ 
                                mr: 1.5, 
                                color: themeMode === 'dark' ? '#dc2626' : '#ff6b6b', 
                                fontSize: 20 
                              }} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatDate(event.start_date)}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' 
                                }}>
                                  En {timeUntil}
                                </Typography>
                              </Box>
                            </Box>

                            {event.project_title && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#dc2626' : '#ff6b6b', 
                                  fontSize: 20 
                                }} />
                                <Typography variant="body2">
                                  <strong>Proyecto:</strong> {event.project_title}
                                </Typography>
                              </Box>
                            )}

                            {event.description && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                <InfoIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#dc2626' : '#ff6b6b', 
                                  fontSize: 20, 
                                  mt: 0.2 
                                }} />
                                <Typography variant="body2">
                                  <strong>Motivo:</strong> {event.description}
                                </Typography>
                              </Box>
                            )}

                            {event.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#dc2626' : '#ff6b6b', 
                                  fontSize: 20 
                                }} />
                                <Typography variant="body2">
                                  <strong>Ubicación:</strong> {event.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button 
                              size="small" 
                              startIcon={<PersonIcon />}
                              variant="outlined"
                              onClick={() => handleViewProfile(event)}
                              sx={{
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
                            {event.project_title && (
                              <Button 
                                size="small" 
                                startIcon={<WorkIcon />}
                                variant="outlined"
                                onClick={() => handleViewProjectDetails(event)}
                                sx={{
                                  color: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                  borderColor: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                  '&:hover': {
                                    borderColor: themeMode === 'dark' ? '#059669' : '#2e7d32',
                                    backgroundColor: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 142, 60, 0.1)'
                                  }
                                }}
                              >
                                Ver Proyecto
                              </Button>
                            )}
                            <Button 
                              size="small" 
                              startIcon={<VisibilityIcon />}
                              variant="outlined"
                              onClick={() => handleViewDetails(event)}
                              sx={{
                                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                                borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                                '&:hover': {
                                  borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                                  backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                                }
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#059669' : '#388e3c' 
              }}>
                Entrevistas Completadas
              </Typography>
              <TextField
                select
                size="small"
                value={showCompletedInterviews}
                onChange={e => setShowCompletedInterviews(Number(e.target.value))}
                sx={{ 
                  minWidth: 110,
                  '& .MuiOutlinedInput-root': {
                    color: themeMode === 'dark' ? '#059669' : '#388e3c',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#059669' : '#388e3c',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#047857' : '#2e7d32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#059669' : '#388e3c',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#059669' : '#388e3c',
                  },
                  '& .MuiSelect-icon': {
                    color: themeMode === 'dark' ? '#059669' : '#388e3c',
                  },
                }}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={50}>Últimos 50</MenuItem>
                <MenuItem value={100}>Últimos 100</MenuItem>
                <MenuItem value={completedInterviews.length}>Todas</MenuItem>
              </TextField>
            </Box>
            
            {completedInterviews.length === 0 ? (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3,
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                boxShadow: themeMode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.08)',
                border: themeMode === 'dark' ? '1px solid #334155' : 'none'
              }}>
                <CheckCircleIcon sx={{ 
                  fontSize: 80, 
                  color: themeMode === 'dark' ? '#64748b' : 'text.secondary', 
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', 
                  mb: 2
                }}>
                  No hay entrevistas completadas
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' 
                }}>
                  Las entrevistas completadas aparecerán aquí.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {completedInterviews.slice(0, showCompletedInterviews).map((event) => {
                  const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                  const iniciales = nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={event.id}>
                      <Card sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        boxShadow: themeMode === 'dark' 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: themeMode === 'dark' 
                            ? '0 15px 35px rgba(0,0,0,0.5)' 
                            : '0 15px 35px rgba(0,0,0,0.15)',
                        },
                        position: 'relative',
                        overflow: 'hidden',
                        border: themeMode === 'dark' ? '1px solid #334155' : 'none'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: themeMode === 'dark' 
                            ? 'linear-gradient(90deg, #059669 0%, #047857 100%)' 
                            : 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)'
                        }} />
                        
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: themeMode === 'dark' ? '#059669' : '#4ecdc4',
                              color: 'white'
                            }}>
                              {iniciales}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" fontWeight={700} sx={{ 
                                color: themeMode === 'dark' ? '#10b981' : '#388e3c' 
                              }}>
                                {nombre}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                              }}>
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

                          <Divider sx={{ 
                            my: 2,
                            borderColor: themeMode === 'dark' ? '#334155' : '#e0e0e0'
                          }} />

                          <Box sx={{ space: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <CalendarIcon sx={{ 
                                mr: 1.5, 
                                color: themeMode === 'dark' ? '#059669' : '#4ecdc4', 
                                fontSize: 20 
                              }} />
                              <Typography variant="body2" fontWeight={600}>
                                {formatDate(event.start_date)}
                              </Typography>
                            </Box>

                            {event.project_title && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#059669' : '#4ecdc4', 
                                  fontSize: 20 
                                }} />
                                <Typography variant="body2">
                                  <strong>Proyecto:</strong> {event.project_title}
                                </Typography>
                              </Box>
                            )}

                            {event.description && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                <InfoIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#059669' : '#4ecdc4', 
                                  fontSize: 20, 
                                  mt: 0.2 
                                }} />
                                <Typography variant="body2">
                                  <strong>Motivo:</strong> {event.description}
                                </Typography>
                              </Box>
                            )}

                            {event.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <WorkIcon sx={{ 
                                  mr: 1.5, 
                                  color: themeMode === 'dark' ? '#059669' : '#4ecdc4', 
                                  fontSize: 20 
                                }} />
                                <Typography variant="body2">
                                  <strong>Ubicación:</strong> {event.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button 
                              size="small" 
                              startIcon={<PersonIcon />}
                              variant="outlined"
                              onClick={() => handleViewProfile(event)}
                              sx={{
                                color: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                borderColor: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                '&:hover': {
                                  borderColor: themeMode === 'dark' ? '#059669' : '#2e7d32',
                                  backgroundColor: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 142, 60, 0.1)'
                                }
                              }}
                            >
                              Ver Perfil
                            </Button>
                            {event.project_title && (
                              <Button 
                                size="small" 
                                startIcon={<WorkIcon />}
                                variant="outlined"
                                onClick={() => handleViewProjectDetails(event)}
                                sx={{
                                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                                  '&:hover': {
                                    borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                                  }
                                }}
                              >
                                Ver Proyecto
                              </Button>
                            )}
                            <Button 
                              size="small" 
                              startIcon={<VisibilityIcon />}
                              variant="outlined"
                              onClick={() => handleViewDetails(event)}
                              sx={{
                                color: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                borderColor: themeMode === 'dark' ? '#10b981' : '#388e3c',
                                '&:hover': {
                                  borderColor: themeMode === 'dark' ? '#059669' : '#2e7d32',
                                  backgroundColor: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 142, 60, 0.1)'
                                }
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </Box>
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
            <Typography variant="h5" fontWeight={700} sx={{ 
              mb: 3, 
              color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
            }}>
              Historial Completo
            </Typography>
            
            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ 
                borderRadius: 3, 
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                boxShadow: themeMode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.08)',
                border: themeMode === 'dark' ? '1px solid #334155' : 'none'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' 
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        Estudiante
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        Proyecto
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const nombre = event.attendees?.[0]?.full_name || event.attendees?.[0]?.email || 'Estudiante no asignado';
                      return (
                        <TableRow key={event.id} hover sx={{
                          '&:hover': {
                            bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5'
                          }
                        }}>
                          <TableCell sx={{ 
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                mr: 2, 
                                bgcolor: getStatusColor(event.status) 
                              }}>
                                {nombre.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {nombre}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            {event.project_title || '-'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            {formatDate(event.start_date)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(event.status)} 
                              color={event.status === 'completed' ? 'success' : event.status === 'scheduled' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Ver detalles">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewDetails(event)}
                                sx={{
                                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                                  '&:hover': {
                                    bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                                  }
                                }}
                              >
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
                        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        boxShadow: themeMode === 'dark' 
                          ? '0 4px 15px rgba(0,0,0,0.3)' 
                          : '0 4px 15px rgba(0,0,0,0.08)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: themeMode === 'dark' 
                            ? '0 8px 25px rgba(0,0,0,0.5)' 
                            : '0 8px 25px rgba(0,0,0,0.12)',
                        },
                        border: themeMode === 'dark' ? '1px solid #334155' : 'none'
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
                              <Typography variant="body2" sx={{ 
                                color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                              }}>
                                {event.project_title || event.title}
                              </Typography>
                            </Box>
                            <Chip 
                              label={getStatusLabel(event.status)} 
                              color={event.status === 'completed' ? 'success' : event.status === 'scheduled' ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>

                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', 
                            mb: 1 
                          }}>
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
                            onClick={() => handleViewDetails(event)}
                            sx={{
                              color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                              borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                              '&:hover': {
                                borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                                backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
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

      {/* Modal de detalles */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetails} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GroupIcon sx={{ fontSize: 28, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }} />
            <Typography variant="h6">Detalles de la Entrevista</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          mt: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedEvent && (
            <Grid container spacing={3}>
              {/* Información del estudiante */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                  border: themeMode === 'dark' ? '1px solid #475569' : 'none'
                }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    mb: 2, 
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' 
                  }}>
                    Información del Estudiante
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      mr: 2, 
                      bgcolor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                      width: 60, 
                      height: 60 
                    }}>
                      {selectedEvent.attendees?.[0]?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() || 'ES'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedEvent.attendees?.[0]?.full_name || selectedEvent.attendees?.[0]?.email || 'Estudiante no asignado'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                      }}>
                        {selectedEvent.attendees?.[0]?.email || 'Email no disponible'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Información del proyecto */}
                  {selectedEvent.project_title && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ 
                        mr: 2, 
                        color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', 
                        fontSize: 24 
                      }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Proyecto
                        </Typography>
                        <Typography variant="body1">
                          {selectedEvent.project_title}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Descripción del evento */}
                  {selectedEvent.description && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <InfoIcon sx={{ 
                        mr: 2, 
                        color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', 
                        fontSize: 24,
                        mt: 0.2
                      }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Motivo/Descripción
                        </Typography>
                        <Typography variant="body1">
                          {selectedEvent.description}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Información de la entrevista */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                  border: themeMode === 'dark' ? '1px solid #475569' : 'none'
                }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    mb: 2, 
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' 
                  }}>
                    Detalles de la Entrevista
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600}>
                        Estado:
                      </Typography>
                      <Chip 
                        label={getStatusLabel(selectedEvent.status)} 
                        color={selectedEvent.status === 'completed' ? 'success' : selectedEvent.status === 'scheduled' ? 'warning' : 'error'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600}>
                        Tipo:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                        mt: 0.5
                      }}>
                        Entrevista
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600}>
                        Fecha y Hora:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                        mt: 0.5
                      }}>
                        {formatDate(selectedEvent.start_date)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={600}>
                        Duración:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                        mt: 0.5
                      }}>
                        {selectedEvent.duration_minutes || '60'} minutos
                      </Typography>
                    </Grid>
                    
                    {selectedEvent.location && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight={600}>
                          Ubicación:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                          mt: 0.5
                        }}>
                          {selectedEvent.location}
                        </Typography>
                      </Grid>
                    )}
                    
                    {selectedEvent.meeting_type && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight={600}>
                          Modalidad:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                          mt: 0.5
                        }}>
                          {selectedEvent.meeting_type === 'online' ? 'Online' : 
                           selectedEvent.meeting_type === 'cowork' ? 'Cowork' : 
                           selectedEvent.meeting_type === 'fablab' ? 'FabLab' : 
                           selectedEvent.meeting_type}
                        </Typography>
                      </Grid>
                    )}
                    
                    {selectedEvent.meeting_link && (
                      <Grid item xs={12}>
                        <Typography variant="body2" fontWeight={600}>
                          Enlace de Reunión:
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          href={selectedEvent.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 0.5 }}
                        >
                          Abrir Enlace
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 0,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleCloseDetails}
            variant="contained"
            sx={{
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
                  : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles del proyecto */}
      <ProjectDetailsModal
        open={projectDetailsModalOpen}
        onClose={() => setProjectDetailsModalOpen(false)}
        project={selectedProjectForDetails}
        userRole="company"
      />

      {/* Modal del perfil del estudiante */}
      <StudentProfileModal
        open={showProfileDialog}
        onClose={() => {
          setShowProfileDialog(false);
          setSelectedEvent(null);
          setSelectedStudentId(null);
        }}
        studentProfile={studentProfile}
        loading={profileLoading}
        error={profileError}
        projectTitle={selectedEvent?.project_title || 'Entrevista'}
        applicationStatus="interview"
        onStatusChange={() => {}} // No se puede cambiar estado desde entrevistas
        updatingStatus={false}
      />
    </Box>
  );
};

export default CompanyInterviews;
