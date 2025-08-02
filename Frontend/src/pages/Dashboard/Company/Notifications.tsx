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
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <EventIcon color="warning" />;
      case 'error':
        return <InfoIcon color="error" />;
      case 'info':
      default:
        return <NotificationsIcon color="action" />;
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
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      case 'info':
        return 'Información';
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
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Centro de Notificaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona y revisa todas las notificaciones de tu empresa
        </Typography>
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
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Filtros y Búsqueda
          </Typography>
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
              sx={{ borderRadius: 2 }}
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
              placeholder="Buscar notificaciones..."
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
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="Prioridad"
                onChange={e => setPriorityFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Baja</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={readStatusFilter}
                label="Estado"
                onChange={e => setReadStatusFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="unread">No leídas</MenuItem>
                <MenuItem value="read">Leídas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={displayCount}
                label="Mostrar"
                onChange={e => setDisplayCount(Number(e.target.value))}
                sx={{ borderRadius: 2 }}
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
      <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <HistoryIcon />
          <Typography variant="h6" fontWeight={600}>
            Historial de Notificaciones
          </Typography>
          <Chip 
            label={filteredNotifications.length} 
            color="secondary" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        {filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsNoneIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hasActiveFilters 
                ? 'No se encontraron notificaciones con los filtros seleccionados'
                : 'No hay notificaciones'
              }
            </Typography>
            {hasActiveFilters && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setPriorityFilter('all');
                  setTypeFilter('all');
                  setReadStatusFilter('all');
                  setSearch('');
                }}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Limpiar filtros
              </Button>
            )}
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
                    p: 3,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: notification.read ? 'background.paper' : `${getNotificationColor(notification.type)}.light`,
                      border: notification.read ? '1px solid #e0e0e0' : 'none',
                      width: 48,
                      height: 48,
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
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
          sx: { borderRadius: 3 }
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
