import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Star as StarIcon,
  RateReview as RateReviewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../services/api.service';
import ProjectDetailsModal from '../../../components/common/ProjectDetailsModal';

// Componente de estrellas personalizado
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating = ({ value, onChange, readOnly = false, size = 'medium' }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const starSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  
  const handleClick = (starValue: number) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (!readOnly) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconButton
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readOnly}
          sx={{
            p: 0,
            color: star <= displayValue ? '#fbbf24' : '#d1d5db',
            '&:hover': {
              color: !readOnly ? '#fbbf24' : '#d1d5db',
            },
            '&.Mui-disabled': {
              color: star <= displayValue ? '#fbbf24' : '#d1d5db',
            },
          }}
        >
          <StarIcon sx={{ fontSize: starSize }} />
        </IconButton>
      ))}
    </Box>
  );
};

interface Evaluation {
  id: string;
  projectTitle: string;
  company: string;
  evaluator: string;
  evaluatorRole: string;
  date: string;
  status: 'completed' | 'pending';
  type: 'intermediate' | 'final';
  overallRating: number | null;
  categories: Array<{
    name: string;
    rating: number | null;
    icon: React.ReactNode;
  }>;
  comments: string | null;
  strengths: string[] | null;
  areasForImprovement: string[] | null;
  projectDuration: string;
  technologies: string[];
  deliverables: string[];
}

interface CompanyRating {
  id: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
  project_title?: string;
}

interface CompletedProject {
  project_id: string;
  project_title: string;
  project_description: string;
  company_id: string;
  company_name: string;
  completion_date: string;
  already_rated: boolean;
  rating?: number | null | undefined;
  rating_id?: string;
}

const typeConfig = {
  intermediate: {
    label: 'Intermedia',
    color: 'info',
  },
  final: {
    label: 'Final',
    color: 'primary',
  },
};

