import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  Alert,
  TextField,
  MenuItem,
  Autocomplete,
  Grid,
  Tabs,
  Tab,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import ProjectDetailsModal from '../../../components/common/ProjectDetailsModal';
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterListIcon,
  School as SchoolIcon,
  WorkOutline as WorkOutlineIcon,
  Star as StarIcon,
  Lightbulb as LightbulbIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { MODALIDADES } from '../../../modalidades';
import { useTheme } from '../../../contexts/ThemeContext';

interface Application {
  id: string;
  projectTitle: string;
  company: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'completed';
  appliedDate: string;
  responseDate?: string;
  requiredSkills: string[];
  projectDuration: string;
  location: string;
  description: string;
  compatibility: number;
  notes?: string;
  modality?: string;
  
  required_hours?: string;
  hours_per_week?: string;
  max_students?: string;
  current_students?: string;
  trl_level?: string;
  api_level?: string;
  area?: string;
  objetivo?: string;
  project_id?: string;
}

interface FilterOptions {
  busqueda?: string;
  area?: string;
  modalidad?: string;
  ubicacion?: string;
  nivel?: string;
  duracion?: string;
  tecnologias?: string[];
  estado?: string;
}

// Opciones de filtros
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
const modalidades = MODALIDADES;
const ubicaciones = ['Santiago', 'Bogotá', 'CDMX', 'Buenos Aires'];
const niveles = ['Básico', 'Intermedio', 'Avanzado'];
const duraciones = ['1 mes', '3 meses', '6 meses', '12 meses'];
const tecnologias = ['React', 'Node.js', 'Python', 'Java', 'Figma'];

// Componente de filtros
interface FiltrosProyectosDisponiblesProps {
  onFilter?: (filters: FilterOptions) => void;
}

