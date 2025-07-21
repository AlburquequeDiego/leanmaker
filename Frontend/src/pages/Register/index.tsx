import { useState, useEffect } from 'react';
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
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';
import { type UserRole } from '../../types';

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
  birthdate: '',
  gender: '',
  acceptTerms: false,
  
  // Campos específicos de estudiante
  career: '',
  university: '',
  education_level: '',
  
  // Campos específicos de empresa
  company_name: '',
  industry: '',
  size: '',
  website: '',
  address: '',
  city: '',
  country: 'Chile',
  rut: '',
  personality: '',
  business_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  // ... usuario responsable ...
  responsible_first_name: '',
  responsible_last_name: '',
  responsible_email: '',
  responsible_phone: '',
  responsible_birthdate: '',
  responsible_gender: '',
  responsible_password: '',
  responsible_password_confirm: '',
};

// Lista de instituciones permitidas y dominios
const INSTITUTIONS = [
  { name: 'INACAP', domain: 'inacapmail.cl' },
  { name: 'Universidad de Chile', domain: 'uchile.cl' },
  { name: 'Pontificia Universidad Católica de Chile', domain: 'uc.cl' },
  { name: 'Universidad de Concepción', domain: 'udec.cl' },
  { name: 'Universidad Técnica Federico Santa María', domain: 'usm.cl' },
  { name: 'Universidad de Santiago de Chile', domain: 'usach.cl' },
  { name: 'Universidad Austral de Chile', domain: 'uach.cl' },
  { name: 'Universidad de Valparaíso', domain: 'uv.cl' },
  { name: 'Universidad de La Frontera', domain: 'ufro.cl' },
  { name: 'Universidad de Talca', domain: 'utalca.cl' },
];

// Función para obtener el placeholder de email basado en la institución
const getEmailPlaceholder = (university: string) => {
  const institution = INSTITUTIONS.find(inst => inst.name === university);
  if (institution) {
    return `ejemplo@${institution.domain}`;
  }
  return 'ejemplo@institucion.cl';
};

