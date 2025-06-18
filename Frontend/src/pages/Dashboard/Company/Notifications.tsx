import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  category: 'project' | 'application' | 'interview' | 'evaluation' | 'system';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva Postulación',
    message: 'Juan Pérez ha postulado al proyecto "Desarrollo Web Frontend"',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T10:30:00Z',
    category: 'application',
  },
  {
    id: '2',
    title: 'Entrevista Programada',
    message: 'Entrevista con María González para el proyecto "App Móvil" - 20/01/2024 15:00',
    type: 'success',
    read: false,
    createdAt: '2024-01-15T09:15:00Z',
    category: 'interview',
  },
  {
    id: '3',
    title: 'Proyecto Completado',
    message: 'El proyecto "Sistema de Inventario" ha sido completado exitosamente',
    type: 'success',
    read: true,
    createdAt: '2024-01-14T16:45:00Z',
    category: 'project',
  },
  {
    id: '4',
    title: 'Evaluación Pendiente',
    message: 'Debe evaluar el desempeño de Carlos Rodríguez en el proyecto "API REST"',
    type: 'warning',
    read: false,
    createdAt: '2024-01-14T14:20:00Z',
    category: 'evaluation',
  },
  {
    id: '5',
    title: 'Mantenimiento Programado',
    message: 'La plataforma estará en mantenimiento el 22/01/2024 de 02:00 a 04:00',
    type: 'info',
    read: true,
    createdAt: '2024-01-13T11:00:00Z',
    category: 'system',
  },
  {
    id: '6',
    title: 'Actualización de Proyecto',
    message: 'Se han actualizado los requisitos del proyecto "Desarrollo Móvil". Por favor revise los cambios.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'project',
  },
  {
    id: '7',
    title: 'Recordatorio de Evaluación',
    message: 'Mañana vence el plazo para evaluar a los estudiantes del proyecto "E-commerce"',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'evaluation',
  },
  {
    id: '8',
    title: 'Postulación Aceptada',
    message: 'La postulación de Ana Martínez al proyecto "Dashboard Analytics" ha sido aceptada',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'application',
  },
  {
    id: '9',
    title: 'Cambio de Horario',
    message: 'La entrevista con Pedro Sánchez ha sido reprogramada para el 25/01/2024 a las 14:30',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'interview',
  },
  {
    id: '10',
    title: 'Nuevo Mensaje',
    message: 'Ha recibido un mensaje del coordinador académico sobre el proyecto "Sistema de Gestión"',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'system',
  },
  {
    id: '11',
    title: 'Finalización de Práctica',
    message: 'La práctica de Luis Torres en el proyecto "API Gateway" finaliza en 7 días',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'project',
  },
  {
    id: '12',
    title: 'Evaluación Completada',
    message: 'Se ha completado la evaluación mensual del proyecto "Sistema de Reservas"',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'evaluation',
  },
  {
    id: '13',
    title: 'Nueva Documentación',
    message: 'Se ha agregado nueva documentación al proyecto "CRM Empresarial"',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'project',
  },
  {
    id: '14',
    title: 'Solicitud de Reunión',
    message: 'El estudiante Roberto Méndez solicita una reunión para discutir el avance del proyecto',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'system',
  },
  {
    id: '15',
    title: 'Recordatorio de Entrevista',
    message: 'Mañana tiene una entrevista programada con Carolina Díaz a las 11:00',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'interview',
  }
];

export const CompanyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'project':
        return <AssignmentIcon />;
      case 'application':
        return <PeopleIcon />;
      case 'interview':
        return <EventIcon />;
      case 'evaluation':
        return <CheckCircleIcon />;
      case 'system':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'info':
        return 'Información';
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return type;
    }
  };

  const getNotificationCategoryLabel = (category: string) => {
    switch (category) {
      case 'project':
        return 'Proyecto';
      case 'application':
        return 'Postulación';
      case 'interview':
        return 'Entrevista';
      case 'evaluation':
        return 'Evaluación';
      case 'system':
        return 'Sistema';
      default:
        return category;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleCloseDialog = () => {
    setSelectedNotification(null);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const displayedNotifications = useMemo(() => {
    return displayCount === -1 ? notifications : notifications.slice(0, displayCount);
  }, [notifications, displayCount]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Notificaciones
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select
              value={displayCount}
              label="Mostrar"
              onChange={(e) => setDisplayCount(Number(e.target.value))}
            >
              <MenuItem value={5}>5 últimas</MenuItem>
              <MenuItem value={10}>10 últimas</MenuItem>
              <MenuItem value={15}>15 últimas</MenuItem>
              <MenuItem value={20}>20 últimas</MenuItem>
              <MenuItem value={30}>30 últimas</MenuItem>
              <MenuItem value={-1}>Todas</MenuItem>
            </Select>
          </FormControl>
          <Chip
            label={`${unreadCount} sin leer`}
            color="primary"
          />
        </Box>
      </Box>

      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <List>
          {displayedNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem
                sx={{
                  border: notification.read ? 'none' : '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: notification.read ? 'background.paper' : 'primary.50',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    cursor: 'pointer',
                  },
                }}
                onClick={() => handleNotificationClick(notification)}
                secondaryAction={
                  !notification.read && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      sx={{ mr: 1 }}
                      title="Marcar como leída"
                    >
                      <MarkEmailReadIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: `${getNotificationColor(notification.type)}.main`,
                    width: 48,
                    height: 48,
                  }}>
                    {getNotificationIcon(notification.category)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={getNotificationTypeLabel(notification.type)}
                        color={getNotificationColor(notification.type) as any}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ 
                          mb: 0.5,
                          fontWeight: notification.read ? 'normal' : 'medium'
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: 'block',
                          fontStyle: 'italic'
                        }}
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Diálogo de detalles de la notificación */}
      <Dialog 
        open={!!selectedNotification} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${getNotificationColor(selectedNotification.type)}.main`,
                  width: 40,
                  height: 40,
                }}>
                  {getNotificationIcon(selectedNotification.category)}
                </Avatar>
                <Typography variant="h6">
                  {selectedNotification.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getNotificationTypeLabel(selectedNotification.type)}
                    color={getNotificationColor(selectedNotification.type) as any}
                    size="small"
                  />
                  <Chip
                    label={getNotificationCategoryLabel(selectedNotification.category)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {selectedNotification.message}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estado: {selectedNotification.read ? 'Leída' : 'No leída'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {new Date(selectedNotification.createdAt).toLocaleString()}
                </Typography>
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

export default CompanyNotifications;
