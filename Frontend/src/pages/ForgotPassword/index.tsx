import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Button
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const emailSchema = yup.object({
  email: yup
    .string()
    .email('Ingrese un email válido')
    .matches(/@leanmaker\.com$/, 'Debe ser un correo institucional')
    .required('El email es requerido'),
});

const codeSchema = yup.object({
  code: yup
    .string()
    .matches(/^\d{10}$/, 'El código debe tener 10 dígitos numéricos')
    .required('El código es requerido'),
});

const passwordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [sentEmail, setSentEmail] = useState('');
  const navigate = useNavigate();

  // Paso 1: Enviar correo
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: emailSchema,
    onSubmit: (values) => {
      setSentEmail(values.email);
      setStep('code');
    },
  });

  // Paso 2: Verificar código
  const codeFormik = useFormik({
    initialValues: { code: '' },
    validationSchema: codeSchema,
    onSubmit: () => {
      setStep('password');
    },
  });

  // Paso 3: Cambiar contraseña
  const passwordFormik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: () => {
      setStep('success');
      setTimeout(() => navigate('/login'), 2000);
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'url("/imagenes/fondode.png") no-repeat center center/cover',
      }}
    >
      <Container maxWidth="xs" sx={{ maxWidth: 340 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 3,
            bgcolor: 'white',
            minWidth: 0,
            textAlign: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Recuperar Contraseña
          </Typography>

          {/* Paso 1: Ingresar correo */}
          {step === 'email' && (
            <form onSubmit={emailFormik.handleSubmit}>
              <TextField
                fullWidth
                label="Correo Institucional"
                name="email"
                margin="normal"
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange}
                error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                helperText={emailFormik.touched.email && emailFormik.errors.email}
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 1 }}
              >
                Enviar Código
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ color: 'primary.main', mt: 1 }}
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}

          {/* Paso 2: Ingresar código */}
          {step === 'code' && (
            <>
              <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mb: 2, bgcolor: '#eaf7ea', color: '#2e7d32' }}>
                Se ha enviado un código de 10 dígitos a tu correo institucional.
              </Alert>
              <Typography sx={{ mb: 1 }}>
                Ingresa el código de 10 dígitos enviado a <b>{sentEmail}</b>
              </Typography>
              <form onSubmit={codeFormik.handleSubmit}>
                <TextField
                  fullWidth
                  label="Código de 10 dígitos"
                  name="code"
                  margin="normal"
                  value={codeFormik.values.code}
                  onChange={codeFormik.handleChange}
                  error={codeFormik.touched.code && Boolean(codeFormik.errors.code)}
                  helperText={codeFormik.touched.code && codeFormik.errors.code}
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 1 }}
                >
                  Verificar Código
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ color: 'primary.main', mt: 1 }}
                  onClick={() => navigate('/login')}
                >
                  Volver al inicio de sesión
                </Button>
              </form>
            </>
          )}

          {/* Paso 3: Cambiar contraseña */}
          {step === 'password' && (
            <>
              <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mb: 2, bgcolor: '#eaf7ea', color: '#2e7d32' }}>
                ¡Código verificado! Ahora puedes cambiar tu contraseña.
              </Alert>
              <form onSubmit={passwordFormik.handleSubmit}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  name="password"
                  type="password"
                  margin="normal"
                  value={passwordFormik.values.password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                  helperText={passwordFormik.touched.password && passwordFormik.errors.password}
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  name="confirmPassword"
                  type="password"
                  margin="normal"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 1 }}
                >
                  Recuperar contraseña
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ color: 'primary.main', mt: 1 }}
                  onClick={() => navigate('/login')}
                >
                  Volver al inicio de sesión
                </Button>
              </form>
            </>
          )}

          {/* Paso 4: Éxito */}
          {step === 'success' && (
            <>
              <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mb: 2, bgcolor: '#eaf7ea', color: '#2e7d32' }}>
                ¡Contraseña actualizada correctamente!
              </Alert>
              <Typography variant="h6" color="success.main" sx={{ mb: 2, mt: 2 }}>
                ¡Contraseña actualizada correctamente!
              </Typography>
              <Button
                fullWidth
                variant="text"
                sx={{ color: 'primary.main', mt: 1 }}
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
} 