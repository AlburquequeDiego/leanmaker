import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControlLabel,
  Switch,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  NotificationsActive as NotificationsActiveIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { apiService } from '../../../services/api.service';

interface MassNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'announcement' | 'reminder' | 'alert' | 'update' | 'event' | 'deadline';
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';
  target_all_students: boolean;
  target_all_companies: boolean;
  target_students: Array<{ id: string; name: string }>;
  target_companies: Array<{ id: string; name: string }>;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  created_by_name: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  read_count: number;
}

export default function NotificacionesAdmin() {
  const [notifications, setNotifications] = useState<MassNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [limit, setLimit] = useState(5);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<MassNotification | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notification_type: 'announcement' as 'announcement' | 'reminder' | 'alert' | 'update' | 'event' | 'deadline',
    priority: 'normal' as 'low' | 'normal' | 'medium' | 'high' | 'urgent',
    target_all_students: false,
    target_all_companies: false,
    target_student_ids: [] as string[],
    target_company_ids: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'El título debe tener al menos 5 caracteres';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'El mensaje debe tener al menos 10 caracteres';
    }
    
    if (!formData.target_all_students && !formData.target_all_companies && 
        formData.target_student_ids.length === 0 && formData.target_company_ids.length === 0) {
      errors.recipients = 'Debe seleccionar al menos un destinatario';
    }
    

    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/api/mass-notifications/');
      console.log('Respuesta notificaciones masivas:', response);
      
      // El backend devuelve los datos en response.data.results
      const data = response.data?.results || response.results || [];
      console.log('Datos extraídos:', data);
      
      const formattedNotifications = Array.isArray(data) ? data.map((notification: any) => ({
        id: String(notification.id),
        title: notification.title,
        message: notification.message,
        notification_type: notification.notification_type || 'announcement',
        priority: notification.priority || 'normal',
        status: notification.status || 'draft',
        target_all_students: notification.target_all_students || false,
        target_all_companies: notification.target_all_companies || false,
        target_students: notification.target_students || [],
        target_companies: notification.target_companies || [],
        scheduled_at: notification.scheduled_at,
        sent_at: notification.sent_at,
        created_at: notification.created_at,
        created_by_name: notification.created_by_name || 'Admin',
        total_recipients: notification.total_recipients || 0,
        sent_count: notification.sent_count || 0,
        failed_count: notification.failed_count || 0,
        read_count: notification.read_count || 0,
      })) : [];
      
      setNotifications(formattedNotifications);
      console.log('Notificaciones masivas adaptadas:', formattedNotifications);
    } catch (error) {
      console.error('Error fetching mass notifications:', error);
      setError('Error al cargar las notificaciones masivas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor corrija los errores en el formulario', 
        severity: 'error' 
      });
      return;
    }

    try {
      const notificationData = {
        ...formData,
        status: 'draft', // Siempre será draft, se enviará inmediatamente
      };

      console.log('Enviando datos de notificación:', notificationData);
      console.log('formData completo:', formData);
      await apiService.post('/api/mass-notifications/create/', notificationData);

      setSnackbar({ 
        open: true, 
        message: 'Notificación masiva creada exitosamente', 
        severity: 'success' 
      });
      
      setShowCreateDialog(false);
      resetForm();
      await fetchNotifications();
    } catch (error: any) {
      console.error('Error creating mass notification:', error);
      let errorMessage = 'Error al crear la notificación masiva';
      
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const detailMessages = Object.entries(details).map(([field, message]) => `${field}: ${message}`).join(', ');
        errorMessage = `Errores de validación: ${detailMessages}`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      await apiService.post(`/api/mass-notifications/${notificationId}/send/`);
      
      setSnackbar({ 
        open: true, 
        message: 'Notificación masiva enviada exitosamente', 
        severity: 'success' 
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error sending mass notification:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al enviar la notificación masiva', 
        severity: 'error' 
      });
    }
  };



  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      notification_type: 'announcement',
      priority: 'normal',
      target_all_students: false,
      target_all_companies: false,
      target_student_ids: [],
      target_company_ids: [],
    });
    setFormErrors({});
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <InfoIcon color="info" />;
      case 'reminder': return <WarningIcon color="warning" />;
      case 'alert': return <ErrorIcon color="error" />;
      case 'update': return <CheckCircleIcon color="success" />;
      case 'event': return <InfoIcon color="primary" />;
      case 'deadline': return <WarningIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'info';
      case 'reminder': return 'warning';
      case 'alert': return 'error';
      case 'update': return 'success';
      case 'event': return 'primary';
      case 'deadline': return 'error';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'warning';
      case 'sending': return 'info';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'scheduled': return 'Programada';
      case 'sending': return 'Enviando';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelada';
      case 'failed': return 'Fallida';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'announcement': return 'Anuncio';
      case 'reminder': return 'Recordatorio';
      case 'alert': return 'Alerta';
      case 'update': return 'Actualización';
      case 'event': return 'Evento';
      case 'deadline': return 'Fecha límite';
      default: return type;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja';
      case 'normal': return 'Normal';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTargetText = (notification: MassNotification) => {
    if (notification.target_all_students && notification.target_all_companies) {
      return 'Todos los usuarios';
    } else if (notification.target_all_students) {
      return 'Todos los estudiantes';
    } else if (notification.target_all_companies) {
      return 'Todas las empresas';
    } else {
      const targets = [];
      if (notification.target_students.length > 0) {
        targets.push(`${notification.target_students.length} estudiantes`);
      }
      if (notification.target_companies.length > 0) {
        targets.push(`${notification.target_companies.length} empresas`);
      }
      return targets.length > 0 ? targets.join(', ') : 'Sin destinatarios';
    }
  };

  // Función para truncar texto largo
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Función para verificar si el texto necesita ser truncado
  const shouldTruncate = (text: string, maxLength: number = 100) => {
    return text.length > maxLength;
  };

  const filteredNotifications = notifications.filter(notification =>
    (notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     notification.message.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter ? notification.notification_type === typeFilter : true) &&
    (statusFilter ? notification.status === statusFilter : true) &&
    (priorityFilter ? notification.priority === priorityFilter : true)
  );

  // Debug: mostrar información de filtrado
  console.log('Filtros aplicados:', { statusFilter, typeFilter, priorityFilter });
  console.log('Notificaciones filtradas:', filteredNotifications.map(n => ({ id: n.id, title: n.title, status: n.status })));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
              <AdminIcon sx={{ fontSize: 32, color: 'white' }} />
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
                Gestión de Notificaciones Masivas
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Administra y envía notificaciones masivas a estudiantes y empresas
              </Typography>
            </Box>
          </Box>
          
          {/* Indicadores de estado */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<NotificationsIcon />}
              label={`${notifications.length} Total`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<SendIcon />}
              label={`${notifications.filter(n => n.status === 'sent').length} Enviadas`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={`${notifications.filter(n => n.status === 'draft').length} Borradores`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<PriorityHighIcon />}
              label={`${notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length} Alta Prioridad`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros mejorados */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 4, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Filtros y Búsqueda
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setShowCreateDialog(true)}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Nueva Notificación
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                <MenuItem value="announcement">📢 Anuncio</MenuItem>
                <MenuItem value="reminder">⏰ Recordatorio</MenuItem>
                <MenuItem value="alert">🚨 Alerta</MenuItem>
                <MenuItem value="update">🔄 Actualización</MenuItem>
                <MenuItem value="event">📅 Evento</MenuItem>
                <MenuItem value="deadline">⏳ Fecha límite</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="sent">✅ Enviadas</MenuItem>
                <MenuItem value="draft">📝 Borrador</MenuItem>
                <MenuItem value="cancelled">❌ Canceladas</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="Prioridad"
                onChange={(e) => setPriorityFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas las prioridades</MenuItem>
                <MenuItem value="low">🔵 Baja</MenuItem>
                <MenuItem value="normal">🟢 Normal</MenuItem>
                <MenuItem value="medium">🟡 Media</MenuItem>
                <MenuItem value="high">🔴 Alta</MenuItem>
                <MenuItem value="urgent">🚨 Urgente</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={limit}
                label="Mostrar"
                onChange={(e) => setLimit(Number(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={5}>5 últimas</MenuItem>
                <MenuItem value={10}>10 últimas</MenuItem>
                <MenuItem value={20}>20 últimas</MenuItem>
                <MenuItem value={50}>50 últimas</MenuItem>
                <MenuItem value={100}>100 últimas</MenuItem>
                <MenuItem value={-1}>Todas</MenuItem>
              </Select>
            </FormControl>
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
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', 
        gap: 3,
        '& > *': {
          minHeight: 'fit-content',
          maxWidth: '600px'
        }
      }}>
        {(limit === -1 ? filteredNotifications : filteredNotifications.slice(0, limit)).map((notification) => (
          <Box key={notification.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.2s',
              position: 'relative',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }
            }}>
              {/* Indicador de texto truncado */}
              {(shouldTruncate(notification.title, 80) || shouldTruncate(notification.message, 150)) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    opacity: 0.7,
                    zIndex: 1
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  {getTypeIcon(notification.notification_type)}
                  <Box sx={{ flexGrow: 1 }}>
                                      <Tooltip 
                    title={shouldTruncate(notification.title, 80) ? notification.title : ''}
                    placement="top-start"
                    arrow
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        lineHeight: 1.3,
                        maxHeight: '3.9em', // 3 líneas máximo
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        position: 'relative',
                        cursor: shouldTruncate(notification.title, 80) ? 'help' : 'default'
                      }}
                    >
                      {notification.title}
                      {shouldTruncate(notification.title, 80) && (
                        <Box
                          component="span"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'linear-gradient(90deg, transparent 0%, white 50%)',
                            width: '2em',
                            height: '1.5em',
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                    </Typography>
                  </Tooltip>
                    {shouldTruncate(notification.title, 80) && (
                      <Typography 
                        variant="caption" 
                        color="primary.main" 
                        sx={{ 
                          mt: 0.5, 
                          display: 'block',
                          fontStyle: 'italic',
                          cursor: 'pointer',
                          fontWeight: 600,
                          '&:hover': { 
                            textDecoration: 'underline',
                            color: 'primary.dark'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedNotification(notification)}
                      >
                        📖 Ver título completo
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Tooltip 
                    title={shouldTruncate(notification.message, 150) ? notification.message : ''}
                    placement="top-start"
                    arrow
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        maxHeight: '4.5em', // 3 líneas máximo
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        position: 'relative',
                        cursor: shouldTruncate(notification.message, 150) ? 'help' : 'default'
                      }}
                    >
                      {notification.message}
                      {shouldTruncate(notification.message, 150) && (
                        <Box
                          component="span"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'linear-gradient(90deg, transparent 0%, white 50%)',
                            width: '2em',
                            height: '1.5em',
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                    </Typography>
                  </Tooltip>
                  {shouldTruncate(notification.message, 150) && (
                    <Typography 
                      variant="caption" 
                      color="primary.main" 
                      sx={{ 
                        mt: 1, 
                        display: 'block',
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        fontWeight: 600,
                        '&:hover': { 
                          textDecoration: 'underline',
                          color: 'primary.dark'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setSelectedNotification(notification)}
                    >
                      📖 Ver mensaje completo
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={getTypeText(notification.notification_type)} 
                    color={getTypeColor(notification.notification_type) as any}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={getStatusText(notification.status)} 
                    color={getStatusColor(notification.status) as any}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={getPriorityText(notification.priority)} 
                    color={getPriorityColor(notification.priority) as any}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BusinessIcon fontSize="small" />
                    <strong>Destinatarios:</strong> {getTargetText(notification)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SendIcon fontSize="small" />
                    <strong>Enviadas:</strong> {notification.sent_count}/{notification.total_recipients}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon fontSize="small" />
                    <strong>Creada:</strong> {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedNotification(notification)}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.light' }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleSendNotification(notification.id)}
                    disabled={notification.status === 'sent' || notification.status === 'sending' || notification.status === 'cancelled'}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.light' }
                    }}
                  >
                    <SendIcon />
                  </IconButton>

                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{ borderRadius: 2 }}
                >
                  {getStatusText(notification.status)}
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredNotifications.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          px: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: 3,
          mt: 3
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
              📭 No hay notificaciones masivas
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              No se encontraron notificaciones masivas. Crea una nueva notificación para comenzar a comunicarte con estudiantes y empresas.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setShowCreateDialog(true)}
              sx={{ 
                mt: 2,
                borderRadius: 2,
                px: 3,
                py: 1
              }}
              startIcon={<SendIcon />}
            >
              Crear Primera Notificación
            </Button>
          </Box>
        </Box>
      )}

      {/* Dialog para crear notificación */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SendIcon />
            Crear Nueva Notificación Masiva
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
            <TextField
              label="Mensaje"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              fullWidth
              required
              multiline
              minRows={3}
              sx={{ mb: 2 }}
              error={!!formErrors.message}
              helperText={formErrors.message}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.notification_type}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, notification_type: e.target.value as any })}
                >
                  <MenuItem value="announcement">📢 Anuncio</MenuItem>
                  <MenuItem value="reminder">⏰ Recordatorio</MenuItem>
                  <MenuItem value="alert">🚨 Alerta</MenuItem>
                  <MenuItem value="update">🔄 Actualización</MenuItem>
                  <MenuItem value="event">📅 Evento</MenuItem>
                  <MenuItem value="deadline">⏳ Fecha límite</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">🔵 Baja</MenuItem>
                  <MenuItem value="normal">🟢 Normal</MenuItem>
                  <MenuItem value="medium">🟡 Media</MenuItem>
                  <MenuItem value="high">🔴 Alta</MenuItem>
                  <MenuItem value="urgent">🚨 Urgente</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Destinatarios
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.target_all_students}
                    onChange={(e) => setFormData({ ...formData, target_all_students: e.target.checked })}
                  />
                }
                label="Enviar a todos los estudiantes"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.target_all_companies}
                    onChange={(e) => setFormData({ ...formData, target_all_companies: e.target.checked })}
                  />
                }
                label="Enviar a todas las empresas"
              />
              
              {formErrors.recipients && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {formErrors.recipients}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Seleccione al menos una opción de destinatarios. Si no selecciona ninguna, la notificación no se podrá crear.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateNotification}
            disabled={!formData.title.trim() || !formData.message.trim() || 
                     (!formData.target_all_students && !formData.target_all_companies)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Crear Notificación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={!!selectedNotification} onClose={() => setSelectedNotification(null)} maxWidth="md" fullWidth
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
              fontWeight: 600,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {getTypeIcon(selectedNotification.notification_type)}
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {selectedNotification.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedNotification.message}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label={getTypeText(selectedNotification.notification_type)} 
                  color={getTypeColor(selectedNotification.notification_type) as any}
                  sx={{ borderRadius: 1 }}
                />
                <Chip 
                  label={getStatusText(selectedNotification.status)} 
                  color={getStatusColor(selectedNotification.status) as any}
                  sx={{ borderRadius: 1 }}
                />
                <Chip 
                  label={getPriorityText(selectedNotification.priority)} 
                  variant="outlined"
                  color={getPriorityColor(selectedNotification.priority) as any}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" />
                  <strong>Destinatarios:</strong> {getTargetText(selectedNotification)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" />
                  <strong>Creada:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
                </Typography>
                {selectedNotification.sent_at && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SendIcon fontSize="small" />
                    <strong>Enviada:</strong> {new Date(selectedNotification.sent_at).toLocaleString()}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon fontSize="small" />
                  <strong>Estadísticas:</strong> {selectedNotification.sent_count} enviadas, {selectedNotification.read_count} leídas de {selectedNotification.total_recipients} destinatarios
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
              <Button 
                onClick={() => setSelectedNotification(null)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 