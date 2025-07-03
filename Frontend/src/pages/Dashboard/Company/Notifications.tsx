import React, { useState, useMemo, useEffect } from 'react';
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
  CircularProgress,
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
import { apiService } from '../../../services/api.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  category: 'project' | 'application' | 'interview' | 'evaluation' | 'system';
}

export const CompanyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const data = await apiService.get('/api/notifications/');
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
      setLoading(false);
    }
    fetchNotifications();
  }, []);

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

  const markAsRead = async (id: string) => {
    try {
      await apiService.patch(`/api/notifications/${id}/`, { read: true });
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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
          {loading ? (
            <CircularProgress />
          ) : (
            displayedNotifications.map((notification, index) => (
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
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
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
                  Fecha: {new Date(selectedNotification.created_at).toLocaleString()}
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
