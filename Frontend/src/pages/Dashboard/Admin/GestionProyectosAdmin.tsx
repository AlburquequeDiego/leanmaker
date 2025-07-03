import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Rating,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Project {
  id: string;
  title: string;
  company: string;
  description: string;
  status: 'active' | 'suspended' | 'completed' | 'cancelled';
  requiredApiLevel: number;
  studentsNeeded: number;
  studentsAssigned: number;
  applicationsCount: number;
  startDate: string;
  endDate: string;
  location: string;
  rating: number;
}

interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  apiLevel: number;
  gpa: number;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  compatibility: number;
  skills: string[];
}



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GestionProyectosAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'suspend' | 'delete' | 'view_candidates' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Nuevos estados para filtros
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApiLevel, setSelectedApiLevel] = useState('');

  // Estados para límite de registros por sección
  const [projectsLimit, setProjectsLimit] = useState<number | 'all'>(10);
  const [applicationsLimit, setApplicationsLimit] = useState<number | 'all'>(10);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, applicationsData] = await Promise.all([
        apiService.get('/api/admin/projects/'),
        apiService.get('/api/admin/applications/')
      ]);
      
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProjects([]);
      setApplications([]);
    }
    setLoading(false);
  };

  // Filtrado de proyectos
  const filteredProjects = projects.filter(project =>
    (project.title.toLowerCase().includes(search.toLowerCase()) || 
     project.company.toLowerCase().includes(search.toLowerCase()) ||
     project.description.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCompany ? project.company === selectedCompany : true) &&
    (selectedStatus ? project.status === selectedStatus : true) &&
    (selectedApiLevel ? project.requiredApiLevel.toString() === selectedApiLevel : true)
  );

  // Obtener valores únicos para los filtros
  const companies = Array.from(new Set(projects.map(p => p.company)));



  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (project: Project, type: 'edit' | 'suspend' | 'delete' | 'view_candidates') => {
    setSelectedProject(project);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleActionConfirm = async () => {
    if (!selectedProject) return;

    try {
      let endpoint = '';
      let payload: any = {};

      switch (actionType) {
        case 'edit':
          endpoint = `/api/admin/projects/${selectedProject.id}/`;
          payload = { reason: actionReason };
          break;
        case 'suspend':
          endpoint = `/api/admin/projects/${selectedProject.id}/suspend/`;
          payload = { reason: actionReason };
          break;
        case 'delete':
          endpoint = `/api/admin/projects/${selectedProject.id}/`;
          await apiService.delete(endpoint);
          break;
        case 'view_candidates':
          // Solo mostrar candidatos, no requiere acción
          setSuccessMessage(`Viendo candidatos para ${selectedProject.title}`);
          setShowSuccess(true);
          setActionDialog(false);
          setActionReason('');
          return;
      }

      if (actionType !== 'delete') {
        await apiService.patch(endpoint, payload);
      }
      
      // Recargar los datos
      await fetchData();

      let message = '';
      switch (actionType) {
        case 'edit':
          message = `Proyecto ${selectedProject.title} actualizado exitosamente`;
          break;
        case 'suspend':
          message = `Proyecto ${selectedProject.title} suspendido`;
          break;
        case 'delete':
          message = `Proyecto ${selectedProject.title} eliminado`;
          break;
      }
      setSuccessMessage(message);
      setShowSuccess(true);
      setActionDialog(false);
      setActionReason('');
    } catch (error) {
      console.error('Error performing action:', error);
      setSuccessMessage('Error al realizar la acción');
      setShowSuccess(true);
    }
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'edit': return 'Editar Proyecto';
      case 'suspend': return 'Suspender Proyecto';
      case 'delete': return 'Eliminar Proyecto';
      case 'view_candidates': return 'Candidatos del Proyecto';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedProject) return null;

    if (actionType === 'view_candidates') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Proyecto: {selectedProject.title}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Empresa: {selectedProject.company}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Candidatos: {selectedProject.applicationsCount} postulaciones
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Candidatos en Proceso:</Typography>
            {applications.filter(app => app.status === 'pending').length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay candidatos en proceso.</Typography>
            ) : (
              applications.filter(app => app.status === 'pending').map(app => (
                <Box key={app.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{app.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    GPA: {app.gpa} | API: {app.apiLevel} | Compatibilidad: {app.compatibility}%
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Proyecto: {selectedProject.title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Empresa: {selectedProject.company}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Estado actual: <strong>{selectedProject.status === 'active' ? 'Activo' : 
                                  selectedProject.status === 'suspended' ? 'Suspendido' : 
                                  selectedProject.status === 'completed' ? 'Completado' : 'Cancelado'}</strong>
        </Typography>
        
        {(actionType === 'suspend' || actionType === 'delete') && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Razón de la acción"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2, borderRadius: 2 }}
            required
          />
        )}
        
        {actionType === 'delete' && (
          <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
            ⚠️ Esta acción es irreversible. El proyecto y todas sus postulaciones serán eliminadas permanentemente.
          </Typography>
        )}
      </Box>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'suspended':
        return 'Suspendido';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'success';
    if (compatibility >= 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Proyectos</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Proyectos" />
          <Tab label="Postulaciones" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Sección de filtros mejorada y responsiva */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" color="primary">
                Filtros de Búsqueda
              </Typography>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', lg: 'row' }} 
              spacing={{ xs: 2, sm: 2 }} 
              alignItems={{ xs: 'stretch', lg: 'center' }}
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Buscar por título, empresa o descripción"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ 
                  minWidth: { xs: '100%', sm: 300 },
                  borderRadius: 2 
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel>Empresa</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Empresa"
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todas las empresas</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company} value={company}>{company}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="suspended">Suspendido</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Nivel API</InputLabel>
                <Select
                  value={selectedApiLevel}
                  label="Nivel API"
                  onChange={(e) => setSelectedApiLevel(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los niveles</MenuItem>
                  <MenuItem value="1">Nivel 1 - Básico</MenuItem>
                  <MenuItem value="2">Nivel 2 - Intermedio</MenuItem>
                  <MenuItem value="3">Nivel 3 - Avanzado</MenuItem>
                  <MenuItem value="4">Nivel 4 - Experto</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearch('');
                  setSelectedCompany('');
                  setSelectedStatus('');
                  setSelectedApiLevel('');
                }}
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Limpiar Filtros
              </Button>
            </Stack>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredProjects.length} de {projects.length} proyectos
              </Typography>
            </Box>
          </Paper>

          {/* Selector de cantidad de registros para proyectos */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={projectsLimit}
              onChange={e => setProjectsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>

          {/* Tabla responsiva */}
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, minWidth: 1000 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200, whiteSpace: 'nowrap' }}>Proyecto</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120, whiteSpace: 'nowrap' }}>Empresa</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Estudiantes</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Postulaciones</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Nivel API</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap' }}>Rating</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 600, minWidth: 150, whiteSpace: 'nowrap' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(projectsLimit === 'all' ? filteredProjects : filteredProjects.slice(0, projectsLimit)).map(project => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {project.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {project.company}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(project.status)} 
                          color={getStatusColor(project.status) as any}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${project.studentsAssigned}/${project.studentsNeeded}`} 
                          color="primary" 
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={project.applicationsCount} 
                          color="secondary" 
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`API ${project.requiredApiLevel}`} 
                          color="warning" 
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={project.rating} readOnly size="small" />
                          <Typography variant="body2" fontWeight={600}>
                            {project.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <IconButton 
                            color="info" 
                            title="Ver candidatos"
                            onClick={() => handleAction(project, 'view_candidates')}
                            size="small"
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="primary" 
                            title="Editar proyecto"
                            onClick={() => handleAction(project, 'edit')}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {project.status === 'active' && (
                            <IconButton 
                              color="warning" 
                              title="Suspender proyecto"
                              onClick={() => handleAction(project, 'suspend')}
                              size="small"
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            color="error" 
                            title="Eliminar proyecto"
                            onClick={() => handleAction(project, 'delete')}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab: Postulaciones */}
        <TabPanel value={tabValue} index={1}>
          {/* Selector de cantidad de registros para postulaciones */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={applicationsLimit}
              onChange={e => setApplicationsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Nivel API</TableCell>
                  <TableCell>GPA</TableCell>
                  <TableCell>Compatibilidad</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(applicationsLimit === 'all' ? applications : applications.slice(0, applicationsLimit)).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{application.studentName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.studentEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>Sistema de Gestión de Inventarios</TableCell>
                    <TableCell>
                      <Chip
                        label={`Nivel ${application.apiLevel}`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{application.gpa}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${application.compatibility}%`}
                        color={getCompatibilityColor(application.compatibility) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.status === 'pending' ? 'Pendiente' : 'Aceptado'}
                        color={application.status === 'pending' ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{application.date}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="success">
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'edit' && <EditIcon color="primary" />}
          {actionType === 'suspend' && <BlockIcon color="warning" />}
          {actionType === 'delete' && <DeleteIcon color="error" />}
          {actionType === 'view_candidates' && <PeopleIcon color="info" />}
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setActionDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          {actionType !== 'view_candidates' && (
            <Button 
              onClick={handleActionConfirm}
              variant="contained"
              color={
                actionType === 'edit' ? 'primary' : 
                actionType === 'suspend' ? 'warning' : 'error'
              }
              sx={{ borderRadius: 2 }}
              disabled={
                (actionType === 'suspend' || actionType === 'delete') && !actionReason.trim()
              }
            >
              {actionType === 'edit' ? 'Actualizar' : 
               actionType === 'suspend' ? 'Suspender' : 'Eliminar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
};

export default GestionProyectosAdmin; 