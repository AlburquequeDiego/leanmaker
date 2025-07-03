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
} from '@mui/material';
import {
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiService } from '../../../services/api.service';

// Estilos personalizados para el calendario
const calendarStyles = `
  .rbc-calendar {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .rbc-header {
    background-color: #f5f5f5;
    border-bottom: 2px solid #e0e0e0;
    font-weight: 600;
    color: #333;
    padding: 12px 8px;
  }

  .rbc-toolbar {
    background-color: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px;
    margin-bottom: 0;
  }

  .rbc-toolbar button {
    background-color: #fff;
    border: 1px solid #ddd;
    color: #666;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .rbc-toolbar button:hover {
    background-color: #f5f5f5;
    border-color: #1976d2;
    color: #1976d2;
  }

  .rbc-toolbar button.rbc-active {
    background-color: #1976d2;
    border-color: #1976d2;
    color: white;
  }

  .rbc-month-view {
    border: 1px solid #e0e0e0;
  }

  .rbc-month-row {
    border-bottom: 1px solid #e0e0e0;
  }

  .rbc-date-cell {
    padding: 8px;
    border-right: 1px solid #e0e0e0;
  }

  .rbc-off-range-bg {
    background-color: #fafafa;
  }

  .rbc-today {
    background-color: rgba(25, 118, 210, 0.08);
  }

  .rbc-event {
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 6px;
    margin: 1px;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .rbc-event:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }

  .rbc-event-content {
    font-weight: 600;
  }

  .rbc-time-view {
    border: 1px solid #e0e0e0;
  }

  .rbc-time-header {
    border-bottom: 2px solid #e0e0e0;
  }

  .rbc-time-content {
    border-top: 1px solid #e0e0e0;
  }

  .rbc-time-slot {
    border-bottom: 1px solid #f0f0f0;
  }

  .rbc-current-time-indicator {
    background-color: #1976d2;
    height: 2px;
  }

  .rbc-agenda-view {
    border: 1px solid #e0e0e0;
  }

  .rbc-agenda-date-cell {
    background-color: #f5f5f5;
    font-weight: 600;
    padding: 8px;
    color: #000 !important;
  }

  .rbc-agenda-event-cell {
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
  }

  .rbc-agenda-time-cell {
    background-color: #fafafa;
    font-weight: 500;
    padding: 8px;
    color: #000 !important;
  }

  .rbc-agenda-view .rbc-agenda-date-cell,
  .rbc-agenda-view .rbc-agenda-time-cell {
    color: #000 !important;
  }

  .rbc-agenda-view .rbc-agenda-date-cell *,
  .rbc-agenda-view .rbc-agenda-time-cell * {
    color: #000 !important;
  }
`;

// Agregar estilos al head del documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = calendarStyles;
  document.head.appendChild(styleElement);
}

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'interview' | 'deadline' | 'meeting' | 'presentation' | 'review' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  description?: string;
  project?: string;
  company?: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
}

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/calendar-events/');
      const formattedEvents = Array.isArray(data) ? data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        type: event.type || 'other',
        priority: event.priority || 'medium',
        location: event.location,
        description: event.description,
        project: event.project,
        company: event.company,
        status: event.status || 'upcoming',
      })) : [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setError('Error al cargar los eventos del calendario');
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
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (event.type) {
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
      .slice(0, 5);
  }, [events]);

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
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {events.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Eventos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {upcomingEvents.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Próximos Eventos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {todayEvents.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eventos Hoy
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Calendario principal */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          view={view as any}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            noEventsInRange: "No hay eventos en este rango de fechas.",
          }}
        />
      </Paper>

      {/* Próximos eventos */}
      {upcomingEvents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            Próximos Eventos
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {upcomingEvents.map((event) => (
              <Card key={event.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getEventIcon(event.type)}
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
                      label={getEventTypeText(event.type)} 
                      size="small" 
                      color="primary" 
                    />
                    <Chip 
                      label={event.priority} 
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
      <Dialog open={!!selectedEvent} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getEventIcon(selectedEvent.type)}
                <Typography variant="h6">{selectedEvent.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Fecha y Hora</Typography>
                  <Typography variant="body1">
                    {format(selectedEvent.start, 'dd/MM/yyyy HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                  </Typography>
                </Box>
                
                {selectedEvent.location && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Ubicación</Typography>
                    <Typography variant="body1">{selectedEvent.location}</Typography>
                  </Box>
                )}
                
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Descripción</Typography>
                    <Typography variant="body1">{selectedEvent.description}</Typography>
                  </Box>
                )}
                
                {selectedEvent.project && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Proyecto</Typography>
                    <Typography variant="body1">{selectedEvent.project}</Typography>
                  </Box>
                )}
                
                {selectedEvent.company && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Empresa</Typography>
                    <Typography variant="body1">{selectedEvent.company}</Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={getEventTypeText(selectedEvent.type)} 
                    color="primary" 
                  />
                  <Chip 
                    label={selectedEvent.priority} 
                    color={getPriorityColor(selectedEvent.priority) as any}
                  />
                  <Chip 
                    label={selectedEvent.status} 
                    color={selectedEvent.status === 'completed' ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Calendar; 