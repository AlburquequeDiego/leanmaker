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
}

interface FilterOptions {
  busqueda?: string;
  area?: string;
  modalidad?: string;
  ubicacion?: string;
  nivel?: string;
  duracion?: string;
  tecnologias?: string[];
}

// Opciones de filtros
const areas = ['Tecnología', 'Marketing', 'Diseño', 'Administración'];
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
  const [modalidad, setModalidad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [nivel, setNivel] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tecs, setTecs] = useState<string[]>([]);

  const handleFiltrar = () => {
    onFilter?.({ busqueda, area, modalidad, ubicacion, nivel, duracion, tecnologias: tecs });
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setArea('');
    setModalidad('');
    setUbicacion('');
    setNivel('');
    setDuracion('');
    setTecs([]);
    onFilter?.({});
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
      {/* Bloque 1: Búsqueda */}
      <TextField
        label="¿Qué estás buscando hoy?"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        sx={{ minWidth: 220, flex: 1 }}
        size="small"
      />

      {/* Bloque 2: Área */}
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

      {/* Bloque 3: Modalidad */}
      <TextField
        select
        label="Modalidad"
        value={modalidad}
        onChange={e => setModalidad(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Todas</MenuItem>
        {modalidades.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
      </TextField>

      {/* Bloque 4: Ubicación */}
      <TextField
        select
        label="Ubicación"
        value={ubicacion}
        onChange={e => setUbicacion(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Todas</MenuItem>
        {ubicaciones.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
      </TextField>

      {/* Bloque 5: Nivel */}
      <TextField
        select
        label="Nivel"
        value={nivel}
        onChange={e => setNivel(e.target.value)}
        sx={{ minWidth: 140 }}
        size="small"
      >
        <MenuItem value="">Todos</MenuItem>
        {niveles.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
      </TextField>

      {/* Bloque 6: Duración */}
      <TextField
        select
        label="Duración"
        value={duracion}
        onChange={e => setDuracion(e.target.value)}
        sx={{ minWidth: 120 }}
        size="small"
      >
        <MenuItem value="">Todas</MenuItem>
        {duraciones.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
      </TextField>

      {/* Bloque 7: Tecnologías */}
      <Autocomplete
        multiple
        options={tecnologias}
        value={tecs}
        onChange={(_, value) => setTecs(value)}
        renderInput={(params) => <TextField {...params} label="Tecnologías" size="small" />}
        sx={{ minWidth: 180 }}
      />

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

// Componente principal de aplicaciones
export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [historyLimit, setHistoryLimit] = useState(5);

  useEffect(() => {
    async function fetchApplications() {
      try {
        // Obtener aplicaciones específicas del estudiante
        const data = await apiService.get('/api/projects/applications/my_applications/');
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      }
    }
    fetchApplications();
  }, []);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

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
        app.requiredSkills.some(skill => skill.toLowerCase().includes(filters.area!.toLowerCase()))
      );
    }
    
    if (filters.modalidad) {
      filtered = filtered.filter(app => app.location === filters.modalidad);
    }
    
    if (filters.ubicacion) {
      filtered = filtered.filter(app => app.location === filters.ubicacion);
    }
    
    if (filters.tecnologias && filters.tecnologias.length > 0) {
      filtered = filtered.filter(app => 
        app.requiredSkills.some(skill => 
          filters.tecnologias!.some(tech => skill.toLowerCase().includes(tech.toLowerCase()))
        )
      );
    }
    
    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
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

  const pendingApplications = filteredApplications.filter(app => app.status === 'pending');
  const acceptedApplications = filteredApplications.filter(app => app.status === 'accepted');
  const completedApplications = filteredApplications.filter(app => app.status === 'completed');
  const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected');

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
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#fff3e0' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {pendingApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e8f5e8' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {acceptedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aceptadas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e3f2fd' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {completedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completadas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#ffebee' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {rejectedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rechazadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabla de aplicaciones */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Historial de Aplicaciones ({filteredApplications.length})
          </Typography>
          <Box>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={historyLimit}
              onChange={e => setHistoryLimit(Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={15}>Últimos 15</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={filteredApplications.length}>Todos</MenuItem>
            </TextField>
          </Box>
        </Box>
        {filteredApplications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron aplicaciones con los filtros seleccionados
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setFilteredApplications(applications)}
              sx={{ mt: 2 }}
            >
              Mostrar todas las aplicaciones
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Compatibilidad</TableCell>
                  <TableCell>Fecha Aplicación</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.slice(0, historyLimit).map((application) => (
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
                      <Chip
                        label={`${application.compatibility}%`}
                        color={getCompatibilityColor(application.compatibility) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(application.appliedDate).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {application.projectDuration}
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
      </Paper>

      {/* Dialog para detalles */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedApplication && (
          <Box sx={{ p: 2, pt: 3, pb: 1 }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, boxShadow: 2 }}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedApplication.projectTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getStatusIcon(selectedApplication.status)}
                    label={getStatusText(selectedApplication.status)}
                    color={getStatusColor(selectedApplication.status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={`Compatibilidad: ${selectedApplication.compatibility}%`}
                    color={getCompatibilityColor(selectedApplication.compatibility) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            {/* Empresa */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, background: 'rgba(0,0,0,0.03)', borderRadius: 2, p: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{selectedApplication.company}</Typography>
                <Typography variant="caption" color="text.secondary">Empresa</Typography>
              </Box>
            </Box>
            {/* Descripción */}
            <Typography variant="body1" sx={{ mb: 3, color: 'text.primary', background: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 2 }}>
              {selectedApplication.description}
            </Typography>
            {/* Datos clave */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                <Typography variant="body1">{selectedApplication.projectDuration}</Typography>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle2" color="text.secondary">Ubicación</Typography>
                <Typography variant="body1">{selectedApplication.location}</Typography>
              </Box>
            </Box>
            {/* Habilidades requeridas */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Habilidades Requeridas:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {selectedApplication.requiredSkills.map((skill) => (
                <Chip key={skill} label={skill} size="small" variant="outlined" />
              ))}
            </Box>
            {/* Fechas */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Aplicación</Typography>
                <Typography variant="body1">
                  {new Date(selectedApplication.appliedDate).toLocaleDateString('es-ES')}
                </Typography>
              </Box>
              {selectedApplication.responseDate && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Respuesta</Typography>
                  <Typography variant="body1">
                    {new Date(selectedApplication.responseDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              )}
            </Box>
            {/* Notas */}
            {selectedApplication.notes && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Notas:</strong> {selectedApplication.notes}
                </Typography>
              </Alert>
            )}
            {/* Botón cerrar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setDialogOpen(false)} variant="contained" sx={{ minWidth: 140, borderRadius: 2 }}>
                Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default MyApplications; 