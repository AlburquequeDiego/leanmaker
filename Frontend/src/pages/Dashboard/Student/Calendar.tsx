import { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data for calendar events
  const events = [
    {
      id: 1,
      title: 'Entrevista con TechCorp Solutions',
      type: 'interview',
      date: '2024-02-15',
      time: '10:00 AM',
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
      date: '2024-02-20',
      time: '11:59 PM',
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
      date: '2024-02-12',
      time: '2:00 PM',
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
      date: '2024-03-01',
      time: '3:00 PM',
      duration: '1 hora',
      location: 'Oficinas de Digital Dynamics',
      company: 'Digital Dynamics',
      project: 'Aplicación Móvil de Delivery',
      description: 'Presentación final del proyecto a los stakeholders',
      status: 'upcoming',
      priority: 'high',
    },
  ];

  const handleAction = (event: any, type: 'view' | 'add' | 'edit' | 'delete') => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <ScheduleIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Calendario
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Próximos Eventos */}
        <Box sx={{ width: { xs: '100%', md: '48%' }, mb: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Próximos Eventos ({upcomingEvents.length})
            </Typography>
            <List>
              {upcomingEvents.map((event, index) => (
                <Box key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getEventIcon(event.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Chip
                            label={getEventTypeText(event.type)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Media' : 'Baja'}
                            size="small"
                            color={getPriorityColor(event.priority) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.date} • {event.time} • {event.duration}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.company} • {event.project}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(event, 'view')}
                      >
                        <EventIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Eventos Completados */}
        <Box sx={{ width: { xs: '100%', md: '48%' }, mb: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Eventos Completados ({completedEvents.length})
            </Typography>
            <List>
              {completedEvents.map((event, index) => (
                <Box key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getEventIcon(event.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Chip
                            label={getEventTypeText(event.type)}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.date} • {event.time} • {event.duration}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.company} • {event.project}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleAction(event, 'view')}
                    >
                      <EventIcon />
                    </IconButton>
                  </ListItem>
                  {index < completedEvents.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Estadísticas mejoradas */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen del Calendario
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: { xs: 'center', md: 'flex-start' },
        }}>
          {/* Próximos Eventos */}
          <Box sx={{
            flex: '1 1 220px',
            minWidth: 200,
            bgcolor: 'rgba(33, 150, 243, 0.07)',
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}>
            <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h3" color="primary.main" fontWeight={700}>
              {upcomingEvents.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Próximos Eventos
            </Typography>
          </Box>
          {/* Eventos Completados */}
          <Box sx={{
            flex: '1 1 220px',
            minWidth: 200,
            bgcolor: 'rgba(76, 175, 80, 0.07)',
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {completedEvents.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eventos Completados
            </Typography>
          </Box>
          {/* Alta Prioridad */}
          <Box sx={{
            flex: '1 1 220px',
            minWidth: 200,
            bgcolor: 'rgba(255, 152, 0, 0.07)',
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}>
            <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h3" color="warning.main" fontWeight={700}>
              {events.filter(e => e.priority === 'high').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alta Prioridad
            </Typography>
          </Box>
          {/* Entrevistas */}
          <Box sx={{
            flex: '1 1 220px',
            minWidth: 200,
            bgcolor: 'rgba(33, 150, 243, 0.04)',
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}>
            <BusinessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h3" color="info.main" fontWeight={700}>
              {events.filter(e => e.type === 'interview').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entrevistas
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dialog para mostrar detalles de eventos y solicitar cambio */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Evento</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ width: { xs: '100%', md: '48%' }, mb: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información del Evento
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getEventIcon(selectedEvent.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          <strong>Tipo:</strong> {getEventTypeText(selectedEvent.type)}
                        </Typography>
                      </Box>
                      <Typography variant="body2"><strong>Fecha:</strong> {selectedEvent.date}</Typography>
                      <Typography variant="body2"><strong>Hora:</strong> {selectedEvent.time}</Typography>
                      <Typography variant="body2"><strong>Duración:</strong> {selectedEvent.duration}</Typography>
                      <Typography variant="body2"><strong>Ubicación:</strong> {selectedEvent.location}</Typography>
                      <Typography variant="body2"><strong>Prioridad:</strong> {selectedEvent.priority === 'high' ? 'Alta' : selectedEvent.priority === 'medium' ? 'Media' : 'Baja'}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '48%' }, mb: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Proyecto y Empresa
                      </Typography>
                      <Typography variant="body2"><strong>Proyecto:</strong> {selectedEvent.project}</Typography>
                      <Typography variant="body2"><strong>Empresa:</strong> {selectedEvent.company}</Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}><strong>Descripción:</strong> {selectedEvent.description}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cerrar</Button>
          <Button variant="contained" color="primary" onClick={() => setRequestDialogOpen(true)}>
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
              style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #ccc', padding: 8 }}
              value={requestText}
              onChange={e => setRequestText(e.target.value)}
              placeholder="Ejemplo: Solicito cambiar la fecha por..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancelar</Button>
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