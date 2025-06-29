import { useState, useImperativeHandle, forwardRef } from 'react';
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
  Avatar,
  Chip,
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
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const mockEvents = [
  {
    id: 1,
    title: 'Entrevista con TechCorp Solutions',
    type: 'interview',
    start: new Date(2025, 5, 18, 10, 0),
    end: new Date(2025, 5, 18, 11, 0),
    duration: '1 hora',
    location: 'Remoto (Zoom)',
    company: 'TechCorp Solutions',
    project: 'Sistema de Gestión de Inventarios',
    description: 'Entrevista técnica para evaluar habilidades en React y Node.js',
    status: 'upcoming',
    priority: 'high',
    students: ['1'],
    interviewers: ['María González', 'Carlos Rodríguez'],
    notes: 'Entrevista técnica enfocada en React y TypeScript',
  },
  {
    id: 2,
    title: 'Entrega del Módulo de Autenticación',
    type: 'deadline',
    start: new Date(2025, 5, 20, 23, 59),
    end: new Date(2025, 5, 20, 23, 59),
    duration: 'N/A',
    location: 'N/A',
    company: 'TechCorp Solutions',
    project: 'Sistema de Gestión de Inventarios',
    description: 'Entrega final del módulo de autenticación con JWT',
    status: 'upcoming',
    priority: 'high',
    students: [],
    interviewers: [],
    notes: '',
  },
  {
    id: 3,
    title: 'Reunión de Progreso Semanal',
    type: 'meeting',
    start: new Date(2025, 5, 15, 14, 0),
    end: new Date(2025, 5, 15, 14, 30),
    duration: '30 minutos',
    location: 'Remoto (Teams)',
    company: 'Digital Dynamics',
    project: 'Aplicación Móvil de Delivery',
    description: 'Reunión semanal para revisar el progreso del proyecto',
    status: 'completed',
    priority: 'medium',
    students: [],
    interviewers: [],
    notes: '',
  },
  // ...otros eventos del mock del estudiante...
];

