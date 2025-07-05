import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle, Box, Typography, IconButton } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  maxNotifications?: number;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onClose,
  maxNotifications = 5
}) => {
  const [openNotifications, setOpenNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Mostrar nuevas notificaciones automáticamente
    notifications.forEach(notification => {
      if (!openNotifications.has(notification.id)) {
        setOpenNotifications(prev => new Set(prev).add(notification.id));
      }
    });
  }, [notifications, openNotifications]);

  const handleClose = (id: string) => {
    setOpenNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    onClose(id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Hace 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;
    
    return timestamp.toLocaleTimeString();
  };

  // Mostrar solo las últimas notificaciones
  const recentNotifications = notifications
    .filter(n => openNotifications.has(n.id))
    .slice(-maxNotifications);

  return (
    <>
      {recentNotifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={openNotifications.has(notification.id)}
          autoHideDuration={notification.autoHide !== false ? (notification.duration || 6000) : null}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 1 }}
        >
          <Alert
            severity={notification.type}
            icon={getNotificationIcon(notification.type)}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => handleClose(notification.id)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ 
              width: '100%',
              minWidth: 300,
              maxWidth: 400,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box>
              <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
                {notification.title}
              </AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(notification.timestamp)}
              </Typography>
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

// Hook para manejar notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Limpiar notificaciones antiguas (más de 10)
    if (notifications.length > 10) {
      setNotifications(prev => prev.slice(-10));
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}; 