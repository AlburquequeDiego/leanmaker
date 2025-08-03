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
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
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

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiService.delete(`/api/mass-notifications/${notificationId}/delete/`);
      
      setSnackbar({ 
        open: true, 
        message: 'Notificación masiva cancelada exitosamente', 
        severity: 'success' 
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error cancelling mass notification:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al cancelar la notificación masiva', 
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
        Gestión de Notificaciones Masivas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros y acciones */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              variant="outlined"
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="announcement">Anuncio</MenuItem>
                <MenuItem value="reminder">Recordatorio</MenuItem>
                <MenuItem value="alert">Alerta</MenuItem>
                <MenuItem value="update">Actualización</MenuItem>
                <MenuItem value="event">Evento</MenuItem>
                <MenuItem value="deadline">Fecha límite</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="sent">Enviadas</MenuItem>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="cancelled">Canceladas</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="Prioridad"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={limit}
                label="Mostrar"
                onChange={(e) => setLimit(Number(e.target.value))}
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
          <Box sx={{ flex: '0 1 auto', minWidth: 0 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setShowCreateDialog(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nueva Notificación
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Lista de notificaciones */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
        Historial de Notificaciones
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
        {(limit === -1 ? filteredNotifications : filteredNotifications.slice(0, limit)).map((notification) => (
          <Box key={notification.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getTypeIcon(notification.notification_type)}
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {notification.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={getTypeText(notification.notification_type)} 
                    color={getTypeColor(notification.notification_type) as any}
                    size="small"
                  />
                  <Chip 
                    label={getStatusText(notification.status)} 
                    color={getStatusColor(notification.status) as any}
                    size="small"
                  />
                  <Chip 
                    label={getPriorityText(notification.priority)} 
                    color={getPriorityColor(notification.priority) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" component="div">
                  <strong>Destinatarios:</strong> {getTargetText(notification)}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  <strong>Enviadas:</strong> {notification.sent_count}/{notification.total_recipients}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  <strong>Creada:</strong> {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleSendNotification(notification.id)}
                    disabled={notification.status === 'sent' || notification.status === 'sending' || notification.status === 'cancelled'}
                  >
                    <SendIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteNotification(notification.id)}
                    disabled={notification.status === 'cancelled'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled
                  >
                  {getStatusText(notification.status)}
                  </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredNotifications.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron notificaciones masivas que coincidan con los filtros aplicados.
        </Alert>
      )}

      {/* Dialog para crear notificación */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Notificación Masiva</DialogTitle>
        <DialogContent>
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
                  <MenuItem value="announcement">Anuncio</MenuItem>
                  <MenuItem value="reminder">Recordatorio</MenuItem>
                  <MenuItem value="alert">Alerta</MenuItem>
                  <MenuItem value="update">Actualización</MenuItem>
                  <MenuItem value="event">Evento</MenuItem>
                  <MenuItem value="deadline">Fecha límite</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
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
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateNotification}
            disabled={!formData.title.trim() || !formData.message.trim() || 
                     (!formData.target_all_students && !formData.target_all_companies)}
          >
            Crear Notificación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={!!selectedNotification} onClose={() => setSelectedNotification(null)} maxWidth="md" fullWidth>
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTypeIcon(selectedNotification.notification_type)}
                {selectedNotification.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label={getTypeText(selectedNotification.notification_type)} 
                  color={getTypeColor(selectedNotification.notification_type) as any}
                />
                <Chip 
                  label={getStatusText(selectedNotification.status)} 
                  color={getStatusColor(selectedNotification.status) as any}
                />
                <Chip 
                  label={getPriorityText(selectedNotification.priority)} 
                  variant="outlined"
                  color={getPriorityColor(selectedNotification.priority) as any}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" component="div">
                <strong>Destinatarios:</strong> {getTargetText(selectedNotification)}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <strong>Creada:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
              </Typography>
              {selectedNotification.sent_at && (
                <Typography variant="body2" color="text.secondary" component="div">
                  <strong>Enviada:</strong> {new Date(selectedNotification.sent_at).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" component="div">
                <strong>Estadísticas:</strong> {selectedNotification.sent_count} enviadas, {selectedNotification.read_count} leídas de {selectedNotification.total_recipients} destinatarios
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedNotification(null)}>Cerrar</Button>
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