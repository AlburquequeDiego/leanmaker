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
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'suspend' | 'delete' | 'view_students' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [projectStudents, setProjectStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'todos'>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);


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
      } else if (pageSize === 'todos') {
        params.append('limit', '1000000'); // Limite muy alto para obtener todos
      } else {
        params.append('limit', pageSize.toString());
        params.append('offset', ((currentPage - 1) * pageSize).toString());
      }

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.api_level) params.append('api_level', filters.api_level);
      if (filters.trl_level) params.append('trl_level', filters.trl_level);

      const response = await apiService.get(`/api/admin/projects/?${params.toString()}`);
      
      // Mapear datos del backend al formato esperado por el frontend
      const mappedProjects = (response.results || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        company_name: p.company_name || 'Sin empresa',
        company_id: p.company_id || '',
        description: p.description || '',
        status: p.status || 'active',
        required_api_level: p.api_level || 1,
        required_trl_level: p.trl_level || 1,
        students_needed: p.max_students || 1,
        students_assigned: p.current_students || 0,
        applications_count: p.applications_count || 0,
        start_date: p.start_date || '',
        end_date: p.estimated_end_date || '',
        location: p.location || 'Remoto',
        rating: p.rating || 0,
        hours_offered: p.required_hours || 0,
        created_at: p.created_at || '',
        // Datos adicionales del backend
        requirements: p.requirements,
        tipo: p.tipo,
        objetivo: p.objetivo,
        encargado: p.encargado,
        contacto: p.contacto,
        modality: p.modality,

        duration_weeks: p.duration_weeks,
        hours_per_week: p.hours_per_week,
        is_featured: p.is_featured,
        is_urgent: p.is_urgent,
        is_project_completion: p.is_project_completion
      }));
      
      console.log('📊 Datos recibidos del backend:', response.results);
      console.log('🔄 Proyectos mapeados:', mappedProjects);
      
      setProjects(mappedProjects);
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

  const handleAction = (project: Project, type: 'edit' | 'suspend' | 'delete' | 'view_students') => {
    setSelectedProject(project);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
    
    // Si es ver estudiantes, cargar la lista
    if (type === 'view_students') {
      fetchProjectStudents(project.id);
    }
  };

  const fetchProjectStudents = async (projectId: string) => {
    try {
      setLoadingStudents(true);
      const response = await apiService.get(`/api/projects/${projectId}/participants/`);
      setProjectStudents(response.participantes || []);
    } catch (error) {
      console.error('Error fetching project students:', error);
      setProjectStudents([]);
    } finally {
      setLoadingStudents(false);
    }
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
          payload = {}; // No enviar razón para eliminar
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

  // Reemplazar getStatusText y getStatusColor para que usen español y colores llamativos
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptado';
      case 'rejected':
        return 'Rechazado';
      case 'cancelled':
        return 'Eliminado';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'info'; // Azul
      case 'active':
        return 'success'; // Verde
      case 'completed':
        return 'primary'; // Azul fuerte
      case 'pending':
        return 'warning'; // Amarillo
      case 'accepted':
        return 'success'; // Verde
      case 'rejected':
        return 'error'; // Rojo
      case 'cancelled':
        return 'error'; // Rojo
      case 'suspended':
        return 'warning'; // Amarillo
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'accepted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'completed':
        return <TrendingUpIcon />;
      case 'active':
        return <CheckCircleIcon />;
      case 'published':
        return <ScheduleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      case 'suspended':
        return <ScheduleIcon />;
      default:
        return <AssignmentIcon />;
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
        <Chip icon={getStatusIcon(value)} label={getStatusText(value)} color={getStatusColor(value) as any} size="small" sx={{ fontWeight: 600 }} />
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
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'suspended', label: 'Suspendido' },
        { value: 'completed', label: 'Completado' },
        { value: 'cancelled', label: 'Eliminados' }
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

  const handlePageSizeChange = (newPageSize: number | 'ultimos' | 'todos') => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  const actions = (row: Project) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleAction(row, 'view_students')}
        startIcon={<PeopleIcon />}
      >
        Ver Estudiantes
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

      {/* Tab: Proyectos */}
      <div role="tabpanel">
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
          showPagination={false}
          actions={actions}
          emptyMessage="No hay proyectos registrados"
          pageSizeOptions={[50, 100, 200, 500, 1000, 'todos']}
        />
      </div>

      {/* Modal de acción */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'suspend' && 'Suspender Proyecto'}
          {actionType === 'delete' && 'Eliminar Proyecto'}
          {actionType === 'view_students' && 'Estudiantes del Proyecto'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'view_students' ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProject?.title}
              </Typography>
              {loadingStudents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                projectStudents.length > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {projectStudents.length} estudiante{projectStudents.length !== 1 ? 's' : ''} trabajando en el proyecto:
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {projectStudents.map((student: any, index: number) => (
                        <Box key={student.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {student.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.email}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No hay estudiantes asignados a este proyecto.
                  </Typography>
                )
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                ¿Estás seguro de que quieres {actionType === 'suspend' ? 'suspender' : 'eliminar'} el proyecto{' '}
                <strong>{selectedProject?.title}</strong>?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cerrar
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