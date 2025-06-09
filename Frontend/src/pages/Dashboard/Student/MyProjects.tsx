import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Avatar,
  Rating,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// Mock de proyectos
const mockProjects = [
  {
    id: '1',
    title: 'Desarrollo de Aplicación Web',
    company: 'Tech Solutions',
    status: 'in_progress',
    progress: 65,
    description: 'Desarrollo de una aplicación web full-stack utilizando React y Node.js.',
    startDate: '2024-05-01',
    endDate: '2024-07-31',
    nextDeadline: '2024-06-15',
    tasks: [
      { id: 1, title: 'Implementar autenticación', status: 'completed' },
      { id: 2, title: 'Desarrollar dashboard', status: 'in_progress' },
      { id: 3, title: 'Integrar API', status: 'pending' },
    ],
    mentor: 'Juan Pérez',
    mentorEmail: 'juan.perez@techsolutions.com',
  },
  {
    id: '2',
    title: 'Análisis de Datos',
    company: 'Data Analytics Corp',
    status: 'on_track',
    progress: 85,
    description: 'Proyecto de análisis de datos y visualización para dashboard empresarial.',
    startDate: '2024-04-15',
    endDate: '2024-06-15',
    nextDeadline: '2024-06-10',
    tasks: [
      { id: 1, title: 'Recolección de datos', status: 'completed' },
      { id: 2, title: 'Análisis estadístico', status: 'completed' },
      { id: 3, title: 'Visualización', status: 'in_progress' },
    ],
    mentor: 'María García',
    mentorEmail: 'maria.garcia@dataanalytics.com',
  },
  {
    id: '3',
    title: 'Diseño de UI/UX',
    company: 'Creative Design',
    status: 'at_risk',
    progress: 30,
    description: 'Diseño de interfaz de usuario y experiencia para aplicación móvil.',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    nextDeadline: '2024-06-12',
    tasks: [
      { id: 1, title: 'Wireframes', status: 'completed' },
      { id: 2, title: 'Prototipos', status: 'in_progress' },
      { id: 3, title: 'Testing', status: 'pending' },
    ],
    mentor: 'Carlos López',
    mentorEmail: 'carlos.lopez@creativedesign.com',
  },
];

const statusConfig = {
  in_progress: {
    label: 'En Progreso',
    color: 'info',
    icon: <AccessTimeIcon />,
  },
  on_track: {
    label: 'En Tiempo',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  at_risk: {
    label: 'En Riesgo',
    color: 'warning',
    icon: <WarningIcon />,
  },
};

const taskStatusConfig = {
  completed: {
    label: 'Completado',
    color: 'success',
  },
  in_progress: {
    label: 'En Progreso',
    color: 'info',
  },
  pending: {
    label: 'Pendiente',
    color: 'warning',
  },
};

export const MyProjects = () => {
  const projects = mockProjects;
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | null>(null);

  const filteredProjects = projects.filter(project => 
    selectedTab === 'all' || project.status === selectedTab
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleAction = (project: any, type: 'view' | 'edit' | 'delete') => {
    setSelectedProject(project);
    setActionType(type);
    setDialogOpen(true);
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === selectedProject);
  };

  const getStatusCount = (status: string) => {
    return projects.filter(project => project.status === status).length;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mis Proyectos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Proyecto</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Progreso</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Calificación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
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
                    label={statusConfig[project.status as keyof typeof statusConfig].label}
                    color={statusConfig[project.status as keyof typeof statusConfig].color as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {project.progress}% completado
                  </Typography>
                </TableCell>
                <TableCell>
                  <Rating value={4.5} readOnly size="small" />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleAction(project, 'view')}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleAction(project, 'edit')}
                  >
                    <EditIcon />
                  </IconButton>
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

      {/* Dialog para mostrar detalles del proyecto */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Detalles del Proyecto'}
          {actionType === 'edit' && 'Editar Proyecto'}
          {actionType === 'delete' && 'Eliminar Proyecto'}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProject.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedProject.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información General
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Empresa:</strong> {selectedProject.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Duración:</strong> {selectedProject.startDate} - {selectedProject.endDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Ubicación:</strong> {selectedProject.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Salario:</strong> {selectedProject.salary}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Equipo:</strong> {selectedProject.teamSize} personas
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Progreso y Horas
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Progreso del proyecto
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedProject.progress}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {selectedProject.progress}% completado
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Horas trabajadas:</strong> {selectedProject.hoursWorked}/{selectedProject.totalHours}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Calificación:</strong> {selectedProject.rating}/5
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tecnologías Utilizadas
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedProject.technologies.map((tech: string) => (
                          <Chip key={tech} label={tech} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tareas del Proyecto
                      </Typography>
                      <List>
                        {selectedProject.tasks.map((task: any) => (
                          <ListItem key={task.id}>
                            <ListItemIcon>
                              {task.completed ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <AssignmentIcon color="action" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={task.title}
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'text.secondary' : 'text.primary',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {actionType === 'edit' && (
            <Button variant="contained" color="primary">
              Guardar Cambios
            </Button>
          )}
          {actionType === 'delete' && (
            <Button variant="contained" color="error">
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProjects; 