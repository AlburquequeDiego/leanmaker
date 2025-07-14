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
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';

interface Project {
  id: string;
  title: string;
  company_name: string;
  company_id: string;
  description: string;
  status: 'active' | 'suspended' | 'completed' | 'cancelled';
  required_api_level: number;
  required_trl_level: number;
  students_needed: number;
  students_assigned: number;
  applications_count: number;
  start_date: string;
  end_date: string;
  location: string;
  rating: number;
  hours_offered: number;
  created_at: string;
}

interface Application {
  id: string;
  student_name: string;
  student_email: string;
  project_title: string;
  api_level: number;
  gpa: number;
  compatibility_score: number;
  status: 'pending' | 'accepted' | 'rejected';
  application_date: string;
}

export const GestionProyectosAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'suspend' | 'delete' | 'view_candidates' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'ultimos'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchData();
  }, [pageSize, currentPage, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      if (pageSize === 'ultimos') {
        params.append('limit', '20');
        params.append('ultimos', 'true');
      } else {
        params.append('limit', pageSize.toString());
        params.append('offset', ((currentPage - 1) * pageSize).toString());
      }

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.company) params.append('company', filters.company);
      if (filters.status) params.append('status', filters.status);
      if (filters.api_level) params.append('api_level', filters.api_level);
      if (filters.trl_level) params.append('trl_level', filters.trl_level);

      const response = await apiService.get(`/api/admin/projects/?${params.toString()}`);
      
      setProjects(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProjects([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (project: Project, type: 'edit' | 'suspend' | 'delete' | 'view_candidates') => {
    setSelectedProject(project);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedProject || !actionType) return;

    try {
      let endpoint = '';
      let payload: any = {};

      switch (actionType) {
        case 'suspend':
          endpoint = `/api/admin/projects/${selectedProject.id}/suspend/`;
          payload = { reason: actionReason };
          break;
        case 'delete':
          endpoint = `/api/admin/projects/${selectedProject.id}/delete/`;
          payload = { reason: actionReason };
          break;
        default:
          return;
      }

      await apiService.post(endpoint, payload);

      setSuccessMessage(`Proyecto ${actionType === 'suspend' ? 'suspendido' : 'eliminado'} correctamente`);
      setShowSuccess(true);
      setActionDialog(false);
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'suspended': return 'Suspendido';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Proyecto',
      render: (value: string, row: Project) => (
        <Box>
          <Typography variant="body2" fontWeight={600} noWrap>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.location}
          </Typography>
        </Box>
      ),
      width: '250px'
    },
    {
      key: 'company_name',
      label: 'Empresa',
      render: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon fontSize="small" color="primary" />
          <Typography variant="body2" noWrap>
            {value}
          </Typography>
        </Box>
      ),
      width: '150px'
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
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'students_assigned',
      label: 'Estudiantes',
      render: (value: number, row: Project) => (
        <Chip 
          label={`${value}/${row.students_needed}`} 
          color="primary" 
          variant="filled"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'applications_count',
      label: 'Postulaciones',
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'required_api_level',
      label: 'Nivel API',
      render: (value: number) => (
        <Chip 
          label={`API ${value}`} 
          color="primary" 
          size="small"
          variant="outlined"
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'required_trl_level',
      label: 'Nivel TRL',
      render: (value: number) => (
        <Chip 
          label={`TRL ${value}`} 
          color="secondary" 
          size="small"
          variant="outlined"
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'hours_offered',
      label: 'Horas',
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ScheduleIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            {value} hrs
          </Typography>
        </Box>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={value} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">
            ({value.toFixed(1)})
          </Typography>
        </Box>
      ),
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'created_at',
      label: 'Creado',
      render: (value: string) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
      width: '100px',
      align: 'center' as const
    }
  ];

  const tableFilters = [
    {
      key: 'search',
      label: 'Buscar por título o empresa',
      type: 'text' as const
    },
    {
      key: 'company',
      label: 'Empresa',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Empresa A' },
        { value: '2', label: 'Empresa B' },
        { value: '3', label: 'Empresa C' }
      ]
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'suspended', label: 'Suspendido' },
        { value: 'completed', label: 'Completado' },
        { value: 'cancelled', label: 'Cancelado' }
      ]
    },
    {
      key: 'api_level',
      label: 'Nivel API',
      type: 'select' as const,
      options: [
        { value: '1', label: 'API 1' },
        { value: '2', label: 'API 2' },
        { value: '3', label: 'API 3' },
        { value: '4', label: 'API 4' },
        { value: '5', label: 'API 5' }
      ]
    },
    {
      key: 'trl_level',
      label: 'Nivel TRL',
      type: 'select' as const,
      options: [
        { value: '1', label: 'TRL 1' },
        { value: '2', label: 'TRL 2' },
        { value: '3', label: 'TRL 3' },
        { value: '4', label: 'TRL 4' },
        { value: '5', label: 'TRL 5' },
        { value: '6', label: 'TRL 6' },
        { value: '7', label: 'TRL 7' },
        { value: '8', label: 'TRL 8' },
        { value: '9', label: 'TRL 9' }
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

  const handlePageSizeChange = (newPageSize: number | 'ultimos') => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  const actions = (row: Project) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleAction(row, 'view_candidates')}
        startIcon={<PeopleIcon />}
      >
        Ver Postulantes
      </Button>
      {row.status === 'active' && (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleAction(row, 'suspend')}
          startIcon={<BlockIcon />}
        >
          Suspender
        </Button>
      )}
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleAction(row, 'delete')}
        startIcon={<DeleteIcon />}
        color="error"
      >
        Eliminar
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Gestión de Proyectos
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Proyectos" />
          <Tab label="Postulaciones" />
        </Tabs>
      </Box>

      {/* Tab: Proyectos */}
      <div role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <DataTable
            title="Lista de Proyectos"
            data={projects}
            columns={columns}
            loading={loading}
            error={null}
            filters={tableFilters}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            showPagination={pageSize !== 'ultimos'}
            actions={actions}
            emptyMessage="No hay proyectos registrados"
          />
        )}
      </div>

      {/* Tab: Postulaciones */}
      <div role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Postulaciones de Estudiantes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Aquí puedes ver todas las postulaciones de estudiantes a proyectos.
            </Typography>
            {/* Aquí iría la tabla de postulaciones usando DataTable */}
          </Box>
        )}
      </div>

      {/* Modal de acción */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'suspend' && 'Suspender Proyecto'}
          {actionType === 'delete' && 'Eliminar Proyecto'}
          {actionType === 'view_candidates' && 'Ver Postulantes'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres {actionType === 'suspend' ? 'suspender' : actionType === 'delete' ? 'eliminar' : 'ver los postulantes del'} proyecto{' '}
              <strong>{selectedProject?.title}</strong>?
            </Typography>
            {(actionType === 'suspend' || actionType === 'delete') && (
              <TextField
                label="Razón (opcional)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cancelar
          </Button>
          {(actionType === 'suspend' || actionType === 'delete') && (
            <Button
              variant="contained"
              color={actionType === 'suspend' ? 'warning' : 'error'}
              onClick={handleConfirmAction}
            >
              Confirmar
            </Button>
          )}
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
    </Box>
  );
};

export default GestionProyectosAdmin; 