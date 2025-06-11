import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  studentsNeeded: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  applicationsCount: number;
  selectedStudents: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Desarrollo Web Frontend',
    description: 'Desarrollo de una aplicación web moderna usando React y TypeScript',
    requirements: ['React', 'TypeScript', 'Material-UI', 'Git'],
    duration: '3 meses',
    studentsNeeded: 2,
    status: 'active',
    applicationsCount: 8,
    selectedStudents: 2,
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'API REST con Django',
    description: 'Creación de una API REST completa para sistema de gestión',
    requirements: ['Python', 'Django', 'PostgreSQL', 'REST API'],
    duration: '4 meses',
    studentsNeeded: 1,
    status: 'published',
    applicationsCount: 5,
    selectedStudents: 0,
    startDate: '2024-03-01',
    endDate: '2024-07-01',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
  },
];

export const CompanyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectForMenu, setSelectedProjectForMenu] = useState<Project | null>(null);

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    requirements: [],
    duration: '',
    studentsNeeded: 1,
    status: 'draft',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'published':
        return 'info';
      case 'active':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleAddProject = () => {
    const project: Project = {
      ...newProject as Project,
      id: Date.now().toString(),
      applicationsCount: 0,
      selectedStudents: 0,
      startDate: '',
      endDate: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [project, ...prev]);
    setShowAddDialog(false);
    setNewProject({
      title: '',
      description: '',
      requirements: [],
      duration: '',
      studentsNeeded: 1,
      status: 'draft',
    });
  };

  const handleEditProject = () => {
    if (selectedProject) {
      setProjects(prev =>
        prev.map(project =>
          project.id === selectedProject.id ? selectedProject : project
        )
      );
      setShowEditDialog(false);
      setSelectedProject(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    setAnchorEl(null);
    setSelectedProjectForMenu(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectForMenu(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectForMenu(null);
  };

  const filteredProjects = projects.filter(project => {
    switch (selectedTab) {
      case 0: // Todos
        return true;
      case 1: // Borradores
        return project.status === 'draft';
      case 2: // Publicados
        return project.status === 'published';
      case 3: // Activos
        return project.status === 'active';
      case 4: // Completados
        return project.status === 'completed';
      default:
        return true;
    }
  });

  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    published: projects.filter(p => p.status === 'published').length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mis Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'default.light', color: 'default.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.draft}</Typography>
                  <Typography variant="body2">Borradores</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.published}</Typography>
                  <Typography variant="body2">Publicados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.completed}</Typography>
                  <Typography variant="body2">Completados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label={`Todos (${stats.total})`} />
          <Tab label={`Borradores (${stats.draft})`} />
          <Tab label={`Publicados (${stats.published})`} />
          <Tab label={`Activos (${stats.active})`} />
          <Tab label={`Completados (${stats.completed})`} />
        </Tabs>
      </Box>

      {/* Lista de Proyectos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredProjects.map((project) => (
          <Box key={project.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, project)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                  <Chip
                    label={`${project.applicationsCount} postulaciones`}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {project.selectedStudents}/{project.studentsNeeded} estudiantes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {project.duration}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => {
                  setSelectedProject(project);
                  setShowEditDialog(true);
                }}>
                  Editar
                </Button>
                <Button size="small" color="primary">
                  Ver Detalles
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Menu para acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProjectForMenu) {
            setSelectedProject(selectedProjectForMenu);
            setShowEditDialog(true);
          }
          handleMenuClose();
        }}>
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedProjectForMenu) {
            handleDeleteProject(selectedProjectForMenu.id);
          }
        }}>
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para agregar proyecto */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título del Proyecto"
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Duración"
              value={newProject.duration}
              onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Estudiantes Necesarios"
              value={newProject.studentsNeeded}
              onChange={(e) => setNewProject(prev => ({ ...prev, studentsNeeded: parseInt(e.target.value) }))}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddProject} variant="contained">
            Crear Proyecto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar proyecto */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Proyecto</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Título del Proyecto"
                value={selectedProject.title}
                onChange={(e) => setSelectedProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Duración"
                value={selectedProject.duration}
                onChange={(e) => setSelectedProject(prev => prev ? { ...prev, duration: e.target.value } : null)}
                margin="normal"
              />
              <TextField
                fullWidth
                type="number"
                label="Estudiantes Necesarios"
                value={selectedProject.studentsNeeded}
                onChange={(e) => setSelectedProject(prev => prev ? { ...prev, studentsNeeded: parseInt(e.target.value) } : null)}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción"
                value={selectedProject.description}
                onChange={(e) => setSelectedProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditProject} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyProjects;
