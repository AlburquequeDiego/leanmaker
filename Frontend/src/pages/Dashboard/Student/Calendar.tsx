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
import { apiService } from '../../../services/api.service';
import { ShowLatestFilter } from '../../../components/common/ShowLatestFilter';

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

  const [view, setView] = useState('week'); // Vista por defecto: semana
  const [date, setDate] = useState(new Date());
  const [showRequestChange, setShowRequestChange] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [upcomingEventsLimit, setUpcomingEventsLimit] = useState(5);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener eventos específicos del estudiante
      const eventsData = await apiService.get('/api/calendar/events/student_events/');
      
      const formattedEvents = Array.isArray(eventsData) ? eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        type: event.event_type || 'other',
        priority: event.priority || 'medium',
        location: event.location,
        description: event.description,
        company: event.project?.empresa?.nombre || 'Sin empresa',
        status: event.status || 'upcoming',
      })) : [];
      
      console.log('Calendar - Events loaded successfully:', formattedEvents.length);
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
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'white' }}>
        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
          <BigCalendar
            localizer={localizer}
            culture="es"
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, backgroundColor: 'white' }}
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
        </Box>
      </Paper>

      {/* Próximos eventos */}
      {upcomingEvents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
              Próximos Eventos
            </Typography>
            <ShowLatestFilter
              value={upcomingEventsLimit}
              onChange={setUpcomingEventsLimit}
            />
          </Box>
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
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Empresa</Typography>
              <Typography variant="body1">{selectedEvent.company || 'Sin empresa'}</Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip label={getEventTypeText(selectedEvent.type)} color="primary" />
                <Chip label={selectedEvent.priority} color={getPriorityColor(selectedEvent.priority)} />
                <Chip label={selectedEvent.status} color="default" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cerrar</Button>
          <Button onClick={() => setShowRequestChange(true)} color="primary" variant="contained">Solicitar cambio</Button>
        </DialogActions>
      </Dialog>
      {/* Modal para solicitar cambio de evento */}
      <Dialog open={showRequestChange} onClose={() => setShowRequestChange(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar cambio de evento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Escribe tu solicitud o motivo para cambiar este evento. La empresa recibirá tu mensaje.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Ejemplo: Solicito cambiar la fecha por..."
            value={requestMessage}
            onChange={e => setRequestMessage(e.target.value)}
          />
          {requestSuccess && <Alert severity="success" sx={{ mt: 2 }}>¡Solicitud enviada correctamente!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestChange(false)} color="secondary">Cancelar</Button>
          <Button
            onClick={() => {
              setRequestSuccess(true);
              setTimeout(() => {
                setShowRequestChange(false);
                setRequestSuccess(false);
                setRequestMessage('');
              }, 1500);
            }}
            color="primary"
            variant="contained"
            disabled={!requestMessage.trim()}
          >
            Enviar solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 