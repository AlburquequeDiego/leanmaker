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
  Card,
  CardContent,
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
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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
  approved?: boolean; // Added for filtering
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});
  // NUEVOS ESTADOS PARA CANTIDAD DE REGISTROS EN CADA TABLA
  const [pendingPageSize, setPendingPageSize] = useState(15);
  const [validatedPageSize, setValidatedPageSize] = useState(15);

  // Opciones para el selector
  const pageSizeOptions = [15, 50, 100, 150, 'Todos'];

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
      console.log('[DEBUG] Enviando petición de validación de horas para proyecto:', projectId);
      const response = await apiService.post(`/api/projects/${projectId}/validate_hours/`);
      console.log('[DEBUG] Respuesta de validación:', response);
      setSnackbarMsg('Horas validadas correctamente para el proyecto');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSuccessMsg('Horas validadas correctamente para el proyecto');
      loadPendingProjects();
      loadWorkHours();
    } catch (err: any) {
      console.error('[DEBUG] Error al validar horas:', err);
      setPendingError(err.response?.data?.error || 'Error al validar horas del proyecto');
      setSnackbarMsg(err.response?.data?.error || 'Error al validar horas del proyecto');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
    // Usa row.integrantes si existe, si no, busca en row.estudiantes o row.participantes
    const lista = row.integrantes || row.estudiantes || row.participantes || [];
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

  // Definir pendingRows correctamente justo después de unifiedRows
  const pendingRows = unifiedRows.filter(row => row.isPending);

  // Construir diccionario de proyectos {id: {nombre, integrantes}} usando los pendientes
  const projectInfoMap: Record<string, { title: string; integrantes?: any[] }> = {};
  unifiedRows.forEach(row => {
    const id = row.project_id || row.project || row.id;
    if (!id) return;
    projectInfoMap[id] = {
      title: row.project_title || row.title || row.nombre || row.name || '-',
      integrantes: row.estudiantes || row.participantes || [],
    };
  });

  // Adaptador para work hours validadas (historial)
  function adaptValidatedRow(row: any) {
    const id = row.project_id || row.project || row.id;
    const info = projectInfoMap[id] || {};
    return {
      id: row.id,
      project_title: info.title || row.project_title || row.project?.title || row.project || '-',
      company_name: row.company_name || row.empresa_nombre || row.company?.company_name || '-',
      hours: row.hours_worked || row.horas || row.project_required_hours || '-',
      status: row.status || (row.approved ? 'approved' : 'pending'),
      approved: row.approved,
      integrantes: info.integrantes || [],
      isPending: false,
      // Puedes agregar más campos si la tabla los necesita
    };
  }
  // Filtrar y adaptar proyectos validados
  const validatedRows = unifiedRows
    .filter(row => !row.isPending && (row.approved === true || row.status === 'approved' || row.status === 'Aprobada'))
    .map(adaptValidatedRow);

  // Conteos
  const countPendientes = pendingRows.length;
  const countValidados = validatedRows.length;

  // FILTRADO POR CANTIDAD SELECCIONADA
  const displayedPendingRows = pendingPageSize === 'Todos' ? pendingRows : pendingRows.slice(0, Number(pendingPageSize));
  const displayedValidatedRows = validatedPageSize === 'Todos' ? validatedRows : validatedRows.slice(0, Number(validatedPageSize));

  // Definir columns antes de cualquier uso
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
      ) : (
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
            size="small"
            color="primary"
            disabled
            sx={{ fontWeight: 600 }}
          >
            VALIDADO
          </Button>
        </Box>
      ),
      width: '220px',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* TÍTULO Y DESCRIPCIÓN */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
          Validación de Horas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          En esta sección puedes validar las horas reportadas por los estudiantes en sus proyectos y consultar el historial de validaciones.
        </Typography>
      </Box>
      {/* Tarjetas de conteo usando Box en vez de Grid */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ bgcolor: '#1976d2', color: 'white', minWidth: 200, flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Typography variant="h6" align="center">Pendientes</Typography>
            <Typography variant="h3" fontWeight={700} align="center">{countPendientes}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#43a047', color: 'white', minWidth: 200, flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Typography variant="h6" align="center">Validados</Typography>
            <Typography variant="h3" fontWeight={700} align="center">{countValidados}</Typography>
          </CardContent>
        </Card>
      </Box>
      {/* Tabla de pendientes */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Proyectos pendientes de validación
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="pending-page-size-label">Mostrar</InputLabel>
            <Select
              labelId="pending-page-size-label"
              value={pendingPageSize}
              label="Mostrar"
              onChange={e => setPendingPageSize(e.target.value as any)}
            >
              {pageSizeOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <DataTable
          data={displayedPendingRows}
          columns={columns}
          loading={loading || pendingLoading}
          error={error || pendingError}
          filters={[]}
          onFilterChange={() => {}}
          showPageSizeSelector={false}
        />
      </Paper>
      {/* Historial de validados */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Historial de proyectos validados
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="validated-page-size-label">Mostrar</InputLabel>
            <Select
              labelId="validated-page-size-label"
              value={validatedPageSize}
              label="Mostrar"
              onChange={e => setValidatedPageSize(e.target.value as any)}
            >
              {pageSizeOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <DataTable
          data={displayedValidatedRows}
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
} 