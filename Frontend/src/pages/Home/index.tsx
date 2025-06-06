import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '800px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
          Leanmaker
        </Typography>
        <Typography variant="h5" gutterBottom>
          Conectando estudiantes con oportunidades reales
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Plataforma de inserción laboral que conecta a estudiantes de diversas instituciones educativas con empresas, facilitando la participación en proyectos temporales y mejorando la empleabilidad a través de la gestión de proyectos reales y prácticas laborales.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/register')}>
            Registrarse
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 