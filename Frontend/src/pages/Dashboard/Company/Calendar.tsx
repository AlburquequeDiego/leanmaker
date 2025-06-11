import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'interview' | 'meeting' | 'deadline' | 'evaluation';
  status: 'upcoming' | 'completed' | 'cancelled';
  projectId?: string;
  projectTitle?: string;
  studentId?: string;
  studentName?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Entrevista con Juan Pérez',
    description: 'Entrevista técnica para proyecto Frontend',
    date: '2024-01-20',
    time: '15:00',
    duration: 60,
    type: 'interview',
    status: 'upcoming',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    studentId: '1',
    studentName: 'Juan Pérez',
  },
  {
    id: '2',
    title: 'Reunión de Proyecto API',
    description: 'Revisión de avances del proyecto API REST',
    date: '2024-01-22',
    time: '10:00',
    duration: 30,
    type: 'meeting',
    status: 'upcoming',
    projectId: '2',
    projectTitle: 'API REST con Django',
  },
  {
    id: '3',
    title: 'Evaluación de María González',
    description: 'Evaluación de desempeño del proyecto móvil',
    date: '2024-01-25',
    time: '14:00',
    duration: 45,
    type: 'evaluation',
    status: 'upcoming',
    projectId: '3',
    projectTitle: 'App Móvil React Native',
    studentId: '2',
    studentName: 'María González',
  },
  {
    id: '4',
    title: 'Deadline Proyecto Frontend',
    description: 'Fecha límite para entrega del proyecto',
    date: '2024-01-30',
    time: '23:59',
    duration: 0,
    type: 'deadline',
    status: 'upcoming',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
  },
];

export const CompanyCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    type: 'meeting',
    status: 'upcoming',
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <VideoCallIcon />;
      case 'meeting':
        return <EventIcon />;
      case 'deadline':
        return <AssignmentIcon />;
      case 'evaluation':
        return <AssessmentIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'primary';
      case 'meeting':
        return 'info';
      case 'deadline':
        return 'warning';
      case 'evaluation':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleAddEvent = () => {
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title || '',
      description: newEvent.description || '',
      date: newEvent.date || '',
      time: newEvent.time || '',
      duration: newEvent.duration || 30,
      type: newEvent.type || 'meeting',
      status: newEvent.status || 'upcoming',
      projectId: newEvent.projectId,
      projectTitle: newEvent.projectTitle,
      studentId: newEvent.studentId,
      studentName: newEvent.studentName,
    };
    setEvents(prev => [event, ...prev]);
    setShowAddDialog(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      type: 'meeting',
      status: 'upcoming',
    });
  };

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const completedEvents = events.filter(event => event.status === 'completed');

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Calendario de Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Agregar Evento
        </Button>
      </Box>

      {/* Próximos Eventos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Próximos Eventos ({upcomingEvents.length})
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: `${getEventColor(event.type)}.light`,
                    color: `${getEventColor(event.type)}.main`,
                    mr: 2 
                  }}>
                    {getEventIcon(event.type)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()} - {event.time}
                    </Typography>
                    <Chip
                      label={event.type}
                      color={getEventColor(event.type) as any}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {event.description}
                </Typography>

                {event.projectTitle && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Proyecto:</strong> {event.projectTitle}
                  </Typography>
                )}

                {event.studentName && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Estudiante:</strong> {event.studentName}
                  </Typography>
                )}

                {event.duration > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Duración:</strong> {event.duration} minutos
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {upcomingEvents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay eventos próximos
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Eventos Completados */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Eventos Recientes ({completedEvents.length})
        </Typography>
        
        <List>
          {completedEvents.slice(0, 5).map((event) => (
            <React.Fragment key={event.id}>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: `${getEventColor(event.type)}.light`,
                    color: `${getEventColor(event.type)}.main`,
                  }}>
                    {getEventIcon(event.type)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.date).toLocaleDateString()} - {event.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  label="Completado"
                  color="success"
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {completedEvents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No hay eventos completados recientemente
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog para agregar evento */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nuevo Evento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Título del Evento"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="time"
                label="Hora"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Duración (minutos)"
                value={newEvent.duration}
                onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                inputProps={{ min: 0 }}
              />
              <FormControl fullWidth>
                <InputLabel>Tipo de Evento</InputLabel>
                <Select
                  value={newEvent.type}
                  label="Tipo de Evento"
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                >
                  <MenuItem value="meeting">Reunión</MenuItem>
                  <MenuItem value="interview">Entrevista</MenuItem>
                  <MenuItem value="evaluation">Evaluación</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddEvent}
            variant="contained"
            disabled={!newEvent.title || !newEvent.date || !newEvent.time}
          >
            Agregar Evento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyCalendar; 