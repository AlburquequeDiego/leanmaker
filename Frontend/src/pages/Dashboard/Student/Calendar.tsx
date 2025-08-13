import { useState, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import {
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Estilos adicionales para asegurar que los eventos sean visibles
const additionalStyles = `
  .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    background-color: #1976d2 !important;
    color: white !important;
    border: 1px solid #1976d2 !important;
    border-radius: 4px !important;
    padding: 2px 4px !important;
    margin: 1px 0 !important;
    font-size: 12px !important;
    font-weight: bold !important;
    min-height: 20px !important;
    z-index: 10 !important;
    position: relative !important;
  }
  
  .rbc-event-content {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-month-view .rbc-event {
    position: relative !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    background-color: #1976d2 !important;
    color: white !important;
    border: 1px solid #1976d2 !important;
    border-radius: 4px !important;
    padding: 2px 4px !important;
    margin: 1px 0 !important;
    font-size: 12px !important;
    font-weight: bold !important;
    min-height: 20px !important;
    z-index: 10 !important;
  }
  
  .rbc-month-view .rbc-event-content {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: white !important;
    font-weight: bold !important;
  }
  
  .rbc-day-slot .rbc-event {
    position: absolute !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-month-row .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-date-cell .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
`;

// Agregar estilos al documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}
import { apiService } from '../../../services/api.service';
import { ShowLatestFilter } from '../../../components/common/ShowLatestFilter';
import { adaptCalendarEvent } from '../../../utils/adapters';
import type { CalendarEvent } from '../../../types/calendar';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});



