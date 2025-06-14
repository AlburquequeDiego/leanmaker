import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  Button,
  Dialog,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';

export const Notifications = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // donde se supone ue tiene que estar la notificacion
  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'Aplicación Aceptada',
      message: 'Tu aplicación para el proyecto "Sistema de Gestión de Inventarios" ha sido aceptada.',
      company: 'TechCorp Solutions',
      date: '2024-01-20',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'project',
      title: 'Nuevo Proyecto Disponible',
      message: 'Hay un nuevo proyecto que coincide con tus habilidades: "Aplicación Móvil de Delivery".',
      company: 'Digital Dynamics',
      date: '2024-01-19',
      read: true,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'evaluation',
      title: 'Evaluación Recibida',
      message: 'Has recibido una evaluación de 4.5/5 estrellas por tu trabajo en el proyecto anterior.',
      company: 'TechCorp Solutions',
      date: '2024-01-18',
      read: false,
      priority: 'high',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Recordatorio de Entrega',
      message: 'Recuerda que tienes una entrega pendiente para el proyecto actual.',
      company: 'InnovateLab',
      date: '2024-01-17',
      read: true,
      priority: 'low',
    },
  ];

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
  };

  const handleMarkAsRead = (notificationId: number) => {
    // Aquí se implementaría la lógica para marcar como leída
    console.log('Marcando como leída:', notificationId);
  };

  const handleDeleteNotification = (notificationId: number) => {
    // Aquí se implementaría la lógica para eliminar
    console.log('Eliminando notificación:', notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <AssignmentIcon color="primary" />;
      case 'project':
        return <BusinessIcon color="info" />;
      case 'evaluation':
        return <CheckCircleIcon color="success" />;
      case 'reminder':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="action" />;
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Notificaciones
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
              <NotificationsIcon />
            </Badge>
          )}
        </Typography>
        <Button variant="outlined" startIcon={<MarkEmailReadIcon />}>
          Marcar Todas como Leídas
        </Button>
      </Box>

      <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
        <List>
          {notifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                  cursor: 'pointer',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority === 'high' ? 'Alta' : notification.priority === 'medium' ? 'Media' : 'Baja'}
                        size="small"
                        color={getPriorityColor(notification.priority) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.company} • {notification.date}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Dialog para mostrar detalles de la notificación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedNotification && (
          <Box sx={{ p: 2, pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'background.paper', width: 56, height: 56, boxShadow: 2 }}>
                {getNotificationIcon(selectedNotification.type)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedNotification.title}
                </Typography>
                <Chip
                  label={selectedNotification.priority === 'high' ? 'Alta' : selectedNotification.priority === 'medium' ? 'Media' : 'Baja'}
                  size="small"
                  color={getPriorityColor(selectedNotification.priority) as any}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
              {selectedNotification.message}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                p: 2,
                mb: 2,
                alignItems: { sm: 'center' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" color="info" />
                <Typography variant="body2" color="text.secondary">
                  {selectedNotification.company}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {selectedNotification.date}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" color={getPriorityColor(selectedNotification.priority) as any} />
                <Typography variant="body2" color="text.secondary">
                  Prioridad: {selectedNotification.priority === 'high' ? 'Alta' : selectedNotification.priority === 'medium' ? 'Media' : 'Baja'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                variant="outlined"
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                Cerrar
              </Button>
              {!selectedNotification.read && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setDialogOpen(false);
                  }}
                  variant="contained"
                  sx={{ minWidth: 160, borderRadius: 2 }}
                >
                  Marcar como Leída
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Notifications; 