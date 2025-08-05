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
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { adaptApplication } from '../../../utils/adapters';
import { MODALIDADES } from '../../../modalidades';

interface Application {
  id: string;
  projectTitle: string;
  company: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
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
  area?: string; // <-- Agregado
  objetivo?: string;
  project_id?: string; // ID del proyecto
}

interface FilterOptions {
  busqueda?: string;
  area?: string;
  modalidad?: string;
  ubicacion?: string;
  nivel?: string;
  duracion?: string;
  tecnologias?: string[];
  estado?: string; // <-- Agregado
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

// Componente de filtros (ahora separado y tipado)
interface FiltrosProyectosDisponiblesProps {
  onFilter?: (filters: FilterOptions) => void;
  historyLimit: number;
  setHistoryLimit: (limit: number) => void;
}

// Componente de filtros mejorado
const FiltrosProyectosDisponibles: React.FC<FiltrosProyectosDisponiblesProps> = ({ onFilter, historyLimit, setHistoryLimit }) => {
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
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          label="Buscar aplicaciones"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          fullWidth
          size="small"
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
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          select
          label="Área"
          value={area}
          onChange={e => setArea(e.target.value)}
          fullWidth
          size="small"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          select
          label="Estado"
          value={estado}
          onChange={e => setEstado(e.target.value)}
          fullWidth
          size="small"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pending">Pendiente</MenuItem>
          <MenuItem value="accepted">Aceptada</MenuItem>
          <MenuItem value="rejected">Rechazada</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          select
          label="Mostrar últimas"
          value={historyLimit}
          onChange={(e) => setHistoryLimit(Number(e.target.value))}
          fullWidth
          size="small"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value={15}>15 últimas</MenuItem>
          <MenuItem value={50}>50 últimas</MenuItem>
          <MenuItem value={100}>100 últimas</MenuItem>
          <MenuItem value={-1}>Todas</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={1}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleFiltrar}
          fullWidth
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Filtrar
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={1}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleLimpiar}
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          Limpiar
        </Button>
      </Grid>
    </Grid>
  );
};

// Función para adaptar los datos del backend al formato del frontend
const adaptApplicationData = (backendData: any): Application => {
  console.log('🔍 [Frontend] Adaptando datos:', backendData);
  
  const adapted = {
    id: backendData.id,
    projectTitle: backendData.project_title || 'Sin título',
    company: backendData.company || 'Sin empresa',
    status: backendData.status as any,
    appliedDate: backendData.applied_at || backendData.created_at,
    responseDate: backendData.responded_at || undefined,
    requiredSkills: backendData.requiredSkills || [],
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
    project_id: backendData.project || undefined, // El campo project ahora es directamente el ID
  };
  
  console.log('🔍 [Frontend] Datos adaptados:', adapted);
  return adapted;
};

