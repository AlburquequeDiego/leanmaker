import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Rating,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptInterviewList, adaptCalendarEvent } from '../../../utils/adapters';
import type { Interview, Application } from '../../../types';

const cantidadOpciones = [5, 10, 20, 50, 'todas'];

export const CompanyInterviews: React.FC = () => {
  const api = useApi();
  const [events, setEvents] = useState<any[]>([]); // Solo eventos tipo 'interview'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const now = new Date();
  const pendingInterviews = events.filter(ev =>
    ev.status === 'scheduled' && new Date(ev.start_date) > now
  );
  const completedInterviews = events.filter(ev =>
    ev.status === 'completed' || (ev.status === 'scheduled' && new Date(ev.start_date) <= now)
  );
  const [sectionCount, setSectionCount] = useState(10);
  const allInterviews = [...pendingInterviews, ...completedInterviews].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  const allInterviewsToShow = allInterviews.slice(0, sectionCount);


  useEffect(() => {
    loadInterviewEvents();
  }, []);

  const loadInterviewEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Entrevistas] Iniciando carga de entrevistas...');
      // Usar el endpoint específico para empresas
      const response = await api.get('/api/calendar/events/company_events/?event_type=interview');
      console.log('[Entrevistas] Respuesta recibida:', response);
      const data = response.results && Array.isArray(response.results)
        ? response.results
        : [];
      console.log('[Entrevistas] Data cruda antes de adaptar:', data);
      const adaptedEvents = data.map(adaptCalendarEvent);
      console.log('[Entrevistas] Eventos adaptados:', adaptedEvents);
      setEvents(adaptedEvents);
    } catch (err: any) {
      console.error('[Entrevistas] Error al cargar entrevistas:', err);
      setError(err.response?.data?.error || 'Error al cargar entrevistas');
      setEvents([]);
    } finally {
      setLoading(false);
      console.log('[Entrevistas] Fin de carga.');
    }
  };

  // Eliminar el botón y lógica de edición de entrevistas (handleOpenEdit, handleSaveEdit, etc). Solo mostrar los datos.

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar la interfaz SIEMPRE, aunque haya error, con mensaje arriba
  // Si hay error, mostrar alerta arriba y permitir reintentar

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={loadInterviewEvents} variant="contained" sx={{ ml: 2 }} size="small">Reintentar</Button>
        </Alert>
      )}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Entrevistas Pendientes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualiza y gestiona las entrevistas agendadas con estudiantes. Solo puedes cambiar la fecha/hora.
        </Typography>
        {/* Cuadros de conteo */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Paper elevation={3} sx={{ bgcolor: '#e3f2fd', borderRadius: 3, p: 3, minWidth: 200, textAlign: 'center' }}>
            <Typography variant="h6" color="#1976d2" fontWeight={700}>Pendientes</Typography>
            <Typography variant="h2" color="#1976d2" fontWeight={700}>{pendingInterviews.length}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ bgcolor: '#e8f5e9', borderRadius: 3, p: 3, minWidth: 200, textAlign: 'center' }}>
            <Typography variant="h6" color="#388e3c" fontWeight={700}>Completadas</Typography>
            <Typography variant="h2" color="#388e3c" fontWeight={700}>{completedInterviews.length}</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Eliminar cualquier Card o Box que muestre solo el conteo de entrevistas pendientes antes de las tarjetas principales. Solo dejar el Box con display flex que contiene las dos tarjetas grandes (pendientes y completadas). */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mt: 6 }}>
        {/* Tarjeta de entrevistas pendientes */}
        <Box sx={{ minWidth: 320, maxWidth: 1200, width: '100%' }}>
          <Typography variant="h5" fontWeight={700} color="#1976d2" gutterBottom>
            Entrevistas Pendientes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {pendingInterviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No hay entrevistas pendientes
              </Typography>
            ) : (
              pendingInterviews.map((event, idx) => {
                const nombre = event.attendees[0] || 'Estudiante no asignado';
                const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                return (
                  <Paper key={event.id} elevation={4} sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: 2,
                    minWidth: 280,
                    maxWidth: 340,
                    flex: '1 1 320px',
                    boxShadow: 3,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 8,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#1976d2', fontWeight: 700 }}>{iniciales}</Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="#1976d2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {event.title}
                        </Typography>
                      </Box>
                      <Chip label="Pendiente" color="info" size="small" sx={{ fontWeight: 600 }} icon={<EventIcon />} />
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Fecha:</strong> {event.start_date ? new Date(event.start_date).toLocaleString() : '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Proyecto:</strong> {event.project_title || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Motivo:</strong> {event.description || '-'}</Typography>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </Box>

        {/* Tarjeta de entrevistas completadas */}
        <Box sx={{ minWidth: 320, maxWidth: 1200, width: '100%', mt: 6 }}>
          <Typography variant="h5" fontWeight={700} color="#388e3c" gutterBottom>
            Entrevistas Completadas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {completedInterviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No hay entrevistas completadas
              </Typography>
            ) : (
              completedInterviews.map((event, idx) => {
                const nombre = event.attendees[0] || 'Estudiante no asignado';
                const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                return (
                  <Paper key={event.id} elevation={4} sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: 2,
                    minWidth: 280,
                    maxWidth: 340,
                    flex: '1 1 320px',
                    boxShadow: 3,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 8,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#388e3c', fontWeight: 700 }}>{iniciales}</Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="#388e3c" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {event.title}
                        </Typography>
                      </Box>
                      <Chip label="Completada" color="success" size="small" sx={{ fontWeight: 600 }} icon={<EventIcon />} />
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Fecha:</strong> {event.start_date ? new Date(event.start_date).toLocaleString() : '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Proyecto:</strong> {event.project_title || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><strong>Motivo:</strong> {event.description || '-'}</Typography>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal para editar fecha/hora */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Fecha/Hora de Entrevista</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Nueva Fecha y Hora de Inicio"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Nueva Fecha y Hora de Fin"
              value={editEndDate}
              onChange={e => setEditEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained" color="primary">Guardar Cambios</Button>
        </DialogActions>
      </Dialog>

      {/* Historial de Entrevistas */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Historial de Entrevistas
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="body2">Mostrar:</Typography>
          <Select
            size="small"
            value={String(sectionCount)}
            onChange={e => setSectionCount(Number(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            {[10, 50, 100, 200].map(val => (
              <MenuItem key={val} value={val}>{`Últimas ${val}`}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {allInterviewsToShow.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              No hay entrevistas en el historial
            </Typography>
          ) : (
            allInterviewsToShow.map(event => (
              <Paper key={event.id} sx={{ p: 2, minWidth: 280, maxWidth: 400, flex: '1 1 320px', bgcolor: event.status === 'completed' ? '#e8f5e9' : '#e3f2fd', borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: event.status === 'completed' ? '#388e3c' : '#1976d2' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={event.status === 'completed' ? '#388e3c' : '#1976d2'}>
                      {event.attendees && event.attendees.length > 0 ? event.attendees.join(', ') : 'Estudiante no asignado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.title}
                    </Typography>
                  </Box>
                  <Chip label={event.status === 'completed' ? 'Completada' : 'Pendiente'} color={event.status === 'completed' ? 'success' : 'info'} size="small" sx={{ fontWeight: 600 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  <strong>Fecha:</strong> {event.start_date ? new Date(event.start_date).toLocaleString() : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  <strong>Proyecto:</strong> {event.project_title || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Motivo:</strong> {event.description || '-'}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyInterviews;