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
  Alert,
  Fade,
  Slide,
  Zoom,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  NotificationsActive as NotificationsActiveIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Group as GroupIcon,
  Announcement as AnnouncementIcon,
  Campaign as CampaignIcon,
  Celebration as CelebrationIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/notification.service';
import type { Notification } from '../../services/notification.service';
import { EventNotificationCard } from './EventNotificationCard';
import { EventNotificationModal } from './EventNotificationModal';

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ notification: Notification; eventId: string } | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  // Log cuando el componente se monta
  useEffect(() => {
    console.log('🚀 NotificationCenter montado');
  }, []);

  // Cargar notificaciones y conteo no leído
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando notificaciones...');
      
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationService.getNotifications({ limit: 10 }),
        notificationService.getUnreadCount()
      ]);

      console.log('📨 Respuesta de notificaciones:', notificationsResponse);
      console.log('📨 Respuesta de conteo no leído:', unreadResponse);

      if (notificationsResponse.success) {
        console.log('✅ Notificaciones cargadas:', notificationsResponse.data);
        setNotifications(notificationsResponse.data);
      } else {
        console.error('❌ Error al cargar notificaciones:', notificationsResponse);
      }
      
      if (unreadResponse.success) {
        console.log('✅ Conteo no leído cargado:', unreadResponse.data);
        setUnreadCount(unreadResponse.data.unread_count);
      } else {
        console.error('❌ Error al cargar conteo no leído:', unreadResponse);
      }
    } catch (err) {
      console.error('❌ Error loading notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al abrir el popover
  useEffect(() => {
    if (open) {
      console.log('🔓 Popover abierto, cargando notificaciones...');
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

  const handleEventClick = (notification: Notification) => {
    // Para eventos, no abrimos modal, solo marcamos como leída
    if (!notification.read) {
      handleNotificationClick(notification);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
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

  // Mejorada función de iconos con más tipos específicos
  const getNotificationIcon = (type: string, priority?: string) => {
    // Iconos específicos por tipo de contenido
    if (type.includes('event') || type.includes('meeting')) {
      return <EventIcon color="primary" />;
    }
    if (type.includes('project') || type.includes('assignment')) {
      return <AssignmentIcon color="secondary" />;
    }
    if (type.includes('company') || type.includes('business')) {
      return <BusinessIcon color="info" />;
    }
    if (type.includes('announcement') || type.includes('campaign')) {
      return <AnnouncementIcon color="warning" />;
    }
    if (type.includes('celebration') || type.includes('achievement')) {
      return <CelebrationIcon color="success" />;
    }
    
    // Iconos por tipo de notificación
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'urgent':
        return <PriorityHighIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    // Prioridad alta sobrescribe el tipo
    if (priority === 'urgent' || priority === 'high') {
      return 'error';
    }
    
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'urgent':
        return 'error';
      default:
        return 'info';
    }
  };

  // Función para obtener el color de fondo según prioridad
  const getNotificationBackground = (read: boolean, priority?: string) => {
    if (!read) {
      if (priority === 'urgent') {
        return 'error.light';
      }
      if (priority === 'high') {
        return 'warning.light';
      }
      return 'action.hover';
    }
    return 'transparent';
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

  // Función para obtener el texto de prioridad
  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  return (
    <>
      {/* Log de renderizado */}
      {console.log('🎨 NotificationCenter renderizando con', notifications.length, 'notificaciones')}
      
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          ml: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }
              }
            }
          }}
        >
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
            width: 450,
            maxHeight: 600,
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '2px solid',
            borderColor: 'divider'
          }
        }}
        slotProps={{
          paper: {
            onLoad: () => console.log('📋 Popover cargado')
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Log de contenido del popover */}
          {console.log('📋 Contenido del popover renderizando')}
          
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notificaciones
              </Typography>
              {unreadCount > 0 && (
                <Chip 
                  label={unreadCount} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1, fontWeight: 'bold' }}
                />
              )}
            </Box>
            {unreadCount > 0 && (
              <Tooltip title="Marcar todas como leídas">
                <Button
                  size="small"
                  startIcon={<MarkReadIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  Marcar leídas
                </Button>
              </Tooltip>
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={32} />
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
                <Fade in={true} timeout={500}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No hay notificaciones
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <>
                  {/* Mensaje de debug */}
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      🔍 Debug: Procesando {notifications.length} notificaciones
                    </Typography>
                  </Alert>
                  
                  <List sx={{ p: 0 }}>
                    {/* Log de lista de notificaciones */}
                    {console.log('📋 Lista de notificaciones renderizando con', notifications.length, 'notificaciones')}
                    
                    {notifications.map((notification, index) => {
                      // Debug: Log para verificar todas las notificaciones
                      console.log(`🔍 Notificación ${index + 1}:`, {
                        id: notification.id,
                        title: notification.title,
                        type: notification.type,
                        message: notification.message,
                        read: notification.read
                      });
                      
                      // Verificar si es una notificación de evento
                      const isEventNotification = notification.type === 'event' ||
                                                 (notification.title && notification.title.toLowerCase().includes('evento')) || 
                                                 (notification.title && notification.title.toLowerCase().includes('reunión')) ||
                                                 (notification.title && notification.title.toLowerCase().includes('entrevista')) ||
                                                 (notification.title && notification.title.toLowerCase().includes('invitación')) ||
                                                 (notification.message && notification.message.toLowerCase().includes('evento')) ||
                                                 (notification.message && notification.message.toLowerCase().includes('reunión')) ||
                                                 (notification.message && notification.message.toLowerCase().includes('entrevista')) ||
                                                 (notification.message && notification.message.toLowerCase().includes('invitación'));
                      
                      // Debug: Log para verificar detección de eventos
                      if (isEventNotification) {
                        console.log('🎯 EVENTO DETECTADO:', notification.title, 'Type:', notification.type, 'Message:', notification.message);
                      }
                      
                      return (
                        <Fade in={true} timeout={300 + (index * 100)} key={notification.id}>
                          {/* Log de renderizado de notificación */}
                          {console.log(`📋 Renderizando notificación ${index + 1}:`, notification.title)}
                          
                          <React.Fragment>
                            {isEventNotification ? (
                              // Usar componente especial para eventos
                              <Box sx={{ px: 1, py: 0.5 }}>
                                {/* Log de renderizado de EventNotificationCard */}
                                {console.log(`🎯 Renderizando EventNotificationCard para evento:`, notification.title)}
                                
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                  🐛 Debug: Renderizando EventNotificationCard para evento
                                </Typography>
                                <EventNotificationCard
                                  notification={notification}
                                  onStatusChange={(notificationId, newStatus) => {
                                    // Actualizar estado local si es necesario
                                    console.log(`Notification ${notificationId} status changed to ${newStatus}`);
                                  }}
                                  onClose={() => handleEventClick(notification)}
                                />
                                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                                  ✅ EventNotificationCard renderizado exitosamente
                                </Typography>
                              </Box>
                            ) : (
                            // Usar componente normal para otras notificaciones
                            <ListItem
                              sx={{
                                backgroundColor: getNotificationBackground(notification.read, notification.priority),
                                borderRadius: 1,
                                mb: 1,
                                transition: 'all 0.3s ease-in-out',
                                border: notification.read ? 'none' : '2px solid',
                                borderColor: notification.priority === 'urgent' ? 'error.main' : 
                                            notification.priority === 'high' ? 'warning.main' : 'transparent',
                                '&:hover': {
                                  backgroundColor: 'action.selected',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                },
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': notification.read ? {} : {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  backgroundColor: notification.priority === 'urgent' ? 'error.main' : 
                                                notification.priority === 'high' ? 'warning.main' : 'primary.main'
                                }
                              }}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <Zoom in={true} timeout={400 + (index * 100)}>
                                  {getNotificationIcon(notification.type, notification.priority)}
                                </Zoom>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: notification.read ? 400 : 600,
                                        flex: 1,
                                        color: notification.read ? 'text.primary' : 'text.primary',
                                        lineHeight: 1.4
                                      }}
                                    >
                                      {notification.title}
                                    </Typography>
                                    <Tooltip title="Eliminar notificación">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteNotification(notification.id);
                                        }}
                                        sx={{ 
                                          ml: 1,
                                          opacity: 0.6,
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': {
                                            opacity: 1,
                                            transform: 'scale(1.05)',
                                            color: 'error.main'
                                          }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ 
                                        mb: 1.5,
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {notification.message}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                          label={notification.type}
                                          size="small"
                                          color={getNotificationColor(notification.type, notification.priority) as any}
                                          variant="outlined"
                                          sx={{ 
                                            fontSize: '0.7rem',
                                            height: 20,
                                            '& .MuiChip-label': { px: 1 }
                                          }}
                                        />
                                        {notification.priority && notification.priority !== 'normal' && (
                                          <Chip
                                            label={getPriorityText(notification.priority)}
                                            size="small"
                                            color={notification.priority === 'urgent' ? 'error' : 
                                                   notification.priority === 'high' ? 'warning' : 'default'}
                                            variant="filled"
                                            sx={{ 
                                              fontSize: '0.7rem',
                                              height: 20,
                                              '& .MuiChip-label': { px: 1 }
                                            }}
                                          />
                                        )}
                                      </Box>
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {formatDate(notification.created_at)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItem>
                          )}
                          {index < notifications.length - 1 && (
                            <Divider sx={{ opacity: 0.3, my: 0.5 }} />
                          )}
                        </React.Fragment>
                      </Fade>
                    );
                  })}
                </List>
              </>
              )}
            </>
          )}
        </Box>
      </Popover>

      {/* Modal de evento especial */}
      {selectedEvent && (
        <EventNotificationModal
          open={eventModalOpen}
          onClose={() => {
            setEventModalOpen(false);
            setSelectedEvent(null);
          }}
          eventId={selectedEvent.eventId}
          notification={selectedEvent.notification}
        />
      )}
      
      {/* Log de renderizado completo */}
      {console.log('🎨 NotificationCenter renderizado completamente')}
    </>
  );
}; 