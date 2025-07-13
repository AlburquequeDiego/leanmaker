import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Rating,
  Slider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptProjectList, adaptEvaluation } from '../../../utils/adapters';
import type { Project, Evaluation } from '../../../types';

// Opciones para fortalezas y áreas de mejora
const strengthsOptions = [
  'Trabajo en equipo', 'Comunicación', 'Liderazgo', 'Resolución de problemas',
  'Creatividad', 'Organización', 'Adaptabilidad', 'Iniciativa'
];

const improvementAreas = [
  'Gestión del tiempo', 'Comunicación escrita', 'Presentaciones', 'Análisis de datos',
  'Programación', 'Diseño', 'Investigación', 'Documentación'
];

interface EvaluationFormState {
  score: number;
  comments: string;
  strengths: string[];
  improvement_areas: string[];
}

export const CompanyEvaluations: React.FC = () => {
  const api = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [evaluationForm, setEvaluationForm] = useState<EvaluationFormState>({
    score: 0,
    comments: '',
    strengths: [],
    improvement_areas: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[Evaluations] Loading data...');
      setLoading(true);
      setError(null);
      
      // Obtener proyectos
      const projectsResponse = await api.get('/api/projects/');
      const adaptedProjects = adaptProjectList(projectsResponse.data || projectsResponse.results || projectsResponse);
      console.log(`[Evaluations] Loaded ${adaptedProjects.length} projects`);
      setProjects(adaptedProjects);

      // Obtener evaluaciones
      const evaluationsResponse = await api.get('/api/evaluations/');
      const evaluationsData = evaluationsResponse.data || evaluationsResponse.results || evaluationsResponse;
      const adaptedEvaluations = Array.isArray(evaluationsData) ? evaluationsData.map(adaptEvaluation) : [];
      console.log(`[Evaluations] Loaded ${adaptedEvaluations.length} evaluations`);
      setEvaluations(adaptedEvaluations);

      // Obtener usuarios (solo estudiantes)
      try {
        const usersResponse = await api.get('/api/users/');
        const usersData = usersResponse.data || usersResponse.results || usersResponse;
        const studentUsers = Array.isArray(usersData) ? usersData.filter((user: any) => user.role === 'student') : [];
        console.log(`[Evaluations] Loaded ${studentUsers.length} students`);
        setUsers(studentUsers);
      } catch (error) {
        console.warn('[Evaluations] Could not load users, using empty list');
        setUsers([]);
      }
      
    } catch (err: any) {
      console.error('[Evaluations] Error loading data:', err);
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      console.log('[Evaluations] Data loading completed');
      setLoading(false);
    }
  };

  // Filtrar proyectos por estado
  const activos = projects.filter(project => ['active', 'open', 'published', 'en progreso', 'abierto', 'publicado', 'draft'].includes(project.status.toLowerCase()));
  const completados = projects.filter(project => ['completed', 'completado'].includes(project.status.toLowerCase()));
  const cancelados = projects.filter(project => ['cancelled', 'cancelado'].includes(project.status.toLowerCase()));
  


  // Verificar si un estudiante ya fue evaluado en un proyecto
  const isStudentEvaluated = (studentId: string, projectId: string) => {
    return evaluations.some(evaluation =>
      evaluation.student === studentId && evaluation.project === projectId
    );
  };

  // Obtener evaluación existente
  const getExistingEvaluation = (studentId: string, projectId: string) => {
    return evaluations.find(evaluation =>
      evaluation.student === studentId && evaluation.project === projectId
    );
  };

  const handleOpenEvaluar = (student: any, project: Project) => {
    setSelectedStudent(student);
    setSelectedProject(project);
    
    // Cargar evaluación existente si existe
    const existingEvaluation = getExistingEvaluation(student.id, project.id);
    if (existingEvaluation) {
      setEvaluationForm({
        score: existingEvaluation.score,
        comments: existingEvaluation.comments || '',
        strengths: [],
        improvement_areas: [],
      });
    } else {
      setEvaluationForm({
        score: 0,
        comments: '',
        strengths: [],
        improvement_areas: [],
      });
    }
    
    setModalOpen(true);
  };

  const handleOpenDetalle = (student: any, project: Project) => {
    setSelectedStudent(student);
    setSelectedProject(project);
    setModalDetalleOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedStudent || !selectedProject) return;

    try {
      console.log('[Evaluations] Saving evaluation for student:', selectedStudent.id, 'project:', selectedProject.id);
      const evaluationData = {
        project: selectedProject.id,
        student: selectedStudent.id,
        score: evaluationForm.score,
        comments: evaluationForm.comments,
        category: 'general', // Categoría por defecto
      };

      const existingEvaluation = getExistingEvaluation(selectedStudent.id, selectedProject.id);
      
      if (existingEvaluation) {
        // Actualizar evaluación existente
        const response = await api.patch(`/api/evaluations/${existingEvaluation.id}/`, evaluationData);
        const updatedEvaluation = adaptEvaluation(response);
                 setEvaluations(prev =>
           prev.map(evaluation => evaluation.id === existingEvaluation.id ? updatedEvaluation : evaluation)
         );
      } else {
        // Crear nueva evaluación
        const response = await api.post('/api/evaluations/', evaluationData);
        const newEvaluation = adaptEvaluation(response);
        setEvaluations(prev => [...prev, newEvaluation]);
      }

      console.log('[Evaluations] Evaluation saved successfully');
      setModalOpen(false);
      setSelectedStudent(null);
      setSelectedProject(null);
      setEvaluationForm({
        score: 0,
        comments: '',
        strengths: [],
        improvement_areas: [],
      });
    } catch (error: any) {
      console.error('[Evaluations] Error saving evaluation:', error);
      setError(error.response?.data?.error || 'Error al guardar evaluación');
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) return;

    try {
      await api.delete(`/api/evaluations/${evaluationId}/`);
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    } catch (error: any) {
      console.error('Error eliminando evaluación:', error);
      setError(error.response?.data?.error || 'Error al eliminar evaluación');
    }
  };

  const getProjectStudents = (projectId: string) => {
    // En un caso real, esto vendría del backend
    // Por ahora, simulamos estudiantes si no hay usuarios cargados
    if (users.length === 0) {
      return [
        {
          id: '1',
          first_name: 'Estudiante',
          last_name: 'Ejemplo 1',
          email: 'estudiante1@example.com',
          role: 'student'
        },
        {
          id: '2',
          first_name: 'Estudiante',
          last_name: 'Ejemplo 2',
          email: 'estudiante2@example.com',
          role: 'student'
        }
      ];
    }
    return users.filter(user => user.role === 'student').slice(0, 3);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'open':
        return 'primary';
      case 'published':
        return 'info';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'En Progreso';
      case 'open':
        return 'Abierto';
      case 'published':
        return 'Publicado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'draft':
        return 'Borrador';
      default:
        return status;
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
        <Button onClick={loadData} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Evaluaciones de Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Evalúa el desempeño de los estudiantes en tus proyectos
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        {['Activos', 'Completados', 'Cancelados', 'Borradores'].map((tab, index) => (
          <Button
            key={index}
            variant={selectedTab === index ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab(index)}
            sx={{ minWidth: 120 }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Lista de Proyectos */}
      <Box>
        {(() => {
          const currentProjects = selectedTab === 0 ? activos : selectedTab === 1 ? completados : selectedTab === 2 ? cancelados : projects.filter(project => project.status === 'draft');
          
          return currentProjects.map((project) => (
            <Paper key={project.id} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                    <Chip
                      label={`${project.current_students}/${project.max_students} estudiantes`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Estudiantes del proyecto */}
              <Typography variant="h6" gutterBottom>
                Estudiantes Participantes
              </Typography>
              <Grid container spacing={2}>
                {getProjectStudents(project.id).map((student) => {
                  const isEvaluated = isStudentEvaluated(student.id, project.id);
                  const existingEvaluation = getExistingEvaluation(student.id, project.id);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={student.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">
                              {student.first_name} {student.last_name}
                            </Typography>
                            <Chip
                              label={isEvaluated ? 'Evaluado' : 'Pendiente'}
                              color={isEvaluated ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {student.email}
                          </Typography>
                          
                          {existingEvaluation && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating value={existingEvaluation.score} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {existingEvaluation.score}/5
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              variant={isEvaluated ? 'outlined' : 'contained'}
                              onClick={() => handleOpenEvaluar(student, project)}
                              startIcon={isEvaluated ? <EditIcon /> : <RateReviewIcon />}
                            >
                              {isEvaluated ? 'Reevaluar' : 'Evaluar'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenDetalle(student, project)}
                              startIcon={<VisibilityIcon />}
                            >
                              Ver
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          ));
        })()}
        
        {(() => {
          const currentProjects = selectedTab === 0 ? activos : selectedTab === 1 ? completados : cancelados;
          if (currentProjects.length === 0) {
            return (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No hay proyectos en esta categoría
                </Typography>
              </Box>
            );
          }
        })()}
      </Box>

      {/* Modal de Evaluación */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent && selectedProject ? 
            `Evaluar a ${selectedStudent.first_name} ${selectedStudent.last_name} en ${selectedProject.title}` :
            'Evaluar Estudiante'
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calificación General
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Rating
                value={evaluationForm.score}
                onChange={(_, value) => setEvaluationForm(prev => ({ ...prev, score: value || 0 }))}
                size="large"
              />
              <Typography variant="h6" sx={{ ml: 2 }}>
                {evaluationForm.score}/5
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Comentarios"
              value={evaluationForm.comments}
              onChange={(e) => setEvaluationForm(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEvaluation}
            variant="contained"
            disabled={evaluationForm.score === 0}
          >
            Guardar Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog
        open={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de Evaluación
        </DialogTitle>
        <DialogContent>
          {selectedStudent && selectedProject && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Estudiante: {selectedStudent.first_name} {selectedStudent.last_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Proyecto: {selectedProject.title}
              </Typography>
              
              {(() => {
                const evaluation = getExistingEvaluation(selectedStudent.id, selectedProject.id);
                if (evaluation) {
                  return (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Evaluación
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={evaluation.score} readOnly />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                          {evaluation.score}/5
                        </Typography>
                      </Box>
                      {evaluation.comments && (
                        <Typography variant="body1" paragraph>
                          <strong>Comentarios:</strong> {evaluation.comments}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Evaluado el: {new Date(evaluation.evaluation_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  );
                } else {
                  return (
                    <Typography variant="body1" color="text.secondary">
                      No hay evaluación registrada para este estudiante en este proyecto.
                    </Typography>
                  );
                }
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDetalleOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyEvaluations;
