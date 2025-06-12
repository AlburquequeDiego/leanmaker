import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  title: string;
  company: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  progress: number;
  hoursWorked: number;
  totalHours: number;
  salary: string;
  location: string;
  description: string;
  technologies: string[];
  teamMembers: number;
  mentor: string;
  deliverables: string[];
  nextMilestone: string;
  nextMilestoneDate: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Sistema de Gestión de Inventarios',
    company: 'TechCorp Solutions',
    status: 'active',
    startDate: '2024-01-20',
    endDate: '2024-04-20',
    progress: 65,
    hoursWorked: 52,
    totalHours: 80,
    salary: '$500,000 COP/mes',
    location: 'Remoto',
    description: 'Desarrollo de un sistema web para gestión de inventarios con base de datos MySQL y frontend en React.',
    technologies: ['React', 'Node.js', 'MySQL', 'JWT'],
    teamMembers: 3,
    mentor: 'Juan Pérez',
    deliverables: [
      'Frontend completo con React',
      'API REST con Node.js',
      'Base de datos MySQL',
      'Documentación técnica',
    ],
    nextMilestone: 'Implementación de reportes',
    nextMilestoneDate: '2024-02-15',
  },
  {
    id: '2',
    title: 'Dashboard de Analytics',
    company: 'DataCorp',
    status: 'completed',
    startDate: '2023-09-01',
    endDate: '2023-11-01',
    progress: 100,
    hoursWorked: 60,
    totalHours: 60,
    salary: '$450,000 COP/mes',
    location: 'Remoto',
    description: 'Desarrollo de dashboard de analytics para visualización de datos empresariales.',
    technologies: ['Python', 'Pandas', 'Power BI', 'SQL'],
    teamMembers: 2,
    mentor: 'María García',
    deliverables: [
      'Dashboard interactivo',
      'Scripts de procesamiento',
      'Reportes automatizados',
      'Documentación de uso',
    ],
    nextMilestone: 'Proyecto completado',
    nextMilestoneDate: '2023-11-01',
  },
  {
    id: '3',
    title: 'Aplicación Móvil de Delivery',
    company: 'Digital Dynamics',
    status: 'paused',
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    progress: 25,
    hoursWorked: 20,
    totalHours: 160,
    salary: '$600,000 COP/mes',
    location: 'Bogotá',
    description: 'Desarrollo de aplicación móvil para delivery de alimentos con geolocalización y pagos en línea.',
    technologies: ['React Native', 'Firebase', 'JavaScript', 'Google Maps API'],
    teamMembers: 4,
    mentor: 'Carlos López',
    deliverables: [
      'App móvil completa',
      'Backend con Firebase',
      'Sistema de pagos',
      'Integración con mapas',
    ],
    nextMilestone: 'Reanudación del proyecto',
    nextMilestoneDate: '2024-03-01',
  },
];

export const MyProjects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'paused':
        return 'Pausado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUpIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'paused':
        return <ScheduleIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const activeProjects = mockProjects.filter(project => project.status === 'active');
  const completedProjects = mockProjects.filter(project => project.status === 'completed');
  const pausedProjects = mockProjects.filter(project => project.status === 'paused');
  const totalHoursWorked = mockProjects.reduce((sum, project) => sum + project.hoursWorked, 0);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Mis Proyectos
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {activeProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Activos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {completedProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {pausedProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pausados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main">
              {totalHoursWorked}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Horas Trabajadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabla de proyectos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Proyectos ({mockProjects.length})
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proyecto</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Progreso</TableCell>
                <TableCell>Horas</TableCell>
                <TableCell>Próximo Hito</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockProjects.map((project) => (
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
                      icon={getStatusIcon(project.status)}
                      label={getStatusText(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.hoursWorked}/{project.totalHours}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {project.nextMilestone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(project.nextMilestoneDate).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(project)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para detalles */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles del Proyecto
            </Typography>
            {selectedProject && (
              <Chip
                icon={getStatusIcon(selectedProject.status)}
                label={getStatusText(selectedProject.status)}
                color={getStatusColor(selectedProject.status) as any}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedProject.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="body1">
                  {selectedProject.company}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedProject.description}
              </Typography>

              {/* Progreso */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">
                    Progreso del Proyecto
                  </Typography>
                  <Typography variant="subtitle2">
                    {selectedProject.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedProject.progress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Información del proyecto */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha Inicio
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.startDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha Fin
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.endDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Horas Trabajadas
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.hoursWorked}/{selectedProject.totalHours}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Salario
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.salary}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ubicación
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mentor
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.mentor}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Equipo
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.teamMembers} miembros
                  </Typography>
                </Box>
              </Box>

              {/* Tecnologías */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tecnologías Utilizadas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProject.technologies.map((tech) => (
                    <Chip key={tech} label={tech} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              {/* Entregables */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Entregables:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedProject.deliverables.map((deliverable, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        {deliverable}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Próximo hito */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Próximo Hito:</strong> {selectedProject.nextMilestone}
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha:</strong> {new Date(selectedProject.nextMilestoneDate).toLocaleDateString('es-ES')}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProjects; 