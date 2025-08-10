import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { NotificationCenter } from './NotificationCenter';
import { notificationService } from '../../services/notification.service';

// Datos de ejemplo para demostrar las mejoras
const demoNotifications = [
  {
    id: '1',
    user: 'user1',
    title: 'Nuevo evento en sede: Taller de Innovación',
    message: 'Te invitamos al taller de innovación que se realizará el próximo viernes en el FabLab. Habrá demostraciones prácticas y networking.',
    type: 'info' as const,
    read: false,
    priority: 'high' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user: 'user1',
    title: 'Proyecto aprobado: Desarrollo de App Móvil',
    message: '¡Felicitaciones! Tu proyecto de desarrollo de aplicación móvil ha sido aprobado por la empresa TechCorp.',
    type: 'success' as const,
    read: false,
    priority: 'normal' as const,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    user: 'user1',
    title: 'Recordatorio: Entrevista mañana',
    message: 'No olvides que tienes una entrevista programada mañana a las 10:00 AM con la empresa InnovateLab.',
    type: 'warning' as const,
    read: true,
    priority: 'urgent' as const,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    user: 'user1',
    title: 'Anuncio importante: Nuevas políticas',
    message: 'Se han actualizado las políticas de la plataforma. Por favor revisa los cambios en el siguiente enlace.',
    type: 'info' as const,
    read: true,
    priority: 'medium' as const,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const NotificationDemo: React.FC = () => {
  const handleNotificationClick = (notification: any) => {
    console.log('Notificación clickeada:', notification);
    alert(`Notificación: ${notification.title}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Demostración: Mejoras en Notificaciones
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nuevas Características Implementadas:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Animaciones sutiles (fade-in, slide, zoom)</li>
          <li>Iconografía mejorada según tipo de contenido</li>
          <li>Indicadores visuales de prioridad</li>
          <li>Mejor organización visual</li>
          <li>Efectos hover mejorados</li>
          <li>Badge con animación pulse</li>
          <li>Tooltips informativos</li>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <NotificationCenter onNotificationClick={handleNotificationClick} />
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tipos de Notificaciones Mejorados:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {demoNotifications.map((notification) => (
            <Paper 
              key={notification.id} 
              sx={{ 
                p: 2, 
                border: notification.read ? '1px solid #e0e0e0' : '2px solid',
                borderColor: notification.priority === 'urgent' ? 'error.main' : 
                            notification.priority === 'high' ? 'warning.main' : 'primary.main',
                backgroundColor: notification.read ? 'transparent' : 
                               notification.priority === 'urgent' ? 'error.light' : 
                               notification.priority === 'high' ? 'warning.light' : 'action.hover'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color={notification.type === 'success' ? 'success' : 
                         notification.type === 'warning' ? 'warning' : 'info'}
                >
                  {notification.type}
                </Button>
                {notification.priority && notification.priority !== 'normal' && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    color={notification.priority === 'urgent' ? 'error' : 
                           notification.priority === 'high' ? 'warning' : 'primary'}
                  >
                    {notification.priority}
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
