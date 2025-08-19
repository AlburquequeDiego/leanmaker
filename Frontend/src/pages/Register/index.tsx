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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LoadingButton from '../../components/common/LoadingButton';
import { useAuth } from '../../hooks/useAuth';
import { type UserRole } from '../../types';
import { validateChileanRut } from '../../utils/rutValidator';

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
};

// Lista de instituciones permitidas y dominios para los estudiantes , la idea es de que se pueda agregar mas instituciones
const INSTITUTIONS = [
  { name: 'INACAP', domain: 'inacapmail.cl' },
];

// Función para generar el email automáticamente basado en nombre y apellido, aunque tambien puede cambiar el dominio
const generateEmail = (firstName: string, lastName: string) => {
  if (firstName && lastName) {
    const first = firstName.toLowerCase().trim();
    const last = lastName.toLowerCase().trim();
    return `${first}.${last}@inacapmail.cl`;
  }
  return '';
};

// Función para obtener el placeholder de email basado en la institución
const getEmailPlaceholder = (university: string) => {
  const institution = INSTITUTIONS.find(inst => inst.name === university);
  if (institution) {
    return `ejemplo@${institution.domain}`;
  }
  return 'ejemplodecorreo@institucion.cl';
};

// Función para obtener placeholders dinámicos según el campo y tipo de usuario
const getFieldPlaceholder = (fieldName: string, userType: UserType) => {
  const placeholders = {
    // Campos comunes
    first_name: 'Ej: Juan Carlos',
    last_name: 'Ej: Pérez González',
    phone: 'Ej: 912345678',
    birthdate: 'Ej: 2000-01-15',
    email: userType === 'student' ? 'Ej: juan.perez@inacapmail.cl' : 'Ej: contacto@empresa.cl',
    password: 'Ej: MiContraseña123!',
    password_confirm: 'Ej: MiContraseña123!',
    
    // Campos específicos de estudiante
    career: 'Ej: Ingeniería Informática',
    university: 'Ej: INACAP',
    education_level: 'Ej: Universidad',
    
    // Campos específicos de empresa
    rut: 'Ej: 76.123.456-7',
    personality: 'Ej: Sociedad Anónima',
    business_name: 'Ej: Inversiones Tecnológicas del Sur S.A.',
    company_name: 'Ej: TechSur Solutions',
    company_address: 'Ej: Av. Apoquindo 3841, Las Condes, Santiago',
    company_phone: 'Ej: 223456789',
    company_email: 'Ej: contacto@techsur.cl',
    industry: 'Ej: Desarrollo de Software',
    size: 'Ej: Mediana (50-200 empleados)',
    website: 'Ej: https://www.techsur.cl',
    address: 'Ej: Av. Apoquindo 3841, Las Condes',
    city: 'Ej: Santiago',
  };
  
  return placeholders[fieldName as keyof typeof placeholders] || '';
};

// Función para obtener helper text dinámico
const getFieldHelperText = (fieldName: string, userType: UserType, hasError: boolean, errorMessage?: string) => {
  if (hasError && errorMessage) {
    return errorMessage;
  }
  
  const helperTexts = {
    // Campos comunes
    first_name: 'Ingresa tu nombre completo',
    last_name: 'Ingresa tu apellido completo',
    phone: 'Ingresa solo números (9 dígitos)',
    birthdate: 'Selecciona tu fecha de nacimiento',
    email: userType === 'student' 
      ? 'Se generará automáticamente con formato: nombre.apellido@inacapmail.cl'
      : 'Ingresa el correo electrónico de la empresa',
    password: 'Mínimo 8 caracteres, una mayúscula y un carácter especial',
    password_confirm: 'Repite la misma contraseña',
    
    // Campos específicos de estudiante
    career: 'Ingresa tu carrera o programa de estudios',
    university: 'Selecciona tu institución educativa',
    education_level: 'Selecciona tu nivel educativo actual',
    
    // Campos específicos de empresa
    rut: 'Ingresa el RUT de la empresa (formato: 76.123.456-7)',
    personality: 'Selecciona el tipo de personalidad jurídica (S.A., SPA, EIRL, etc.)',
    business_name: 'Ingresa la razón social registrada en el SII',
    company_name: 'Ingresa el nombre comercial o marca de la empresa',
    company_address: 'Ingresa la dirección completa incluyendo comuna y ciudad',
    company_phone: 'Ingresa el teléfono principal de la empresa',
    company_email: 'Ingresa el correo electrónico corporativo principal',
    industry: 'Ingresa el sector o industria principal de la empresa',
    size: 'Selecciona el tamaño según número de empleados',
    website: 'Ingresa la URL del sitio web corporativo (opcional)',
    address: 'Ingresa la dirección física de la empresa',
    city: 'Ingresa la ciudad donde se ubica la sede principal',
  };
  
  return helperTexts[fieldName as keyof typeof helperTexts] || '';
};