// Componente principal de aplicaciones
export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [historyLimit, setHistoryLimit] = useState(15); // Por defecto 15
  
  // Estados para el modal de detalles del proyecto
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<any>(null);
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  useEffect(() => {
    async function fetchApplications() {
      try {
        console.log('🔍 [Frontend] Iniciando fetch de aplicaciones...');
        // Forzar recarga sin caché
        const timestamp = Date.now();
        const data = await apiService.get(`/api/applications/my_applications/?t=${timestamp}&nocache=true`);
        console.log('🔍 [Frontend] Datos recibidos del backend:', data);
        
        const applicationsArray = data.results || data;
        console.log('🔍 [Frontend] applicationsArray:', applicationsArray);
        
        if (Array.isArray(applicationsArray) && applicationsArray.length > 0) {
          console.log('🔍 [Frontend] Primera aplicación del backend:', applicationsArray[0]);
          console.log('🔍 [Frontend] Campos disponibles en la primera aplicación:');
          console.log('   - project_title:', applicationsArray[0].project_title);
          console.log('   - company:', applicationsArray[0].company);
          console.log('   - project_description:', applicationsArray[0].project_description);
          console.log('   - project:', applicationsArray[0].project);
          console.log('   - student:', applicationsArray[0].student);
          
          const adaptedApplications = applicationsArray.map(app => adaptApplicationData(app));
          console.log('🔍 [Frontend] Primera aplicación adaptada:', adaptedApplications[0]);
          console.log('🔍 [Frontend] Total de aplicaciones adaptadas:', adaptedApplications.length);
          
          setApplications(adaptedApplications);
          setFilteredApplications(adaptedApplications);
        } else {
          console.log('🔍 [Frontend] No hay aplicaciones o no es un array válido');
          setApplications([]);
          setFilteredApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
        setFilteredApplications([]);
      }
    }
    fetchApplications();
  }, []);

  // Función para manejar la visualización de detalles del proyecto
  const handleViewProjectDetails = async (application: Application) => {
    console.log('🔍 [MyApplications] Iniciando handleViewProjectDetails');
    console.log('🔍 [MyApplications] Application:', application);
    
    if (!application.project_id) {
      console.error('No se encontró el ID del proyecto');
      return;
    }
    
    console.log('🔍 [MyApplications] Project ID:', application.project_id);
    
    setLoadingProjectDetail(true);
    try {
      // Obtener los detalles completos del proyecto desde la API
      console.log('🔍 [MyApplications] Haciendo llamada a API para obtener detalles del proyecto');
      const projectData = await apiService.get(`/api/projects/${application.project_id}/`);
      console.log('🔍 [MyApplications] Datos del proyecto recibidos:', projectData);
      
      setSelectedProjectDetail(projectData);
      setDetailModalOpen(true);
      console.log('🔍 [MyApplications] Modal abierto correctamente');
    } catch (error) {
      console.error('Error fetching project details:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
      if (filters.estado === 'pending') {
        filtered = filtered.filter(app => app.status === 'pending' || app.status === 'reviewing');
      } else {
        filtered = filtered.filter(app => app.status === filters.estado);
      }
    }
    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary'; // Morado
      case 'pending':
      case 'reviewing':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'primary'; // Azul
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

  // Agregar tabs visuales:
  const [selectedTab, setSelectedTab] = useState(0);

  const tabContents = [
    { label: `Todas (${filteredApplications.length})`, data: filteredApplications },
    { label: `Pendientes (${pendingApplications.length})`, data: pendingApplications },
    { label: `En Revisión (${reviewingApplications.length})`, data: reviewingApplications },
    { label: `Aceptadas (${acceptedApplications.length})`, data: acceptedApplications },
    { label: `Rechazadas (${rejectedApplications.length})`, data: rejectedApplications },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
            <Box>
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
                <Badge badgeContent={pendingApplications.length} color="warning">
                  <ScheduleIcon sx={{ color: 'white', fontSize: 30 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {pendingApplications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pendientes
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
                <Badge badgeContent={acceptedApplications.length} color="success">
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 30 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {acceptedApplications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Aceptadas
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
                <Badge badgeContent={rejectedApplications.length} color="error">
                  <CancelIcon sx={{ color: 'white', fontSize: 30 }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                    {rejectedApplications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Rechazadas
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Filtros mejorados */}
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
        <FiltrosProyectosDisponibles 
          onFilter={handleFilter} 
          historyLimit={historyLimit}
          setHistoryLimit={setHistoryLimit}
        />
      </Paper>

      {/* Tabs mejorados */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: 2,
        p: 1
      }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, v) => setSelectedTab(v)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              borderRadius: 1.5,
              mx: 0.5,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              }
            }
          }}
        >
          {tabContents.map((tab, idx) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tabla mejorada */}
      {tabContents[selectedTab].data.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <WorkOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron aplicaciones en esta categoría
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
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
              {(historyLimit === -1 ? tabContents[selectedTab].data : tabContents[selectedTab].data.slice(0, historyLimit)).map((application) => (
                <TableRow 
                  key={application.id} 
                  hover
                  sx={{ 
                    '&:hover': {
                      background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#1a237e' }}>
                        {application.projectTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                      <Typography variant="body2" fontWeight={500}>
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.2)',
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
      />
    </Box>
  );
};



export default MyApplications; 