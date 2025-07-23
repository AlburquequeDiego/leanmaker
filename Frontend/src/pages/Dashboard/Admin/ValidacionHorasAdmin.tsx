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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';

interface WorkHour {
  id: string;
  student_name: string;
  student_email: string;
  project_title: string;
  project_id: string;
  date: string;
  hours_worked: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  student_api_level?: number;
  project_api_level?: number;
  project_hours?: number;
  max_api_hours?: number;
  horas_validadas?: number;
  empresa_gpa?: number;
  estudiante_gpa?: number;
  empresa_nombre?: string;
  empresa_email?: string;
  // Campos adicionales para validación de horas de proyectos
  is_project_completion?: boolean;
  project_duration_weeks?: number;
  project_hours_per_week?: number;
  project_required_hours?: number;
  company_rating?: number;
  student_rating?: number;
}

export default function ValidacionHorasAdmin() {
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<WorkHour | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportHour, setReportHour] = useState<WorkHour | null>(null);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [validatingProjectId, setValidatingProjectId] = useState<string | null>(null);
  const [openIntegrantes, setOpenIntegrantes] = useState(false);
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [integrantesProyecto, setIntegrantesProyecto] = useState<string>('');

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadWorkHours();
    loadPendingProjects();
  }, [pageSize, currentPage, filters]);

  const loadWorkHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      if (pageSize === 'todos') {
        params.append('limit', '1000000'); // Para obtener todos los registros, evitar 0
      } else if (pageSize === 'ultimos') {
        params.append('limit', '20');
        params.append('ultimos', 'true');
      } else {
        params.append('limit', pageSize.toString());
        params.append('offset', ((currentPage - 1) * pageSize).toString());
      }

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await apiService.get(`/work-hours/?${params.toString()}`);
      
      setWorkHours(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar horas trabajadas');
      setWorkHours([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProjects = async () => {
    try {
      setPendingLoading(true);
      setPendingError(null);
      const response = await apiService.get('/api/projects/completed_pending_hours/');
      setPendingProjects(response.results || []);
    } catch (err: any) {
      setPendingError(err.response?.data?.error || 'Error al cargar proyectos pendientes');
      setPendingProjects([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleValidateProject = async (projectId: string) => {
    setValidatingProjectId(projectId);
    try {
      await apiService.post(`/api/projects/${projectId}/validate_hours/`);
      setSuccessMsg('Horas validadas correctamente para el proyecto');
      loadPendingProjects();
      loadWorkHours();
    } catch (err: any) {
      setPendingError(err.response?.data?.error || 'Error al validar horas del proyecto');
    } finally {
      setValidatingProjectId(null);
    }
  };

  const handleOpenModal = (hour: WorkHour) => {
    setSelectedHour(hour);
    setAdminComment('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHour(null);
    setAdminComment('');
  };

  const handleValidate = async () => {
    if (!selectedHour) return;
    setActionLoading(true);
    try {
      await apiService.post(`/work-hours/${selectedHour.id}/approve/`, {
        comentario: adminComment
      });
      setSuccessMsg('Hora aprobada correctamente');
      handleCloseModal();
      loadWorkHours(); // Recargar datos
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar la hora');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerIntegrantes = (row: any) => {
    // Busca la lista de integrantes en el row (puede ser row.estudiantes, row.participantes, etc.)
    const lista = row.estudiantes || row.participantes || [];
    setIntegrantes(lista);
    setIntegrantesProyecto(row.project_title || row.title || 'Proyecto');
    setOpenIntegrantes(true);
  };

  const handleCloseIntegrantes = () => setOpenIntegrantes(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  // Unifico los datos: proyectos pendientes + horas validadas
  const unifiedRows = [
    // Proyectos pendientes de validación
    ...pendingProjects.map((project) => ({
      id: `pending-${project.id}`,
      student_name: '—',
      student_email: '—',
      project_title: project.title || project.project_title || project.nombre || project.name || '-',
      company_name: project.company_name || project.empresa || project.company || project.empresa_nombre || '-',
      hours: project.offered_hours || project.horas || project.required_hours || project.project_required_hours || '-',
      project_details: project.description || project.detalles || project.project_details || '-',
      status: 'Pendiente',
      isPending: true,
      projectId: project.id,
      estudiantes: project.estudiantes || project.participantes || [],
    })),
    // Horas ya validadas
    ...workHours.map((row) => ({
      ...row,
      isPending: false,
    })),
  ];

  // Modifico la columna Acciones para mostrar el botón solo en filas pendientes
  const columns = [
    {
      key: 'project_title',
      label: 'Proyecto',
      render: (value: string, row: any) => <b>{value}</b>,
      width: '200px'
    },
    {
      key: 'company_name',
      label: 'Empresa',
      render: (value: string, row: any) => value || row.company || row.empresa || row.company_name || row.empresa_nombre || '-',
      width: '180px',
    },
    {
      key: 'hours',
      label: 'Horas',
      render: (value: any, row: any) => value || row.offered_hours || row.horas || row.required_hours || row.project_required_hours || '-',
      width: '100px',
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => row.isPending ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={() => handleVerIntegrantes(row)}
          >
            Ver Integrantes
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={validatingProjectId === row.projectId}
            onClick={() => handleValidateProject(row.projectId)}
          >
            {validatingProjectId === row.projectId ? 'Validando...' : 'Validar Horas'}
          </Button>
        </Box>
      ) : null,
      width: '220px',
    },
  ];

  const tableFilters = [
    {
      key: 'search',
      label: 'Buscar por estudiante o proyecto',
      type: 'text' as const
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'pending', label: 'Pendiente' },
        { value: 'approved', label: 'Aprobada' },
        { value: 'rejected', label: 'Rechazada' }
      ]
    },
    {
      key: 'project',
      label: 'Proyecto',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Proyecto A' },
        { value: '2', label: 'Proyecto B' },
        { value: '3', label: 'Proyecto C' }
      ]
    },
    {
      key: 'date_from',
      label: 'Fecha desde',
      type: 'text' as const
    },
    {
      key: 'date_to',
      label: 'Fecha hasta',
      type: 'text' as const
    }
  ];

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.pageSize) {
      setPageSize(Number(newFilters.pageSize));
      setCurrentPage(1);
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number | 'ultimos') => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  const actions = (row: WorkHour) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      {row.status === 'pending' ? (
        <Button
          variant="contained"
          size="small"
          color="success"
          onClick={() => handleOpenModal(row)}
          startIcon={<CheckCircleIcon />}
          sx={{ 
            fontWeight: 600,
            '&:hover': { 
              bgcolor: 'success.dark',
              transform: 'translateY(-1px)',
              boxShadow: 2
            }
          }}
        >
          Validar Horas
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="small"
          color="success"
          disabled
          sx={{ fontWeight: 600 }}
        >
          ✅ Validada
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            VALIDACIÓN DE HORAS DE PROYECTOS
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select
              value={pageSize}
              label="Mostrar"
              onChange={(e) => setPageSize(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            >
              <MenuItem value={15}>15 últimos</MenuItem>
              <MenuItem value={50}>50 últimos</MenuItem>
              <MenuItem value={100}>100 últimos</MenuItem>
              <MenuItem value={150}>150 últimos</MenuItem>
              <MenuItem value={'todos'}>Todos</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <DataTable
          data={pageSize === 'todos' ? unifiedRows : unifiedRows.slice(0, pageSize)}
          columns={columns}
          loading={loading || pendingLoading}
          error={error || pendingError}
          filters={[]}
          onFilterChange={() => {}}
          showPageSizeSelector={false}
        />
      </Paper>
      {/* Modal para ver integrantes */}
      <Dialog open={openIntegrantes} onClose={handleCloseIntegrantes} maxWidth="sm" fullWidth>
        <DialogTitle>Integrantes de {integrantesProyecto}</DialogTitle>
        <DialogContent>
          <List>
            {integrantes.length === 0 ? (
              <ListItem>
                <ListItemText primary="No hay integrantes registrados" />
              </ListItem>
            ) : integrantes.map((est, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={est.nombre || est.name || est.full_name || est.email} secondary={est.email} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIntegrantes}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 