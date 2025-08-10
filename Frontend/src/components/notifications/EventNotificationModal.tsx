import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider,
  Fade,
  Zoom,
  Slide,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { apiService } from '../../services/api.service';

interface EventNotificationModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
  };
}

interface EventDetails {
  id: string;
  title: string;
  message: string;
  event_date?: string;
  event_location?: string;
  event_description?: string;
  event_capacity?: number;
  event_type?: string;
  confirmed_count: number;
  maybe_count: number;
  declined_count: number;
  pending_count: number;
  user_registration?: {
    status: string;
    notes?: string;
  };
}

export const EventNotificationModal: React.FC<EventNotificationModalProps> = ({
  open,
  onClose,
  eventId,
  notification
}) => {
  const theme = useTheme();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles del evento
  useEffect(() => {
    if (open && eventId) {
      loadEventDetails();
    }
  }, [open, eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/api/mass-notifications/events/${eventId}/details/`);
      
      if (response.success) {
        setEventDetails(response.data);
        // Cargar notas si ya hay un registro
        if (response.data.user_registration?.notes) {
          setNotes(response.data.user_registration.notes);
        }
      } else {
        setError('Error al cargar detalles del evento');
      }
    } catch (err) {
      console.error('Error loading event details:', err);
      setError('Error al cargar detalles del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceAction = async (status: 'confirmed' | 'maybe' | 'declined') => {
    try {
      setSubmitting(true);
      setError(null);
      
      const data: any = { status };
      if (notes.trim()) {
        data.notes = notes.trim();
      }
      
      const response = await apiService.post('/api/mass-notifications/events/attendance/register/', {
        event_id: eventId,
        ...data
      });
      
      if (response.success) {
        // Recargar detalles del evento
        await loadEventDetails();
        setShowNotesInput(false);
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Error al registrar asistencia');
      }
    } catch (err) {
      console.error('Error registering attendance:', err);
      setError('Error al registrar asistencia');
    } finally {
      setSubmitting(false);
    }
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return 'Fecha por confirmar';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (eventType?: string) => {
    switch (eventType) {
      case 'workshop':
        return <SchoolIcon />;
      case 'conference':
        return <BusinessIcon />;
      case 'networking':
        return <PeopleIcon />;
      case 'presentation':
        return <StarIcon />;
      case 'meeting':
        return <GroupIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventTypeColor = (eventType?: string) => {
    switch (eventType) {
      case 'workshop':
        return 'primary';
      case 'conference':
        return 'secondary';
      case 'networking':
        return 'success';
      case 'presentation':
        return 'warning';
      case 'meeting':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'maybe':
        return 'warning';
      case 'declined':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'maybe':
        return 'Tal vez';
      case 'declined':
        return 'Declinado';
      default:
        return 'Pendiente';
    }
  };

  const isUserResponded = eventDetails?.user_registration?.status && 
                         eventDetails.user_registration.status !== 'pending';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={500}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header con animación */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CelebrationIcon sx={{ fontSize: 40, mr: 2, color: 'yellow' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                🎉 Evento Especial 🎉
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {notification.title}
              </Typography>
            </Box>
          </Box>
        </Fade>
        
        {/* Iconos flotantes animados */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
          <StarIcon sx={{ fontSize: 80, animation: 'twinkle 2s infinite' }} />
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Cargando detalles del evento...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : eventDetails ? (
          <Fade in={true} timeout={600}>
            <Box>
              {/* Información del evento */}
              <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getEventTypeIcon(eventDetails.event_type)}
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {eventDetails.event_type ? 
                            eventDetails.event_type.charAt(0).toUpperCase() + eventDetails.event_type.slice(1) : 
                            'Evento'
                          }
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {eventDetails.event_description || eventDetails.message}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatEventDate(eventDetails.event_date)}
                        </Typography>
                      </Box>
                      
                      {eventDetails.event_location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {eventDetails.event_location}
                          </Typography>
                        </Box>
                      )}
                      
                      {eventDetails.event_capacity && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <GroupIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Capacidad: {eventDetails.event_capacity} personas
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Estadísticas del evento */}
              <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    📊 Estadísticas del Evento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {eventDetails.confirmed_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confirmados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                          {eventDetails.maybe_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tal vez
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                          {eventDetails.declined_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Declinados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          {eventDetails.pending_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pendientes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Estado actual del usuario */}
              {isUserResponded && (
                <Alert 
                  severity="info" 
                  sx={{ mb: 3 }}
                  icon={<CheckIcon />}
                >
                  <Typography variant="body1">
                    Ya has respondido a este evento: 
                    <Chip 
                      label={getStatusText(eventDetails.user_registration!.status)}
                      color={getStatusColor(eventDetails.user_registration!.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Alert>
              )}

              {/* Botones de acción */}
              {!isUserResponded && (
                <Card sx={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      🎯 ¿Confirmas tu asistencia?
                    </Typography>
                    
                    {showNotesInput && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notas adicionales (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Agrega una nota sobre tu asistencia..."
                        variant="outlined"
                        sx={{ mb: 3 }}
                      />
                    )}
                    
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <Zoom in={true} timeout={300}>
                          <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAttendanceAction('confirmed')}
                            disabled={submitting}
                            sx={{ 
                              minWidth: 140,
                              py: 1.5,
                              px: 3,
                              borderRadius: 3,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 25px rgba(76, 175, 80, 0.6)'
                              }
                            }}
                          >
                            ✅ Confirmar
                          </Button>
                        </Zoom>
                      </Grid>
                      
                      <Grid item>
                        <Zoom in={true} timeout={400}>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="large"
                            startIcon={<HelpIcon />}
                            onClick={() => setShowNotesInput(!showNotesInput)}
                            disabled={submitting}
                            sx={{ 
                              minWidth: 140,
                              py: 1.5,
                              px: 3,
                              borderRadius: 3,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              borderWidth: 2,
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                borderWidth: 2
                              }
                            }}
                          >
                            🤔 Tal vez
                          </Button>
                        </Zoom>
                      </Grid>
                      
                      <Grid item>
                        <Zoom in={true} timeout={500}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            startIcon={<CancelIcon />}
                            onClick={() => setShowNotesInput(!showNotesInput)}
                            disabled={submitting}
                            sx={{ 
                              minWidth: 140,
                              py: 1.5,
                              px: 3,
                              borderRadius: 3,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              borderWidth: 2,
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                borderWidth: 2
                              }
                            }}
                          >
                            ❌ Declinar
                          </Button>
                        </Zoom>
                      </Grid>
                    </Grid>
                    
                    {showNotesInput && (
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => {
                            if (notes.trim()) {
                              handleAttendanceAction('maybe');
                            } else {
                              handleAttendanceAction('declined');
                            }
                          }}
                          disabled={submitting}
                          sx={{ 
                            minWidth: 200,
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Fade>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          startIcon={<CloseIcon />}
          sx={{ 
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          Cerrar
        </Button>
      </DialogActions>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </Dialog>
  );
};
