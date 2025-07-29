import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';


interface ProfileData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  institucion: string;
  carrera: string;
  nivel: string;
  habilidades: Array<{ nombre: string; nivel: string }>;
  biografia: string;
  cv_link: string;
  certificado_link: string;
  area?: string;
  modalidadesDisponibles?: string[];
  experienciaPrevia?: string;
  linkedin?: string;
  github?: string;
  portafolio?: string;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
}

interface StudentData {
  id: string;
  career: string;
  api_level: number;
  skills: string[];
  cv_link: string;
  certificado_link: string;
  availability: string;
  experience_years: number;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Habilidades técnicas organizadas por área
const HABILIDADES_POR_AREA = {
  'Tecnología y Sistemas': [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'HTML/CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'Google Cloud', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
    'Machine Learning', 'Data Science', 'Big Data', 'Hadoop', 'Spark', 'TensorFlow', 'PyTorch',
    'Cybersecurity', 'Ethical Hacking', 'Network Security', 'DevOps', 'Linux', 'Windows Server'
  ],
  'Administración y Gestión': [
    'Gestión de Proyectos', 'Scrum', 'Agile', 'Kanban', 'Lean Management', 'Six Sigma',
    'Análisis Financiero', 'Contabilidad', 'Presupuestos', 'Control de Costos', 'ROI',
    'Gestión de Recursos Humanos', 'Reclutamiento', 'Capacitación', 'Evaluación de Desempeño',
    'Marketing Digital', 'SEO', 'SEM', 'Google Analytics', 'Facebook Ads', 'Email Marketing',
    'Ventas', 'Negociación', 'Customer Relationship Management (CRM)', 'Business Intelligence',
    'Logística', 'Cadena de Suministro', 'Inventarios', 'Compras', 'Proveedores'
  ],
  'Comunicación y Marketing': [
    'Redacción Publicitaria', 'Copywriting', 'Content Marketing', 'Social Media Marketing',
    'Branding', 'Identidad Corporativa', 'Publicidad Digital', 'Influencer Marketing',
    'Comunicación Corporativa', 'Relaciones Públicas', 'Eventos', 'Presentaciones',
    'Fotografía', 'Videografía', 'Edición de Video', 'Motion Graphics', 'Animación',
    'Diseño Gráfico', 'Ilustración', 'Tipografía', 'Color Theory', 'Composición Visual',
    'Periodismo', 'Comunicación Digital', 'Podcasting', 'Streaming', 'Live Marketing'
  ],
  'Salud y Ciencias': [
    'Anatomía', 'Fisiología', 'Bioquímica', 'Microbiología', 'Genética', 'Farmacología',
    'Epidemiología', 'Bioestadística', 'Investigación Clínica', 'Enfermería', 'Fisioterapia',
    'Nutrición', 'Psicología', 'Psiquiatría', 'Terapia Ocupacional', 'Tecnología Médica',
    'Laboratorio Clínico', 'Radiología', 'Anestesiología', 'Cirugía', 'Medicina Preventiva',
    'Salud Pública', 'Toxicología', 'Inmunología', 'Oncología', 'Cardiología', 'Neurología'
  ],
  'Ingeniería y Construcción': [
    'AutoCAD', 'Revit', 'SolidWorks', 'Inventor', 'SketchUp', '3D Modeling', 'Drafting',
    'Ingeniería Estructural', 'Análisis de Elementos Finitos', 'Diseño Mecánico',
    'Termodinámica', 'Mecánica de Fluidos', 'Transferencia de Calor', 'Materiales',
    'Ingeniería Eléctrica', 'Electrónica', 'Circuitos', 'Microcontroladores', 'PLC',
    'Ingeniería Civil', 'Topografía', 'Geotecnia', 'Hidráulica', 'Transporte',
    'Construcción', 'Gestión de Obras', 'Seguridad Industrial', 'Mantenimiento'
  ],
  'Educación y Formación': [
    'Diseño Instruccional', 'E-learning', 'Plataformas LMS', 'Moodle', 'Canvas',
    'Metodologías Pedagógicas', 'Evaluación Educativa', 'Tecnología Educativa',
    'Gamificación', 'Realidad Virtual en Educación', 'Inteligencia Artificial en Educación',
    'Tutoring', 'Coaching', 'Mentoring', 'Capacitación Corporativa', 'Desarrollo de Contenido',
    'Psicopedagogía', 'Educación Especial', 'Educación a Distancia', 'Blended Learning'
  ],
  'Arte y Diseño': [
    'Dibujo', 'Pintura', 'Escultura', 'Fotografía', 'Cinematografía', 'Animación 2D/3D',
    'Diseño de Personajes', 'Concept Art', 'Storyboarding', 'Comic/Manga',
    'Diseño de Interiores', 'Arquitectura', 'Diseño Industrial', 'Diseño de Producto',
    'Diseño Web', 'UI/UX Design', 'Diseño de Apps', 'Diseño Editorial', 'Typography',
    'Color Theory', 'Composición', 'Ilustración Digital', 'Fotografía de Producto'
  ],
  'Investigación y Desarrollo': [
    'Metodología de Investigación', 'Estadística', 'Análisis de Datos', 'SPSS', 'R', 'Python',
    'Machine Learning', 'Deep Learning', 'Inteligencia Artificial', 'Computer Vision',
    'Natural Language Processing', 'Robótica', 'Automatización', 'IoT', 'Blockchain',
    'Nanotecnología', 'Biotecnología', 'Química Analítica', 'Física Aplicada',
    'Investigación de Mercados', 'Estudios de Usabilidad', 'Prototipado', 'Validación'
  ],
  'Servicios y Atención al Cliente': [
    'Customer Service', 'Call Center', 'Chat Support', 'Email Support', 'Social Media Support',
    'Gestión de Quejas', 'Resolución de Conflictos', 'Empatía', 'Comunicación Asertiva',
    'Ventas', 'Técnicas de Venta', 'Cierre de Ventas', 'Fidelización de Clientes',
    'Hospitalidad', 'Turismo', 'Gastronomía', 'Eventos', 'Wedding Planning',
    'Consultoría', 'Coaching', 'Mentoring', 'Recursos Humanos', 'Reclutamiento'
  ],
  'Sostenibilidad y Medio Ambiente': [
    'Gestión Ambiental', 'ISO 14001', 'Auditoría Ambiental', 'Evaluación de Impacto Ambiental',
    'Energías Renovables', 'Solar', 'Eólica', 'Hidroeléctrica', 'Biomasa', 'Geotérmica',
    'Eficiencia Energética', 'Construcción Sostenible', 'LEED', 'BREEAM',
    'Economía Circular', 'Reciclaje', 'Gestión de Residuos', 'Huella de Carbono',
    'Biodiversidad', 'Conservación', 'Educación Ambiental', 'Políticas Ambientales'
  ]
};

// Componente separado para el formulario de contraseña
const PasswordForm = ({ 
  onSubmit, 
  onCancel
}: { 
  onSubmit: (data: ChangePasswordData) => void;
  onCancel: () => void;
}) => {
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Ref para forzar la limpieza del campo
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  // Efecto para limpiar el campo cuando se monta el componente
  useEffect(() => {
    // Limpiar el estado inmediatamente
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    
    // Esperar a que el DOM esté listo
    const timer = setTimeout(() => {
      if (currentPasswordRef.current) {
        // Forzar la limpieza del campo usando JavaScript directo
        currentPasswordRef.current.value = '';
        
        // Forzar el foco y luego quitar el foco para asegurar la limpieza
        currentPasswordRef.current.focus();
        setTimeout(() => {
          if (currentPasswordRef.current) {
            currentPasswordRef.current.blur();
          }
        }, 50);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    onSubmit(passwordData);
  };

  return (
    <>
      <DialogTitle>Cambiar Contraseña</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <input
              ref={currentPasswordRef}
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
              autoComplete="off"
              style={{
                width: '100%',
                padding: '16.5px 14px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
              }}
              placeholder="Contraseña actual *"
            />
            <IconButton
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>
          
          <TextField
            label="Nueva contraseña"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            required
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Confirmar nueva contraseña"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            required
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
        >
          Cambiar Contraseña
        </Button>
      </DialogActions>
    </>
  );
};


export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    institucion: '',
    carrera: '',
    nivel: '',
    habilidades: [],
    biografia: '',
    cv_link: '',
    certificado_link: '',
    area: '',
    modalidadesDisponibles: [],
    experienciaPrevia: '',
    linkedin: '',
    github: '',
    portafolio: '',
  });

  const [editData, setEditData] = useState<ProfileData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    institucion: '',
    carrera: '',
    nivel: '',
    habilidades: [],
    biografia: '',
    cv_link: '',
    certificado_link: '',
    area: '',
    modalidadesDisponibles: [],
    experienciaPrevia: '',
    linkedin: '',
    github: '',
    portafolio: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Básico');
  const [selectedArea, setSelectedArea] = useState('');
  const [userId, setUserId] = useState<string>('');

  // Estados para cambio de contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(Date.now());
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Limpiar habilidad cuando cambie el área
  useEffect(() => {
    setNewSkill('');
    setNewSkillLevel('Básico');
  }, [selectedArea]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Obtener datos del usuario (que incluye birthdate y gender)
      const userResponse = await apiService.get('/api/users/profile/');
      const userData = userResponse as any;
      
      // Obtener datos del estudiante
      const studentResponse = await apiService.get('/api/students/me/');
      const studentData = studentResponse as any;
      
      console.log('📄 [StudentProfile] Datos de usuario recibidos:', userData);
      console.log('📄 [StudentProfile] Datos de estudiante recibidos:', studentData);
      console.log('📄 [StudentProfile] userData.birthdate:', userData.birthdate);
      console.log('📄 [StudentProfile] userData.gender:', userData.gender);
      
      // Mapear y unir los datos
      const safeData: ProfileData = {
        nombre: userData.first_name || '',
        apellido: userData.last_name || '',
        email: userData.email || '',
        telefono: userData.phone || '',
        fechaNacimiento: userData.birthdate || '',
        genero: userData.gender || '',
        institucion: '', // No disponible
        carrera: userData.career || studentData.career || '',
        nivel: studentData.api_level?.toString() || '1',
        habilidades: Array.isArray(studentData.skills) ? studentData.skills.map((skill: string) => ({ nombre: skill, nivel: 'Intermedio' })) : [],
        biografia: userData.bio || '', // Carta de presentación
        cv_link: studentData.cv_link || '',
        certificado_link: studentData.certificado_link || '',
        area: studentData.area || '',
        modalidadesDisponibles: studentData.availability ? [studentData.availability] : [],
        experienciaPrevia: studentData.experience_years?.toString() || '',
        linkedin: studentData.linkedin_url || '',
        github: studentData.github_url || '',
        portafolio: studentData.portfolio_url || '',
      };

      console.log('📄 [StudentProfile] CV Link recibido del backend:', studentData.cv_link);
      console.log('📄 [StudentProfile] Certificado Link recibido del backend:', studentData.certificado_link);
      console.log('📄 [StudentProfile] Datos mapeados:', safeData);
      
      setProfileData(safeData);
      setEditData(safeData);
      setUserId(studentData.id || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setShowError(true);
      setErrorMessage('Error al cargar el perfil');
    }
    setLoading(false);
  };

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // URLs vacías son válidas (opcionales)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!editData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!editData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!editData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(editData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!editData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!validatePhone(editData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    // Remover validación de institución ya que no se usa en el backend
    // if (!editData.institucion.trim()) {
    //   errors.institucion = 'La institución es requerida';
    // }

    if (!editData.carrera.trim()) {
      errors.carrera = 'La carrera es requerida';
    }

    if (!editData.biografia.trim()) {
      errors.biografia = 'La carta de presentación es requerida';
    } else if (editData.biografia.length < 50) {
      errors.biografia = 'La carta de presentación debe tener al menos 50 caracteres';
    }

    // Validar URLs
    if (editData.cv_link && !validateUrl(editData.cv_link)) {
      errors.cv_link = 'La URL del CV no es válida';
    }

    if (editData.certificado_link && !validateUrl(editData.certificado_link)) {
      errors.certificado_link = 'La URL del certificado no es válida';
    }

    if (editData.linkedin && !validateUrl(editData.linkedin)) {
      errors.linkedin = 'La URL de LinkedIn no es válida';
    }

    if (editData.github && !validateUrl(editData.github)) {
      errors.github = 'La URL de GitHub no es válida';
    }

    if (editData.portafolio && !validateUrl(editData.portafolio)) {
      errors.portafolio = 'La URL del portafolio no es válida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
    setValidationErrors({});
    // Limpiar estados de habilidades
    setNewSkill('');
    setNewSkillLevel('Básico');
    setSelectedArea('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setErrorMessage('Por favor, corrige los errores en el formulario');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Primero actualizar los datos del usuario (incluyendo birthdate y gender)
      const userUpdateData = {
        first_name: editData.nombre,
        last_name: editData.apellido,
        email: editData.email,
        phone: editData.telefono,
        bio: editData.biografia,
        birthdate: editData.fechaNacimiento || null,
        gender: editData.genero || null,
        career: editData.carrera,
      };

      console.log('🔍 [StudentProfile] Actualizando datos de usuario:', userUpdateData);
      await apiService.patch('/api/users/profile/', userUpdateData);

      // Luego actualizar los datos del estudiante
      const studentUpdateData = {
        career: editData.carrera,
        api_level: parseInt(editData.nivel) || 1,
        skills: editData.habilidades.map(h => h.nombre),
        languages: [], // Por ahora vacío, se puede expandir después
        portfolio_url: editData.portafolio,
        github_url: editData.github,
        linkedin_url: editData.linkedin,
        cv_link: editData.cv_link,
        certificado_link: editData.certificado_link,
        availability: editData.modalidadesDisponibles?.[0] || 'flexible',
        location: '', // Por ahora vacío
        area: editData.area,
        experience_years: parseInt(editData.experienciaPrevia || '0') || 0,
      };

      console.log('🔍 [StudentProfile] Enviando datos de estudiante al backend:', studentUpdateData);
      console.log('📄 [StudentProfile] CV Link a enviar:', studentUpdateData.cv_link);
      console.log('📄 [StudentProfile] Certificado Link a enviar:', studentUpdateData.certificado_link);
      
      await apiService.put(`/api/students/${userId}/update/`, studentUpdateData);
      
      // Recargar el perfil para obtener los datos actualizados
      await fetchProfile();
      
      setIsEditing(false);
      setShowSuccess(true);
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('Error al guardar los cambios. Intenta nuevamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setValidationErrors({});
    // Limpiar estados de habilidades
    setNewSkill('');
    setNewSkillLevel('Básico');
    setSelectedArea('');
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Habilidades
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      setErrorMessage('Por favor, selecciona una habilidad');
      setShowError(true);
      return;
    }

    // Validar que la habilidad esté en la lista de habilidades disponibles
    if (selectedArea && !HABILIDADES_POR_AREA[selectedArea as keyof typeof HABILIDADES_POR_AREA]?.includes(newSkill.trim())) {
      setErrorMessage('La habilidad seleccionada no es válida para el área elegida');
      setShowError(true);
      return;
    }

    if ((editData.habilidades || []).some(h => h.nombre.toLowerCase() === newSkill.trim().toLowerCase())) {
      setErrorMessage('Esta habilidad ya existe en tu perfil');
      setShowError(true);
      return;
    }

    setEditData(prev => ({
      ...prev,
      habilidades: [...(prev.habilidades || []), { nombre: newSkill.trim(), nivel: newSkillLevel }],
    }));
    setNewSkill('');
    setNewSkillLevel('Básico');
    setSelectedArea('');
  };

  const handleDeleteSkill = (nombre: string) => {
    setSkillToDelete(nombre);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSkill = () => {
    setEditData(prev => ({
      ...prev,
      habilidades: (prev.habilidades || []).filter(h => h.nombre !== skillToDelete),
    }));
    setDeleteDialogOpen(false);
    setSkillToDelete('');
  };

  // Documentos - Links de drivers
  const handleCvLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📄 [StudentProfile] CV Link cambiado a:', e.target.value);
    setEditData(prev => ({ ...prev, cv_link: e.target.value }));
  };

  const handleCertLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📄 [StudentProfile] Certificado Link cambiado a:', e.target.value);
    setEditData(prev => ({ ...prev, certificado_link: e.target.value }));
  };

  // Funciones para cambio de contraseña
  const handleChangePassword = async (formData: ChangePasswordData) => {
    if (formData.new_password !== formData.confirm_password) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.new_password.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const passwordData = {
        old_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirm: formData.confirm_password,
      };
      
      await apiService.post('/api/users/change-password/', passwordData);
      
      setPasswordSuccess('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
    } catch (error) {
      console.error('❌ [StudentProfile] Error al cambiar contraseña:', error);
      setPasswordError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  const handleOpenPasswordDialog = () => {
    // Limpiar errores y mensajes
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Cerrar el diálogo primero para destruir el componente
    setShowPasswordDialog(false);
    
    // Generar una nueva key única y abrir el diálogo después de un delay
    setTimeout(() => {
      setDialogKey(Date.now());
      setShowPasswordDialog(true);
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mi Perfil</Typography>
        {!isEditing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleOpenPasswordDialog}
            >
              Cambiar Contraseña
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Editar Perfil
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={isLoading}
              sx={{ minWidth: 120, borderRadius: 2 }}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Datos personales */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Nombre"
              value={isEditing ? (editData.nombre || '') : (profileData.nombre || '')}
              onChange={e => handleInputChange('nombre', e.target.value)}
              disabled={!isEditing}
              fullWidth
              error={!!validationErrors.nombre}
              helperText={validationErrors.nombre}
            />
            <TextField
              label="Apellido"
              value={isEditing ? (editData.apellido || '') : (profileData.apellido || '')}
              onChange={e => handleInputChange('apellido', e.target.value)}
              disabled={!isEditing}
              fullWidth
              error={!!validationErrors.apellido}
              helperText={validationErrors.apellido}
            />
          </Box>
          <TextField
            label="Correo Electrónico"
            value={isEditing ? (editData.email || '') : (profileData.email || '')}
            onChange={e => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            label="Teléfono"
            value={isEditing ? (editData.telefono || '') : (profileData.telefono || '')}
            onChange={e => handleInputChange('telefono', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.telefono}
            helperText={validationErrors.telefono}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              value={isEditing ? (editData.fechaNacimiento || '') : (profileData.fechaNacimiento || '')}
              onChange={e => handleInputChange('fechaNacimiento', e.target.value)}
              disabled={!isEditing}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Género"
              select
              value={isEditing ? (editData.genero || '') : (profileData.genero || '')}
              onChange={e => handleInputChange('genero', e.target.value)}
              disabled={!isEditing}
              fullWidth
            >
              <MenuItem value="">Selecciona el género</MenuItem>
              <MenuItem value="Mujer">Mujer</MenuItem>
              <MenuItem value="Hombre">Hombre</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
          </Box>
          {/* Campo de institución removido ya que no es necesario */}
          <TextField
            label="Carrera"
            value={isEditing ? (editData.carrera || '') : (profileData.carrera || '')}
            onChange={e => handleInputChange('carrera', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.carrera}
            helperText={validationErrors.carrera}
          />
          <TextField
            label="Nivel Educativo"
            value={isEditing ? (editData.nivel || '') : (profileData.nivel || '')}
            onChange={e => handleInputChange('nivel', e.target.value)}
            disabled={!isEditing}
            fullWidth
          />

          {/* Habilidades */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Habilidades</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(editData.habilidades || []).map((h) => (
              <Chip
                key={h.nombre}
                label={`${h.nombre} (${h.nivel})`}
                color="primary"
                onDelete={isEditing ? () => handleDeleteSkill(h.nombre) : undefined}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Área de habilidad</InputLabel>
                <Select
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  label="Área de habilidad"
                >
                  <MenuItem value="">Seleccionar área</MenuItem>
                  {Object.keys(HABILIDADES_POR_AREA).map(area => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Habilidad</InputLabel>
                <Select
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  label="Habilidad"
                  disabled={!selectedArea}
                >
                  <MenuItem value="">Seleccionar habilidad</MenuItem>
                  {selectedArea && HABILIDADES_POR_AREA[selectedArea as keyof typeof HABILIDADES_POR_AREA]?.map(skill => (
                    <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                size="small"
                select
                label="Nivel"
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Básico">Básico</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
              </TextField>
              
              <Button 
                variant="contained" 
                onClick={handleAddSkill} 
                size="small"
                disabled={!newSkill || !selectedArea}
              >
                Agregar
              </Button>
            </Box>
          )}

          {/* Documentos - Links de Drivers */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Documentos - Links de Drivers</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sube tus documentos a Google Drive, OneDrive o similar y comparte los links aquí
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>CV</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editData.cv_link || ''}
                  onChange={handleCvLinkChange}
                  placeholder="https://drive.google.com/file/d/... (Google Drive, OneDrive, etc.)"
                  error={!!validationErrors.cv_link}
                  helperText={validationErrors.cv_link || 'Link al CV en Google Drive, OneDrive o similar'}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Box sx={{ mt: 1 }}>
                  {editData.cv_link ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label="CV disponible"
                        color="success"
                        icon={<CheckCircleIcon />}
                        onClick={() => window.open(editData.cv_link, '_blank')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No agregado</Typography>
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Certificado</Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editData.certificado_link || ''}
                  onChange={handleCertLinkChange}
                  placeholder="https://drive.google.com/file/d/... (Google Drive, OneDrive, etc.)"
                  error={!!validationErrors.certificado_link}
                  helperText={validationErrors.certificado_link || 'Link al certificado en Google Drive, OneDrive o similar'}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Box sx={{ mt: 1 }}>
                  {editData.certificado_link ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label="Certificado disponible"
                        color="success"
                        icon={<CheckCircleIcon />}
                        onClick={() => window.open(editData.certificado_link, '_blank')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No agregado</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Carta de Presentación */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Carta de Presentación</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={isEditing ? (editData.biografia || '') : (profileData.biografia || '')}
            onChange={e => handleInputChange('biografia', e.target.value)}
            disabled={!isEditing}
            placeholder="Escribe tu carta de presentación para las empresas... (mínimo 50 caracteres)"
            sx={{ borderRadius: 2 }}
            error={!!validationErrors.biografia}
            helperText={validationErrors.biografia || `${(editData.biografia || '').length}/50 caracteres mínimos`}
          />

          {/* Datos adicionales */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>Área de interés</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.area || ''}
                onChange={e => handleInputChange('area', e.target.value)}
                placeholder="Ej: Desarrollo Web, Data Science, etc."
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.area || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Modalidades disponibles</Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                SelectProps={{ multiple: true }}
                value={editData.modalidadesDisponibles || []}
                onChange={e => handleInputChange('modalidadesDisponibles', Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Tiempo completo">Tiempo completo</MenuItem>
                <MenuItem value="Tiempo parcial">Tiempo parcial</MenuItem>
                <MenuItem value="Flexible">Flexible</MenuItem>
              </TextField>
            ) : (
              <Box sx={{ mb: 2 }}>
                {(profileData.modalidadesDisponibles || []).map(m => (
                  <Chip key={m} label={m} sx={{ mr: 1, mb: 1 }} />
                ))}
                {(!profileData.modalidadesDisponibles || profileData.modalidadesDisponibles.length === 0) && <Typography variant="body2">-</Typography>}
              </Box>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Experiencia previa</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={editData.experienciaPrevia || ''}
                onChange={e => handleInputChange('experienciaPrevia', e.target.value)}
                placeholder="Describe tu experiencia previa en algún puesto, práctica, voluntariado, etc."
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.experienciaPrevia || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>LinkedIn</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.linkedin || ''}
                onChange={e => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/usuario"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.linkedin || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>GitHub</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.github || ''}
                onChange={e => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/usuario"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.github || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Portafolio</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.portafolio || ''}
                onChange={e => handleInputChange('portafolio', e.target.value)}
                placeholder="https://miportafolio.com (opcional)"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.portafolio || '-'}</Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbars */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ¡Perfil actualizado correctamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Dialog de confirmación para eliminar habilidad */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la habilidad "{skillToDelete}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSkill} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de cambio de contraseña */}
      <Dialog
        key={dialogKey}
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <PasswordForm
          onSubmit={handleChangePassword}
          onCancel={() => setShowPasswordDialog(false)}
        />
      </Dialog>

      {/* Snackbar para mensajes de contraseña */}
      <Snackbar
        open={!!passwordError}
        autoHideDuration={6000}
        onClose={() => setPasswordError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {passwordError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!passwordSuccess}
        autoHideDuration={4000}
        onClose={() => setPasswordSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {passwordSuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 