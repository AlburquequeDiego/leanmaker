import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

const mockNotifications = [
  {
    id: 1,
    type: 'entrevista',
    title: 'Tienes una entrevista programada',
    description: 'Entrevista con Tech Solutions el 10/06/2024 a las 10:00 AM.',
    date: '2024-06-10T10:00:00',
    read: false,
  },
  {
    id: 2,
    type: 'asignacion',
    title: 'Fuiste asignado a un proyecto',
    description: 'Ahora eres parte del proyecto "Desarrollo de Aplicación Web".',
    date: '2024-06-05T09:00:00',
    read: false,
  },
  {
    id: 3,
    type: 'entrega',
    title: 'Tienes una entrega de proyecto esta semana',
    description: 'Entrega del módulo de autenticación el 12/06/2024.',
    date: '2024-06-12T23:59:00',
    read: false,
  },
  {
    id: 4,
    type: 'entrevista',
    title: 'Tienes una entrevista esta semana',
    description: 'Entrevista con Data Analytics Corp el 14/06/2024 a las 15:00.',
    date: '2024-06-14T15:00:00',
    read: true,
  },
];

const typeConfig = {
  entrevista: {
    icon: <EventIcon color="primary" />, label: 'Entrevista', color: 'primary',
  },
  asignacion: {
    icon: <WorkIcon color="success" />, label: 'Asignación', color: 'success',
  },
  entrega: {
    icon: <AssignmentTurnedInIcon color="warning" />, label: 'Entrega', color: 'warning',
  },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardLayout userRole="student">
      <Box sx={{ p: 3, width: '100%', minHeight: '80vh' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Notificaciones
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <List sx={{ width: '100%', maxWidth: 700 }}>
            {notifications.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                No tienes notificaciones.
              </Typography>
            )}
            {notifications.map((n) => (
              <Paper
                key={n.id}
                elevation={n.read ? 0 : 3}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: n.read ? 'background.paper' : 'action.selected',
                  p: 2.5,
                  boxShadow: n.read ? undefined : 4,
                  transition: 'box-shadow 0.2s',
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {!n.read && (
                        <IconButton edge="end" aria-label="marcar como leída" onClick={() => markAsRead(n.id)}>
                          <CheckCircleIcon color="success" />
                        </IconButton>
                      )}
                      <IconButton edge="end" aria-label="eliminar" onClick={() => deleteNotification(n.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
                  }
                  sx={{ alignItems: 'center' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${typeConfig[n.type as keyof typeof typeConfig].color}.main`, width: 48, height: 48 }}>
                      {typeConfig[n.type as keyof typeof typeConfig].icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center" mb={0.5}>
                        <Typography fontWeight={n.read ? 'normal' : 'bold'} fontSize={18}>
                          {n.title}
                        </Typography>
                        <Chip
                          label={typeConfig[n.type as keyof typeof typeConfig].label}
                          color={typeConfig[n.type as keyof typeof typeConfig].color as any}
                          size="small"
                          sx={{ fontWeight: 'bold', fontSize: 14 }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          {n.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(n.date).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </Box>
      </Box>
    </DashboardLayout>
  );
} 