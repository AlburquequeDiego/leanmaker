import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useApi } from '../../../hooks/useApi';
import { adaptCalendarEvent } from '../../../utils/adapters';
import type { CalendarEvent } from '../../../types';

const calendarStyles = `
  .rbc-calendar { font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .rbc-header { background-color: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-weight: 600; color: #333; padding: 12px 8px; }
  .rbc-toolbar { background-color: #fafafa; border-bottom: 1px solid #e0e0e0; padding: 16px; margin-bottom: 0; }
  .rbc-toolbar button { background-color: #fff; border: 1px solid #ddd; color: #666; border-radius: 4px; padding: 8px 16px; font-weight: 500; transition: all 0.2s ease; }
  .rbc-toolbar button:hover { background-color: #f5f5f5; border-color: #1976d2; color: #1976d2; }
  .rbc-toolbar button.rbc-active { background-color: #1976d2; border-color: #1976d2; color: white; }
  .rbc-month-view { border: 1px solid #e0e0e0; }
  .rbc-month-row { border-bottom: 1px solid #e0e0e0; }
  .rbc-date-cell { padding: 8px; border-right: 1px solid #e0e0e0; }
  .rbc-off-range-bg { background-color: #fafafa; }
  .rbc-today { background-color: rgba(25, 118, 210, 0.08); }
  .rbc-event { border-radius: 4px; font-weight: 600; font-size: 12px; padding: 2px 6px; margin: 1px; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .rbc-event:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.3); transform: translateY(-1px); transition: all 0.2s ease; }
  .rbc-event-content { font-weight: 600; }
`;
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = calendarStyles;
  document.head.appendChild(styleElement);
}