const mockStudents = [
  { id: '1', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+56 9 1234 5678' },
  { id: '2', name: 'María González', email: 'maria.gonzalez@email.com', phone: '+56 9 8765 4321' },
  { id: '3', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '+56 9 5555 1234' },
  { id: '4', name: 'Ana Torres', email: 'ana.torres@email.com', phone: '+56 9 4321 5678' },
];

export const CompanyCalendar = forwardRef((_, ref) => {
  const [events, setEvents] = useState<any[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [view, setView] = useState('month');
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    description: '',
    type: 'meeting',
    start: '',
    end: '',
    duration: '',
    location: '',
    company: '',
    project: '',
    status: 'upcoming',
    priority: 'medium',
    students: [],
  });

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

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    switch (event.type) {
      case 'interview': backgroundColor = '#1976d2'; borderColor = '#1976d2'; break;
      case 'deadline': backgroundColor = '#d32f2f'; borderColor = '#d32f2f'; break;
      case 'meeting': backgroundColor = '#0288d1'; borderColor = '#0288d1'; break;
      case 'presentation': backgroundColor = '#388e3c'; borderColor = '#388e3c'; break;
      case 'review': backgroundColor = '#f57c00'; borderColor = '#f57c00'; break;
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

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    setShowAddDialog(true);
    setNewEvent({
      ...newEvent,
      start: slotInfo.start,
      end: slotInfo.end,
    });
  };

  const handleAddEvent = () => {
    setEvents(prev => [
      ...prev,
      {
        ...newEvent,
        id: Date.now(),
        start: newEvent.start,
        end: newEvent.end,
        students: newEvent.students,
      },
    ]);
    setShowAddDialog(false);
    setNewEvent({
      title: '',
      description: '',
      type: 'meeting',
      start: '',
      end: '',
      duration: '',
      location: '',
      company: '',
      project: '',
      status: 'upcoming',
      priority: 'medium',
      students: [],
    });
  };

  const messages = {
    allDay: 'Todo el día', previous: 'Anterior', next: 'Siguiente', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda', date: 'Fecha', time: 'Hora', event: 'Evento', noEventsInRange: 'No hay eventos en este rango', showMore: (total: number) => `+ Ver más (${total})`,
  };

  useImperativeHandle(ref, () => ({
    addEvent: (event: any) => setEvents(prev => [...prev, event]),
  }));

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
          events={events}
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
          tooltipAccessor={(event) => `${event.title} - ${event.company}`}
                    />
                  </Box>
      {/* Modal para agregar evento */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nuevo Evento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Título del Evento" value={newEvent.title} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, title: e.target.value }))} />
            <TextField fullWidth multiline rows={3} label="Descripción" value={newEvent.description} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Estudiantes</InputLabel>
              <Select
                multiple
                value={newEvent.students}
                onChange={e => setNewEvent((prev: any) => ({ ...prev, students: e.target.value }))}
                label="Estudiantes"
                renderValue={(selected) => (selected as string[]).map(id => mockStudents.find(s => s.id === id)?.name).join(', ')}
              >
                {mockStudents.map(student => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField fullWidth type="date" label="Fecha" value={newEvent.start ? format(newEvent.start, 'yyyy-MM-dd') : ''} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, start: new Date(e.target.value + 'T' + (prev.start ? format(prev.start, 'HH:mm') : '08:00')), end: new Date(e.target.value + 'T' + (prev.end ? format(prev.end, 'HH:mm') : '09:00')) }))} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth type="time" label="Hora de inicio" value={newEvent.start ? format(newEvent.start, 'HH:mm') : ''} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, start: prev.start ? new Date(format(prev.start, 'yyyy-MM-dd') + 'T' + e.target.value) : new Date('2025-06-18T' + e.target.value), end: prev.end ? new Date(format(prev.end, 'yyyy-MM-dd') + 'T' + e.target.value) : new Date('2025-06-18T' + e.target.value) }))} InputLabelProps={{ shrink: true }} />
            </Box>
            <TextField fullWidth type="number" label="Duración (minutos)" value={newEvent.duration} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, duration: e.target.value }))} inputProps={{ min: 0 }} />
            <TextField fullWidth label="Ubicación" value={newEvent.location} onChange={(e) => setNewEvent((prev: any) => ({ ...prev, location: e.target.value }))} />
              <FormControl fullWidth>
                <InputLabel>Tipo de Evento</InputLabel>
              <Select value={newEvent.type} label="Tipo de Evento" onChange={(e) => setNewEvent((prev: any) => ({ ...prev, type: e.target.value }))}>
                  <MenuItem value="meeting">Reunión</MenuItem>
                  <MenuItem value="interview">Entrevista</MenuItem>
                <MenuItem value="presentation">Presentación</MenuItem>
                <MenuItem value="review">Revisión</MenuItem>
                <MenuItem value="deadline">Entrega</MenuItem>
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
            {selectedEvent && getEventIcon(selectedEvent.type)}
            <Typography variant="h6">Detalles del Evento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {(() => {
            try {
              if (!selectedEvent) return <Typography color="error">Evento no válido.</Typography>;
              if (selectedEvent.type === 'interview' && Array.isArray(selectedEvent.students) && selectedEvent.students.length > 0) {
                return selectedEvent.students.map((id: string) => {
                  const stu = mockStudents.find(s => s.id === id);
                  if (!stu) return null;
                  return (
                    <Box key={id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <EventIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{stu.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{stu.email}</Typography>
                          {selectedEvent.status && (
                            <Chip label={String(selectedEvent.status).charAt(0).toUpperCase() + String(selectedEvent.status).slice(1)} color="info" size="small" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Proyecto: {selectedEvent.project || '-'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={selectedEvent.type === 'interview' ? 'Entrevista' : selectedEvent.type} color="primary" size="small" />
                        <Chip label={selectedEvent.duration || '-'} color="secondary" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ScheduleIcon fontSize="small" />
                        <Typography variant="body2">{selectedEvent.start && selectedEvent.end ? `${format(selectedEvent.start, 'dd-MM-yyyy, HH:mm', { locale: es })} - ${format(selectedEvent.end, 'HH:mm')}` : '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body2">{selectedEvent.location || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon fontSize="small" />
                        <Typography variant="body2">{stu.email}</Typography>
                      </Box>
                      {stu.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="body2">{stu.phone}</Typography>
                        </Box>
                      )}
                      {Array.isArray(selectedEvent.interviewers) && selectedEvent.interviewers.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Entrevistadores</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            {selectedEvent.interviewers.map((interviewer: string, idx: number) => (
                              <Chip key={idx} label={interviewer} color="primary" size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {selectedEvent.notes && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Notas</Typography>
                          <Typography variant="body2">{selectedEvent.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                });
              } else {
                // Renderizado por defecto para otros eventos
                return (
                  <Box>
                    <Typography variant="h5" gutterBottom color="primary">{selectedEvent.title}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
                      <Box sx={{ minWidth: 300 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Tipo:</strong> {selectedEvent.type}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Fecha:</strong> {selectedEvent.start ? format(selectedEvent.start, 'EEEE, d MMMM yyyy', { locale: es }) : '-'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Hora:</strong> {selectedEvent.start && selectedEvent.end ? `${format(selectedEvent.start, 'HH:mm')} - ${format(selectedEvent.end, 'HH:mm')}` : '-'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Duración:</strong> {selectedEvent.duration || '-'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Ubicación:</strong> {selectedEvent.location || '-'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Proyecto:</strong> {selectedEvent.project || '-'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Empresa:</strong> {selectedEvent.company || '-'}</Typography>
                        {Array.isArray(selectedEvent.students) && selectedEvent.students.length > 0 && (
                          <>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Estudiantes:</strong> {selectedEvent.students.map((id: string) => mockStudents.find(s => s.id === id)?.name).join(', ')}</Typography>
                            {selectedEvent.students.map((id: string) => {
                              const stu = mockStudents.find(s => s.id === id);
                              return stu && stu.email ? (
                                <Typography key={id} variant="body2" sx={{ mb: 1, ml: 2 }}><strong>Correo:</strong> {stu.email}</Typography>
                              ) : null;
                            })}
                          </>
                        )}
                      </Box>
                      <Box sx={{ minWidth: 300 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Descripción:</strong> {selectedEvent.description}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }
            } catch (err) {
              return <Typography color="error">Error al mostrar el evento. Por favor revisa los datos.</Typography>;
            }
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default CompanyCalendar; 