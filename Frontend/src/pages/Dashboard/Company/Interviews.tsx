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
  const pendingInterviews = events.filter(ev => new Date(ev.start_date) > now);
  const completedInterviews = events.filter(ev => new Date(ev.start_date) <= now);
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
      // Obtener solo eventos de tipo 'interview' del calendario
      const response = await api.get('/api/calendar/events/?event_type=interview');
      const adaptedEvents = (response.data.results || response.data).map(adaptCalendarEvent);
      setEvents(adaptedEvents);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar entrevistas');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (event: any) => {
    setSelectedEvent(event);
    setEditDate(event.start_date.slice(0, 16));
    setEditEndDate(event.end_date.slice(0, 16));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
    try {
      await api.put(`/api/calendar/events/${selectedEvent.id}/`, {
        start_date: editDate,
        end_date: editEndDate,
      });
      setEditDialogOpen(false);
      setSelectedEvent(null);
      loadInterviewEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar la fecha');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={loadInterviewEvents} variant="contained">Reintentar</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Entrevistas Pendientes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualiza y gestiona las entrevistas agendadas con estudiantes. Solo puedes cambiar la fecha/hora.
        </Typography>
      </Box>

      {/* Eliminar cualquier Card o Box que muestre solo el conteo de entrevistas pendientes antes de las tarjetas principales. Solo dejar el Box con display flex que contiene las dos tarjetas grandes (pendientes y completadas). */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mt: 6 }}>
        {/* Tarjeta de entrevistas pendientes */}
        <Box sx={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
          <Paper elevation={3} sx={{ bgcolor: '#f5faff', borderRadius: 3, p: 0, boxShadow: 3 }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="#1976d2" gutterBottom>
                Entrevistas Pendientes
              </Typography>
              <Typography variant="h2" fontWeight={700} color="#1976d2" sx={{ mb: 2 }}>
                {pendingInterviews.length}
              </Typography>
              {pendingInterviews.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center">
                  No hay entrevistas pendientes
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 300, overflowY: 'auto', width: '100%' }}>
                  {pendingInterviews.map(event => (
                    <Paper key={event.id} sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} color="#1976d2">
                            {event.attendees && event.attendees.length > 0 ? event.attendees.join(', ') : 'Estudiante no asignado'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.title}
                          </Typography>
                        </Box>
                        <Chip label="Pendiente" color="info" size="small" sx={{ fontWeight: 600 }} />
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
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleOpenEdit(event)}>
                          Cambiar Fecha/Hora
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Tarjeta de entrevistas completadas */}
        <Box sx={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
          <Paper elevation={3} sx={{ bgcolor: '#e8f5e9', borderRadius: 3, p: 0, boxShadow: 3 }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="#388e3c" gutterBottom>
                Entrevistas Completadas
              </Typography>
              <Typography variant="h2" fontWeight={700} color="#388e3c" sx={{ mb: 2 }}>
                {completedInterviews.length}
              </Typography>
              {completedInterviews.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center">
                  No hay entrevistas completadas
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 300, overflowY: 'auto', width: '100%' }}>
                  {completedInterviews.map(event => (
                    <Paper key={event.id} sx={{ mb: 2, p: 2, bgcolor: '#c8e6c9', borderRadius: 2, boxShadow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#388e3c' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} color="#388e3c">
                            {event.attendees && event.attendees.length > 0 ? event.attendees.join(', ') : 'Estudiante no asignado'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.title}
                          </Typography>
                        </Box>
                        <Chip label="Completada" color="success" size="small" sx={{ fontWeight: 600 }} />
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
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
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
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Guardar Cambios</Button>
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