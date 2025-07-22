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
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { ShowLatestFilter } from '../../../components/common/ShowLatestFilter';

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
  modality?: string;
  hoursPerWeek?: number;
  maxStudents?: number;
  currentStudents?: number;
  trlLevel?: string;
  apiLevel?: string;
  createdAt?: string;
  requirements?: string;
}

export const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeLimit, setActiveLimit] = useState(20);
  const [completedLimit, setCompletedLimit] = useState(20);
  const [pausedLimit, setPausedLimit] = useState(5);
  const [tab, setTab] = useState(0);

  // Adaptador de datos del backend al frontend
  const adaptProjectData = (backend: any): Project => ({
    id: backend.id,
    title: backend.title,
    company: backend.company || 'Sin empresa',
    status: backend.status || 'active',
    startDate: backend.startDate || '',
    endDate: backend.endDate || '',
    progress: typeof backend.progress === 'number' ? backend.progress : (backend.status === 'completed' ? 100 : 50),
    hoursWorked: backend.hoursWorked ?? backend.hours_worked ?? 0,
    totalHours: backend.totalHours ?? backend.total_hours ?? 0,
    location: backend.location || '',
    description: backend.description || '',
    technologies: Array.isArray(backend.technologies) ? backend.technologies : [],
    teamMembers: backend.teamMembers ?? backend.team_members ?? 1,
    mentor: backend.mentor || '',
    deliverables: Array.isArray(backend.deliverables) ? backend.deliverables : [],
    nextMilestone: backend.nextMilestone || '',
    nextMilestoneDate: backend.nextMilestoneDate || '',
    modality: backend.modality,
    hoursPerWeek: backend.hours_per_week,
    maxStudents: backend.max_students,
    currentStudents: backend.current_students,
    trlLevel: backend.trl_level,
    apiLevel: backend.api_level,
    createdAt: backend.created_at,
    requirements: backend.requirements,
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await apiService.get('/api/projects/my_projects/');
        console.log('[MyProjects] Response:', response);
        // El backend devuelve {success: true, data: Array, total: number}
        const projectsData = response.data || response;
        const arr = Array.isArray(projectsData) ? projectsData : projectsData.data;
        // Solo mostrar proyectos con estado 'active' o 'completed'
        const filtered = Array.isArray(arr) ? arr.filter(p => p.status === 'active' || p.status === 'completed') : [];
        setProjects(filtered.map(adaptProjectData));
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
    }
    fetchProjects();
  }, []);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary'; // Morado
      case 'completed':
        return 'primary'; // Azul
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activado'; // Cambiar el texto a 'Activado'
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

      {/* Dashboard */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e8f5e9' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {typeof activeProjects.length === 'number' && !isNaN(activeProjects.length) ? activeProjects.length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Activos
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0, bgcolor: '#e3f2fd' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {typeof completedProjects.length === 'number' && !isNaN(completedProjects.length) ? completedProjects.length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyectos Completados
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs de secciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange}>
        <Tab label={`Activos (${activeProjects.length})`} />
        <Tab label={`Completados (${completedProjects.length})`} />
        </Tabs>
        <ShowLatestFilter
          value={tab === 0 ? activeLimit : completedLimit}
          onChange={(value) => {
            if (tab === 0) setActiveLimit(value);
            else setCompletedLimit(value);
          }}
          options={[20, 50, 100, 150, -1]}
        />
      </Box>

      {/* Sección de proyectos activos */}
      {tab === 0 && (
        <Box>
          {activeProjects.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No tienes proyectos activos aún.
            </Paper>
          ) : (
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
                          {typeof project.hoursWorked === 'number' && !isNaN(project.hoursWorked) ? project.hoursWorked : 0}/
                          {typeof project.totalHours === 'number' && !isNaN(project.totalHours) ? project.totalHours : 0} horas • {project.location}
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
          )}
        </Box>
      )}

      {/* Sección de proyectos completados */}
      {tab === 1 && (
        <Box>
          {completedProjects.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No tienes proyectos completados aún.
            </Paper>
          ) : (
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
                          value={typeof project.progress === 'number' && !isNaN(project.progress) ? Math.max(0, Math.min(100, project.progress)) : 0}
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
                          {typeof project.hoursWorked === 'number' && !isNaN(project.hoursWorked) ? project.hoursWorked : 0}/
                          {typeof project.totalHours === 'number' && !isNaN(project.totalHours) ? project.totalHours : 0} horas • {project.location}
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
          )}
        </Box>
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
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">{selectedProject.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                <b>Empresa:</b> {selectedProject.company} &nbsp;|&nbsp; <b>Estado:</b> <Chip label={getStatusText(selectedProject.status)} color={getStatusColor(selectedProject.status)} size="small" sx={{ fontWeight: 600 }} />
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedProject.modality && <Chip label={`Modalidad: ${selectedProject.modality}`} color="info" />}
                {selectedProject.location && <Chip label={`Ubicación: ${selectedProject.location}`} color="default" />}
                {selectedProject.difficulty && <Chip label={`Dificultad: ${selectedProject.difficulty}`} color="secondary" />}
                {selectedProject.totalHours && <Chip label={`Horas totales: ${selectedProject.totalHours}`} color="default" />}
                {selectedProject.hoursPerWeek && <Chip label={`Horas/semana: ${selectedProject.hoursPerWeek}`} color="default" />}
                {selectedProject.teamMembers && <Chip label={`Miembros del equipo: ${selectedProject.teamMembers}`} color="success" />}
                {selectedProject.maxStudents && <Chip label={`Máx. estudiantes: ${selectedProject.maxStudents}`} color="success" />}
                {selectedProject.currentStudents !== undefined && <Chip label={`Actualmente: ${selectedProject.currentStudents}`} color="warning" />}
                {selectedProject.trlLevel && <Chip label={`TRL: ${selectedProject.trlLevel}`} color="primary" icon={<ScienceIcon />} />}
                {selectedProject.apiLevel && <Chip label={`API Level: ${selectedProject.apiLevel}`} color="primary" icon={<TrendingUpIcon />} />}
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, bgcolor: '#fff', mb: 2 }} elevation={2}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary">Descripción</Typography>
                    <Typography variant="body1">{selectedProject.description}</Typography>
                  </Paper>
                  {selectedProject.requirements && (
                    <Paper sx={{ p: 2, bgcolor: '#fff', mb: 2 }} elevation={2}>
                      <Typography variant="h6" fontWeight={600} gutterBottom color="primary">Requisitos</Typography>
                      <Typography variant="body2">{selectedProject.requirements}</Typography>
                    </Paper>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: '#f1f8e9' }} elevation={1}>
                    <Typography variant="subtitle2" color="text.secondary">Creado:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleString() : '-'}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Estado actual:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>{getStatusText(selectedProject.status)}</Typography>
                    <Button onClick={() => setDialogOpen(false)} color="secondary" variant="outlined" sx={{ mt: 2, mr: 1 }}>Cerrar</Button>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
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