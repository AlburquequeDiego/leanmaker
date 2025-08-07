import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Avatar,
  Rating,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';
import { useTheme } from '../../../contexts/ThemeContext';

interface Company {
  id: string;
  user: string; // <-- Añadido para asegurar el ID de usuario
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'blocked' | string;
  projects_count: number;
  gpa: number; // Usar rating como gpa
  join_date: string;
  last_activity: string;
  description?: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  size?: string;
  verified?: boolean;
}

interface Project {
  id: string;
  title: string;
  company_name: string;
  status: 'active' | 'completed' | 'cancelled';
  students_count: number;
  start_date: string;
  end_date: string;
  rating: number;
}

interface Evaluation {
  id: string;
  project_title: string;
  company_name: string;
  student_name: string;
  score: number;
  comments: string;
  evaluation_date: string;
}

export const GestionEmpresasAdmin = () => {
  const { themeMode } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'suspend' | 'activate' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false); // Nuevo estado para el modal de edición
  const [editFormData, setEditFormData] = useState<any>({}); // Estado para los datos del formulario de edición
  
  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'todos'>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    suspendedCompanies: 0,
    blockedCompanies: 0,
    averageRating: 0,
    totalProjects: 0
  });
  const [filters, setFilters] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    fetchData();
  }, [pageSize, currentPage, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      params.append('limit', pageSize === 'todos' ? '0' : pageSize.toString()); // Si 'todos', no limitar
      params.append('offset', ((currentPage - 1) * (pageSize === 'todos' ? 1000000 : pageSize)).toString()); // Offset grande para 'todos'
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('rating', filters.rating);
      
      console.log('🔍 Filtros aplicados:', filters);
      console.log('📡 URL de la petición:', `/api/admin/companies/?${params.toString()}`);
      
      const response = await apiService.get(`/api/admin/companies/?${params.toString()}`);
      console.log('📊 Datos recibidos del backend:', response.results);
      
      // Mapear datos del backend al formato esperado por el frontend
      const mappedCompanies = (response.results || []).map((c: any) => ({
        id: c.id,
        user: typeof c.user === 'object' ? c.user.id : c.user,
        name: c.company_name || 'Sin nombre',
        email: c.user_data?.email || c.contact_email || 'Sin email',
        status: c.status || 'active',
        projects_count: c.total_projects || 0,
        gpa: c.rating || 0,
        join_date: c.created_at || '',
        last_activity: c.updated_at || '',
        description: c.description || '',
        phone: c.contact_phone || c.user_data?.phone || '',
        address: c.address || '',
        website: c.website || '',
        industry: c.industry || '',
        size: c.size || '',
        verified: c.verified || false,
        // Datos adicionales del backend
        company_name: c.company_name,
        contact_email: c.contact_email,
        contact_phone: c.contact_phone,
        total_projects: c.total_projects,
        projects_completed: c.projects_completed,
        total_hours_offered: c.total_hours_offered,
        user_data: c.user_data
      }));
      
      console.log('🔄 Empresas mapeadas:', mappedCompanies);
      console.log('📈 Total de empresas:', mappedCompanies.length);
      
      setCompanies(mappedCompanies);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCompanies([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (company: Company, type: 'block' | 'suspend' | 'activate') => {
    setSelectedCompany(company);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !actionType) return;
    if (!selectedCompany.user) {
      setErrorMessage('Esta empresa no tiene usuario asociado. No se puede realizar la acción.');
      setShowError(true);
      return;
    }
    try {
      let endpoint = '';
      const userId = selectedCompany.user;
      if (actionType === 'activate') endpoint = `/api/users/${userId}/activate/`;
      if (actionType === 'suspend') endpoint = `/api/users/${userId}/suspend/`;
      if (actionType === 'block') endpoint = `/api/users/${userId}/block/`;
      
      await apiService.post(endpoint, {});
      setSuccessMessage(`Empresa ${actionType === 'activate' ? 'activada' : actionType === 'suspend' ? 'suspendida' : 'bloqueada'} correctamente`);
      setShowSuccess(true);
      setActionDialog(false);
      
      // Forzar refresh completo después de un pequeño delay
      setTimeout(() => {
        fetchData();
        refreshOtherInterfaces();
      }, 500);
      
    } catch (error) {
      console.error('Error en acción:', error);
      setErrorMessage('Error al cambiar el estado de la empresa');
      setShowError(true);
    }
  };

  const refreshOtherInterfaces = () => {
    // Refrescar gestión de usuarios si existe
    if (typeof window !== 'undefined' && typeof (window as any).refreshUsers === 'function') {
      (window as any).refreshUsers();
    }
    // Refrescar gestión de estudiantes si existe
    if (typeof window !== 'undefined' && typeof (window as any).refreshStudents === 'function') {
      (window as any).refreshStudents();
    }
    // Disparar evento personalizado para otras interfaces
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userStateChanged'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'suspended': return 'Suspendida';
      case 'blocked': return 'Bloqueada';
      default: return status;
    }
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Alto';
    if (rating >= 3.5) return 'Medio';
    return 'Bajo';
  };

  const columns = [
    {
      key: 'name',
      label: 'Empresa',
      render: (value: string, row: Company) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Última actividad: {row.last_activity ? new Date(row.last_activity).toLocaleDateString() : 'Sin datos'}
            </Typography>
          </Box>
        </Box>
      ),
      width: '250px'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => (
        <Typography variant="body2" noWrap>
          {value}
        </Typography>
      ),
      width: '200px'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <Chip 
          label={getStatusText(value)} 
          color={getStatusColor(value) as any}
          variant="filled"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'projects_count',
      label: 'Proyectos',
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WorkIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'gpa', // Usamos 'gpa' que es el campo mapeado
      label: 'GPA promedio',
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={value} readOnly precision={0.1} size="small" />
          <Typography variant="body2" fontWeight={600}>
            {value ? value.toFixed(2) : '-'} / 5
          </Typography>
        </Box>
      ),
      width: '150px',
      align: 'center' as const
    },
    {
      key: 'join_date',
      label: 'Fecha Registro',
      render: (value: string) => (
        <Typography variant="body2">
          {value ? new Date(value).toLocaleDateString() : 'Sin datos'}
        </Typography>
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Company) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar">
            <span>
              <IconButton
                onClick={() => {
                  setSelectedCompany(row);
                  setEditFormData({
                    name: row.name || '',
                    email: row.email || '',
                    phone: row.phone || '',
                    website: row.website || '',
                    industry: row.industry || '',
                    size: row.size || '',
                    description: row.description || '',
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
                onClick={() => handleAction(row, 'activate')}
                disabled={row.status === 'active' || !row.user}
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
                onClick={() => handleAction(row, 'suspend')}
                disabled={row.status === 'suspended' || !row.user}
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
                onClick={() => handleAction(row, 'block')}
                disabled={row.status === 'blocked' || !row.user}
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
                  if (!row.user) {
                    setErrorMessage('Esta empresa no tiene usuario asociado. No se puede desbloquear.');
                    setShowError(true);
                    return;
                  }
                  try {
                    await apiService.post(`/api/users/${row.user}/unblock/`);
                    setSuccessMessage('Empresa desbloqueada exitosamente');
                    // Forzar refresh completo después de un pequeño delay
                    setTimeout(() => {
                      fetchData();
                      refreshOtherInterfaces();
                    }, 500);
                  } catch (error) {
                    console.error('Error al desbloquear:', error);
                    setErrorMessage('Error al desbloquear la empresa');
                    setShowError(true);
                  }
                }}
                disabled={row.status !== 'blocked' || !row.user}
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
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Activa' },
        { value: 'suspended', label: 'Suspendida' },
        { value: 'blocked', label: 'Bloqueada' }
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
                <BusinessIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Empresas
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Administra y supervisa todas las empresas registradas en la plataforma
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
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
                  Total Empresas
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {companies.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Registradas en la plataforma
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <BusinessIcon sx={{ color: 'white', fontSize: 32 }} />
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
                  Empresas Activas
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {companies.filter(c => c.status === 'active').length}
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
                  Empresas Bloqueadas
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {companies.filter(c => c.status === 'blocked').length}
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
                <BlockIcon sx={{ color: 'white', fontSize: 32 }} />
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
                  Total Proyectos
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {companies.reduce((sum, company) => sum + company.projects_count, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Creados por empresas
                </Typography>
              </Box>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <WorkIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros y tabla de empresas con diseño mejorado */}
      <Card sx={{ 
        background: themeMode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: themeMode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: 2, 
              p: 1, 
              mr: 2
            }}>
              <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
              }}>
                Lista de Empresas
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
              }}>
                Gestiona el estado y configuración de todas las empresas
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
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

          {/* Filtros mejorados */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Buscar por nombre o email"
              variant="outlined"
              size="small"
              value={filters.search || ''}
              onChange={e => handleFilterChange({ ...filters, search: e.target.value })}
              sx={{ 
                minWidth: 220,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                  '&:hover fieldset': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#667eea',
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
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' }} />
                ),
              }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280'
              }}>Estado</InputLabel>
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
                <MenuItem value="active">Activa</MenuItem>
                <MenuItem value="suspended">Suspendida</MenuItem>
                <MenuItem value="blocked">Bloqueada</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataTable
            title="Lista de Empresas"
            data={companies}
            columns={columns}
            loading={loading}
            error={null}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100, 150, 200, 'todos']}
            showPagination={false}
            showPageSizeSelector={false}
          />
        </CardContent>
      </Card>

      {/* Modal de acción con diseño mejorado */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: actionType === 'activate' 
            ? 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
            : actionType === 'suspend'
            ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
            : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actionType === 'activate' && <CheckCircleIcon />}
            {actionType === 'suspend' && <WarningIcon />}
            {actionType === 'block' && <BlockIcon />}
            <Typography variant="h6">
              {actionType === 'activate' && 'Activar Empresa'}
              {actionType === 'suspend' && 'Suspender Empresa'}
              {actionType === 'block' && 'Bloquear Empresa'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Box sx={{ mt: 2 }}>
            <Card sx={{ 
              mb: 3, 
              background: themeMode === 'dark'
                ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 'bold', 
                  color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                  mb: 2 
                }}>
                  Confirmar Acción
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                  lineHeight: 1.6 
                }}>
                  ¿Estás seguro de que quieres{' '}
                  <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                    {actionType === 'activate' ? 'activar' : actionType === 'suspend' ? 'suspender' : 'bloquear'}
                  </Box>{' '}
                  la empresa{' '}
                  <Box component="span" sx={{ fontWeight: 'bold', color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' }}>
                    {selectedCompany?.name}
                  </Box>?
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                  mt: 2, 
                  fontStyle: 'italic' 
                }}>
                  Esta acción cambiará el estado de la empresa y afectará su capacidad para usar la plataforma.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
        }}>
          <Button 
            onClick={() => setActionDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={handleConfirmAction}
            sx={{ 
              borderRadius: 2,
              background: actionType === 'activate' 
                ? 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
                : actionType === 'suspend'
                ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              '&:hover': {
                background: actionType === 'activate' 
                  ? 'linear-gradient(135deg, #44a08d 0%, #3a8c7a 100%)'
                  : actionType === 'suspend'
                  ? 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'
                  : 'linear-gradient(135deg, #ee5a24 0%, #c44569 100%)',
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edición de empresa */}
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
            <BusinessIcon />
            <Typography variant="h6">
              Editar Empresa - {selectedCompany?.name}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 3, 
          pt: 6, // Aumentar el padding top para dar más espacio
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedCompany && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Información básica */}
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="Nombre de la empresa"
                  value={editFormData.name || selectedCompany.name || ''}
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
                  value={editFormData.email || selectedCompany.email || ''}
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

              {/* Información adicional */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Teléfono"
                  value={editFormData.phone || selectedCompany.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
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
                  label="Sitio web"
                  value={editFormData.website || selectedCompany.website || ''}
                  onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
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

              {/* Industria y tamaño */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Industria"
                  value={editFormData.industry || selectedCompany.industry || ''}
                  onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
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
                    Tamaño de la empresa
                  </InputLabel>
                  <Select
                    value={editFormData.size || selectedCompany.size || ''}
                    label="Tamaño de la empresa"
                    onChange={(e) => setEditFormData({...editFormData, size: e.target.value})}
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
                    <MenuItem value="startup">Startup</MenuItem>
                    <MenuItem value="small">Pequeña (1-50 empleados)</MenuItem>
                    <MenuItem value="medium">Mediana (51-200 empleados)</MenuItem>
                    <MenuItem value="large">Grande (200+ empleados)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Descripción */}
              <TextField
                label="Descripción"
                value={editFormData.description || selectedCompany.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                fullWidth
                multiline
                rows={3}
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

              {/* Estado de la empresa */}
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
                  value={editFormData.status || selectedCompany.status || 'active'}
                  label="Estado"
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
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
                  <MenuItem value="active">Activa</MenuItem>
                  <MenuItem value="suspended">Suspendida</MenuItem>
                  <MenuItem value="blocked">Bloqueada</MenuItem>
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
                if (selectedCompany) {
                  const updateData = {
                    company_name: editFormData.name || selectedCompany.name,
                    contact_email: editFormData.email || selectedCompany.email,
                    contact_phone: editFormData.phone || selectedCompany.phone,
                    website: editFormData.website || selectedCompany.website,
                    industry: editFormData.industry || selectedCompany.industry,
                    size: editFormData.size || selectedCompany.size,
                    description: editFormData.description || selectedCompany.description,
                    status: editFormData.status || selectedCompany.status,
                  };

                  await apiService.patch(`/api/companies/${selectedCompany.id}/update/`, updateData);
                  setSuccessMessage('Empresa actualizada exitosamente');
                  setShowSuccess(true);
                  setShowEditDialog(false);
                  setEditFormData({});
                  fetchData();
                }
              } catch (error) {
                console.error('Error updating company:', error);
                setErrorMessage('Error al actualizar la empresa');
                setShowError(true);
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

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
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
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar de error */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
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
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEmpresasAdmin; 