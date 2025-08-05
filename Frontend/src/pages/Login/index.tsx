import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Alert,
  Button,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Debe ser un correo válido')
    .required('El correo es requerido'),
  password: yup
    .string()
    .required('La contraseña es requerida'),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // useEffect para hacer scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        await login(values);
        navigate('/dashboard');
      } catch (err) {
        // Error is handled by the auth hook
        console.error('Login failed:', err);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `url("/imagenes/fondo_nuevo.png") no-repeat center center/cover`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Contenedor principal dividido en dos columnas */}
      <Box
        sx={{
          width: { xs: '95vw', sm: 600, md: 900 },
          minHeight: { xs: 500, md: 500 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: 3,
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'white',
        }}
      >
        {/* Barra izquierda con imagen centrada */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, md: 4 },
            borderRight: { md: '1px solid #e0e0e0' },
            borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
          }}
        >
          {/* Imagen centrada, cambia la ruta por la que desees */}
          <Box
            component="img"
            src="/imagenes/FOTITO.png"
            alt="Ilustración Login"
            sx={{
              width: { xs: '80%', md: '95%' },
              maxWidth: 350,
              height: 'auto',
              display: 'block',
              mx: 'auto',
              my: 'auto',
              borderRadius: 2,
              boxShadow: 1,
              bgcolor: '#f5f5f5',
              p: 1
            }}
          />
        </Box>
        {/* Columna derecha: formulario de login igual que antes */}
        <Box
          sx={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, md: 5 },
            bgcolor: 'white',
          }}
        >
          <Container component="main" maxWidth={false} disableGutters sx={{ width: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                boxShadow: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                bgcolor: 'white',
              }}
            >
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Iniciar Sesión
              </Typography>
              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ width: '100%' }}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    borderRadius: '30px',
                    bgcolor: '#1976d2',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#1565c0',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                    }
                  }}
                >
                  Iniciar Sesión
                </LoadingButton>

                {/* Checkbox Recordar contraseña debajo de recuperar contraseña */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <input type="checkbox" id="remember" name="remember" style={{ marginRight: 8 }} />
                  <label htmlFor="remember" style={{ fontSize: 15, color: '#888' }}>Recordar contraseña</label>
                </Box>
                {/* Botón Volver al inicio */}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2, color: 'primary.main', borderColor: 'primary.main', fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#f5faff', borderColor: 'primary.dark' } }}
                  onClick={() => navigate('/')}
                >
                  Volver al inicio
                </Button>
                
                {/* Botón de emergencia para limpiar localStorage */}
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  sx={{ 
                    mb: 2, 
                    color: '#666', 
                    fontSize: '12px',
                    textTransform: 'none',
                    '&:hover': { 
                      bgcolor: '#f5f5f5',
                      color: '#d32f2f'
                    } 
                  }}
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Limpiar datos de sesión (emergencia)
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{ textDecoration: 'none' }}
                  >
                    ¿No tienes una cuenta? Regístrate
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 