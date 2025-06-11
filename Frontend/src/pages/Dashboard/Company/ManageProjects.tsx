import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  apiLevel: number;
  maxStudents: number;
  currentStudents: number;
  applications: number;
  deadline: string;
  createdAt: string;
  skills: string[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Desarrollo Web Frontend',
    description: 'Crear una aplicación web moderna con React y TypeScript',
    status: 'published',
    difficulty: 'intermediate',
    apiLevel: 3,
    maxStudents: 2,
    currentStudents: 1,
    applications: 5,
    deadline: '2024-03-15',
    createdAt: '2024-01-10',
    skills: ['React', 'TypeScript', 'Material-UI'],
  },
  {
    id: '2',
    title: 'API REST con Django',
    description: 'Desarrollar una API REST completa para sistema de inventario',
    status: 'in-progress',
    difficulty: 'advanced',
    apiLevel: 4,
    maxStudents: 1,
    currentStudents: 1,
    applications: 3,
    deadline: '2024-02-28',
    createdAt: '2024-01-05',
    skills: ['Python', 'Django', 'PostgreSQL'],
  },
  {
    id: '3',
    title: 'App Móvil React Native',
    description: 'Aplicación móvil para gestión de tareas',
    status: 'draft',
    difficulty: 'beginner',
    apiLevel: 2,
    maxStudents: 3,
    currentStudents: 0,
    applications: 0,
    deadline: '2024-04-01',
    createdAt: '2024-01-15',
    skills: ['React Native', 'JavaScript', 'Firebase'],
  },
  {
    id: '4',
    title: 'Sistema de Machine Learning',
    description: 'Implementar algoritmos de ML para análisis de datos',
    status: 'completed',
    difficulty: 'advanced',
    apiLevel: 5,
    maxStudents: 1,
    currentStudents: 1,
    applications: 8,
    deadline: '2024-01-20',
    createdAt: '2023-12-01',
    skills: ['Python', 'TensorFlow', 'Pandas'],
  },
];

export const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingProject) {
      setProjects(prev =>
        prev.map(project =>
          project.id === editingProject.id ? editingProject : project
        )
      );
      setShowEditDialog(false);
      setEditingProject(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    switch (selectedTab) {
      case 0: // Todos
        return true;
      case 1: // Publicados
        return project.status === 'published';
      case 2: // En Progreso
        return project.status === 'in-progress';
      case 3: // Completados
        return project.status === 'completed';
      case 4: // Borradores
        return project.status === 'draft';
      default:
        return true;
    }
  });

  const stats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Proyectos
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' } }}>
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
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' } }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.published}</Typography>
                  <Typography variant="body2">Publicados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' } }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.inProgress}</Typography>
                  <Typography variant="body2">En Progreso</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' } }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.completed}</Typography>
                  <Typography variant="body2">Completados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' } }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.draft}</Typography>
                  <Typography variant="body2">Borradores</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Todos" />
          <Tab label="Publicados" />
          <Tab label="En Progreso" />
          <Tab label="Completados" />
          <Tab label="Borradores" />
        </Tabs>
      </Paper>

      {/* Lista de Proyectos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredProjects.map((project) => (
          <Box key={project.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                      <Chip
                        label={project.difficulty}
                        color={getDifficultyColor(project.difficulty) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(project)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(project.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {project.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" variant="outlined" />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {project.currentStudents}/{project.maxStudents} estudiantes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.applications} postulaciones
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    API Level {project.apiLevel}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<ViewIcon />}>
                  Ver Detalles
                </Button>
                <Button size="small" color="primary">
                  Gestionar
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog para editar proyecto */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Proyecto</DialogTitle>
        <DialogContent>
          {editingProject && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <TextField
                  fullWidth
                  label="Título"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={editingProject.status}
                    label="Estado"
                    onChange={(e) => setEditingProject(prev => prev ? { ...prev, status: e.target.value as Project['status'] } : null)}
                  >
                    <MenuItem value="draft">Borrador</MenuItem>
                    <MenuItem value="published">Publicado</MenuItem>
                    <MenuItem value="in-progress">En Progreso</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="API Level"
                  value={editingProject.apiLevel}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, apiLevel: parseInt(e.target.value) } : null)}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Máximo de Estudiantes"
                  value={editingProject.maxStudents}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, maxStudents: parseInt(e.target.value) } : null)}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                  margin="normal"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProjects;
