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
  Restore as RestoreIcon,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
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
    published: 20,
    active: 20,
    completed: 20,
    deleted: 20,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updatingProject, setUpdatingProject] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      published: projects.filter(p => p.status === 'published').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      deleted: projects.filter(p => p.status === 'deleted').length,
    };
  };

  const statusCounts = getStatusCounts();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'deleted':
        return 'Eliminado';
      default:
        return 'Publicado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'info';
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'deleted':
        return 'error';
      default:
        return 'info';
    }
  };

  const statusConfig = {
    published: {
      label: 'Publicado',
      color: '#1976d2',
      icon: <PublishIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto está publicado y visible para los estudiantes.'
    },
    active: {
      label: 'Activo',
      color: '#388e3c',
      icon: <PlayArrowIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto está en curso y los estudiantes están trabajando en él.'
    },
    completed: {
      label: 'Completado',
      color: '#fbc02d',
      icon: <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto ha sido finalizado.'
    },
    deleted: {
      label: 'Eliminado',
      color: '#d32f2f',
      icon: <DeleteIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto ha sido eliminado.'
    }
  };

  /**
   * StatusBadge
   * Componente visual para mostrar el estado de un proyecto con color, icono y tooltip.
   * Uso: <StatusBadge status={project.status} />
   * Estados soportados: published, active, completed, deleted
   * Traduce y estiliza el estado para hacerlo más visual e intuitivo.
   */
  function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig['published'];
    return (
      <Tooltip title={config.tooltip} arrow>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: config.color,
          color: '#fff',
          borderRadius: 12,
          padding: '2px 10px',
          fontWeight: 600,
          fontSize: '0.95em',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          marginLeft: 4
        }}>
          {config.icon}
          <span style={{ marginLeft: 6 }}>{config.label}</span>
        </span>
      </Tooltip>
    );
  }

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      setUpdatingProject(selectedProject.id);
      const response = await api.patch(`/api/projects/${selectedProject.id}/update/`, {
        status: 'deleted'
      });
      
      const updatedProject = response;
      console.log('Respuesta del backend (eliminar):', updatedProject); // Debug
      
      if (updatedProject && (updatedProject.status || updatedProject.status_name)) {
        const newStatus = updatedProject.status || updatedProject.status_name;
        setProjects(projects.map(p =>
          p.id === selectedProject.id ? {
            ...p,
            status: newStatus
          } : p
        ));
        setDeleteDialogOpen(false);
        setSelectedProject(null);
      } else {
        console.error('Respuesta inesperada del backend (eliminar):', updatedProject);
        setError('Respuesta inesperada del servidor');
      }
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

  const handleActivateClick = (project: Project) => {
    setSelectedProject(project);
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!selectedProject) return;
    try {
      setUpdatingProject(selectedProject.id);
      // Llamar al nuevo endpoint para activar el proyecto y estudiantes
      const response = await api.post(`/api/projects/${selectedProject.id}/activate/`);
      console.log('Respuesta del backend (activar proyecto):', response);
      if (response && response.success) {
        // Recargar la lista de proyectos desde el backend
        await loadProjects();
        setActivateDialogOpen(false);
        setSelectedProject(null);
      } else {
        setError('Error al activar el proyecto o respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Error activando proyecto:', error);
      setError(error.response?.data?.error || 'Error al activar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleActivateCancel = () => {
    setActivateDialogOpen(false);
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
      const response = await api.patch(`/api/projects/${selectedProject.id}/update/`, {
        status: 'completed'
      });
      
      const updatedProject = response;
      console.log('Respuesta del backend:', updatedProject); // Debug
      
      if (updatedProject && (updatedProject.status || updatedProject.status_name)) {
        const newStatus = updatedProject.status || updatedProject.status_name;
        setProjects(projects.map(p =>
          p.id === selectedProject.id ? {
            ...p,
            status: newStatus
          } : p
        ));
        setCompleteDialogOpen(false);
        setSelectedProject(null);
      } else {
        console.error('Respuesta inesperada del backend:', updatedProject);
        setError('Respuesta inesperada del servidor');
      }
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

  const handleRestoreClick = (project: Project) => {
    setSelectedProject(project);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedProject) return;

    try {
      setUpdatingProject(selectedProject.id);
      await api.patch(`/api/projects/${selectedProject.id}/restore/`);
      
      // Recargar proyectos
      await loadProjects();
      
      setRestoreDialogOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      console.error('Error restaurando proyecto:', err);
      setError(err.response?.data?.error || 'Error al restaurar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setSelectedProject(null);
  };

  const handleViewClick = async (project: Project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/api/projects/${project.id}/`);
      setProjectDetails(response.data || response);
    } catch (e) {
      setProjectDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
    setProjectDetails(null);
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
      <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#fff3e0', color: '#f57c00', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#f57c00' }}>{statusCounts.published}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#f57c00' }}>Proyectos Publicados</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#e8f5e9', color: '#388e3c', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#388e3c' }}>{statusCounts.active}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#388e3c' }}>Proyectos Activos</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: '#e3f2fd', color: '#1976d2', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center', minWidth: 240, maxWidth: 320, width: '100%' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1976d2' }}>{statusCounts.completed}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#1976d2' }}>Proyectos Completados</Typography>
        </Card>
      </Grid>
      
    </Grid>
  );

  const renderSection = (status: string, icon: React.ReactNode, title: string) => {
    const filtered = projects.filter(p => {
      // Verificar que el proyecto tenga las propiedades básicas necesarias
      if (!p || !p.id || !p.title) return false;
      
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
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: 3
            }}>
              <Typography color="text.secondary" variant="h6">
                No hay proyectos {title.toLowerCase()}.
              </Typography>
            </Paper>
          )}
          {toShow.map((project) => {
            // Verificar que el proyecto tenga las propiedades necesarias
            if (!project || !project.id || !project.title) {
              return null;
            }
            
            return (
            <Card key={project.id} sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              p: 3, 
              boxShadow: 3, 
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                borderColor: 'primary.main'
              }
            }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mr: 1, color: 'primary.main' }}>
                    {project.title}
                  </Typography>
                  <StatusBadge status={project.status} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {project.description && project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description || 'Sin descripción'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {project.duration_weeks ? `${project.duration_weeks} semanas • ` : ''} {project.hours_per_week || 0} horas/semana
                  </Typography>
                  <Chip 
                    label={`${project.current_students || 0}/${project.max_students || 1} estudiantes`} 
                    size="small" 
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                gap: 1, 
                minWidth: 120, 
                ml: 2 
              }}>
                {project.status === 'published' && tab !== 1 && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleActivateClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      '&:hover': { bgcolor: 'success.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                  </IconButton>
                )}
                {project.status === 'active' && tab !== 1 && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleCompleteClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      '&:hover': { bgcolor: 'success.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <TaskAltIcon />}
                  </IconButton>
                )}
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={() => handleViewClick(project)}
                  sx={{ 
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
                {project.status === 'deleted' && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleRestoreClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      '&:hover': { bgcolor: 'success.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <RestoreIcon />}
                  </IconButton>
                )}
                {project.status !== 'active' && tab !== 1 && (
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDeleteClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                      '&:hover': { bgcolor: 'error.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                  </IconButton>
                )}
              </Box>
            </Card>
            );
          })}
          </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 3 }, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header mejorado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Gestión de Proyectos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra y supervisa todos tus proyectos de la plataforma
        </Typography>
      </Box>

      <Tabs 
        value={tab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4,
          '& .MuiTab-root': {
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            minHeight: 48
          }
        }}
      >
        <Tab label="Mis Proyectos" />
        <Tab label="Proyectos Eliminados" />
        <Tab label="Crear Proyecto" icon={<AddIcon />} iconPosition="start" />
      </Tabs>
      
      {tab === 0 && (
        <Box>
          {renderDashboard()}
          {renderSection('published', <PublishIcon color="info" />, 'Proyectos Publicados')}
          {renderSection('active', <PlayArrowIcon color="primary" />, 'Proyectos Activos')}
          {renderSection('completed', <CheckCircleIcon color="success" />, 'Proyectos Completados')}
        </Box>
      )}
      
      {tab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Proyectos Eliminados
          </Typography>
          {renderSection('deleted', <DeleteIcon color="error" />, 'Proyectos Eliminados')}
        </Box>
      )}
      
      {tab === 2 && (
        <PublishProjects />
      )}

      {/* Diálogo de eliminar mejorado */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          fontWeight: 600
        }}>
          ¿Eliminar proyecto?
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            ¿Seguro que deseas eliminar el proyecto <strong>"{selectedProject?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer y se perderán todos los datos asociados al proyecto.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de activar proyecto */}
      <Dialog open={activateDialogOpen} onClose={handleActivateCancel}>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          ¿Activar proyecto?
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas activar el proyecto <strong>"{selectedProject?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            - El proyecto cambiará a estado "Activo".<br/>
            - Los estudiantes aceptados pasarán a "Proyectos Activos" y podrán comenzar a trabajar.<br/>
            - Los estudiantes recibirán una notificación de que el proyecto está en curso.<br/>
            - Ya no podrás modificar los estudiantes asignados a este proyecto.<br/>
            - El avance y las entregas de los estudiantes comenzarán a registrarse desde este momento.<br/>
          </Typography>
          <Typography variant="body2" color="error">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleActivateCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleActivateConfirm} 
            color="primary" 
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de completar proyecto mejorado */}
      <Dialog open={completeDialogOpen} onClose={handleCompleteCancel}>
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          fontWeight: 600
        }}>
          ¿Marcar proyecto como completado?
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            ¿Seguro que deseas marcar el proyecto <strong>"{selectedProject?.title}"</strong> como completado?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <b>Una vez que completes el proyecto:</b><br/>
            - El soporte del sistema validará y asignará las horas correspondientes de proyecto a los integrantes.<br/>
            - Si algún estudiante no completó los trabajos asignados, el soporte podrá asignarle un strike como penalización.<br/>
            - Esta acción es irreversible y no se podrá modificar ni corregir posteriormente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCompleteCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCompleteConfirm} 
            color="success" 
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Marcar como Completado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de ver proyecto mejorado */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Detalles del Proyecto
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedProject && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                  {projectDetails?.title || selectedProject.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={getStatusLabel(projectDetails?.status || selectedProject.status)} color={getStatusColor(projectDetails?.status || selectedProject.status) as any} size="medium" />
                  <Chip label={`${projectDetails?.current_students || selectedProject.current_students}/${projectDetails?.max_students || selectedProject.max_students} estudiantes`} size="medium" color="success" />
                  {(projectDetails?.is_paid || selectedProject.is_paid) && (
                    <Chip label="Remunerado" size="medium" color="warning" />
                  )}
                  {(projectDetails?.is_featured || selectedProject.is_featured) && (
                    <Chip label="Destacado" size="medium" color="secondary" />
                  )}
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                    {projectDetails?.description || selectedProject.description || 'Sin descripción'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Requerimientos
                  </Typography>
                  <Typography variant="body1" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                    {projectDetails?.requirements || selectedProject.requirements || 'Sin requisitos especificados'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Tipo de Actividad
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.tipo || selectedProject.tipo || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Objetivo del Proyecto
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.objetivo || selectedProject.objetivo || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Duración
                  </Typography>
                  <Typography variant="body1">
                    {(projectDetails?.duration_weeks || selectedProject.duration_weeks) || 0} semanas • {(projectDetails?.hours_per_week || selectedProject.hours_per_week) || 0} horas/semana
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Horas totales del proyecto: <b>{((projectDetails?.duration_weeks || selectedProject.duration_weeks) || 0) * ((projectDetails?.hours_per_week || selectedProject.hours_per_week) || 0)}</b>
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Modalidad
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.modality || selectedProject.modality || 'No especificada'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Responsable del Proyecto
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.encargado || selectedProject.encargado || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contacto de la Empresa
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.contacto || selectedProject.contacto || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Etapa de Desarrollo
                  </Typography>
                  <Typography variant="body1">
                    Opción {projectDetails?.trl_id || selectedProject.trl_id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Horas Ofrecidas
                  </Typography>
                  <Typography variant="body1">
                    {projectDetails?.required_hours || selectedProject.required_hours} horas
                  </Typography>
                </Grid>
                
 

                
                {(projectDetails?.start_date || selectedProject.start_date) && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Fecha de Inicio
                    </Typography>
                    <Typography variant="body1">
                      {new Date(projectDetails?.start_date || selectedProject.start_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                
                {(projectDetails?.estimated_end_date || selectedProject.estimated_end_date) && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Fecha Estimada de Fin
                    </Typography>
                    <Typography variant="body1">
                      {new Date(projectDetails?.estimated_end_date || selectedProject.estimated_end_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              {projectDetails && projectDetails.estudiantes && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Estudiantes participantes
                  </Typography>
                  {projectDetails.estudiantes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay estudiantes asignados a este proyecto.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {projectDetails.estudiantes.map((est: any) => (
                        <Box key={est.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Chip label={est.nombre} color="primary" />
                          <Typography variant="body2" color="text.secondary">{est.email}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleViewClose}
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de restaurar proyecto */}
      <Dialog open={restoreDialogOpen} onClose={handleRestoreCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Restaurar Proyecto
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que quieres restaurar el proyecto "{selectedProject?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El proyecto volverá a estar publicado y será visible para los estudiantes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleRestoreCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRestoreConfirm}
            variant="contained"
            color="success"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Restaurar Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
