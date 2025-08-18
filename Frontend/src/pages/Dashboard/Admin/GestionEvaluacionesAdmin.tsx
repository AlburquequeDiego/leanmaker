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
  Button,
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
  evaluation_type?: 'company_to_student' | 'student_to_company';
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
  evaluator_role?: string;
  evaluator_type?: string; // Campo que realmente envía el backend
  created_at: string;
  updated_at: string;
}

// Nueva interfaz para strikes y reportes
interface StrikeData {
  id: string;
  type: 'strike' | 'report';
  student_id: string;
  student_name: string;
  student_email: string;
  company_id: string;
  company_name: string;
  project_id: string | null;
  project_title: string | null;
  reason: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  issued_by_id?: string | null;
  issued_by_name?: string | null;
  issued_at?: string;
  expires_at?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  reviewed_by_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
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

interface StrikesApiResponse {
  results: StrikeData[];
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
  
  // Estados para strikes
  const [strikes, setStrikes] = useState<StrikeData[]>([]);
  const [strikesCount, setStrikesCount] = useState(0);
  const [strikesLoading, setStrikesLoading] = useState(false);
  
  // Estados para filtros
  const [showLimit, setShowLimit] = useState(15);
  const [evaluationType, setEvaluationType] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para pestaña activa
  const [activeTab, setActiveTab] = useState<'student_to_company' | 'company_to_student' | 'strikes'>('student_to_company');

  // Estados para modal de strike
  const [selectedStrike, setSelectedStrike] = useState<StrikeData | null>(null);
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingStrike, setProcessingStrike] = useState(false);

  // Cargar todas las evaluaciones al montar el componente
  useEffect(() => {
    loadAllEvaluations();
  }, []);

  // Cargar strikes cuando se active la pestaña
  useEffect(() => {
    if (activeTab === 'strikes') {
      loadStrikes();
    }
  }, [activeTab]);

  // Cargar evaluaciones filtradas cuando cambien los filtros (solo para paginación y límites)
  useEffect(() => {
    if (currentPage !== 1 || showLimit !== 15) {
      console.log(`🔍 [USE_EFFECT] Cambio de paginación detectado`);
      if (activeTab === 'strikes') {
        loadStrikes();
      } else {
        loadEvaluations();
      }
    }
  }, [currentPage, showLimit, activeTab]);