// Esquema de validación
const getValidationSchema = (userType: UserType) => {
  const baseSchema = {
    email: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido')
      .test('institutional-email', 'Debe ser un correo institucional válido', function(value) {
        if (userType === 'student' && value) {
          const allowedDomains = INSTITUTIONS.map(i => i.domain);
          const domain = value.split('@')[1];
          return allowedDomains.includes(domain);
        }
        return true;
      }),
    password: yup
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .matches(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un caracter especial (!@#$%^&*)')
      .required('La contraseña es requerida'),
    password_confirm: yup
      .string()
      .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('Confirma tu contraseña'),
    first_name: yup.string().required('El nombre es requerido'),
    last_name: yup.string().required('El apellido es requerido'),
    phone: yup
      .string()
      .required('El teléfono es requerido')
      .matches(/^9\d{8}$/, 'Debe ser un número chileno válido (9 XXXX XXXX)')
      .test('phone-length', 'El teléfono debe tener 9 dígitos', function(value) {
        return value ? value.length === 9 : false;
      }),
    birthdate: yup
      .string()
      .required('La fecha de nacimiento es requerida'),
    gender: yup.string().required('El género es requerido'),
    acceptTerms: yup.bool().oneOf([true], 'Debes aceptar los términos y condiciones'),
  };

  if (userType === 'student') {
    return yup.object({
      ...baseSchema,
      career: yup.string().required('La carrera es requerida'),
      university: yup.string().required('La institución educativa es requerida'),
      education_level: yup.string().required('El nivel educativo es requerido'),
    });
  } else {
    return yup.object({
      ...baseSchema,
      rut: yup.string().required('El RUT es requerido'),
      personality: yup.string().required('La personalidad es requerida'),
      business_name: yup.string().required('La razón social es requerida'),
      company_name: yup.string().required('El nombre de la empresa es requerido'),
      company_address: yup.string().required('La dirección es requerida'),
      company_phone: yup.string().required('El teléfono es requerido').matches(/^9\d{8}$/, 'Debe ser un número chileno válido (9 XXXX XXXX)'),
      company_email: yup.string().email('Debe ser un correo válido').required('El correo es requerido'),
    });
  }
};

// Opciones de nivel educativo
const EDUCATION_LEVELS = [
  { value: 'CFT', label: 'CFT' },
  { value: 'IP', label: 'Instituto Profesional' },
  { value: 'Universidad', label: 'Universidad' },
];



// Recuadro de normas de conducta para estudiantes
const studentConduct = (
  <Alert severity="warning" sx={{ mb: 2 }}>
    <Typography variant="subtitle2" fontWeight={700} color="warning.main">
      Código de Conducta para Estudiantes en Leanmaker
    </Typography>
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      <li>Proporcionar información verídica y actualizada sobre tu perfil académico y personal.</li>
      <li>Mantener un trato profesional, ético y respetuoso con empresas y otros usuarios.</li>
      <li>Cumplir con los compromisos y plazos establecidos en los proyectos en los que participes.</li>
      <li>Respetar la confidencialidad de la información de las empresas y proyectos.</li>
      <li>No utilizar la plataforma para fines fraudulentos o contrarios a la ley.</li>
      <li>Comunicar de manera clara y constructiva con las empresas y supervisores.</li>
      <li>Aceptar que el incumplimiento de estos principios puede resultar en la suspensión de tu cuenta.</li>
    </ul>
  </Alert>
);

// Recuadro de normas de conducta para empresas
const companyConduct = (
  <Alert severity="warning" sx={{ mb: 2 }}>
    <Typography variant="subtitle2" fontWeight={700} color="warning.main">
      Código de Conducta para Empresas en Leanmaker
    </Typography>
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      <li>Proporcionar información verídica y actualizada sobre la empresa y sus representantes.</li>
      <li>Mantener un trato profesional, ético y respetuoso con todos los usuarios de la plataforma.</li>
      <li>Cumplir con los compromisos y plazos establecidos en los proyectos publicados.</li>
      <li>Respetar la confidencialidad de la información y los datos de los estudiantes y colaboradores.</li>
      <li>No utilizar la plataforma para fines fraudulentos, discriminatorios o contrarios a la ley.</li>
      <li>Comunicar de manera clara, transparente y constructiva con los postulantes y participantes.</li>
      <li>Aceptar que el incumplimiento de estos principios puede resultar en la suspensión o eliminación de la cuenta de empresa.</li>
    </ul>
  </Alert>
);

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [userType, setUserType] = useState<UserType>('student');
  const [showConduct, setShowConduct] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(userType),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        clearError();
        
        console.log('Form values:', values);
        console.log('User type:', userType);
        
        // Preparar datos base del registro
        const registerData: any = {
          email: values.email,
          password: values.password,
          password_confirm: values.password_confirm,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: `+56${values.phone}`, // Agregar prefijo +56
          birthdate: values.birthdate,
          gender: values.gender,
          role: userType as UserRole,
          username: values.email.split('@')[0],
        };

        // Agregar campos específicos según el tipo de usuario
        if (userType === 'student') {
          registerData.career = values.career;
          registerData.university = values.university;
          registerData.education_level = values.education_level;
        } else if (userType === 'company') {
          registerData.rut = values.rut;
          registerData.personality = values.personality;
          registerData.business_name = values.business_name;
          registerData.company_name = values.company_name;
          registerData.company_address = values.company_address;
          registerData.company_phone = `+56${values.company_phone}`; // Agregar prefijo +56
          registerData.company_email = values.company_email;
          // Usar los datos personales como datos del responsable
          registerData.responsible_first_name = values.first_name;
          registerData.responsible_last_name = values.last_name;
          registerData.responsible_email = values.email;
          registerData.responsible_phone = `+56${values.phone}`; // Agregar prefijo +56
          registerData.responsible_birthdate = values.birthdate;
          registerData.responsible_gender = values.gender;
          registerData.responsible_password = values.password;
          registerData.responsible_password_confirm = values.password_confirm;
        }

        console.log('Register data to send:', registerData);

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

  // Función para manejar el cambio de institución
  const handleUniversityChange = (event: any) => {
    const newUniversity = event.target.value;
    formik.setFieldValue('university', newUniversity);
    
    // Si hay un email ingresado, verificar si coincide con la nueva institución
    const currentEmail = formik.values.email;
    if (currentEmail) {
      const institution = INSTITUTIONS.find(inst => inst.name === newUniversity);
      if (institution) {
        const currentDomain = currentEmail.split('@')[1];
        if (currentDomain && currentDomain !== institution.domain) {
          // Si el dominio no coincide, limpiar el email
          formik.setFieldValue('email', '');
        }
      }
    }
  };

  // useEffect para mostrar el recuadro de normas de conducta automáticamente
  useEffect(() => {
    if (userType === 'student') {
    if (
      formik.values.first_name &&
      formik.values.last_name &&
      formik.values.email &&
      formik.values.phone &&
      formik.values.birthdate &&
      formik.values.gender &&
      formik.values.career &&
      formik.values.university &&
      formik.values.education_level &&
      formik.values.password &&
      formik.values.password_confirm &&
      !formik.values.acceptTerms
    ) {
      setShowConduct(true);
    } else if (formik.values.acceptTerms) {
      setShowConduct(false);
      }
    } else if (userType === 'company') {
      if (
        formik.values.first_name &&
        formik.values.last_name &&
        formik.values.email &&
        formik.values.phone &&
        formik.values.birthdate &&
        formik.values.gender &&
        formik.values.password &&
        formik.values.password_confirm &&
        formik.values.rut &&
        formik.values.personality &&
        formik.values.business_name &&
        formik.values.company_name &&
        formik.values.company_address &&
        formik.values.company_phone &&
        formik.values.company_email &&
        !formik.values.acceptTerms
      ) {
        setShowConduct(true);
      } else if (formik.values.acceptTerms) {
        setShowConduct(false);
      }
    }
  }, [userType, formik.values]);

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
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 4 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
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
              startIcon={<BusinessIcon sx={{ color: userType === 'company' ? '#8e24aa' : undefined }} />}
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

          {/* Información sobre reglas de validación */}
          {userType === 'student' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Reglas de registro para estudiantes:</strong>
                <br />• Solo se permiten correos institucionales de las 10 universidades autorizadas
                <br />• La contraseña debe tener al menos 8 caracteres, una mayúscula y un caracter especial
              </Typography>
            </Alert>
          )}

          {userType === 'company' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Reglas de registro para empresas:</strong>
                <br />• Todos los campos son obligatorios
                <br />• La contraseña debe tener al menos 8 caracteres, una mayúscula y un caracter especial
                <br />• Los teléfonos deben tener 9 dígitos (se agrega automáticamente +56)
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Campos específicos según tipo de usuario */}
              {userType === 'student' && (
                <>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Información Personal
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
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
                    </Box>

                    <Box flex={1} minWidth={200}>
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
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Correo electrónico"
                        type="email"
                        placeholder={getEmailPlaceholder(formik.values.university)}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={
                          formik.touched.email && formik.errors.email 
                            ? formik.errors.email 
                            : formik.values.university 
                              ? `Formato requerido: nombre.apellido@${INSTITUTIONS.find(inst => inst.name === formik.values.university)?.domain}`
                              : 'Selecciona una institución para ver el formato de correo requerido'
                        }
                        disabled={loading}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Teléfono"
                        value={formik.values.phone.replace(/[^0-9]/g, '').slice(0, 9)}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                          formik.setFieldValue('phone', value);
                        }}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">+56</InputAdornment>,
                          inputMode: 'numeric',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="birthdate"
                        label="Fecha de nacimiento"
                        type="date"
                        value={formik.values.birthdate}
                        onChange={formik.handleChange}
                        error={formik.touched.birthdate && Boolean(formik.errors.birthdate)}
                        helperText={formik.touched.birthdate && formik.errors.birthdate}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <FormControl fullWidth>
                        <InputLabel>Género</InputLabel>
                        <Select
                          name="gender"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          error={formik.touched.gender && Boolean(formik.errors.gender)}
                          disabled={loading}
                        >
                          <MenuItem value="Masculino">Masculino</MenuItem>
                          <MenuItem value="Femenino">Femenino</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Información Académica
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Selecciona tu institución educativa para ver el formato de correo requerido
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <FormControl fullWidth>
                        <InputLabel>Institución Educativa</InputLabel>
                        <Select
                          name="university"
                          value={formik.values.university}
                          onChange={handleUniversityChange}
                          error={formik.touched.university && Boolean(formik.errors.university)}
                          disabled={loading}
                        >
                          {INSTITUTIONS.map((inst) => (
                            <MenuItem key={inst.domain} value={inst.name}>
                              {inst.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box flex={1} minWidth={200}>
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
                    </Box>
                  </Box>

                  <Box display="flex" gap={2}>
                    <Box flex={1} minWidth={200}>
                      <FormControl fullWidth>
                        <InputLabel>Nivel educativo</InputLabel>
                        <Select
                          name="education_level"
                          value={formik.values.education_level}
                          onChange={formik.handleChange}
                          error={formik.touched.education_level && Boolean(formik.errors.education_level)}
                          disabled={loading}
                        >
                          {EDUCATION_LEVELS.map((level) => (
                            <MenuItem key={level.value} value={level.value}>
                              {level.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
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
                    </Box>

                    <Box flex={1} minWidth={200}>
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
                    </Box>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="acceptTerms"
                          color="primary"
                          checked={formik.values.acceptTerms}
                          onChange={formik.handleChange}
                          disabled={loading}
                        />
                      }
                      label={
                        <span>
                          Acepto los{' '}
                          <Link href="#" target="_blank" rel="noopener">
                            términos y condiciones
                          </Link>
                        </span>
                      }
                    />
                    {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                      <Typography color="error" variant="caption" display="block">
                        {formik.errors.acceptTerms}
                      </Typography>
                    )}
                  </Box>

                  {showConduct && (
                    <Box>
                      {studentConduct}
                    </Box>
                  )}
                </>
              )}

              {/* Campos específicos según tipo de usuario */}
              {userType === 'company' && (
                <>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Información Personal
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
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
                    </Box>

                    <Box flex={1} minWidth={200}>
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
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
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
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Teléfono"
                        value={formik.values.phone.replace(/[^0-9]/g, '').slice(0, 9)}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                          formik.setFieldValue('phone', value);
                        }}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">+56</InputAdornment>,
                          inputMode: 'numeric',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="birthdate"
                        label="Fecha de nacimiento"
                        type="date"
                        value={formik.values.birthdate}
                        onChange={formik.handleChange}
                        error={formik.touched.birthdate && Boolean(formik.errors.birthdate)}
                        helperText={formik.touched.birthdate && formik.errors.birthdate}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <FormControl fullWidth>
                        <InputLabel>Género</InputLabel>
                        <Select
                          name="gender"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          error={formik.touched.gender && Boolean(formik.errors.gender)}
                          disabled={loading}
                        >
                          <MenuItem value="Masculino">Masculino</MenuItem>
                          <MenuItem value="Femenino">Femenino</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
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
                    </Box>

                    <Box flex={1} minWidth={200}>
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
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Información de la Empresa
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="rut" 
                        label="RUT" 
                        value={formik.values.rut} 
                        onChange={formik.handleChange} 
                        error={formik.touched.rut && Boolean(formik.errors.rut)} 
                        helperText={formik.touched.rut && formik.errors.rut} 
                        disabled={loading} 
                      />
                    </Box>
                    <Box flex={1} minWidth={200}>
                      <FormControl fullWidth>
                        <InputLabel>Personalidad</InputLabel>
                        <Select 
                          name="personality" 
                          value={formik.values.personality} 
                          onChange={formik.handleChange} 
                          error={formik.touched.personality && Boolean(formik.errors.personality)} 
                          disabled={loading}
                        >
                          <MenuItem value="juridica">Jurídica</MenuItem>
                          <MenuItem value="natural">Natural</MenuItem>
                          <MenuItem value="otra">Otra</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="business_name" 
                        label="Razón Social" 
                        value={formik.values.business_name} 
                        onChange={formik.handleChange} 
                        error={formik.touched.business_name && Boolean(formik.errors.business_name)} 
                        helperText={formik.touched.business_name && formik.errors.business_name} 
                        disabled={loading} 
                      />
                    </Box>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_name" 
                        label="Nombre de la Empresa" 
                        value={formik.values.company_name} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_name && Boolean(formik.errors.company_name)} 
                        helperText={formik.touched.company_name && formik.errors.company_name} 
                        disabled={loading} 
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_address" 
                        label="Dirección" 
                        value={formik.values.company_address} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_address && Boolean(formik.errors.company_address)} 
                        helperText={formik.touched.company_address && formik.errors.company_address} 
                        disabled={loading} 
                      />
                    </Box>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_phone" 
                        label="Teléfono de la Empresa" 
                        value={formik.values.company_phone.replace(/[^0-9]/g, '').slice(0, 9)} 
                        onChange={e => { 
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9); 
                          formik.setFieldValue('company_phone', value); 
                        }} 
                        error={formik.touched.company_phone && Boolean(formik.errors.company_phone)} 
                        helperText={formik.touched.company_phone && formik.errors.company_phone} 
                        disabled={loading} 
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">+56</InputAdornment>, 
                          inputMode: 'numeric' 
                        }} 
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_email" 
                        label="Correo Electrónico de la Empresa" 
                        type="email" 
                        value={formik.values.company_email} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_email && Boolean(formik.errors.company_email)} 
                        helperText={formik.touched.company_email && formik.errors.company_email} 
                        disabled={loading} 
                      />
                    </Box>
                  </Box>



                  <Box>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          name="acceptTerms" 
                          color="primary" 
                          checked={formik.values.acceptTerms} 
                          onChange={formik.handleChange} 
                          disabled={loading} 
                        />
                      } 
                      label={
                        <span>
                          Acepto los{' '}
                          <Link href="#" target="_blank" rel="noopener">
                            términos y condiciones
                          </Link>
                        </span>
                      } 
                    />
                    {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                      <Typography color="error" variant="caption" display="block">
                        {formik.errors.acceptTerms}
                      </Typography>
                    )}
                  </Box>

                  {showConduct && (
                    <Box>
                      {companyConduct}
                    </Box>
                  )}
                </>
              )}

              <Box>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading || !formik.values.acceptTerms}
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                >
                  Crear Cuenta
                </LoadingButton>
              </Box>

              <Box>
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
              </Box>

              <Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{ mt: 1 }}
                  >
                    Volver al inicio
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 