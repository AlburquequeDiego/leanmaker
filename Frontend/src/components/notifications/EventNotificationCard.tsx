import React, { useState } from 'react';
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
  TextField
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
  Edit as EditIcon
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
      event_id?: string;
      event_type?: string;
      location?: string;
      meeting_room?: string;
      start_date?: string;
      end_date?: string;
      meeting_type?: string;
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
  const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'confirmed' | 'declined' | 'maybe'>('pending');
  const [loading, setLoading] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Extraer información del evento del mensaje o metadata
  const eventInfo = notification.metadata || {};
  const isEventNotification = notification.title.toLowerCase().includes('evento') || 
                             notification.title.toLowerCase().includes('reunión') ||
                             notification.title.toLowerCase().includes('entrevista') ||
                             notification.title.toLowerCase().includes('invitación');

  const isOnsiteEvent = eventInfo.meeting_type === 'cowork' || eventInfo.meeting_type === 'fablab';

  const handleAttendanceAction = async (action: 'confirm' | 'decline' | 'maybe') => {
    if (!eventInfo.event_id) {
      console.error('No event_id found in notification metadata');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/calendar-events/${eventInfo.event_id}/attendance/`;
      const data: any = { action };
      
      if (notes.trim()) {
        data.notes = notes.trim();
      }

      const response = await apiService.post(endpoint, data);
      
      if (response.success) {
        setAttendanceStatus(action === 'confirm' ? 'confirmed' : action === 'decline' ? 'declined' : 'maybe');
        
        // Actualizar estado en el componente padre
        if (onStatusChange) {
          onStatusChange(notification.id, action);
        }
        
        // Cerrar diálogo de notas si estaba abierto
        setShowNotesDialog(false);
        setNotes('');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return '';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'declined':
        return 'error';
      case 'maybe':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'declined':
        return 'Declinado';
      case 'maybe':
        return 'Tal vez';
      default:
        return 'Pendiente';
    }
  };

  if (!isEventNotification) {
    return null; // No mostrar este componente para notificaciones que no son de eventos
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: notification.read ? 'divider' : 'primary.main',
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: notification.read ? 'background.paper' : 'action.hover',
        position: 'relative',
        overflow: 'hidden',
        '&::before': isOnsiteEvent && !notification.read ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: 'warning.main'
        } : {}
      }}
    >
      {/* Header con icono y título */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <EventIcon 
          color="primary" 
          sx={{ mr: 1, mt: 0.5, fontSize: 20 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600, mb: 0.5 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {notification.message}
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Información del evento */}
      {(eventInfo.location || eventInfo.meeting_room || eventInfo.start_date) && (
        <Box sx={{ mb: 2 }}>
          {eventInfo.start_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatEventDate(eventInfo.start_date)}
              </Typography>
            </Box>
          )}
          
          {eventInfo.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {eventInfo.location}
              </Typography>
            </Box>
          )}
          
          {eventInfo.meeting_room && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Sala: {eventInfo.meeting_room}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Advertencia para eventos presenciales */}
      {isOnsiteEvent && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 2, fontSize: '0.75rem' }}
        >
          <Typography variant="caption">
            Este es un evento presencial. Por favor confirma tu asistencia para organizar el espacio.
          </Typography>
        </Alert>
      )}

      {/* Estado actual de asistencia */}
      {attendanceStatus !== 'pending' && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getStatusText(attendanceStatus)}
            color={getStatusColor(attendanceStatus) as any}
            size="small"
            icon={attendanceStatus === 'confirmed' ? <CheckIcon /> : 
                  attendanceStatus === 'declined' ? <CancelIcon /> : <HelpIcon />}
          />
        </Box>
      )}

      {/* Botones de acción */}
      {attendanceStatus === 'pending' && eventInfo.event_id && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckIcon />}
            onClick={() => handleAttendanceAction('confirm')}
            disabled={loading}
            sx={{ 
              minWidth: 100,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            Confirmar
          </Button>
          
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => setShowNotesDialog(true)}
            disabled={loading}
            sx={{ 
              minWidth: 100,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            Tal vez
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => setShowNotesDialog(true)}
            disabled={loading}
            sx={{ 
              minWidth: 100,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            Declinar
          </Button>
        </Box>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Procesando...
          </Typography>
        </Box>
      )}

      {/* Diálogo para notas */}
      <Dialog 
        open={showNotesDialog} 
        onClose={() => setShowNotesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Agregar nota (opcional)
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nota"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agrega una nota sobre tu asistencia..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotesDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleAttendanceAction('maybe')}
            color="warning"
            variant="contained"
          >
            Tal vez
          </Button>
          <Button 
            onClick={() => handleAttendanceAction('decline')}
            color="error"
            variant="contained"
          >
            Declinar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
