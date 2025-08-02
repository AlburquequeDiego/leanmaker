import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Rating,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
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
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [strikeReportModalOpen, setStrikeReportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
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
  const [companyRatings, setCompanyRatings] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [projectStudents, setProjectStudents] = useState<Record<string, any[]>>({});

  // Memoizar datos procesados para mejor rendimiento
  const processedData = useMemo(() => {
    const activos = projects.filter(p => p.status === 'active' || p.status === 'published');
    const completados = projects.filter(p => p.status === 'completed');
    
    const totalEvaluaciones = Object.values(evaluationsByProject).flat().length;
    const evaluacionesRealizadas = Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'company').length;
    const evaluacionesRecibidas = Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'student').length;
    const promedioCalificacion = companyRatings.length > 0 
      ? companyRatings.reduce((acc, rating) => acc + rating.puntuacion, 0) / companyRatings.length 
      : 0;

    return {
      activos,
      completados,
      totalEvaluaciones,
      evaluacionesRealizadas,
      evaluacionesRecibidas,
      promedioCalificacion
    };
  }, [projects, evaluationsByProject, companyRatings]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar proyectos
      const projectsResponse = await api.get('/api/projects/company_projects/');
      console.log('Projects response:', projectsResponse);
      const adaptedProjects = adaptProjectList(projectsResponse.data?.data || projectsResponse.data || []);
      setProjects(adaptedProjects);

      // Cargar evaluaciones
      const evaluationsResponse = await api.get('/api/evaluations/');
      console.log('Evaluations response:', evaluationsResponse);
      const evaluations = evaluationsResponse.data?.results || evaluationsResponse.data || [];
      
      // Agrupar evaluaciones por proyecto
      const groupedEvaluations: Record<string, any[]> = {};
      evaluations.forEach((evaluation: any) => {
        const projectId = evaluation.project_id || evaluation.project;
        if (!groupedEvaluations[projectId]) {
          groupedEvaluations[projectId] = [];
        }
        groupedEvaluations[projectId].push(evaluation);
      });
      setEvaluationsByProject(groupedEvaluations);

      // Cargar usuarios
      const usersResponse = await api.get('/api/users/');
      console.log('Users response:', usersResponse);
      setUsers(usersResponse.data?.results || usersResponse.data || []);

      // Cargar estudiantes
      const studentsResponse = await api.get('/api/students/');
      console.log('Students response:', studentsResponse);
      setEstudiantes(studentsResponse.data?.results || studentsResponse.data || []);

      // Cargar calificaciones de empresa
      await loadCompanyRatings();

      // Cargar estudiantes de cada proyecto
      for (const project of adaptedProjects) {
        await loadProjectStudents(project.id);
      }

    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyRatings = async () => {
    try {
      const response = await api.get('/api/company-ratings/');
      console.log('Company ratings response:', response);
      setCompanyRatings(response.data || []);
    } catch (err) {
      console.error('Error cargando calificaciones de empresa:', err);
    }
  };

  const isStudentEvaluated = (studentId: string, projectId: string) => {
    return evaluationsByProject[projectId]?.some(e => 
      e.student_id === studentId && e.evaluator_type === 'company'
    );
  };

  const getExistingEvaluation = (studentId: string, projectId: string) => {
    return evaluationsByProject[projectId]?.find(e => 
      e.student_id === studentId && e.evaluator_type === 'company'
    );
  };

  const handleOpenEvaluar = (estudiante: any, project: Project) => {
    setSelectedStudent(estudiante);
    setSelectedProject(project);
    
    // Si ya existe una evaluación, cargarla
    const existingEvaluation = getExistingEvaluation(estudiante.id, project.id);
    if (existingEvaluation) {
      setEvaluationForm({
        score: existingEvaluation.score || 0,
        comments: existingEvaluation.comments || '',
        strengths: existingEvaluation.strengths || [],
        improvement_areas: existingEvaluation.areas_for_improvement || [],
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

  const handleOpenDetalle = (estudiante: any, project: Project) => {
    setSelectedStudent(estudiante);
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedStudent || !selectedProject) return;

    try {
    const evaluationData = {
        project_id: selectedProject.id,
        student_id: selectedStudent.id,
      score: evaluationForm.score,
        comments: evaluationForm.comments,
        strengths: evaluationForm.strengths,
        areas_for_improvement: evaluationForm.improvement_areas,
        evaluator_type: 'company',
    };

      const existingEvaluation = getExistingEvaluation(selectedStudent.id, selectedProject.id);
    
    if (existingEvaluation) {
      // Actualizar evaluación existente
        await api.put(`/api/evaluations/${existingEvaluation.id}/`, evaluationData);
    } else {
      // Crear nueva evaluación
        await api.post('/api/evaluations/', evaluationData);
      }

      // Recargar datos
      await loadData();
    setModalOpen(false);
      
      // Limpiar formulario
    setEvaluationForm({
      score: 0,
      comments: '',
      strengths: [],
      improvement_areas: [],
    });
    } catch (err: any) {
      console.error('Error guardando evaluación:', err);
      alert('Error guardando evaluación: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) return;

    try {
      await api.delete(`/api/evaluations/${evaluationId}/`);
      await loadData();
    } catch (err: any) {
      console.error('Error eliminando evaluación:', err);
      alert('Error eliminando evaluación: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenStrikeReport = (estudiante: any, project: Project) => {
    setSelectedStudent(estudiante);
    setSelectedProject(project);
    setStrikeReportForm({ reason: '', description: '' });
    setStrikeReportModalOpen(true);
  };

  const handleSubmitStrikeReport = async () => {
    if (!selectedStudent || !selectedProject) return;

    try {
      const reportData = {
        company_id: selectedProject.company,
        student_id: selectedStudent.id,
        project_id: selectedProject.id,
        reason: strikeReportForm.reason,
        description: strikeReportForm.description,
      };

      await api.post('/api/strikes/reports/', reportData);
      
      setStrikeReportModalOpen(false);
      setStrikeReportForm({ reason: '', description: '' });
      
      alert('Reporte enviado exitosamente. Será revisado por un administrador.');
    } catch (err: any) {
      console.error('Error enviando reporte:', err);
      alert('Error enviando reporte: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadProjectStudents = async (projectId: string) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/participants/`);
      console.log('Project participants response:', response);
      const participantes = response.data?.participantes || [];
      setProjectStudents(prev => ({
        ...prev,
        [projectId]: participantes
      }));
      return participantes;
    } catch (err) {
      console.error('Error obteniendo participantes del proyecto:', err);
      return [];
    }
  };

  const getProjectStudents = (projectId: string) => {
    return projectStudents[projectId] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
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
      case 'published':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
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
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#1e293b' }}>
          Evaluaciones de Estudiantes
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Gestiona y revisa las evaluaciones de desempeño de los estudiantes en tus proyectos
        </Typography>
      </Box>

      {/* Estadísticas */}
       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           border: '1px solid #e2e8f0',
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             pointerEvents: 'none'
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
             <Box>
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
      {projects.length}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                 Total Proyectos
               </Typography>
             </Box>
             <BusinessIcon sx={{ fontSize: 48, opacity: 0.9 }} />
           </Box>
  </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           border: '1px solid #e2e8f0',
           background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             pointerEvents: 'none'
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
             <Box>
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                 {processedData.totalEvaluaciones}
               </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
      Total Evaluaciones
    </Typography>
             </Box>
             <AssessmentIcon sx={{ fontSize: 48, opacity: 0.9 }} />
           </Box>
         </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           border: '1px solid #e2e8f0',
           background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             pointerEvents: 'none'
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
             <Box>
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                 {processedData.evaluacionesRealizadas}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                 Realizadas
               </Typography>
             </Box>
             <RateReviewIcon sx={{ fontSize: 48, opacity: 0.9 }} />
           </Box>
  </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           border: '1px solid #e2e8f0',
           background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
             pointerEvents: 'none'
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
             <Box>
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                 {processedData.promedioCalificacion.toFixed(1)}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                 Promedio Calificación
    </Typography>
             </Box>
             <StarIcon sx={{ fontSize: 48, opacity: 0.9 }} />
           </Box>
  </Paper>
       </Box>

      {/* Tabs de navegación */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 48,
              px: 3,
              py: 1.5,
              '&.Mui-selected': {
                color: '#1976d2',
                '& .MuiSvgIcon-root': {
                  color: '#1976d2'
                }
              },
              '&:not(.Mui-selected)': {
                color: '#666',
                '& .MuiSvgIcon-root': {
                  color: '#666'
                }
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <AssignmentIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Por Proyecto
                </Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <RateReviewIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
      Evaluaciones Recibidas
    </Typography>
                <Badge 
                  badgeContent={processedData.evaluacionesRecibidas} 
                  color="info" 
                  sx={{ 
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20,
                      borderRadius: 10
                    }
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <TrendingUpIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Calificaciones Empresa
    </Typography>
              </Box>
            } 
          />
        </Tabs>
</Box>

      {/* Contenido de tabs */}
      {activeTab === 0 && (
        <Box>
          {/* Subtabs para proyectos */}
          <Box sx={{ mb: 4, display: 'flex', gap: 1 }}>
            {['Activos', 'Completados'].map((tab, index) => (
                <Button
                key={index}
                  variant={selectedTab === index ? 'contained' : 'outlined'}
                  onClick={() => setSelectedTab(index)}
                sx={{ 
                  minWidth: 140, 
                  fontWeight: 600, 
                  fontSize: 16, 
                  borderRadius: 2, 
                  boxShadow: selectedTab === index ? 2 : 0,
                  textTransform: 'none'
                }}
                >
                  {tab}
                </Button>
            ))}
          </Box>

                     {/* Lista de proyectos */}
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(600px, 1fr))' }, gap: 3 }}>
             {(selectedTab === 0 ? processedData.activos : processedData.completados).map((project) => (
               <Card key={project.id} elevation={0} sx={{ 
                 borderRadius: 3, 
                 border: '1px solid #e2e8f0',
                 bgcolor: 'white',
                 transition: 'all 0.3s ease',
                 overflow: 'hidden',
                 '&:hover': { 
                   transform: 'translateY(-4px)',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                   borderColor: '#cbd5e1'
                 }
               }}>
                 <CardContent sx={{ p: 0 }}>
                   {/* Header del proyecto */}
                   <Box sx={{ 
                     p: 3, 
                     pb: 2,
                     background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                     borderBottom: '1px solid #e2e8f0'
                   }}>
                     <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                       <Box sx={{ flex: 1 }}>
                         <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b', mb: 1 }}>
                    {project.title}
                  </Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ 
                           mb: 2, 
                           lineHeight: 1.6,
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical',
                           overflow: 'hidden'
                         }}>
                           {project.description || 'Sin descripción'}
                         </Typography>
                       </Box>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                         sx={{ 
                           fontWeight: 600, 
                           ml: 2,
                           height: 28,
                           fontSize: '0.75rem'
                         }}
                    />
        </Box>

                     <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                         icon={<GroupIcon sx={{ fontSize: 16 }} />}
                              label={`${project.current_students || 0}/${project.max_students || 1} estudiantes`}
                              size="small"
                         color="primary"
                         variant="outlined"
                         sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                            <Chip
                         icon={<AssessmentIcon sx={{ fontSize: 16 }} />}
                              label={`${(evaluationsByProject[project.id] || []).length} evaluaciones`}
                              size="small"
                              color="info"
                         variant="outlined"
                         sx={{ fontSize: '0.75rem', height: 24 }}
                            />
          </Box>
                   </Box>

                                       {/* Contenido del proyecto */}
                    <Box sx={{ p: 3, pt: 2 }}>
                      {/* Estudiantes del proyecto */}
                            {selectedTab === 1 && (
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <GroupIcon sx={{ color: '#64748b', fontSize: 20 }} />
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#64748b' }}>
                              Estudiantes del Proyecto
                            </Typography>
                            <Chip 
                              label={getProjectStudents(project.id).length} 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }}
                            />
                          </Box>
                          
                          {getProjectStudents(project.id).length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {getProjectStudents(project.id).map((student, index) => {
                                const isEvaluated = isStudentEvaluated(student.id, project.id);
                                
                                  return (
                                  <Paper key={student.id} elevation={0} sx={{ 
                                    p: 2.5,
                                    bgcolor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: '#f1f5f9',
                                      borderColor: '#cbd5e1'
                                    }
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Avatar sx={{ 
                                          width: 45, 
                                          height: 45, 
                                          bgcolor: isEvaluated ? '#10b981' : '#3b82f6',
                                          fontSize: '1.1rem',
                                          fontWeight: 600
                                        }}>
                                          {student.nombre ? student.nombre.charAt(0).toUpperCase() : 'E'}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body1" fontWeight={600} sx={{ color: '#1e293b' }}>
                                            {student.nombre || 'Sin nombre'}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            {student.email}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Chip 
                                              label={isEvaluated ? 'Evaluado' : 'Pendiente'} 
                                              size="small" 
                                              color={isEvaluated ? "success" : "warning"}
                                              variant="outlined"
                                              sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                          </Box>
                                        </Box>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                                      <Button
                                        size="small"
                                          variant={isEvaluated ? "outlined" : "contained"}
                                          color={isEvaluated ? "success" : "primary"}
                                          onClick={() => handleOpenEvaluar(student, project)}
                                          sx={{ 
                                            borderRadius: 2, 
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                          }}
                                          startIcon={isEvaluated ? <EditIcon /> : <RateReviewIcon />}
                                        >
                                          {isEvaluated ? 'Re-evaluar' : 'Evaluar'}
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                          onClick={() => handleOpenStrikeReport(student, project)}
                                          sx={{ 
                                            borderRadius: 2, 
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                          }}
                                          startIcon={<WarningIcon />}
                                      >
                                        Reportar
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                          onClick={() => handleOpenDetalle(student, project)}
                                          sx={{ 
                                            borderRadius: 2, 
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                          }}
                                          startIcon={<VisibilityIcon />}
                                      >
                                        Ver
                                      </Button>
                                    </Box>
                                    </Box>
                                  </Paper>
                                  );
                                })}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 4, 
                              bgcolor: '#f8fafc', 
                              borderRadius: 2,
                              border: '2px dashed #cbd5e1'
                            }}>
                              <PersonIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                No hay estudiantes asignados
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Los estudiantes aparecerán aquí cuando se asignen al proyecto
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                  </Box>
                </CardContent>
              </Card>
                  ))}
                    </Box>

          {(selectedTab === 0 ? processedData.activos : processedData.completados).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight={500}>
                No hay proyectos {selectedTab === 0 ? 'activos' : 'completados'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Los proyectos aparecerán aquí cuando estén disponibles
              </Typography>
          </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1e293b' }}>
            Evaluaciones Recibidas de Estudiantes
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' }, gap: 3 }}>
            {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'student').map((evalR, idx) => (
              <Card key={evalR.id || idx} elevation={0} sx={{ 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#3b82f6' }}>
                        {evalR.student_name ? evalR.student_name.charAt(0).toUpperCase() : 'E'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                        {evalR.student_name || 'Sin nombre'}
                      </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estudiante
                        </Typography>
                      </Box>
                    </Box>
                      <Chip label="Recibida" color="info" size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={evalR.score} readOnly size="small" />
                    <Typography variant="body1" sx={{ ml: 2, fontWeight: 600 }}>
                        {evalR.score}/5
                      </Typography>
                    </Box>
                  
                    {evalR.comments && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{evalR.comments}"
                      </Typography>
                    )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Evaluado el: {formatDate(evalR.evaluation_date)}
                    </Typography>
                  </CardContent>
                </Card>
            ))}
          </Box>

          {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'student').length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <RateReviewIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight={500}>
                No hay evaluaciones recibidas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Los estudiantes aún no han evaluado tus proyectos
              </Typography>
        </Box>
      )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1e293b' }}>
            Calificaciones Recibidas por la Empresa
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' }, gap: 3 }}>
            {companyRatings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TrendingUpIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" fontWeight={500}>
                  No hay calificaciones recibidas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Los estudiantes aún no han calificado a la empresa
                </Typography>
              </Box>
            ) : (
              companyRatings.map((rating, idx) => (
                <Card key={rating.id || idx} elevation={0} sx={{ 
                  borderRadius: 3, 
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#10b981' }}>
                          {rating.estudiante ? rating.estudiante.charAt(0).toUpperCase() : 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                          {rating.estudiante || 'Sin nombre'}
                        </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Estudiante
                          </Typography>
                      </Box>
                      </Box>
                      <Chip label="Calificación" color="success" size="small" sx={{ fontWeight: 600 }} />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Proyecto: <strong>{rating.proyecto || 'Sin proyecto'}</strong>
                      </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={rating.puntuacion} readOnly size="small" />
                      <Typography variant="body1" sx={{ ml: 2, fontWeight: 600 }}>
                          {rating.puntuacion}/5
                        </Typography>
                      </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Fecha: {rating.fecha ? formatDate(rating.fecha) : 'No especificada'}
                      </Typography>
                    </CardContent>
                  </Card>
              ))
            )}
          </Box>
        </Box>
      )}

      {/* Modal de Evaluación */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <RateReviewIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
          {selectedStudent && selectedProject ? 
                `Evaluar a ${selectedStudent.first_name} ${selectedStudent.last_name}` :
            'Evaluar Estudiante'
          }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyecto: {selectedProject?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Calificación General
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Rating
                value={evaluationForm.score}
                onChange={(_, value) => setEvaluationForm(prev => ({ ...prev, score: value || 0 }))}
                size="large"
              />
              <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                {evaluationForm.score}/5
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Comentarios adicionales"
              value={evaluationForm.comments}
              onChange={(e) => setEvaluationForm(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={4}
              placeholder="Describe el desempeño del estudiante, fortalezas, áreas de mejora..."
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEvaluation}
            variant="contained"
            disabled={evaluationForm.score === 0}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Guardar Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
          Detalles de Evaluación
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedStudent && selectedProject && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: '#3b82f6' }}>
                  {selectedStudent.first_name ? selectedStudent.first_name.charAt(0).toUpperCase() : 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedStudent.first_name} {selectedStudent.last_name}
              </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.email}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Proyecto: {selectedProject.title}
              </Typography>
              
              {(() => {
                const companyToStudentEvaluation = evaluationsByProject[selectedProject.id]?.find(e => 
                  e.student_id === selectedStudent.id && e.evaluator_type === 'company'
                );
                const studentToCompanyEvaluation = evaluationsByProject[selectedProject.id]?.find(e => 
                  e.student_id === selectedStudent.id && e.evaluator_type === 'student'
                );

                if (companyToStudentEvaluation || studentToCompanyEvaluation) {
                  return (
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Evaluaciones
                      </Typography>
                      
                      {companyToStudentEvaluation && (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                          <Typography variant="subtitle1" gutterBottom fontWeight={600} color="#0369a1">
                            Evaluación de la Empresa al Estudiante
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={companyToStudentEvaluation.score} readOnly />
                            <Typography variant="body1" sx={{ ml: 2, fontWeight: 600 }}>
                              {companyToStudentEvaluation.score}/5
                        </Typography>
                      </Box>
                          {companyToStudentEvaluation.comments && (
                            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic' }}>
                              "{companyToStudentEvaluation.comments}"
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Evaluado el: {formatDate(companyToStudentEvaluation.evaluation_date)}
                          </Typography>
                        </Paper>
                      )}
                      
                      {studentToCompanyEvaluation && (
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <Typography variant="subtitle1" gutterBottom fontWeight={600} color="#15803d">
                            Evaluación del Estudiante a la Empresa
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={studentToCompanyEvaluation.score} readOnly />
                            <Typography variant="body1" sx={{ ml: 2, fontWeight: 600 }}>
                              {studentToCompanyEvaluation.score}/5
                            </Typography>
                          </Box>
                          {studentToCompanyEvaluation.comments && (
                            <Typography variant="body2" paragraph sx={{ fontStyle: 'italic' }}>
                              "{studentToCompanyEvaluation.comments}"
                        </Typography>
                      )}
                          <Typography variant="caption" color="text.secondary">
                            Evaluado el: {formatDate(studentToCompanyEvaluation.evaluation_date)}
                      </Typography>
                        </Paper>
                      )}
                    </Box>
                  );
                } else {
                  return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssessmentIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={500}>
                        No hay evaluaciones registradas
                    </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aún no se han realizado evaluaciones para este estudiante en este proyecto
                      </Typography>
                    </Box>
                  );
                }
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
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
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#fef3c7', 
          borderBottom: '1px solid #fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <WarningIcon color="warning" />
          <Box>
            <Typography variant="h6" fontWeight={700} color="#92400e">
              Reportar Strike
            </Typography>
            <Typography variant="body2" color="#92400e">
              {selectedStudent?.first_name} {selectedStudent?.last_name} - {selectedProject?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Este reporte será revisado por un administrador. 
                Solo se asignará un strike si se aprueba el reporte.
            </Typography>
            </Alert>
            
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#fef3c7', borderTop: '1px solid #fbbf24' }}>
          <Button 
            onClick={() => setStrikeReportModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitStrikeReport}
            variant="contained"
            color="warning"
            disabled={!strikeReportForm.reason.trim() || !strikeReportForm.description.trim()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Enviar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyEvaluations;