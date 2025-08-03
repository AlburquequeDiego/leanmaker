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
      {/* Header principal mejorado */}
      <Box sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Elementos decorativos */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        {/* Contenido del header */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: 'white', 
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🔔 Centro de Notificaciones
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Mantente informado sobre tus aplicaciones, proyectos y actualizaciones importantes
          </Typography>
        </Box>
      </Box>

      {/* Header con controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight={600} color="primary">
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
            <Typography variant="h6" fontWeight={600}>Filtros de Búsqueda</Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
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
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.7)'
        }}>
          <TextField
            size="small"
            placeholder="🔍 Buscar notificaciones..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>🎯 Prioridad</InputLabel>
            <Select
              value={filters.priority}
              label="🎯 Prioridad"
              onChange={e => handleFilterChange('priority', e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <MenuItem value="all">Todas las prioridades</MenuItem>
              <MenuItem value="urgent">🚨 Urgente</MenuItem>
              <MenuItem value="high">🔴 Alta</MenuItem>
              <MenuItem value="medium">🟡 Media</MenuItem>
              <MenuItem value="normal">🟢 Normal</MenuItem>
              <MenuItem value="low">🔵 Baja</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>📖 Estado</InputLabel>
            <Select
              value={filters.readStatus}
              label="📖 Estado"
              onChange={e => handleFilterChange('readStatus', e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="unread">📬 No leídas</MenuItem>
              <MenuItem value="read">📭 Leídas</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
        <Typography variant="body2" color="text.secondary">
          {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''} encontrada{filteredNotifications.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      
      <Paper sx={{ 
        maxHeight: 600, 
        overflow: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)'
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
                <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                  onClick={clearFilters}
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

      {/* Dialog para mostrar detalles de la notificación mejorado */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        {selectedNotification && (
          <Box sx={{ p: 3 }}>
            {/* Header del diálogo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3, 
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Avatar sx={{ 
                bgcolor: selectedNotification.read ? 'background.paper' : 'primary.light',
                width: 64, 
                height: 64, 
                boxShadow: 3,
                border: selectedNotification.read ? '2px solid #e0e0e0' : '2px solid #1976d2',
              }}>
                {getNotificationIcon(selectedNotification.type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
                  {selectedNotification.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getTypeLabel(selectedNotification.type)}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip
                    label={getPriorityLabel(selectedNotification.priority)}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority) as any}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Contenido del mensaje */}
            <Box sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'grey.50',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }} component="div">
                {selectedNotification.message}
              </Typography>
            </Box>
            
            {/* Información adicional */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: 2,
                p: 3,
                mb: 3,
                alignItems: { sm: 'center' },
                flexWrap: 'wrap',
                border: '1px solid #90caf9'
              }}
            >
              {selectedNotification.company && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.7)'
                }}>
                  <BusinessIcon fontSize="small" color="info" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {selectedNotification.company}
                  </Typography>
                </Box>
              )}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.7)'
              }}>
                <InfoIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {new Date(selectedNotification.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.7)'
              }}>
                <WarningIcon fontSize="small" color={getPriorityColor(selectedNotification.priority) as any} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Prioridad: {getPriorityLabel(selectedNotification.priority)}
                </Typography>
              </Box>
            </Box>
            
            {/* Botones de acción */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              pt: 2,
              borderTop: '1px solid rgba(0,0,0,0.1)'
            }}>
              <Button
                onClick={() => setDialogOpen(false)}
                variant="contained"
                sx={{ 
                  minWidth: 120, 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  boxShadow: 2
                }}
              >
                ✅ Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Notifications; 