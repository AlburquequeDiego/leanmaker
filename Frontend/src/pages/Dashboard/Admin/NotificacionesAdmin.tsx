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
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_type: 'all' | 'students' | 'companies' | 'admins' | 'specific';
  target_ids?: string[];
  status: 'draft' | 'sent' | 'scheduled';
  created_at: string;
  sent_at?: string;
  scheduled_at?: string;
  created_by: string;
  read_count: number;
  total_recipients: number;
}



export default function NotificacionesAdmin() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    target_type: 'all' as 'all' | 'students' | 'companies' | 'admins' | 'specific',
    target_ids: [] as string[],
    scheduled_at: '',
    save_as_template: false,
    template_name: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/notifications/');
      const formattedNotifications = Array.isArray(data) ? data.map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        target_type: notification.target_type || 'all',
        target_ids: notification.target_ids || [],
        status: notification.status || 'draft',
        created_at: notification.created_at,
        sent_at: notification.sent_at,
        scheduled_at: notification.scheduled_at,
        created_by: notification.created_by || 'Admin',
        read_count: notification.read_count || 0,
        total_recipients: notification.total_recipients || 0,
      })) : [];
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateNotification = async () => {
    try {
      const notificationData = {
        ...formData,
        status: formData.scheduled_at ? 'scheduled' : 'draft',
      };

      await apiService.post('/api/notifications/', notificationData);
      
      if (formData.save_as_template && formData.template_name) {
        const templateData = {
          name: formData.template_name,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target_type: formData.target_type,
        };
        await apiService.post('/api/notification-templates/', templateData);
      }

      setSnackbar({ 
        open: true, 
        message: 'Notificación creada exitosamente', 
        severity: 'success' 
      });
      
      setShowCreateDialog(false);
      resetForm();
      await fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al crear la notificación', 
        severity: 'error' 
      });
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      await apiService.patch(`/api/notifications/${notificationId}/`, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Notificación enviada exitosamente', 
        severity: 'success' 
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al enviar la notificación', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiService.delete(`/api/notifications/${notificationId}/`);
      
      setSnackbar({ 
        open: true, 
        message: 'Notificación eliminada exitosamente', 
        severity: 'success' 
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al eliminar la notificación', 
        severity: 'error' 
      });
    }
  };



  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_type: 'all',
      target_ids: [],
      scheduled_at: '',
      save_as_template: false,
      template_name: '',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'scheduled': return 'Programada';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getTargetText = (target: string) => {
    switch (target) {
      case 'all': return 'Todos';
      case 'students': return 'Estudiantes';
      case 'companies': return 'Empresas';
      case 'admins': return 'Administradores';
      case 'specific': return 'Específicos';
      default: return target;
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter ? notification.type === typeFilter : true) &&
    (statusFilter ? notification.status === statusFilter : true) &&
    (targetFilter ? notification.target_type === targetFilter : true)
  );

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
        Gestión de Notificaciones
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
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="info">Información</MenuItem>
                <MenuItem value="warning">Advertencia</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="success">Éxito</MenuItem>
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
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="sent">Enviada</MenuItem>
                <MenuItem value="scheduled">Programada</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Destinatario</InputLabel>
              <Select
                value={targetFilter}
                label="Destinatario"
                onChange={(e) => setTargetFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="all">Todos los usuarios</MenuItem>
                <MenuItem value="students">Estudiantes</MenuItem>
                <MenuItem value="companies">Empresas</MenuItem>
                <MenuItem value="admins">Administradores</MenuItem>
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
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
        {filteredNotifications.map((notification) => (
          <Box key={notification.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getTypeIcon(notification.type)}
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {notification.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={getTypeText(notification.type)} 
                    color={getTypeColor(notification.type) as any}
                    size="small"
                  />
                  <Chip 
                    label={getStatusText(notification.status)} 
                    color={getStatusColor(notification.status) as any}
                    size="small"
                  />
                  <Chip 
                    label={getTargetText(notification.target_type)} 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.created_at).toLocaleString()}
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
                    disabled={notification.status === 'sent'}
                  >
                    <SendIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {notification.status === 'draft' && (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                  >
                    Borrador
                  </Button>
                )}
                {notification.status === 'scheduled' && (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                  >
                    Programada
                  </Button>
                )}
                {notification.status === 'sent' && (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                  >
                    Enviada
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredNotifications.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron notificaciones que coincidan con los filtros aplicados.
        </Alert>
      )}

      {/* Dialog para crear notificación */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Notificación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Descripción"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              fullWidth
              required
              multiline
              minRows={3}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value="info">Información</MenuItem>
                  <MenuItem value="warning">Advertencia</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="success">Éxito</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Destinatarios</InputLabel>
                <Select
                  value={formData.target_type}
                  label="Destinatarios"
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                >
                  <MenuItem value="all">Todos los usuarios</MenuItem>
                  <MenuItem value="students">Solo estudiantes</MenuItem>
                  <MenuItem value="companies">Solo empresas</MenuItem>
                  <MenuItem value="admins">Solo administradores</MenuItem>
                  <MenuItem value="specific">Usuarios específicos</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                label="Programar envío (opcional)"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.save_as_template}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, save_as_template: e.target.checked })}
                  />
                }
                label="Guardar como plantilla"
              />
            </Box>
            {formData.save_as_template && (
              <Box>
                <TextField
                  label="Nombre de la plantilla"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  fullWidth
                  required
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateNotification}
            disabled={!formData.title || !formData.message}
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
                {getTypeIcon(selectedNotification.type)}
                {selectedNotification.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label={getTypeText(selectedNotification.type)} 
                  color={getTypeColor(selectedNotification.type) as any}
                />
                <Chip 
                  label={getStatusText(selectedNotification.status)} 
                  color={getStatusColor(selectedNotification.status) as any}
                />
                <Chip 
                  label={getTargetText(selectedNotification.target_type)} 
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Creada:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
              </Typography>
              {selectedNotification.sent_at && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Enviada:</strong> {new Date(selectedNotification.sent_at).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                <strong>Leída:</strong> {selectedNotification.read_count} de {selectedNotification.total_recipients} destinatarios
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

function getTypeText(type: string): string {
  switch (type) {
    case 'success': return 'Éxito';
    case 'warning': return 'Advertencia';
    case 'error': return 'Error';
    default: return 'Información';
  }
} 