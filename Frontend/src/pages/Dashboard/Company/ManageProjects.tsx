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
  AddCircle as AddCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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
  trlAnswers?: string[];
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
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Diseño',
  'Administración',
  'Marketing',
  'Otra',
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
  trlAnswers?: string[];
}

export const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const theme = useTheme();
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

  const handleTrlChange = (trlValue: string) => {
    setNewProject({ ...newProject, trl: trlValue });
    setTrlAnswers(Array(trlQuestions[trlValue]?.length || 0).fill(''));
  };

  const validate = () => {
    const errs: any = {};
    if (!newProject.title) errs.title = 'Requerido';
    if (!newProject.areas.length) errs.areas = 'Requerido';
    if (!newProject.description) errs.description = 'Requerido';
    if (!newProject.duration) errs.duration = 'Requerido';
    if (!newProject.trl) errs.trl = 'Requerido';
    if (!newProject.modality) errs.modality = 'Requerido';
    if (newProject.trl && trlQuestions[newProject.trl]) {
      trlQuestions[newProject.trl].forEach((_, idx) => {
        if (!trlAnswers[idx] || !trlAnswers[idx].trim()) {
          errs[`trlAnswer${idx}`] = 'Requerido';
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFaq([...faq, newFaq]);
      setNewFaq({ question: '', answer: '' });
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!validate()) return;
    // Aquí iría la lógica para guardar el proyecto, incluyendo FAQ y respuestas TRL
    const newId = (projects.length + 1).toString();
    const now = new Date();
    const newProj: Project = {
      id: newId,
      title: newProject.title,
      description: newProject.description,
      status: 'draft',
      difficulty: 'beginner', // Por defecto, puedes ajustar esto si lo deseas
      apiLevel: Number(newProject.trl) || 1,
      maxStudents: 1, // Por defecto, puedes ajustar esto si lo deseas
      currentStudents: 0,
      applications: 0,
      deadline: '',
      createdAt: now.toISOString().split('T')[0],
      skills: newProject.skills,
      trlAnswers: trlAnswers,
    };
    setProjects(prev => [...prev, newProj]);
    setShowNewProject(false);
    setNewProject({ title: '', areas: [], description: '', duration: '', trl: '', skills: [], modality: '' });
    setTrlAnswers([]);
    setErrors({});
    setFaq([]);
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

      {/* Botón para publicar nuevo proyecto */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddCircleIcon />}
          sx={{ borderRadius: 3, fontWeight: 600, fontSize: 18, px: 4, py: 2, boxShadow: 2 }}
          onClick={() => setShowNewProject(true)}
        >
          Publicar Nuevo Proyecto
        </Button>
      </Box>

      {/* Modal para nuevo proyecto */}
      <Dialog open={showNewProject} onClose={() => setShowNewProject(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>Publicar Nuevo Proyecto</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Nombre del Proyecto"
              value={newProject.title}
              onChange={e => setNewProject({ ...newProject, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
            />
            <FormControl fullWidth error={!!errors.areas}>
              <InputLabel>Área de estudiantes requerida</InputLabel>
              <Select
                multiple
                value={newProject.areas}
                onChange={e => setNewProject({ ...newProject, areas: e.target.value as string[] })}
                label="Área de estudiantes requerida"
              >
                {studentAreas.map(area => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
              {errors.areas && <Typography color="error" variant="caption">{errors.areas}</Typography>}
            </FormControl>
            <TextField
              label="Descripción del Proyecto"
              value={newProject.description}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              label="Duración (semanas)"
              type="number"
              value={newProject.duration}
              onChange={e => setNewProject({ ...newProject, duration: e.target.value })}
              error={!!errors.duration}
              helperText={errors.duration}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>Nivel TRL del Proyecto</Typography>
                <IconButton size="small" onClick={() => setShowTrlHelp(true)}><InfoIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {trlOptions.map(opt => (
                  <Button
                    key={opt.value}
                    variant={newProject.trl === String(opt.value) ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleTrlChange(String(opt.value))}
                    sx={{ minWidth: 90 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Box>
              {errors.trl && <Typography color="error" variant="caption">{errors.trl}</Typography>}
            </Box>
            {newProject.trl && trlQuestions[newProject.trl] && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Preguntas para evaluar el estado actual del proyecto (TRL {newProject.trl})
                </Typography>
                {trlQuestions[newProject.trl].map((q, idx) => (
                  <TextField
                    key={idx}
                    label={q}
                    value={trlAnswers[idx] || ''}
                    onChange={e => {
                      const updated = [...trlAnswers];
                      updated[idx] = e.target.value;
                      setTrlAnswers(updated);
                    }}
                    error={!!errors[`trlAnswer${idx}`]}
                    helperText={errors[`trlAnswer${idx}`]}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Box>
            )}
            <FormControl fullWidth>
              <InputLabel>Modalidad</InputLabel>
              <Select
                value={newProject.modality}
                onChange={e => setNewProject({ ...newProject, modality: e.target.value })}
                label="Modalidad"
                error={!!errors.modality}
              >
                <MenuItem value="">Selecciona una opción</MenuItem>
                <MenuItem value="Remoto">Remoto</MenuItem>
                <MenuItem value="Presencial">Presencial</MenuItem>
                <MenuItem value="Híbrido">Híbrido</MenuItem>
              </Select>
              {errors.modality && <Typography color="error" variant="caption">{errors.modality}</Typography>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Habilidades requeridas</InputLabel>
              <Select
                multiple
                value={newProject.skills}
                onChange={e => setNewProject({ ...newProject, skills: e.target.value as string[] })}
                label="Habilidades requeridas"
              >
                {skillsList.map(skill => (
                  <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="h6" gutterBottom>Preguntas Frecuentes (FAQ) para el Proyecto</Typography>
              {faq.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {faq.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">Q: {item.question}</Typography>
                        <Typography variant="body2" color="text.secondary">A: {item.answer}</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemoveFaq(idx)}><DeleteIcon /></IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Pregunta"
                  value={newFaq.question}
                  onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                  size="small"
                  sx={{ flex: 1, minWidth: 180 }}
                />
                <TextField
                  label="Respuesta"
                  value={newFaq.answer}
                  onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                  size="small"
                  sx={{ flex: 2, minWidth: 220 }}
                />
                <Button variant="outlined" onClick={handleAddFaq} sx={{ height: 40, alignSelf: 'center' }}>Agregar</Button>
              </Box>
              <Typography variant="caption" color="text.secondary">Puedes agregar preguntas y respuestas que los estudiantes verán al postularse.</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowNewProject(false)} variant="outlined">Cancelar</Button>
          <Button onClick={handlePublish} variant="contained" color="primary">Publicar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de ayuda TRL */}
      <Dialog open={showTrlHelp} onClose={() => setShowTrlHelp(false)} maxWidth="sm">
        <DialogTitle>¿Qué es el TRL?</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} align="center" gutterBottom>
              Adaptación simple TRLs para diagnóstico al ingreso y egreso/cierre de proyectos.
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              No aplica para actividades formativas o curriculares
            </Typography>
            <Box component="table" sx={{ width: '100%', border: '1px solid #ccc', borderRadius: 2, mt: 2 }}>
              <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
                <Box component="tr">
                  <Box component="th" sx={{ p: 1, fontWeight: 700, border: '1px solid #ccc' }}>TRL</Box>
                  <Box component="th" sx={{ p: 1, fontWeight: 700, border: '1px solid #ccc' }}>Descripción</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {trlOptions.map(opt => (
                  <Box component="tr" key={opt.value}>
                    <Box component="td" sx={{ p: 1, border: '1px solid #ccc', fontWeight: 600 }}>{opt.label}</Box>
                    <Box component="td" sx={{ p: 1, border: '1px solid #ccc' }}>{opt.desc}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTrlHelp(false)} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProjects;
