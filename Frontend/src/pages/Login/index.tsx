import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Alert,
  Button,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    )
    .required('La contraseña es requerida'),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      try {
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al iniciar sesión. Por favor, verifique sus credenciales.');
      } finally {
        setIsLoading(false);
      }
    },
  });

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
        background: `url("/imagenes/fondo_nuevo.png") no-repeat center center/cover`,
      }}
    >
      <Container component="main" maxWidth={false} disableGutters sx={{ width: '400px' }}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
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
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              Iniciar Sesión
            </LoadingButton>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>
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
  );
};

export default Login; 