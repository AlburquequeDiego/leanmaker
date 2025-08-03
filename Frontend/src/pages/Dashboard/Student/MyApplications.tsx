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
  return {
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
    modality: backendData.modality,
    
    required_hours: backendData.required_hours,
    hours_per_week: backendData.hours_per_week,
    max_students: backendData.max_students,
    current_students: backendData.current_students,
    trl_level: backendData.trl_level,
    api_level: backendData.api_level,
    area: backendData.area || '', // <-- Agregado
  };
};

// Componente principal de aplicaciones
export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [historyLimit, setHistoryLimit] = useState(15); // Por defecto 15

  useEffect(() => {
    async function fetchApplications() {
      try {
        // Obtener aplicaciones específicas del estudiante
        const data = await apiService.get('/api/applications/my_applications/');
        console.log('Applications data received:', data);
        
        // El backend devuelve {results: Array, total: number}
        const applicationsArray = data.results || data;
        
        if (Array.isArray(applicationsArray)) {
                  // Adaptar cada aplicación al formato del frontend
        const adaptedApplications = applicationsArray.map(app => adaptApplicationData(app));
        setApplications(adaptedApplications);
        setFilteredApplications(adaptedApplications);
        } else {
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

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
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
                      onClick={() => handleViewDetails(application)}
                      title="Ver detalles"
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

      {/* Dialog para detalles mejorado */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
          }
        }}
      >
        {selectedApplication && (
          <>
            {/* Header con gradiente */}
            <Box sx={{ 
              p: 3, 
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
                  {selectedApplication.projectTitle}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                    <BusinessIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" fontWeight={600}>{selectedApplication.company}</Typography>
                  </Box>
                  {selectedApplication.area && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                      <AssignmentIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" fontWeight={600}>{selectedApplication.area}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" fontWeight={600}>{getStatusText(selectedApplication.status)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Contenido principal */}
            <Box sx={{ 
              p: 3, 
              bgcolor: '#fafafa',
              maxHeight: 'calc(90vh - 140px)',
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
              <Grid container spacing={3}>
                {/* Columna principal */}
                <Grid item xs={12} lg={8}>
                  {/* Descripción */}
                  <Paper sx={{ 
                    p: 2.5, 
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
                        <AssignmentIcon sx={{ fontSize: 20 }} />
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
                      {selectedApplication.description || 'Sin descripción'}
                    </Typography>
                  </Paper>

                  {/* Objetivos */}
                  {selectedApplication.objetivo && (
                    <Paper sx={{ 
                      p: 2.5, 
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
                          <TrendingUpIcon sx={{ fontSize: 20 }} />
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
                        {selectedApplication.objetivo}
                      </Typography>
                    </Paper>
                  )}

                  {/* Requisitos */}
                  {selectedApplication.requiredSkills && selectedApplication.requiredSkills.length > 0 && (
                    <Paper sx={{ 
                      p: 2.5, 
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
                          <ScheduleIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} color="warning.main">
                          Requisitos del Proyecto
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedApplication.requiredSkills.map((skill) => (
                          <Chip 
                            key={skill} 
                            label={skill} 
                            size="small" 
                            sx={{ 
                              fontWeight: 600,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                            }} 
                          />
                        ))}
                      </Box>
                </Paper>
                  )}

                  {/* Detalles del proyecto */}
                  <Paper sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f3f4f6 0%, #ffffff 100%)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="text.primary" sx={{ mb: 1.5 }}>
                      Detalles del Proyecto
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedApplication.api_level && (
                        <Chip 
                          label={`API ${selectedApplication.api_level}`} 
                          color="success" 
                          size="small" 
                          icon={<TrendingUpIcon />} 
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                          }} 
                        />
                      )}
                      {selectedApplication.modality && (
                        <Chip 
                          label={selectedApplication.modality} 
                          color="info" 
                          size="small" 
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                          }} 
                        />
                      )}
                      {selectedApplication.hours_per_week && (
                        <Chip 
                          label={`${selectedApplication.hours_per_week} hrs/sem`} 
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
                      {selectedApplication.max_students && (
                        <Chip 
                          label={`Máx. ${selectedApplication.max_students} estudiantes`} 
                          color="success" 
                          size="small" 
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'translateY(-1px)', transition: 'transform 0.2s' }
                          }} 
                        />
                      )}
                    </Box>
                  </Paper>

                  {/* Nivel TRL */}
                  {selectedApplication.trl_level && (
                    <Paper sx={{ 
                      p: 2.5, 
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
                          <TrendingUpIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                            Estado del Proyecto
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                            {getTrlDescriptionOnly(Number(selectedApplication.trl_level))}
                          </Typography>
                        </Box>
                    </Box>
                  </Paper>
                )}
              </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: 'fit-content',
                    position: 'sticky',
                    top: 20
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary.main" sx={{ mb: 2 }}>
                      Información de la Aplicación
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Fecha de Aplicación
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
                        {selectedApplication.appliedDate ? new Date(selectedApplication.appliedDate).toLocaleString('es-ES') : '-'}
                      </Typography>
                    </Box>

                  {selectedApplication.responseDate && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <CheckCircleIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Fecha de Respuesta
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
                          {new Date(selectedApplication.responseDate).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <CheckCircleIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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
                        {getStatusText(selectedApplication.status)}
                      </Typography>
                    </Box>

                    {selectedApplication.notes && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                          Notas Adicionales
                        </Typography>
                        <Alert severity="info" sx={{ 
                          '& .MuiAlert-message': { 
                            fontSize: '0.875rem',
                            lineHeight: 1.4
                          }
                        }}>
                          {selectedApplication.notes}
                    </Alert>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
                      <Button 
                        onClick={() => setDialogOpen(false)} 
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{ 
                          py: 1,
                          fontWeight: 600,
                          borderRadius: 1.5,
                          background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                          boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                            transition: 'all 0.2s'
                          }
                        }}
                      >
                        Cerrar
                      </Button>
                    </Box>
                </Paper>
              </Grid>
            </Grid>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
};

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

export default MyApplications; 