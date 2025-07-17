import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  TextField,
  FormControl,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Publish as PublishIcon,
  Drafts as DraftsIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptProjectList } from '../../../utils/adapters';
import type { Project } from '../../../types';
import { projectService } from '../../../services/project.service';
import { PublishProjects } from './PublishProjects';
import { useLocation } from 'react-router-dom';

const COUNT_OPTIONS = [20, 50, 100, 150, 200, 250, -1];

const Projects: React.FC<{ initialTab?: number }> = ({ initialTab = 0 }) => {
  const location = useLocation();
  const api = useApi();
  const [tab, setTab] = useState(initialTab);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionCounts, setSectionCounts] = useState({
    active: 20,
    published: 20,
    completed: 20,
    draft: 20,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updatingProject, setUpdatingProject] = useState<string | null>(null);

  // Sincronizar tab con location.state.initialTab si cambia
  useEffect(() => {
    if (location.state && typeof location.state.initialTab === 'number') {
      setTab(location.state.initialTab);
    }
  }, [location.state]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const adaptedProjects = await projectService.getMyProjects();
      setProjects(adaptedProjects);
    } catch (err: any) {
      console.error('Error cargando proyectos:', err);
      setError(err.response?.data?.error || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const handleSectionCountChange = (status: string) => (e: SelectChangeEvent<number>) => {
    setSectionCounts({ ...sectionCounts, [status]: Number(e.target.value) });
  };

  const getStatusCounts = () => {
    return {
      active: projects.filter(p => p.status === 'active' || p.status === 'open').length,
      published: projects.filter(p => p.status === 'published' || p.status === 'open').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length,
  };
  };

  const statusCounts = getStatusCounts();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return 'primary';
      case 'completed':
        return 'success';
      case 'published':
        return 'info';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      setUpdatingProject(selectedProject.id);
      await api.delete(`/api/projects/${selectedProject.id}/`);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error('Error eliminando proyecto:', error);
      setError(error.response?.data?.error || 'Error al eliminar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCompleteClick = (project: Project) => {
    setSelectedProject(project);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      setUpdatingProject(selectedProject.id);
      const response = await api.patch(`/api/projects/${selectedProject.id}/`, {
        status: 'completed'
      });
      
      const updatedProject = response.data;
      setProjects(projects.map(p =>
        p.id === selectedProject.id ? {
          ...p,
          status: updatedProject.status
        } : p
      ));
      setCompleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error('Error completando proyecto:', error);
      setError(error.response?.data?.error || 'Error al completar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleCompleteCancel = () => {
    setCompleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleViewClick = (project: Project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
        return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
          </Box>
        );
  }

  if (error) {
        return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadProjects} variant="contained">
          Reintentar
        </Button>
          </Box>
        );
    }

  const renderDashboard = () => (
    <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center', alignItems: 'stretch' }}>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#e8f5e9', color: '#388e3c', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#388e3c' }}>{statusCounts.active}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#388e3c' }}>Proyectos Activos</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#e3f2fd', color: '#1976d2', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1976d2' }}>{statusCounts.completed}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#1976d2' }}>Proyectos Completados</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#fff3e0', color: '#f57c00', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#f57c00' }}>{statusCounts.published}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#f57c00' }}>Proyectos Publicados</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#f5f5f5', color: '#757575', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#757575' }}>{statusCounts.draft}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#757575' }}>Proyectos Borradores</Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSection = (status: string, icon: React.ReactNode, title: string) => {
    const filtered = projects.filter(p => {
      if (status === 'active') return p.status === 'active' || p.status === 'open';
      if (status === 'published') return p.status === 'published' || p.status === 'open';
      return p.status === status;
    });
    const count = sectionCounts[status as keyof typeof sectionCounts];
    const toShow = count === -1 ? filtered : filtered.slice(0, count);
    
    return (
      <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ ml: 1 }}>
            {title} ({filtered.length})
                    </Typography>
          <Box sx={{ ml: 2 }}>
            <FormControl size="medium" sx={{ minWidth: 140 }}>
              <Select
                value={count}
                onChange={handleSectionCountChange(status)}
                sx={{ minWidth: 140, fontSize: 16 }}
                displayEmpty
                renderValue={selected => selected === -1 ? 'Todas' : `Últimos ${selected}`}
              >
                {COUNT_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt === -1 ? 'Todas' : `Últimos ${opt}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
                  </Box>
                </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {toShow.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay proyectos {title.toLowerCase()}.</Typography>
            </Paper>
          )}
          {toShow.map((project) => (
            <Card key={project.id} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', p: 2, boxShadow: 1, borderRadius: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mr: 1 }}>{project.title}</Typography>
                  <Chip label={getStatusLabel(project.status)} color={getStatusColor(project.status) as any} size="small" />
                </Box>
                    <Typography variant="body2" color="text.secondary">
                  {project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description}
                    </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {project.duration_weeks ? `${project.duration_weeks} semanas • ` : ''} {project.hours_per_week} horas/semana
                  </Typography>
                  <Chip label={`${project.applications_count || 0} postulaciones`} size="small" color="info" />
                  <Chip label={`${project.current_students}/${project.max_students} estudiantes`} size="small" color="success" />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 120, ml: 2 }}>
                {(project.status === 'published' || project.status === 'open' || project.status === 'active') && (
                  <IconButton color="info" size="small" onClick={() => handleViewClick(project)}>
                    <EditIcon />
                  </IconButton>
                )}
                {(project.status === 'active' || project.status === 'open' || project.status === 'published') && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleCompleteClick(project)}
                    disabled={updatingProject === project.id}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <TaskAltIcon />}
                  </IconButton>
                )}
                <IconButton color="primary" size="small" onClick={() => handleViewClick(project)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton 
                  color="error" 
                  size="small" 
                  onClick={() => handleDeleteClick(project)}
                  disabled={updatingProject === project.id}
                >
                  {updatingProject === project.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                </IconButton>
              </Box>
            </Card>
          ))}
          </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Proyectos" />
        <Tab label="Crear Proyecto" icon={<AddIcon />} iconPosition="start" />
      </Tabs>
      
      {tab === 0 && (
        <Box>
          {renderDashboard()}
          {renderSection('active', <PlayArrowIcon color="primary" />, 'Proyectos Activos')}
          {renderSection('published', <PublishIcon color="info" />, 'Proyectos Publicados')}
          {renderSection('completed', <CheckCircleIcon color="success" />, 'Proyectos Completados')}
          {renderSection('draft', <DraftsIcon color="disabled" />, 'Proyectos Borradores')}
        </Box>
      )}
      
      {tab === 1 && (
        <PublishProjects />
      )}

      {/* Diálogo de eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>¿Eliminar proyecto?</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas eliminar el proyecto "{selectedProject?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de completar proyecto */}
      <Dialog open={completeDialogOpen} onClose={handleCompleteCancel}>
        <DialogTitle>¿Marcar proyecto como completado?</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas marcar el proyecto "{selectedProject?.title}" como completado?
          <br />
          <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteCancel}>Cancelar</Button>
          <Button 
            onClick={handleCompleteConfirm} 
            color="success" 
            variant="contained"
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Marcar como Completado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de ver proyecto */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Proyecto</DialogTitle>
        <DialogContent>
          {selectedProject && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" color="primary">{selectedProject.title}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                  <Typography variant="body2">{selectedProject.description}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requerimientos</Typography>
                  <Typography variant="body2">{selectedProject.requirements}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                  <Typography variant="body2">
                    {selectedProject.duration_weeks} semanas • {selectedProject.hours_per_week} horas/semana
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Modalidad</Typography>
                  <Typography variant="body2">{selectedProject.modality}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Dificultad</Typography>
                  <Typography variant="body2">{selectedProject.difficulty}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Nivel API Mínimo</Typography>
                  <Typography variant="body2">{selectedProject.min_api_level}</Typography>
                </Grid>
                
                {selectedProject.start_date && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de Inicio</Typography>
                    <Typography variant="body2">{new Date(selectedProject.start_date).toLocaleDateString()}</Typography>
                  </Grid>
                )}
                
                {selectedProject.estimated_end_date && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Fecha Estimada de Fin</Typography>
                    <Typography variant="body2">{new Date(selectedProject.estimated_end_date).toLocaleDateString()}</Typography>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${selectedProject.applications_count || 0} postulaciones`} size="small" color="info" />
                <Chip label={`${selectedProject.current_students}/${selectedProject.max_students} estudiantes`} size="small" color="success" />
                <Chip label={getStatusLabel(selectedProject.status)} color={getStatusColor(selectedProject.status) as any} size="small" />
                {selectedProject.is_paid && (
                  <Chip label="Remunerado" size="small" color="warning" />
                )}
                {selectedProject.is_featured && (
                  <Chip label="Destacado" size="small" color="secondary" />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
