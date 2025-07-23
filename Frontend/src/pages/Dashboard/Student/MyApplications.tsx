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
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { adaptApplication } from '../../../utils/adapters';

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
  difficulty?: string;
  required_hours?: string;
  hours_per_week?: string;
  max_students?: string;
  current_students?: string;
  trl_level?: string;
  api_level?: string;
  area?: string; // <-- Agregado
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
const modalidades = ['Remoto', 'Presencial', 'Híbrido'];
const ubicaciones = ['Santiago', 'Bogotá', 'CDMX', 'Buenos Aires'];
const niveles = ['Básico', 'Intermedio', 'Avanzado'];
const duraciones = ['1 mes', '3 meses', '6 meses', '12 meses'];
const tecnologias = ['React', 'Node.js', 'Python', 'Java', 'Figma'];

// Componente de filtros (ahora separado y tipado)
interface FiltrosProyectosDisponiblesProps {
  onFilter?: (filters: FilterOptions) => void;
}

const FiltrosProyectosDisponibles: React.FC<FiltrosProyectosDisponiblesProps> = ({ onFilter }) => {
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
      {/* Búsqueda por texto */}
      <TextField
        label="Buscar"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        sx={{ minWidth: 220, flex: 1 }}
        size="small"
      />
      {/* Área */}
      <TextField
        select
        label="Área"
        value={area}
        onChange={e => setArea(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Todas</MenuItem>
        {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
      </TextField>
      {/* Estado */}
      <TextField
        select
        label="Estado"
        value={estado}
        onChange={e => setEstado(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="pending">Pendiente</MenuItem>
        <MenuItem value="accepted">Aceptada</MenuItem>
        <MenuItem value="rejected">Rechazada</MenuItem>
      </TextField>
      {/* Botones */}
      <Button variant="contained" color="primary" onClick={handleFiltrar}>
        Filtrar
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleLimpiar}>
        Limpiar
      </Button>
    </Box>
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
    difficulty: backendData.difficulty,
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
  const [historyLimit, setHistoryLimit] = useState(25); // Por defecto 25

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
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Mis Aplicaciones
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtrar Aplicaciones
        </Typography>
        <FiltrosProyectosDisponibles onFilter={handleFilter} />
      </Paper>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#FFE082' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#FF6F00' }}>
              {pendingApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#B9F6CA' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#00C853' }}>
              {acceptedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aceptadas
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#FF8A80' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#D50000' }}>
              {rejectedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rechazadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabla de aplicaciones */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          {tabContents.map((tab, idx) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Renderizar la lista correspondiente a la pestaña seleccionada */}
      {tabContents[selectedTab].data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron aplicaciones en esta categoría
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proyecto</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Aplicación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabContents[selectedTab].data.slice(0, historyLimit).map((application) => (
                <TableRow key={application.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {application.projectTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.description.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                        <BusinessIcon fontSize="small" />
                      </Avatar>
                      {application.company}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={getStatusText(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(application.appliedDate).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(application)}
                      title="Ver detalles"
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

      {/* Dialog para detalles */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedApplication && (
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">{selectedApplication.projectTitle}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              <b>Empresa:</b> {selectedApplication.company} &nbsp;|&nbsp; <b>Área:</b> {selectedApplication.area || 'Sin área'} &nbsp;|&nbsp; <b>Estado:</b> {getStatusText(selectedApplication.status)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedApplication.difficulty && <Chip label={`Dificultad: ${selectedApplication.difficulty}`} color="secondary" />}
              {selectedApplication.api_level && <Chip label={`API ${selectedApplication.api_level}`} color="success" />}
              {selectedApplication.modality && <Chip label={selectedApplication.modality} color="info" />}
              {selectedApplication.required_hours && <Chip label={`Horas/sem: ${selectedApplication.hours_per_week}`} color="default" />}
              {selectedApplication.max_students && <Chip label={`Máx. estudiantes: ${selectedApplication.max_students}`} color="success" />}
            </Box>
            {/* Descripción TRL en azul */}
            {selectedApplication.trl_level && (
              <Box sx={{ bgcolor: '#e3f2fd', borderRadius: 2, p: 1.2, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  {getTrlDescriptionOnly(Number(selectedApplication.trl_level))}
                </Typography>
              </Box>
            )}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, bgcolor: '#fff', mb: 2 }} elevation={2}>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="primary">Descripción</Typography>
                  <Typography variant="body1">{selectedApplication.description || 'Sin descripción'}</Typography>
                </Paper>
                {selectedApplication.requiredSkills && selectedApplication.requiredSkills.length > 0 && (
                  <Paper sx={{ p: 2, bgcolor: '#fff', mb: 2 }} elevation={2}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary">Requisitos</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedApplication.requiredSkills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: '#f1f8e9' }} elevation={1}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Aplicación:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{selectedApplication.appliedDate ? new Date(selectedApplication.appliedDate).toLocaleString('es-ES') : '-'}</Typography>
                  {selectedApplication.responseDate && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Fecha de Respuesta:</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{new Date(selectedApplication.responseDate).toLocaleString('es-ES')}</Typography>
                    </>
                  )}
                  <Typography variant="subtitle2" color="text.secondary">Estado actual:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{getStatusText(selectedApplication.status)}</Typography>
                  {selectedApplication.notes && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Notas:</strong> {selectedApplication.notes}
                      </Typography>
                    </Alert>
                  )}
                  <Button onClick={() => setDialogOpen(false)} color="secondary" variant="outlined" sx={{ mt: 2, mr: 1 }}>Cerrar</Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Dialog>
    </Box>
  );
};

export default MyApplications; 