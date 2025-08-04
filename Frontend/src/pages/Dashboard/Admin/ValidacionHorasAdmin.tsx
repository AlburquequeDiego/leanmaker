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
import { translateModality } from '../../../utils/adapters';

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

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  requirements: string;
  tipo?: string;
  objetivo?: string;
  encargado?: string;
  contacto?: string;
  api_level?: number;
  required_hours?: number;
  duration_weeks: number;
  hours_per_week: number;
  min_api_level: number;
  max_students: number;
  current_students: number;
  modality: string;
  location?: string;
  
  start_date?: string;
  estimated_end_date?: string;
  real_end_date?: string;
  application_deadline?: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_project_completion: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    description?: string;
    industry?: string;
    size?: string;
    location?: string;
  };
  area?: {
    id: string;
    name: string;
    description?: string;
  };
  trl?: {
    id: string;
    name: string;
    description?: string;
    level: number;
  };
}

export default function ValidacionHorasAdmin() {
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<WorkHour | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
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
      const response = await apiService.post(`/api/projects/${projectId}/validate_hours/`);
      setSnackbarMsg('Horas validadas correctamente para el proyecto');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSuccessMsg('Horas validadas correctamente para el proyecto');
      loadPendingProjects();
      loadWorkHours();
    } catch (err: any) {
      setPendingError(err.response?.data?.error || 'Error al validar horas del proyecto');
      setSnackbarMsg(err.response?.data?.error || 'Error al validar horas del proyecto');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setValidatingProjectId(null);
    }
  };

  const handleOpenModal = async (hour: WorkHour) => {
    setSelectedHour(hour);
    setAdminComment('');
    setModalOpen(true);
  };

  const handleOpenDetailModal = async (row: any) => {
    // Evitar múltiples ejecuciones
    if (detailLoading || detailModalOpen) {
      return;
    }
    
    if (!row.project_id) {
      setError('No se encontró el ID del proyecto');
      return;
    }
    
    setDetailLoading(true);
    setDetailModalOpen(true); // Abrir modal inmediatamente
    
    try {
      // Obtener detalles del proyecto, no de la hora de trabajo
      const response = await apiService.get(`/api/projects/${row.project_id}/`);
      setSelectedProjectDetail(response);
    } catch (err: any) {
      setError('Error al cargar los detalles del proyecto');
      setDetailModalOpen(false); // Cerrar modal si hay error
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    // Limpiar los datos después de un pequeño delay para evitar problemas de renderizado
    setTimeout(() => {
      setSelectedProjectDetail(null);
      setDetailLoading(false);
    }, 100);
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
      student_name: project.student_name || '—',
      student_email: project.student_email || '—',
      project_title: project.title || project.project_title || project.nombre || project.name || '-',
      company_name: project.company_name || project.empresa || project.company || project.empresa_nombre || '-',
      hours: project.offered_hours || project.horas || project.required_hours || project.project_required_hours || '-',
      project_details: project.description || project.detalles || project.project_details || '-',
      status: 'Pendiente',
      isPending: true,
      projectId: project.id,
      estudiantes: project.estudiantes || project.participantes || [],
      date: project.date || project.real_end_date || project.estimated_end_date || project.created_at,
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
    
    // Determinar si es una hora de trabajo individual o un proyecto
    const isWorkHour = row.student_name && row.project_title;
    
    const result = {
      id: row.id,
      project_title: isWorkHour ? row.project_title : (info.title || row.project_title || row.project?.title || row.project || '-'),
      company_name: row.company_name || row.empresa_nombre || row.company?.company_name || '-',
      hours: isWorkHour ? row.hours_worked : (row.hours_worked || row.horas || row.project_required_hours || '-'),
      status: isWorkHour ? (row.is_verified ? 'Validado' : 'Pendiente') : (row.status || (row.approved ? 'approved' : 'pending')),
      approved: isWorkHour ? row.is_verified : row.approved,
      integrantes: info.integrantes || [],
      isPending: false,
      // Campos adicionales para horas de trabajo
      student_name: row.student_name,
      student_email: row.student_email,
      date: row.date,
      description: row.description,
      // Marcar si es una hora de trabajo real (para el botón "Ver Detalle")
      isWorkHour: isWorkHour,
      // Incluir project_id para poder acceder a los detalles del proyecto
      project_id: row.project_id,
      // Puedes agregar más campos si la tabla los necesita
    };
    
    return result;
  }
  // Filtrar y adaptar proyectos validados
  const validatedRows = unifiedRows
    .filter(row => !row.isPending)
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
      key: 'student_name',
      label: 'Estudiante',
      render: (value: string, row: any) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">{row.student_email || '-'}</Typography>
        </Box>
      ),
      width: '180px',
    },
    {
      key: 'company_name',
      label: 'Empresa',
      render: (value: string, row: any) => value || row.company || row.empresa || row.company_name || row.empresa_nombre || '-',
      width: '150px',
    },
    {
      key: 'hours',
      label: 'Horas',
      render: (value: any, row: any) => value || row.offered_hours || row.horas || row.required_hours || row.project_required_hours || '-',
      width: '80px',
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (value: string, row: any) => value ? new Date(value).toLocaleDateString('es-ES') : '-',
      width: '100px',
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string, row: any) => (
        <Chip 
          label={value} 
          color={value === 'Validado' || value === 'approved' ? 'success' : 'warning'}
          size="small"
        />
      ),
      width: '100px',
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => {
        if (row.isPending) {
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
          );
        } else if (row.isWorkHour) {
          // Para horas de trabajo individuales
          const isVerified = row.status === 'Validado' || row.approved;
          
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => handleOpenDetailModal(row)}
                disabled={detailLoading || detailModalOpen}
              >
                {detailLoading ? 'Cargando...' : 'Ver Detalle'}
              </Button>
              {isVerified ? (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  disabled
                  sx={{ fontWeight: 600 }}
                >
                  VALIDADO
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleOpenModal(row)}
                >
                  Validar
                </Button>
              )}
            </Box>
          );
        } else {
          // Para proyectos (caso general)
          return (
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
          );
        }
      },
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

      {/* Modal de validación de hora */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6">Validar Hora de Trabajo</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedHour && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Información de la Hora
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Estudiante</Typography>
                <Typography variant="body1">{selectedHour.student_name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Proyecto</Typography>
                <Typography variant="body1">{selectedHour.project_title}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                <Typography variant="body1">{new Date(selectedHour.date).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Horas Trabajadas</Typography>
                <Typography variant="body1">{selectedHour.hours_worked} horas</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Descripción</Typography>
                <Typography variant="body1">{selectedHour.description || 'Sin descripción'}</Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentario del Administrador"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Agregar comentario sobre la validación (opcional)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            onClick={handleValidate} 
            variant="contained" 
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Aprobar Hora'}
          </Button>
        </DialogActions>
      </Dialog>

             {/* Modal de detalle del proyecto */}
       <Dialog open={detailModalOpen} onClose={handleCloseDetailModal} maxWidth="lg" fullWidth>
         <DialogTitle>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <WorkIcon />
             <Typography variant="h6">Detalle del Proyecto</Typography>
           </Box>
         </DialogTitle>
         <DialogContent>
           {detailLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
               <CircularProgress />
             </Box>
           ) : selectedProjectDetail && selectedProjectDetail.title ? (
             <Box sx={{ mt: 2 }}>
               {/* Información del proyecto */}
               <Card sx={{ mb: 3 }}>
                 <CardContent>
                   <Typography variant="h6" gutterBottom>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <WorkIcon />
                       Información del Proyecto
                     </Box>
                   </Typography>
                   <Box sx={{ mb: 2 }}>
                     <Typography variant="h5" color="primary" gutterBottom>
                       {selectedProjectDetail.title}
                     </Typography>
                     <Typography variant="body1" paragraph>
                       {selectedProjectDetail.description}
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Tipo de Actividad</Typography>
                       <Typography variant="body1">{selectedProjectDetail.tipo || 'No especificado'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Objetivo</Typography>
                       <Typography variant="body1">{selectedProjectDetail.objetivo || 'No especificado'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Encargado</Typography>
                       <Typography variant="body1">{selectedProjectDetail.encargado || 'No especificado'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Contacto</Typography>
                       <Typography variant="body1">{selectedProjectDetail.contacto || 'No especificado'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Nivel API Requerido</Typography>
                       <Typography variant="body1">{selectedProjectDetail.api_level || 'No especificado'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Horas Requeridas</Typography>
                       <Typography variant="body1">{selectedProjectDetail.required_hours || 'No especificadas'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Duración (semanas)</Typography>
                       <Typography variant="body1">{selectedProjectDetail.duration_weeks} semanas</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Horas por Semana</Typography>
                       <Typography variant="body1">{selectedProjectDetail.hours_per_week} horas</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Modalidad</Typography>
                       <Chip label={translateModality(selectedProjectDetail.modality)} color="info" size="small" />
                     </Box>
                     
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Ubicación</Typography>
                       <Typography variant="body1">{selectedProjectDetail.location || 'No especificada'}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="subtitle2" color="text.secondary">Estudiantes</Typography>
                       <Typography variant="body1">{selectedProjectDetail.current_students} / {selectedProjectDetail.max_students}</Typography>
                     </Box>
                   </Box>
                   
                   {/* Requisitos del proyecto */}
                   <Box sx={{ mt: 3 }}>
                     <Typography variant="subtitle1" gutterBottom>
                       Requisitos del Proyecto
                     </Typography>
                     <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                       {selectedProjectDetail.requirements}
                     </Typography>
                   </Box>
                 </CardContent>
               </Card>

               {/* Información de la empresa */}
               {selectedProjectDetail.company && (
                 <Card sx={{ mb: 3 }}>
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       Información de la Empresa
                     </Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.name}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.email}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.phone || 'No especificado'}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Sitio Web</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.website || 'No especificado'}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Industria</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.industry || 'No especificada'}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Tamaño</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.size || 'No especificado'}</Typography>
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary">Ubicación</Typography>
                         <Typography variant="body1">{selectedProjectDetail.company.location || 'No especificada'}</Typography>
                       </Box>
                     </Box>
                     {selectedProjectDetail.company.description && (
                       <Box sx={{ mt: 2 }}>
                         <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                         <Typography variant="body2">{selectedProjectDetail.company.description}</Typography>
                       </Box>
                     )}
                   </CardContent>
                 </Card>
               )}

               {/* Información del área y TRL */}
               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                 {selectedProjectDetail.area && (
                   <Card>
                     <CardContent>
                       <Typography variant="h6" gutterBottom>
                         Área del Proyecto
                       </Typography>
                       <Typography variant="subtitle1">{selectedProjectDetail.area.name}</Typography>
                       {selectedProjectDetail.area.description && (
                         <Typography variant="body2" color="text.secondary">
                           {selectedProjectDetail.area.description}
                         </Typography>
                       )}
                     </CardContent>
                   </Card>
                 )}
                 
                 {selectedProjectDetail.trl && (
                   <Card>
                     <CardContent>
                       <Typography variant="h6" gutterBottom>
                         Nivel TRL
                       </Typography>
                       <Typography variant="subtitle1">{selectedProjectDetail.trl.name}</Typography>
                       <Typography variant="body2" color="text.secondary">
                         Nivel {selectedProjectDetail.trl.level}
                       </Typography>
                       {selectedProjectDetail.trl.description && (
                         <Typography variant="body2" color="text.secondary">
                           {selectedProjectDetail.trl.description}
                         </Typography>
                       )}
                     </CardContent>
                   </Card>
                 )}
               </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No se pudieron cargar los detalles del proyecto
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Cerrar</Button>
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