export const Evaluations = () => {
  const { themeMode } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [calificarModalOpen, setCalificarModalOpen] = useState(false);
  const [showLatest, setShowLatest] = useState(5);
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadingProjects(true);
    
    try {
      // Cargar proyectos completados que puede evaluar (NO evaluados)
      const projectsResponse = await apiService.getStudentCompaniesToEvaluate();
      console.log('🔍 Respuesta del endpoint proyectos para evaluar:', projectsResponse);
      
      // Cargar evaluaciones ya realizadas
      let completedEvaluationsResponse;
      try {
        completedEvaluationsResponse = await apiService.getStudentCompletedEvaluations();
        console.log('🔍 Respuesta del endpoint evaluaciones completadas:', completedEvaluationsResponse);
      } catch (error) {
        console.error('❌ Error cargando evaluaciones completadas:', error);
        completedEvaluationsResponse = { success: false, data: [] };
      }
      
      let projectsToEvaluate: CompletedProject[] = [];
      let evaluatedProjects: CompletedProject[] = [];
      
      // Procesar proyectos para evaluar
      if (projectsResponse && typeof projectsResponse === 'object' && 'success' in projectsResponse && projectsResponse.success && 'data' in projectsResponse) {
        const companies = projectsResponse.data as any[];
        projectsToEvaluate = companies.map(company => ({
          project_id: company.project_id,
          project_title: company.project_title,
          project_description: company.project_description || '',
          company_id: company.company_id,
          company_name: company.company_name,
          completion_date: company.completion_date,
          already_rated: false, // Estos son proyectos NO evaluados
          rating: undefined,
          rating_id: undefined
        }));
        console.log('✅ Proyectos para evaluar cargados:', projectsToEvaluate.length);
      }
      
      // Procesar evaluaciones completadas
      console.log('🔍 Tipo de respuesta evaluaciones completadas:', typeof completedEvaluationsResponse);
      console.log('🔍 ¿Es objeto?', typeof completedEvaluationsResponse === 'object');
      console.log('🔍 ¿Tiene success?', completedEvaluationsResponse && 'success' in completedEvaluationsResponse);
      console.log('🔍 ¿Tiene data?', completedEvaluationsResponse && 'data' in completedEvaluationsResponse);
      
      if (completedEvaluationsResponse && typeof completedEvaluationsResponse === 'object' && 'success' in completedEvaluationsResponse && completedEvaluationsResponse.success && 'data' in completedEvaluationsResponse) {
        const companies = completedEvaluationsResponse.data as any[];
        console.log('🔍 Datos de evaluaciones completadas:', companies);
        evaluatedProjects = companies.map(company => ({
          project_id: company.project_id,
          project_title: company.project_title,
          project_description: company.project_description || '',
          company_id: company.company_id,
          company_name: company.company_name,
          completion_date: company.completion_date,
          already_rated: true, // Estos son proyectos YA evaluados
          rating: company.rating ? Number(company.rating) : undefined,
          rating_id: company.evaluation_id
        }));
        console.log('✅ Evaluaciones completadas cargadas:', evaluatedProjects.length);
      } else {
        console.log('⚠️ Respuesta de evaluaciones completadas no válida:', completedEvaluationsResponse);
      }
      
      // Combinar ambos arrays para mantener compatibilidad
      const allProjects = [...projectsToEvaluate, ...evaluatedProjects];
      setCompletedProjects(allProjects);
      
      // Cargar evaluaciones recibidas (esto necesitaría un endpoint específico)
      // Por ahora usamos datos de ejemplo
      setEvaluations([]);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingProjects(false);
    }
  };

  const handleAction = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setDialogOpen(true);
  };

  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
  const averageRating = '0';
  
  // Usar directamente los arrays separados del backend
  const projectsToEvaluate = completedProjects ? completedProjects.filter(project => !project.already_rated) : [];
  const evaluatedProjects = completedProjects ? completedProjects.filter(project => project.already_rated) : [];
  
  // Debug: Log de separación de proyectos
  console.log('🔍 [DEBUG] Total proyectos:', completedProjects?.length || 0);
  console.log('🔍 [DEBUG] Proyectos para evaluar:', projectsToEvaluate.length);
  console.log('🔍 [DEBUG] Proyectos evaluados:', evaluatedProjects.length);

  const handleCalificarEmpresa = async () => {
    if (!selectedProject || !calificacion) {
      setSnackbar({
        open: true,
        message: 'Por favor selecciona una calificación',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await apiService.studentEvaluateCompany({
        company_id: selectedProject.company_id,
        project_id: selectedProject.project_id,
        rating: calificacion,
        comments: '' // Sin comentarios, solo calificación
      });

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setSnackbar({
          open: true,
          message: 'Evaluación enviada correctamente',
          severity: 'success'
        });
        
        // Cerrar modal inmediatamente
        setCalificarModalOpen(false);
        setSelectedProject(null);
        setCalificacion(null);
        
        // Recargar datos para actualizar la lista
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        setSnackbar({
          open: true,
          message: (response && typeof response === 'object' && 'message' in response ? response.message as string : 'Error al enviar la evaluación') || 'Error al enviar la evaluación',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error enviando evaluación:', error);
      let errorMessage = 'Error al enviar la evaluación';
      let severity: 'error' | 'warning' = 'error';
      
      if (error instanceof Error) {
        if (error.message.includes('Ya has evaluado')) {
          errorMessage = 'Ya has evaluado esta empresa para este proyecto';
          severity = 'warning';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: severity
      });
    }
  };

  const handleCloseCalificarModal = () => {
    setCalificarModalOpen(false);
    setSelectedProject(null);
    setCalificacion(null);
  };

  const handleOpenCalificarModal = (project: CompletedProject) => {
    setSelectedProject(project);
    setCalificarModalOpen(true);
  };

  const handleViewProjectDetails = async (project: CompletedProject) => {
    try {
      console.log('🔍 Abriendo detalles del proyecto:', project.project_id);
      const projectData = await apiService.getProjectDetails(project.project_id);
      console.log('🔍 Datos del proyecto recibidos:', projectData);
      
      if (projectData) {
        setSelectedProjectForDetails(projectData);
        setProjectDetailsModalOpen(true);
      } else {
        throw new Error('No se recibieron datos del proyecto');
      }
    } catch (error) {
      console.error('Error obteniendo detalles del proyecto:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los detalles del proyecto. Inténtalo de nuevo.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar mensaje cuando no hay empresas para evaluar
  if (!loading && projectsToEvaluate.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          No hay empresas para evaluar
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Ya has evaluado todos tus proyectos completados. Revisa tu historial de evaluaciones realizadas.
        </Typography>
        <Button variant="contained" onClick={loadData}>
          Actualizar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
                <RateReviewIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Mis Evaluaciones
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Gestiona tus evaluaciones recibidas y califica a las empresas
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
              : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#1e40af',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(59, 130, 246, 0.3)' 
              : '0 4px 20px rgba(59, 130, 246, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(59, 130, 246, 0.4)' 
                : '0 8px 32px rgba(59, 130, 246, 0.25)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <RateReviewIcon sx={{ fontSize: 32, mr: 1 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {projectsToEvaluate.length}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Pendientes de Evaluar
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Proyectos que requieren tu calificación
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#16a34a',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(16, 185, 129, 0.3)' 
              : '0 4px 20px rgba(16, 185, 129, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(16, 185, 129, 0.4)' 
                : '0 8px 32px rgba(16, 185, 129, 0.25)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {evaluatedProjects.length}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Evaluaciones Realizadas
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Proyectos que ya has calificado
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
              : 'linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#7c3aed',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(139, 92, 246, 0.3)' 
              : '0 4px 20px rgba(139, 92, 246, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(139, 92, 246, 0.4)' 
                : '0 8px 32px rgba(139, 92, 246, 0.25)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {completedProjects?.length || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Total Proyectos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Proyectos completados en total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Evaluaciones de Empresas */}
      <Card sx={{ 
        mb: 4, 
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
              Evaluar Empresas ({projectsToEvaluate.length} proyectos por evaluar)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Califica a las empresas con las que has trabajado en proyectos completados
          </Typography>
        </Box>

        {loadingProjects ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : projectsToEvaluate.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: themeMode === 'dark' ? '#10b981' : '#059669', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ¡Excelente! Ya has evaluado todos tus proyectos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revisa tus evaluaciones realizadas en la sección de abajo.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {projectsToEvaluate.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative',
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                    : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                  border: themeMode === 'dark' ? '1px solid #6b7280' : '1px solid #d1d5db',
                  boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(96, 165, 250, 0.4)' 
                      : '0 8px 32px rgba(59, 130, 246, 0.2)',
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {project.project_title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {project.company_name}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Los proyectos ya evaluados no aparecen en esta sección */}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.project_description?.substring(0, 100)}...
                    </Typography>

                                                              {/* Los proyectos ya evaluados no aparecen en esta sección */}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Completado: {new Date(project.completion_date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewProjectDetails(project)}
                          sx={{
                            bgcolor: project.already_rated 
                              ? (themeMode === 'dark' ? '#10b981' : '#059669')
                              : (themeMode === 'dark' ? '#3b82f6' : '#2563eb'),
                            color: themeMode === 'dark' ? '#ffffff' : '#ffffff',
                            '&:hover': {
                              bgcolor: project.already_rated 
                                ? (themeMode === 'dark' ? '#059669' : '#047857')
                                : (themeMode === 'dark' ? '#2563eb' : '#1d4ed8')
                            }
                          }}
                        >
                          Ver detalle
                        </Button>
                        {!project.already_rated && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<StarIcon />}
                            onClick={() => handleOpenCalificarModal(project)}
                            sx={{
                              bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                              '&:hover': {
                                bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                              }
                            }}
                          >
                            Evaluar
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>

      {/* Evaluaciones Recibidas */}
      <Card sx={{ 
        mb: 4, 
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
                Evaluaciones Realizadas ({evaluatedProjects.length})
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              value={showLatest}
              onChange={e => setShowLatest(Number(e.target.value))}
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
              <MenuItem value={evaluatedProjects.length}>Todos</MenuItem>
            </TextField>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Revisa las evaluaciones que has realizado a las empresas
          </Typography>
        </Box>
        {evaluatedProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay evaluaciones realizadas aún
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {evaluatedProjects.slice(0, showLatest).map((project) => (
                              <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                  <Card sx={{ 
                    height: '100%', 
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
                    boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: themeMode === 'dark' 
                        ? '0 8px 32px rgba(16, 185, 129, 0.3)' 
                        : '0 8px 32px rgba(16, 185, 129, 0.15)',
                      borderColor: themeMode === 'dark' ? '#10b981' : '#10b981'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {project.project_title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#10b981' : '#10b981', width: 24, height: 24 }}>
                              <BusinessIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" color="text.secondary">
                              {project.company_name}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Evaluado"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StarRating value={project.rating || 0} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {project.rating}/5
                        </Typography>
                      </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.project_description?.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Evaluado el: {new Date(project.completion_date).toLocaleDateString()}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProjectDetails(project)}
                        sx={{
                          bgcolor: themeMode === 'dark' ? '#10b981' : '#059669',
                          color: '#ffffff',
                          '&:hover': {
                            bgcolor: themeMode === 'dark' ? '#059669' : '#047857'
                          }
                        }}
                      >
                        Ver detalle
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>

      {/* Evaluaciones Pendientes */}
      {pendingEvaluations.length > 0 && (
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#fb923c' : '#ea580c' }} />
              Evaluaciones Pendientes ({pendingEvaluations.length})
            </Typography>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={showLatest}
              onChange={e => setShowLatest(Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={15}>Últimos 15</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={pendingEvaluations.length}>Todos</MenuItem>
            </TextField>
          </Box>
          <Grid container spacing={2}>
            {pendingEvaluations.slice(0, showLatest).map((evaluation) => (
              <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
                <Card sx={{ 
                  height: '100%', 
                  opacity: 0.8,
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
                  boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(251, 146, 60, 0.3)' 
                      : '0 8px 32px rgba(251, 146, 60, 0.15)',
                    borderColor: themeMode === 'dark' ? '#fb923c' : '#ea580c'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#fb923c' : '#ea580c', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="Pendiente"
                        color="warning"
                        size="small"
                        sx={{ 
                          bgcolor: themeMode === 'dark' ? '#ea580c' : '#fed7aa',
                          color: themeMode === 'dark' ? '#ffffff' : '#ea580c',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Evaluación en proceso...
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {evaluation.date} • {evaluation.projectDuration}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Dialog para mostrar detalles de la evaluación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles de la Evaluación
            </Typography>
            <Chip
              label={selectedEvaluation?.status === 'completed' ? 'Completada' : 'Pendiente'}
              color={selectedEvaluation?.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedEvaluation.projectTitle}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Información General y Calificación */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Información General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Información del Proyecto
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <BusinessIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Empresa"
                              secondary={selectedEvaluation.company}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Evaluador"
                              secondary={`${selectedEvaluation.evaluator} - ${selectedEvaluation.evaluatorRole}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Fecha"
                              secondary={selectedEvaluation.date}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Duración"
                              secondary={selectedEvaluation.projectDuration}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Calificación General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Calificación General
                        </Typography>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <StarRating value={selectedEvaluation.overallRating || 0} readOnly size="large" />
                            <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
                              {selectedEvaluation.overallRating || 0}/5
                            </Typography>
                          </Box>
                        <Typography variant="body2" color="text.secondary">
                          Evaluación {typeConfig[selectedEvaluation.type as keyof typeof typeConfig].label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Comentarios */}
                {selectedEvaluation.comments && (
                  <Box>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Comentarios del Evaluador
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3 }}>
                          "{selectedEvaluation.comments}"
                        </Typography>

                        {selectedEvaluation.strengths && selectedEvaluation.strengths.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main' }}>
                              Fortalezas
                            </Typography>
                            <List dense>
                              {selectedEvaluation.strengths.map((strength: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckCircleIcon color="success" />
                                  </ListItemIcon>
                                  <ListItemText primary={strength} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {selectedEvaluation.areasForImprovement && selectedEvaluation.areasForImprovement.length > 0 && (
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'warning.main' }}>
                              Áreas de Mejora
                            </Typography>
                            <List dense>
                              {selectedEvaluation.areasForImprovement.map((area: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <AccessTimeIcon color="warning" />
                                  </ListItemIcon>
                                  <ListItemText primary={area} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para calificar empresa */}
      <Dialog 
        open={calificarModalOpen} 
        onClose={handleCloseCalificarModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            <Typography variant="h6">
              Calificar Empresa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Información del proyecto */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Proyecto: {selectedProject.project_title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Empresa: {selectedProject.company_name}
                </Typography>
              </Box>

              {/* Calificación con estrellas */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  ¿Cómo calificarías tu experiencia con esta empresa?
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <StarRating
                    value={calificacion}
                    onChange={(newValue) => setCalificacion(newValue)}
                    size="large"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {calificacion ? `${calificacion} de 5 estrellas` : 'Selecciona una calificación'}
                  </Typography>
                </Box>
              </Box>

              {/* Solo calificación con estrellas - sin comentarios */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalificarModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCalificarEmpresa} 
            variant="contained" 
            color="primary"
            disabled={!selectedProject || !calificacion}
          >
            Enviar Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles del proyecto */}
      <ProjectDetailsModal
        open={projectDetailsModalOpen}
        onClose={() => setProjectDetailsModalOpen(false)}
        project={selectedProjectForDetails}
        userRole="student"
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Evaluations; 