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
  Card,
  CardContent,
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
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

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
  const { themeMode } = useTheme();
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
      default:
        return <NotificationsIcon sx={{ fontSize: 28, color: '#667eea' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'; // Rojo fuerte
      case 'high':
        return 'warning'; // Naranja
      case 'medium':
        return 'info'; // Azul
      case 'normal':
        return 'info'; // Azul (igual que empresa)
      case 'low':
        return 'default'; // Gris
      default:
        return 'info';
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
      default:
        return `0 4px 16px rgba(102, 126, 234, ${intensity})`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      minHeight: '100vh'
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
                Centro de Notificaciones
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Mantente informado sobre tus aplicaciones, proyectos y actualizaciones importantes
              </Typography>
            </Box>
          </Box>
          
          
        </Box>
      </Box>

      {/* Estadísticas mejoradas con tarjetas coloridas */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Paper sx={{ 
          flex: 1,
          minWidth: 200,
          bgcolor: '#1976d2', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{notifications.length}</Typography>
                <Typography variant="body1" fontWeight={600}>Total Notificaciones</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Paper sx={{ 
          flex: 1,
          minWidth: 200,
          bgcolor: '#fb8c00', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsActiveIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{unreadCount}</Typography>
                <Typography variant="body1" fontWeight={600}>No Leídas</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Paper sx={{ 
          flex: 1,
          minWidth: 200,
          bgcolor: '#388e3c', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarkEmailReadIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>{notifications.length - unreadCount}</Typography>
                <Typography variant="body1" fontWeight={600}>Leídas</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Paper sx={{ 
          flex: 1,
          minWidth: 200,
          bgcolor: '#d32f2f', 
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PriorityHighIcon sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  {notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
                </Typography>
                <Typography variant="body1" fontWeight={600}>Prioridad Alta</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Header con controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight={700} sx={{ 
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
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
            <InputLabel id="noti-limit-label" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>Mostrar</InputLabel>
            <Select
              labelId="noti-limit-label"
              value={limit}
              label="Mostrar"
              onChange={e => setLimit(Number(e.target.value))}
              sx={{
                bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                },
                '& .MuiSvgIcon-root': {
                  color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                },
              }}
            >
              {[5, 10, 20, 30, 50].map(num => (
                <MenuItem key={num} value={num}>{num} últimas</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Filtros mejorados */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
            }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar notificaciones..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
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
                  color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                },
                '& .MuiInputBase-input': {
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                }
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>Prioridad</InputLabel>
              <Select
                value={filters.priority}
                label="Prioridad"
                onChange={e => handleFilterChange('priority', e.target.value)}
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
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                  },
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>Estado</InputLabel>
              <Select
                value={filters.readStatus}
                label="Estado"
                onChange={e => handleFilterChange('readStatus', e.target.value)}
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
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '& .MuiSvgIcon-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                  },
                }}
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="unread">📬 No leídas</MenuItem>
                <MenuItem value="read">📭 Leídas</MenuItem>
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ borderRadius: 2 }}
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
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
          : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        border: themeMode === 'dark' 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid #90caf9'
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
      </Box>
      
      <Paper sx={{ 
        maxHeight: 600, 
        overflow: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
      }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 3,
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
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
                         color: notification.read ? 'inherit' : 'white',
                         transition: 'all 0.3s ease',
                         '& svg': {
                           fontSize: 28,
                           filter: notification.read ? 'none' : 'brightness(0) invert(1)',
                         }
                       }}>
                         {getNotificationIcon(notification.type)}
                       </Box>
                    </Box>
                  </ListItemAvatar>
                                     <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Box 
                          component="span"
                          sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            fontWeight: notification.read ? 'normal' : 'bold',
                            fontSize: '1rem',
                            lineHeight: 1.2
                          }}
                        >
                          {notification.title}
                        </Box>
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
                              bgcolor: '#1976d2',
                              color: 'white'
                            }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Box 
                          component="span"
                          sx={{ 
                            mb: 1, 
                            lineHeight: 1.4,
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            display: 'block'
                          }}
                        >
                          {notification.message}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box 
                            component="span"
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            {notification.company && `${notification.company} • `}
                            {new Date(notification.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Box>
                          {!notification.read && (
                            <Chip
                              label="Nueva"
                              size="small"
                              sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 16,
                                '& .MuiChip-label': {
                                  px: 1,
                                  py: 0.2
                                }
                              }}
                            />
                          )}
                        </Box>
                      </>
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

      {/* Dialog para mostrar detalles de la notificación mejorado */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
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
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: themeMode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.05)'
            }}>
              <Avatar sx={{ 
                bgcolor: selectedNotification.read 
                  ? (themeMode === 'dark' ? '#475569' : 'background.paper') 
                  : 'primary.light',
                width: 64, 
                height: 64, 
                boxShadow: 3,
                border: selectedNotification.read 
                  ? (themeMode === 'dark' ? '2px solid #64748b' : '2px solid #e0e0e0') 
                  : '2px solid #1976d2',
              }}>
                {getNotificationIcon(selectedNotification.type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  mb: 1, 
                  color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' 
                }}>
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
              bgcolor: themeMode === 'dark' ? '#334155' : 'grey.50',
              border: themeMode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography variant="body1" sx={{ 
                color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary', 
                lineHeight: 1.7 
              }} component="div">
                {selectedNotification.message}
              </Typography>
            </Box>
            
            {/* Información adicional */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
                  : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: 2,
                p: 3,
                mb: 3,
                alignItems: { sm: 'center' },
                flexWrap: 'wrap',
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255,255,255,0.1)' 
                  : '1px solid #90caf9'
              }}
            >
              {selectedNotification.company && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: themeMode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(255,255,255,0.7)'
                }}>
                  <BusinessIcon fontSize="small" color="info" />
                  <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} fontWeight={500}>
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
                bgcolor: themeMode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(255,255,255,0.7)'
              }}>
                <InfoIcon fontSize="small" color="action" />
                <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} fontWeight={500}>
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
                bgcolor: themeMode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(255,255,255,0.7)'
              }}>
                <WarningIcon fontSize="small" color={getPriorityColor(selectedNotification.priority) as any} />
                <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'} fontWeight={500}>
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
              borderTop: themeMode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.1)'
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