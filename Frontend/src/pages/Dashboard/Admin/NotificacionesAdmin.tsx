import { Box, Paper, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { useState } from 'react';
import { 
  NotificationsActive as NotificationsActiveIcon, 
  Send as SendIcon, 
  CheckCircle as CheckCircleIcon,
  Api as ApiIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';

const mockHistorial = [
  { id: 1, mensaje: 'Recordatorio: entrega de proyectos', destinatarios: 'Estudiantes', fecha: '2024-06-10 10:00', estado: 'Enviada' },
  { id: 2, mensaje: 'Bienvenida a nuevas empresas', destinatarios: 'Empresas', fecha: '2024-06-09 09:00', estado: 'Enviada' },
  { id: 3, mensaje: 'Aviso de mantenimiento', destinatarios: 'Todos', fecha: '2024-06-08 18:00', estado: 'Enviada' },
];

const mockNotificacionesAPI = [
  {
    id: 1,
    estudiante: 'María González',
    email: 'maria.gonzalez@estudiante.edu',
    nivelActual: 2,
    nivelSolicitado: 3,
    fecha: '2024-01-25 14:30',
    estado: 'Pendiente',
    puntuacion: 85,
    comentario: 'He completado varios proyectos exitosamente y creo que estoy listo para el siguiente nivel.'
  },
  {
    id: 2,
    estudiante: 'Carlos Ruiz',
    email: 'carlos.ruiz@estudiante.edu',
    nivelActual: 1,
    nivelSolicitado: 2,
    fecha: '2024-01-25 12:15',
    estado: 'Aprobada',
    puntuacion: 78,
    comentario: 'He mejorado significativamente mis habilidades técnicas.'
  },
  {
    id: 3,
    estudiante: 'Ana Martínez',
    email: 'ana.martinez@estudiante.edu',
    nivelActual: 3,
    nivelSolicitado: 4,
    fecha: '2024-01-25 10:45',
    estado: 'Rechazada',
    puntuacion: 65,
    comentario: 'Solicito evaluación para nivel experto.'
  },
];

const plantillas = [
  { id: 1, texto: 'Recordatorio: entrega de proyectos' },
  { id: 2, texto: 'Bienvenida a nuevos usuarios' },
  { id: 3, texto: 'Aviso de mantenimiento' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NotificacionesAdmin() {
  const [tabValue, setTabValue] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [destinatarios, setDestinatarios] = useState('Todos');
  const [plantilla, setPlantilla] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [apiDialog, setApiDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlantilla = (id: string) => {
    const plantillaSeleccionada = plantillas.find(p => p.id.toString() === id);
    if (plantillaSeleccionada) {
      setMensaje(plantillaSeleccionada.texto);
      setPlantilla(id);
    }
  };

  const handleSend = () => {
    if (!mensaje.trim() || !destinatarios) {
      setError('Completa el mensaje y los destinatarios.');
      return;
    }
    setSuccessMessage('¡Notificación enviada exitosamente!');
    setShowSuccess(true);
    setMensaje('');
    setPlantilla('');
    setError('');
  };

  const handleApiNotification = (notification: any) => {
    setSelectedNotification(notification);
    setApiDialog(true);
  };

  const handleApiAction = (action: 'approve' | 'reject') => {
    const actionText = action === 'approve' ? 'aprobada' : 'rechazada';
    setSuccessMessage(`Solicitud de API ${actionText} para ${selectedNotification.estudiante}`);
    setShowSuccess(true);
    setApiDialog(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Aprobada': return 'success';
      case 'Rechazada': return 'error';
      default: return 'default';
    }
  };

  const getNivelIcon = (nivelActual: number, nivelSolicitado: number) => {
    if (nivelSolicitado > nivelActual) {
      return <TrendingUpIcon color="success" />;
    } else if (nivelSolicitado < nivelActual) {
      return <TrendingDownIcon color="error" />;
    }
    return <ApiIcon color="primary" />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <NotificationsActiveIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Notificaciones</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Notificaciones Masivas" />
          <Tab label="Solicitudes de API" />
        </Tabs>

        {/* Tab: Notificaciones Masivas */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <SendIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5">Envío de Notificaciones Masivas</Typography>
          </Box>
          
          <Paper sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Plantilla</InputLabel>
                <Select
                  value={plantilla}
                  label="Plantilla"
                  onChange={e => handlePlantilla(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Sin plantilla</MenuItem>
                  {plantillas.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.texto}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Mensaje"
                multiline
                minRows={3}
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                fullWidth
                sx={{ borderRadius: 2 }}
                error={!!error && !mensaje.trim()}
                helperText={!!error && !mensaje.trim() ? error : ''}
              />
              <FormControl fullWidth>
                <InputLabel>Destinatarios</InputLabel>
                <Select
                  value={destinatarios}
                  label="Destinatarios"
                  onChange={e => setDestinatarios(e.target.value)}
                  sx={{ borderRadius: 2 }}
                  error={!!error && !destinatarios}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Estudiantes">Estudiantes</MenuItem>
                  <MenuItem value="Empresas">Empresas</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SendIcon />}
                sx={{ borderRadius: 2, fontSize: 18, py: 1.5, mt: 1 }}
                onClick={handleSend}
              >
                Enviar Notificación
              </Button>
            </Stack>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Historial de Notificaciones</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mensaje</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Destinatarios</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockHistorial.map(n => (
                  <TableRow key={n.id} hover>
                    <TableCell>{n.mensaje}</TableCell>
                    <TableCell>{n.destinatarios}</TableCell>
                    <TableCell>{n.fecha}</TableCell>
                    <TableCell>
                      <Chip 
                        label={n.estado} 
                        color={n.estado === 'Enviada' ? 'success' : 'warning'} 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Solicitudes de API */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <ApiIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5">Solicitudes de Cambio de Nivel API</Typography>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiante</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nivel Actual</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nivel Solicitado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Puntuación</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockNotificacionesAPI.map(notification => (
                  <TableRow key={notification.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {notification.estudiante}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`API ${notification.nivelActual}`} 
                        color="primary" 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getNivelIcon(notification.nivelActual, notification.nivelSolicitado)}
                        <Chip 
                          label={`API ${notification.nivelSolicitado}`} 
                          color="secondary" 
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {notification.puntuacion}%
                      </Typography>
                    </TableCell>
                    <TableCell>{notification.fecha}</TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.estado} 
                        color={getEstadoColor(notification.estado) as any}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {notification.estado === 'Pendiente' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleApiNotification(notification)}
                          sx={{ borderRadius: 2 }}
                        >
                          Revisar
                        </Button>
                      )}
                      {notification.estado !== 'Pendiente' && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleApiNotification(notification)}
                          sx={{ borderRadius: 2 }}
                        >
                          Ver Detalles
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Diálogo para revisar solicitud de API */}
      <Dialog 
        open={apiDialog} 
        onClose={() => setApiDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApiIcon color="primary" />
          Revisar Solicitud de Cambio de Nivel API
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Estudiante: {selectedNotification.estudiante}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedNotification.email}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Nivel Actual</Typography>
                  <Chip 
                    label={`API ${selectedNotification.nivelActual}`} 
                    color="primary" 
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Nivel Solicitado</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getNivelIcon(selectedNotification.nivelActual, selectedNotification.nivelSolicitado)}
                    <Chip 
                      label={`API ${selectedNotification.nivelSolicitado}`} 
                      color="secondary" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Puntuación del Cuestionario</Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  {selectedNotification.puntuacion}%
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Comentario del Estudiante</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2">
                    {selectedNotification.comentario}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Fecha de Solicitud</Typography>
                <Typography variant="body2">
                  {selectedNotification.fecha}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setApiDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          {selectedNotification?.estado === 'Pendiente' && (
            <>
              <Button 
                onClick={() => handleApiAction('reject')}
                variant="contained"
                color="error"
                sx={{ borderRadius: 2 }}
              >
                Rechazar
              </Button>
              <Button 
                onClick={() => handleApiAction('approve')}
                variant="contained"
                color="success"
                sx={{ borderRadius: 2 }}
              >
                Aprobar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
} 