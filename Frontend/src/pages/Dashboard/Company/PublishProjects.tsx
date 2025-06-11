import React, { useState } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  apiLevel: number;
  maxStudents: number;
  deadline: string;
  status: 'draft' | 'published' | 'in-progress' | 'completed';
  createdAt: string;
}

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
  const [projects, setProjects] = useState<Project[]>([]);
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

  const handleSave = () => {
    if (!validateForm()) return;

    const newProject: Project = {
      ...currentProject as Project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

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
  };

  const handlePublish = (projectId: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId ? { ...project, status: 'published' } : project
      )
    );
  };

  const handleDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'in-progress':
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
          Crear Nuevo Proyecto
        </Button>
      </Box>

      {/* Proyectos existentes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {projects.map((project) => (
          <Box key={project.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {project.title}
                  </Typography>
                  <Chip
                    label={project.status}
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description.substring(0, 100)}...
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={project.difficulty}
                    color={getDifficultyColor(project.difficulty) as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`API ${project.apiLevel}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${project.maxStudents} estudiante${project.maxStudents > 1 ? 's' : ''}`}
                    color="secondary"
                    size="small"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Duración: {project.duration}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Fecha límite: {new Date(project.deadline).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                {project.status === 'draft' && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handlePublish(project.id)}
                  >
                    Publicar
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(project.id)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {projects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay proyectos creados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer proyecto para empezar a recibir postulaciones de estudiantes
          </Typography>
        </Paper>
      )}

      {/* Dialog para crear/editar proyecto */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
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
                rows={4}
                label="Descripción del Proyecto"
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
                label="Duración Estimada"
                value={currentProject.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="Ej: 3 meses, 6 semanas"
                error={!!errors.duration}
                helperText={errors.duration}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha Límite"
                value={currentProject.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.deadline}
                helperText={errors.deadline}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Nivel de Dificultad</InputLabel>
                <Select
                  value={currentProject.difficulty}
                  label="Nivel de Dificultad"
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
                type="number"
                label="Nivel API Requerido"
                value={currentProject.apiLevel}
                onChange={(e) => handleInputChange('apiLevel', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 5 }}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                type="number"
                label="Máximo de Estudiantes"
                value={currentProject.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControl fullWidth margin="normal" error={!!errors.skills}>
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
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
                {errors.skills && <FormHelperText>{errors.skills}</FormHelperText>}
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Requisitos Adicionales</InputLabel>
                <Select
                  multiple
                  value={currentProject.requirements || []}
                  onChange={handleRequirementsChange}
                  input={<OutlinedInput label="Requisitos Adicionales" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  <MenuItem value="portfolio">Portfolio requerido</MenuItem>
                  <MenuItem value="github">GitHub activo</MenuItem>
                  <MenuItem value="experience">Experiencia previa</MenuItem>
                  <MenuItem value="certification">Certificaciones</MenuItem>
                  <MenuItem value="interview">Entrevista obligatoria</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} startIcon={<ClearIcon />}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Guardar Proyecto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishProjects;
