import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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
  AddCircle as AddCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptProjectList } from '../../../utils/adapters';
import type { Project } from '../../../types';

// TRL options
const trlOptions = [
  { value: 1, label: 'TRL 1', desc: 'Fase de idea, sin definición clara ni desarrollo previo.' },
  { value: 2, label: 'TRL 2', desc: 'Definición clara y antecedentes de lo que se desea desarrollar.' },
  { value: 3, label: 'TRL 3', desc: 'Pruebas y validaciones de concepto. Componentes evaluados por separado.' },
  { value: 4, label: 'TRL 4', desc: 'Prototipo mínimo viable probado en condiciones controladas simples.' },
  { value: 5, label: 'TRL 5', desc: 'Prototipo mínimo viable probado en condiciones similares al entorno real.' },
  { value: 6, label: 'TRL 6', desc: 'Prototipo probado mediante un piloto en condiciones reales.' },
  { value: 7, label: 'TRL 7', desc: 'Desarrollo probado en condiciones reales, por un periodo prolongado.' },
  { value: 8, label: 'TRL 8', desc: 'Producto validado en lo técnico y lo comercial.' },
  { value: 9, label: 'TRL 9', desc: 'Producto completamente desarrollado y disponible para la sociedad.' },
];

const studentAreas = [
  'Tecnología y Sistemas',
  'Administración y Gestión',
  'Comunicación y Marketing',
  'Salud y Ciencias',
  'Ingeniería y Construcción',
  'Educación y Formación',
  'Arte y Diseño',
  'Investigación y Desarrollo',
  'Servicios y Atención al Cliente',
  'Sostenibilidad y Medio Ambiente',
];

const skillsList = [
  'React', 'Node.js', 'Python', 'Django', 'SQL', 'Figma', 'Comunicación', 'Trabajo en equipo',
];

// Preguntas TRL por nivel
const trlQuestions: { [key: string]: string[] } = {
  '1': [
    '¿Existe una idea clara del proyecto?',
    '¿Se ha identificado una necesidad o problema a resolver?',
  ],
  '2': [
    '¿Se ha definido claramente el objetivo del proyecto?',
    '¿Existen antecedentes o referencias previas?',
  ],
  '3': [
    '¿Se han realizado pruebas de concepto?',
    '¿Se han evaluado componentes por separado?',
  ],
  '4': [
    '¿Existe un prototipo mínimo viable?',
    '¿Se ha probado el prototipo en condiciones controladas?',
  ],
  '5': [
    '¿El prototipo ha sido probado en condiciones similares al entorno real?',
    '¿Se han documentado los resultados de estas pruebas?',
  ],
  '6': [
    '¿Se ha realizado un piloto en condiciones reales?',
    '¿El prototipo ha sido validado por usuarios reales?',
  ],
  '7': [
    '¿El desarrollo ha sido probado en condiciones reales por un periodo prolongado?',
    '¿Se han identificado mejoras tras el uso prolongado?',
  ],
  '8': [
    '¿El producto está validado técnica y comercialmente?',
    '¿Existen clientes o usuarios que lo utilicen?',
  ],
  '9': [
    '¿El producto está completamente desarrollado?',
    '¿Está disponible para la sociedad?',
  ],
};

// Definir el tipo para el nuevo proyecto
interface NewProject {
  title: string;
  areas: string[];
  description: string;
  duration: string;
  trl: string;
  skills: string[];
  modality: string;
  trl_answers?: string[];
}

