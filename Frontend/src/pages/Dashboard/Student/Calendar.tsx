import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Today as TodayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  ViewDay as ViewDayIcon,
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  }

  .rbc-agenda-event-cell {
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
  }

  .rbc-agenda-time-cell {
    background-color: #fafafa;
    font-weight: 500;
    padding: 8px;
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

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [view, setView] = useState('month');

  // Mock data for calendar events
  const events = [
    {
      id: 1,
      title: 'Entrevista con TechCorp Solutions',
      type: 'interview',
      start: new Date(2024, 1, 15, 10, 0), // Feb 15, 2024, 10:00 AM
      end: new Date(2024, 1, 15, 11, 0),   // Feb 15, 2024, 11:00 AM
      duration: '1 hora',
      location: 'Remoto (Zoom)',
      company: 'TechCorp Solutions',
      project: 'Sistema de Gestión de Inventarios',
      description: 'Entrevista técnica para evaluar habilidades en React y Node.js',
      status: 'upcoming',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Entrega del Módulo de Autenticación',
      type: 'deadline',
      start: new Date(2024, 1, 20, 23, 59), // Feb 20, 2024, 11:59 PM
      end: new Date(2024, 1, 20, 23, 59),   // Feb 20, 2024, 11:59 PM
      duration: 'N/A',
      location: 'N/A',
      company: 'TechCorp Solutions',
      project: 'Sistema de Gestión de Inventarios',
      description: 'Entrega final del módulo de autenticación con JWT',
      status: 'upcoming',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Reunión de Progreso Semanal',
      type: 'meeting',
      start: new Date(2024, 1, 12, 14, 0), // Feb 12, 2024, 2:00 PM
      end: new Date(2024, 1, 12, 14, 30),  // Feb 12, 2024, 2:30 PM
      duration: '30 minutos',
      location: 'Remoto (Teams)',
      company: 'Digital Dynamics',
      project: 'Aplicación Móvil de Delivery',
      description: 'Reunión semanal para revisar el progreso del proyecto',
      status: 'completed',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Presentación Final del Proyecto',
      type: 'presentation',
      start: new Date(2024, 2, 1, 15, 0),  // Mar 1, 2024, 3:00 PM
      end: new Date(2024, 2, 1, 16, 0),    // Mar 1, 2024, 4:00 PM
      duration: '1 hora',
      location: 'Oficinas de Digital Dynamics',
      company: 'Digital Dynamics',
      project: 'Aplicación Móvil de Delivery',
      description: 'Presentación final del proyecto a los stakeholders',
      status: 'upcoming',
      priority: 'high',
    },
    {
      id: 5,
      title: 'Revisión de Código',
      type: 'review',
      start: new Date(2024, 1, 18, 16, 0), // Feb 18, 2024, 4:00 PM
      end: new Date(2024, 1, 18, 17, 0),   // Feb 18, 2024, 5:00 PM
      duration: '1 hora',
      location: 'Remoto (Discord)',
      company: 'TechCorp Solutions',
      project: 'Sistema de Gestión de Inventarios',
      description: 'Revisión del código del módulo de reportes',
      status: 'upcoming',
      priority: 'medium',
    },
  ];

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');
  const highPriorityEvents = events.filter(e => e.priority === 'high');
  const interviewEvents = events.filter(e => e.type === 'interview');

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <BusinessIcon color="primary" />;
      case 'deadline':
        return <AssignmentIcon color="error" />;
      case 'meeting':
        return <ScheduleIcon color="info" />;
      case 'presentation':
        return <EventIcon color="success" />;
      case 'review':
        return <InfoIcon color="warning" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'interview':
        return 'Entrevista';
      case 'deadline':
        return 'Entrega';
      case 'meeting':
        return 'Reunión';
      case 'presentation':
        return 'Presentación';
      case 'review':
        return 'Revisión';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const eventStyleGetter = (event: any) => {
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

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Aquí se podría implementar la creación de nuevos eventos
    console.log('Slot seleccionado:', slotInfo);
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Calendario
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Vista de mes">
            <IconButton
              color={view === 'month' ? 'primary' : 'default'}
              onClick={() => setView('month')}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista de semana">
            <IconButton
              color={view === 'week' ? 'primary' : 'default'}
              onClick={() => setView('week')}
            >
              <ViewWeekIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista de día">
            <IconButton
              color={view === 'day' ? 'primary' : 'default'}
              onClick={() => setView('day')}
            >
              <ViewDayIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista de agenda">
            <IconButton
              color={view === 'agenda' ? 'primary' : 'default'}
              onClick={() => setView('agenda')}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Barra de Resumen del Calendario */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen del Calendario
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: { xs: 'center', md: 'flex-start' }
        }}>
          {/* Próximos Eventos */}
          <Box sx={{ 
            flex: '1 1 220px',
            minWidth: 200,
            maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
          }}>
            <Card sx={{
              bgcolor: 'rgba(33, 150, 243, 0.07)',
              borderRadius: 3,
              boxShadow: 2,
              height: '100%',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" color="primary.main" fontWeight={700}>
                  {upcomingEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Próximos Eventos
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Eventos Completados */}
          <Box sx={{ 
            flex: '1 1 220px',
            minWidth: 200,
            maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
          }}>
            <Card sx={{
              bgcolor: 'rgba(76, 175, 80, 0.07)',
              borderRadius: 3,
              boxShadow: 2,
              height: '100%',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h3" color="success.main" fontWeight={700}>
                  {completedEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos Completados
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Alta Prioridad */}
          <Box sx={{ 
            flex: '1 1 220px',
            minWidth: 200,
            maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
          }}>
            <Card sx={{
              bgcolor: 'rgba(255, 152, 0, 0.07)',
              borderRadius: 3,
              boxShadow: 2,
              height: '100%',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h3" color="warning.main" fontWeight={700}>
                  {highPriorityEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alta Prioridad
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Entrevistas */}
          <Box sx={{ 
            flex: '1 1 220px',
            minWidth: 200,
            maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
          }}>
            <Card sx={{
              bgcolor: 'rgba(33, 150, 243, 0.04)',
              borderRadius: 3,
              boxShadow: 2,
              height: '100%',
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h3" color="info.main" fontWeight={700}>
                  {interviewEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entrevistas
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Calendario Interactivo */}
      <Paper sx={{ p: 3 }}>
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
            min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
            max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
            step={30}
            timeslots={2}
            tooltipAccessor={(event) => `${event.title} - ${event.company}`}
          />
        </Box>
      </Paper>

      {/* Dialog para mostrar detalles de eventos */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedEvent && getEventIcon(selectedEvent.type)}
            <Typography variant="h6">
              Detalles del Evento
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                {selectedEvent.title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3, 
                mt: 1 
              }}>
                <Box sx={{ 
                  width: { xs: '100%', md: '48%' },
                  minWidth: 300
                }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información del Evento
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getEventIcon(selectedEvent.type)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          <strong>Tipo:</strong> {getEventTypeText(selectedEvent.type)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Fecha:</strong> {format(selectedEvent.start, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Hora:</strong> {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Duración:</strong> {selectedEvent.duration}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Ubicación:</strong> {selectedEvent.location}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Prioridad:</strong>
                        </Typography>
                        <Chip
                          label={selectedEvent.priority === 'high' ? 'Alta' : selectedEvent.priority === 'medium' ? 'Media' : 'Baja'}
                          size="small"
                          color={getPriorityColor(selectedEvent.priority) as any}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ 
                  width: { xs: '100%', md: '48%' },
                  minWidth: 300
                }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Proyecto y Empresa
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Proyecto:</strong> {selectedEvent.project}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Empresa:</strong> {selectedEvent.company}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Estado:</strong> 
                        <Chip
                          label={selectedEvent.status === 'upcoming' ? 'Próximo' : 'Completado'}
                          size="small"
                          color={selectedEvent.status === 'upcoming' ? 'primary' : 'success'}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="body2">
                        <strong>Descripción:</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedEvent.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setDialogOpen(false);
              setRequestDialogOpen(true);
            }}
          >
            Solicitar cambio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para solicitar cambio */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Solicitar cambio de evento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Escribe tu solicitud o motivo para cambiar este evento. La empresa recibirá tu mensaje.
          </Typography>
          <Box component="form">
            <textarea
              style={{ 
                width: '100%', 
                minHeight: 80, 
                borderRadius: 8, 
                border: '1px solid #ccc', 
                padding: 8,
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
              value={requestText}
              onChange={e => setRequestText(e.target.value)}
              placeholder="Ejemplo: Solicito cambiar la fecha por..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setRequestDialogOpen(false);
              setShowSuccess(true);
              setRequestText('');
            }}
            disabled={!requestText.trim()}
          >
            Enviar solicitud
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 1 }}>
          <Typography color="success.main" fontWeight={600}>
            ¡Solicitud enviada a la empresa!
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
};

export default Calendar; 