  // Función para cargar todas las evaluaciones sin filtros
  const loadAllEvaluations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 [API] Cargando TODAS las evaluaciones...`);
      const response = await api.get(`${API_ENDPOINTS.EVALUATIONS_ADMIN_MANAGEMENT}?limit=1000`);
      
             if (response) {
         console.log(`🔍 [API] Todas las evaluaciones cargadas:`, response.results?.length || 0);
         console.log(`🔍 [API] Primera evaluación completa:`, response.results?.[0]);
         console.log(`🔍 [API] Campos disponibles:`, response.results?.[0] ? Object.keys(response.results[0]) : []);
         setEvaluations(response.results || []);
         setTotalCount(response.count || 0);
         setTotalPages(response.total_pages || 1);
       }
    } catch (err: any) {
      setError(err.message || 'Error al cargar todas las evaluaciones');
      console.error('Error loading all evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar evaluaciones filtradas
  const loadEvaluations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: showLimit.toString(),
      });
      
      // Solo aplicar filtros si no estamos en la pestaña de strikes
      if (activeTab !== 'strikes') {
        if (evaluationType) {
          params.append('evaluation_type', evaluationType);
        }
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      console.log(`🔍 [API] Cargando evaluaciones filtradas con parámetros:`, params.toString());
      const response = await api.get(`${API_ENDPOINTS.EVALUATIONS_ADMIN_MANAGEMENT}?${params}`);
      
      if (response) {
        console.log(`🔍 [API] Respuesta filtrada recibida:`, response);
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

  // Función para cargar strikes y reportes
  const loadStrikes = async () => {
    setStrikesLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 [STRIKES] Cargando strikes y reportes...`);
      const response = await api.get(`${API_ENDPOINTS.EVALUATIONS_ADMIN_STRIKES_MANAGEMENT}?limit=1000`);
      
      if (response) {
        console.log(`🔍 [STRIKES] Strikes cargados:`, response.results?.length || 0);
        setStrikes((response.results as unknown as StrikeData[]) || []);
        setStrikesCount(response.count || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar strikes');
      console.error('Error loading strikes:', err);
    } finally {
      setStrikesLoading(false);
    }
  };

  // Función para aprobar strike
  const handleApproveStrike = async () => {
    if (!selectedStrike || selectedStrike.type !== 'report') return;
    
    setProcessingStrike(true);
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.STRIKES_REPORTS_APPROVE.replace('{id}', selectedStrike.id)}`,
        { admin_notes: adminNotes }
      );
      
      if (response) {
        console.log('✅ Strike aprobado:', response);
        // Recargar strikes
        await loadStrikes();
        setShowStrikeModal(false);
        setSelectedStrike(null);
        setAdminNotes('');
        // Mostrar mensaje de éxito
        alert('Strike aprobado correctamente');
      }
    } catch (err: any) {
      console.error('Error aprobando strike:', err);
      alert(`Error al aprobar strike: ${err.message}`);
    } finally {
      setProcessingStrike(false);
    }
  };

  // Función para rechazar strike
  const handleRejectStrike = async () => {
    if (!selectedStrike || selectedStrike.type !== 'report') return;
    
    setProcessingStrike(true);
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.STRIKES_REPORTS_REJECT.replace('{id}', selectedStrike.id)}`,
        { admin_notes: adminNotes }
      );
      
      if (response) {
        console.log('❌ Strike rechazado:', response);
        // Recargar strikes
        await loadStrikes();
        setShowStrikeModal(false);
        setSelectedStrike(null);
        setAdminNotes('');
        // Mostrar mensaje de éxito
        alert('Strike rechazado correctamente');
      }
    } catch (err: any) {
      console.error('Error rechazando strike:', err);
      alert(`Error al rechazar strike: ${err.message}`);
    } finally {
      setProcessingStrike(false);
    }
  };

  // Función para abrir modal de strike
  const openStrikeModal = (strike: StrikeData) => {
    setSelectedStrike(strike);
    setAdminNotes(strike.admin_notes || '');
    setShowStrikeModal(true);
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
  const getEvaluationTypeText = (type: string | undefined) => {
    if (!type) {
      // Si no hay evaluation_type, determinar por evaluator_type
      return 'Tipo no especificado';
    }
    
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

  // Función para cambiar pestaña activa
  const handleTabChange = (tab: 'student_to_company' | 'company_to_student' | 'strikes') => {
    console.log(`🔍 [TAB] Cambiando a pestaña: ${tab}`);
    setActiveTab(tab);
    setCurrentPage(1);
    
    // Filtrar por tipo de evaluación
    if (tab === 'strikes') {
      setEvaluationType(''); // Los strikes se manejarán por separado
    } else {
      setEvaluationType(tab);
      console.log(`🔍 [TAB] Tipo de evaluación establecido: ${tab}`);
    }
    
    // No recargar desde API, solo cambiar la pestaña
    // Las evaluaciones ya están cargadas y se filtran localmente
  };

  // Función para obtener evaluaciones filtradas por pestaña activa
  const getFilteredEvaluations = () => {
    if (activeTab === 'strikes') {
      return []; // Los strikes se manejan por separado
    }
    
    console.log(`🔍 [FILTER] === INICIO FILTRADO ===`);
    console.log(`🔍 [FILTER] Pestaña activa: ${activeTab}`);
    console.log(`🔍 [FILTER] Total evaluaciones: ${evaluations.length}`);
    
    // Mostrar información detallada de las primeras 3 evaluaciones
    evaluations.slice(0, 3).forEach((e, i) => {
      console.log(`🔍 [FILTER] Evaluación ${i + 1}:`, {
        id: e.id,
        evaluation_type: e.evaluation_type,
        evaluator_role: e.evaluator_role,
        evaluator_type: e.evaluator_type,
        evaluator_name: e.evaluator_name,
        student_name: e.student_name,
        company_name: e.company_name
      });
    });
    
    // Opción 1: Filtrar por evaluation_type si está disponible
    let filtered = evaluations.filter(e => e.evaluation_type === activeTab);
    console.log(`🔍 [FILTER] Opción 1 - Por evaluation_type: ${filtered.length} evaluaciones`);
    
    // Opción 2: Si no hay resultados, usar filtrado inteligente por evaluator_role
    if (filtered.length === 0 && evaluations.length > 0) {
      console.log(`🔍 [FILTER] Opción 2 - Usando filtrado inteligente por evaluator_role`);
      
      filtered = evaluations.filter(e => {
        // Usar evaluator_type si está disponible, sino evaluator_role
        const evaluatorRole = e.evaluator_type?.toLowerCase() || e.evaluator_role?.toLowerCase();
        console.log(`🔍 [FILTER] Evaluando rol: ${evaluatorRole} para pestaña: ${activeTab}`);
        
        if (activeTab === 'student_to_company') {
          return evaluatorRole === 'student';
        } else if (activeTab === 'company_to_student') {
          return evaluatorRole === 'company';
        }
        return false;
      });
      
      console.log(`🔍 [FILTER] Filtrado inteligente encontrado: ${filtered.length} evaluaciones`);
    }
    
    // Opción 3: Si aún no hay resultados, usar heurística basada en nombres
    if (filtered.length === 0 && evaluations.length > 0) {
      console.log(`🔍 [FILTER] Opción 3 - Usando heurística por nombres`);
      
      filtered = evaluations.filter(e => {
        // Si el evaluador tiene el mismo nombre que el estudiante, es auto-evaluación
        const isSelfEvaluation = e.evaluator_name === e.student_name;
        
        if (activeTab === 'student_to_company') {
          // Estudiante evaluando empresa: no debe ser auto-evaluación
          return !isSelfEvaluation;
        } else if (activeTab === 'company_to_student') {
          // Empresa evaluando estudiante: no debe ser auto-evaluación
          return !isSelfEvaluation;
        }
        return false;
      });
      
      console.log(`🔍 [FILTER] Heurística encontrada: ${filtered.length} evaluaciones`);
    }
    
    console.log(`🔍 [FILTER] === RESULTADO FINAL ===`);
    console.log(`🔍 [FILTER] Evaluaciones filtradas: ${filtered.length}`);
    console.log(`🔍 [FILTER] Tipos disponibles:`, evaluations.map(e => e.evaluation_type));
    console.log(`🔍 [FILTER] Roles de evaluadores:`, evaluations.map(e => e.evaluator_role));
    
    return filtered;
  };

  // Función para obtener el color del estado de strike
  const getStrikeStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
      case 'active':
        return 'success';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener el texto del estado de strike
  const getStrikeStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  // Función para obtener el color de severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener el texto de severidad
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      default:
        return severity;
    }
  };

  // Estadísticas calculadas
  const totalEvaluations = totalCount;
  const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;
  const flaggedEvaluations = evaluations.filter(e => e.status === 'flagged').length;
  
  // Contadores por pestaña con filtrado robusto
  const getStudentToCompanyCount = () => {
    // Opción 1: Por evaluation_type
    let count = evaluations.filter(e => e.evaluation_type === 'student_to_company').length;
    
    // Opción 2: Por evaluator_type o evaluator_role
    if (count === 0 && evaluations.length > 0) {
      count = evaluations.filter(e => {
        const evaluatorRole = e.evaluator_type?.toLowerCase() || e.evaluator_role?.toLowerCase();
        return evaluatorRole === 'student';
      }).length;
    }
    
    // Opción 3: Heurística por nombres (no auto-evaluaciones)
    if (count === 0 && evaluations.length > 0) {
      count = evaluations.filter(e => e.evaluator_name !== e.student_name).length;
    }
    
    return count;
  };

  const getCompanyToStudentCount = () => {
    // Opción 1: Por evaluation_type
    let count = evaluations.filter(e => e.evaluation_type === 'company_to_student').length;
    
    // Opción 2: Por evaluator_type o evaluator_role
    if (count === 0 && evaluations.length > 0) {
      count = evaluations.filter(e => {
        const evaluatorRole = e.evaluator_type?.toLowerCase() || e.evaluator_role?.toLowerCase();
        return evaluatorRole === 'company';
      }).length;
    }
    
    // Opción 3: Heurística por nombres (no auto-evaluaciones)
    if (count === 0 && evaluations.length > 0) {
      count = evaluations.filter(e => e.evaluator_name !== e.student_name).length;
    }
    
    return count;
  };

  const studentToCompanyCount = getStudentToCompanyCount();
  const companyToStudentCount = getCompanyToStudentCount();

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
        {/* Título de la sección activa */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b',
            mb: 1
          }}>
            {activeTab === 'strikes' 
              ? 'Gestión de Strikes y Reportes'
              : activeTab === 'student_to_company'
              ? 'Evaluaciones de Estudiantes a Empresas'
              : 'Evaluaciones de Empresas a Estudiantes'
            }
          </Typography>
          <Typography variant="body2" sx={{ 
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
          }}>
            {activeTab === 'strikes'
              ? 'Revisa y gestiona todos los reportes de strikes y amonestaciones'
              : activeTab === 'student_to_company'
              ? 'Administra las evaluaciones que los estudiantes hacen a las empresas'
              : 'Administra las evaluaciones que las empresas hacen a los estudiantes'
            }
          </Typography>
        </Box>

        {/* Pestañas de navegación con selector alineado */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography 
              variant="h6" 
              onClick={() => handleTabChange('student_to_company')}
              sx={{ 
                color: activeTab === 'student_to_company' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : (themeMode === 'dark' ? '#cbd5e1' : '#64748b'),
                borderBottom: activeTab === 'student_to_company' ? '2px solid' : 'none',
                borderColor: activeTab === 'student_to_company' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : 'transparent',
                pb: 1,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                }
              }}
            >
              ESTUDIANTE → EMPRESA ({studentToCompanyCount})
            </Typography>
            <Typography 
              variant="h6" 
              onClick={() => handleTabChange('company_to_student')}
              sx={{ 
                color: activeTab === 'company_to_student' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : (themeMode === 'dark' ? '#cbd5e1' : '#64748b'),
                borderBottom: activeTab === 'company_to_student' ? '2px solid' : 'none',
                borderColor: activeTab === 'company_to_student' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : 'transparent',
                pb: 1,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                }
              }}
            >
              EMPRESA → ESTUDIANTE ({companyToStudentCount})
            </Typography>
            <Typography 
              variant="h6" 
              onClick={() => handleTabChange('strikes')}
              sx={{ 
                color: activeTab === 'strikes' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : (themeMode === 'dark' ? '#cbd5e1' : '#64748b'),
                borderBottom: activeTab === 'strikes' ? '2px solid' : 'none',
                borderColor: activeTab === 'strikes' 
                  ? (themeMode === 'dark' ? '#60a5fa' : 'primary.main')
                  : 'transparent',
                pb: 1,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                }
              }}
            >
              STRIKE ({strikesCount})
            </Typography>
          </Box>
          
          {/* Selector de cantidad alineado con las pestañas */}
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
          ) : activeTab === 'strikes' ? (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                                     <TableHead>
                     <TableRow sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' }}>
                       <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Proyecto</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                       <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                     </TableRow>
                   </TableHead>
                  <TableBody>
                                         {strikesLoading ? (
                       <TableRow>
                         <TableCell colSpan={7} align="center">
                           <CircularProgress />
                         </TableCell>
                       </TableRow>
                     ) : strikes.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={7} align="center">
                           <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
                             No hay strikes o reportes para mostrar.
                           </Typography>
                         </TableCell>
                       </TableRow>
                    ) : (
                      strikes.map((strike) => (
                        <TableRow key={strike.id} hover>
                          <TableCell>
                            <Chip label={strike.type === 'strike' ? 'Amonestación' : 'Reporte'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {strike.student_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {strike.student_email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {strike.company_name}
                            </Typography>
                          </TableCell>
                                                     <TableCell>
                             <Typography variant="body2" sx={{ fontWeight: 500 }}>
                               {strike.project_title || 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                            <Chip
                              label={getStrikeStatusText(strike.status)}
                              color={getStrikeStatusColor(strike.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {formatDate(strike.issued_at || strike.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Ver detalles">
                                <IconButton size="small" color="primary" onClick={() => openStrikeModal(strike)}>
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              {strike.status === 'pending' && (
                                <>
                                  <Tooltip title="Aprobar">
                                    <IconButton size="small" color="success" onClick={() => openStrikeModal(strike)}>
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Rechazar">
                                    <IconButton size="small" color="error" onClick={() => openStrikeModal(strike)}>
                                      <WarningIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                                     <TableHead>
                     <TableRow sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' }}>
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
                                         {getFilteredEvaluations().map((evaluation) => (
                       <TableRow key={evaluation.id} hover>
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
                               {evaluation.evaluator_type || evaluation.evaluator_role || 'Rol no especificado'}
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

      {/* Modal de Strike */}
      {showStrikeModal && selectedStrike && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <Card sx={{ p: 4, maxWidth: 600, width: '90%', bgcolor: themeMode === 'dark' ? '#1e293b' : 'white', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedStrike.type === 'strike' ? 'Aprobar Amonestación' : 'Aprobar Reporte'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedStrike.type === 'strike' ? '¿Estás seguro de que quieres aprobar esta amonestación?' : '¿Estás seguro de que quieres aprobar este reporte?'}
            </Typography>
            <TextField
              label="Notas del Administrador"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              margin="normal"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => setShowStrikeModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleApproveStrike}
                disabled={processingStrike}
              >
                {processingStrike ? <CircularProgress size={24} /> : 'Aprobar'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectStrike}
                disabled={processingStrike}
              >
                {processingStrike ? <CircularProgress size={24} /> : 'Rechazar'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 