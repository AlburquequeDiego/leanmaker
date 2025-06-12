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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, mb: 4, px: 2 }}>
      <Paper sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4 }}>
        <Avatar sx={{ width: 120, height: 120, mb: 3 }}>
          <AccountCircleIcon sx={{ fontSize: 100 }} />
        </Avatar>
        <Typography variant="h4" gutterBottom>{admin.nombre}</Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>{admin.email}</Typography>
        <Typography variant="h6" color="primary" gutterBottom>{admin.rol}</Typography>
        <Button variant="outlined" sx={{ mt: 3, fontSize: 18, px: 4, py: 1.5 }}>Editar Perfil</Button>
        <Button variant="text" color="secondary" sx={{ mt: 2, fontSize: 16 }}>Cambiar Contraseña</Button>
      </Paper>
    </Box>
  );
} 