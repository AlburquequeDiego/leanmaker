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
      case 'info':
        return 'Información';
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      case 'announcement':
        return 'Anuncio';
      case 'reminder':
        return 'Recordatorio';
      case 'alert':
        return 'Alerta';
      case 'update':
        return 'Actualización';
      case 'event':
        return 'Evento';
      case 'deadline':
        return 'Fecha límite';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'normal': return 'default';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  // Filtros combinados
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    if (readStatusFilter !== 'all') {
      filtered = filtered.filter(n => n.read === (readStatusFilter === 'read'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [notifications, priorityFilter, typeFilter, readStatusFilter, search]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasActiveFilters = [priorityFilter, typeFilter, readStatusFilter, search].some(v => v !== 'all' && v !== '');

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
      await api.post(`/api/notifications/${id}/mark-read/`);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al marcar como leída');
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Notificaciones
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
                <NotificationsIcon />
              </Badge>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="noti-limit-label">Mostrar</InputLabel>
            <Select
              labelId="noti-limit-label"
              value={displayCount}
              label="Mostrar"
              onChange={e => setDisplayCount(Number(e.target.value))}
            >
              {[10, 20, 50, 150, 200].map(num => (
                <MenuItem key={num} value={num}>{num} últimas</MenuItem>
              ))}
              <MenuItem value={-1}>Todas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FilterIcon color="action" />
          <Typography variant="h6">Filtros</Typography>
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
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
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
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={priorityFilter}
              label="Prioridad"
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="urgent">Urgente</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Baja</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={readStatusFilter}
              label="Estado"
              onChange={e => setReadStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="unread">No leídas</MenuItem>
              <MenuItem value="read">Leídas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
      {/* Lista de notificaciones */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
        Historial de Notificaciones
      </Typography>
      <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
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
                sx={{ mt: 2 }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        ) : (
          <List>
            {filteredNotifications.slice(0, displayCount).map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: notification.read ? 'background.paper' : 'primary.light',
                      border: notification.read ? '1px solid #e0e0e0' : 'none',
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={notification.read ? 'normal' : 'bold'}
                          sx={{ flex: 1, minWidth: 0 }}
                          component="span"
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getNotificationTypeLabel(notification.type)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={getPriorityLabel(notification.priority)}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} component="span">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {new Date(notification.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
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
                  {getNotificationIcon(selectedNotification.type)}
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
                    label={getPriorityLabel(selectedNotification.priority)}
                    color={getPriorityColor(selectedNotification.priority) as any}
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
                {selectedNotification.related_url && (
                  <Typography variant="body2" color="text.secondary">
                    URL relacionada: {selectedNotification.related_url}
                  </Typography>
                )}
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
