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
  Badge,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
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
  ];

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
  };

  const handleActionConfirm = () => {
    console.log(`Aplicando acción ${actionType} a ${selectedProject?.title}`, actionReason);
    setActionDialog(false);
    setActionReason('');
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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Proyectos
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project management tabs">
          <Tab label="Proyectos" />
          <Tab label="Aplicaciones" />
          <Tab label="Candidatos Compatibles" />
          <Tab label="Estadísticas" />
        </Tabs>

        {/* Tab: Proyectos */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Nivel API</TableCell>
                  <TableCell>Estudiantes</TableCell>
                  <TableCell>Aplicaciones</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.description.substring(0, 60)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                          <BusinessIcon fontSize="small" />
                        </Avatar>
                        {project.company}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(project.status)}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Nivel ${project.requiredApiLevel}`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {project.studentsAssigned}/{project.studentsNeeded}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={project.applicationsCount} color="primary">
                        <PeopleIcon />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Rating value={project.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(project, 'view_candidates')}
                      >
                        <PeopleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(project, 'edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      {project.status === 'active' ? (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleAction(project, 'suspend')}
                        >
                          <BlockIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAction(project, 'suspend')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleAction(project, 'delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Aplicaciones */}
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

        {/* Tab: Estadísticas */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proyectos Activos
                </Typography>
                <Typography variant="h3" color="primary">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proyectos en curso
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Aplicaciones Pendientes
                </Typography>
                <Typography variant="h3" color="warning.main">
                  28
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por revisar
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estudiantes Asignados
                </Typography>
                <Typography variant="h3" color="success.main">
                  45
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En proyectos activos
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tasa de Éxito
                </Typography>
                <Typography variant="h3" color="info.main">
                  87%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proyectos completados exitosamente
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog para acciones */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'edit' && 'Editar Proyecto'}
          {actionType === 'suspend' && (selectedProject?.status === 'active' ? 'Suspender Proyecto' : 'Activar Proyecto')}
          {actionType === 'delete' && 'Eliminar Proyecto'}
          {actionType === 'view_candidates' && 'Candidatos Compatibles'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Proyecto: {selectedProject?.title}
          </Typography>
          {actionType !== 'view_candidates' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancelar</Button>
          <Button onClick={handleActionConfirm} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionProyectosAdmin; 