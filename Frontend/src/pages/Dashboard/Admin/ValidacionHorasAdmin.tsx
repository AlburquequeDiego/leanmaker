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
  Divider,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import { useTheme } from '../../../contexts/ThemeContext';

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
  company_gpa?: number;
  student_gpa?: number;
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

/**
 * Traduce la modalidad del inglés al español
 */
const translateModality = (modality: string): string => {
  const modalityMap: Record<string, string> = {
    'remoto': 'Remoto',
    'presencial': 'Presencial',
    'híbrido': 'Híbrido',
    'remote': 'Remoto',
    'onsite': 'Presencial',
    'hybrid': 'Híbrido',
  };
  return modalityMap[modality.toLowerCase()] || modality;
};

export default function ValidacionHorasAdmin() {
  const { themeMode } = useTheme();
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
  const [pendingPageSize, setPendingPageSize] = useState<number | 'Todos'>(15);
  const [validatedPageSize, setValidatedPageSize] = useState<number | 'Todos'>(15);

  // Nuevos estados para alertas de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'validate_project_hours';
    message: string;
    projectId: string;
    projectTitle: string;
    action: () => Promise<void>;
  } | null>(null);

  // Opciones para el selector
  const pageSizeOptions = [15, 50, 100, 150, 'Todos'];

  useEffect(() => {
    loadWorkHours();
    loadPendingProjects();
  }, [pageSize, currentPage, filters]);

  const loadWorkHours = async () => {
    try {
      console.log('🔄 [DEBUG] Cargando horas trabajadas...');
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      if (typeof pageSize === 'string') {
        params.append('limit', '1000000'); // Para obtener todos los registros, evitar 0
      } else {
        params.append('limit', pageSize.toString());
        params.append('offset', ((currentPage - 1) * pageSize).toString());
      }

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('search', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      console.log('🔍 [DEBUG] Parámetros de consulta:', params.toString());
      const response = await apiService.get(`/api/work-hours/?${params.toString()}`);
      
      console.log('📊 [DEBUG] Respuesta de horas trabajadas:', response);
      const hours = (response as any).results || [];
      console.log('📊 [DEBUG] Horas extraídas:', hours);
      
      setWorkHours(hours);
      setTotalCount((response as any).count || 0);
    } catch (err: any) {
      console.error('❌ [DEBUG] Error al cargar horas trabajadas:', err);
      setError(err.response?.data?.message || 'Error al cargar horas trabajadas');
      setWorkHours([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProjects = async () => {
    try {
      console.log('🔄 [DEBUG] Cargando proyectos pendientes...');
      setPendingLoading(true);
      setPendingError(null);
      const response = await apiService.get('/api/projects/completed_pending_hours/');
      
      console.log('📊 [DEBUG] Respuesta de proyectos pendientes:', response);
      const projects = (response as any).results || [];
      console.log('📊 [DEBUG] Proyectos extraídos:', projects);
      
      setPendingProjects(projects);
    } catch (err: any) {
      console.error('❌ [DEBUG] Error al cargar proyectos pendientes:', err);
      setPendingError(err.response?.data?.error || 'Error al cargar proyectos pendientes');
      setPendingProjects([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleValidateProject = async (projectId: string) => {
    console.log('🔍 [DEBUG] handleValidateProject llamado con projectId:', projectId);
    console.log('🔍 [DEBUG] pendingProjects:', pendingProjects);
    
    // Buscar el proyecto para obtener información
    const project = pendingProjects.find(p => p.id === projectId);
    console.log('🔍 [DEBUG] Proyecto encontrado:', project);
    
    if (!project) {
      console.log('❌ [DEBUG] No se encontró el proyecto');
      return;
    }

    // Mostrar alerta de confirmación antes de validar
    setConfirmAction({
      type: 'validate_project_hours',
      message: `¿Estás seguro de que quieres validar las horas del proyecto "${project.project_title}"? Esta acción también requiere que revises y evalúes los strikes pendientes del mismo estudiante por este proyecto, si los hay.`,
      projectId,
      projectTitle: project.project_title,
      action: async () => {
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
      }
    });
    setShowConfirmDialog(true);
  };

  const handleOpenModal = async (hour: WorkHour) => {
    setSelectedHour(hour);
    setAdminComment('');
    setModalOpen(true);
  };

  const handleOpenDetailModal = async (row: any) => {
    console.log('🔍 [DEBUG] handleOpenDetailModal llamado con row:', row);
    console.log('🔍 [DEBUG] row.project_id:', row.project_id);
    console.log('🔍 [DEBUG] row.projectId:', row.projectId);
    console.log('🔍 [DEBUG] row.id:', row.id);
    
    // Evitar múltiples ejecuciones
    if (detailLoading || detailModalOpen) {
      console.log('⚠️ [DEBUG] Modal ya está abierto o cargando');
      return;
    }
    
    if (!row.project_id) {
      console.log('❌ [DEBUG] No se encontró project_id en la fila');
      setError('No se encontró el ID del proyecto');
      return;
    }
    
    console.log('✅ [DEBUG] Abriendo modal para proyecto:', row.project_id);
    setDetailLoading(true);
    setDetailModalOpen(true); // Abrir modal inmediatamente
    
    try {
      // Obtener detalles del proyecto, no de la hora de trabajo
      console.log('🔄 [DEBUG] Obteniendo detalles del proyecto:', row.project_id);
      const response = await apiService.get(`/api/projects/${row.project_id}/`);
      console.log('📊 [DEBUG] Detalles del proyecto obtenidos:', response);
      setSelectedProjectDetail(response as any);
    } catch (err: any) {
      console.error('❌ [DEBUG] Error al cargar detalles del proyecto:', err);
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
      await apiService.post(`/api/work-hours/${selectedHour.id}/approve/`, {
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

  // Función para ejecutar la acción confirmada
  const executeConfirmedAction = async () => {
    if (confirmAction?.action) {
      await confirmAction.action();
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  // Función para cancelar la confirmación
  const cancelConfirmedAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

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
  console.log('🔄 [DEBUG] Generando unifiedRows...');
  console.log('📊 [DEBUG] pendingProjects:', pendingProjects);
  console.log('📊 [DEBUG] workHours:', workHours);
  
  const unifiedRows = [
    // Proyectos pendientes de validación
    ...pendingProjects.map((project) => {
      const mappedProject = {
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
        project_id: project.id, // Agregar también project_id para compatibilidad
        estudiantes: project.estudiantes || project.participantes || [],
        date: project.date || project.real_end_date || project.estimated_end_date || project.created_at,
      };
      console.log('📊 [DEBUG] Proyecto mapeado:', mappedProject);
      return mappedProject;
    }),
    // Horas ya validadas
    ...workHours.map((row) => ({
      ...row,
      isPending: false,
    })),
  ];
  
  console.log('📊 [DEBUG] unifiedRows generado:', unifiedRows);

  // Definir pendingRows correctamente justo después de unifiedRows
  const pendingRows = unifiedRows.filter(row => row.isPending);

  // Construir diccionario de proyectos {id: {nombre, integrantes}} usando los pendientes
  const projectInfoMap: Record<string, { title: string; integrantes?: any[] }> = {};
  unifiedRows.forEach(row => {
    const id = row.project_id || (row as any).project || row.id;
    if (!id) return;
    projectInfoMap[id] = {
      title: row.project_title || (row as any).title || (row as any).nombre || (row as any).name || '-',
      integrantes: (row as any).estudiantes || (row as any).participantes || [],
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
      project_title: isWorkHour ? row.project_title : ((info as any).title || row.project_title || row.project?.title || row.project || '-'),
      company_name: row.company_name || row.empresa_nombre || row.company?.company_name || '-',
      hours: isWorkHour ? row.hours_worked : (row.hours_worked || row.horas || row.project_required_hours || '-'),
      status: isWorkHour ? (row.is_verified ? 'Validado' : 'Pendiente') : (row.status || (row.approved ? 'approved' : 'pending')),
      approved: isWorkHour ? row.is_verified : row.approved,
      integrantes: (info as any).integrantes || [],
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
    <Box sx={{ 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
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
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <AssessmentIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Validación de Horas
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Valida las horas reportadas por los estudiantes y consulta el historial de validaciones
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tarjetas de KPI con diseño mejorado */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ 
          minWidth: 250, 
          flex: '1 1 250px',
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
                  Pendientes
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {countPendientes}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Requieren validación
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

        <Card sx={{ 
          minWidth: 250, 
          flex: '1 1 250px',
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
                  Validados
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {countValidados}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  Procesados exitosamente
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
      </Box>
      {/* Tabla de pendientes con diseño mejorado */}
      <Card sx={{ 
        mb: 4, 
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
              borderRadius: 2, 
              p: 1, 
              mr: 2
            }}>
              <TimerIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
              }}>
                Proyectos Pendientes de Validación
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
              }}>
                Proyectos que requieren revisión y validación de horas
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="pending-page-size-label" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280' 
              }}>
                Mostrar
              </InputLabel>
              <Select
                labelId="pending-page-size-label"
                value={pendingPageSize}
                label="Mostrar"
                onChange={e => setPendingPageSize(e.target.value as any)}
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
        </CardContent>
      </Card>
      {/* Historial de validados con diseño mejorado */}
      <Card sx={{ 
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', 
              borderRadius: 2, 
              p: 1, 
              mr: 2
            }}>
              <HistoryIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
              }}>
                Historial de Proyectos Validados
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
              }}>
                Registro completo de todas las validaciones procesadas
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="validated-page-size-label" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280' 
              }}>
                Mostrar
              </InputLabel>
              <Select
                labelId="validated-page-size-label"
                value={validatedPageSize}
                label="Mostrar"
                onChange={e => setValidatedPageSize(e.target.value as any)}
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
        </CardContent>
      </Card>
      {/* Modal para ver integrantes con diseño mejorado */}
      <Dialog open={openIntegrantes} onClose={handleCloseIntegrantes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            <Typography variant="h6">Integrantes de {integrantesProyecto}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <List>
            {integrantes.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary={
                    <Typography variant="body1" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                      fontStyle: 'italic' 
                    }}>
                      No hay integrantes registrados
                    </Typography>
                  } 
                />
              </ListItem>
            ) : integrantes.map((est, idx) => (
              <ListItem key={idx} sx={{ 
                borderRadius: 2, 
                mb: 1, 
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                '&:hover': {
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #475569 0%, #64748b 100%)'
                    : 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                }
              }}>
                <ListItemText 
                  primary={
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500, 
                      color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                    }}>
                      {est.nombre || est.name || est.full_name || est.email}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
                    }}>
                      {est.email || est.career || 'Sin información adicional'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseIntegrantes}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de validación de hora con diseño mejorado */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6">Validar Hora de Trabajo</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedHour && (
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
                    Información de la Hora
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500 
                      }}>
                        Estudiante
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                        fontWeight: 500 
                      }}>
                        {selectedHour.student_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500 
                      }}>
                        Proyecto
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                        fontWeight: 500 
                      }}>
                        {selectedHour.project_title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500 
                      }}>
                        Fecha
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                        fontWeight: 500 
                      }}>
                        {new Date(selectedHour.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500 
                      }}>
                        Horas Trabajadas
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50', 
                        fontWeight: 500 
                      }}>
                        {selectedHour.hours_worked} horas
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500 
                      }}>
                        Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                      }}>
                        {selectedHour.description || 'Sin descripción'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentario del Administrador"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Agregar comentario sobre la validación (opcional)"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#4ecdc4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#4ecdc4',
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
        }}>
          <Button 
            onClick={handleCloseModal}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#334155' : '#f3f4f6',
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleValidate} 
            variant="contained" 
            disabled={actionLoading}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #44a08d 0%, #3a8c7a 100%)',
              }
            }}
          >
            {actionLoading ? 'Validando...' : 'Validar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver detalles del proyecto */}
      <Dialog 
        open={detailModalOpen} 
        onClose={handleCloseDetailModal}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon />
            <Typography variant="h6">
              {detailLoading ? 'Cargando...' : 'Detalles del Proyecto'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          p: 3
        }}>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedProjectDetail ? (
            <Box sx={{ mt: 2 }}>
              {/* Información básica del proyecto */}
              <Card sx={{ 
                mb: 3, 
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50',
                    mb: 2
                  }}>
                    {selectedProjectDetail.title}
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50',
                        lineHeight: 1.6
                      }}>
                        {selectedProjectDetail.description}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Requisitos
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                      }}>
                        {selectedProjectDetail.requirements}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Modalidad
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                      }}>
                        {translateModality(selectedProjectDetail.modality)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Duración
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                      }}>
                        {selectedProjectDetail.duration_weeks} semanas
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Horas por semana
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                      }}>
                        {selectedProjectDetail.hours_per_week} horas
                      </Typography>
                    </Box>

                    {selectedProjectDetail.required_hours && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Horas totales requeridas
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.required_hours} horas
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.api_level && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Nivel API requerido
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          Nivel {selectedProjectDetail.api_level}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.min_api_level && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Nivel API mínimo
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          Nivel {selectedProjectDetail.min_api_level}
                        </Typography>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                        fontWeight: 500
                      }}>
                        Estudiantes
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                      }}>
                        {selectedProjectDetail.current_students} de {selectedProjectDetail.max_students} máximo
                      </Typography>
                    </Box>

                    {selectedProjectDetail.location && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Ubicación
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.location}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.start_date && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Fecha de inicio
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {new Date(selectedProjectDetail.start_date).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.estimated_end_date && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Fecha estimada de finalización
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {new Date(selectedProjectDetail.estimated_end_date).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.real_end_date && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Fecha real de finalización
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {new Date(selectedProjectDetail.real_end_date).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.application_deadline && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Fecha límite de aplicación
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {new Date(selectedProjectDetail.application_deadline).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.objetivo && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Objetivo
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.objetivo}
                        </Typography>
                      </Box>
                    )}

                    {selectedProjectDetail.encargado && (
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Encargado
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.encargado}
                        </Typography>
                      </Box>
                    )}

                                         {selectedProjectDetail.contacto && (
                       <Box>
                         <Typography variant="body2" sx={{ 
                           color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                           fontWeight: 500
                         }}>
                           Contacto
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                         }}>
                           {selectedProjectDetail.contacto}
                         </Typography>
                       </Box>
                     )}

                     {selectedProjectDetail.area && (
                       <Box>
                         <Typography variant="body2" sx={{ 
                           color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                           fontWeight: 500
                         }}>
                           Área
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                         }}>
                           {selectedProjectDetail.area.name}
                         </Typography>
                         {selectedProjectDetail.area.description && (
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#6b7280',
                             fontStyle: 'italic',
                             mt: 0.5
                           }}>
                             {selectedProjectDetail.area.description}
                           </Typography>
                         )}
                       </Box>
                     )}

                     {selectedProjectDetail.trl && (
                       <Box>
                         <Typography variant="body2" sx={{ 
                           color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                           fontWeight: 500
                         }}>
                           Nivel TRL
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                         }}>
                           Nivel {selectedProjectDetail.trl.level}: {selectedProjectDetail.trl.name}
                         </Typography>
                         {selectedProjectDetail.trl.description && (
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#6b7280',
                             fontStyle: 'italic',
                             mt: 0.5
                           }}>
                             {selectedProjectDetail.trl.description}
                           </Typography>
                         )}
                       </Box>
                     )}

                     {/* Información adicional del proyecto */}
                     <Box sx={{ 
                       display: 'flex', 
                       gap: 2, 
                       flexWrap: 'wrap',
                       mt: 2,
                       p: 2,
                       borderRadius: 2,
                       background: themeMode === 'dark' 
                         ? 'rgba(255, 255, 255, 0.05)' 
                         : 'rgba(0, 0, 0, 0.02)'
                     }}>
                       {selectedProjectDetail.is_featured && (
                         <Chip 
                           label="Destacado" 
                           color="primary" 
                           size="small"
                           icon={<TrendingUpIcon />}
                         />
                       )}
                       {selectedProjectDetail.is_urgent && (
                         <Chip 
                           label="Urgente" 
                           color="error" 
                           size="small"
                           icon={<ScheduleIcon />}
                         />
                       )}
                       {selectedProjectDetail.is_project_completion && (
                         <Chip 
                           label="Completado" 
                           color="success" 
                           size="small"
                           icon={<CheckCircleIcon />}
                         />
                       )}
                     </Box>
                                        </Stack>
                   </CardContent>
                 </Card>

                 {/* Información de fechas */}
                 <Card sx={{ 
                   mb: 3, 
                   background: themeMode === 'dark' 
                     ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                     : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                   borderRadius: 2
                 }}>
                   <CardContent sx={{ p: 3 }}>
                     <Typography variant="h6" sx={{ 
                       fontWeight: 'bold', 
                       color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50',
                       mb: 2
                     }}>
                       Información de Fechas
                     </Typography>
                     
                     <Stack spacing={2}>
                       <Box>
                         <Typography variant="body2" sx={{ 
                           color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                           fontWeight: 500
                         }}>
                           Creado
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                         }}>
                           {new Date(selectedProjectDetail.created_at).toLocaleDateString('es-ES')} a las {new Date(selectedProjectDetail.created_at).toLocaleTimeString('es-ES')}
                         </Typography>
                       </Box>
                       
                       <Box>
                         <Typography variant="body2" sx={{ 
                           color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                           fontWeight: 500
                         }}>
                           Última actualización
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                         }}>
                           {new Date(selectedProjectDetail.updated_at).toLocaleDateString('es-ES')} a las {new Date(selectedProjectDetail.updated_at).toLocaleTimeString('es-ES')}
                         </Typography>
                       </Box>

                       {selectedProjectDetail.published_at && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                             fontWeight: 500
                           }}>
                             Publicado
                           </Typography>
                           <Typography variant="body1" sx={{ 
                             color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                           }}>
                             {new Date(selectedProjectDetail.published_at).toLocaleDateString('es-ES')} a las {new Date(selectedProjectDetail.published_at).toLocaleTimeString('es-ES')}
                           </Typography>
                         </Box>
                       )}
                     </Stack>
                   </CardContent>
                 </Card>
               
               {/* Información de la empresa */}
              {selectedProjectDetail.company && (
                <Card sx={{ 
                  mb: 3, 
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50',
                      mb: 2
                    }}>
                      Información de la Empresa
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Nombre
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.company.name}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                          fontWeight: 500
                        }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                        }}>
                          {selectedProjectDetail.company.email}
                        </Typography>
                      </Box>
                      
                      {selectedProjectDetail.company.phone && (
                        <Box>
                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                            fontWeight: 500
                          }}>
                            Teléfono
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                          }}>
                            {selectedProjectDetail.company.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedProjectDetail.company.website && (
                        <Box>
                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d', 
                            fontWeight: 500
                          }}>
                            Sitio web
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50'
                          }}>
                            {selectedProjectDetail.company.website}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se pudieron cargar los detalles del proyecto
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
        }}>
          <Button 
            onClick={handleCloseDetailModal}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para validación de horas */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={cancelConfirmedAction}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AssessmentIcon sx={{ fontSize: 24 }} />
          Confirmar Validación de Horas
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          pt: 4,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Typography variant="body1" sx={{ 
            fontSize: '1rem',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            lineHeight: 1.6,
            mb: 2
          }}>
            {confirmAction?.message}
          </Typography>
          
          {/* Información adicional sobre la validación */}
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              <strong>⚠️ Importante:</strong> Al validar las horas de este proyecto, también debes revisar:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Strikes pendientes del estudiante por este proyecto
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Evaluaciones pendientes de la empresa hacia el estudiante
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Cualquier incidencia reportada relacionada con este proyecto
              </Typography>
            </Box>
          </Alert>
          
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              <strong>ℹ️ Recordatorio:</strong> La validación de horas es un proceso que confirma la finalización exitosa del proyecto y asigna las horas correspondientes a todos los estudiantes participantes.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
        }}>
          <Button 
            onClick={cancelConfirmedAction}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#334155' : '#f3f4f6',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={executeConfirmedAction}
            disabled={validatingProjectId === confirmAction?.projectId}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {validatingProjectId === confirmAction?.projectId ? 'Validando...' : 'Validar Horas'}
          </Button>
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