const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export const CompanyCalendar = forwardRef((_, ref) => {
  const api = useApi();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [view, setView] = useState('month');
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    description: '',
    event_type: 'meeting',
    start_date: '',
    end_date: '',
    location: '',
    attendees: [],
    is_public: false,
    priority: 'medium',
  });

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
      try {
      setLoading(true);
      setError(null);
      
      // Obtener eventos de calendario
      const eventsResponse = await api.get('/api/calendar/events/');
      const adaptedEvents = (eventsResponse.data.results || eventsResponse.data).map(adaptCalendarEvent);
      setEvents(adaptedEvents);

      // Obtener usuarios para invitar a eventos
      const usersResponse = await api.get('/api/users/');
      const studentUsers = usersResponse.data.filter((user: any) => user.role === 'student');
      setUsers(studentUsers);
      
    } catch (err: any) {
      console.error('Error cargando datos del calendario:', err);
      setError(err.response?.data?.error || 'Error al cargar datos del calendario');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview': return <BusinessIcon color="primary" />;
      case 'deadline': return <AssignmentIcon color="error" />;
      case 'meeting': return <ScheduleIcon color="info" />;
      case 'reminder': return <InfoIcon color="warning" />;
      case 'other': return <EventIcon color="success" />;
      default: return <InfoIcon color="action" />;
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    switch (event.event_type) {
      case 'interview': backgroundColor = '#1976d2'; borderColor = '#1976d2'; break;
      case 'deadline': backgroundColor = '#d32f2f'; borderColor = '#d32f2f'; break;
      case 'meeting': backgroundColor = '#0288d1'; borderColor = '#0288d1'; break;
      case 'reminder': backgroundColor = '#f57c00'; borderColor = '#f57c00'; break;
      case 'other': backgroundColor = '#388e3c'; borderColor = '#388e3c'; break;
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
    setDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    setShowAddDialog(true);
    setNewEvent({
      ...newEvent,
      start_date: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleAddEvent = async () => {
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        event_type: newEvent.event_type,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        location: newEvent.location,
        attendees: newEvent.attendees,
        is_public: newEvent.is_public,
        priority: newEvent.priority,
      };

      const createdEventResponse = await api.post('/api/calendar/events/', eventData);
      const createdEvent = createdEventResponse.data;
      
      // Adaptar el evento creado
      const adaptedEvent = {
        id: createdEvent.id,
        title: createdEvent.title,
        description: createdEvent.description,
        event_type: createdEvent.event_type,
        start_date: createdEvent.start_date,
        end_date: createdEvent.end_date,
        all_day: createdEvent.all_day,
        location: createdEvent.location,
        attendees: createdEvent.attendees || [],
        created_by: createdEvent.created_by,
        created_at: createdEvent.created_at,
        updated_at: createdEvent.updated_at,
      };

      setEvents(prev => [...prev, adaptedEvent]);
      setShowAddDialog(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'meeting',
        start_date: '',
        end_date: '',
        location: '',
        attendees: [],
        is_public: false,
        priority: 'medium',
      });
    } catch (error: any) {
      console.error('Error creando evento:', error);
      setError(error.response?.data?.error || 'Error al crear evento');
    }
  };

  const messages = {
    allDay: 'Todo el día', 
    previous: 'Anterior', 
    next: 'Siguiente', 
    today: 'Hoy', 
    month: 'Mes', 
    week: 'Semana', 
    day: 'Día', 
    agenda: 'Agenda', 
    date: 'Fecha', 
    time: 'Hora', 
    event: 'Evento', 
    noEventsInRange: 'No hay eventos en este rango', 
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  useImperativeHandle(ref, () => ({
    addEvent: (event: CalendarEvent) => setEvents(prev => [...prev, event]),
  }));

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
        <Button onClick={loadCalendarData} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calendario</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddDialog(true)}>
          Agregar Evento
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Tooltip title="Vista de mes"><IconButton color={view === 'month' ? 'primary' : 'default'} onClick={() => setView('month')}><ViewModuleIcon /></IconButton></Tooltip>
        <Tooltip title="Vista de semana"><IconButton color={view === 'week' ? 'primary' : 'default'} onClick={() => setView('week')}><ViewWeekIcon /></IconButton></Tooltip>
        <Tooltip title="Vista de día"><IconButton color={view === 'day' ? 'primary' : 'default'} onClick={() => setView('day')}><ViewDayIcon /></IconButton></Tooltip>
        <Tooltip title="Vista de agenda"><IconButton color={view === 'agenda' ? 'primary' : 'default'} onClick={() => setView('agenda')}><TodayIcon /></IconButton></Tooltip>
      </Box>
      <Box sx={{ height: 600 }}>
        <BigCalendar
          localizer={localizer}
          events={events.map(event => ({
            ...event,
            start: new Date(event.start_date),
            end: new Date(event.end_date),
          }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view as any}
          onView={(newView) => setView(newView)}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          messages={messages}
          eventPropGetter={eventStyleGetter}
          culture="es"
          defaultView="month"
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 20, 0, 0)}
          step={30}
          timeslots={2}
          tooltipAccessor={(event) => `${event.title} - ${event.location || 'Sin ubicación'}`}
        />
      </Box>
      
      {/* Modal para agregar evento */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nuevo Evento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              fullWidth 
              label="Título del Evento" 
              value={newEvent.title} 
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, title: e.target.value }))} 
            />
            <TextField 
              fullWidth 
              multiline 
              rows={3} 
              label="Descripción" 
              value={newEvent.description} 
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))} 
            />
            <FormControl fullWidth>
              <InputLabel>Participantes</InputLabel>
              <Select
                multiple
                value={newEvent.attendees}
                onChange={e => setNewEvent((prev: any) => ({ ...prev, attendees: e.target.value }))}
                label="Participantes"
                renderValue={(selected) => (selected as string[]).map(id => users.find(u => u.id === id)?.full_name).join(', ')}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Fecha y hora de inicio" 
                value={newEvent.start_date} 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, start_date: e.target.value }))} 
                InputLabelProps={{ shrink: true }} 
              />
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Fecha y hora de fin" 
                value={newEvent.end_date} 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, end_date: e.target.value }))} 
                InputLabelProps={{ shrink: true }} 
              />
            </Box>
            <TextField 
              fullWidth 
              label="Ubicación" 
              value={newEvent.location} 
              onChange={(e) => setNewEvent((prev: any) => ({ ...prev, location: e.target.value }))} 
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Evento</InputLabel>
              <Select 
                value={newEvent.event_type} 
                label="Tipo de Evento" 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, event_type: e.target.value }))}
              >
                <MenuItem value="meeting">Reunión</MenuItem>
                <MenuItem value="interview">Entrevista</MenuItem>
                <MenuItem value="deadline">Fecha Límite</MenuItem>
                <MenuItem value="reminder">Recordatorio</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select 
                value={newEvent.priority} 
                label="Prioridad" 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddEvent} variant="contained">Agregar Evento</Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de detalle de evento */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedEvent && getEventIcon(selectedEvent.event_type)}
            <Typography variant="h6">Detalles del Evento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
                  <Box>
                    <Typography variant="h5" gutterBottom color="primary">{selectedEvent.title}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
                      <Box sx={{ minWidth: 300 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tipo:</strong> {selectedEvent.event_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha:</strong> {selectedEvent.start_date ? format(new Date(selectedEvent.start_date), 'EEEE, d MMMM yyyy', { locale: es }) : '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Hora:</strong> {selectedEvent.start_date && selectedEvent.end_date ? 
                      `${format(new Date(selectedEvent.start_date), 'HH:mm')} - ${format(new Date(selectedEvent.end_date), 'HH:mm')}` : '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Ubicación:</strong> {selectedEvent.location || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Creado por:</strong> {selectedEvent.created_by || '-'}
                  </Typography>
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Participantes:</strong> {selectedEvent.attendees.join(', ')}
                    </Typography>
                        )}
                      </Box>
                      <Box sx={{ minWidth: 300 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Descripción:</strong> {selectedEvent.description || 'Sin descripción'}
                  </Typography>
                      </Box>
                    </Box>
                  </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default CompanyCalendar; 