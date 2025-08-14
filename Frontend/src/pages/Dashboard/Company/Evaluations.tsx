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
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../services/api.service';
import ProjectDetailsModal from '../../../components/common/ProjectDetailsModal';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useStudentProfileDetails } from '../../../hooks/useStudentProfileDetails';

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

interface StudentToEvaluate {
  student_id: string;
  student_name: string;
  student_email: string;
  project_id: string;
  project_title: string;
  project_description: string;
  completion_date: string;
  already_evaluated: boolean;
  evaluation_id?: string;
  score?: number;
}

interface CompletedEvaluation {
  id: string;
  score: number;
  comments: string;
  evaluation_date: string;
  student_name: string;
  student_id: string;
  project_title: string;
  project_id: string;
}

export const Evaluations = () => {
  const { themeMode } = useTheme();
  const [studentsToEvaluate, setStudentsToEvaluate] = useState<StudentToEvaluate[]>([]);
  const [completedEvaluations, setCompletedEvaluations] = useState<CompletedEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedStudent, setSelectedStudent] = useState<StudentToEvaluate | null>(null);
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [calificarModalOpen, setCalificarModalOpen] = useState(false);
  const [showLatest, setShowLatest] = useState(5);
  const [showStudentsToEvaluate, setShowStudentsToEvaluate] = useState(5);
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);
  
  // Estados para el modal de strike
  const [strikeModalOpen, setStrikeModalOpen] = useState(false);
  const [selectedStudentForStrike, setSelectedStudentForStrike] = useState<StudentToEvaluate | null>(null);
  const [strikeReason, setStrikeReason] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Hook para obtener el perfil detallado del estudiante
  const { profile: studentProfile, loading: profileLoading, error: profileError } = useStudentProfileDetails(selectedStudentId);


  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Debug: monitorear cambios en el estado del modal
  useEffect(() => {
    console.log('🔍 Estado del modal de calificación cambió:', calificarModalOpen);
  }, [calificarModalOpen]);

  const loadData = async () => {
    setLoading(true);
    setLoadingEvaluations(true);
    
    try {
      // Cargar estudiantes que puede evaluar (NO evaluados)
      const studentsResponse = await apiService.getCompanyStudentsToEvaluate();
      console.log('🔍 Respuesta del endpoint estudiantes para evaluar:', studentsResponse);
      
      // Cargar evaluaciones ya realizadas
      let completedEvaluationsResponse;
      try {
        completedEvaluationsResponse = await apiService.getCompanyCompletedEvaluations();
        console.log('🔍 Respuesta del endpoint evaluaciones completadas:', completedEvaluationsResponse);
      } catch (error) {
        console.error('❌ Error cargando evaluaciones completadas:', error);
        completedEvaluationsResponse = { success: false, data: [] };
      }
      
      let studentsToEvaluateData: StudentToEvaluate[] = [];
      let completedEvaluationsData: CompletedEvaluation[] = [];
      
      // Procesar estudiantes para evaluar
      if (studentsResponse && typeof studentsResponse === 'object' && 'success' in studentsResponse && studentsResponse.success && 'data' in studentsResponse) {
        const students = studentsResponse.data as any[];
        studentsToEvaluateData = students.map(student => ({
          student_id: student.student_id,
          student_name: student.student_name,
          student_email: student.student_email,
          project_id: student.project_id,
          project_title: student.project_title,
          project_description: student.project_description || '',
          completion_date: student.completion_date,
          already_evaluated: student.already_evaluated,
          evaluation_id: student.evaluation_id,
          score: student.score || 0
        }));
        console.log('✅ Estudiantes para evaluar cargados:', studentsToEvaluateData.length);
      }
      
      // Procesar evaluaciones completadas
      if (completedEvaluationsResponse && typeof completedEvaluationsResponse === 'object' && 'success' in completedEvaluationsResponse && completedEvaluationsResponse.success && 'data' in completedEvaluationsResponse) {
        const evaluations = completedEvaluationsResponse.data as any[];
        completedEvaluationsData = evaluations.map(evaluation => ({
          id: evaluation.id,
          score: evaluation.score || 0,
          comments: evaluation.comments || '',
          evaluation_date: evaluation.evaluation_date,
          student_name: evaluation.student_name,
          student_id: evaluation.student_id,
          project_title: evaluation.project_title,
          project_id: evaluation.project_id
        }));
        console.log('✅ Evaluaciones completadas cargadas:', completedEvaluationsData.length);
      }
      
      setStudentsToEvaluate(studentsToEvaluateData);
      setCompletedEvaluations(completedEvaluationsData);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingEvaluations(false);
    }
  };

  // Filtrar estudiantes por evaluar (no evaluados)
  const studentsToEvaluateFiltered = studentsToEvaluate.filter(student => !student.already_evaluated);
  const studentsEvaluated = studentsToEvaluate.filter(student => student.already_evaluated);
  
  // Obtener estadísticas del dashboard si están disponibles
  const { data: dashboardStats } = useDashboardStats('company');
  
  // Usar estadísticas del dashboard para las tarjetas si están disponibles, con validación básica
  const evaluationsPending = (dashboardStats?.evaluations_pending >= 0) ? dashboardStats.evaluations_pending : studentsToEvaluateFiltered.length;
  const evaluationsCompleted = (dashboardStats?.evaluations_completed >= 0) ? dashboardStats.evaluations_completed : studentsEvaluated.length;
  const evaluationsTotalStudents = (dashboardStats?.evaluations_total_students >= 0) ? dashboardStats.evaluations_total_students : studentsToEvaluate.length;
  
  // Debug: monitorear estadísticas del dashboard
  console.log('🔍 [Evaluations] Dashboard Stats:', {
    dashboardStats,
    evaluationsPending,
    evaluationsCompleted,
    evaluationsTotalStudents,
    fallbackValues: {
      studentsToEvaluateFiltered: studentsToEvaluateFiltered.length,
      studentsEvaluated: studentsEvaluated.length,
      studentsToEvaluate: studentsToEvaluate.length
    }
  });

  const handleCalificarEstudiante = async () => {
    console.log('🚀 Iniciando evaluación para:', selectedStudent?.student_name, 'con calificación:', calificacion);
    
    if (!selectedStudent || !calificacion) {
      console.log('❌ Validación fallida: selectedStudent o calificacion es null');
      setSnackbar({
        open: true,
        message: 'Por favor selecciona una calificación',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('📡 Enviando evaluación a la API...');
      const response = await apiService.companyEvaluateStudent({
        student_id: selectedStudent.student_id,
        project_id: selectedStudent.project_id,
        score: calificacion,
        comments: '' // Sin comentarios, solo calificación
      });

      console.log('📥 Respuesta de la API recibida:', response);
      
      // El backend devuelve status 201 y un mensaje de éxito
      if (response && typeof response === 'object' && 'message' in response && response.message === 'Evaluación enviada correctamente') {
        console.log('✅ Evaluación exitosa, cerrando modal...');
        
        setSnackbar({
          open: true,
          message: 'Evaluación enviada correctamente',
          severity: 'success'
        });
        
        // Cerrar modal inmediatamente
        setCalificarModalOpen(false);
        setSelectedStudent(null);
        setCalificacion(null);
        
        console.log('🔒 Estado del modal después de cerrar:', false);
        
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
          errorMessage = 'Ya has evaluado este estudiante para este proyecto';
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
    console.log('🔒 Cerrando modal manualmente...');
    setCalificarModalOpen(false);
    setSelectedStudent(null);
    setCalificacion(null);
  };

  const handleOpenCalificarModal = (student: StudentToEvaluate) => {
    console.log('🔓 Abriendo modal para calificar:', student.student_name);
    setSelectedStudent(student);
    setCalificarModalOpen(true);
  };

  const handleViewProjectDetails = async (student: StudentToEvaluate) => {
    try {
      console.log('🔍 Abriendo detalles del proyecto:', student.project_id);
      const projectData = await apiService.getProjectDetails(student.project_id);
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

  // Funciones para manejar el modal de strike
  const handleOpenStrikeModal = (student: StudentToEvaluate) => {
    setSelectedStudentForStrike(student);
    setStrikeReason('');
    setStrikeModalOpen(true);
  };

  const handleViewProfile = (student: StudentToEvaluate) => {
    console.log('🔍 Abriendo perfil del estudiante:', student);
    setSelectedStudentId(student.student_id);
    setShowProfileDialog(true);
  };

  const handleCloseStrikeModal = () => {
    setStrikeModalOpen(false);
    setSelectedStudentForStrike(null);
    setStrikeReason('');
  };

  const handleSubmitStrike = async () => {
    if (!selectedStudentForStrike) {
      setSnackbar({
        open: true,
        message: 'Error: No se seleccionó un estudiante',
        severity: 'error'
      });
      return;
    }

    if (!strikeReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor completa el motivo del strike',
        severity: 'error'
      });
      return;
    }

    if (strikeReason.trim().length < 10) {
      setSnackbar({
        open: true,
        message: 'El motivo del strike debe tener al menos 10 caracteres',
        severity: 'error'
      });
      return;
    }

    try {
      await apiService.createStrikeReport({
        student_id: selectedStudentForStrike.student_id,
        project_id: selectedStudentForStrike.project_id,
        reason: strikeReason.trim()
      });

      setSnackbar({
        open: true,
        message: 'Reporte de strike enviado correctamente. Será revisado por administración.',
        severity: 'success'
      });

      handleCloseStrikeModal();
    } catch (error) {
      console.error('Error enviando reporte de strike:', error);
      setSnackbar({
        open: true,
        message: 'Error al enviar el reporte de strike. Inténtalo de nuevo.',
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
                  Evaluaciones de Estudiantes
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Gestiona las evaluaciones de estudiantes que han trabajado en tus proyectos
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
                {evaluationsPending}
               </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Pendientes de Evaluar
    </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Estudiantes que requieren tu calificación
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
                {evaluationsCompleted}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Evaluaciones Realizadas
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Estudiantes que ya has calificado
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
                <PersonIcon sx={{ fontSize: 32, mr: 1 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {evaluationsTotalStudents}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Total Estudiantes
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Estudiantes en proyectos completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        

      </Grid>

      {/* Sección de Evaluar Estudiantes */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RateReviewIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={700}>
                Evaluar Estudiantes ({studentsToEvaluateFiltered.length} estudiantes por evaluar)
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                value={showStudentsToEvaluate}
                onChange={e => setShowStudentsToEvaluate(Number(e.target.value))}
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
                <MenuItem value={50}>Últimos 50</MenuItem>
                <MenuItem value={100}>Últimos 100</MenuItem>
                <MenuItem value={studentsToEvaluateFiltered.length}>Todas</MenuItem>
              </TextField>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Califica a los estudiantes que han trabajado en tus proyectos completados
            </Typography>
          </Box>
          
        {loadingEvaluations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : studentsToEvaluateFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: themeMode === 'dark' ? '#10b981' : '#059669', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ¡Excelente! Ya has evaluado todos tus estudiantes
                </Typography>
            <Typography variant="body2" color="text.secondary">
              Revisa tus evaluaciones realizadas en la sección de abajo.
                </Typography>
              </Box>
            ) : (
          <Grid container spacing={2}>
            {studentsToEvaluateFiltered.slice(0, showStudentsToEvaluate).map((student) => (
              <Grid item xs={12} sm={6} md={4} key={`${student.student_id}-${student.project_id}`}>
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
                          {student.student_name}
                    </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6', width: 24, height: 24 }}>
                            <PersonIcon fontSize="small" />
                        </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {student.student_email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Proyecto:</strong> {student.project_title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {student.project_description?.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Completado: {new Date(student.completion_date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonIcon />}
                          onClick={() => handleViewProfile(student)}
                          sx={{ 
                            borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                            color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                            '&:hover': {
                              borderColor: themeMode === 'dark' ? '#3b82f6' : '#2563eb',
                              bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                            }
                          }}
                        >
                          Ver Perfil
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewProjectDetails(student)}
                          sx={{ 
                            bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb',
                            color: '#ffffff',
                            '&:hover': {
                              bgcolor: themeMode === 'dark' ? '#2563eb' : '#1d4ed8'
                            }
                          }}
                        >
                          Ver detalle
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<StarIcon />}
                          onClick={() => handleOpenCalificarModal(student)}
                          sx={{
                            bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                            '&:hover': {
                              bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                            }
                          }}
                        >
                          Evaluar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<WarningIcon />}
                          onClick={() => handleOpenStrikeModal(student)}
                          sx={{
                            borderColor: themeMode === 'dark' ? '#ef4444' : '#dc2626',
                            color: themeMode === 'dark' ? '#ef4444' : '#dc2626',
                            '&:hover': {
                              borderColor: themeMode === 'dark' ? '#dc2626' : '#b91c1c',
                              bgcolor: themeMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'
                            }
                          }}
                        >
                          Reportar Strike
                        </Button>
                      </Box>
              </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
            )}
        </Card>

      {/* Sección de Evaluaciones Realizadas */}
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
                Evaluaciones Realizadas ({studentsEvaluated.length})
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
              <MenuItem value={studentsEvaluated.length}>Todos</MenuItem>
              </TextField>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Revisa las evaluaciones que has realizado a los estudiantes
            </Typography>
          </Box>
        {studentsEvaluated.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
                  No hay evaluaciones realizadas aún
                </Typography>
              </Box>
            ) : (
          <Grid container spacing={2}>
            {studentsEvaluated.slice(0, showLatest).map((student) => (
              <Grid item xs={12} sm={6} md={4} key={`${student.student_id}-${student.project_id}`}>
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
                          {student.student_name}
                          </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#10b981' : '#10b981', width: 24, height: 24 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {student.student_email}
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
                      <StarRating value={student.score || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {student.score ? `${student.score}/5` : 'N/A'}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Proyecto:</strong> {student.project_title}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Evaluado el: {new Date(student.completion_date).toLocaleDateString()}
                        </Typography>
                        <Button
                        variant="contained"
                          size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProjectDetails(student)}
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

      {/* Modal para calificar estudiante */}
      <Dialog
        key={`calificar-modal-${calificarModalOpen}-${selectedStudent?.student_id || 'none'}`}
        open={calificarModalOpen} 
        onClose={handleCloseCalificarModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            <Typography variant="h6">
              Calificar Estudiante
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Información del estudiante y proyecto */}
                <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Estudiante: {selectedStudent.student_name}
              </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {selectedStudent.student_email}
                  </Typography>
                <Typography variant="body2" color="text.secondary">
                Proyecto: {selectedStudent.project_title}
              </Typography>
              </Box>

              {/* Calificación con estrellas */}
                    <Box>
                <Typography variant="subtitle1" gutterBottom>
                  ¿Cómo calificarías el desempeño de este estudiante?
                      </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <StarRating
                    value={calificacion}
                    onChange={(newValue) => {
                      console.log('⭐ Calificación seleccionada:', newValue);
                      setCalificacion(newValue);
                    }}
                    size="large"
                  />
                      <Typography variant="body2" color="text.secondary">
                    {calificacion ? `${calificacion} de 5 estrellas` : 'Selecciona una calificación'}
                      </Typography>
                    </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalificarModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCalificarEstudiante} 
            variant="contained" 
            color="primary"
            disabled={!selectedStudent || !calificacion}
          >
            Enviar Evaluación {calificacion ? `(${calificacion}/5)` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para reportar strike */}
      <Dialog
        open={strikeModalOpen} 
        onClose={handleCloseStrikeModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6">
              Reportar Strike
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudentForStrike && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Información del estudiante y proyecto */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Estudiante: {selectedStudentForStrike.student_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {selectedStudentForStrike.student_email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proyecto: {selectedStudentForStrike.project_title}
                </Typography>
              </Box>

              {/* Motivo del strike */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Motivo del strike *
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                  Ejemplo: "No cumplió con los plazos establecidos del proyecto, entregó el trabajo 2 semanas tarde sin justificación válida"
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  placeholder="Describe detalladamente el motivo del strike..."
                  variant="outlined"
                  required
                  error={strikeReason.trim() === '' || (strikeReason.trim() !== '' && strikeReason.trim().length < 10)}
                  helperText={
                    strikeReason.trim() === '' 
                      ? 'El motivo del strike es obligatorio' 
                      : strikeReason.trim().length < 10 
                        ? `Mínimo 10 caracteres (${strikeReason.trim().length}/10)` 
                        : ''
                  }
                />
              </Box>


            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStrikeModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitStrike} 
            variant="contained" 
            color="error"
            disabled={!selectedStudentForStrike || !strikeReason.trim() || strikeReason.trim().length < 10}
            sx={{ 
              minWidth: 140,
              '&:disabled': {
                opacity: 0.6
              }
            }}
          >
            {strikeReason.trim() && strikeReason.trim().length >= 10 
              ? 'Enviar Reporte' 
              : strikeReason.trim() 
                ? 'Mínimo 10 caracteres' 
                : 'Completa el motivo'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de perfil del estudiante */}
      <Dialog 
        open={showProfileDialog} 
        onClose={() => setShowProfileDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', 
          borderBottom: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            Perfil Completo del Estudiante
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : profileError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Error al cargar el perfil del estudiante: {profileError}
            </Alert>
          ) : studentProfile ? (
            <Box sx={{ pt: 2 }}>
              {/* Información básica del estudiante */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3,
                p: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                borderRadius: 2,
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
              }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: '#3b82f6',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  {studentProfile.student?.name?.charAt(0).toUpperCase() || 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    {studentProfile.student?.name || 'Nombre no disponible'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {studentProfile.student?.email || 'Email no disponible'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    Teléfono: {studentProfile.student?.phone || 'No disponible'}
                  </Typography>
                </Box>
              </Box>

              {/* Información personal */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Información Personal
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Fecha de Nacimiento:</strong><br />
                    {studentProfile.perfil_detallado?.fecha_nacimiento || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Género:</strong><br />
                    {studentProfile.perfil_detallado?.genero || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Carrera:</strong><br />
                    {studentProfile.student?.career || 'No disponible'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Universidad:</strong><br />
                    {studentProfile.student?.university || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Nivel Educativo:</strong><br />
                    {studentProfile.student?.education_level || 'No disponible'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Habilidades básicas */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Habilidades Básicas
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Habilidades:</strong><br />
                    {studentProfile.student?.skills && studentProfile.student.skills.length > 0 ? (
                      studentProfile.student.skills.map((skill: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))
                    ) : (
                      'No hay habilidades registradas'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Idiomas:</strong><br />
                    {studentProfile.student?.languages && studentProfile.student.languages.length > 0 ? (
                      studentProfile.student.languages.map((language: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={language} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))
                    ) : (
                      'No hay idiomas registrados'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Área de Interés:</strong><br />
                    {studentProfile.student?.area || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Modalidad:</strong><br />
                    {studentProfile.student?.modality || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Información académica */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Información Académica
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Semestre:</strong><br />
                    {studentProfile.student?.semester || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Estado:</strong><br />
                    {studentProfile.student?.status || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Horas Semanales:</strong><br />
                    {studentProfile.student?.hours_per_week || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Experiencia Previa:</strong><br />
                    {studentProfile.student?.experience_years || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Carta de presentación */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Carta de Presentación
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                borderRadius: 2,
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', fontStyle: 'italic' }}>
                  {studentProfile.student?.bio || 'No se ha proporcionado carta de presentación'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No se pudo cargar el perfil del estudiante
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setShowProfileDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles del proyecto */}
      <ProjectDetailsModal
        open={projectDetailsModalOpen}
        onClose={() => setProjectDetailsModalOpen(false)}
        project={selectedProjectForDetails}
        userRole="company"
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