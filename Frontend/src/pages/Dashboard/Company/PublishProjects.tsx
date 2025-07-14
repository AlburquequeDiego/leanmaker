import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptProjectList } from '../../../utils/adapters';
import type { Project } from '../../../types';
import { projectService } from '../../../services/project.service';

const availableSkills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
  'HTML', 'CSS', 'Sass', 'Bootstrap', 'Material-UI', 'Tailwind CSS',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
  'Git', 'GitHub', 'GitLab', 'CI/CD', 'REST API', 'GraphQL',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Mobile Development',
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const PublishProjects: React.FC = () => {
  const api = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    requirements: [],
    skills: [],
    duration: '',
    difficulty: 'intermediate',
    apiLevel: 1,
    maxStudents: 1,
    deadline: '',
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updatingProject, setUpdatingProject] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/projects/my_projects/');
      const adaptedProjects = adaptProjectList(response.data.data || response.data);
      setProjects(adaptedProjects);
      
    } catch (err: any) {
      console.error('Error cargando proyectos:', err);
      setError(err.response?.data?.error || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setCurrentProject(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setCurrentProject(prev => ({ ...prev, skills: value }));
  };

  const handleRequirementsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setCurrentProject(prev => ({ ...prev, requirements: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentProject.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!currentProject.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!currentProject.duration?.trim()) {
      newErrors.duration = 'La duración es requerida';
    }
    if (!currentProject.deadline) {
      newErrors.deadline = 'La fecha límite es requerida';
    }
    if (currentProject.skills?.length === 0) {
      newErrors.skills = 'Seleccione al menos una habilidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setUpdatingProject('new');
      // Usar el servicio adaptado para crear el proyecto
      const newProject = await projectService.createProject(currentProject);
      setProjects(prev => [newProject, ...prev]);
      setShowDialog(false);
      setCurrentProject({
        title: '',
        description: '',
        requirements: [],
        skills: [],
        duration: '',
        difficulty: 'intermediate',
        apiLevel: 1,
        maxStudents: 1,
        deadline: '',
        status: 'draft',
      });
      setErrors({});
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.error || 'Error al crear proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handlePublish = async (projectId: string) => {
    try {
      setUpdatingProject(projectId);
      const response = await api.patch(`/api/projects/${projectId}/`, {
        status: 'published'
      });
      
      const updatedProject = response.data;
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? { ...project, status: updatedProject.status } : project
        )
      );
    } catch (error: any) {
      console.error('Error publishing project:', error);
      setError(error.response?.data?.error || 'Error al publicar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      setUpdatingProject(projectId);
      await api.delete(`/api/projects/${projectId}/`);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.response?.data?.error || 'Error al eliminar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'open':
        return 'success';
      case 'in-progress':
      case 'active':
        return 'info';
      case 'completed':
        return 'primary';
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Publicar Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {projects.length === 0 ? (
          <Box sx={{ flex: '1 1 100%', textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No hay proyectos para mostrar.
            </Typography>
          </Box>
        ) : (
          projects.map((project) => (
            <Box key={project.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {project.title}
                    </Typography>
                    <Box>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={project.difficulty}
                      color={getDifficultyColor(project.difficulty) as any}
                      size="small"
                    />
                    <Chip
                      label={`API ${project.min_api_level}`}
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`${project.duration_weeks} semanas`}
                      color="secondary"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AssignmentIcon fontSize="small" />
                      <Typography variant="body2">
                        {project.current_students}/{project.max_students} estudiantes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">
                        {project.applications_count || 0} aplicaciones
                      </Typography>
                    </Box>
                  </Box>

                  {project.start_date && (
                    <Typography variant="caption" color="text.secondary">
                      Inicio: {new Date(project.start_date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {(project.status === 'draft' || project.status === 'active') && (
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handlePublish(project.id)}
                      disabled={updatingProject === project.id}
                    >
                      {updatingProject === project.id ? <CircularProgress size={16} /> : 'Publicar'}
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project.id)}
                    disabled={updatingProject === project.id}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : 'Eliminar'}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))
        )}
      </Box>

      {/* Dialog para nuevo proyecto */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Título del Proyecto"
                value={currentProject.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={currentProject.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Duración (semanas)"
                type="number"
                value={currentProject.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                error={!!errors.duration}
                helperText={errors.duration}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Fecha Límite"
                type="date"
                value={currentProject.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                error={!!errors.deadline}
                helperText={errors.deadline}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Dificultad</InputLabel>
                <Select
                  value={currentProject.difficulty}
                  label="Dificultad"
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <MenuItem value="beginner">Principiante</MenuItem>
                  <MenuItem value="intermediate">Intermedio</MenuItem>
                  <MenuItem value="advanced">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nivel API"
                type="number"
                value={currentProject.apiLevel}
                onChange={(e) => handleInputChange('apiLevel', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1, max: 4 }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Máximo de Estudiantes"
                type="number"
                value={currentProject.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Habilidades Requeridas</InputLabel>
                <Select
                  multiple
                  value={currentProject.skills || []}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Habilidades Requeridas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  error={!!errors.skills}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
                {errors.skills && <FormHelperText error>{errors.skills}</FormHelperText>}
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={updatingProject === 'new'}
          >
            {updatingProject === 'new' ? <CircularProgress size={20} /> : 'Guardar Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishProjects;