export const Calendar = () => {
  const { themeMode } = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState('month'); // Vista por defecto: mes
  const [date, setDate] = useState(new Date());
  const [showRequestChange, setShowRequestChange] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [upcomingEventsLimit, setUpcomingEventsLimit] = useState(5);
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [STUDENT] Iniciando fetchEvents...');
      
      // Obtener eventos específicos del estudiante
      const eventsData = await apiService.get('/api/calendar/events/student_events/');
      console.log('🔍 [STUDENT] Raw events data from backend:', eventsData);
      console.log('🔍 [STUDENT] Tipo de respuesta:', typeof eventsData);
      console.log('🔍 [STUDENT] Claves de respuesta:', Object.keys(eventsData || {}));
      
      const eventsArray = Array.isArray(eventsData)
        ? eventsData
        : (eventsData as any)?.results || [];
      
      console.log('🔍 [STUDENT] Events array extraído:', eventsArray);
      console.log('🔍 [STUDENT] Número de eventos:', eventsArray.length);
      
      // Validar que eventsArray sea un array válido
      if (!Array.isArray(eventsArray)) {
        console.error('❌ [STUDENT] eventsArray no es un array válido:', eventsArray);
        setEvents([]);
        return;
      }
      
      // Debug: Imprimir información de cada evento
      if (eventsArray.length > 0) {
        console.log('🔍 [STUDENT] Primera evento:', eventsArray[0]);
        console.log('🔍 [STUDENT] Estructura del evento:', {
          id: eventsArray[0].id,
          title: eventsArray[0].title,
          start_date: eventsArray[0].start_date,
          end_date: eventsArray[0].end_date,
          attendees: eventsArray[0].attendees,
          created_by: eventsArray[0].created_by
        });
      }
      
      const formattedEvents = eventsArray.map((event: any, index: number) => {
        try {
          console.log(`🔍 [STUDENT] Procesando evento ${index}:`, event);
          const adapted = adaptCalendarEvent(event);
          console.log(`✅ [STUDENT] Evento ${index} adaptado:`, adapted);
          return adapted;
        } catch (error) {
          console.error(`❌ [STUDENT] Error adaptando evento ${index}:`, event, error);
          return null;
        }
      }).filter((e): e is CalendarEvent => e !== null); // Filtrar eventos nulos
      
      console.log('✅ [STUDENT] Calendar - Events loaded successfully:', formattedEvents.length);
      console.log('🔍 [STUDENT] Calendar - Formatted events details:', formattedEvents.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        isValidStart: !isNaN(e.start.getTime()),
        isValidEnd: !isNaN(e.end.getTime())
      })));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('❌ [STUDENT] Error fetching events:', error);
      console.error('❌ [STUDENT] Error details:', {
        message: (error as any).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status
      });
      setError('Error al cargar los eventos del calendario');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview': return <BusinessIcon color="primary" />;
      case 'deadline': return <AssignmentIcon color="error" />;
      case 'meeting': return <ScheduleIcon color="info" />;
      case 'presentation': return <EventIcon color="success" />;
      case 'review': return <InfoIcon color="warning" />;
      default: return <InfoIcon color="action" />;
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'interview': return 'Entrevista';
      case 'deadline': return 'Deadline';
      case 'meeting': return 'Reunión';
      case 'presentation': return 'Presentación';
      case 'review': return 'Revisión';
      default: return 'Otro';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'normal': return 'default';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return 'Sin estado';
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'in-progress': return 'En curso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'scheduled': return 'Programado';
      default: return status;
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (event.event_type) {
      case 'interview': 
        backgroundColor = '#1976d2'; 
        borderColor = '#1976d2'; 
        break;
      case 'deadline': 
        backgroundColor = '#d32f2f'; 
        borderColor = '#d32f2f'; 
        break;
      case 'meeting': 
        backgroundColor = '#0288d1'; 
        borderColor = '#0288d1'; 
        break;
      case 'presentation': 
        backgroundColor = '#388e3c'; 
        borderColor = '#388e3c'; 
        break;
      case 'review': 
        backgroundColor = '#f57c00'; 
        borderColor = '#f57c00'; 
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        color: 'white',
        border: '1px solid ' + borderColor,
        display: 'block',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Para estudiantes, no pueden crear eventos, solo verlos
    console.log('Slot seleccionado:', slotInfo);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, upcomingEventsLimit);
  }, [events, upcomingEventsLimit]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => event.start <= now)
      .sort((a, b) => b.start.getTime() - a.start.getTime()) // Orden descendente (más recientes primero)
      .slice(0, upcomingEventsLimit);
  }, [events, upcomingEventsLimit]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === today.toDateString();
    });
  }, [events]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      minHeight: '100vh'
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
              <EventIcon sx={{ fontSize: 32, color: 'white' }} />
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
                Calendario de Actividades
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Organiza y visualiza todas tus actividades académicas y proyectos
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Indicador de debug temporal */}
      {/* ELIMINADO: Caja de debug temporal */}
      
      {/* Resumen de eventos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
              {events.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Total de Eventos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: 0,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
              {upcomingEvents.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Próximos Eventos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: 0,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
              {pastEvents.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Eventos Recientes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: 0,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
              {todayEvents.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Eventos Hoy
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Calendario principal - VERSIÓN PERSONALIZADA */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        <Box sx={{ 
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd', 
          borderRadius: 1, 
          overflow: 'hidden' 
        }}>
          {/* Navegación del calendario */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd',
            bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setDate(new Date())} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                HOY
              </Button>
              <Button 
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                ANTERIOR
              </Button>
              <Button 
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                SIGUIENTE
              </Button>
            </Box>
            <Typography variant="h6" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setView('month')} 
                variant={view === 'month' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'month' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                MES
              </Button>
              <Button 
                onClick={() => setView('week')} 
                variant={view === 'week' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'week' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                SEMANA
              </Button>
              <Button 
                onClick={() => setView('day')} 
                variant={view === 'day' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'day' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                DÍA
              </Button>
              <Button 
                onClick={() => setView('agenda')} 
                variant={view === 'agenda' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'agenda' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                AGENDA
              </Button>
            </Box>
          </Box>

          {/* Vista de mes personalizada */}
          {view === 'month' && (
            <Box sx={{ height: 750, p: 2, overflow: 'hidden' }}>
              {/* Días de la semana */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
                  <Box key={day} sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
                  }}>
                    {day}
                  </Box>
                ))}
              </Box>
              
              {/* Días del mes */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 1, 
                height: 'calc(100% - 60px)',
                overflow: 'hidden'
              }}>
                {(() => {
                  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    // Encontrar eventos para este día
                    const dayEvents = events.filter(event => {
                      const eventDate = new Date(event.start);
                      return eventDate.toDateString() === currentDate.toDateString();
                    });
                    
                    const isCurrentMonth = currentDate.getMonth() === date.getMonth();
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    
                    days.push(
                      <Box 
                        key={i} 
                        sx={{ 
                          height: '100%',
                          p: 1, 
                          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd',
                          backgroundColor: isToday 
                            ? (themeMode === 'dark' ? '#1e40af' : '#e3f2fd') 
                            : isCurrentMonth 
                              ? (themeMode === 'dark' ? '#1e293b' : 'white') 
                              : (themeMode === 'dark' ? '#0f172a' : '#f9f9f9'),
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: isToday ? 'bold' : 'normal',
                            color: isCurrentMonth 
                              ? (themeMode === 'dark' ? '#f1f5f9' : '#1e293b') 
                              : (themeMode === 'dark' ? '#64748b' : '#64748b'),
                            mb: 0.5
                          }}
                        >
                          {currentDate.getDate()}
                        </Typography>
                        
                        {/* Eventos del día */}
                        <Box sx={{ 
                          flex: 1, 
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}>
                          {dayEvents.slice(0, 3).map((event, index) => (
                            <Box
                              key={event.id}
                              onClick={() => handleSelectEvent(event)}
                              sx={{
                                backgroundColor: event.event_type === 'interview' ? '#1976d2' : 
                                               event.event_type === 'deadline' ? '#d32f2f' : 
                                               event.event_type === 'meeting' ? '#0288d1' : '#3174ad',
                                color: 'white',
                                p: 0.5,
                                borderRadius: 1,
                                fontSize: '9px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minHeight: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                            >
                              {event.title}
                            </Box>
                          ))}
                          {dayEvents.length > 3 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '8px',
                                color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                              }}
                            >
                              +{dayEvents.length - 3} más
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }
                  return days;
                })()}
              </Box>
            </Box>
          )}

          {/* Vista de agenda */}
          {view === 'agenda' && (
            <Box sx={{ height: 600, p: 2 }}>
              {events.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                  borderRadius: 3,
                  p: 4
                }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    📅 No hay eventos programados
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    mb: 2 
                  }}>
                    No tienes eventos en tu agenda. Los eventos aparecerán aquí cuando sean programados.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  {/* Vista de agenda personalizada */}
                  <Typography variant="h5" fontWeight={600} color="primary" gutterBottom sx={{ mb: 3 }}>
                    📅 Agenda de Eventos ({events.length} eventos)
                  </Typography>
                  
                  {events
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .map((event, index) => (
                      <Paper
                        key={event.id || index}
                        sx={{
                          p: 3,
                          mb: 2,
                          borderRadius: 3,
                          boxShadow: themeMode === 'dark' 
                            ? '0 4px 16px rgba(0,0,0,0.3)' 
                            : '0 4px 16px rgba(0,0,0,0.08)',
                          border: themeMode === 'dark' 
                            ? '1px solid #334155' 
                            : '1px solid rgba(102, 126, 234, 0.1)',
                          background: themeMode === 'dark' 
                            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                            : 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: themeMode === 'dark' 
                              ? '0 8px 25px rgba(0,0,0,0.4)' 
                              : '0 8px 25px rgba(102, 126, 234, 0.15)',
                            borderColor: themeMode === 'dark' 
                              ? '#60a5fa' 
                              : 'rgba(102, 126, 234, 0.3)'
                          }
                        }}
                        onClick={() => handleSelectEvent(event)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* Icono del tipo de evento */}
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 40
                          }}>
                            {getEventIcon(event.event_type)}
                          </Box>
                          
                          {/* Contenido del evento */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="h6" fontWeight={600} color="primary">
                                {event.title}
                              </Typography>
                              <Chip 
                                label={event.event_type === 'interview' ? 'Entrevista' : 
                                       event.event_type === 'meeting' ? 'Reunión' : 
                                       event.event_type === 'deadline' ? 'Fecha Límite' : 'Otro'}
                                size="small"
                                color={event.event_type === 'interview' ? 'primary' : 
                                       event.event_type === 'meeting' ? 'info' : 
                                       event.event_type === 'deadline' ? 'error' : 'default'}
                              />
                            </Box>
                            
                            <Typography variant="body2" sx={{ 
                              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                              mb: 1 
                            }}>
                              📅 {new Date(event.start).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                              mb: 1 
                            }}>
                              🕐 {new Date(event.start).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.end).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            
                            {event.location && (
                              <Typography variant="body2" sx={{ 
                                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                                mb: 1 
                              }}>
                                📍 {event.location}
                              </Typography>
                            )}
                            
                            {event.description && (
                              <Typography variant="body2" sx={{ 
                                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                              }}>
                                {event.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                </Box>
              )}
            </Box>
          )}

          {/* Vista de semana */}
          {view === 'week' && (
            <Box sx={{ height: 600, p: 2 }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view="week"
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                step={30}
                timeslots={2}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 19, 0, 0)}
                culture="es"
                toolbar={false}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  noEventsInRange: "No hay eventos en este rango de fechas.",
                  week: "Semana",
                  work_week: "Semana Laboral",
                  day: "Día",
                  month: "Mes",
                  yesterday: "Ayer",
                  tomorrow: "Mañana",
                }}
                formats={{
                  dayHeaderFormat: (date) => date.toLocaleDateString('es-ES', { 
                    weekday: 'short', 
                    day: 'numeric',
                    month: 'short'
                  }),
                  dayRangeHeaderFormat: ({ start, end }) => {
                    const startDate = new Date(start);
                    const endDate = new Date(end);
                    return `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                  }
                }}
              />
            </Box>
          )}

          {/* Vista de día */}
          {view === 'day' && (
            <Box sx={{ height: 600, p: 2 }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view="day"
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                step={30}
                timeslots={2}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 19, 0, 0)}
                culture="es"
                toolbar={false}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  noEventsInRange: "No hay eventos en este rango de fechas.",
                  week: "Semana",
                  work_week: "Semana Laboral",
                  day: "Día",
                  month: "Mes",
                  yesterday: "Ayer",
                  tomorrow: "Mañana",
                }}
                formats={{
                  dayHeaderFormat: (date) => date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Lista de eventos */}
      {(upcomingEvents.length > 0 || pastEvents.length > 0) && (
        <Paper sx={{ 
          p: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                {showPastEvents ? 'Eventos Recientes' : 'Próximos Eventos'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={!showPastEvents ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setShowPastEvents(false)}
                  disabled={upcomingEvents.length === 0}
                  sx={{
                    ...(showPastEvents ? {
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                      '&:hover': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                      }
                    } : {
                      bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      color: 'white',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                      }
                    })
                  }}
                >
                  Próximos
                </Button>
                <Button
                  variant={showPastEvents ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setShowPastEvents(true)}
                  disabled={pastEvents.length === 0}
                  sx={{
                    ...(showPastEvents ? {
                      bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      color: 'white',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                      }
                    } : {
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                      '&:hover': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                      }
                    })
                  }}
                >
                  Recientes
                </Button>
              </Box>
            </Box>
            <ShowLatestFilter
              value={upcomingEventsLimit}
              onChange={setUpcomingEventsLimit}
              options={[5, 10, 20, 50, 100]}
              label="Mostrar"
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(showPastEvents ? pastEvents : upcomingEvents).map((event) => (
              <Card key={event.id} sx={{ 
                p: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getEventIcon(event.event_type)}
                    <Box>
                      <Typography variant="h6" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
                        {format(event.start, 'dd/MM/yyyy HH:mm')} - {format(event.end, 'HH:mm')}
                      </Typography>
                      {event.location && (
                        <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
                          📍 {event.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={getEventTypeText(event.event_type)} 
                      size="small" 
                      color="primary" 
                    />
                    <Chip 
                      label={getPriorityLabel(event.priority)} 
                      size="small" 
                      color={getPriorityColor(event.priority) as any}
                    />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* Dialog para detalles del evento */}
      <Dialog open={!!selectedEvent} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6">Detalles del Evento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedEvent && (
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                {selectedEvent.title}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Fecha y Hora</Typography>
              <Typography variant="body1">
                {selectedEvent.start.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })} - {selectedEvent.end.toLocaleString('es-ES', { timeStyle: 'short' })}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Ubicación</Typography>
              <Typography variant="body1">{selectedEvent.location || 'Sin ubicación'}</Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Descripción</Typography>
              <Typography variant="body1">{selectedEvent.description || 'Sin descripción'}</Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Proyecto</Typography>
              <Typography variant="body1">{selectedEvent.project_title || 'Sin proyecto'}</Typography>
              
              {/* Participantes */}
              {selectedEvent.attendee_names && selectedEvent.attendee_names.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Participantes</Typography>
                  <Typography variant="body1">
                    {selectedEvent.attendee_names.join(', ')}
                  </Typography>
                </>
              )}
              
              {/* Información del Representante */}
              {(selectedEvent.representative_name || selectedEvent.representative_position) && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Representante de la Empresa</Typography>
                  <Typography variant="body1">
                    {selectedEvent.representative_name || 'No especificado'}
                    {selectedEvent.representative_position && ` - ${selectedEvent.representative_position}`}
                  </Typography>
                </>
              )}
              
              {/* Tipo de Reunión */}
              {selectedEvent.meeting_type && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Tipo de Reunión</Typography>
                  <Typography variant="body1">
                    {selectedEvent.meeting_type === 'online' ? 'Online (Videollamada)' : 
                     selectedEvent.meeting_type === 'cowork' ? 'En Sede - Cowork' :
                     selectedEvent.meeting_type === 'fablab' ? 'En Sede - FabLab' :
                     selectedEvent.meeting_type === 'onsite' ? 'En Sede' : 
                     selectedEvent.meeting_type}
                  </Typography>
                </>
              )}
              
              {/* Link de Videollamada (solo si es online) */}
              {selectedEvent.meeting_type === 'online' && selectedEvent.meeting_link && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Link de Videollamada</Typography>
                  <Typography variant="body1">
                    <a href={selectedEvent.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                      {selectedEvent.meeting_link}
                    </a>
                  </Typography>
                </>
              )}
              
              {/* Sala (solo si es en sede) */}
              {(selectedEvent.meeting_type === 'cowork' || selectedEvent.meeting_type === 'fablab' || selectedEvent.meeting_type === 'onsite') && selectedEvent.meeting_room && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Ubicación</Typography>
                  <Typography variant="body1">
                    {selectedEvent.meeting_type === 'cowork' ? 'Cowork' : 
                     selectedEvent.meeting_type === 'fablab' ? 'FabLab' : 
                     'En Sede'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Sala</Typography>
                  <Typography variant="body1">{selectedEvent.meeting_room || 'No especificada'}</Typography>
                </>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip label={getEventTypeText(selectedEvent.event_type)} color="primary" />
                <Chip label={getPriorityLabel(selectedEvent.priority)} color={getPriorityColor(selectedEvent.priority)} />
                <Chip label={getStatusLabel(selectedEvent.status)} color="default" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {/* Botón de debug temporal */}
          <Button 
            onClick={() => {
              console.log('🔍 [STUDENT DEBUG] Estado actual:');
              console.log('🔍 [STUDENT DEBUG] events:', events);
              console.log('🔍 [STUDENT DEBUG] selectedEvent:', selectedEvent);
              console.log('🔍 [STUDENT DEBUG] loading:', loading);
              console.log('🔍 [STUDENT DEBUG] error:', error);
            }} 
            variant="outlined"
            color="warning"
            sx={{ 
              borderRadius: 2, 
              px: 2,
              fontSize: '0.75rem'
            }}
          >
            Debug
          </Button>
          
          <Button onClick={handleCloseDialog} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 