import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Badge,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsNone as NotificationsNoneIcon,
  Announcement as AnnouncementIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Campaign as CampaignIcon,
  Celebration as CelebrationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptNotificationList } from '../../../utils/adapters';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Notification } from '../../../types';
import { notificationService } from '../../../services/notification.service';

export const CompanyNotifications: React.FC = () => {
  const api = useApi();
  const { themeMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readStatusFilter, setReadStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/notifications/');
      const adaptedNotifications = adaptNotificationList(response.data.data || response.data);
      
      setNotifications(adaptedNotifications);
      setUnreadCount(adaptedNotifications.filter(n => !n.read).length);
    } catch (err: any) {
      console.error('Error al cargar notificaciones:', err);
      setError(err.response?.data?.error || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener colores basados en el tipo de notificación - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'event':
        return 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)'; // Púrpura para eventos
      case 'announcement':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'; // Azul para anuncios
      case 'alert':
        return 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'; // Rojo para alertas
      case 'update':
        return 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)'; // Verde para actualizaciones
      case 'deadline':
        return 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'; // Naranja para fechas límite
      case 'reminder':
        return 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)'; // Naranja para recordatorios
      case 'success':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'; // Verde para éxito
      case 'warning':
        return 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)'; // Naranja para advertencias
      case 'application':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'; // Azul para aplicaciones
      case 'project':
        return 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'; // Azul claro para proyectos
      case 'evaluation':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'; // Verde para evaluaciones
      case 'system':
        return 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)'; // Gris para sistema
      case 'interview':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'; // Verde para entrevistas
      case 'calendar':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'; // Azul para calendario
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Gradiente por defecto
    }
  };

  const getNotificationShadow = (type: string, hover: boolean = false) => {
    const intensity = hover ? 0.5 : 0.3;
    switch (type) {
      case 'event':
        return `0 4px 16px rgba(123, 31, 162, ${intensity})`;
      case 'announcement':
        return `0 4px 16px rgba(25, 118, 210, ${intensity})`;
      case 'alert':
        return `0 4px 16px rgba(211, 47, 47, ${intensity})`;
      case 'update':
        return `0 4px 16px rgba(56, 142, 60, ${intensity})`;
      case 'deadline':
        return `0 4px 16px rgba(245, 124, 0, ${intensity})`;
      case 'reminder':
        return `0 4px 16px rgba(237, 108, 2, ${intensity})`;
      case 'success':
        return `0 4px 16px rgba(46, 125, 50, ${intensity})`;
      case 'warning':
        return `0 4px 16px rgba(237, 108, 2, ${intensity})`;
      case 'application':
        return `0 4px 16px rgba(25, 118, 210, ${intensity})`;
      case 'project':
        return `0 4px 16px rgba(2, 136, 209, ${intensity})`;
      case 'evaluation':
        return `0 4px 16px rgba(46, 125, 50, ${intensity})`;
      case 'system':
        return `0 4px 16px rgba(117, 117, 117, ${intensity})`;
      case 'interview':
        return `0 4px 16px rgba(46, 125, 50, ${intensity})`;
      case 'calendar':
        return `0 4px 16px rgba(25, 118, 210, ${intensity})`;
      default:
        return `0 4px 16px rgba(102, 126, 234, ${intensity})`;
    }
  };

  // Función para obtener colores del avatar basados en el tipo - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getAvatarColors = (type: string) => {
    switch (type) {
      case 'event':
        return 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)';
      case 'announcement':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)';
      case 'alert':
        return 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)';
      case 'update':
        return 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)';
      case 'deadline':
        return 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)';
      case 'reminder':
        return 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)';
      case 'success':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)';
      case 'application':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)';
      case 'project':
        return 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)';
      case 'evaluation':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
      case 'system':
        return 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)';
      case 'interview':
        return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
      case 'calendar':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  // Función para obtener iconos con colores - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <AssignmentIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
      case 'project':
        return <BusinessIcon sx={{ fontSize: 28, color: '#0288d1' }} />;
      case 'evaluation':
        return <CheckCircleIcon sx={{ fontSize: 28, color: '#2e7d32' }} />;
      case 'reminder':
        return <ScheduleIcon sx={{ fontSize: 28, color: '#ed6c02' }} />;
      case 'system':
        return <InfoIcon sx={{ fontSize: 28, color: '#757575' }} />;
      case 'event':
        return <EventIcon sx={{ fontSize: 28, color: '#7b1fa2' }} />;
      case 'announcement':
        return <AnnouncementIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
      case 'alert':
        return <PriorityHighIcon sx={{ fontSize: 28, color: '#d32f2f' }} />;
      case 'update':
        return <UpdateIcon sx={{ fontSize: 28, color: '#388e3c' }} />;
      case 'deadline':
        return <WarningIcon sx={{ fontSize: 28, color: '#f57c00' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 28, color: '#2e7d32' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 28, color: '#ed6c02' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
      case 'interview':
        return <PeopleIcon sx={{ fontSize: 28, color: '#2e7d32' }} />;
      case 'calendar':
        return <CalendarTodayIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 28, color: '#667eea' }} />;
    }
  };

  // Función para obtener colores de prioridad - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'; // Rojo fuerte
      case 'high':
        return 'warning'; // Naranja
      case 'medium':
        return 'info'; // Azul
      case 'normal':
        return 'info'; // Azul
      case 'low':
        return 'default'; // Gris
      default:
        return 'info';
    }
  };

  // Función para obtener etiquetas de prioridad - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      default: return 'Normal'; // Por defecto en español
    }
  };

  // Función para obtener etiquetas de tipo - EXACTAMENTE IGUAL AL ESTUDIANTE
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'application':
        return 'Aplicación';
      case 'project':
        return 'Proyecto';
      case 'evaluation':
        return 'Evaluación';
      case 'reminder':
        return 'Recordatorio';
      case 'deadline':
        return 'Fecha Límite';
      case 'success':
        return 'Éxito';
      case 'system':
        return 'Sistema';
      case 'event':
        return 'Evento';
      case 'announcement':
        return 'Anuncio';
      case 'alert':
        return 'Alerta';
      case 'update':
        return 'Actualización';
      case 'warning':
        return 'Advertencia';
      case 'interview':
        return 'Entrevista';
      case 'calendar':
        return 'Calendario';
      default:
        return 'Notificación'; // Por defecto en español
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = !search || 
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesReadStatus = readStatusFilter === 'all' || 
        (readStatusFilter === 'read' && notification.read) ||
        (readStatusFilter === 'unread' && !notification.read);
      
      return matchesSearch && matchesPriority && matchesType && matchesReadStatus;
    });
  }, [notifications, search, priorityFilter, typeFilter, readStatusFilter]);

  const hasActiveFilters = search || priorityFilter !== 'all' || typeFilter !== 'all' || readStatusFilter !== 'all';

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleCloseDialog = () => {
    setSelectedNotification(null);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        // Actualizar el estado local inmediatamente
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
        
        // Actualizar contadores
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: 'Notificación marcada como leída',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Error al marcar como leída',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setSnackbar({
        open: true,
        message: 'Error al marcar como leída',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadNotifications} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f7fafd', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Centro de Notificaciones Empresarial
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Gestiona y revisa todas las notificaciones de tu empresa y proyectos
              </Typography>
            </Box>
          </Box>
          

        </Box>
      </Box>

      {/* Estadísticas mejoradas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#1976d2', 
            color: 'white',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(25, 118, 210, 0.4)' : 3,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(25, 118, 210, 0.5)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>{notifications.length}</Typography>
                  <Typography variant="body1" fontWeight={600}>Total Notificaciones</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#fb8c00', 
            color: 'white',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(251, 140, 0, 0.4)' : 3,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(251, 140, 0, 0.5)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsActiveIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>{unreadCount}</Typography>
                  <Typography variant="body1" fontWeight={600}>No Leídas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#388e3c', 
            color: 'white',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(56, 142, 60, 0.4)' : 3,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(56, 142, 60, 0.5)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MarkEmailReadIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>{notifications.length - unreadCount}</Typography>
                  <Typography variant="body1" fontWeight={600}>Leídas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#d32f2f', 
            color: 'white',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(211, 47, 47, 0.4)' : 3,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(211, 47, 47, 0.5)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PriorityHighIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>Prioridad Alta</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros mejorados */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 3, 
          boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar notificaciones..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '&:hover fieldset': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& fieldset': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode === 'dark' ? '#cbd5e1' : '#374151',
                },
                '& .MuiInputBase-input': {
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                }
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#374151' }}>Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="Prioridad"
                onChange={e => setPriorityFilter(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151',
                  }
                }}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="urgent">🚨 Urgente</MenuItem>
                <MenuItem value="high">🔴 Alta</MenuItem>
                <MenuItem value="medium">🟡 Media</MenuItem>
                <MenuItem value="normal">🟢 Normal</MenuItem>
                <MenuItem value="low">🔵 Baja</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#374151' }}>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={e => setTypeFilter(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151',
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="application">Aplicación</MenuItem>
                <MenuItem value="project">Proyecto</MenuItem>
                <MenuItem value="evaluation">Evaluación</MenuItem>
                <MenuItem value="reminder">Recordatorio</MenuItem>
                <MenuItem value="deadline">Fecha Límite</MenuItem>
                <MenuItem value="success">Éxito</MenuItem>
                <MenuItem value="system">Sistema</MenuItem>
                <MenuItem value="event">Evento</MenuItem>
                <MenuItem value="announcement">Anuncio</MenuItem>
                <MenuItem value="alert">Alerta</MenuItem>
                <MenuItem value="update">Actualización</MenuItem>
                <MenuItem value="warning">Advertencia</MenuItem>
                <MenuItem value="interview">Entrevista</MenuItem>
                <MenuItem value="calendar">Calendario</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#374151' }}>Estado</InputLabel>
              <Select
                value={readStatusFilter}
                label="Estado"
                onChange={e => setReadStatusFilter(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151',
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="unread">No leídas</MenuItem>
                <MenuItem value="read">Leídas</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#374151' }}>Mostrar</InputLabel>
              <Select
                value={displayCount}
                label="Mostrar"
                onChange={e => setDisplayCount(Number(e.target.value))}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#374151',
                  }
                }}
              >
                {[10, 20, 50, 150, 200].map(num => (
                  <MenuItem key={num} value={num}>{num} últimas</MenuItem>
                ))}
                <MenuItem value={-1}>Todas</MenuItem>
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setPriorityFilter('all');
                  setTypeFilter('all');
                  setReadStatusFilter('all');
                  setSearch('');
                }}
                sx={{ 
                  borderRadius: 2,
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                    bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Lista de notificaciones mejorada */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        p: 2,
        borderRadius: 3,
        background: themeMode === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #90caf9'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <HistoryIcon fontSize="small" />
          <Typography variant="h5" fontWeight={600}>Historial de Notificaciones</Typography>
        </Box>
        <Chip 
          label={filteredNotifications.length} 
          color="secondary" 
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
      
      <Paper sx={{ 
        borderRadius: 3, 
        boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
      }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 3,
            background: themeMode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2 
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <NotificationsNoneIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={600} color={themeMode === 'dark' ? '#f1f5f9' : 'text.primary'}>
                {hasActiveFilters 
                  ? '🔍 No se encontraron notificaciones'
                  : '📭 No hay notificaciones'
                }
              </Typography>
              <Typography variant="body1" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} sx={{ maxWidth: 400 }}>
                {hasActiveFilters 
                  ? 'No se encontraron notificaciones con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.'
                  : '¡Perfecto! No tienes notificaciones pendientes. Cuando recibas nuevas notificaciones aparecerán aquí.'
                }
              </Typography>
              {hasActiveFilters && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setPriorityFilter('all');
                    setTypeFilter('all');
                    setReadStatusFilter('all');
                    setSearch('');
                  }}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : 'primary.dark'
                    }
                  }}
                  startIcon={<ClearIcon />}
                >
                  Limpiar filtros
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.slice(0, displayCount).map((notification, index) => {
              const icon = getNotificationIcon(notification.type);

              return (
                <Box key={notification.id}>
                  <ListItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.read 
                        ? 'transparent' 
                        : getNotificationBackground(notification.type),
                      '&:hover': {
                        backgroundColor: notification.read 
                          ? themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                          : getNotificationBackground(notification.type),
                        transform: 'translateY(-2px)',
                        boxShadow: notification.read 
                          ? '0 4px 12px rgba(0,0,0,0.15)'
                          : getNotificationShadow(notification.type, true),
                      },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      py: 2, // Más padding vertical
                      px: 3, // Más padding horizontal
                      gap: 2, // Espacio entre elementos
                      border: notification.read ? '1px solid #e0e0e0' : 'none',
                      borderRadius: 2,
                      mb: 1,
                      boxShadow: notification.read 
                        ? '0 2px 8px rgba(0,0,0,0.1)'
                        : getNotificationShadow(notification.type),
                    }}
                  >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: notification.read 
                          ? 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                          : getAvatarColors(notification.type),
                        boxShadow: notification.read 
                          ? '0 2px 8px rgba(0,0,0,0.1)'
                          : getNotificationShadow(notification.type),
                        border: notification.read ? '1px solid #e0e0e0' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: notification.read 
                            ? '0 4px 12px rgba(0,0,0,0.15)'
                            : getNotificationShadow(notification.type, true),
                        }
                      }}
                    >
                      <Box sx={{ 
                        color: notification.read ? '#757575' : '#ffffff',
                        fontSize: '24px',
                        transition: 'all 0.3s ease',
                        '& svg': {
                          filter: notification.read ? 'none' : 'brightness(0) invert(1)',
                        }
                      }}>
                        {icon}
                      </Box>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                        <Box 
                          component="span"
                          sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            fontWeight: notification.read ? 500 : 700,
                            fontSize: '1rem',
                            lineHeight: 1.2,
                            color: notification.read 
                              ? (themeMode === 'dark' ? '#cbd5e1' : '#6b7280')
                              : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b')
                          }}
                        >
                          {notification.title}
                        </Box>
                        <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Box
                            component="span"
                            sx={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 600,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              border: `1px solid ${notification.read ? '#d1d5db' : '#ffffff'}`,
                              color: notification.read ? '#6b7280' : '#ffffff',
                              backgroundColor: notification.read ? 'transparent' : 'rgba(255,255,255,0.2)',
                              display: 'inline-block',
                              textAlign: 'center',
                              minWidth: 'fit-content'
                            }}
                          >
                            {getTypeLabel(notification.type)}
                          </Box>
                          <Box
                            component="span"
                            sx={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 600,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              color: 'white',
                              display: 'inline-block',
                              textAlign: 'center',
                              minWidth: 'fit-content',
                              ...(notification.priority === 'urgent' && { bgcolor: '#d32f2f' }),
                              ...(notification.priority === 'high' && { bgcolor: '#ed6c02' }),
                              ...(notification.priority === 'medium' && { bgcolor: '#1976d2' }),
                              ...(notification.priority === 'normal' && { bgcolor: '#1976d2' }),
                              ...(notification.priority === 'low' && { bgcolor: '#757575' })
                            }}
                          >
                            {getPriorityLabel(notification.priority)}
                          </Box>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Box 
                          component="span"
                          sx={{ 
                            mb: 1.5, 
                            lineHeight: 1.5,
                            color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                            fontSize: '0.875rem',
                            display: 'block'
                          }}
                        >
                          {notification.message}
                        </Box>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box 
                            component="span"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            <ScheduleIcon sx={{ fontSize: 14 }} />
                            {new Date(notification.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Box>

                        </Box>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      '& .MuiListItemText-primary': {
                        marginBottom: 0.5,
                      },
                      '& .MuiListItemText-secondary': {
                        marginTop: 0.5,
                      }
                    }}
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </Box>
            );
          })}
          </List>
        )}
      </Paper>

      {/* Diálogo de detalles mejorado */}
      <Dialog 
        open={!!selectedNotification} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ 
              background: getAvatarColors(selectedNotification.type),
              color: 'white',
              fontWeight: 600
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'white',
                  color: '#1976d2',
                  width: 48,
                  height: 48,
                }}>
                  {getNotificationIcon(selectedNotification.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedNotification.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {getTypeLabel(selectedNotification.type)} • {getPriorityLabel(selectedNotification.priority)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Chip
                    label={getTypeLabel(selectedNotification.type)}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      border: '1px solid #1976d2'
                    }}
                  />
                  <Chip
                    label={getPriorityLabel(selectedNotification.priority)}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority) as any}
                    sx={{ 
                      fontWeight: 600,
                      '&.MuiChip-colorError': {
                        bgcolor: '#d32f2f',
                        color: 'white'
                      },
                      '&.MuiChip-colorWarning': {
                        bgcolor: '#ed6c02',
                        color: 'white'
                      },
                      '&.MuiChip-colorInfo': {
                        bgcolor: '#1976d2',
                        color: 'white'
                      },
                      '&.MuiChip-colorSuccess': {
                        bgcolor: '#2e7d32',
                        color: 'white'
                      }
                    }}
                  />

                </Box>
                
                <Paper sx={{ 
                  p: 3, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', 
                  borderRadius: 2, 
                  mb: 3,
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {selectedNotification.message}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16 }} />
                    Fecha: {new Date(selectedNotification.created_at).toLocaleString('es-ES')}
                  </Typography>
                  {selectedNotification.related_url && (
                    <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 16 }} />
                      URL relacionada: {selectedNotification.related_url}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', 
              gap: 2 
            }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyNotifications;
