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
  Add as AddIcon,
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

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'add' | 'edit' | 'delete' | null>(null);

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
    setActionType(type);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAction(null, 'add')}
        >
          Agregar Evento
        </Button>
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
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(event, 'edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleAction(event, 'delete')}
                      >
                        <DeleteIcon />
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

      {/* Estadísticas */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen del Calendario
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33%' }, mb: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {upcomingEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Próximos Eventos
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33%' }, mb: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {completedEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos Completados
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33%' }, mb: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {events.filter(e => e.priority === 'high').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alta Prioridad
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33%' }, mb: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {events.filter(e => e.type === 'interview').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entrevistas
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Dialog para mostrar/editar eventos */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Detalles del Evento'}
          {actionType === 'add' && 'Agregar Nuevo Evento'}
          {actionType === 'edit' && 'Editar Evento'}
          {actionType === 'delete' && 'Eliminar Evento'}
        </DialogTitle>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Fecha:</strong> {selectedEvent.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Hora:</strong> {selectedEvent.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Duración:</strong> {selectedEvent.duration}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Ubicación:</strong> {selectedEvent.location}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '48%' }, mb: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información del Proyecto
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Empresa:</strong> {selectedEvent.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Proyecto:</strong> {selectedEvent.project}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getStatusIcon(selectedEvent.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          <strong>Estado:</strong> {selectedEvent.status === 'upcoming' ? 'Próximo' : 'Completado'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={selectedEvent.priority === 'high' ? 'Alta' : selectedEvent.priority === 'medium' ? 'Media' : 'Baja'}
                          size="small"
                          color={getPriorityColor(selectedEvent.priority) as any}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Descripción
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{selectedEvent.description}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {actionType === 'edit' && (
            <Button variant="contained" color="primary">
              Guardar Cambios
            </Button>
          )}
          {actionType === 'delete' && (
            <Button variant="contained" color="error">
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 