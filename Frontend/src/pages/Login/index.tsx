import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Alert,
  Button
} from '@mui/material';
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

  // useEffect para hacer scroll hacia arriba al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            src="/imagenes/login.png"
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
              <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
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
                  required
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
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  sx={{ mt: 3, mb: 2 }}
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