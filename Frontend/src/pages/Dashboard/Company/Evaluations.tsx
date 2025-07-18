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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
  Warning as WarningIcon,
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

interface StrikeReportFormState {
  reason: string;
  description: string;
}

export const CompanyEvaluations: React.FC = () => {
  const api = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluationsByProject, setEvaluationsByProject] = useState<Record<string, any[]>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState(0); // 0: Por Proyecto, 1: Recibidas, 2: Dadas
  const [selectedTab, setSelectedTab] = useState(0); // 0: Activos, 1: Completados, 2: Cancelados
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [strikeReportModalOpen, setStrikeReportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [evaluationForm, setEvaluationForm] = useState<EvaluationFormState>({
    score: 0,
    comments: '',
    strengths: [],
    improvement_areas: [],
  });
  const [strikeReportForm, setStrikeReportForm] = useState<StrikeReportFormState>({
    reason: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener proyectos
      const projectsResponse = await api.get('/api/projects/');
      let projectsData: any[] = [];
      if (projectsResponse?.data?.results) {
        projectsData = projectsResponse.data.results;
      } else if (projectsResponse?.results) {
        projectsData = projectsResponse.results;
      } else if (Array.isArray(projectsResponse)) {
        projectsData = projectsResponse;
      } else if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
        projectsData = projectsResponse.data;
      } else {
        setError('La respuesta del backend no contiene proyectos válidos.');
        setProjects([]);
        setLoading(false);
        return;
      }
      if (!Array.isArray(projectsData)) {
        setError('La respuesta del backend no es un array de proyectos.');
        setProjects([]);
        setLoading(false);
        return;
      }
      const adaptedProjects = adaptProjectList(projectsData);
      setProjects(adaptedProjects);

      // Obtener evaluaciones mutuas por proyecto
      const evaluationsByProj: Record<string, any[]> = {};
      for (const project of adaptedProjects) {
        try {
          const evalsResp = await api.get(`/api/evaluations/by_project/${project.id}/`);
          evaluationsByProj[project.id] = evalsResp.data?.results || evalsResp.results || [];
        } catch (e) {
          evaluationsByProj[project.id] = [];
        }
      }
      setEvaluationsByProject(evaluationsByProj);

      // Obtener usuarios
      const usersResponse = await api.get('/api/users/');
      let usersData: any[] = [];
      if (usersResponse?.data?.results) {
        usersData = usersResponse.data.results;
      } else if (usersResponse?.results) {
        usersData = usersResponse.results;
      } else if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      } else if (usersResponse?.data && Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
      } else if (Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
      } else {
        setError('La respuesta del backend no contiene usuarios válidos.');
        setUsers([]);
        setLoading(false);
        return;
      }
      setUsers(usersData.filter((user: any) => user.role === 'student'));
    } catch (err: any) {
      setError('Error al cargar datos');
      setProjects([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar proyectos por estado
  const activos = projects.filter(project => project.status === 'active');
  const completados = projects.filter(project => project.status === 'completed');
  const cancelados = projects.filter(project => project.status === 'cancelled');

  // Verificar si un estudiante ya fue evaluado en un proyecto
  const isStudentEvaluated = (studentId: string, projectId: string) => {
    return evaluationsByProject[projectId]?.some(evaluation =>
      evaluation.student === studentId && evaluation.evaluator_role === 'company'
    ) || evaluationsByProject[projectId]?.some(evaluation =>
      evaluation.student === studentId && evaluation.evaluator_role === 'student'
    );
  };

  // Obtener evaluación existente
  const getExistingEvaluation = (studentId: string, projectId: string) => {
    return evaluationsByProject[projectId]?.find(evaluation =>
      evaluation.student === studentId && evaluation.evaluator_role === 'company'
    ) || evaluationsByProject[projectId]?.find(evaluation =>
      evaluation.student === studentId && evaluation.evaluator_role === 'student'
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
        const updatedEvaluation = adaptEvaluation(response.data);
                 setEvaluationsByProject(prev => ({
           ...prev,
           [selectedProject.id]: prev[selectedProject.id].map(evaluation => evaluation.id === existingEvaluation.id ? updatedEvaluation : evaluation)
         }));
      } else {
        // Crear nueva evaluación
        const response = await api.post('/api/evaluations/', evaluationData);
        const newEvaluation = adaptEvaluation(response.data);
        setEvaluationsByProject(prev => ({
          ...prev,
          [selectedProject.id]: [...prev[selectedProject.id], newEvaluation]
        }));
      }

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
      console.error('Error guardando evaluación:', error);
      setError(error.response?.data?.error || 'Error al guardar evaluación');
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) return;

    try {
      await api.delete(`/api/evaluations/${evaluationId}/`);
      setEvaluationsByProject(prev => {
        const projectId = prev[selectedProject.id]?.find(e => e.id === evaluationId)?.project;
        if (projectId) {
          return {
            ...prev,
            [projectId]: prev[projectId].filter(evaluation => evaluation.id !== evaluationId)
          };
        }
        return prev;
      });
    } catch (error: any) {
      console.error('Error eliminando evaluación:', error);
      setError(error.response?.data?.error || 'Error al eliminar evaluación');
    }
  };

  const handleOpenStrikeReport = (student: any, project: Project) => {
    setSelectedStudent(student);
    setSelectedProject(project);
    setStrikeReportForm({
      reason: '',
      description: '',
    });
    setStrikeReportModalOpen(true);
  };

  const handleSubmitStrikeReport = async () => {
    if (!selectedStudent || !selectedProject) return;

    try {
      const reportData = {
        company_id: selectedProject.company, // Asumiendo que el proyecto tiene company_id
        student_id: selectedStudent.id,
        project_id: selectedProject.id,
        reason: strikeReportForm.reason,
        description: strikeReportForm.description,
      };

      await api.post('/api/strikes/reports/create/', reportData);
      
      setStrikeReportModalOpen(false);
      setSelectedStudent(null);
      setSelectedProject(null);
      setStrikeReportForm({
        reason: '',
        description: '',
      });
      
      // Mostrar mensaje de éxito
      setError(null);
      // Aquí podrías mostrar un mensaje de éxito
    } catch (error: any) {
      console.error('Error enviando reporte de strike:', error);
      setError(error.response?.data?.error || 'Error al enviar reporte de strike');
    }
  };

  const getProjectStudents = (projectId: string) => {
    // Solo devolver estudiantes reales del backend
    return users.filter(user => user.role === 'student' && user.projects?.includes(projectId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
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
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Evaluaciones de Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Evalúa el desempeño de los estudiantes en tus proyectos y consulta las evaluaciones recibidas
        </Typography>
      </Box>

      {/* Tabs principales */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={mainTab}
          onChange={(_, newValue) => setMainTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: 18,
              textTransform: 'none',
              minWidth: 160,
              letterSpacing: 0.5,
            },
            '& .Mui-selected': {
              color: '#1976d2',
            },
            mb: 2
          }}
        >
          <Tab label="Por Proyecto" />
          <Tab label="Recibidas" />
          <Tab label="Dadas" />
        </Tabs>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
  <Paper elevation={3} sx={{ bgcolor: '#f5faff', borderRadius: 3, p: 3, minWidth: 220, flex: '1 1 220px', boxShadow: 3 }}>
    <Typography variant="h5" fontWeight={700} color="#1976d2" gutterBottom>
      Total Proyectos
    </Typography>
    <Typography variant="h2" fontWeight={700} color="#1976d2">
      {projects.length}
    </Typography>
  </Paper>
  <Paper elevation={3} sx={{ bgcolor: '#e8f5e9', borderRadius: 3, p: 3, minWidth: 220, flex: '1 1 220px', boxShadow: 3 }}>
    <Typography variant="h5" fontWeight={700} color="#388e3c" gutterBottom>
      Total Evaluaciones
    </Typography>
    <Typography variant="h2" fontWeight={700} color="#388e3c">
      {Object.values(evaluationsByProject).flat().length}
    </Typography>
  </Paper>
  <Paper elevation={3} sx={{ bgcolor: '#fff8e1', borderRadius: 3, p: 3, minWidth: 220, flex: '1 1 220px', boxShadow: 3 }}>
    <Typography variant="h5" fontWeight={700} color="#ffa726" gutterBottom>
      Evaluaciones Realizadas
    </Typography>
    <Typography variant="h2" fontWeight={700} color="#ffa726">
      {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_role === 'company').length}
    </Typography>
  </Paper>
  <Paper elevation={3} sx={{ bgcolor: '#e3f2fd', borderRadius: 3, p: 3, minWidth: 220, flex: '1 1 220px', boxShadow: 3 }}>
    <Typography variant="h5" fontWeight={700} color="#29b6f6" gutterBottom>
      Evaluaciones Recibidas
    </Typography>
    <Typography variant="h2" fontWeight={700} color="#29b6f6">
      {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_role === 'student').length}
    </Typography>
  </Paper>
</Box>

      {/* Tabs secundarios y contenido */}
      {mainTab === 0 && (
        <>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={1}>
              {['Activos', 'Completados', 'Cancelados'].map((tab, index) => (
                <Grid item key={index}>
                  <Button
                    variant={selectedTab === index ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTab(index)}
                    sx={{ minWidth: 140, fontWeight: 600, fontSize: 16, borderRadius: 2, boxShadow: selectedTab === index ? 2 : 0 }}
                  >
                    {tab}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
      {/* Lista de Proyectos */}
      <Box>
        {(() => {
          const currentProjects = selectedTab === 0 ? activos : selectedTab === 1 ? completados : cancelados;
              if (currentProjects.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" color="text.secondary" fontWeight={500}>
                      No hay proyectos en esta categoría
                    </Typography>
                  </Box>
                );
              }
              return (
                <Grid container spacing={3}>
                  {currentProjects.map((project) => (
                    <Grid item xs={12} md={6} key={project.id}>
                      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'white', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
                    {project.title}
                  </Typography>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                              sx={{ fontWeight: 600 }}
                    />
        </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description && project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description || 'Sin descripción'}
              </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                            <Chip
                              label={`${project.current_students || 0}/${project.max_students || 1} estudiantes`}
                              size="small"
                              color="success"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip
                              label={`${(evaluationsByProject[project.id] || []).length} evaluaciones`}
                              size="small"
                              color="info"
                              sx={{ fontWeight: 600 }}
                            />
          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenEvaluar(users[0], project)}
                              sx={{ borderRadius: 2 }}
                            >
                              Evaluar
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => handleOpenDetalle(users[0], project)}
                              sx={{ borderRadius: 2 }}
                            >
                              Ver
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleOpenStrikeReport(users[0], project)}
                              sx={{ borderRadius: 2 }}
                            >
                              Reportar
                            </Button>
                  </Box>
                </CardContent>
              </Card>
                    </Grid>
                  ))}
                    </Grid>
                  );
            })()}
          </Box>
        </>
      )}
      {mainTab === 1 && (
        // Evaluaciones Recibidas de Estudiantes
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Evaluaciones Recibidas de Estudiantes
          </Typography>
          <Grid container spacing={3}>
            {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_role === 'student').map((evalR, idx) => (
              <Grid item xs={12} md={6} key={evalR.id || idx}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
                        {evalR.student_name}
                      </Typography>
                      <Chip label="Recibida" color="info" size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={evalR.score} readOnly />
                      <Typography variant="body1" sx={{ ml: 2 }}>
                        {evalR.score}/5
                      </Typography>
                    </Box>
                    {evalR.comments && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Comentarios:</strong> {evalR.comments}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Evaluado el: {new Date(evalR.evaluation_date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {mainTab === 2 && (
        // Evaluaciones Realizadas a Estudiantes
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Evaluaciones Realizadas a Estudiantes
          </Typography>
          <Grid container spacing={3}>
            {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_role === 'company').map((evalD, idx) => (
              <Grid item xs={12} md={6} key={evalD.id || idx}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
                        {evalD.student_name}
                      </Typography>
                      <Chip label="Dada" color="success" size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={evalD.score} readOnly />
                      <Typography variant="body1" sx={{ ml: 2 }}>
                        {evalD.score}/5
                </Typography>
              </Box>
                    {evalD.comments && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Comentarios:</strong> {evalD.comments}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Evaluado el: {new Date(evalD.evaluation_date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
                </Box>
      )}

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
                const companyToStudentEvaluation = getCompanyToStudentEvaluation(selectedProject.id, selectedStudent.id);
                const studentToCompanyEvaluation = getStudentToCompanyEvaluation(selectedProject.id, selectedStudent.id);

                if (companyToStudentEvaluation || studentToCompanyEvaluation) {
                  return (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Evaluaciones
                      </Typography>
                      {companyToStudentEvaluation && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Evaluación de la Empresa al Estudiante
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={companyToStudentEvaluation.score} readOnly />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                              {companyToStudentEvaluation.score}/5
                        </Typography>
                      </Box>
                          {companyToStudentEvaluation.comments && (
                        <Typography variant="body1" paragraph>
                              <strong>Comentarios (Empresa):</strong> {companyToStudentEvaluation.comments}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Evaluado el: {new Date(companyToStudentEvaluation.evaluation_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {studentToCompanyEvaluation && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Evaluación del Estudiante a la Empresa
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={studentToCompanyEvaluation.score} readOnly />
                            <Typography variant="body1" sx={{ ml: 2 }}>
                              {studentToCompanyEvaluation.score}/5
                            </Typography>
                          </Box>
                          {studentToCompanyEvaluation.comments && (
                            <Typography variant="body1" paragraph>
                              <strong>Comentarios (Estudiante):</strong> {studentToCompanyEvaluation.comments}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                            Evaluado el: {new Date(studentToCompanyEvaluation.evaluation_date).toLocaleDateString()}
                      </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                } else {
                  return (
                    <Typography variant="body1" color="text.secondary">
                      No hay evaluaciones registradas para este estudiante en este proyecto.
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

      {/* Modal de Reporte de Strike */}
      <Dialog
        open={strikeReportModalOpen}
        onClose={() => setStrikeReportModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Reportar Strike - {selectedStudent?.first_name} {selectedStudent?.last_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Proyecto: <strong>{selectedProject?.title}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="Motivo del Strike"
              value={strikeReportForm.reason}
              onChange={(e) => setStrikeReportForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ej: Incumplimiento de horarios, falta de comunicación, etc."
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              label="Descripción Detallada"
              value={strikeReportForm.description}
              onChange={(e) => setStrikeReportForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              placeholder="Describe detalladamente el incidente o problema que motiva este reporte..."
              required
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Este reporte será revisado por un administrador. 
                Solo se asignará un strike si se aprueba el reporte.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStrikeReportModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitStrikeReport}
            variant="contained"
            color="warning"
            disabled={!strikeReportForm.reason.trim() || !strikeReportForm.description.trim()}
          >
            Enviar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyEvaluations;
