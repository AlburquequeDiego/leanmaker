/**
 * 🔔 TEACHER NOTIFICATIONS - NOTIFICACIONES DEL DOCENTE
 * 
 * DESCRIPCIÓN:
 * Esta interfaz permite al docente gestionar sus notificaciones específicas,
 * incluyendo notificaciones cuando toma desafíos, mensajes del admin, etc.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Ver notificaciones específicas del docente
 * - Marcar como leídas/no leídas
 * - Filtrar por tipo, prioridad y estado
 * - Buscar notificaciones
 * - Acciones específicas para docentes
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
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
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  NotificationsActive as NotificationsActiveIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  Campaign as CampaignIcon,
  Celebration as CelebrationIcon,
  MarkEmailRead as MarkEmailReadIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

interface TeacherNotification {
  id: string;
  type: 'challenge_taken' | 'challenge_completed' | 'admin_announcement' | 'student_progress' | 'evaluation_required' | 'system_update' | 'general';
  title: string;
  message: string;
  company?: string;
  challenge_id?: string;
  student_id?: string;
  date: string;
  read: boolean;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  metadata?: {
    challenge_id?: string;
    student_id?: string;
    project_id?: string;
    evaluation_id?: string;
  };
}

interface NotificationFilters {
  type: string;
  priority: string;
  readStatus: string;
  search: string;
}

export const TeacherNotifications: React.FC = () => {
  const { themeMode } = useTheme();
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<TeacherNotification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    priority: 'all',
    readStatus: 'all',
    search: '',
  });

  // Datos de ejemplo para docente (será reemplazado por API real)
  useEffect(() => {
    const mockNotifications: TeacherNotification[] = [
    {
      id: '1',
        type: 'challenge_taken',
        title: 'Desafío Tomado Exitosamente',
        message: 'Has tomado el desafío "Optimización del Sistema de Inventario con IA" de TechCorp Solutions para 3 estudiantes.',
        company: 'TechCorp Solutions',
        challenge_id: '1',
        date: '2024-01-15T10:30:00Z',
        read: false,
      priority: 'high',
        action_url: '/dashboard/teacher/challenges',
        metadata: {
          challenge_id: '1',
          student_id: 'student_123'
        }
    },
    {
      id: '2',
        type: 'admin_announcement',
        title: 'Nueva Política Académica',
        message: 'Se ha implementado una nueva política para la gestión de desafíos académicos. Revisa los cambios en el panel de administración.',
        date: '2024-01-14T14:20:00Z',
      read: false,
        priority: 'urgent',
        action_url: '/dashboard/teacher/policy-updates'
    },
    {
      id: '3',
        type: 'student_progress',
        title: 'Progreso de Estudiante',
        message: 'El estudiante Juan Pérez ha completado el 75% del desafío "Plataforma de E-commerce Sostenible". Revisa su progreso.',
        student_id: 'student_456',
        date: '2024-01-13T16:45:00Z',
      read: true,
        priority: 'medium',
        action_url: '/dashboard/teacher/student-progress',
        metadata: {
          student_id: 'student_456',
          challenge_id: '2'
        }
    },
    {
      id: '4',
        type: 'evaluation_required',
        title: 'Evaluación Pendiente',
        message: 'Tienes una evaluación pendiente para el proyecto "Sistema de Gestión de Inventarios" de EcoMarket.',
        company: 'EcoMarket',
        date: '2024-01-12T09:15:00Z',
        read: false,
        priority: 'high',
        action_url: '/dashboard/teacher/evaluations',
        metadata: {
          project_id: 'project_789',
          evaluation_id: 'eval_123'
        }
      },
      {
        id: '5',
        type: 'system_update',
        title: 'Actualización del Sistema',
        message: 'El sistema LeanMaker ha sido actualizado con nuevas funcionalidades para docentes. Explora las nuevas características.',
        date: '2024-01-11T11:00:00Z',
      read: true,
        priority: 'normal',
        action_url: '/dashboard/teacher/whats-new'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
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

  const handleNotificationClick = async (notification: TeacherNotification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Marcar como leída si no lo está
    if (!notification.read) {
      try {
        // Aquí se implementará la llamada a la API real
        // await apiService.post(`/api/notifications/${notification.id}/mark-read/`);
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

  const markAllAsRead = async () => {
    try {
      // Aquí se implementará la llamada a la API real
      // await apiService.post('/api/notifications/mark-all-read/');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_taken':
        return <EmojiEventsIcon sx={{ color: 'success.main' }} />;
      case 'challenge_completed':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'admin_announcement':
        return <AnnouncementIcon sx={{ color: 'warning.main' }} />;
      case 'student_progress':
        return <SchoolIcon sx={{ color: 'info.main' }} />;
      case 'evaluation_required':
        return <AssessmentIcon sx={{ color: 'error.main' }} />;
      case 'system_update':
        return <UpdateIcon sx={{ color: 'primary.main' }} />;
      default:
        return <NotificationsIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'normal': return 'default';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'challenge_taken': return 'Desafío Tomado';
      case 'challenge_completed': return 'Desafío Completado';
      case 'admin_announcement': return 'Anuncio Admin';
      case 'student_progress': return 'Progreso Estudiante';
      case 'evaluation_required': return 'Evaluación Requerida';
      case 'system_update': return 'Actualización Sistema';
      default: return 'General';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando notificaciones...
        </Typography>
      </Box>
    );
  }

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
            🔔 Centro de Notificaciones Académicas
              </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Mantente informado sobre el progreso de tus estudiantes, desafíos tomados, evaluaciones pendientes y actualizaciones del sistema
                </Typography>
              </Box>
      </Box>

      {/* Header con botones de acción */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={markAllAsRead}
              sx={{ minWidth: 140 }}
            >
              Marcar Todas
            </Button>
          )}
        </Box>
              </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar notificaciones..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Tipo"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="challenge_taken">Desafío Tomado</MenuItem>
                <MenuItem value="challenge_completed">Desafío Completado</MenuItem>
                <MenuItem value="admin_announcement">Anuncio Admin</MenuItem>
                <MenuItem value="student_progress">Progreso Estudiante</MenuItem>
                <MenuItem value="evaluation_required">Evaluación Requerida</MenuItem>
                <MenuItem value="system_update">Actualización Sistema</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Prioridad"
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
                onChange={(e) => handleFilterChange('readStatus', e.target.value)}
                label="Estado"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="unread">No leídas</MenuItem>
                <MenuItem value="read">Leídas</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              size="small"
            >
              Limpiar
            </Button>
              </Box>
        </Paper>

        {/* Lista de notificaciones */}
      {filteredNotifications.length === 0 ? (
        <Alert severity="info">
          {filters.search || filters.type !== 'all' || filters.priority !== 'all' || filters.readStatus !== 'all'
            ? 'No se encontraron notificaciones con los filtros aplicados.'
            : 'No tienes notificaciones en este momento.'}
        </Alert>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {filteredNotifications.slice(0, limit).map((notification, index) => (
            <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        borderRadius: 1,
                        mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: notification.read ? 'action.hover' : 'action.selected',
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                    {getNotificationIcon(notification.type)}
                        </Avatar>
                </ListItemAvatar>
                      <ListItemText
                        primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ flexGrow: 1 }}
                      >
                              {notification.title}
                            </Typography>
                      <Chip
                        label={getTypeLabel(notification.type)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                            <Chip 
                              label={notification.priority}
                        size="small"
                              color={getPriorityColor(notification.priority) as any}
                            />
                            {!notification.read && (
                              <Chip 
                                label="Nueva"
                                size="small"
                          color="error"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.date)}
                        </Typography>
                        {notification.company && (
                          <Typography variant="caption" color="text.secondary">
                            • {notification.company}
                            </Typography>
                        )}
                      </Box>
                          </Box>
                        }
                      />
                    </ListItem>
              {index < filteredNotifications.length - 1 && <Divider />}
            </React.Fragment>
                ))}
              </List>
      )}

      {/* Botón para cargar más */}
      {filteredNotifications.length > limit && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setLimit(prev => prev + 10)}
          >
            Cargar más notificaciones
          </Button>
        </Box>
      )}

      {/* Dialog de detalles */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            <Typography variant="h6" fontWeight={600}>
              {selectedNotification?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={getTypeLabel(selectedNotification.type)}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={selectedNotification.priority}
                  color={getPriorityColor(selectedNotification.priority) as any}
                />
                <Chip
                  label={formatDate(selectedNotification.date)}
                  variant="outlined"
                />
              </Box>

              {selectedNotification.company && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Empresa:</strong> {selectedNotification.company}
                </Typography>
              )}

              {selectedNotification.action_url && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Esta notificación tiene una acción asociada. Haz clic en "Ir a la acción" para acceder.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
          {selectedNotification?.action_url && (
            <Button 
              variant="contained"
              onClick={() => {
                // Aquí se implementará la navegación a la acción
                console.log('Navegando a:', selectedNotification.action_url);
                setDialogOpen(false);
              }}
            >
              Ir a la acción
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherNotifications;
