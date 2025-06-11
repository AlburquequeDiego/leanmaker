import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
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
];

export const CompanyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    category: 'system' as const,
  });

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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const sendNotification = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notification, ...prev]);
    setShowSendDialog(false);
    setNewNotification({ title: '', message: '', type: 'info', category: 'system' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Notificaciones
        </Typography>
        <Box>
          <Chip
            label={`${unreadCount} sin leer`}
            color="primary"
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setShowSendDialog(true)}
          >
            Enviar Notificación
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                border: notification.read ? 'none' : '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                mb: 1,
                bgcolor: notification.read ? 'transparent' : 'primary.50',
              }}
              secondaryAction={
                <Box>
                  {!notification.read && (
                    <IconButton
                      edge="end"
                      onClick={() => markAsRead(notification.id)}
                      sx={{ mr: 1 }}
                    >
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => deleteNotification(notification.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                  {getNotificationIcon(notification.category)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.type}
                      color={getNotificationColor(notification.type) as any}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Dialog para enviar notificación */}
      <Dialog open={showSendDialog} onClose={() => setShowSendDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Enviar Notificación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Título"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newNotification.type}
                  label="Tipo"
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="info">Información</MenuItem>
                  <MenuItem value="success">Éxito</MenuItem>
                  <MenuItem value="warning">Advertencia</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={newNotification.category}
                  label="Categoría"
                  onChange={(e) => setNewNotification(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <MenuItem value="project">Proyecto</MenuItem>
                  <MenuItem value="application">Postulación</MenuItem>
                  <MenuItem value="interview">Entrevista</MenuItem>
                  <MenuItem value="evaluation">Evaluación</MenuItem>
                  <MenuItem value="system">Sistema</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mensaje"
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSendDialog(false)}>Cancelar</Button>
          <Button onClick={sendNotification} variant="contained">
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyNotifications;