const FiltrosProyectosDisponibles: React.FC<FiltrosProyectosDisponiblesProps> = ({ onFilter }) => {
  const { themeMode } = useTheme();
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');

  const handleFiltrar = () => {
    onFilter?.({ busqueda, area, estado });
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setArea('');
    setEstado('');
    onFilter?.({});
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        label="Buscar aplicaciones"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
            </InputAdornment>
          ),
        }}
        sx={{ 
          minWidth: 300,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            '&:hover fieldset': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            },
            '& fieldset': {
              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
            },
          },
          '& .MuiInputLabel-root': {
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
          },
          '& .MuiInputBase-input': {
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          }
        }}
      />
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>Área</InputLabel>
        <Select
          value={area}
          label="Área"
          onChange={e => setArea(e.target.value)}
          sx={{ 
            borderRadius: 2,
            bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            },
            '& .MuiSvgIcon-root': {
              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
            },
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>Estado</InputLabel>
        <Select
          value={estado}
          label="Estado"
          onChange={e => setEstado(e.target.value)}
          sx={{ 
            borderRadius: 2,
            bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            },
            '& .MuiSvgIcon-root': {
              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
            },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pending">Pendiente</MenuItem>
          <MenuItem value="accepted">Aceptada</MenuItem>
          <MenuItem value="rejected">Rechazada</MenuItem>
        </Select>
      </FormControl>

      <Button 
        variant="outlined"
        onClick={handleFiltrar}
        sx={{ 
          borderRadius: 2,
          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
          '&:hover': {
            borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.04)',
          }
        }}
      >
        Filtrar
      </Button>
      {(busqueda || area || estado) && (
        <Button 
          variant="outlined"
          onClick={handleLimpiar}
          sx={{ 
            borderRadius: 2,
            borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&:hover': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
              bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Limpiar
        </Button>
      )}
    </Box>
  );
};

// Función para adaptar los datos del backend al formato del frontend
const adaptApplicationData = (backendData: any): Application => {
  console.log('🔍 [Frontend] Adaptando datos del backend:', backendData);
  
  const adapted = {
    id: backendData.id || 'sin-id',
    projectTitle: backendData.project_title || 'Sin título',
    company: backendData.company || 'Sin empresa',
    status: backendData.status || 'pending',
    appliedDate: backendData.applied_at || backendData.created_at || new Date().toISOString(),
    responseDate: backendData.responded_at || undefined,
    requiredSkills: Array.isArray(backendData.requiredSkills) ? backendData.requiredSkills : [],
    projectDuration: backendData.projectDuration || 'No especificado',
    location: backendData.location || 'No especificada',
    description: backendData.project_description || 'Sin descripción',
    compatibility: backendData.compatibility || 0,
    notes: backendData.student_notes || backendData.cover_letter || undefined,
    modality: backendData.modality || '',
    required_hours: backendData.required_hours || '',
    hours_per_week: backendData.hours_per_week || '',
    max_students: backendData.max_students || '',
    current_students: backendData.current_students || '',
    trl_level: backendData.trl_level || '',
    api_level: backendData.api_level || '',
    area: backendData.area || '',
    objetivo: backendData.objetivo || '',
    project_id: backendData.project || undefined,
  };
  
  console.log('🔍 [Frontend] Datos adaptados:', adapted);
  return adapted;
};

// Componente principal de aplicaciones
export const MyApplications: React.FC = () => {
  const { themeMode } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [historyLimit, setHistoryLimit] = useState(15);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de detalles del proyecto
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<any>(null);
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      try {
        console.log('🔍 [Frontend] Iniciando fetch de aplicaciones...');
        const timestamp = Date.now();
        const data = await apiService.get(`/api/applications/my_applications/?t=${timestamp}&nocache=true`);
        console.log('🔍 [Frontend] Datos recibidos del backend:', data);
        
        // Obtener el array de aplicaciones
        const applicationsArray = data.results || data || [];
        console.log('🔍 [Frontend] Aplicaciones encontradas:', applicationsArray.length);
        
        if (applicationsArray.length > 0) {
          const adaptedApplications = applicationsArray.map(app => adaptApplicationData(app));
          console.log('🔍 [Frontend] Aplicaciones adaptadas:', adaptedApplications.length);
          
          setApplications(adaptedApplications);
          setFilteredApplications(adaptedApplications);
        } else {
          setApplications([]);
          setFilteredApplications([]);
        }
      } catch (error) {
        console.error('❌ [Frontend] Error fetching applications:', error);
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchApplications();
  }, []);

  // Función para manejar la visualización de detalles del proyecto
  const handleViewProjectDetails = async (application: Application) => {
    if (!application.project_id) {
      console.error('No se encontró el ID del proyecto');
      return;
    }
    
    setLoadingProjectDetail(true);
    try {
      const projectData = await apiService.get(`/api/projects/${application.project_id}/`);
      setSelectedProjectDetail(projectData);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoadingProjectDetail(false);
    }
  };

  // Función para cerrar el modal de detalles del proyecto
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProjectDetail(null);
  };

  // Actualizar handleFilter para soportar solo los filtros esenciales
  const handleFilter = (filters: FilterOptions) => {
    let filtered = [...applications];
    
    if (filters.busqueda) {
      filtered = filtered.filter(app =>
        app.projectTitle.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        app.company.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        app.description.toLowerCase().includes(filters.busqueda!.toLowerCase())
      );
    }
    if (filters.area) {
      filtered = filtered.filter(app =>
        app.area?.toLowerCase().includes(filters.area!.toLowerCase())
      );
    }
    if (filters.estado) {
      filtered = filtered.filter(app => app.status === filters.estado);
    }
    
    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary';
      case 'pending':
      case 'reviewing':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activado';
      case 'pending':
        return 'Pendiente';
      case 'reviewing':
        return 'En revisión';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'reviewing':
        return <TrendingUpIcon />;
      case 'accepted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'completed':
        return <TrendingUpIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'success';
    if (compatibility >= 80) return 'warning';
    return 'error';
  };

  // Cambiar la lógica de tabs y agrupación:
  const pendingApplications = filteredApplications.filter(app => app.status === 'pending');
  const reviewingApplications = filteredApplications.filter(app => app.status === 'reviewing');
  const acceptedApplications = filteredApplications.filter(app => app.status === 'accepted');
  const completedApplications = filteredApplications.filter(app => app.status === 'completed');
  const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected');

  // Debug: Log de contadores para verificar que funcionen correctamente
  console.log('🔍 [MyApplications] Contadores calculados:', {
    total: filteredApplications.length,
    pending: pendingApplications.length,
    reviewing: reviewingApplications.length,
    accepted: acceptedApplications.length,
    completed: completedApplications.length,
    rejected: rejectedApplications.length
  });

  // Agregar tabs visuales:
  const [selectedTab, setSelectedTab] = useState(0);
  const [showLatest, setShowLatest] = useState(10);

  const tabContents = [
    { 
      label: `Todas (${filteredApplications.length})`, 
      data: filteredApplications,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <AssignmentIcon />
    },
    { 
      label: `Pendientes (${pendingApplications.length})`, 
      data: pendingApplications,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: <ScheduleIcon />
    },
    { 
      label: `En Revisión (${reviewingApplications.length})`, 
      data: reviewingApplications,
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      icon: <TrendingUpIcon />
    },
    { 
      label: `Aceptadas (${acceptedApplications.length})`, 
      data: acceptedApplications,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: <CheckCircleIcon />
    },
    { 
      label: `Rechazadas (${rejectedApplications.length})`, 
      data: rejectedApplications,
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: <CancelIcon />
    },
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      minHeight: '100vh'
    }}>
      {/* Header mejorado */}
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
              <AssignmentIcon sx={{ fontSize: 30, color: 'white' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" fontWeight={700} sx={{ 
                color: 'white', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 0.5
              }}>
                Mis Aplicaciones
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 400
              }}>
                Gestiona y revisa el estado de tus postulaciones
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Recargar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas separadas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)',
            }
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Badge badgeContent={pendingApplications.length} color="warning">
                <ScheduleIcon sx={{ color: 'white', fontSize: 40, mb: 2 }} />
              </Badge>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                {pendingApplications.length}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
            }
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Badge badgeContent={reviewingApplications.length} color="info">
                <TrendingUpIcon sx={{ color: 'white', fontSize: 40, mb: 2 }} />
              </Badge>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                {reviewingApplications.length}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                En Revisión
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
            }
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Badge badgeContent={acceptedApplications.length} color="success">
                <CheckCircleIcon sx={{ color: 'white', fontSize: 40, mb: 2 }} />
              </Badge>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                {acceptedApplications.length}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Aceptadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(239, 68, 68, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 16px 48px rgba(239, 68, 68, 0.4)',
            }
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Badge badgeContent={rejectedApplications.length} color="error">
                <CancelIcon sx={{ color: 'white', fontSize: 40, mb: 2 }} />
              </Badge>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                {rejectedApplications.length}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Rechazadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros mejorados */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 4, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
            }}>
              Filtros de Búsqueda
            </Typography>
          </Box>
          <FiltrosProyectosDisponibles 
            onFilter={handleFilter} 
          />
        </CardContent>
      </Card>

      {/* Tabs mejorados */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'divider', 
        mb: 3,
        background: themeMode === 'dark' 
          ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: 2,
        p: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(_, v) => setSelectedTab(v)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                borderRadius: 2,
                mx: 0.5,
                minHeight: 56,
                textTransform: 'none',
                fontSize: '0.95rem',
                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(102, 126, 234, 0.05)',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#667eea',
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                boxShadow: '0 2px 8px rgba(96, 165, 250, 0.4)'
              }
            }}
          >
            {tabContents.map((tab, idx) => (
              <Tab 
                key={tab.label} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {tab.label}
                    </Typography>
                  </Box>
                } 
                sx={{
                  '&.Mui-selected': {
                    background: tab.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  }
                }}
              />
            ))}
          </Tabs>
          
          {/* Selector de cantidad */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="cantidad-label" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
              Mostrar
            </InputLabel>
            <Select
              labelId="cantidad-label"
              value={showLatest}
              label="Mostrar"
              onChange={(e) => setShowLatest(Number(e.target.value))}
              sx={{ 
                borderRadius: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                }
              }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={25}>Últimos 25</MenuItem>
              <MenuItem value={50}>Últimos 50</MenuItem>
              <MenuItem value={100}>Últimos 100</MenuItem>
              <MenuItem value={-1}>Todas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>



      {/* Tabla mejorada */}
      {loading ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          background: themeMode === 'dark' 
            ? 'linear-gradient(145deg, #334155 0%, #475569 100%)' 
            : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: 3,
          border: themeMode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6" color={themeMode === 'dark' ? '#f1f5f9' : 'text.secondary'} sx={{ mb: 2 }}>
            Cargando aplicaciones...
          </Typography>
          <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'}>
            Por favor espera mientras se cargan tus postulaciones
          </Typography>
        </Box>
      ) : tabContents[selectedTab].data.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          background: themeMode === 'dark' 
            ? 'linear-gradient(145deg, #334155 0%, #475569 100%)' 
            : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: 3,
          border: themeMode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.05)'
        }}>
          <WorkOutlineIcon sx={{ fontSize: 60, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color={themeMode === 'dark' ? '#f1f5f9' : 'text.secondary'}>
            No se encontraron aplicaciones en esta categoría
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '& .MuiTableCell-head': {
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }
              }}>
                <TableCell>Proyecto</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Aplicación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(showLatest === -1 ? tabContents[selectedTab].data : tabContents[selectedTab].data.slice(0, showLatest)).map((application) => (
                <TableRow 
                  key={application.id} 
                  hover
                  sx={{ 
                    bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    '&:hover': {
                      background: themeMode === 'dark' 
                        ? 'linear-gradient(145deg, #475569 0%, #64748b 100%)' 
                        : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1a237e' 
                      }}>
                        {application.projectTitle}
                      </Typography>
                      <Typography variant="body2" color={themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'}>
                        {application.description.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        mr: 1, 
                        bgcolor: 'primary.main', 
                        width: 28, 
                        height: 28,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <BusinessIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500} sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' 
                      }}>
                        {application.company}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={getStatusText(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        '&:hover': { 
                          transform: 'translateY(-1px)', 
                          transition: 'transform 0.2s' 
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
                    }}>
                      {new Date(application.appliedDate).toLocaleDateString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewProjectDetails(application)}
                      title="Ver detalles del proyecto"
                      disabled={loadingProjectDetail}
                      sx={{ 
                        bgcolor: themeMode === 'dark' 
                          ? 'rgba(102, 126, 234, 0.2)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                        '&:hover': {
                          bgcolor: themeMode === 'dark' 
                            ? 'rgba(102, 126, 234, 0.3)' 
                            : 'rgba(102, 126, 234, 0.2)',
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s'
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de detalles del proyecto */}
      <ProjectDetailsModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        project={selectedProjectDetail}
        userRole="student"
        applicationData={applications.find(app => app.project_id === selectedProjectDetail?.id) || null}
      />
    </Box>
  );
};

export default MyApplications; 