export const ManageProjects: React.FC = () => {
  const api = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    areas: [],
    description: '',
    duration: '',
    trl: '',
    skills: [],
    modality: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [showTrlHelp, setShowTrlHelp] = useState(false);
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [trlAnswers, setTrlAnswers] = useState<string[]>([]);
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

  const handleEdit = (project: Project) => {
    // Implementar edición de proyecto
    console.log('Edit project:', project);
  };

  const handleTrlChange = (trlValue: string) => {
    setNewProject(prev => ({ ...prev, trl: trlValue }));
    setTrlAnswers(new Array(trlQuestions[trlValue]?.length || 0).fill(''));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!newProject.title) newErrors.title = 'Título requerido';
    if (!newProject.description) newErrors.description = 'Descripción requerida';
    if (!newProject.duration) newErrors.duration = 'Duración requerida';
    if (!newProject.trl) newErrors.trl = 'TRL requerido';
    if (newProject.skills.length === 0) newErrors.skills = 'Habilidades requeridas';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFaq = () => {
    if (newFaq.question && newFaq.answer) {
      setFaq(prev => [...prev, newFaq]);
      setNewFaq({ question: '', answer: '' });
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFaq(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!validate()) return;
    
    try {
      setUpdatingProject('new');
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        requirements: newProject.skills.join(', '),
        duration_weeks: parseInt(newProject.duration),
        difficulty: 'intermediate',
        modality: newProject.modality || 'remote',
        min_api_level: 1,
        max_students: 1,
        hours_per_week: 20,
        trl: parseInt(newProject.trl),
        area_id: Array.isArray(newProject.areas) && newProject.areas.length > 0 ? newProject.areas[0] : undefined,
      };

      const response = await api.post('/api/projects/', projectData);
      const newProjectData = response.data;
      setProjects(prev => [newProjectData, ...prev]);
      setShowNewProject(false);
      setNewProject({
        title: '',
        areas: [],
        description: '',
        duration: '',
        trl: '',
        skills: [],
        modality: '',
      });
      setErrors({});
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.error || 'Error al crear proyecto');
    } finally {
      setUpdatingProject(null);
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

  const filteredProjects = projects.filter(project => {
    switch (selectedTab) {
      case 0: return true; // Todos
      case 1: return project.status === 'published' || project.status === 'open';
      case 2: return project.status === 'active' || project.status === 'in-progress';
      case 3: return project.status === 'completed';
      default: return true;
    }
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>
          Gestionar Proyectos
      </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setShowNewProject(true)}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Todos" />
          <Tab label="Publicados" />
          <Tab label="En Progreso" />
          <Tab label="Completados" />
        </Tabs>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredProjects.length === 0 ? (
          <Box sx={{ flex: '1 1 100%', textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No hay proyectos para mostrar.
            </Typography>
          </Box>
        ) : (
          filteredProjects.map((project) => (
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
                      label={project.difficulty || 'intermediate'}
                      color={getDifficultyColor(project.difficulty || 'intermediate') as any}
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
                      <PeopleIcon fontSize="small" />
                      <Typography variant="body2">
                        {project.current_students}/{project.max_students}
                    </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AssignmentIcon fontSize="small" />
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
                  <IconButton size="small" onClick={() => handleEdit(project)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(project.id)}
                    disabled={updatingProject === project.id}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                  </IconButton>
              </CardActions>
            </Card>
          </Box>
          ))
        )}
      </Box>

      {/* Dialog para nuevo proyecto */}
      <Dialog open={showNewProject} onClose={() => setShowNewProject(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
            <TextField
                fullWidth
                label="Título del Proyecto"
              value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
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
              value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
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
              value={newProject.duration}
                onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
              error={!!errors.duration}
              helperText={errors.duration}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>TRL</InputLabel>
              <Select
                  value={newProject.trl}
                  label="TRL"
                  onChange={(e) => handleTrlChange(e.target.value)}
                  error={!!errors.trl}
              >
                  {trlOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Habilidades Requeridas</InputLabel>
              <Select
                multiple
                value={newProject.skills}
                  label="Habilidades Requeridas"
                  onChange={(e) => setNewProject(prev => ({ ...prev, skills: e.target.value as string[] }))}
                  error={!!errors.skills}
              >
                  {skillsList.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewProject(false)}>Cancelar</Button>
          <Button 
            onClick={handlePublish} 
            variant="contained"
            disabled={updatingProject === 'new'}
          >
            {updatingProject === 'new' ? <CircularProgress size={20} /> : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProjects;
