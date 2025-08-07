import { useState, useEffect } from 'react';
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
  CircularProgress, 
  Alert, 
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

interface Student {
  id: string;
  name: string;
  email: string;
  api_level: number;
  trl_level: number;
  total_hours: number;
  company_name?: string;
  status: 'active' | 'inactive' | 'suspended' | 'blocked' | 'rejected' | 'approved' | 'pending';
  strikes: number;
  gpa: number;
  created_at: string;
  last_activity: string;
  // Campos adicionales del backend
  career?: string;
  semester?: number;
  graduation_year?: number;
  completed_projects?: number;
  experience_years?: number;
  rating?: number;
  skills?: string[];
  languages?: string[];
  user_data?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    is_active: boolean;
    is_verified: boolean;
    date_joined: string;
    last_login?: string;
    full_name: string;
  };
  // Datos calculados del backend
  horas_permitidas?: number;
  trl_permitido?: number;
}

interface ApiHistory {
  id: string;
  old_level: number;
  new_level: number;
  admin_name: string;
  comment?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApiQuestionnaire {
  id: string;
  student_id: string;
  answers: {
    question: string;
    answer: string;
    score: number;
  }[];
  total_score: number;
  max_score: number;
  completed_at: string;
}

export default function GestionEstudiantesAdmin() {
  const { themeMode } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiQuestionnaire, setApiQuestionnaire] = useState<ApiQuestionnaire | null>(null);
  const [apiHistory, setApiHistory] = useState<ApiHistory[]>([]);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false); // Nuevo estado para el modal de edición
  const [editFormData, setEditFormData] = useState<any>({}); // Estado para los datos del formulario de edición

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number>(20); // <-- Cambiado de 10 a 20
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, [pageSize, currentPage, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      params.append('limit', pageSize === 'todos' ? '0' : pageSize.toString()); // Si 'todos', no aplicar límite
      params.append('offset', ((currentPage - 1) * (pageSize === 'todos' ? 10000 : pageSize)).toString()); // Offset grande para 'todos'

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.api_level) params.append('api_level', filters.api_level);
      if (filters.status) params.append('status', filters.status);

      // Cambiar endpoint para admin:
      const response = await apiService.get(`/api/students/?${params.toString()}`);
      
      console.log('📊 Datos recibidos del backend:', response.results);
      console.log('🔍 Primer estudiante:', JSON.stringify(response.results?.[0], null, 2));
      console.log('⏰ Horas permitidas del primer estudiante:', response.results?.[0]?.horas_permitidas);
      
      // Transformar los datos para que coincidan con la interfaz Student
      const transformedStudents = (response.results || []).map((student: any) => {
        // Calcular horas permitidas según nivel API si no viene del backend
        const calcularHorasPermitidas = (apiLevel: number) => {
          const apiToHours = {
            1: 20,
            2: 40, 
            3: 80,
            4: 160
          };
          return apiToHours[apiLevel as keyof typeof apiToHours] || 20;
        };

        return {
          id: student.id,
          name: student.name || student.user_data?.full_name || student.email || 'Sin nombre',
          email: student.email || student.user_data?.email || 'Sin email',
          api_level: student.api_level || 1,
          trl_level: student.trl_level || student.trl_permitido || 1,
          total_hours: student.total_hours || 0,
          status: student.status || 'inactive',
          strikes: student.strikes || 0,
          gpa: student.gpa || 0,
          created_at: student.created_at || new Date().toISOString(),
          last_activity: student.last_activity || student.user_data?.last_login || new Date().toISOString(),
          // Datos adicionales del backend
          career: student.career,
          semester: student.semester,
          graduation_year: student.graduation_year,
          completed_projects: student.completed_projects,
          experience_years: student.experience_years,
          rating: student.rating,
          skills: student.skills || [],
          languages: student.languages || [],
          user_data: student.user_data,
          // Datos calculados del backend
          horas_permitidas: student.horas_permitidas || calcularHorasPermitidas(student.api_level || 1),
          trl_permitido: student.trl_permitido || student.trl_permitido_segun_api || 1
        };
      });
      
      setStudents(transformedStudents);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar estudiantes');
      setStudents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (student: Student) => {
    setSelectedStudent(student);
    setModalOpen(true);
    setApiQuestionnaire(null);
    setApiHistory([]);
    setComment('');
    
    try {
      // Obtener el historial de peticiones API del estudiante
      const apiRequestsResponse = await apiService.get('/api/students/admin/api-level-requests/');
      const studentRequests = (apiRequestsResponse.results || []).filter(
        (req: any) => req.student_id === parseInt(student.id)
      );
      
      // Transformar las peticiones al formato esperado por el modal
      const transformedHistory = studentRequests.map((req: any) => ({
        id: req.id,
        old_level: req.current_level,
        new_level: req.requested_level,
        admin_name: 'Admin', // Por ahora hardcodeado
        comment: req.feedback || '',
        date: req.submitted_at,
        status: req.status
      }));
      
      setApiHistory(transformedHistory);
      setApiQuestionnaire(null); // Por ahora no tenemos cuestionarios, solo historial
    } catch (err) {
      console.error('Error loading student details:', err);
      setApiQuestionnaire(null);
      setApiHistory([]);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setApiQuestionnaire(null);
    setApiHistory([]);
    setComment('');
  };

  const handleUpgrade = async () => {
    if (!selectedStudent) return;
    
    setActionLoading(true);
    try {
      await apiService.post(`/api/admin/students/${selectedStudent.id}/upgrade-api/`, {
        comment: comment
      });
      
      setSuccessMsg('Estudiante subido de nivel correctamente');
      handleCloseModal();
      loadStudents(); // Recargar datos
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir de nivel');
    } finally {
      setActionLoading(false);
    }
  };

  const canUpgrade = () => {
    if (!selectedStudent || !apiQuestionnaire) return false;
    
    // Verificar que el cuestionario esté completo y tenga puntaje suficiente
    const scorePercentage = (apiQuestionnaire.total_score / apiQuestionnaire.max_score) * 100;
    return scorePercentage >= 80; // Mínimo 80% para subir de nivel
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'inactive':
      case 'rejected':
      case 'suspended':
      case 'blocked':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'Activo';
      case 'pending':
      case 'inactive':
      case 'rejected':
      case 'suspended':
      case 'blocked':
        return 'Inactivo';
      default:
        return 'Inactivo';
    }
  };

  // Acciones de estado para estudiantes
  const handleStudentAction = async (student: Student, action: 'suspend' | 'activate' | 'block') => {
    try {
      let endpoint = '';
      if (action === 'activate') endpoint = `/api/students/admin/${student.id}/activate/`;
      if (action === 'suspend') endpoint = `/api/students/admin/${student.id}/suspend/`;
      if (action === 'block') endpoint = `/api/students/admin/${student.id}/block/`;
      await apiService.post(endpoint, {});
      setSuccessMsg(`Estudiante ${action === 'activate' ? 'activado' : action === 'suspend' ? 'suspendido' : 'bloqueado'} correctamente`);
      loadStudents();
      if (typeof window !== 'undefined' && typeof (window as any).refreshUsers === 'function') {
        (window as any).refreshUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar el estado del estudiante');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Estudiante',
      render: (value: string, row: Student) => {
        console.log('🎨 Renderizando estudiante:', { 
          value, 
          name: row.name, 
          email: row.email,
          fullRow: JSON.stringify(row, null, 2)
        });
        
        // Determinar el nombre a mostrar
        const displayName = row.name || row.user_data?.full_name || row.email || 'Sin datos';
        const displayEmail = row.email || row.user_data?.email || 'Sin email';
        const lastActivity = row.last_activity || row.user_data?.last_login;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {displayEmail}
              </Typography>
              {lastActivity && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Última actividad: {new Date(lastActivity).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
      width: '250px'
    },
    {
      key: 'api_level',
      label: 'Nivel API',
      render: (value: number) => (
        <Chip 
          label={`API ${value}`} 
          color="primary" 
          size="small"
          variant="filled"
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'trl_level',
      label: 'Nivel TRL',
      render: (value: number) => (
        <Chip 
          label={`TRL ${value}`} 
          color="secondary" 
          size="small"
          variant="filled"
          title={`TRL calculado automáticamente según API ${value <= 2 ? '1' : value <= 4 ? '2' : value <= 6 ? '3' : '4'}`}
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'horas_permitidas',
      label: 'Horas Permitidas',
      render: (value: number) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {value} hrs
        </Typography>
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'total_hours',
      label: 'Horas Acumuladas',
      render: (value: number) => (
        <Typography variant="body2" fontWeight={600}>
          {value} hrs
        </Typography>
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <Chip 
          label={getStatusText(value)} 
          color={getStatusColor(value) as any}
          size="small"
          variant="filled"
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'strikes',
      label: 'Strikes',
      render: (value: number) => (
        <Chip 
          label={value} 
          color={value > 0 ? 'error' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
      width: '80px',
      align: 'center' as const
    },
    {
      key: 'gpa',
      label: 'GPA',
      render: (value: number) => (
        <Typography variant="body2" fontWeight={600}>
          {value ? value.toFixed(2) : '-'}
        </Typography>
      ),
      width: '80px',
      align: 'center' as const
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Student) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar">
            <span>
              <IconButton
                onClick={() => {
                  setSelectedStudent(row);
                  setEditFormData({
                    name: row.name || row.user_data?.full_name || '',
                    email: row.email || row.user_data?.email || '',
                    api_level: row.api_level || 1,
                    trl_level: row.trl_level || 1,
                    career: row.career || '',
                    semester: row.semester || '',
                    status: row.status || 'active'
                  });
                  setShowEditDialog(true);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Activar">
            <span>
              <IconButton
                onClick={() => handleStudentAction(row, 'activate')}
                disabled={row.status === 'active' || row.status === 'approved'}
                sx={{
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #44a08d 0%, #3a8c7a 100%)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                <CheckCircleIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Suspender">
            <span>
              <IconButton
                onClick={() => handleStudentAction(row, 'suspend')}
                disabled={row.status === 'suspended'}
                sx={{
                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                <WarningIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bloquear">
            <span>
              <IconButton
                onClick={() => handleStudentAction(row, 'block')}
                disabled={row.status === 'rejected' || row.status === 'blocked'}
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ee5a24 0%, #c44569 100%)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                <BlockIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Desbloquear">
            <span>
              <IconButton
                onClick={async () => {
                  await apiService.post(`/api/users/${row.id}/unblock/`);
                  setSuccessMsg('Estudiante desbloqueado exitosamente');
                  loadStudents();
                }}
                disabled={row.status !== 'blocked' && row.status !== 'rejected'}
                sx={{
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #44a08d 0%, #3a8c7a 100%)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                <CheckCircleIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
      width: '220px',
      align: 'center' as const
    },
  ];

  const tableFilters = [
    {
      key: 'search',
      label: 'Buscar por nombre o email',
      type: 'text' as const
    },
    {
      key: 'api_level',
      label: 'Nivel API',
      type: 'select' as const,
      options: [
        { value: '1', label: 'API 1' },
        { value: '2', label: 'API 2' },
        { value: '3', label: 'API 3' },
        { value: '4', label: 'API 4' }
      ]
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'approved', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' }
      ]
    }
  ];

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <Box sx={{ 
      p: 3, 
      background: themeMode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header con gradiente */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: themeMode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Estudiantes
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Administra y supervisa todos los estudiantes registrados en la plataforma
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/dashboard/admin/api-requests')}
                sx={{
                  background: themeMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: themeMode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: themeMode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Gestión de Solicitudes de API Estudiantes
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadStudents}
                sx={{
                  background: themeMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: themeMode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: themeMode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Actualizar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tarjetas de estadísticas */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ 
          minWidth: 200, 
          flex: '1 1 200px',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  Total Estudiantes
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {students.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Registrados en la plataforma
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200, 
          flex: '1 1 200px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  Estudiantes Activos
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {students.filter(s => s.status === 'active' || s.status === 'approved').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Operando normalmente
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200, 
          flex: '1 1 200px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  Con Strikes
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {students.filter(s => s.strikes > 0).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Requieren atención
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <WarningIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200, 
          flex: '1 1 200px',
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
          boxShadow: '0 8px 25px rgba(243, 156, 18, 0.3)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  Total Horas
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {students.reduce((sum, student) => sum + student.total_hours, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Horas acumuladas
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <TimerIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros y tabla de estudiantes con diseño mejorado */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 4, 
          background: themeMode === 'dark'
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: themeMode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
              }}>
                Filtros y Búsqueda
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280'
              }}>
                Mostrar
              </InputLabel>
              <Select
                value={pageSize}
                label="Mostrar"
                onChange={(e) => setPageSize(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '& .MuiSelect-icon': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                  },
                  '& .MuiSelect-select': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  }
                }}
              >
                <MenuItem value={20}>20 últimos</MenuItem>
                <MenuItem value={50}>50 últimos</MenuItem>
                <MenuItem value={100}>100 últimos</MenuItem>
                <MenuItem value={150}>150 últimos</MenuItem>
                <MenuItem value={200}>200 últimos</MenuItem>
                <MenuItem value={'todos'}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar por nombre o email"
              value={filters.search || ''}
              onChange={e => handleFilterChange({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  '&:hover fieldset': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                },
                '& .MuiInputBase-input': {
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                },
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280'
              }}>
                Nivel API
              </InputLabel>
              <Select
                label="Nivel API"
                value={filters.api_level || ''}
                onChange={e => handleFilterChange({ ...filters, api_level: e.target.value })}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '& .MuiSelect-icon': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                  },
                  '& .MuiSelect-select': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  }
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">API 1</MenuItem>
                <MenuItem value="2">API 2</MenuItem>
                <MenuItem value="3">API 3</MenuItem>
                <MenuItem value="4">API 4</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280'
              }}>
                Estado
              </InputLabel>
              <Select
                label="Estado"
                value={filters.status || ''}
                onChange={e => handleFilterChange({ ...filters, status: e.target.value })}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                  },
                  '& .MuiSelect-icon': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                  },
                  '& .MuiSelect-select': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  }
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="approved">Aprobado</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="suspended">Suspendido</MenuItem>
                <MenuItem value="blocked">Bloqueado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        title="Lista de Estudiantes"
        data={students}
        columns={columns}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[20, 50, 100, 150, 200, 'todos']}
        showPagination={false}
        showPageSizeSelector={false}
      />

      {/* Modal para ver cuestionario y subir de nivel con diseño mejorado */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 3, // Aumentar el padding vertical
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">
              {selectedStudent?.name} - Historial de Nivel API
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 3, 
          pt: 6, // Aumentar el padding top para dar más espacio
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Información básica */}
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Card sx={{ 
                  mb: 3, 
                  background: themeMode === 'dark'
                    ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                      mb: 2 
                    }}>
                      Información del Estudiante
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                          Email:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                          {selectedStudent.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                          Nivel API Actual:
                        </Typography>
                        <Chip label={`API ${selectedStudent.api_level}`} color="primary" sx={{ fontWeight: 600 }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                          Horas Acumuladas:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                          {selectedStudent.total_hours} hrs
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Información adicional */}
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  Para revisar y aprobar solicitudes de cambio de nivel API, ve a la sección "Historial de Solicitudes API" en el menú principal.
                </Alert>

                {/* Historial de solicitudes de cambio de nivel API */}
                <Card sx={{ 
                  background: themeMode === 'dark'
                    ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HistoryIcon color="primary" />
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                      }}>
                        Solicitudes de Cambio de Nivel API
                      </Typography>
                    </Box>
                    
                    {apiHistory.length > 0 ? (
                      <List>
                        {apiHistory.map((history, index) => (
                          <ListItem key={index} sx={{ 
                            background: themeMode === 'dark'
                              ? 'rgba(102, 126, 234, 0.1)'
                              : 'rgba(102, 126, 234, 0.05)', 
                            borderRadius: 1, 
                            mb: 1 
                          }}>
                            <ListItemIcon>
                              <TrendingUpIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" sx={{ 
                                    fontWeight: 600,
                                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                                  }}>
                                    API {history.old_level} → API {history.new_level}
                                  </Typography>
                                  <Chip 
                                    label={history.status === 'approved' ? 'Aprobado' : 
                                           history.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                    color={history.status === 'approved' ? 'success' : 
                                           history.status === 'rejected' ? 'error' : 'warning'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              }
                              secondary={`${new Date(history.date).toLocaleDateString()} - ${history.admin_name}${history.comment ? ` - ${history.comment}` : ''}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', 
                        fontStyle: 'italic' 
                      }}>
                        Sin solicitudes de cambio de nivel API registradas.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3,
            backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
          }}>
            <Button 
              onClick={handleCloseModal}
              sx={{ borderRadius: 2 }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de edición de estudiante */}
        <Dialog 
          open={showEditDialog} 
          onClose={() => {
            setShowEditDialog(false);
            setEditFormData({});
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            py: 3, // Aumentar el padding vertical
            px: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="h6">
                Editar Estudiante - {selectedStudent?.name || selectedStudent?.user_data?.full_name}
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ 
            p: 3, 
            pt: 6, // Aumentar el padding top para dar más espacio
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
          }}>
            {selectedStudent && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                {/* Información básica */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <TextField
                    label="Nombre completo"
                    value={editFormData.name || selectedStudent.name || selectedStudent.user_data?.full_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ 
                      shrink: true,
                      sx: {
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      },
                    }}
                  />
                  <TextField
                    label="Email"
                    value={editFormData.email || selectedStudent.email || selectedStudent.user_data?.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ 
                      shrink: true,
                      sx: {
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      },
                    }}
                  />
                </Box>

                {/* Nivel API y TRL */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }}
                      shrink={true}
                    >
                      Nivel API
                    </InputLabel>
                    <Select
                      value={editFormData.api_level || selectedStudent.api_level || 1}
                      onChange={(e) => setEditFormData({...editFormData, api_level: e.target.value})}
                      label="Nivel API"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }}
                    >
                      <MenuItem value={1}>API 1</MenuItem>
                      <MenuItem value={2}>API 2</MenuItem>
                      <MenuItem value={3}>API 3</MenuItem>
                      <MenuItem value={4}>API 4</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }}
                      shrink={true}
                    >
                      Nivel TRL
                    </InputLabel>
                    <Select
                      value={editFormData.trl_level || selectedStudent.trl_level || 1}
                      onChange={(e) => setEditFormData({...editFormData, trl_level: e.target.value})}
                      label="Nivel TRL"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }}
                    >
                      <MenuItem value={1}>TRL 1</MenuItem>
                      <MenuItem value={2}>TRL 2</MenuItem>
                      <MenuItem value={3}>TRL 3</MenuItem>
                      <MenuItem value={4}>TRL 4</MenuItem>
                      <MenuItem value={5}>TRL 5</MenuItem>
                      <MenuItem value={6}>TRL 6</MenuItem>
                      <MenuItem value={7}>TRL 7</MenuItem>
                      <MenuItem value={8}>TRL 8</MenuItem>
                      <MenuItem value={9}>TRL 9</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Información adicional */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Carrera"
                    value={editFormData.career || selectedStudent.career || ''}
                    onChange={(e) => setEditFormData({...editFormData, career: e.target.value})}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ 
                      shrink: true,
                      sx: {
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      },
                    }}
                  />
                  <TextField
                    label="Semestre"
                    value={editFormData.semester || selectedStudent.semester || ''}
                    onChange={(e) => setEditFormData({...editFormData, semester: e.target.value})}
                    fullWidth
                    variant="outlined"
                    type="number"
                    InputLabelProps={{ 
                      shrink: true,
                      sx: {
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      }
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                        minHeight: '56px',
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      },
                    }}
                  />
                </Box>

                {/* Estado del estudiante */}
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{
                      color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
                    shrink={true}
                  >
                    Estado
                  </InputLabel>
                  <Select
                    value={editFormData.status || selectedStudent.status || 'active'}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    label="Estado"
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                      minHeight: '56px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="inactive">Inactivo</MenuItem>
                    <MenuItem value="suspended">Suspendido</MenuItem>
                    <MenuItem value="blocked">Bloqueado</MenuItem>
                    <MenuItem value="approved">Aprobado</MenuItem>
                    <MenuItem value="pending">Pendiente</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3,
            backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
          }}>
            <Button 
              onClick={() => {
                setShowEditDialog(false);
                setEditFormData({});
              }}
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained"
              onClick={async () => {
                try {
                  if (selectedStudent) {
                    const updateData = {
                      career: editFormData.career || selectedStudent.career,
                      semester: editFormData.semester || selectedStudent.semester,
                      api_level: editFormData.api_level || selectedStudent.api_level,
                      status: editFormData.status || selectedStudent.status,
                      user_data: {
                        first_name: editFormData.name ? editFormData.name.split(' ')[0] : selectedStudent.user_data?.first_name,
                        last_name: editFormData.name ? editFormData.name.split(' ').slice(1).join(' ') : selectedStudent.user_data?.last_name,
                        email: editFormData.email || selectedStudent.email || selectedStudent.user_data?.email,
                      }
                    };

                    await apiService.patch(`/api/students/${selectedStudent.id}/update/`, updateData);
                    setSuccessMsg('Estudiante actualizado exitosamente');
                    setShowEditDialog(false);
                    setEditFormData({});
                    loadStudents();
                  }
                } catch (error) {
                  console.error('Error updating student:', error);
                  setError('Error al actualizar el estudiante');
                }
              }}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>

        {/* Mensaje de éxito con diseño mejorado */}
        <Snackbar
          open={!!successMsg}
          autoHideDuration={6000}
          onClose={() => setSuccessMsg('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccessMsg('')} 
            severity="success"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }}
          >
            {successMsg}
          </Alert>
        </Snackbar>

        {/* Mensaje de error con diseño mejorado */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  } 