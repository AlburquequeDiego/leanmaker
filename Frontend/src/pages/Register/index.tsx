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
  Avatar,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';

// Definición de los valores iniciales para ambos tipos de usuario
const initialValues = {
  // Comunes
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  // Estudiante
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
  genero: '',
  institucion: '',
  carrera: '',
  nivel: '',
  // Empresa
  rut: '',
  personalidad: '',
  razonSocial: '',
  nombreEmpresa: '',
  direccion: '',
  telefonoEmpresa: '',
  // Usuario responsable (empresa)
  nombreResponsable: '',
  apellidoResponsable: '',
  correoResponsable: '',
  telefonoResponsable: '',
  fechaNacimientoResponsable: '',
  generoResponsable: '',
};

// Esquema de validación dinámico según tipo de usuario
const allowedStudentDomains = [
  'inacap.cl',
  'duoc.cl',
  'uchile.cl',
  'usach.cl',
  'udec.cl',
  'usm.cl',
  'uv.cl',
  'uach.cl',
  'uc.cl',
  'puc.cl',
  'unab.cl',
];

const studentEmailRegex = new RegExp(
  `^[^\s@]+@(?:${allowedStudentDomains.map(d => d.replace('.', '\.')).join('|')})$`
);

const getValidationSchema = (tipo: 'estudiante' | 'empresa') => {
  if (tipo === 'estudiante') {
    return yup.object({
      nombre: yup.string().required('El nombre es requerido'),
      apellido: yup.string().required('El apellido es requerido'),
      email: yup
        .string()
        .email('Ingrese un email válido')
        .matches(studentEmailRegex, 'Solo se permiten correos universitarios válidos (.cl) de INACAP, Duoc UC, U. de Chile, USACH, UDEC, USM, UV, UACH, UC, PUC o UNAB')
        .required('El email es requerido'),
      telefono: yup.string().required('El teléfono es requerido'),
      fechaNacimiento: yup.string().required('La fecha de nacimiento es requerida'),
      genero: yup.string().required('El género es requerido'),
      institucion: yup.string().required('La institución es requerida'),
      carrera: yup.string().required('La carrera es requerida'),
      nivel: yup.string().required('El nivel educativo es requerido'),
      password: yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es requerida'),
      confirmPassword: yup.string().oneOf([yup.ref('password')], 'Las contraseñas deben coincidir').required('Confirma tu contraseña'),
      acceptTerms: yup.bool().oneOf([true], 'Debes aceptar los términos y condiciones'),
    });
  } else {
    return yup.object({
      rut: yup.string().required('El RUT es requerido'),
      personalidad: yup.string().required('La personalidad es requerida'),
      razonSocial: yup.string().required('La razón social es requerida'),
      nombreEmpresa: yup.string().required('El nombre de la empresa es requerido'),
      direccion: yup.string().required('La dirección es requerida'),
      telefonoEmpresa: yup.string().required('El teléfono de la empresa es requerido'),
      email: yup.string().email('Ingrese un email válido').required('El email es requerido'),
      // Usuario responsable
      nombreResponsable: yup.string().required('El nombre del responsable es requerido'),
      apellidoResponsable: yup.string().required('El apellido del responsable es requerido'),
      correoResponsable: yup.string().email('Ingrese un email válido').required('El correo del responsable es requerido'),
      telefonoResponsable: yup.string().required('El teléfono del responsable es requerido'),
      fechaNacimientoResponsable: yup.string().required('La fecha de nacimiento es requerida'),
      generoResponsable: yup.string().required('El género es requerido'),
      password: yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es requerida'),
      confirmPassword: yup.string().oneOf([yup.ref('password')], 'Las contraseñas deben coincidir').required('Confirma tu contraseña'),
      acceptTerms: yup.bool().oneOf([true], 'Debes aceptar los términos y condiciones'),
    });
  }
};

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  // Estado para el tipo de usuario
  const [tipo, setTipo] = useState<'estudiante' | 'empresa'>('estudiante');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formik con validación dinámica
  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(tipo),
    enableReinitialize: true, // Para que cambie el esquema al cambiar el tipo
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      try {
        const userRole = tipo === 'estudiante' ? 'student' : 'company';
        await register(values.email, userRole, values.nombre || values.nombreResponsable || values.nombreEmpresa);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al registrarse. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Función para verificar si mostrar la advertencia
  const shouldShowWarning = () => {
    const hasEmail = formik.values.email && formik.values.email.length > 0;
    const hasPassword = formik.values.password && formik.values.password.length > 0;
    const hasConfirmPassword = formik.values.confirmPassword && formik.values.confirmPassword.length > 0;
    const passwordsMatch = formik.values.password === formik.values.confirmPassword;
    const hasAcceptedTerms = formik.values.acceptTerms;
    
    return hasEmail && hasPassword && hasConfirmPassword && passwordsMatch && !hasAcceptedTerms;
  };

  // Renderizado del selector visual de tipo de usuario
  const SelectorTipo = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
      <Button
        variant={tipo === 'estudiante' ? 'contained' : 'outlined'}
        color="primary"
        startIcon={<SchoolIcon sx={{ fontSize: 32 }} />}
        sx={{
          px: 4,
          py: 2,
          fontWeight: 700,
          fontSize: 18,
          borderRadius: 2,
          boxShadow: tipo === 'estudiante' ? 2 : 0,
          bgcolor: tipo === 'estudiante' ? 'primary.main' : 'white',
          color: tipo === 'estudiante' ? 'white' : 'primary.main',
          '&:hover': { bgcolor: 'primary.dark', color: 'white' },
        }}
        onClick={() => setTipo('estudiante')}
      >
        Estudiante
      </Button>
      <Button
        variant={tipo === 'empresa' ? 'contained' : 'outlined'}
        color="secondary"
        startIcon={<BusinessIcon sx={{ fontSize: 32 }} />}
        sx={{
          px: 4,
          py: 2,
          fontWeight: 700,
          fontSize: 18,
          borderRadius: 2,
          boxShadow: tipo === 'empresa' ? 2 : 0,
          bgcolor: tipo === 'empresa' ? 'secondary.main' : 'white',
          color: tipo === 'empresa' ? 'white' : 'secondary.main',
          '&:hover': { bgcolor: 'secondary.dark', color: 'white' },
        }}
        onClick={() => setTipo('empresa')}
      >
        Empresa
      </Button>
    </Box>
  );

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
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, width: { xs: '100%', md: '70%' }, mx: 'auto' }}>
          {/* Logo y título */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar src="/logo192.png" sx={{ width: 64, height: 64, mb: 1 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Crear Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Únete a la plataforma de vinculación entre empresas y estudiantes
          </Typography>
          </Box>

          {/* Selector visual de tipo de usuario */}
          <SelectorTipo />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario dinámico */}
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', mt: 1 }}>
            {/* Campos para ESTUDIANTE */}
            {tipo === 'estudiante' && (
              <>
                {/* Nombre y Apellido en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
                    label="Nombre"
                    name="nombre"
              fullWidth
                    value={formik.values.nombre}
              onChange={formik.handleChange}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
              size="small"
            />
            <TextField
                    label="Apellido"
                    name="apellido"
              fullWidth
                    value={formik.values.apellido}
                    onChange={formik.handleChange}
                    error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                    helperText={formik.touched.apellido && formik.errors.apellido}
                    size="small"
                  />
                </Box>
                <TextField
              label="Correo Electrónico"
              name="email"
                  fullWidth
                  margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
                  size="small"
                />
                <TextField
                  label="Teléfono"
                  name="telefono"
                  fullWidth
                  margin="normal"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                  helperText={formik.touched.telefono && formik.errors.telefono}
                  size="small"
                />
                {/* Fecha de nacimiento y género en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Fecha de Nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.fechaNacimiento}
                    onChange={formik.handleChange}
                    error={formik.touched.fechaNacimiento && Boolean(formik.errors.fechaNacimiento)}
                    helperText={formik.touched.fechaNacimiento && formik.errors.fechaNacimiento}
              size="small"
            />
            <TextField
                    label="Género"
                    name="genero"
                    fullWidth
                    select
                    value={formik.values.genero}
                    onChange={formik.handleChange}
                    error={formik.touched.genero && Boolean(formik.errors.genero)}
                    helperText={formik.touched.genero && formik.errors.genero}
                    size="small"
                  >
                    <MenuItem value="">Selecciona el género</MenuItem>
                    <MenuItem value="Mujer">Mujer</MenuItem>
                    <MenuItem value="Hombre">Hombre</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                </Box>
                <TextField
                  label="Institución Educativa"
                  name="institucion"
                  fullWidth
                  margin="normal"
                  select
                  value={formik.values.institucion}
                  onChange={formik.handleChange}
                  error={formik.touched.institucion && Boolean(formik.errors.institucion)}
                  helperText={formik.touched.institucion && formik.errors.institucion}
                  size="small"
                >
                  <MenuItem value="">Selecciona tu institución</MenuItem>
                  <MenuItem value="Instituto Profesional INACAP">Instituto Profesional INACAP</MenuItem>
                  <MenuItem value="Instituto Profesional Duoc UC">Instituto Profesional Duoc UC</MenuItem>
                  <MenuItem value="Universidad de Chile">Universidad de Chile</MenuItem>
                  <MenuItem value="Universidad de Santiago de Chile">Universidad de Santiago de Chile</MenuItem>
                  <MenuItem value="Universidad de Concepción">Universidad de Concepción</MenuItem>
                  <MenuItem value="Universidad Técnica Federico Santa María">Universidad Técnica Federico Santa María</MenuItem>
                  <MenuItem value="Universidad de Valparaíso">Universidad de Valparaíso</MenuItem>
                  <MenuItem value="Universidad Austral de Chile">Universidad Austral de Chile</MenuItem>
                  <MenuItem value="Pontificia Universidad Católica de Chile">Pontificia Universidad Católica de Chile</MenuItem>
                  <MenuItem value="Otra">Otra institución</MenuItem>
                </TextField>
                <TextField
                  label="Carrera"
                  name="carrera"
                  fullWidth
                  margin="normal"
                  select
                  value={formik.values.carrera}
                  onChange={formik.handleChange}
                  error={formik.touched.carrera && Boolean(formik.errors.carrera)}
                  helperText={formik.touched.carrera && formik.errors.carrera}
                  size="small"
                >
                  <MenuItem value="">Selecciona tu carrera</MenuItem>
                  <MenuItem value="Ingeniería Civil">Ingeniería Civil</MenuItem>
                  <MenuItem value="Ingeniería Comercial">Ingeniería Comercial</MenuItem>
                  <MenuItem value="Ingeniería en Informática">Ingeniería en Informática</MenuItem>
                  <MenuItem value="Ingeniería Industrial">Ingeniería Industrial</MenuItem>
                  <MenuItem value="Ingeniería Mecánica">Ingeniería Mecánica</MenuItem>
                  <MenuItem value="Ingeniería Eléctrica">Ingeniería Eléctrica</MenuItem>
                  <MenuItem value="Ingeniería Química">Ingeniería Química</MenuItem>
                  <MenuItem value="Ingeniería en Construcción">Ingeniería en Construcción</MenuItem>
                  <MenuItem value="Ingeniería en Prevención de Riesgos">Ingeniería en Prevención de Riesgos</MenuItem>
                  <MenuItem value="Administración de Empresas">Administración de Empresas</MenuItem>
                  <MenuItem value="Contador Auditor">Contador Auditor</MenuItem>
                  <MenuItem value="Derecho">Derecho</MenuItem>
                  <MenuItem value="Medicina">Medicina</MenuItem>
                  <MenuItem value="Enfermería">Enfermería</MenuItem>
                  <MenuItem value="Odontología">Odontología</MenuItem>
                  <MenuItem value="Psicología">Psicología</MenuItem>
                  <MenuItem value="Trabajo Social">Trabajo Social</MenuItem>
                  <MenuItem value="Educación">Educación</MenuItem>
                  <MenuItem value="Periodismo">Periodismo</MenuItem>
                  <MenuItem value="Publicidad">Publicidad</MenuItem>
                  <MenuItem value="Diseño Gráfico">Diseño Gráfico</MenuItem>
                  <MenuItem value="Arquitectura">Arquitectura</MenuItem>
                  <MenuItem value="Agronomía">Agronomía</MenuItem>
                  <MenuItem value="Veterinaria">Veterinaria</MenuItem>
                  <MenuItem value="Química y Farmacia">Química y Farmacia</MenuItem>
                  <MenuItem value="Kinesiología">Kinesiología</MenuItem>
                  <MenuItem value="Nutrición y Dietética">Nutrición y Dietética</MenuItem>
                  <MenuItem value="Tecnología Médica">Tecnología Médica</MenuItem>
                  <MenuItem value="Fonoaudiología">Fonoaudiología</MenuItem>
                  <MenuItem value="Terapia Ocupacional">Terapia Ocupacional</MenuItem>
                  <MenuItem value="Otra">Otra</MenuItem>
                </TextField>
                <TextField
                  label="Nivel Educativo"
                  name="nivel"
              fullWidth
                  margin="normal"
                  select
                  value={formik.values.nivel}
                  onChange={formik.handleChange}
                  error={formik.touched.nivel && Boolean(formik.errors.nivel)}
                  helperText={formik.touched.nivel && formik.errors.nivel}
                  size="small"
                >
                  <MenuItem value="">Selecciona el nivel</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="IP">IP</MenuItem>
                  <MenuItem value="CFT">CFT</MenuItem>
                  <MenuItem value="Universitaria">Universitaria</MenuItem>
                  <MenuItem value="Maestría">Maestría</MenuItem>
                  <MenuItem value="Doctorado">Doctorado</MenuItem>
                </TextField>
                {/* Contraseña y Confirmar Contraseña en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Contraseña"
              name="password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    size="small"
                  />
                  <TextField
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    size="small"
                  />
                </Box>
              </>
            )}

            {/* Campos para EMPRESA */}
            {tipo === 'empresa' && (
              <>
                <TextField
                  label="RUT"
                  name="rut"
                  fullWidth
                  margin="normal"
                  value={formik.values.rut}
                  onChange={formik.handleChange}
                  error={formik.touched.rut && Boolean(formik.errors.rut)}
                  helperText={formik.touched.rut && formik.errors.rut}
                  size="small"
                />
                <TextField
                  label="Personalidad"
                  name="personalidad"
                  fullWidth
                  margin="normal"
                  select
                  value={formik.values.personalidad}
                  onChange={formik.handleChange}
                  error={formik.touched.personalidad && Boolean(formik.errors.personalidad)}
                  helperText={formik.touched.personalidad && formik.errors.personalidad}
                  size="small"
                >
                  <MenuItem value="">Selecciona</MenuItem>
                  <MenuItem value="Jurídica">Jurídica</MenuItem>
                  <MenuItem value="Natural">Natural</MenuItem>
                </TextField>
                <TextField
                  label="Razón Social"
                  name="razonSocial"
                  fullWidth
                  margin="normal"
                  value={formik.values.razonSocial}
                  onChange={formik.handleChange}
                  error={formik.touched.razonSocial && Boolean(formik.errors.razonSocial)}
                  helperText={formik.touched.razonSocial && formik.errors.razonSocial}
                  size="small"
                />
                <TextField
                  label="Nombre de la Empresa"
                  name="nombreEmpresa"
                  fullWidth
                  margin="normal"
                  value={formik.values.nombreEmpresa}
                  onChange={formik.handleChange}
                  error={formik.touched.nombreEmpresa && Boolean(formik.errors.nombreEmpresa)}
                  helperText={formik.touched.nombreEmpresa && formik.errors.nombreEmpresa}
                  size="small"
                />
                <TextField
                  label="Dirección"
                  name="direccion"
                  fullWidth
                  margin="normal"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                  helperText={formik.touched.direccion && formik.errors.direccion}
                  size="small"
                />
                <TextField
                  label="Teléfono de la Empresa"
                  name="telefonoEmpresa"
                  fullWidth
                  margin="normal"
                  value={formik.values.telefonoEmpresa}
                  onChange={formik.handleChange}
                  error={formik.touched.telefonoEmpresa && Boolean(formik.errors.telefonoEmpresa)}
                  helperText={formik.touched.telefonoEmpresa && formik.errors.telefonoEmpresa}
                  size="small"
                />
                <TextField
                  label="Correo Electrónico de la Empresa"
                  name="email"
                  fullWidth
                  margin="normal"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  size="small"
                />
                {/* Datos del usuario responsable */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Datos del Usuario Responsable
                </Typography>
                {/* Nombre y Apellido responsable en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Nombre"
                    name="nombreResponsable"
                    fullWidth
                    value={formik.values.nombreResponsable}
                    onChange={formik.handleChange}
                    error={formik.touched.nombreResponsable && Boolean(formik.errors.nombreResponsable)}
                    helperText={formik.touched.nombreResponsable && formik.errors.nombreResponsable}
                    size="small"
                  />
                  <TextField
                    label="Apellido"
                    name="apellidoResponsable"
                    fullWidth
                    value={formik.values.apellidoResponsable}
                    onChange={formik.handleChange}
                    error={formik.touched.apellidoResponsable && Boolean(formik.errors.apellidoResponsable)}
                    helperText={formik.touched.apellidoResponsable && formik.errors.apellidoResponsable}
                    size="small"
                  />
                </Box>
                <TextField
                  label="Correo Electrónico"
                  name="correoResponsable"
                  fullWidth
                  margin="normal"
                  value={formik.values.correoResponsable}
                  onChange={formik.handleChange}
                  error={formik.touched.correoResponsable && Boolean(formik.errors.correoResponsable)}
                  helperText={formik.touched.correoResponsable && formik.errors.correoResponsable}
                  size="small"
                />
                <TextField
                  label="Teléfono"
                  name="telefonoResponsable"
                  fullWidth
                  margin="normal"
                  value={formik.values.telefonoResponsable}
                  onChange={formik.handleChange}
                  error={formik.touched.telefonoResponsable && Boolean(formik.errors.telefonoResponsable)}
                  helperText={formik.touched.telefonoResponsable && formik.errors.telefonoResponsable}
                  size="small"
                />
                {/* Fecha de nacimiento y género responsable en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Fecha de Nacimiento"
                    name="fechaNacimientoResponsable"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.fechaNacimientoResponsable}
                    onChange={formik.handleChange}
                    error={formik.touched.fechaNacimientoResponsable && Boolean(formik.errors.fechaNacimientoResponsable)}
                    helperText={formik.touched.fechaNacimientoResponsable && formik.errors.fechaNacimientoResponsable}
                    size="small"
                  />
                  <TextField
                    label="Género"
                    name="generoResponsable"
                    fullWidth
                    select
                    value={formik.values.generoResponsable}
                    onChange={formik.handleChange}
                    error={formik.touched.generoResponsable && Boolean(formik.errors.generoResponsable)}
                    helperText={formik.touched.generoResponsable && formik.errors.generoResponsable}
                    size="small"
                  >
                    <MenuItem value="">Selecciona el género</MenuItem>
                    <MenuItem value="Mujer">Mujer</MenuItem>
                    <MenuItem value="Hombre">Hombre</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                </Box>
                {/* Contraseña y Confirmar Contraseña en una fila */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
              label="Contraseña"
                    name="password"
              type="password"
                    fullWidth
                    margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              size="small"
            />
            <TextField
                    label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
                    fullWidth
                    margin="normal"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              size="small"
                  />
                </Box>
              </>
            )}

            {/* Checkbox de términos y condiciones */}
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  color="primary"
                  checked={formik.values.acceptTerms}
                  onChange={formik.handleChange}
                />
              }
              label={<span>Acepto los términos y condiciones</span>}
              sx={{ mt: 2, mb: 1 }}
            />

            {/* Advertencia sobre credenciales de acceso */}
            {shouldShowWarning() && (
              <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  ⚠️ Importante: El correo electrónico y la contraseña que has ingresado serán tus credenciales para acceder a este sistema de vinculación.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Asegúrate de recordar estos datos, ya que los necesitarás para iniciar sesión en la plataforma.
                </Typography>
              </Alert>
            )}

            {/* Advertencia de comportamiento */}
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                📋 Código de Conducta: Al registrarte en Leanmaker, te comprometes a:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
                • Mantener un comportamiento profesional y respetuoso en todas las interacciones
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Cumplir con los compromisos y plazos establecidos en los proyectos
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Respetar la confidencialidad de la información compartida
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Comunicar de manera transparente y constructiva
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                El incumplimiento de estos principios puede resultar en la suspensión de tu cuenta.
              </Typography>
            </Alert>

            {/* Botón de registro */}
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={isLoading}
              disabled={!formik.isValid || !formik.dirty || isLoading}
              sx={{ mt: 2, mb: 1, py: 1.5, fontWeight: 700 }}
            >
              Crear Cuenta
            </LoadingButton>

            {/* Enlace para iniciar sesión */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                  Iniciar Sesión
              </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 