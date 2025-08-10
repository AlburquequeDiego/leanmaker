import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { Evaluation } from '../../../types';

interface EvaluationData {
  id: string;
  evaluation_type: 'company_to_student' | 'student_to_company';
  score: number;
  comments: string;
  status: 'pending' | 'completed' | 'flagged';
  evaluation_date: string;
  project_id: string;
  project_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  company_id: string;
  company_name: string;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_role: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  results: EvaluationData[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const GestionEvaluacionesAdmin = () => {
  const { themeMode } = useTheme();
  const api = useApi<ApiResponse>();
  
  // Estados para datos
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para filtros
  const [showLimit, setShowLimit] = useState(15);
  const [evaluationType, setEvaluationType] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar evaluaciones al montar el componente
  useEffect(() => {
    loadEvaluations();
  }, [currentPage, showLimit, evaluationType, statusFilter]);

  // Función para cargar evaluaciones
  const loadEvaluations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: showLimit.toString(),
      });
      
      if (evaluationType) {
        params.append('evaluation_type', evaluationType);
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await api.get(`${API_ENDPOINTS.EVALUATIONS_ADMIN_MANAGEMENT}?${params}`);
      
      if (response) {
        setEvaluations(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(response.total_pages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las evaluaciones');
      console.error('Error loading evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar evaluaciones
  const handleSearch = () => {
    setCurrentPage(1);
    loadEvaluations();
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setEvaluationType('');
    setStatusFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Función para cambiar página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener el texto del tipo de evaluación
  const getEvaluationTypeText = (type: string) => {
    switch (type) {
      case 'company_to_student':
        return 'Empresa → Estudiante';
      case 'student_to_company':
        return 'Estudiante → Empresa';
      default:
        return type;
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estadísticas calculadas
  const totalEvaluations = totalCount;
  const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;
  const flaggedEvaluations = evaluations.filter(e => e.status === 'flagged').length;

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
                <AssessmentIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Gestión de Evaluaciones
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Administra y revisa todas las evaluaciones y reportes de strikes en la plataforma
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas con colores suaves - 4 tarjetas principales */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {totalEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Total Evaluaciones
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {completedEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Completadas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {pendingEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Pendientes
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {flaggedEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <WarningIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Marcadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Secciones de Evaluaciones */}
      <Box sx={{ mb: 4 }}>
        {/* Pestañas de navegación */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3,
          borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          pb: 2
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
              borderBottom: '2px solid',
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
              pb: 1,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ESTUDIANTE → EMPRESA (0)
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
              pb: 1,
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
              }
            }}
          >
            EMPRESA → ESTUDIANTE (0)
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
              pb: 1,
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
              }
            }}
          >
            STRIKE (0)
          </Typography>
        </Box>

        {/* Contador de evaluaciones */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#f8fafc',
          borderRadius: 2,
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {totalCount} evaluaciones encontradas
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={showLimit}
              onChange={(e) => setShowLimit(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value={15}>Mostrar 15</MenuItem>
              <MenuItem value={25}>Mostrar 25</MenuItem>
              <MenuItem value={50}>Mostrar 50</MenuItem>
              <MenuItem value={100}>Mostrar 100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Tabla de evaluaciones */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : evaluations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: themeMode === 'dark' ? '#64748b' : '#e2e8f0', 
                mx: 'auto', 
                mb: 3 
              }}>
                <AssessmentIcon sx={{ fontSize: 40, color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }} />
              </Avatar>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
              }}>
                No hay evaluaciones para mostrar
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 3,
                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
              }}>
                Las evaluaciones aparecerán aquí una vez que se creen en el sistema
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Proyecto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Evaluador</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Calificación</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} hover>
                        <TableCell>
                          <Chip 
                            label={getEvaluationTypeText(evaluation.evaluation_type)}
                            size="small"
                            color={evaluation.evaluation_type === 'company_to_student' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {evaluation.project_title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {evaluation.student_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {evaluation.student_email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {evaluation.company_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {evaluation.evaluator_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {evaluation.evaluator_role}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {evaluation.score}/5
                            </Typography>
                            <Box sx={{ display: 'flex' }}>
                              {[...Array(5)].map((_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: i < evaluation.score ? '#fbbf24' : '#e5e7eb',
                                    mr: 0.5
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={evaluation.status === 'completed' ? 'Completada' : 
                                   evaluation.status === 'pending' ? 'Pendiente' : 'Marcada'}
                            size="small"
                            color={getStatusColor(evaluation.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {formatDate(evaluation.evaluation_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="secondary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton 
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 