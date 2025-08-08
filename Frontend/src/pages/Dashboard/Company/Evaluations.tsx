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
  MenuItem,
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
import { useTheme } from '../../../contexts/ThemeContext';

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

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  company: string;
  start_date: string;
  end_date: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Evaluation {
  id: string;
  student_id: string;
  project_id: string;
  score: number;
  comments: string;
  strengths: string[];
  areas_for_improvement: string[];
  evaluator_type: 'company' | 'student';
  evaluation_date: string;
}



export const CompanyEvaluations: React.FC = () => {
  const { themeMode } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluationsByProject, setEvaluationsByProject] = useState<Record<string, Evaluation[]>>({});
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [strikeReportModalOpen, setStrikeReportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

  const [estudiantes, setEstudiantes] = useState<Student[]>([]);
  const [projectStudents, setProjectStudents] = useState<Record<string, Student[]>>({});
  const [realizadasLimit, setRealizadasLimit] = useState(5);

  // Memoizar datos procesados para mejor rendimiento
  const processedData = useMemo(() => {
    const completados = projects.filter(p => p.status === 'completed');
    
    const totalEvaluaciones = Object.values(evaluationsByProject).flat().length;
    const evaluacionesRealizadas = Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'company').length;
    const promedioCalificacion = 0;

    return {
      completados,
      totalEvaluaciones,
      evaluacionesRealizadas,
      promedioCalificacion
    };
  }, [projects, evaluationsByProject]);



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

  const handleOpenEvaluar = (estudiante: Student, project: Project) => {
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

  const handleOpenDetalle = (estudiante: Student, project: Project) => {
    setSelectedStudent(estudiante);
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedStudent || !selectedProject) return;

    // Simular guardado
    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      student_id: selectedStudent.id,
      project_id: selectedProject.id,
      score: evaluationForm.score,
      comments: evaluationForm.comments,
      strengths: evaluationForm.strengths,
      areas_for_improvement: evaluationForm.improvement_areas,
      evaluator_type: 'company',
      evaluation_date: new Date().toISOString()
    };

    // Actualizar estado local
    setEvaluationsByProject(prev => ({
      ...prev,
      [selectedProject.id]: [...(prev[selectedProject.id] || []), newEvaluation]
    }));

    setModalOpen(false);
    
    // Limpiar formulario
    setEvaluationForm({
      score: 0,
      comments: '',
      strengths: [],
      improvement_areas: [],
    });
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) return;

    // Simular eliminación
    setEvaluationsByProject(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(projectId => {
        updated[projectId] = updated[projectId].filter(e => e.id !== evaluationId);
      });
      return updated;
    });
  };

  const handleOpenStrikeReport = (estudiante: Student, project: Project) => {
    setSelectedStudent(estudiante);
    setSelectedProject(project);
    setStrikeReportForm({ reason: '', description: '' });
    setStrikeReportModalOpen(true);
  };

  const handleSubmitStrikeReport = async () => {
    if (!selectedStudent || !selectedProject) return;

    // Simular envío de reporte
    alert('Reporte enviado exitosamente. Será revisado por un administrador.');
    setStrikeReportModalOpen(false);
    setStrikeReportForm({ reason: '', description: '' });
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
        <Button onClick={() => setError(null)} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 4 }, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* Header con tarjeta morada */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <AssessmentIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Evaluaciones de Estudiantes
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Gestiona y revisa las evaluaciones de desempeño de los estudiantes en tus proyectos
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas */}
       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)',
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
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, color: 'white' }}>
      {processedData.completados.length}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500, color: 'white' }}>
                 Proyectos Completados
               </Typography>
             </Box>
             <BusinessIcon sx={{ fontSize: 48, opacity: 0.9, color: 'white' }} />
           </Box>
  </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           boxShadow: '0 4px 20px rgba(236, 72, 153, 0.2)',
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
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, color: 'white' }}>
                 {processedData.totalEvaluaciones}
               </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500, color: 'white' }}>
      Total Evaluaciones
    </Typography>
             </Box>
             <AssessmentIcon sx={{ fontSize: 48, opacity: 0.9, color: 'white' }} />
           </Box>
         </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           boxShadow: '0 4px 20px rgba(14, 165, 233, 0.2)',
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
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, color: 'white' }}>
                 {processedData.evaluacionesRealizadas}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500, color: 'white' }}>
                 Realizadas
               </Typography>
             </Box>
             <RateReviewIcon sx={{ fontSize: 48, opacity: 0.9, color: 'white' }} />
           </Box>
  </Paper>

         <Paper elevation={0} sx={{ 
           borderRadius: 3, 
           p: 3, 
           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
           color: 'white',
           position: 'relative',
           overflow: 'hidden',
           boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
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
               <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, color: 'white' }}>
                 {processedData.promedioCalificacion.toFixed(1)}
    </Typography>
               <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500, color: 'white' }}>
                 Promedio Calificación
    </Typography>
             </Box>
             <StarIcon sx={{ fontSize: 48, opacity: 0.9, color: 'white' }} />
           </Box>
  </Paper>
       </Box>

      {/* Dos secciones principales */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Sección 1: Evaluar Estudiantes */}
        <Card sx={{ 
          borderRadius: 3, 
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <RateReviewIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" fontWeight={700}>
                Evaluar Estudiantes ({processedData.completados.length} proyectos completados)
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Evalúa el desempeño de los estudiantes en tus proyectos completados
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {processedData.completados.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <BusinessIcon sx={{ 
                  fontSize: 64, 
                  color: themeMode === 'dark' ? '#64748b' : '#cbd5e1', 
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 500,
                  color: themeMode === 'dark' ? '#ffffff' : 'text.secondary',
                  mb: 1
                }}>
                  No tienes proyectos completados aún
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                }}>
                  Una vez que completes proyectos, podrás evaluar a los estudiantes.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {processedData.completados.map((project) => (
                  <Paper key={project.id} elevation={0} sx={{ 
                    p: 2.5,
                    bgcolor: themeMode === 'dark' ? '#ffffff' : '#f8fafc',
                    borderRadius: 2,
                    border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#f8fafc' : '#f1f5f9',
                      borderColor: themeMode === 'dark' ? '#475569' : '#cbd5e1'
                    }
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ 
                      color: themeMode === 'dark' ? '#1e293b' : '#1e293b',
                      mb: 1
                    }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#64748b' : 'text.secondary',
                      mb: 2
                    }}>
                      {project.description || 'Sin descripción'}
                    </Typography>
                    
                    {/* Estudiantes del proyecto */}
                    {getProjectStudents(project.id).length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {getProjectStudents(project.id).map((student) => {
                          const isEvaluated = isStudentEvaluated(student.id, project.id);
                          return (
                            <Box key={student.id} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              p: 1.5,
                              bgcolor: themeMode === 'dark' ? '#f8fafc' : '#ffffff',
                              borderRadius: 1,
                              border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: isEvaluated ? '#10b981' : '#3b82f6',
                                  fontSize: '0.875rem'
                                }}>
                                  {student.name ? student.name.charAt(0).toUpperCase() : 'E'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500} sx={{ 
                                    color: themeMode === 'dark' ? '#1e293b' : '#1e293b'
                                  }}>
                                    {student.name || 'Sin nombre'}
                                  </Typography>
                                  <Chip 
                                    label={isEvaluated ? 'Evaluado' : 'Pendiente'} 
                                    size="small" 
                                    color={isEvaluated ? "success" : "warning"}
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                  />
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                variant={isEvaluated ? "outlined" : "contained"}
                                color={isEvaluated ? "success" : "primary"}
                                onClick={() => handleOpenEvaluar(student, project)}
                                sx={{ 
                                  borderRadius: 1.5, 
                                  textTransform: 'none',
                                  px: 2,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                                startIcon={isEvaluated ? <EditIcon /> : <RateReviewIcon />}
                              >
                                {isEvaluated ? 'Re-evaluar' : 'Evaluar'}
                              </Button>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 3, 
                        bgcolor: themeMode === 'dark' ? '#f8fafc' : '#f8fafc', 
                        borderRadius: 1,
                        border: themeMode === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1'
                      }}>
                        <PersonIcon sx={{ 
                          fontSize: 32, 
                          color: themeMode === 'dark' ? '#64748b' : '#cbd5e1', 
                          mb: 1 
                        }} />
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#1e293b' : 'text.secondary'
                        }}>
                          No hay estudiantes asignados
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Card>

        {/* Sección 2: Evaluaciones Realizadas */}
        <Card sx={{ 
          borderRadius: 3, 
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={700}>
                  Evaluaciones Realizadas ({processedData.evaluacionesRealizadas})
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                value={realizadasLimit}
                onChange={e => setRealizadasLimit(Number(e.target.value))}
                sx={{ 
                  minWidth: 110,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value={5}>Últimos 5</MenuItem>
                <MenuItem value={10}>Últimos 10</MenuItem>
                <MenuItem value={15}>Últimos 15</MenuItem>
                <MenuItem value={20}>Últimos 20</MenuItem>
                <MenuItem value={processedData.evaluacionesRealizadas}>Todos</MenuItem>
              </TextField>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Revisa las evaluaciones que has realizado a los estudiantes
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {processedData.evaluacionesRealizadas === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AssessmentIcon sx={{ 
                  fontSize: 64, 
                  color: themeMode === 'dark' ? '#64748b' : '#cbd5e1', 
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 500,
                  color: themeMode === 'dark' ? '#ffffff' : 'text.secondary',
                  mb: 1
                }}>
                  No hay evaluaciones realizadas aún
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                }}>
                  Comienza evaluando a los estudiantes de tus proyectos completados.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.values(evaluationsByProject).flat().filter(e => e.evaluator_type === 'company').slice(0, realizadasLimit).map((evalR, idx) => {
                  const student = estudiantes.find(s => s.id === evalR.student_id);
                  const project = processedData.completados.find(p => p.id === evalR.project_id);
                  return (
                    <Paper key={evalR.id || idx} elevation={0} sx={{ 
                      p: 2.5,
                      bgcolor: themeMode === 'dark' ? '#ffffff' : '#f8fafc',
                      borderRadius: 2,
                      border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#f8fafc' : '#f1f5f9',
                        borderColor: themeMode === 'dark' ? '#475569' : '#cbd5e1'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: '#3b82f6',
                          fontSize: '1rem'
                        }}>
                          {student?.name ? student.name.charAt(0).toUpperCase() : 'E'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ 
                            color: themeMode === 'dark' ? '#1e293b' : '#1e293b'
                          }}>
                            {student?.name || 'Sin nombre'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#64748b' : 'text.secondary'
                          }}>
                            {project?.title || 'Proyecto'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={evalR.score} readOnly size="small" />
                          <Typography variant="body2" fontWeight={600} sx={{ 
                            color: themeMode === 'dark' ? '#1e293b' : '#1e293b'
                          }}>
                            {evalR.score}/5
                          </Typography>
                        </Box>
                      </Box>
                      
                      {evalR.comments && (
                        <Typography variant="body2" sx={{ 
                          fontStyle: 'italic',
                          color: themeMode === 'dark' ? '#64748b' : 'text.secondary',
                          mb: 1
                        }}>
                          "{evalR.comments}"
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#64748b' : 'text.secondary'
                        }}>
                          Evaluado el: {formatDate(evalR.evaluation_date)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            if (student && project) {
                              handleOpenDetalle(student, project);
                            }
                          }}
                          sx={{ 
                            borderRadius: 1.5, 
                            textTransform: 'none',
                            px: 2,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                          startIcon={<VisibilityIcon />}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Card>
      </Box>





      {/* Modal de Evaluación */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            bgcolor: themeMode === 'dark' ? '#ffffff' : 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#ffffff' : '#f8fafc', 
          borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <RateReviewIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ 
              color: themeMode === 'dark' ? '#1e293b' : 'inherit'
            }}>
          {selectedStudent && selectedProject ? 
                `Evaluar a ${selectedStudent.name}` :
            'Evaluar Estudiante'
          }
            </Typography>
            <Typography variant="body2" sx={{ 
              color: themeMode === 'dark' ? '#64748b' : 'text.secondary'
            }}>
              Proyecto: {selectedProject?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ 
              color: themeMode === 'dark' ? '#1e293b' : 'inherit'
            }}>
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
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: themeMode === 'dark' ? '#ffffff' : '#f8fafc', 
          borderTop: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' 
        }}>
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
          sx: { 
            borderRadius: 3,
            bgcolor: themeMode === 'dark' ? '#ffffff' : 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#ffffff' : '#f8fafc', 
          borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6" fontWeight={700} sx={{ 
            color: themeMode === 'dark' ? '#1e293b' : 'inherit'
          }}>
          Detalles de Evaluación
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedStudent && selectedProject && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: '#3b82f6' }}>
                  {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: themeMode === 'dark' ? '#1e293b' : 'inherit'
                  }}>
                    {selectedStudent.name}
              </Typography>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#64748b' : 'text.secondary'
                  }}>
                    {selectedStudent.email}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#1e293b' : 'inherit' }}>
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
          sx: { 
            borderRadius: 3,
            bgcolor: themeMode === 'dark' ? '#ffffff' : 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#ffffff' : '#fef3c7', 
          borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <WarningIcon color="warning" />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ 
              color: themeMode === 'dark' ? '#1e293b' : '#92400e'
            }}>
              Reportar Strike
            </Typography>
            <Typography variant="body2" sx={{ 
              color: themeMode === 'dark' ? '#64748b' : '#92400e'
            }}>
              {selectedStudent?.name} - {selectedProject?.title}
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
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: themeMode === 'dark' ? '#ffffff' : '#fef3c7', 
          borderTop: themeMode === 'dark' ? '1px solid #334155' : '1px solid #fbbf24' 
        }}>
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