import { useEffect, useState } from 'react';
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

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
  location: string;
  description: string;
  technologies: string[];
  teamMembers: number;
  mentor: string;
  deliverables: string[];
  nextMilestone: string;
  nextMilestoneDate: string;
}

export const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeLimit, setActiveLimit] = useState(5);
  const [completedLimit, setCompletedLimit] = useState(5);
  const [pausedLimit, setPausedLimit] = useState(5);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiService.get('/api/project-members/');
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        setProjects([]);
      }
    }
    fetchProjects();
  }, []);

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

  const activeProjects = projects.filter(project => project.status === 'active');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const pausedProjects = projects.filter(project => project.status === 'paused');
  const totalHoursWorked = projects.reduce((sum, project) => sum + project.hoursWorked, 0);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Mis Proyectos
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e8f5e9' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {activeProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Activos
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e3f2fd' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {completedProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Completados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#fff3e0' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {pausedProjects.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Pausados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e3f2fd' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main">
              {totalHoursWorked}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Horas Acumuladas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Proyectos Activos */}
      {activeProjects.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
              Proyectos Activos ({activeProjects.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={activeLimit}
                label="Mostrar"
                onChange={e => setActiveLimit(Number(e.target.value))}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={20}>Últimos 20</MenuItem>
                <MenuItem value={activeProjects.length}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {activeProjects.slice(0, activeLimit).map((project) => (
              <Box key={project.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleViewDetails(project)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {project.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(project.status)}
                        label={getStatusText(project.status)}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progreso</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {project.hoursWorked}/{project.totalHours} horas • {project.location}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          {activeProjects.length > activeLimit && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {activeLimit} de {activeProjects.length} proyectos activos
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Proyectos Completados */}
      {completedProjects.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'info.main' }} />
              Proyectos Completados ({completedProjects.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={completedLimit}
                label="Mostrar"
                onChange={e => setCompletedLimit(Number(e.target.value))}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={20}>Últimos 20</MenuItem>
                <MenuItem value={completedProjects.length}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {completedProjects.slice(0, completedLimit).map((project) => (
              <Box key={project.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', cursor: 'pointer', opacity: 0.8 }} onClick={() => handleViewDetails(project)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {project.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(project.status)}
                        label={getStatusText(project.status)}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progreso</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {project.hoursWorked}/{project.totalHours} horas • {project.location}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          {completedProjects.length > completedLimit && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {completedLimit} de {completedProjects.length} proyectos completados
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Proyectos Pausados */}
      {pausedProjects.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
              Proyectos Pausados ({pausedProjects.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={pausedLimit}
                label="Mostrar"
                onChange={e => setPausedLimit(Number(e.target.value))}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={20}>Últimos 20</MenuItem>
                <MenuItem value={pausedProjects.length}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {pausedProjects.slice(0, pausedLimit).map((project) => (
              <Box key={project.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', cursor: 'pointer', opacity: 0.7 }} onClick={() => handleViewDetails(project)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {project.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(project.status)}
                        label={getStatusText(project.status)}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progreso</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {project.hoursWorked}/{project.totalHours} horas • {project.location}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          {pausedProjects.length > pausedLimit && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {pausedLimit} de {pausedProjects.length} proyectos pausados
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Dialog para mostrar detalles del proyecto */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles del Proyecto
            </Typography>
            <Chip
              icon={selectedProject ? getStatusIcon(selectedProject.status) : undefined}
              label={selectedProject ? getStatusText(selectedProject.status) : ''}
              color={selectedProject ? getStatusColor(selectedProject.status) as any : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedProject.title}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Información General */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Información del Proyecto
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            <Typography variant="body2">
                              <strong>Empresa:</strong> {selectedProject.company}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon color="primary" />
                            <Typography variant="body2">
                              <strong>Duración:</strong> {selectedProject.startDate} - {selectedProject.endDate}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon color="primary" />
                            <Typography variant="body2">
                              <strong>Ubicación:</strong> {selectedProject.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="body2">
                              <strong>Mentor:</strong> {selectedProject.mentor}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Progreso y Horas */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Progreso y Horas
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Progreso General</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {selectedProject.progress}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={selectedProject.progress}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Horas Trabajadas</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {selectedProject.hoursWorked}/{selectedProject.totalHours} horas
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Miembros del Equipo</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {selectedProject.teamMembers} personas
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Descripción */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Descripción del Proyecto
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {selectedProject.description}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Tecnologías */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tecnologías Utilizadas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedProject.technologies.map((tech) => (
                        <Chip key={tech} label={tech} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Entregables */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Entregables
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedProject.deliverables.map((deliverable, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">{deliverable}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Próximo Hito */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Próximo Hito
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedProject.nextMilestone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fecha: {selectedProject.nextMilestoneDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProjects; 