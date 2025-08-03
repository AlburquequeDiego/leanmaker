import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  MenuItem,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Tooltip,
  Grid,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  WorkOutline as WorkOutlineIcon,
  LocationOn as LocationOnIcon,
  Computer as ComputerIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { apiService } from '../../../../services/api.service';
import { ShowLatestFilter } from '../../../../components/common/ShowLatestFilter';

import { MODALIDADES } from '../../../../modalidades';

interface Project {
  id: string;
  title: string;
  company_name: string;
  description: string;
  requirements: string;
  objetivo?: string;
  area: string;
  status: string;
  status_id: number;
  trl_level?: number;
  api_level?: number;
  max_students?: number;
  current_students?: number;
  
  modality?: string;
  location?: string;
  duration_weeks?: number;
  hours_per_week?: number;
  is_featured?: boolean;
  is_urgent?: boolean;
  created_at?: string;
  updated_at?: string;
  required_hours?: number;
}

const areas = [
  'Tecnología y Sistemas',
  'Administración y Gestión',
  'Comunicación y Marketing',
  'Salud y Ciencias',
  'Ingeniería y Construcción',
  'Educación y Formación',
  'Arte y Diseño',
  'Investigación y Desarrollo',
  'Servicios y Atención al Cliente',
  'Sostenibilidad y Medio Ambiente'
];
const duraciones = ['1 mes', '2 meses', '3 meses', '6 meses', '12 meses'];
const tecnologias = ['React', 'Node.js', 'MongoDB', 'Python', 'Pandas', 'Power BI', 'Figma', 'Adobe XD', 'UI/UX'];

