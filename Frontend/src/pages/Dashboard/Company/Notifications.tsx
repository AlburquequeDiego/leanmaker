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
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptNotificationList } from '../../../utils/adapters';
import type { Notification } from '../../../types';

export const CompanyNotifications: React.FC = () => {
  const api = useApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readStatusFilter, setReadStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 28 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 28 }} />;
      case 'error':
        return <PriorityHighIcon sx={{ fontSize: 28 }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 28 }} />;
      case 'event':
        return <EventIcon sx={{ fontSize: 28 }} />;
      case 'announcement':
        return <AnnouncementIcon sx={{ fontSize: 28 }} />;
      case 'alert':
        return <PriorityHighIcon sx={{ fontSize: 28 }} />;
      case 'update':
        return <UpdateIcon sx={{ fontSize: 28 }} />;
      case 'deadline':
        return <WarningIcon sx={{ fontSize: 28 }} />;
      case 'reminder':
        return <ScheduleIcon sx={{ fontSize: 28 }} />;
      case 'application':
        return <AssignmentIcon sx={{ fontSize: 28 }} />;
      case 'project':
        return <BusinessIcon sx={{ fontSize: 28 }} />;
      case 'evaluation':
        return <CheckCircleIcon sx={{ fontSize: 28 }} />;
      case 'system':
        return <InfoIcon sx={{ fontSize: 28 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 28 }} />;
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
      case 'event':
        return 'secondary';
      case 'announcement':
        return 'primary';
      case 'alert':
        return 'error';
      case 'update':
        return 'success';
      case 'deadline':
        return 'warning';
      case 'reminder':
        return 'warning';
      case 'application':
        return 'primary';
      case 'project':
        return 'info';
      case 'evaluation':
        return 'success';
      case 'system':
        return 'default';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      case 'info':
        return 'Información';
      case 'event':
        return 'Evento';
      case 'announcement':
        return 'Anuncio';
      case 'alert':
        return 'Alerta';
      case 'update':
        return 'Actualización';
      case 'deadline':
        return 'Fecha límite';
      case 'reminder':
        return 'Recordatorio';
      case 'application':
        return 'Aplicación';
      case 'project':
        return 'Proyecto';
      case 'evaluation':
        return 'Evaluación';
      case 'system':
        return 'Sistema';
      default:
        return 'Notificación';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

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
      case 'info':
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'; // Azul para info
      case 'error':
        return 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'; // Rojo para errores
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
      case 'info':
        return `0 4px 16px rgba(25, 118, 210, ${intensity})`;
      case 'error':
        return `0 4px 16px rgba(211, 47, 47, ${intensity})`;
      default:
        return `0 4px 16px rgba(102, 126, 234, ${intensity})`;
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

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

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

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/mark-read/`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
            boxShadow: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
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
            boxShadow: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
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
            boxShadow: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
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
            boxShadow: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
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
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 1,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <FilterIcon fontSize="small" />
            <Typography variant="h6" fontWeight={600}>Filtros y Búsqueda</Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={() => {
                setPriorityFilter('all');
                setTypeFilter('all');
                setReadStatusFilter('all');
                setSearch('');
              }}
              startIcon={<ClearIcon />}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: 'error.light',
                  color: 'error.dark'
                }
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="🔍 Buscar notificaciones..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>🎯 Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="🎯 Prioridad"
                onChange={e => setPriorityFilter(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'grey.50'
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
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>📖 Estado</InputLabel>
              <Select
                value={readStatusFilter}
                label="📖 Estado"
                onChange={e => setReadStatusFilter(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="unread">📬 No leídas</MenuItem>
                <MenuItem value="read">📭 Leídas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>📊 Mostrar</InputLabel>
              <Select
                value={displayCount}
                label="📊 Mostrar"
                onChange={e => setDisplayCount(Number(e.target.value))}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                {[10, 20, 50, 150, 200].map(num => (
                  <MenuItem key={num} value={num}>{num} últimas</MenuItem>
                ))}
                <MenuItem value={-1}>Todas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de notificaciones mejorada */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        p: 2,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        border: '1px solid #90caf9'
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden' 
      }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
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
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {hasActiveFilters 
                  ? '🔍 No se encontraron notificaciones'
                  : '📭 No hay notificaciones'
                }
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
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
                    py: 1
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
            {filteredNotifications.slice(0, displayCount).map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.08)',
                    },
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    py: 2, // Más padding vertical
                    px: 3, // Más padding horizontal
                    gap: 2, // Espacio entre elementos
                  }}
                >
                  <ListItemAvatar>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: notification.read 
                          ? 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                          : getNotificationBackground(notification.type),
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
                        color: notification.read ? '#757575' : 'white',
                        filter: notification.read ? 'none' : 'brightness(0) invert(1)',
                        transition: 'all 0.3s ease'
                      }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={notification.read ? 500 : 700}
                          sx={{ flex: 1, minWidth: 0 }}
                          component="span"
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={getNotificationTypeLabel(notification.type)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                          />
                          <Chip
                            label={getPriorityLabel(notification.priority)}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 14 }} />
                            {new Date(notification.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              label="Nueva"
                              size="small"
                              color="primary"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          )}
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
            ))}
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
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              fontWeight: 600
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
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
                    {getNotificationTypeLabel(selectedNotification.type)} • {getPriorityLabel(selectedNotification.priority)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Chip
                    label={getNotificationTypeLabel(selectedNotification.type)}
                    color={getNotificationColor(selectedNotification.type) as any}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={getPriorityLabel(selectedNotification.priority)}
                    color={getPriorityColor(selectedNotification.priority) as any}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={selectedNotification.read ? 'Leída' : 'No leída'}
                    color={selectedNotification.read ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {selectedNotification.message}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16 }} />
                    Fecha: {new Date(selectedNotification.created_at).toLocaleString('es-ES')}
                  </Typography>
                  {selectedNotification.related_url && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 16 }} />
                      URL relacionada: {selectedNotification.related_url}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
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
    </Box>
  );
};

export default CompanyNotifications;
