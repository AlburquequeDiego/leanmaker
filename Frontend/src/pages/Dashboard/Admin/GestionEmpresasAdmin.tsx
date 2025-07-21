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
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';

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
  const [tabValue, setTabValue] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'suspend' | 'activate' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'todos'>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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
      
      // Mapear user correctamente si viene como objeto
      const mappedCompanies = (response.results || []).map((c: any) => ({
        ...c,
        user: typeof c.user === 'object' ? c.user.id : c.user
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
              Última actividad: {new Date(row.last_activity).toLocaleDateString()}
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
      key: 'rating', // El backend entrega 'rating', lo mostramos como GPA
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
          {new Date(value).toLocaleDateString()}
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
                color="primary"
                onClick={() => {
                  setSelectedCompany(row);
                  // setShowEditDialog(true); // Asume que existe un estado y modal para editar
                }}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Activar">
            <span>
              <IconButton
                color="success"
                onClick={() => handleAction(row, 'activate')}
                disabled={row.status === 'active' || !row.user}
              >
                <CheckCircleIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Suspender">
            <span>
              <IconButton
                color="warning"
                onClick={() => handleAction(row, 'suspend')}
                disabled={row.status === 'suspended' || !row.user}
              >
                <WarningIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bloquear">
            <span>
              <IconButton
                color="error"
                onClick={() => handleAction(row, 'block')}
                disabled={row.status === 'blocked' || !row.user}
              >
                <BlockIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Desbloquear">
            <span>
              <IconButton
                color="info"
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Gestión de Empresas
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Mostrar</InputLabel>
          <Select
            value={pageSize}
            label="Mostrar"
            onChange={(e) => setPageSize(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
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

      {/* Filtros y tabla de empresas */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TextField
          label="Buscar por nombre o email"
          variant="outlined"
          size="small"
          value={filters.search || ''}
          onChange={e => handleFilterChange({ ...filters, search: e.target.value })}
          sx={{ minWidth: 220 }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={filters.status || ''}
            onChange={e => handleFilterChange({ ...filters, status: e.target.value })}
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

      {/* Modal de acción */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'activate' && 'Activar Empresa'}
          {actionType === 'suspend' && 'Suspender Empresa'}
          {actionType === 'block' && 'Bloquear Empresa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres {actionType === 'activate' ? 'activar' : actionType === 'suspend' ? 'suspender' : 'bloquear'} la empresa{' '}
              <strong>{selectedCompany?.name}</strong>?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained"
            color={actionType === 'activate' ? 'success' : actionType === 'suspend' ? 'warning' : 'error'}
            onClick={handleConfirmAction}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
            {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar de error */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
            {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEmpresasAdmin; 