import { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export default function TeacherCalendar() {
  const [events] = useState([
    {
      id: '1',
      title: 'Reunión con Ana García',
      description: 'Revisión de progreso del proyecto Sistema de Gestión',
      date: '2024-01-25',
      time: '10:00',
      type: 'meeting',
      student: 'Ana García',
    },
    {
      id: '2',
      title: 'Evaluación de Carlos López',
      description: 'Evaluación del proyecto Sistema de Gestión Empresarial',
      date: '2024-01-26',
      time: '14:00',
      type: 'evaluation',
      student: 'Carlos López',
    },
    {
      id: '3',
      title: 'Seguimiento María Rodríguez',
      description: 'Seguimiento del proyecto Análisis de Datos',
      date: '2024-01-28',
      time: '16:00',
      type: 'followup',
      student: 'María Rodríguez',
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'primary';
      case 'evaluation': return 'warning';
      case 'followup': return 'info';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting': return 'Reunión';
      case 'evaluation': return 'Evaluación';
      case 'followup': return 'Seguimiento';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          📅 Calendario Académico
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus citas, evaluaciones y seguimientos con estudiantes.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Resumen */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                📊 Resumen
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total eventos:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {events.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Esta semana:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  3
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Evaluaciones pendientes:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  1
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de eventos */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  📋 Próximos Eventos
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Nuevo Evento
                </Button>
              </Box>
              <List>
                {events.map((event, index) => (
                  <Box key={event.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: `${getTypeColor(event.type)}.main` }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} component="span">
                            <Typography variant="subtitle1" fontWeight={600} component="span">
                              {event.title}
                            </Typography>
                            <Chip 
                              label={getTypeLabel(event.type)}
                              color={getTypeColor(event.type) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="span">
                              {event.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} component="span">
                              <Typography variant="caption" color="text.secondary" component="span">
                                📅 {new Date(event.date).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span">
                                🕐 {event.time}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span">
                                👤 {event.student}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < events.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}