export default function AvailableProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [studentApiLevel, setStudentApiLevel] = useState<number>(1);

  // Filtros avanzados
  const [area, setArea] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tecs, setTecs] = useState<string[]>([]);
  const [showLatest, setShowLatest] = useState(50);

  // Estado para mostrar alertas de modalidad
  const [showModalidadAlert, setShowModalidadAlert] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchStudentApiLevel();
    fetchExistingApplications();
  }, []);

  const fetchStudentApiLevel = async () => {
    try {
      const studentData = await apiService.get('/api/students/me/');
      setStudentApiLevel(Number(studentData.api_level) || 1);
    } catch (error) {
      console.error('Error fetching student API level:', error);
      setStudentApiLevel(1);
    }
  };

  const fetchExistingApplications = async () => {
    try {
      const applications = await apiService.get('/api/applications/');
      if (applications.data && Array.isArray(applications.data)) {
        const appliedProjectIds = applications.data.map((app: any) => app.project_id || app.project);
        setApplied(appliedProjectIds);
      }
    } catch (error) {
      console.error('Error fetching existing applications:', error);
      setApplied([]);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/projects/');
      const availableProjects = Array.isArray(data.results) ? data.results : [];
      setProjects(availableProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error al cargar los proyectos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    try {
      const applicationData = {
        project_id: projectId,
        status: 'pending',
        applied_at: new Date().toISOString(),
      };

      await apiService.post('/api/applications/', applicationData);
      setApplied((prev) => [...prev, projectId]);
      setSnackbar({ 
        open: true, 
        message: '¡Postulación enviada con éxito!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error applying to project:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al enviar la postulación. Inténtalo de nuevo.', 
        severity: 'error' 
      });
    }
  };

  const handleOpenDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedProject(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const canApplyToProject = (project: Project) => {
    const requiredApiLevel = project.api_level || 1;
    return studentApiLevel >= requiredApiLevel;
  };

  const getApiLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'warning';
      default: return 'default';
    }
  };

  const getTrlLevelColor = (level: number) => {
    if (level <= 3) return 'info';
    if (level <= 6) return 'primary';
    return 'warning';
  };

  // Función para obtener la descripción de la modalidad
  const getModalidadDescription = (modalidad: string) => {
    switch (modalidad.toLowerCase()) {
      case 'remoto':
        return 'Trabajo desde cualquier ubicación. Flexibilidad total de horarios y ubicación. Ideal para estudiantes que prefieren trabajar desde casa o necesitan compatibilidad con otros compromisos.';
      case 'presencial':
        return 'Trabajo en las instalaciones de la empresa. Interacción directa con el equipo y acceso a recursos físicos. Perfecto para quienes buscan experiencia en entorno corporativo real.';
      case 'híbrido':
        return 'Combinación de trabajo remoto y presencial. Flexibilidad con momentos de colaboración en persona. Balance ideal entre autonomía y trabajo en equipo.';
      default:
        return '';
    }
  };

  // Función para obtener el icono de la modalidad
  const getModalidadIcon = (modalidad: string) => {
    switch (modalidad.toLowerCase()) {
      case 'remoto':
        return <ComputerIcon />;
      case 'presencial':
        return <LocationOnIcon />;
      case 'híbrido':
        return <WorkOutlineIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Función para obtener el color de la modalidad
  const getModalidadColor = (modalidad: string) => {
    switch (modalidad.toLowerCase()) {
      case 'remoto':
        return '#2196f3';
      case 'presencial':
        return '#4caf50';
      case 'híbrido':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  // Función helper para traducir modalidades del backend al frontend
  const translateModality = (backendModality: string): string => {
    const modalityMap: { [key: string]: string } = {
      'remote': 'Remoto',
      'onsite': 'Presencial', 
      'hybrid': 'Híbrido'
    };
    return modalityMap[backendModality?.toLowerCase()] || backendModality;
  };

  let filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (area) {
    filteredProjects = filteredProjects.filter(project =>
      project.area.toLowerCase().includes(area.toLowerCase())
    );
  }
  
  if (modalidad) {
    filteredProjects = filteredProjects.filter(project => {
      if (!project.modality) return false;
      return translateModality(project.modality) === modalidad;
    });
  }
  
  // Ordenar por fecha más reciente por defecto
  filteredProjects = filteredProjects.sort((a, b) => 
    new Date(b.created_at || b.updated_at || '').getTime() - new Date(a.created_at || a.updated_at || '').getTime()
  );

  filteredProjects = filteredProjects.slice(0, showLatest);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderProjectDetail = (project: Project) => (
    <Dialog 
      open={detailOpen} 
      onClose={handleCloseDetail} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box sx={{ 
        p: 2.5, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -30, 
          right: -30, 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ 
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
            letterSpacing: '0.3px'
          }}>
            {project.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
              <BusinessIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={600}>{project.company_name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
              <CategoryIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={600}>{project.area}</Typography>
            </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
               <InfoIcon sx={{ fontSize: 16 }} />
               <Typography variant="body2" fontWeight={600}>{translateProjectStatus(project.status)}</Typography>
             </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        p: 2.5, 
        bgcolor: '#fafafa',
        maxHeight: 'calc(85vh - 140px)',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '3px',
          '&:hover': {
            background: '#a8a8a8',
          },
        },
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 1.5, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  Descripción del Proyecto
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                lineHeight: 1.6, 
                color: '#374151',
                fontSize: '1rem'
              }}>
                {project.description}
              </Typography>
            </Paper>

            {project.objetivo && (
              <Paper sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #e8f5e8 0%, #f0f8f0 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1.5, 
                    bgcolor: 'success.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FlagIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    Objetivos del Proyecto
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.6, 
                  color: '#374151',
                  fontSize: '1rem'
                }}>
                  {project.objetivo}
        </Typography>
              </Paper>
            )}

              {project.requirements && (
              <Paper sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #fff3e0 0%, #fef7f0 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1.5, 
                    bgcolor: 'warning.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    Requisitos del Proyecto
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.6, 
                  color: '#374151',
                  fontSize: '1rem'
                }}>
                  {project.requirements}
                </Typography>
              </Paper>
            )}

            <Paper sx={{ 
              p: 2, 
              borderRadius: 2,
              background: 'linear-gradient(145deg, #f3f4f6 0%, #ffffff 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="text.primary" sx={{ mb: 1.5 }}>
                Detalles del Proyecto
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`API ${project.api_level || 1}`} 
                  color={getApiLevelColor(project.api_level || 1)} 
                  size="small" 
                  icon={<TrendingUpIcon />} 
                  sx={{ 
                    fontWeight: 600,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                  }} 
                />
                <Chip 
                  label={translateModality(project.modality)} 
                  color="info" 
                  size="small" 
                  sx={{ 
                    fontWeight: 600,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                  }} 
                />
                {project.hours_per_week && (
                  <Chip 
                    label={`${project.hours_per_week} hrs/sem`} 
                    color="default" 
                    size="small" 
                    icon={<AccessTimeIcon />}
                    sx={{ 
                      fontWeight: 600,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                    }} 
                  />
                )}
                {project.required_hours && (
                  <Chip 
                    label={`${project.required_hours} hrs total`} 
                    color="default" 
                    size="small" 
                    icon={<ScheduleIcon />}
                    sx={{ 
                      fontWeight: 600,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                    }} 
                  />
                )}
                {project.max_students && (
                  <Chip 
                    label={`Máx. ${project.max_students} estudiantes`} 
                    color="success" 
                    size="small" 
                    icon={<GroupIcon />}
                    sx={{ 
                      fontWeight: 600,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                    }} 
                  />
                )}
              </Box>
            </Paper>

            <Paper sx={{ 
              p: 2, 
              mt: 2, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 1.5, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScienceIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    Estado del Proyecto
                  </Typography>
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  {project.trl_level ? getTrlDescriptionOnly(project.trl_level) : 'Estado no definido'}
                </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: 2,
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              height: 'fit-content',
              position: 'sticky',
              top: 20
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary.main" sx={{ mb: 2 }}>
                Información del Proyecto
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Fecha de Creación
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  color: '#374151', 
                  fontWeight: 500,
                  bgcolor: '#f3f4f6',
                  p: 1,
                  borderRadius: 1.5,
                  fontSize: '0.875rem'
                }}>
                  {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <InfoIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Estado Actual
                  </Typography>
                </Box>
                                 <Typography variant="body2" sx={{ 
                   color: '#374151', 
                   fontWeight: 500,
                   bgcolor: '#f3f4f6',
                   p: 1,
                   borderRadius: 1.5,
                   fontSize: '0.875rem'
                 }}>
                   {translateProjectStatus(project.status)}
                 </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
                <Button 
                  onClick={handleCloseDetail} 
                  variant="outlined" 
                  color="secondary"
                  size="small"
                  sx={{ 
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    borderWidth: 1.5,
                    '&:hover': {
                      borderWidth: 1.5,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Cerrar
                </Button>
              <Button
                variant="contained"
                color="success"
                  size="small"
                disabled={applied.includes(project.id)}
                onClick={() => handleApply(project.id)}
                  sx={{ 
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    background: applied.includes(project.id) 
                      ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                      : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transition: 'all 0.2s'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                      boxShadow: 'none',
                      transform: 'none'
                    }
                  }}
                >
                  {applied.includes(project.id) ? 'Ya Postulado' : 'Postularme al Proyecto'}
              </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header mejorado con diseño más atractivo */}
      <Box sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Elementos decorativos de fondo */}
        <Box sx={{ 
          position: 'absolute', 
          top: -50, 
          right: -50, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.05)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 60, 
              height: 60,
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <SchoolIcon sx={{ fontSize: 30, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight={700} sx={{ 
                color: 'white', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 0.5
              }}>
                Proyectos Disponibles
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 400
              }}>
                Encuentra tu próxima oportunidad de aprendizaje
              </Typography>
            </Box>
          </Box>

          {/* Estadísticas rápidas */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Badge badgeContent={filteredProjects.length} color="error">
                  <WorkOutlineIcon sx={{ color: 'white', fontSize: 30 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {filteredProjects.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Proyectos Disponibles
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <TrendingUpIcon sx={{ color: 'white', fontSize: 30 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {studentApiLevel}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tu Nivel API
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <LightbulbIcon sx={{ color: 'white', fontSize: 30 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {applied.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Postulaciones Enviadas
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {/* Panel de filtros mejorado */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <FilterListIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Filtros de Búsqueda
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <TextField
              variant="outlined"
              placeholder="Buscar proyectos por título, empresa o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Área de Conocimiento</InputLabel>
              <Select
                value={area}
                onChange={e => setArea(e.target.value)}
                label="Área de Conocimiento"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas las áreas</MenuItem>
                {areas.map((a, index) => (
                  <MenuItem key={`area-${index}-${a}`} value={a}>{a}</MenuItem>
                ))}
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Modalidad de Trabajo</InputLabel>
              <Select
                value={modalidad}
                onChange={e => {
                  setModalidad(e.target.value);
                  setShowModalidadAlert(e.target.value !== '');
                }}
                label="Modalidad de Trabajo"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas las modalidades</MenuItem>
                {MODALIDADES.map((m, index) => (
                  <MenuItem key={`modalidad-${index}-${m}`} value={m}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getModalidadIcon(m)}
                      {m}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <ShowLatestFilter
              value={showLatest}
              onChange={setShowLatest}
              options={[50, 100, 200, 250, -1]}
              label="Mostrar"
            />
          </Grid>
        </Grid>

        {/* Alerta explicativa de modalidad */}
        {showModalidadAlert && modalidad && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${getModalidadColor(modalidad)}15 0%, ${getModalidadColor(modalidad)}25 100%)`,
              border: `1px solid ${getModalidadColor(modalidad)}30`
            }}
            icon={getModalidadIcon(modalidad)}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: getModalidadColor(modalidad), mb: 0.5 }}>
                Modalidad: {modalidad}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {getModalidadDescription(modalidad)}
              </Typography>
            </Box>
          </Alert>
        )}
      </Paper>

      {/* Contador de resultados mejorado */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        p: 2,
        bgcolor: 'rgba(25, 118, 210, 0.05)',
        borderRadius: 2,
        border: '1px solid rgba(25, 118, 210, 0.1)'
      }}>
        <StarIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600} color="primary.main">
          {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
        </Typography>
        {filteredProjects.length > 0 && (
          <Chip 
            label={`Nivel API requerido: ${Math.min(...filteredProjects.map(p => p.api_level || 1))} - ${Math.max(...filteredProjects.map(p => p.api_level || 1))}`}
            color="info"
            size="small"
            icon={<TrendingUpIcon />}
          />
        )}
      </Box>

            {/* Grid de proyectos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(320px, 1fr))' }, gap: 2 }}>
        {filteredProjects.map(project => {
          const canApply = canApplyToProject(project);
          const requiredApiLevel = project.api_level || 1;
          return (
            <Card key={project.id} sx={{
              borderRadius: 3,
               background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
               boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
               border: '1px solid rgba(255,255,255,0.8)',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               position: 'relative',
               overflow: 'hidden',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 height: '3px',
                 background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                 zIndex: 1
               },
               '&:hover': { 
                 transform: 'translateY(-4px)', 
                 boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                 borderColor: '#667eea'
               }
             }}>
               <CardContent sx={{ p: 2, pt: 3 }}>
                 {/* Header con título y estado */}
                 <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                   <Typography 
                     variant="h6" 
                     fontWeight={700} 
                     sx={{ 
                       color: '#1a237e',
                       fontSize: '1.1rem',
                       lineHeight: 1.2,
                       flex: 1,
                       mr: 1.5,
                       textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                     }}
                   >
                     {project.title}
                   </Typography>
                   <Chip 
                     label={translateProjectStatus(project.status)} 
                     color={project.status === 'Activo' ? 'success' : 'default'} 
                     size="small" 
                     sx={{ 
                       fontWeight: 600,
                       fontSize: '0.7rem',
                       height: 20,
                       '& .MuiChip-label': { px: 1 }
                     }} 
                   />
                </Box>

                 {/* Información de empresa y área */}
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 0.5,
                     p: 1,
                     borderRadius: 1.5,
                     bgcolor: 'rgba(76, 175, 80, 0.08)',
                     border: '1px solid rgba(76, 175, 80, 0.2)'
                   }}>
                     <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                     <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: '0.8rem' }}>
                    <b>Empresa:</b> {project.company_name}
                  </Typography>
                   </Box>
                   
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 0.5,
                     p: 1,
                     borderRadius: 1.5,
                     bgcolor: 'rgba(25, 118, 210, 0.08)',
                     border: '1px solid rgba(25, 118, 210, 0.2)'
                   }}>
                     <ScienceIcon sx={{ color: '#1565c0', fontSize: 16 }} />
                     <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0', fontSize: '0.8rem' }}>
                    <b>Área:</b> {project.area}
                  </Typography>
                </Box>
                 </Box>

                 {/* Descripción */}
                 <Box sx={{ 
                   mb: 1.5,
                   p: 1.5,
                   borderRadius: 1.5,
                   bgcolor: 'rgba(0,0,0,0.02)',
                   border: '1px solid rgba(0,0,0,0.05)'
                 }}>
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       color: '#374151',
                       lineHeight: 1.4,
                       fontStyle: 'italic',
                       fontSize: '0.8rem'
                     }}
                   >
                     {project.description.slice(0, 100)}...
                </Typography>
                 </Box>

                 {/* Chips de detalles rápidos */}
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                   <Chip 
                     label={`API ${project.api_level || 1}`} 
                     color={getApiLevelColor(project.api_level || 1)} 
                     size="small" 
                     icon={<TrendingUpIcon />} 
                     sx={{ 
                       fontWeight: 600,
                       fontSize: '0.65rem',
                       height: 20
                     }} 
                   />
                   {project.modality && (
                     <Chip 
                       label={translateModality(project.modality)} 
                       color="info" 
                       size="small" 
                       sx={{ 
                         fontWeight: 600,
                         fontSize: '0.65rem',
                         height: 20
                       }} 
                     />
                   )}
                   {project.hours_per_week && (
                     <Chip 
                       label={`${project.hours_per_week} hrs/sem`} 
                       color="default" 
                       size="small" 
                       icon={<AccessTimeIcon />}
                       sx={{ 
                         fontWeight: 600,
                         fontSize: '0.65rem',
                         height: 20
                       }} 
                     />
                   )}
                 </Box>

                 {/* Botones de acción */}
                 <Box sx={{ display: 'flex', gap: 1 }}>
                   <Button 
                     size="small" 
                     variant="outlined" 
                     color="primary" 
                     onClick={() => handleOpenDetail(project)} 
                     sx={{ 
                       fontWeight: 600,
                       borderRadius: 1.5,
                       px: 1.5,
                       py: 0.5,
                       borderWidth: 1.5,
                       fontSize: '0.75rem',
                       '&:hover': {
                         borderWidth: 1.5,
                         transform: 'translateY(-1px)',
                         boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                       }
                     }}
                   >
                    Ver Detalles
                  </Button>
                  {!applied.includes(project.id) && (
                     <Button 
                       size="small" 
                       variant="contained" 
                       color="success" 
                       onClick={() => handleApply(project.id)} 
                       sx={{ 
                         fontWeight: 600,
                         borderRadius: 1.5,
                         px: 1.5,
                         py: 0.5,
                         fontSize: '0.75rem',
                         background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                         boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)',
                           transform: 'translateY(-1px)',
                           boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                         }
                       }}
                     >
                      Postularme
                    </Button>
                  )}
                  {applied.includes(project.id) && (
                     <Button 
                       size="small" 
                       variant="contained" 
                       color="inherit" 
                       disabled 
                       sx={{ 
                         fontWeight: 600,
                         borderRadius: 1.5,
                         px: 1.5,
                         py: 0.5,
                         fontSize: '0.75rem',
                         background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                         color: 'white'
                       }}
                     >
                      Postulado
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {filteredProjects.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron proyectos que coincidan con los filtros aplicados.
        </Alert>
      )}

      {selectedProject && renderProjectDetail(selectedProject)}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 

function getTrlDescriptionOnly(trlLevel: number) {
  const descriptions = [
    'El proyecto está en fase de idea inicial. Aún no hay desarrollo previo y se está definiendo qué se quiere lograr.',
    'El proyecto tiene una definición clara de lo que se quiere lograr y se conocen los antecedentes del problema a resolver.',
    'Se han realizado pruebas iniciales y validaciones de concepto. Algunas partes del proyecto ya han sido evaluadas por separado.',
    'Existe un prototipo básico que ha sido probado en condiciones controladas y simples.',
    'Existe un prototipo que ha sido probado en condiciones similares a las reales donde funcionará.',
    'El prototipo ha sido probado en un entorno real mediante un piloto o prueba inicial.',
    'El proyecto ha sido probado en condiciones reales durante un tiempo prolongado, demostrando su funcionamiento.',
    'El proyecto está validado tanto técnicamente como comercialmente, listo para su implementación.',
    'El proyecto está completamente desarrollado y disponible para ser utilizado por la sociedad.'
  ];
  return descriptions[trlLevel - 1] || '';
}

function translateProjectStatus(status: string) {
  switch (status.toLowerCase()) {
    case 'published': return 'Publicado';
    case 'pending': return 'Pendiente';
    case 'reviewing': return 'En Revisión';
    case 'accepted': return 'Aceptado';
    case 'rejected': return 'Rechazado';
    case 'completed': return 'Completado';
    case 'activo': return 'Activo';
    default: return status;
  }
}