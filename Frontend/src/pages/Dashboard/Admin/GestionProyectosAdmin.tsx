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
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
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
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable, ProjectDetailsModal } from '../../../components/common';

interface Project {
  id: string;
  title: string;
  company_name: string;
  company_id: string;
  description: string;
  status: 'activo' | 'suspendido' | 'completado' | 'eliminado' | 'publicado';
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
  area?: string;
}

interface Application {
  id: string;
  student_name: string;
  student_email: string;
  project_title: string;
  api_level: number;
  gpa: number;
  compatibility_score: number;
  status: 'pendiente' | 'aceptado' | 'rechazado';
  application_date: string;
}

const GestionProyectosAdmin = () => {
  const { themeMode } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'suspend' | 'delete' | 'view_students' | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [projectStudents, setProjectStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Estados para el modal de detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'ultimos' | 'todos'>(50);
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
      if (filters.area) params.append('area', filters.area);

      console.log('🔍 Parámetros de consulta:', params.toString());
      console.log('🔍 Filtros aplicados:', filters);

      const response: any = await apiService.get(`/api/admin/projects/?${params.toString()}`);
      
      // Mapear datos del backend al formato esperado por el frontend
      const mappedProjects = (response.results || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        company_name: p.company_name || 'Sin empresa',
        company_id: p.company_id || '',
        description: p.description || '',
        status: p.status || 'activo',
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
        is_project_completion: p.is_project_completion,
        area: p.area
      }));
      
      // Datos procesados correctamente
      console.log('🔍 Estados de proyectos recibidos:', mappedProjects.map(p => ({ id: p.id, title: p.title, status: p.status })));
      console.log('🔍 Datos completos del primer proyecto:', mappedProjects[0] || 'No hay proyectos');
      console.log('🔍 Total de proyectos:', mappedProjects.length);
      
      setProjects(mappedProjects);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProjects([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  // Función eliminada - no se usa en este componente

  const handleAction = (project: Project, type: 'edit' | 'suspend' | 'delete' | 'view_students') => {
    setSelectedProject(project);
    setActionType(type);
    setActionDialog(true);
    
    // Si es ver estudiantes, cargar la lista
    if (type === 'view_students') {
      fetchProjectStudents(project.id);
    }
  };

  const handleViewProjectDetails = async (project: Project) => {
    setSelectedProjectDetail(project);
    setDetailModalOpen(true);
    setLoadingProjectDetail(true);
    
    try {
      // Obtener detalles completos del proyecto desde el backend
      const response: any = await apiService.get(`/api/projects/${project.id}/`);
      setSelectedProjectDetail(response.data || response);
    } catch (error) {
      console.error('Error obteniendo detalles del proyecto:', error);
    } finally {
      setLoadingProjectDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProjectDetail(null);
  };

  const fetchProjectStudents = async (projectId: string) => {
    try {
      setLoadingStudents(true);
      console.log('🔍 Buscando participante del proyecto:', projectId);
      
      let student = null;
      let response;
      
      // Endpoint 1: participants (participante activo del proyecto)
      try {
        response = await apiService.get(`/api/projects/${projectId}/participants/`);
        // Respuesta del endpoint participants procesada
        
        if (response.participantes && response.participantes.length > 0) {
          student = response.participantes[0]; // Solo el primer participante
        } else if (response.students && response.students.length > 0) {
          student = response.students[0];
        } else if (response.results && response.results.length > 0) {
          student = response.results[0];
        } else if (Array.isArray(response) && response.length > 0) {
          student = response[0];
        }
      } catch (error) {
        console.log('❌ Error con endpoint participants, intentando alternativo...');
      }
      
      // Si no hay participante activo, intentar endpoint 2: project detail (que incluye el participante)
      if (!student) {
        try {
          response = await apiService.get(`/api/projects/${projectId}/`);
          // Respuesta del endpoint project detail procesada
          
          if (response.estudiantes && response.estudiantes.length > 0) {
            student = response.estudiantes[0];
          } else if (response.students && response.students.length > 0) {
            student = response.students[0];
          } else if (response.participantes && response.participantes.length > 0) {
            student = response.participantes[0];
          }
        } catch (error) {
          console.log('❌ Error con endpoint project detail');
        }
      }
      
      // Si no hay participante, intentar endpoint 3: applications (aplicación aceptada)
      if (!student) {
        try {
          response = await apiService.get(`/api/applications/`);
          // Respuesta del endpoint applications procesada
          
          // Filtrar aplicaciones para este proyecto específico
          let projectApplications = [];
          if (response.data) {
            projectApplications = response.data.filter((app: any) => app.project_id === projectId);
          } else if (response.results) {
            projectApplications = response.results.filter((app: any) => app.project_id === projectId);
          } else if (Array.isArray(response)) {
            projectApplications = response.filter((app: any) => app.project_id === projectId);
          }
          
          // Aplicaciones para este proyecto procesadas
          
          // Obtener la primera aplicación aceptada
          const acceptedApplication = projectApplications.find((app: any) => 
            app.status === 'accepted' || app.status === 'approved' || app.status === 'active'
          );
          
          if (acceptedApplication) {
            try {
              const appDetail: any = await apiService.get(`/api/applications/${acceptedApplication.id}/`);
              // Detalle de aplicación procesado
              
              if (appDetail.student) {
                student = {
                  id: appDetail.student.id || appDetail.student.user?.id,
                  nombre: appDetail.student.nombre || appDetail.student.name || appDetail.student.full_name || 'Sin nombre',
                  email: appDetail.student.email || appDetail.student.user?.email || 'Sin email',
                  status: appDetail.status,
                  api_level: appDetail.student.api_level
                };
              }
            } catch (detailError) {
              console.log('❌ Error obteniendo detalle de aplicación:', detailError);
            }
          }
        } catch (error) {
          console.log('❌ Error con endpoint applications');
        }
      }
      
      console.log('👤 Participante encontrado:', student);
      setProjectStudents(student ? [student] : []); // Convertir a array para mantener compatibilidad
    } catch (error) {
      console.error('❌ Error fetching project student:', error);
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
           payload = {};
           break;
         case 'delete':
           endpoint = `/api/admin/projects/${selectedProject.id}/delete/`;
           payload = {};
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
    // Debug: mostrar el estado que llega del backend
    console.log('🔍 Estado del proyecto recibido:', status);
    
    switch (status) {
      case 'published':
      case 'publicado':
        return 'Publicado';
      case 'active':
      case 'activo':
        return 'Activo';
      case 'completed':
      case 'completado':
        return 'Completado';
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      case 'accepted':
      case 'aceptado':
        return 'Aceptado';
      case 'rejected':
      case 'rechazado':
        return 'Rechazado';
      case 'cancelled':
      case 'eliminado':
      case 'deleted':
      case 'closed':
      case 'terminated':
        return 'Eliminado';
      case 'suspended':
      case 'suspendido':
        return 'Suspendido';
      default:
        console.log('⚠️ Estado no reconocido:', status);
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'publicado':
        return 'info'; // Azul
      case 'suspended':
      case 'suspendido':
        return 'warning'; // Amarillo
      case 'active':
      case 'activo':
        return 'success'; // Verde
      case 'completed':
      case 'completado':
        return 'primary'; // Azul fuerte
      case 'pending':
      case 'pendiente':
        return 'warning'; // Amarillo
      case 'accepted':
      case 'aceptado':
        return 'success'; // Verde
      case 'rejected':
      case 'rechazado':
        return 'error'; // Rojo
      case 'cancelled':
      case 'eliminado':
      case 'deleted':
      case 'closed':
      case 'terminated':
        return 'error'; // Rojo
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pendiente':
        return <ScheduleIcon />;
      case 'accepted':
      case 'aceptado':
        return <CheckCircleIcon />;
      case 'rejected':
      case 'rechazado':
        return <CancelIcon />;
      case 'completed':
      case 'completado':
        return <TrendingUpIcon />;
      case 'active':
      case 'activo':
        return <CheckCircleIcon />;
      case 'published':
      case 'publicado':
        return <ScheduleIcon />;
      case 'cancelled':
      case 'eliminado':
      case 'deleted':
      case 'closed':
      case 'terminated':
        return <CancelIcon />;
      case 'suspended':
      case 'suspendido':
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
      key: 'area',
      label: 'Área',
      render: (value: string) => (
        <Chip 
          label={value || 'Sin área'} 
          color="secondary" 
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
      width: '120px',
      align: 'center' as const
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
        { value: 'activo', label: 'Activo' },
        { value: 'suspendido', label: 'Suspendido' },
        { value: 'completado', label: 'Completado' },
        { value: 'eliminado', label: 'Eliminado' },
        { value: 'deleted', label: 'Eliminado' }
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
    console.log('🔍 Filtros aplicados:', newFilters);
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
      <Tooltip title="Ver Detalles">
        <span>
          <IconButton
            onClick={() => handleViewProjectDetails(row)}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)',
                transform: 'scale(1.1)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e',
              }
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Ver Participante">
        <span>
          <IconButton
            onClick={() => handleAction(row, 'view_students')}
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
            <PeopleIcon />
          </IconButton>
        </span>
      </Tooltip>
      {(row.status === 'active') && (
        <Tooltip title="Suspender">
          <span>
            <IconButton
              onClick={() => handleAction(row, 'suspend')}
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
              <BlockIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Eliminar">
        <span>
          <IconButton
            onClick={() => handleAction(row, 'delete')}
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
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );

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
                <WorkIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Proyectos
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Administra y supervisa todos los proyectos registrados en la plataforma
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Actualizar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 5 tarjetas estáticas - Tamaño fijo y sin responsive */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        justifyContent: 'center',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
        }
      }}>
        {/* Tarjeta 1: Total Proyectos */}
        <Card sx={{ 
          height: 200,
          width: 280,
          flexShrink: 0,
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          boxShadow: '0 12px 35px rgba(78, 205, 196, 0.4)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ 
            p: 4, 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 800, 
              mb: 1,
              fontSize: '3.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {projects.length || 0}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              Total Proyectos
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              Registrados en la plataforma
            </Typography>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Proyectos Activos */}
        <Card sx={{ 
          height: 200,
          width: 280,
          flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ 
            p: 4, 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 800, 
              mb: 1,
              fontSize: '3.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {projects.filter(p => 
                p.status === 'active' || 
                p.status === 'published' || 
                p.status === 'open' || 
                p.status === 'in-progress'
              ).length}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              Proyectos Activos
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              En desarrollo
            </Typography>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Total Aplicaciones */}
        <Card sx={{ 
          height: 200,
          width: '100%',
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          boxShadow: '0 12px 35px rgba(155, 89, 182, 0.4)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ 
            p: 4, 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 800, 
              mb: 1,
              fontSize: '3.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {projects.reduce((sum, project) => sum + (project.applications_count || 0), 0)}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              Total Aplicaciones
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              Solicitudes recibidas
            </Typography>
          </CardContent>
        </Card>

        {/* Tarjeta 4: Proyectos Completados */}
        <Card sx={{ 
          height: 200,
          width: '100%',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          boxShadow: '0 12px 35px rgba(255, 107, 107, 0.4)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ 
            p: 4, 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 800, 
              mb: 1,
              fontSize: '3.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {projects.filter(p => 
                p.status === 'completed'
              ).length}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              Completados
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              Proyectos finalizados
            </Typography>
          </CardContent>
        </Card>

        {/* Tarjeta 5: Proyectos Inactivos */}
        <Card sx={{ 
          height: 200,
          width: '100%',
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          boxShadow: '0 12px 35px rgba(231, 76, 60, 0.4)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ 
            p: 4, 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontWeight: 800, 
              mb: 1,
              fontSize: '3.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {projects.filter(p => 
                p.status === 'deleted' || 
                p.status === 'cancelled' || 
                p.status === 'closed' || 
                p.status === 'terminated' || 
                p.status === 'suspended'
              ).length}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              Inactivos
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              Eliminados/Suspendidos
            </Typography>
          </CardContent>
        </Card>
      </Box>
      


      {/* Filtros y tabla de proyectos con diseño mejorado */}
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
                Lista de Proyectos
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
              }}>
                Gestiona el estado y configuración de todos los proyectos
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={pageSize}
                label="Mostrar"
                onChange={(e) => setPageSize(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={50}>50 últimos</MenuItem>
                <MenuItem value={100}>100 últimos</MenuItem>
                <MenuItem value={200}>200 últimos</MenuItem>
                <MenuItem value={500}>500 últimos</MenuItem>
                <MenuItem value={1000}>1000 últimos</MenuItem>
                <MenuItem value={'todos'}>Todos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Filtros mejorados */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              sx={{ 
                borderRadius: 2,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                }
              }}
            >
              Limpiar Filtros
            </Button>
            <TextField
              label="Buscar por título o empresa"
              variant="outlined"
              size="small"
              value={filters.search || ''}
              onChange={e => handleFilterChange({ ...filters, search: e.target.value })}
              sx={{ 
                minWidth: 220,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                ),
              }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={filters.status || ''}
                onChange={e => handleFilterChange({ ...filters, status: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="publicado">Publicado</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="suspendido">Suspendido</MenuItem>
                <MenuItem value="eliminado">Eliminado</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Área</InputLabel>
              <Select
                label="Área"
                value={filters.area || ''}
                onChange={e => handleFilterChange({ ...filters, area: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas las áreas</MenuItem>
                <MenuItem value="Tecnología y Sistemas">Tecnología y Sistemas</MenuItem>
                <MenuItem value="Administración y Gestión">Administración y Gestión</MenuItem>
                <MenuItem value="Comunicación y Marketing">Comunicación y Marketing</MenuItem>
                <MenuItem value="Salud y Ciencias">Salud y Ciencias</MenuItem>
                <MenuItem value="Ingeniería y Construcción">Ingeniería y Construcción</MenuItem>
                <MenuItem value="Educación y Formación">Educación y Formación</MenuItem>
                <MenuItem value="Arte y Diseño">Arte y Diseño</MenuItem>
                <MenuItem value="Investigación y Desarrollo">Investigación y Desarrollo</MenuItem>
                <MenuItem value="Servicios y Atención al Cliente">Servicios y Atención al Cliente</MenuItem>
                <MenuItem value="Sostenibilidad y Medio Ambiente">Sostenibilidad y Medio Ambiente</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Nivel API</InputLabel>
              <Select
                label="Nivel API"
                value={filters.api_level || ''}
                onChange={e => handleFilterChange({ ...filters, api_level: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">API 1</MenuItem>
                <MenuItem value="2">API 2</MenuItem>
                <MenuItem value="3">API 3</MenuItem>
                <MenuItem value="4">API 4</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Nivel TRL</InputLabel>
              <Select
                label="Nivel TRL"
                value={filters.trl_level || ''}
                onChange={e => handleFilterChange({ ...filters, trl_level: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">TRL 1</MenuItem>
                <MenuItem value="2">TRL 2</MenuItem>
                <MenuItem value="3">TRL 3</MenuItem>
                <MenuItem value="4">TRL 4</MenuItem>
                <MenuItem value="5">TRL 5</MenuItem>
                <MenuItem value="6">TRL 6</MenuItem>
                <MenuItem value="7">TRL 7</MenuItem>
                <MenuItem value="8">TRL 8</MenuItem>
                <MenuItem value="9">TRL 9</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataTable
            data={projects}
            columns={columns}
            loading={loading}
            error={null}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={typeof pageSize === 'number' ? pageSize : undefined}
            showPagination={false}
            showPageSizeSelector={false}
            actions={actions}
            emptyMessage="No hay proyectos registrados"
            pageSizeOptions={[50, 100, 200, 500, 1000]}
          />
        </CardContent>
      </Card>

      {/* Modal de acción con diseño mejorado */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: themeMode === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.4)'
              : '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: themeMode === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: actionType === 'suspend' 
            ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
            : actionType === 'delete'
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actionType === 'suspend' && <BlockIcon />}
            {actionType === 'delete' && <DeleteIcon />}
            {actionType === 'view_students' && <PeopleIcon />}
            <Typography variant="h6">
              {actionType === 'suspend' && 'Confirmar Suspensión de Proyecto'}
              {actionType === 'delete' && 'Confirmar Eliminación de Proyecto'}
              {actionType === 'view_students' && 'Participante del Proyecto'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {actionType === 'view_students' ? (
            <Box sx={{ mt: 2 }}>
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
                    {selectedProject?.title || 'Proyecto'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
                  }}>
                    Información del proyecto
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                      }}>
                        Empresa:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        {selectedProject?.company_name || 'Sin empresa'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                      }}>
                        Estado:
                      </Typography>
                      <Chip 
                        label={getStatusText(selectedProject?.status || '')} 
                        color={getStatusColor(selectedProject?.status || '') as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                      }}>
                        Estudiantes:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                      }}>
                        {selectedProject?.students_assigned || 0} / {selectedProject?.students_needed || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

                             {loadingStudents ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                   <CircularProgress />
                 </Box>
               ) : (
                 projectStudents.length > 0 ? (
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: 2
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PeopleIcon color="primary" />
                                                 <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                           Participante del Proyecto
                         </Typography>
                      </Box>
                                             <Typography variant="body2" color="text.secondary" gutterBottom>
                         Participante del proyecto:
                       </Typography>
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {projectStudents.map((student: any, index: number) => {
                          // Manejar diferentes estructuras de datos del estudiante
                          const studentName = student.nombre || student.name || student.full_name || student.student_name || 'Sin nombre';
                          const studentEmail = student.email || student.student_email || 'Sin email';
                          const studentId = student.id || student.student_id || index;
                          
                          return (
                            <Box key={studentId} sx={{ 
                              p: 2, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1, 
                              mb: 1,
                              background: 'rgba(102, 126, 234, 0.05)'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                {studentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {studentEmail}
                              </Typography>
                              {student.api_level && (
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                                  Nivel API: {student.api_level}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                                 ) : (
                   <Box>
                                            <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                         No hay participante asignado a este proyecto.
                       </Alert>
                     <Alert severity="warning" sx={{ borderRadius: 2 }}>
                       <Typography variant="body2" sx={{ fontWeight: 600 }}>
                         Información de depuración:
                       </Typography>
                       <Typography variant="caption" component="div">
                         • Proyecto ID: {selectedProject?.id}
                       </Typography>
                       <Typography variant="caption" component="div">
                         • Estudiantes asignados según proyecto: {selectedProject?.students_assigned || 0}
                       </Typography>
                       <Typography variant="caption" component="div">
                         • Estudiantes encontrados en API: {projectStudents.length}
                       </Typography>
                       <Typography variant="caption" component="div">
                         • Estado del proyecto: {selectedProject?.status}
                       </Typography>
                       <Box sx={{ mt: 2 }}>
                         <Button
                           variant="outlined"
                           size="small"
                           onClick={() => selectedProject && fetchProjectStudents(selectedProject.id)}
                           sx={{ borderRadius: 2 }}
                         >
                           Reintentar carga de estudiantes
                         </Button>
                       </Box>
                     </Alert>
                   </Box>
                 )
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Card sx={{ 
                mb: 3, 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                    Confirmar {actionType === 'suspend' ? 'Suspensión' : 'Eliminación'} de Proyecto
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#2c3e50', lineHeight: 1.6 }}>
                    ¿Estás seguro de que quieres{' '}
                    <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                      {actionType === 'suspend' ? 'suspender' : 'eliminar'}
                    </Box>{' '}
                    el proyecto{' '}
                    <Box component="span" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      {selectedProject?.title}
                    </Box>?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 2, fontStyle: 'italic' }}>
                    Esta acción cambiará el estado del proyecto y afectará su visibilidad en la plataforma.
                  </Typography>

                  {/* Información adicional del proyecto para contexto */}
                  <Card sx={{ 
                    mt: 2, 
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: 2
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 'bold', 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                        mb: 1
                      }}>
                        Información del Proyecto:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#6b7280' 
                          }}>
                            Empresa:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            {selectedProject?.company_name || 'Sin empresa'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#6b7280' 
                          }}>
                            Estado:
                          </Typography>
                          <Chip 
                            label={getStatusText(selectedProject?.status || '')} 
                            color={getStatusColor(selectedProject?.status || '') as any}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#6b7280' 
                          }}>
                            Estudiantes:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            {selectedProject?.students_assigned || 0} / {selectedProject?.students_needed || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#6b7280' 
                          }}>
                            Aplicaciones:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}>
                            {selectedProject?.applications_count || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Alertas específicas según el tipo de acción */}
                  {actionType === 'suspend' && (
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        <strong>⚠️ Advertencia:</strong> Al suspender este proyecto:
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          No será visible para nuevos estudiantes
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          Los estudiantes ya asignados mantendrán su participación
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          No se podrán recibir nuevas aplicaciones
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          Se recomienda revisar el motivo de la suspensión
                        </Typography>
                      </Box>
                    </Alert>
                  )}

                  {actionType === 'delete' && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        <strong>🚫 Acción Crítica:</strong> Al eliminar este proyecto:
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          Se eliminará permanentemente de la plataforma
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          Los estudiantes asignados perderán acceso al proyecto
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          Todas las aplicaciones pendientes se cancelarán
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          La empresa no podrá gestionar este proyecto
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: '#d32f2f' }}>
                          ⚠️ Esta acción es irreversible y requiere justificación
                        </Typography>
                      </Box>
                    </Alert>
                  )}



                  {/* Alerta general de recordatorio */}
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      <strong>📋 Recordatorio:</strong> Todas las acciones administrativas quedan registradas en el sistema y pueden ser revisadas posteriormente por otros administradores.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setActionDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cerrar
          </Button>
          {(actionType === 'suspend' || actionType === 'delete') && (
            <Button
              variant="contained"
              onClick={handleConfirmAction}
              sx={{ 
                borderRadius: 2,
                background: actionType === 'suspend' 
                  ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                  : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                '&:hover': {
                  background: actionType === 'suspend' 
                    ? 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'
                    : 'linear-gradient(135deg, #ee5a24 0%, #c44569 100%)',
                }
              }}
            >
              Confirmar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito con diseño mejorado */}
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

      {/* Modal de detalles del proyecto */}
      {selectedProjectDetail && (
        <ProjectDetailsModal
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          project={selectedProjectDetail}
          loading={loadingProjectDetail}
          showStudents={true}
          userRole="admin"
        />
      )}
    </Box>
  );
};

export default GestionProyectosAdmin; 