// ✅ ESQUEMA DE VALIDACIÓN DEFENSIVO Y ROBUSTO
const getValidationSchema = (userType: UserType) => {
  const baseSchema = {
    email: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido')
      .max(100, 'Email muy largo (máximo 100 caracteres)'),
    
    password: yup
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .required('La contraseña es requerida')
      .max(128, 'Contraseña muy larga'),
    
    password_confirm: yup
      .string()
      .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('Confirma tu contraseña'),
    
    first_name: yup
      .string()
      .required('El nombre es requerido')
      .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/, 'Solo letras y espacios')
      .min(2, 'Nombre muy corto (mínimo 2 caracteres)')
      .max(50, 'Nombre muy largo (máximo 50 caracteres)'),
    
    last_name: yup
      .string()
      .required('El apellido es requerido')
      .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/, 'Solo letras y espacios')
      .min(2, 'Apellido muy corto (mínimo 2 caracteres)')
      .max(50, 'Apellido muy largo (máximo 50 caracteres)'),
    
    phone: yup
      .string()
      .required('El teléfono es requerido')
      .matches(/^[0-9\s\-\+\(\)]+$/, 'Solo números y símbolos telefónicos')
      .min(8, 'Teléfono muy corto (mínimo 8 dígitos)')
      .max(15, 'Teléfono muy largo (máximo 15 dígitos)')
      .test('debe-tener-numeros', 'Debe contener al menos 8 números', (value) => {
        const numbers = (value || '').replace(/[^0-9]/g, '');
        return numbers.length >= 8;
      }),
    
    birthdate: yup
      .string()
      .required('La fecha de nacimiento es requerida')
      .test('fecha-valida', 'Fecha inválida (debe ser entre 16 y 100 años)', (value) => {
        if (!value) return false;
        const date = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 16 && age <= 100;
      }),
    
    gender: yup
      .string()
      .required('El género es requerido')
      .oneOf(['Masculino', 'Femenino', 'Otro'], 'Género inválido'),
    
    acceptTerms: yup
      .bool()
      .oneOf([true], 'Debes aceptar los términos y condiciones'),
  };

  if (userType === 'student') {
    return yup.object({
      ...baseSchema,
      career: yup
        .string()
        .required('La carrera es requerida')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s\-]+$/, 'Solo letras, espacios y guiones')
        .min(3, 'Carrera muy corta (mínimo 3 caracteres)')
        .max(100, 'Carrera muy larga (máximo 100 caracteres)'),
      
      university: yup
        .string()
        .required('La institución educativa es requerida')
        .oneOf(['INACAP'], 'Institución no válida'),
      
      education_level: yup
        .string()
        .required('El nivel educativo es requerido')
        .oneOf(['CFT', 'IP', 'Universidad'], 'Nivel educativo inválido'),
    });
  } else {
    // ✅ VALIDACIONES DEFENSIVAS PARA EMPRESAS - Previenen errores 500
    return yup.object({
      ...baseSchema,
      rut: yup
        .string()
        .required('El RUT es requerido')
        .matches(/^[0-9Kk]+$/, 'Solo números y la letra K')
        .min(7, 'RUT muy corto (mínimo 7 dígitos)')
        .max(10, 'RUT muy largo (máximo 10 dígitos)')
        .test('debe-tener-numeros', 'El RUT debe contener números', (value) => {
          return /\d/.test(value || '');
        }),
      
      personality: yup
        .string()
        .required('La personalidad es requerida')
        .oneOf(['Jurídica', 'Natural', 'Otra'], 'Personalidad inválida'),
      
      business_name: yup
        .string()
        .required('La razón social es requerida')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s\.\-]+$/, 'Solo letras, espacios, puntos y guiones')
        .min(3, 'Razón social muy corta (mínimo 3 caracteres)')
        .max(100, 'Razón social muy larga (máximo 100 caracteres)')
        .test('no-solo-espacios', 'No puede ser solo espacios', (value) => {
          return value && value.trim().length > 0;
        }),
      
      company_name: yup
        .string()
        .required('El nombre de la empresa es requerido')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s\.\-]+$/, 'Solo letras, espacios, puntos y guiones')
        .min(2, 'Nombre muy corto (mínimo 2 caracteres)')
        .max(80, 'Nombre muy largo (máximo 80 caracteres)'),
      
      company_address: yup
        .string()
        .required('La dirección es requerida')
        .matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s\.\-,#]+$/, 'Caracteres inválidos en dirección')
        .min(10, 'Dirección muy corta (mínimo 10 caracteres)')
        .max(200, 'Dirección muy larga (máximo 200 caracteres)'),
      
      company_phone: yup
        .string()
        .required('El teléfono es requerido')
        .matches(/^[0-9\s\-\+\(\)]+$/, 'Solo números y símbolos telefónicos')
        .min(8, 'Teléfono muy corto (mínimo 8 dígitos)')
        .max(15, 'Teléfono muy largo (máximo 15 dígitos)')
        .test('debe-tener-numeros', 'Debe contener al menos 8 números', (value) => {
          const numbers = (value || '').replace(/[^0-9]/g, '');
          return numbers.length >= 8;
        }),
      
      company_email: yup
        .string()
        .email('Debe ser un correo válido')
        .required('El correo es requerido')
        .max(100, 'Email muy largo (máximo 100 caracteres)')
        .test('formato-basico', 'Formato: usuario@dominio.com', (value) => {
          if (!value) return false;
          const parts = value.split('@');
          return parts.length === 2 && parts[0].length > 0 && parts[1].includes('.');
        }),
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
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    password_confirm: false,
    responsible_password: false,
    responsible_password_confirm: false,
  });
  const [formKey, setFormKey] = useState(Date.now());
  const [usernameWarning, setUsernameWarning] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Leer parámetro de URL para establecer el tipo de usuario automáticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'company') {
      setUserType('company');
    }
  }, []);

  // Función para verificar si el username existe
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/check-username/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setUsernameWarning(`El nombre de usuario "${username}" ya está en uso. Se generará automáticamente un nombre único.`);
      } else {
        setUsernameWarning('');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(userType),
    enableReinitialize: true,
    validateOnMount: false,
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
        console.log('🔍 [Register] Datos específicos de empresa:');
        console.log('  - personality:', registerData.personality);
        console.log('  - birthdate:', registerData.birthdate);
        console.log('  - gender:', registerData.gender);

        const result = await register(registerData);
        
        // Verificar si se generó un username automáticamente
        if (result?.username_info) {
          console.log('Username generado automáticamente:', result.username_info);
          // Mostrar mensaje de éxito con información del username
          alert(`¡Registro exitoso! ${result.username_info.message}`);
        }
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Registration failed:', err);
      }
    },
  });

  // Verificar username cuando cambie el email
  useEffect(() => {
    const email = formik.values.email;
    if (email && email.includes('@')) {
      const username = email.split('@')[0];
      if (username.length >= 3) {
        const timeoutId = setTimeout(() => {
          checkUsername(username);
        }, 500); // Debounce de 500ms
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [formik.values.email]);

  // useEffect para limpiar el formulario al montar el componente
  useEffect(() => {
    // Scroll hacia arriba al montar el componente
    window.scrollTo(0, 0);
    
    // Función para limpiar completamente el formulario
    const clearFormCompletely = () => {
      // Reset de Formik
      formik.resetForm();
      
      // Reset de estados
      setShowPasswords({
        password: false,
        password_confirm: false,
        responsible_password: false,
        responsible_password_confirm: false,
      });
      setShowConduct(false);
      
      // Limpiar localStorage y sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignorar errores
      }
      
      // Limpiar todos los campos del DOM
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input: any) => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else if (input.type === 'date') {
          input.value = '';
        } else {
          input.value = '';
        }
        // Forzar el evento change
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Reset del formulario HTML
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.reset();
      });
    };
    
    // Ejecutar limpieza inmediatamente
    clearFormCompletely();
    
    // Ejecutar limpieza después de un delay para asegurar que se ejecute
    setTimeout(clearFormCompletely, 100);
    setTimeout(clearFormCompletely, 500);
    setTimeout(clearFormCompletely, 1000);
    
  }, []);

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

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setFormKey(Date.now()); // Forzar re-renderizado
    
    // Función para limpiar completamente
    const clearFormCompletely = () => {
      // Reset de Formik
      formik.resetForm();
      
      // Reset de estados
      setShowPasswords({
        password: false,
        password_confirm: false,
        responsible_password: false,
        responsible_password_confirm: false,
      });
      setShowConduct(false);
      
      // Limpiar todos los campos del DOM
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input: any) => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else if (input.type === 'date') {
          input.value = '';
        } else {
          input.value = '';
        }
        // Forzar el evento change
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Reset del formulario HTML
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.reset();
      });
    };
    
    // Ejecutar limpieza inmediatamente
    clearFormCompletely();
    
    // Ejecutar limpieza después de delays para asegurar que se ejecute
    setTimeout(clearFormCompletely, 50);
    setTimeout(clearFormCompletely, 200);
    setTimeout(clearFormCompletely, 500);
  };

  // Función para manejar el cambio de institución
  const handleUniversityChange = (event: any) => {
    const newUniversity = event.target.value;
    formik.setFieldValue('university', newUniversity);
    
    // Generar automáticamente el email basado en nombre y apellido
    if (newUniversity === 'INACAP' && formik.values.first_name && formik.values.last_name) {
      const generatedEmail = generateEmail(formik.values.first_name, formik.values.last_name);
      formik.setFieldValue('email', generatedEmail);
    }
  };

  // Función para manejar cambios en nombre y apellido
  const handleNameChange = (field: string, value: string) => {
    formik.setFieldValue(field, value);
    
    // Generar automáticamente el email si ya se seleccionó INACAP
    if (formik.values.university === 'INACAP') {
      const firstName = field === 'first_name' ? value : formik.values.first_name;
      const lastName = field === 'last_name' ? value : formik.values.last_name;
      
      if (firstName && lastName) {
        const generatedEmail = generateEmail(firstName, lastName);
        formik.setFieldValue('email', generatedEmail);
      }
    }
  };

  // Función para manejar la visibilidad de las contraseñas
  const handleTogglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 4 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            bgcolor: 'white',
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Registro
          </Typography>

          {/* Selector de tipo de usuario */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Button
              variant={userType === 'student' ? 'contained' : 'outlined'}
              startIcon={<SchoolIcon />}
              onClick={() => handleUserTypeChange('student')}
              sx={{ 
                px: 4, 
                py: 2,
                borderRadius: '25px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: userType === 'student' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              Estudiante
            </Button>
            <Button
              variant={userType === 'company' ? 'contained' : 'outlined'}
              startIcon={<BusinessIcon sx={{ color: userType === 'company' ? '#8e24aa' : undefined }} />}
              onClick={() => handleUserTypeChange('company')}
              sx={{ 
                px: 4, 
                py: 2,
                borderRadius: '25px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: userType === 'company' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                }
              }}
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
                <br />• <strong>IMPORTANTE:</strong> El registro actualmente está disponible únicamente para estudiantes de INACAP
                <br />• Solo se permiten correos institucionales de INACAP (@inacapmail.cl)
                <br />• La contraseña debe tener al menos 8 caracteres, una mayúscula y un caracter especial
                <br />• El correo electrónico se generará automáticamente con el formato: nombre.apellido@inacapmail.cl
              </Typography>
            </Alert>
          )}

          {userType === 'company' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Reglas de registro para empresas:</strong>
                <br />• <strong>IMPORTANTE:</strong> El registro actualmente está disponible únicamente para empresas que trabajen con estudiantes de INACAP
                <br />• Todos los campos son obligatorios
                <br />• La contraseña debe tener al menos 8 caracteres, una mayúscula y un caracter especial
                <br />• Los teléfonos deben tener 9 dígitos (se agrega automáticamente +56)
                <br />• Solo se permiten empresas registradas en Chile
              </Typography>
            </Alert>
          )}

                     <Box 
             component="form" 
             onSubmit={formik.handleSubmit} 
             autoComplete="off"
             key={`form-${userType}-${formKey}`}
           >
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
                        placeholder={getFieldPlaceholder('first_name', userType)}
                        value={formik.values.first_name}
                        onChange={(e) => handleNameChange('first_name', e.target.value)}
                        error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                        helperText={
                          formik.touched.first_name && formik.errors.first_name
                            ? formik.errors.first_name
                            : getFieldHelperText('first_name', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ autoComplete: 'off' }}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="last_name"
                        label="Apellido"
                        placeholder={getFieldPlaceholder('last_name', userType)}
                        value={formik.values.last_name}
                        onChange={(e) => handleNameChange('last_name', e.target.value)}
                        error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                        helperText={
                          formik.touched.last_name && formik.errors.last_name
                            ? formik.errors.last_name
                            : getFieldHelperText('last_name', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ autoComplete: 'off' }}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Teléfono"
                        placeholder={getFieldPlaceholder('phone', userType)}
                        value={formik.values.phone.replace(/[^0-9]/g, '').slice(0, 9)}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                          formik.setFieldValue('phone', value);
                        }}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={
                          formik.touched.phone && formik.errors.phone
                            ? formik.errors.phone
                            : getFieldHelperText('phone', userType, false)
                        }
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">+56</InputAdornment>,
                          inputMode: 'numeric',
                        }}
                      />
                    </Box>

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
                        {formik.touched.education_level && formik.errors.education_level && (
                          <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formik.errors.education_level}
                          </Typography>
                        )}
                        {!formik.errors.education_level && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {getFieldHelperText('education_level', userType, false)}
                          </Typography>
                        )}
                      </FormControl>
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
                        helperText={
                          formik.touched.birthdate && formik.errors.birthdate
                            ? formik.errors.birthdate
                            : getFieldHelperText('birthdate', userType, false)
                        }
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
                        {formik.touched.gender && formik.errors.gender && (
                          <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formik.errors.gender}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Información Académica
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Selecciona tu institución educativa para generar automáticamente tu correo institucional
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
                        {formik.touched.university && formik.errors.university && (
                          <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formik.errors.university}
                          </Typography>
                        )}
                        {!formik.errors.university && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {getFieldHelperText('university', userType, false)}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Correo electrónico"
                        type="email"
                        placeholder={getFieldPlaceholder('email', userType)}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={
                          formik.touched.email && formik.errors.email 
                            ? formik.errors.email 
                            : getFieldHelperText('email', userType, false)
                        }
                        disabled={loading}
                        autoComplete="new-email"
                        inputProps={{ autoComplete: 'new-email' }}
                      />
                    </Box>
                  </Box>

                  {/* Advertencia de username duplicado */}
                  {usernameWarning && (
                    <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>⚠️ Nombre de usuario:</strong> {usernameWarning}
                      </Typography>
                    </Alert>
                  )}

                  {/* Indicador de carga para verificación de username */}
                  {isCheckingUsername && (
                    <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>🔍 Verificando nombre de usuario...</strong>
                      </Typography>
                    </Alert>
                  )}

                  {/* Aviso informativo para estudiantes */}
                  <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Importante:</strong> Este correo electrónico será tu usuario para iniciar sesión en la plataforma. 
                      Podrás cambiar tus datos personales una vez estés dentro de tu cuenta.
                    </Typography>
                  </Alert>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="career"
                        label="Carrera"
                        placeholder={getFieldPlaceholder('career', userType)}
                        value={formik.values.career}
                        onChange={formik.handleChange}
                        error={formik.touched.career && Boolean(formik.errors.career)}
                        helperText={
                          formik.touched.career && formik.errors.career
                            ? formik.errors.career
                            : getFieldHelperText('career', userType, false)
                        }
                        disabled={loading}
                      />
                    </Box>
                  </Box>

                  {/* Campos de contraseña solo para estudiantes */}
                  {userType === 'student' && (
                    <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box flex={1} minWidth={200}>
                        <TextField
                          fullWidth
                          name="password"
                          label="Contraseña"
                          type={showPasswords.password ? 'text' : 'password'}
                          placeholder={getFieldPlaceholder('password', userType)}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          error={formik.touched.password && Boolean(formik.errors.password)}
                          helperText={
                            formik.touched.password && formik.errors.password
                              ? formik.errors.password
                              : getFieldHelperText('password', userType, false)
                          }
                          disabled={loading}
                          autoComplete="new-password"
                          inputProps={{ autoComplete: 'new-password' }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => handleTogglePasswordVisibility('password')}
                                  edge="end"
                                  disabled={loading}
                                >
                                  {showPasswords.password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <Box flex={1} minWidth={200}>
                        <TextField
                          fullWidth
                          name="password_confirm"
                          label="Confirmar contraseña"
                          type={showPasswords.password_confirm ? 'text' : 'password'}
                          placeholder={getFieldPlaceholder('password_confirm', userType)}
                          value={formik.values.password_confirm}
                          onChange={formik.handleChange}
                          error={formik.touched.password_confirm && Boolean(formik.errors.password_confirm)}
                          helperText={
                            formik.touched.password_confirm && formik.errors.password_confirm
                              ? formik.errors.password_confirm
                              : getFieldHelperText('password_confirm', userType, false)
                          }
                          disabled={loading}
                          autoComplete="new-password"
                          inputProps={{ autoComplete: 'new-password' }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => handleTogglePasswordVisibility('password_confirm')}
                                  edge="end"
                                  disabled={loading}
                                >
                                  {showPasswords.password_confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Aviso adicional para estudiantes sobre contraseñas */}
                  {userType === 'student' && (
                    <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Recordatorio:</strong> Esta contraseña será la que uses para iniciar sesión en la plataforma. 
                        Guárdala en un lugar seguro.
                      </Typography>
                    </Alert>
                  )}

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
                      Información Personal (usuario responsable)
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="first_name"
                        label="Nombre"
                        placeholder={getFieldPlaceholder('first_name', userType)}
                        value={formik.values.first_name}
                        onChange={formik.handleChange}
                        error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                        helperText={
                          formik.touched.first_name && formik.errors.first_name
                            ? formik.errors.first_name
                            : getFieldHelperText('first_name', userType, false)
                        }
                        disabled={loading}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="last_name"
                        label="Apellido"
                        placeholder={getFieldPlaceholder('last_name', userType)}
                        value={formik.values.last_name}
                        onChange={formik.handleChange}
                        error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                        helperText={
                          formik.touched.last_name && formik.errors.last_name
                            ? formik.errors.last_name
                            : getFieldHelperText('last_name', userType, false)
                        }
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
                        placeholder={getFieldPlaceholder('email', userType)}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={
                          formik.touched.email && formik.errors.email
                            ? formik.errors.email
                            : getFieldHelperText('email', userType, false)
                        }
                        disabled={loading}
                      />
                    </Box>

                    <Box flex={1} minWidth={200}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Teléfono"
                        placeholder={getFieldPlaceholder('phone', userType)}
                        value={formik.values.phone.replace(/[^0-9]/g, '').slice(0, 9)}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                          formik.setFieldValue('phone', value);
                        }}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={
                          formik.touched.phone && formik.errors.phone
                            ? formik.errors.phone
                            : getFieldHelperText('phone', userType, false)
                        }
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
                        helperText={
                          formik.touched.birthdate && formik.errors.birthdate
                            ? formik.errors.birthdate
                            : getFieldHelperText('birthdate', userType, false)
                        }
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
                        {formik.touched.gender && formik.errors.gender && (
                          <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formik.errors.gender}
                          </Typography>
                        )}
                      </FormControl>
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
                        placeholder={getFieldPlaceholder('rut', userType)}
                        value={formik.values.rut}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Limpiar y formatear automáticamente
                          const cleanValue = value.replace(/[^0-9Kk]/g, '');
                          if (cleanValue.length <= 9) {
                            formik.setFieldValue('rut', cleanValue);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const validation = validateChileanRut(value);
                            if (validation.isValid && validation.formattedRut) {
                              formik.setFieldValue('rut', validation.formattedRut);
                            }
                          }
                          formik.handleBlur(e);
                        }}
                        error={formik.touched.rut && Boolean(formik.errors.rut)} 
                        helperText={
                          formik.touched.rut && formik.errors.rut
                            ? formik.errors.rut
                            : getFieldHelperText('rut', userType, false)
                        }
                        disabled={loading}
                        InputProps={{
                          endAdornment: formik.values.rut && (
                            <InputAdornment position="end">
                              {(() => {
                                const validation = validateChileanRut(formik.values.rut);
                                if (validation.isValid) {
                                  return (
                                    <Tooltip title="RUT válido" arrow>
                                      <Box component="span" sx={{ color: 'success.main', fontSize: '1.2rem' }}>
                                        ✓
                                      </Box>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </InputAdornment>
                          )
                        }}
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
                          <MenuItem value="Jurídica">Jurídica</MenuItem>
                          <MenuItem value="Natural">Natural</MenuItem>
                          <MenuItem value="Otra">Otra</MenuItem>
                        </Select>
                        {formik.touched.personality && formik.errors.personality && (
                          <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formik.errors.personality}
                          </Typography>
                        )}
                        {!formik.errors.personality && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {getFieldHelperText('personality', userType, false)}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="business_name" 
                        label="Razón Social" 
                        placeholder={getFieldPlaceholder('business_name', userType)}
                        value={formik.values.business_name} 
                        onChange={formik.handleChange} 
                        error={formik.touched.business_name && Boolean(formik.errors.business_name)} 
                        helperText={
                          formik.touched.business_name && formik.errors.business_name
                            ? formik.errors.business_name
                            : getFieldHelperText('business_name', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ autoComplete: 'off' }}
                      />
                    </Box>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_name" 
                        label="Nombre de la Empresa" 
                        placeholder={getFieldPlaceholder('company_name', userType)}
                        value={formik.values.company_name} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_name && Boolean(formik.errors.company_name)} 
                        helperText={
                          formik.touched.company_name && formik.errors.company_name
                            ? formik.errors.company_name
                            : getFieldHelperText('company_name', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ autoComplete: 'off' }}
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_address" 
                        label="Dirección" 
                        placeholder={getFieldPlaceholder('company_address', userType)}
                        value={formik.values.company_address} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_address && Boolean(formik.errors.company_address)} 
                        helperText={
                          formik.touched.company_address && formik.errors.company_address
                            ? formik.errors.company_address
                            : getFieldHelperText('company_address', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ autoComplete: 'off' }}
                      />
                    </Box>
                    <Box flex={1} minWidth={200}>
                      <TextField 
                        fullWidth 
                        name="company_phone" 
                        label="Teléfono de la Empresa" 
                        placeholder={getFieldPlaceholder('company_phone', userType)}
                        value={formik.values.company_phone.replace(/[^0-9]/g, '').slice(0, 9)} 
                        onChange={e => { 
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9); 
                          formik.setFieldValue('company_phone', value); 
                        }} 
                        error={formik.touched.company_phone && Boolean(formik.errors.company_phone)} 
                        helperText={
                          formik.touched.company_phone && formik.errors.company_phone
                            ? formik.errors.company_phone
                            : getFieldHelperText('company_phone', userType, false)
                        }
                        disabled={loading}
                        autoComplete="off"
                        inputProps={{ 
                          autoComplete: 'off',
                          inputMode: 'numeric' 
                        }}
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
                        placeholder={getFieldPlaceholder('company_email', userType)}
                        value={formik.values.company_email} 
                        onChange={formik.handleChange} 
                        error={formik.touched.company_email && Boolean(formik.errors.company_email)} 
                        helperText={
                          formik.touched.company_email && formik.errors.company_email
                            ? formik.errors.company_email
                            : getFieldHelperText('company_email', userType, false)
                        }
                        disabled={loading}
                        autoComplete="new-email"
                        inputProps={{ autoComplete: 'new-email' }}
                      />
                    </Box>
                  </Box>

                  {/* Aviso sobre email de empresa */}
                  <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Nota:</strong> Este correo electrónico de la empresa será tu usuario para iniciar sesión en la plataforma.
                    </Typography>
                  </Alert>

                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1} minWidth={200}>
                                             <TextField
                         fullWidth
                         name="password"
                         label="Contraseña"
                         type={showPasswords.password ? 'text' : 'password'}
                         placeholder={getFieldPlaceholder('password', userType)}
                         value={formik.values.password}
                         onChange={formik.handleChange}
                         error={formik.touched.password && Boolean(formik.errors.password)}
                         helperText={
                           formik.touched.password && formik.errors.password
                             ? formik.errors.password
                             : getFieldHelperText('password', userType, false)
                         }
                         disabled={loading}
                         autoComplete="new-password"
                         inputProps={{ autoComplete: 'new-password' }}
                         InputProps={{
                           endAdornment: (
                             <InputAdornment position="end">
                               <IconButton
                                 onClick={() => handleTogglePasswordVisibility('password')}
                                 edge="end"
                                 disabled={loading}
                               >
                                 {showPasswords.password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                               </IconButton>
                             </InputAdornment>
                           ),
                         }}
                       />
                    </Box>

                    <Box flex={1} minWidth={200}>
                                             <TextField
                         fullWidth
                         name="password_confirm"
                         label="Confirmar contraseña"
                         type={showPasswords.password_confirm ? 'text' : 'password'}
                         placeholder={getFieldPlaceholder('password_confirm', userType)}
                         value={formik.values.password_confirm}
                         onChange={formik.handleChange}
                         error={formik.touched.password_confirm && Boolean(formik.errors.password_confirm)}
                         helperText={
                           formik.touched.password_confirm && formik.errors.password_confirm
                             ? formik.errors.password_confirm
                             : getFieldHelperText('password_confirm', userType, false)
                         }
                         disabled={loading}
                         autoComplete="new-password"
                         inputProps={{ autoComplete: 'new-password' }}
                         InputProps={{
                           endAdornment: (
                             <InputAdornment position="end">
                               <IconButton
                                 onClick={() => handleTogglePasswordVisibility('password_confirm')}
                                 edge="end"
                                 disabled={loading}
                               >
                                 {showPasswords.password_confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                               </IconButton>
                             </InputAdornment>
                           ),
                         }}
                       />
                    </Box>
                  </Box>

                  {/* Aviso informativo para empresas */}
                  <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Importante:</strong> El correo electrónico de la empresa y la contraseña serán tus credenciales para iniciar sesión en la plataforma. 
                      Podrás cambiar tus datos una vez estés dentro de tu cuenta.
                    </Typography>
                  </Alert>



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
                  sx={{ 
                    mt: 2, 
                    borderRadius: '30px',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                    }
                  }}
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
                    sx={{ 
                      mt: 1,
                      borderRadius: '25px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '14px',
                      px: 3,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
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