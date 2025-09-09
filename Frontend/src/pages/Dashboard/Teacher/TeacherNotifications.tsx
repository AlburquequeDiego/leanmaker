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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export default function TeacherNotifications() {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Nueva evaluación pendiente',
      message: 'Tienes una evaluación pendiente para Ana García en el proyecto "Sistema de Gestión Empresarial"',
      type: 'evaluation',
      priority: 'high',
      date: '2024-01-21T10:00:00Z',
      read: false,
    },
    {
      id: '2',
      title: 'Proyecto completado',
      message: 'El proyecto "Aplicación Mobile React Native" ha sido completado por Carlos López',
      type: 'project',
      priority: 'medium',
      date: '2024-01-20T16:30:00Z',
      read: false,
    },
    {
      id: '3',
      title: 'Nuevo estudiante asignado',
      message: 'María Rodríguez ha sido asignada al proyecto "Análisis de Datos con Python"',
      type: 'student',
      priority: 'low',
      date: '2024-01-20T14:15:00Z',
      read: true,
    },
    {
      id: '4',
      title: 'Recordatorio de evaluación',
      message: 'Recuerda completar la evaluación de Ana García antes del 25 de enero',
      type: 'reminder',
      priority: 'medium',
      date: '2024-01-19T09:00:00Z',
      read: true,
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'evaluation': return <AssignmentIcon />;
      case 'project': return <AssignmentIcon />;
      case 'student': return <PersonIcon />;
      case 'reminder': return <ScheduleIcon />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          🔔 Notificaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Mantente al día con las actividades de tus estudiantes y proyectos.
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
                  Total:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {notifications.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No leídas:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {notifications.filter(n => !n.read).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Alta prioridad:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {notifications.filter(n => n.priority === 'high').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de notificaciones */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                📋 Todas las Notificaciones
              </Typography>
              <List>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getTypeIcon(notification.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} component="span">
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.priority}
                              color={getPriorityColor(notification.priority) as any}
                              size="small"
                            />
                            {!notification.read && (
                              <Chip 
                                label="Nueva"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="span">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span" display="block">
                              {new Date(notification.date).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
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