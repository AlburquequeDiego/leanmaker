import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Fade,
  Grow,
  Zoom,
  Snackbar,
  Modal,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Celebration as CelebrationIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { notificationService } from '../../services/notification.service';
import { apiService } from '../../services/api.service';

interface EventNotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    created_at: string;
    read: boolean;
    metadata?: {
      event_date?: string;
      event_location?: string;
      event_description?: string;
      event_capacity?: number;
      event_type?: string;
    };
  };
  onStatusChange?: (notificationId: string, newStatus: string) => void;
  onClose?: () => void;
}

export const EventNotificationCard: React.FC<EventNotificationCardProps> = ({
  notification,
  onStatusChange,
  onClose
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'confirmed' | 'declined' | 'maybe'>('pending');
  const [loading, setLoading] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'decline' | 'maybe' | null>(null);

  // Extraer información del evento del mensaje o metadata
  const eventInfo = notification.metadata || {};
  
  // Lógica mejorada para detectar notificaciones de eventos
  const isEventNotification = () => {
    // Verificar si es explícitamente un evento
    if (notification.type === 'event') return true;
    
    // Verificar si tiene metadata de evento
    if (eventInfo.event_date || eventInfo.event_location || eventInfo.event_type) return true;
    
    // Verificar palabras clave en el título o mensaje
    const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
    const eventKeywords = ['evento', 'reunión', 'entrevista', 'invitación', 'cita', 'appointment', 'meeting'];
    
    return eventKeywords.some(keyword => text.includes(keyword));
  };

  // Debug: Log para verificar que el componente se esté renderizando
  console.log('🎯 EventNotificationCard renderizando:', {
    title: notification.title,
    type: notification.type,
    metadata: notification.metadata,
    isEvent: isEventNotification(),
    attendanceStatus,
    isEventPast: isEventPast()
  });

  // SIEMPRE renderizar para notificaciones tipo evento, no retornar null
  // Esto asegura que los botones de respuesta RSVP se muestren
  if (!isEventNotification()) {
    console.log('❌ No es notificación de evento, pero renderizando de todas formas para debug');
    // No retornar null, continuar con el renderizado
  }

  // Usar información del mensaje si no hay metadata
  const eventDate = eventInfo.event_date || notification.created_at;
  const eventLocation = eventInfo.event_location || 'Ubicación por confirmar';
  const eventDescription = eventInfo.event_description || notification.message;

  // Función para abrir el modal de detalles
  const handleOpenDetailModal = () => {
    setShowDetailModal(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Función mejorada para manejar acciones de asistencia
  const handleAttendanceAction = async (action: 'confirm' | 'decline' | 'maybe') => {
    // Validaciones previas
    if (loading) {
      console.warn('Ya hay una acción en proceso');
      return;
    }

    if (attendanceStatus !== 'pending') {
      console.warn('Ya se ha respondido a este evento');
      return;
    }

    setLoading(true);
    setError(null);
    setActionType(action);
    
    try {
      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar nuestro nuevo endpoint de mass_notifications
      const endpoint = `/api/mass-notifications/events/attendance/register/`;
      const data = {
        event_id: notification.id,
        status: action === 'confirm' ? 'confirmed' : action === 'decline' ? 'declined' : 'maybe',
        notes: notes.trim() || null
      };

      console.log('📤 Enviando respuesta de asistencia:', data);

      const response = await apiService.post(endpoint, data);
      
      if (response.success) {
        const newStatus = action === 'confirm' ? 'confirmed' : action === 'decline' ? 'declined' : 'maybe';
        setAttendanceStatus(newStatus);
        
        // Mostrar mensaje de éxito
        const successMessages = {
          'confirm': '¡Perfecto! Has confirmado tu asistencia al evento',
          'decline': 'Has declinado la invitación al evento',
          'maybe': 'Has marcado que tal vez asistirás al evento'
        };
        setSuccessMessage(successMessages[action]);
        
        // Actualizar estado en el componente padre
        if (onStatusChange) {
          onStatusChange(notification.id, action);
        }
        
        // Cerrar diálogo de notas si estaba abierto
        setShowNotesDialog(false);
        setNotes('');
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
        
        console.log('✅ Respuesta de asistencia enviada exitosamente:', newStatus);
      } else {
        throw new Error(response.message || 'Error al procesar la respuesta');
      }
    } catch (error: any) {
      console.error('❌ Error updating attendance:', error);
      const errorMessage = error.message || 'Error al procesar tu respuesta. Por favor, intenta de nuevo.';
      setError(errorMessage);
      
      // Limpiar error después de 5 segundos
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Función para abrir diálogo de notas con tipo de acción
  const handleOpenNotesDialog = (action: 'maybe' | 'decline') => {
    setActionType(action);
    setShowNotesDialog(true);
  };

  // Función para confirmar directamente (sin notas)
  const handleConfirmDirectly = () => {
    handleAttendanceAction('confirm');
  };

  // Función para reintentar en caso de error
  const handleRetry = () => {
    if (actionType) {
      handleAttendanceAction(actionType);
    }
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return 'Fecha por confirmar';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmed': 'success',
      'declined': 'error',
      'maybe': 'warning',
      'pending': 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'confirmed': '✅ Confirmado',
      'declined': '❌ Declinado',
      'maybe': '❓ Tal vez',
      'pending': '⏳ Pendiente'
    };
    return texts[status as keyof typeof texts] || 'Pendiente';
  };

  // Verificar si el evento ya pasó
  const isEventPast = () => {
    if (!eventInfo.event_date) return false;
    try {
      const eventDate = new Date(eventInfo.event_date);
      const now = new Date();
      return eventDate < now;
    } catch {
      return false;
    }
  };

  console.log('✅ Renderizando EventNotificationCard para:', notification.title);

  // Debug adicional para verificar el estado
  console.log('🔍 Estado del componente:', {
    isEventNotification: isEventNotification(),
    attendanceStatus,
    isEventPast: isEventPast(),
    shouldShowButtons: isEventNotification() && attendanceStatus === 'pending' && !isEventPast()
  });

  return (
    <>
      {/* Mensaje de debug visible */}
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body1">
          🚨 DEBUG: EventNotificationCard renderizado para: {notification.title}
        </Typography>
      </Alert>

      {/* Tarjeta clickeable que abre el modal */}
      <Fade in={true} timeout={800}>
        <Card
          elevation={8}
          onClick={handleOpenDetailModal}
          sx={{
            border: '2px solid',
            borderColor: notification.read ? 'divider' : '#ff6b35',
            borderRadius: 4,
            mb: 3,
            backgroundColor: notification.read ? 'background.paper' : 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)',
            position: 'relative',
            overflow: 'hidden',
            transform: notification.read ? 'scale(1)' : 'scale(1.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 20px 40px rgba(255, 107, 53, 0.3)',
              borderColor: '#ff6b35'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%)',
              animation: 'shimmer 2s infinite'
            },
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header con icono y título */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  borderRadius: '50%',
                  p: 1.5,
                  mr: 2,
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
                  animation: 'pulse 2s infinite'
                }}
              >
                <EventIcon 
                  sx={{ color: 'white', fontSize: 28 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '1.4rem'
                  }}
                >
                  🎉 {notification.title || 'Evento'}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  {notification.message || 'Descripción del evento'}
                </Typography>
                
                {/* Botón para ver detalles */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                  sx={{
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    '&:hover': {
                      borderColor: '#f7931e',
                      backgroundColor: 'rgba(255, 107, 53, 0.1)'
                    }
                  }}
                >
                  Ver detalles y responder
                </Button>
              </Box>
              {onClose && (
                <Zoom in={true} timeout={1000}>
                  <IconButton 
                    size="large" 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que se abra el modal
                      onClose();
                    }}
                    sx={{ 
                      ml: 1,
                      color: '#ff6b35',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        transform: 'rotate(90deg)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CloseIcon fontSize="large" />
                  </IconButton>
                </Zoom>
              )}
            </Box>

            {/* Información básica del evento */}
            {(eventInfo.event_date || eventInfo.event_location || eventInfo.event_type) && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255, 107, 53, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(255, 107, 53, 0.2)'
              }}>
                {eventInfo.event_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: '#ff6b35', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      📅 {formatEventDate(eventInfo.event_date)}
                    </Typography>
                  </Box>
                )}
                
                {eventInfo.event_location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: '#ff6b35', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      📍 {eventInfo.event_location}
                    </Typography>
                  </Box>
                )}
                
                {eventInfo.event_type && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ mr: 1, color: '#ff6b35', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      ⭐ {eventInfo.event_type.charAt(0).toUpperCase() + eventInfo.event_type.slice(1)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Modal de detalles con toda la funcionalidad RSVP */}
      <Modal
        open={showDetailModal}
        onClose={handleCloseDetailModal}
        aria-labelledby="event-detail-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            maxWidth: 800,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 4,
            position: 'relative',
            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            border: '3px solid #ff6b35',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header del modal */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              p: 3,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              position: 'relative'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontWeight: 700, 
                textAlign: 'center',
                mb: 1
              }}
            >
              🎉 {notification.title || 'Evento'}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              Detalles del Evento
            </Typography>
            
            {/* Botón cerrar */}
            <IconButton
              onClick={handleCloseDetailModal}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>

          {/* Contenido del modal */}
          <Box sx={{ p: 4 }}>
            {/* Descripción del evento */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ff6b35' }}>
                📝 Descripción
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                {eventDescription}
              </Typography>
            </Box>

            {/* Información detallada del evento */}
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              backgroundColor: 'rgba(255, 107, 53, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(255, 107, 53, 0.2)'
            }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#ff6b35' }}>
                📋 Información del Evento
              </Typography>
              
              {eventInfo.event_date && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 2, color: '#ff6b35', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Fecha y Hora</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      {formatEventDate(eventInfo.event_date)}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {eventInfo.event_location && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 2, color: '#ff6b35', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ubicación</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      {eventInfo.event_location}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {eventInfo.event_type && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ mr: 2, color: '#ff6b35', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tipo de Evento</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      {eventInfo.event_type.charAt(0).toUpperCase() + eventInfo.event_type.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {eventInfo.event_capacity && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CelebrationIcon sx={{ mr: 2, color: '#ff6b35', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Capacidad</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#ff6b35' }}>
                      {eventInfo.event_capacity} personas
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Estado actual de asistencia */}
            {attendanceStatus !== 'pending' && (
              <Grow in={true} timeout={500}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ff6b35' }}>
                    Tu Respuesta
                  </Typography>
                  <Chip
                    label={getStatusText(attendanceStatus)}
                    color={getStatusColor(attendanceStatus) as any}
                    size="large"
                    icon={attendanceStatus === 'confirmed' ? <CheckIcon /> : 
                          attendanceStatus === 'declined' ? <CancelIcon /> : <HelpIcon />}
                    sx={{ 
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      p: 2,
                      '& .MuiChip-icon': { fontSize: 28 }
                    }}
                  />
                </Box>
              </Grow>
            )}

            {/* Mensaje de debug */}
            {process.env.NODE_ENV === 'development' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🐛 Debug: isEventNotification: {isEventNotification().toString()}, 
                  attendanceStatus: {attendanceStatus}, 
                  isEventPast: {isEventPast().toString()}
                </Typography>
              </Alert>
            )}

            {/* Mensaje de error */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 4 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetry}
                    startIcon={<RefreshIcon />}
                  >
                    Reintentar
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {/* Botones de acción RSVP */}
            {isEventNotification() && (
              <Grow in={true} timeout={800}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#ff6b35' }}>
                    🎯 ¿Vas a asistir a este evento?
                  </Typography>
                  
                  {/* Debug info */}
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Estado: {attendanceStatus} | Evento pasado: {isEventPast() ? 'Sí' : 'No'}
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CheckIcon />}
                      onClick={handleConfirmDirectly}
                      disabled={loading || attendanceStatus !== 'pending'}
                      sx={{ 
                        minWidth: 160,
                        height: 56,
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: '0 12px 35px rgba(34, 197, 94, 0.6)'
                        },
                        '&:active': {
                          transform: 'translateY(0) scale(0.98)'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                          transform: 'none'
                        }
                      }}
                    >
                      🎯 ¡Sí, confirmo!
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<HelpIcon />}
                      onClick={() => handleOpenNotesDialog('maybe')}
                      disabled={loading || attendanceStatus !== 'pending'}
                      sx={{ 
                        minWidth: 160,
                        height: 56,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: '0 12px 35px rgba(245, 158, 11, 0.6)'
                        },
                        '&:active': {
                          transform: 'translateY(0) scale(0.98)'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                          transform: 'none'
                        }
                      }}
                    >
                      🤔 Tal vez
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenNotesDialog('decline')}
                      disabled={loading || attendanceStatus !== 'pending'}
                      sx={{ 
                        minWidth: 160,
                        height: 56,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: '0 12px 35px rgba(239, 68, 68, 0.6)'
                        },
                        '&:active': {
                          transform: 'translateY(0) scale(0.98)'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                          transform: 'none'
                        }
                      }}
                    >
                      ❌ No puedo asistir
                    </Button>
                  </Box>
                </Box>
              </Grow>
            )}

            {/* Mensaje si el evento ya pasó */}
            {isEventPast() && (
              <Alert severity="info" sx={{ mb: 4 }}>
                Este evento ya ha pasado. No puedes responder a la asistencia.
              </Alert>
            )}

            {/* Loading indicator */}
            {loading && (
              <Fade in={true} timeout={300}>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <LinearProgress 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(255, 107, 53, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)'
                      }
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 3, 
                      color: '#ff6b35',
                      fontWeight: 600,
                      animation: 'pulse 1.5s infinite'
                    }}
                  >
                    ⚡ Procesando tu respuesta...
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Paper>
      </Modal>

      {/* Diálogo para notas */}
      <Dialog 
        open={showNotesDialog} 
        onClose={() => setShowNotesDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            border: '2px solid #ff6b35'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 700
        }}>
          💭 Agregar nota (opcional)
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nota personalizada"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cuéntanos más sobre tu decisión... ¿Tienes alguna pregunta o comentario?"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ff6b35'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ff6b35'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowNotesDialog(false)}
            variant="outlined"
            sx={{ 
              borderColor: '#ff6b35',
              color: '#ff6b35',
              '&:hover': {
                borderColor: '#f7931e',
                backgroundColor: 'rgba(255, 107, 53, 0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          {actionType === 'maybe' && (
            <Button 
              onClick={() => handleAttendanceAction('maybe')}
              variant="contained"
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                }
              }}
            >
              🤔 Tal vez
            </Button>
          )}
          {actionType === 'decline' && (
            <Button 
              onClick={() => handleAttendanceAction('decline')}
              variant="contained"
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                }
              }}
            >
              ❌ Declinar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
