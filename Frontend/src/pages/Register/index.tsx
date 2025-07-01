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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';
import { UNIVERSITIES, type UserRole } from '../../types';

// Tipos de usuario permitidos
type UserType = 'student' | 'company';

// Valores iniciales del formulario
const initialValues = {
  // Campos comunes
  email: '',
  password: '',
  password_confirm: '',
  first_name: '',
  last_name: '',
  phone: '',
  acceptTerms: false,
  
  // Campos específicos de estudiante
  career: '',
  semester: '',
  graduation_year: '',
  university: '',
  
  // Campos específicos de empresa
  company_name: '',
  industry: '',
  size: '',
  website: '',
  address: '',
  city: '',
  country: 'Chile',
};

// Esquema de validación
const getValidationSchema = (userType: UserType) => {
  const baseSchema = {
    email: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido'),
    password: yup
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .required('La contraseña es requerida'),
    password_confirm: yup
      .string()
      .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('Confirma tu contraseña'),
    first_name: yup.string().required('El nombre es requerido'),
    last_name: yup.string().required('El apellido es requerido'),
    phone: yup.string().required('El teléfono es requerido'),
    acceptTerms: yup
      .bool()
      .oneOf([true], 'Debes aceptar los términos y condiciones'),
  };

  if (userType === 'student') {
    return yup.object({
      ...baseSchema,
      career: yup.string().required('La carrera es requerida'),
      semester: yup.string().required('El semestre es requerido'),
      graduation_year: yup.string().required('El año de graduación es requerido'),
      university: yup.string().required('La universidad es requerida'),
    });
  } else {
    return yup.object({
      ...baseSchema,
      company_name: yup.string().required('El nombre de la empresa es requerido'),
      industry: yup.string().required('La industria es requerida'),
      size: yup.string().required('El tamaño de la empresa es requerido'),
      website: yup.string().url('Debe ser una URL válida').required('El sitio web es requerido'),
      address: yup.string().required('La dirección es requerida'),
      city: yup.string().required('La ciudad es requerida'),
    });
  }
};

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [userType, setUserType] = useState<UserType>('student');

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(userType),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        clearError();
        
        const registerData = {
          email: values.email,
          password: values.password,
          password_confirm: values.password_confirm,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          role: userType as UserRole,
          username: values.email.split('@')[0], // Usar email como username
        };

        await register(registerData);
        navigate('/dashboard');
      } catch (err) {
        console.error('Registration failed:', err);
      }
    },
  });

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    formik.resetForm();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `url("/imagenes/fondo_nuevo.png") no-repeat center center/cover`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'white',
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Registro
          </Typography>

          {/* Selector de tipo de usuario */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Button
              variant={userType === 'student' ? 'contained' : 'outlined'}
              startIcon={<SchoolIcon />}
              onClick={() => handleUserTypeChange('student')}
              sx={{ px: 3, py: 1.5 }}
            >
              Estudiante
            </Button>
            <Button
              variant={userType === 'company' ? 'contained' : 'outlined'}
              startIcon={<BusinessIcon />}
              onClick={() => handleUserTypeChange('company')}
              sx={{ px: 3, py: 1.5 }}
            >
              Empresa
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Campos comunes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="first_name"
                  label="Nombre"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="last_name"
                  label="Apellido"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Teléfono"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Campos específicos según tipo de usuario */}
              {userType === 'student' ? (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Información Académica
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Universidad</InputLabel>
                      <Select
                        name="university"
                        value={formik.values.university}
                        onChange={formik.handleChange}
                        error={formik.touched.university && Boolean(formik.errors.university)}
                        disabled={loading}
                      >
                        {UNIVERSITIES.map((university) => (
                          <MenuItem key={university} value={university}>
                            {university}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="career"
                      label="Carrera"
                      value={formik.values.career}
                      onChange={formik.handleChange}
                      error={formik.touched.career && Boolean(formik.errors.career)}
                      helperText={formik.touched.career && formik.errors.career}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="semester"
                      label="Semestre actual"
                      value={formik.values.semester}
                      onChange={formik.handleChange}
                      error={formik.touched.semester && Boolean(formik.errors.semester)}
                      helperText={formik.touched.semester && formik.errors.semester}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="graduation_year"
                      label="Año de graduación esperado"
                      value={formik.values.graduation_year}
                      onChange={formik.handleChange}
                      error={formik.touched.graduation_year && Boolean(formik.errors.graduation_year)}
                      helperText={formik.touched.graduation_year && formik.errors.graduation_year}
                      disabled={loading}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Información de la Empresa
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="company_name"
                      label="Nombre de la empresa"
                      value={formik.values.company_name}
                      onChange={formik.handleChange}
                      error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                      helperText={formik.touched.company_name && formik.errors.company_name}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="industry"
                      label="Industria"
                      value={formik.values.industry}
                      onChange={formik.handleChange}
                      error={formik.touched.industry && Boolean(formik.errors.industry)}
                      helperText={formik.touched.industry && formik.errors.industry}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tamaño de la empresa</InputLabel>
                      <Select
                        name="size"
                        value={formik.values.size}
                        onChange={formik.handleChange}
                        error={formik.touched.size && Boolean(formik.errors.size)}
                        disabled={loading}
                      >
                        <MenuItem value="Pequeña">Pequeña (1-50 empleados)</MenuItem>
                        <MenuItem value="Mediana">Mediana (51-200 empleados)</MenuItem>
                        <MenuItem value="Grande">Grande (201+ empleados)</MenuItem>
                        <MenuItem value="Startup">Startup</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="website"
                      label="Sitio web"
                      value={formik.values.website}
                      onChange={formik.handleChange}
                      error={formik.touched.website && Boolean(formik.errors.website)}
                      helperText={formik.touched.website && formik.errors.website}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="address"
                      label="Dirección"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="city"
                      label="Ciudad"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      disabled={loading}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Contraseñas */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Seguridad
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password_confirm"
                  label="Confirmar contraseña"
                  type="password"
                  value={formik.values.password_confirm}
                  onChange={formik.handleChange}
                  error={formik.touched.password_confirm && Boolean(formik.errors.password_confirm)}
                  helperText={formik.touched.password_confirm && formik.errors.password_confirm}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={formik.values.acceptTerms}
                      onChange={formik.handleChange}
                      disabled={loading}
                    />
                  }
                  label="Acepto los términos y condiciones"
                />
                {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                  <Typography color="error" variant="caption" display="block">
                    {formik.errors.acceptTerms}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  sx={{ mt: 2, mb: 2 }}
                >
                  Registrarse
                </LoadingButton>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{ textDecoration: 'none' }}
                  >
                    ¿Ya tienes una cuenta? Inicia sesión
                  </Link>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{ mt: 1 }}
                  >
                    Volver al inicio
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 