import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/notification.service';
import type { Notification } from '../../services/notification.service';

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  // Cargar notificaciones y conteo no leído
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationService.getNotifications({ limit: 10 }),
        notificationService.getUnreadCount()
      ]);

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data);
      }
      
      if (unreadResponse.success) {
        setUnreadCount(unreadResponse.data.unread_count);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al abrir el popover
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Cargar conteo no leído al montar el componente
  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no está leída
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Llamar callback si existe
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        await notificationService.markMultipleAsRead(
          unreadNotifications.map(n => n.id)
        );
        
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Actualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Recalcular conteo no leído
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay notificaciones
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          backgroundColor: notification.read ? 'transparent' : 'action.hover',
                          '&:hover': {
                            backgroundColor: 'action.selected'
                          },
                          cursor: 'pointer'
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: notification.read ? 'normal' : 'bold',
                                  flex: 1
                                }}
                              >
                                {notification.title}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {notification.message}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={notification.type}
                                  size="small"
                                  color={getNotificationColor(notification.type) as any}
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(notification.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}; 