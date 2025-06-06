import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            Leanmaker
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              color: 'text.secondary',
              mb: 4,
            }}
          >
            Conectando estudiantes con oportunidades reales
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Plataforma de inserción laboral que conecta a estudiantes de INACAP
            con empresas a través de proyectos temporales, mejorando la
            empleabilidad mediante la gestión de proyectos reales y prácticas
            laborales.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 