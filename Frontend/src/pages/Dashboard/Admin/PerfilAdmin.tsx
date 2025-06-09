import { Box, Paper, Typography, Avatar, Button } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';

export default function PerfilAdmin() {
  // Mock de datos del admin
  const admin = {
    nombre: 'Administrador Principal',
    email: 'admin@leanmaker.com',
    rol: 'Administrador',
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, mb: 4, px: 2 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>
        <Typography variant="h5" gutterBottom>{admin.nombre}</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>{admin.email}</Typography>
        <Typography variant="body2" color="primary" gutterBottom>{admin.rol}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }}>Editar Perfil</Button>
        <Button variant="text" color="secondary" sx={{ mt: 1 }}>Cambiar Contraseña</Button>
      </Paper>
    </Box>
  );
} 