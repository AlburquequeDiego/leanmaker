import { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  company?: string;
  date: string;
  read: boolean;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  metadata?: {
    project_id?: string;
    application_id?: string;
    evaluation_id?: string;
  };
}

interface NotificationFilters {
  type: string;
  priority: string;
  readStatus: string;
  search: string;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    priority: 'all',
    readStatus: 'all',
    search: '',
  });

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await apiService.get('/api/notifications/');
        // Si la respuesta es { success, data }
        const backendNotifications = response.data ? response.data : response;
        const data = Array.isArray(backendNotifications.data)
          ? backendNotifications.data
          : Array.isArray(backendNotifications)
            ? backendNotifications
            : [];
        const adapted = data.map((n: any) => ({
          id: String(n.id),
          type: n.type || 'system',
          title: n.title,
          message: n.message,
          company: n.company || '',
          date: n.created_at || n.date || '',
          read: n.read,
          priority: n.priority || 'medium',
          action_url: n.action_url,
          metadata: n.metadata,
        }));
        setNotifications(adapted);
        console.log('Notificaciones adaptadas:', adapted);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    }
    fetchNotifications();
  }, []);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    if (filters.readStatus !== 'all') {
      const isRead = filters.readStatus === 'read';
      if (notification.read !== isRead) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        (notification.company && notification.company.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Marcar como leída si no lo está
    if (!notification.read) {
      try {
        await apiService.post(`/api/notifications/${notification.id}/mark-read/`);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleFilterChange = (filterType: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      priority: 'all',
      readStatus: 'all',
      search: '',
    });
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
      case 'system':
        return <InfoIcon color="action" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'; // Rojo fuerte
      case 'high':
        return 'warning'; // Naranja
      case 'medium':
        return 'secondary'; // Amarillo (puedes personalizar si quieres otro tono)
      case 'normal':
        return 'default'; // Gris
      case 'low':
        return 'default';
      default:
        return 'default';
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
      default:
        return type;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

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
              value={limit}
              label="Mostrar"
              onChange={e => setLimit(Number(e.target.value))}
            >
              {[5, 10, 20, 30, 50].map(num => (
                <MenuItem key={num} value={num}>{num} últimas</MenuItem>
              ))}
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
              onClick={clearFilters}
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
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
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
              value={filters.priority}
              label="Prioridad"
              onChange={e => handleFilterChange('priority', e.target.value)}
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
              value={filters.readStatus}
              label="Estado"
              onChange={e => handleFilterChange('readStatus', e.target.value)}
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
                onClick={clearFilters}
                sx={{ mt: 2 }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        ) : (
          <List>
            {filteredNotifications.slice(0, limit).map((notification, index) => (
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
                          label={getTypeLabel(notification.type)}
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
                          {notification.company && `${notification.company} • `}
                          {new Date(notification.date).toLocaleDateString('es-ES', {
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

      {/* Dialog para mostrar detalles de la notificación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedNotification && (
          <Box sx={{ p: 2, pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: selectedNotification.read ? 'background.paper' : 'primary.light',
                width: 56, 
                height: 56, 
                boxShadow: 2,
                border: selectedNotification.read ? '1px solid #e0e0e0' : 'none',
              }}>
                {getNotificationIcon(selectedNotification.type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedNotification.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getTypeLabel(selectedNotification.type)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={getPriorityLabel(selectedNotification.priority)}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority) as any}
                  />
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2, color: 'text.primary', lineHeight: 1.6 }} component="div">
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
                flexWrap: 'wrap',
              }}
            >
              {selectedNotification.company && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" color="info" />
                  <Typography variant="body2" color="text.secondary">
                    {selectedNotification.company}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedNotification.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" color={getPriorityColor(selectedNotification.priority) as any} />
                <Typography variant="body2" color="text.secondary">
                  Prioridad: {getPriorityLabel(selectedNotification.priority)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                variant="contained"
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Notifications; 