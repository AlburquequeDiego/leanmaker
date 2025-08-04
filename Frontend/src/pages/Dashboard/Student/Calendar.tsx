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
      // Obtener eventos específicos del estudiante
      const eventsData = await apiService.get('/api/calendar/events/student_events/');
      console.log('Raw events data from backend:', eventsData);
      
      const eventsArray = Array.isArray(eventsData)
        ? eventsData
        : (eventsData?.results || []);
      
      // Validar que eventsArray sea un array válido
      if (!Array.isArray(eventsArray)) {
        console.error('eventsArray no es un array válido:', eventsArray);
        setEvents([]);
        return;
      }
      
      console.log('Events array:', eventsArray);
      
      const formattedEvents = eventsArray.map((event: any) => {
        try {
          const adapted = adaptCalendarEvent(event);
          console.log('Adapted event:', adapted);
          return adapted;
        } catch (error) {
          console.error('Error adaptando evento:', event, error);
          return null;
        }
      }).filter(Boolean); // Filtrar eventos nulos
      
      console.log('Calendar - Events loaded successfully:', formattedEvents.length);
      console.log('Calendar - Formatted events details:', formattedEvents.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        isValidStart: !isNaN(e.start.getTime()),
        isValidEnd: !isNaN(e.end.getTime())
      })));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
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

  const getStatusLabel = (status: string) => {
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
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
        Calendario de Actividades
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}



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
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'white' }}>
        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
          {/* Navegación del calendario */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #ddd' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setDate(new Date())} variant="outlined" size="small">
                HOY
              </Button>
              <Button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} variant="outlined" size="small">
                ANTERIOR
              </Button>
              <Button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} variant="outlined" size="small">
                SIGUIENTE
              </Button>
            </Box>
            <Typography variant="h6">
              {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setView('month')} 
                variant={view === 'month' ? 'contained' : 'outlined'} 
                size="small"
              >
                MES
              </Button>
              <Button 
                onClick={() => setView('week')} 
                variant={view === 'week' ? 'contained' : 'outlined'} 
                size="small"
              >
                SEMANA
              </Button>
              <Button 
                onClick={() => setView('day')} 
                variant={view === 'day' ? 'contained' : 'outlined'} 
                size="small"
              >
                DÍA
              </Button>
              <Button 
                onClick={() => setView('agenda')} 
                variant={view === 'agenda' ? 'contained' : 'outlined'} 
                size="small"
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
                          border: '1px solid #ddd',
                          backgroundColor: isToday ? '#e3f2fd' : isCurrentMonth ? 'white' : '#f9f9f9',
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
                            color: isCurrentMonth ? 'text.primary' : 'text.secondary',
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
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '8px' }}>
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
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                  borderRadius: 3,
                  p: 4
                }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    📅 No hay eventos programados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                            borderColor: 'rgba(102, 126, 234, 0.3)'
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
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📅 {new Date(event.start).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              🕐 {new Date(event.start).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.end).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            
                            {event.location && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                📍 {event.location}
                              </Typography>
                            )}
                            
                            {event.description && (
                              <Typography variant="body2" color="text.secondary">
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
        <Paper sx={{ p: 3 }}>
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
                >
                  Próximos
                </Button>
                <Button
                  variant={showPastEvents ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setShowPastEvents(true)}
                  disabled={pastEvents.length === 0}
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
              <Card key={event.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getEventIcon(event.event_type)}
                    <Box>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(event.start, 'dd/MM/yyyy HH:mm')} - {format(event.end, 'HH:mm')}
                      </Typography>
                      {event.location && (
                        <Typography variant="body2" color="text.secondary">
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6">Detalles del Evento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                    {selectedEvent.meeting_type === 'online' ? 'Online' : 'En Sede'}
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
               {(selectedEvent.meeting_type === 'cowork' || selectedEvent.meeting_type === 'fablab') && selectedEvent.meeting_room && (
                 <>
                   <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Ubicación</Typography>
                   <Typography variant="body1">
                     {selectedEvent.meeting_type === 'cowork' ? 'Cowork' : 'FabLab'}
                   </Typography>
                   <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Sala</Typography>
                   <Typography variant="body1">{selectedEvent.meeting_room}</Typography>
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
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 