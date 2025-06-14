import { useState } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Rating,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
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
  salary: string;
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

interface CompatibleCandidate {
  id: string;
  name: string;
  email: string;
  apiLevel: number;
  gpa: number;
  completedProjects: number;
  totalHours: number;
  skills: string[];
  compatibility: number;
  rating: number;
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

  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      title: 'Sistema de Gestión de Inventarios',
      company: 'TechCorp Solutions',
      description: 'Desarrollo de un sistema web para gestión de inventarios con base de datos MySQL y frontend en React.',
      status: 'active',
      requiredApiLevel: 2,
      studentsNeeded: 3,
      studentsAssigned: 2,
      applicationsCount: 8,
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      location: 'Remoto',
      salary: '$500,000 COP/mes',
      rating: 4.5,
    },
    {
      id: '2',
      title: 'Aplicación Móvil de Delivery',
      company: 'Digital Dynamics',
      description: 'Desarrollo de aplicación móvil para delivery de alimentos con geolocalización y pagos en línea.',
      status: 'active',
      requiredApiLevel: 3,
      studentsNeeded: 2,
      studentsAssigned: 0,
      applicationsCount: 5,
      startDate: '2024-03-01',
      endDate: '2024-07-31',
      location: 'Bogotá',
      salary: '$600,000 COP/mes',
      rating: 4.2,
    },
    {
      id: '3',
      title: 'Plataforma de E-learning',
      company: 'EduTech Solutions',
      description: 'Plataforma web para cursos online con sistema de videoconferencias y evaluaciones automáticas.',
      status: 'suspended',
      requiredApiLevel: 2,
      studentsNeeded: 4,
      studentsAssigned: 1,
      applicationsCount: 12,
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      location: 'Medellín',
      salary: '$550,000 COP/mes',
      rating: 4.0,
    },
    {
      id: '4',
      title: 'Sistema de CRM',
      company: 'TechCorp Solutions',
      description: 'Sistema de gestión de relaciones con clientes con integración de APIs y dashboard analítico.',
      status: 'completed',
      requiredApiLevel: 4,
      studentsNeeded: 2,
      studentsAssigned: 2,
      applicationsCount: 6,
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      location: 'Remoto',
      salary: '$700,000 COP/mes',
      rating: 4.8,
    },
  ];

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

  const applications: Application[] = [
    {
      id: '1',
      studentName: 'María González',
      studentEmail: 'maria.gonzalez@estudiante.edu',
      apiLevel: 2,
      gpa: 4.2,
      status: 'pending',
      date: '2024-01-20',
      compatibility: 95,
      skills: ['React', 'Node.js', 'MySQL'],
    },
    {
      id: '2',
      studentName: 'Carlos Ruiz',
      studentEmail: 'carlos.ruiz@estudiante.edu',
      apiLevel: 2,
      gpa: 3.8,
      status: 'accepted',
      date: '2024-01-18',
      compatibility: 88,
      skills: ['React', 'JavaScript', 'MongoDB'],
    },
  ];

  const compatibleCandidates: CompatibleCandidate[] = [
    {
      id: '1',
      name: 'Ana Martínez',
      email: 'ana.martinez@estudiante.edu',
      apiLevel: 3,
      gpa: 4.5,
      completedProjects: 5,
      totalHours: 320,
      skills: ['React Native', 'Firebase', 'JavaScript'],
      compatibility: 92,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Luis Pérez',
      email: 'luis.perez@estudiante.edu',
      apiLevel: 2,
      gpa: 4.0,
      completedProjects: 3,
      totalHours: 180,
      skills: ['React', 'Node.js', 'PostgreSQL'],
      compatibility: 89,
      rating: 4.3,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (project: Project, type: 'edit' | 'suspend' | 'delete' | 'view_candidates') => {
    setSelectedProject(project);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleActionConfirm = () => {
    let message = '';
    switch (actionType) {
      case 'edit':
        message = `Proyecto ${selectedProject?.title} actualizado exitosamente`;
        break;
      case 'suspend':
        message = `Proyecto ${selectedProject?.title} suspendido`;
        break;
      case 'delete':
        message = `Proyecto ${selectedProject?.title} eliminado`;
        break;
      case 'view_candidates':
        message = `Viendo candidatos para ${selectedProject?.title}`;
        break;
    }
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionDialog(false);
    setActionReason('');
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
            <Typography variant="subtitle1" gutterBottom>Candidatos Destacados:</Typography>
            {applications.slice(0, 3).map(app => (
              <Box key={app.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>{app.studentName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  GPA: {app.gpa} | API: {app.apiLevel} | Compatibilidad: {app.compatibility}%
                </Typography>
              </Box>
            ))}
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
          <Tab label="Candidatos" />
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
                  {filteredProjects.map(project => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {project.location} • {project.salary}
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
                {applications.map((application) => (
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

        {/* Tab: Candidatos Compatibles */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Candidatos Compatibles para: Aplicación Móvil de Delivery
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {compatibleCandidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${candidate.compatibility}%`}
                      color={getCompatibilityColor(candidate.compatibility) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Nivel API:</strong> {candidate.apiLevel}
                    </Typography>
                    <Typography variant="body2">
                      <strong>GPA:</strong> {candidate.gpa}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Proyectos:</strong> {candidate.completedProjects}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Horas:</strong> {candidate.totalHours}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Habilidades:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {candidate.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={candidate.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({candidate.rating})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="primary">
                      Ver Perfil
                    </Button>
                    <Button size="small" variant="outlined" color="primary">
                      Sugerir
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
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