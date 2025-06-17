import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  Button,
  Dialog,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
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
} from '@mui/icons-material';

interface Notification {
  id: number;
  type: 'application' | 'project' | 'evaluation' | 'reminder' | 'system';
  title: string;
  message: string;
  company?: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    applicationId?: string;
    evaluationId?: string;
  };
}

interface NotificationFilters {
  type: string;
  priority: string;
  readStatus: string;
  search: string;
}

export const Notifications = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    priority: 'all',
    readStatus: 'all',
    search: '',
  });

  // Mock de notificaciones - esto vendría de la API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'application',
      title: 'Aplicación Aceptada',
      message: 'Tu aplicación para el proyecto "Sistema de Gestión de Inventarios" ha sido aceptada. Revisa los detalles y confirma tu participación.',
      company: 'TechCorp Solutions',
      date: '2024-01-20',
      read: false,
      priority: 'high',
      actionUrl: '/dashboard/student/applications/1',
      metadata: {
        applicationId: 'app_001',
        projectId: 'proj_001',
      },
    },
    {
      id: 2,
      type: 'project',
      title: 'Nuevo Proyecto Disponible',
      message: 'Hay un nuevo proyecto que coincide con tus habilidades: "Aplicación Móvil de Delivery". ¡Aplica ahora!',
      company: 'Digital Dynamics',
      date: '2024-01-19',
      read: true,
      priority: 'medium',
      actionUrl: '/dashboard/student/projects/new',
      metadata: {
        projectId: 'proj_002',
      },
    },
    {
      id: 3,
      type: 'evaluation',
      title: 'Evaluación Recibida',
      message: 'Has recibido una evaluación de 4.5/5 estrellas por tu trabajo en el proyecto anterior. ¡Excelente trabajo!',
      company: 'TechCorp Solutions',
      date: '2024-01-18',
      read: false,
      priority: 'high',
      actionUrl: '/dashboard/student/evaluations/1',
      metadata: {
        evaluationId: 'eval_001',
        projectId: 'proj_001',
      },
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Recordatorio de Entrega',
      message: 'Recuerda que tienes una entrega pendiente para el proyecto actual. Fecha límite: 25 de enero.',
      company: 'InnovateLab',
      date: '2024-01-17',
      read: true,
      priority: 'low',
      actionUrl: '/dashboard/student/projects/current',
      metadata: {
        projectId: 'proj_003',
      },
    },
    {
      id: 5,
      type: 'system',
      title: 'Mantenimiento Programado',
      message: 'La plataforma estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM.',
      date: '2024-01-16',
      read: false,
      priority: 'medium',
    },
  ]);

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

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
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
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
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
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filters.type}
              label="Tipo"
              onChange={e => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="application">Aplicaciones</MenuItem>
              <MenuItem value="project">Proyectos</MenuItem>
              <MenuItem value="evaluation">Evaluaciones</MenuItem>
              <MenuItem value="reminder">Recordatorios</MenuItem>
              <MenuItem value="system">Sistema</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={filters.priority}
              label="Prioridad"
              onChange={e => handleFilterChange('priority', e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
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
                          label={notification.priority === 'high' ? 'Alta' : notification.priority === 'medium' ? 'Media' : 'Baja'}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.company && `${notification.company} • `}
                          {new Date(notification.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
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
                    label={selectedNotification.priority === 'high' ? 'Alta' : selectedNotification.priority === 'medium' ? 'Media' : 'Baja'}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority) as any}
                  />
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2, color: 'text.primary', lineHeight: 1.6 }}>
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
                  Prioridad: {selectedNotification.priority === 'high' ? 'Alta' : selectedNotification.priority === 'medium' ? 'Media' : 'Baja'}
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