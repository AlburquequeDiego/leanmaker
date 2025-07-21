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
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';
import { useNavigate } from 'react-router-dom';

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
                color="primary"
                onClick={() => {
                  setSelectedStudent(row);
                  setShowEditDialog(true); // Asume que existe un modal de edición
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
                onClick={() => handleStudentAction(row, 'activate')}
                disabled={row.status === 'active' || row.status === 'approved'}
              >
                <CheckCircleIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Suspender">
            <span>
              <IconButton
                color="warning"
                onClick={() => handleStudentAction(row, 'suspend')}
                disabled={row.status === 'suspended'}
              >
                <WarningIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bloquear">
            <span>
              <IconButton
                color="error"
                onClick={() => handleStudentAction(row, 'block')}
                disabled={row.status === 'rejected' || row.status === 'blocked'}
              >
                <BlockIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Desbloquear">
            <span>
              <IconButton
                color="success"
                onClick={async () => {
                  await apiService.post(`/api/users/${row.id}/unblock/`);
                  setSuccessMsg('Estudiante desbloqueado exitosamente');
                  loadStudents();
                }}
                disabled={row.status !== 'blocked' && row.status !== 'rejected'}
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Gestión de Estudiantes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/dashboard/admin/api-requests')}
        >
          Historial de Solicitudes API
        </Button>
      </Box>

      <DataTable
        title="Lista de Estudiantes"
        data={students}
        columns={columns}
        loading={loading}
        error={error}
        filters={tableFilters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[20, 50, 100, 150, 200, 'todos']}
        showPagination={false}
        emptyMessage="No hay estudiantes registrados"
      />

      {/* Modal para ver cuestionario y subir de nivel */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">
              {selectedStudent?.name} - Historial de Nivel API
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              {/* Información del estudiante */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información del Estudiante
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body1">{selectedStudent.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Nivel API Actual:</Typography>
                    <Chip label={`API ${selectedStudent.api_level}`} color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Horas Acumuladas:</Typography>
                    <Typography variant="body1">{selectedStudent.total_hours} hrs</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Información adicional */}
              <Alert severity="info" sx={{ mb: 3 }}>
                Para revisar y aprobar solicitudes de cambio de nivel API, ve a la sección "Historial de Solicitudes API" en el menú principal.
              </Alert>

              {/* Historial de solicitudes de cambio de nivel API */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon />
                  <Typography variant="h6">Solicitudes de Cambio de Nivel API</Typography>
                </Box>
                
                {apiHistory.length > 0 ? (
                  <List>
                    {apiHistory.map((history, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                API {history.old_level} → API {history.new_level}
                              </Typography>
                              <Chip 
                                label={history.status === 'approved' ? 'Aprobado' : 
                                       history.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                color={history.status === 'approved' ? 'success' : 
                                       history.status === 'rejected' ? 'error' : 'warning'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={`${new Date(history.date).toLocaleDateString()} - ${history.admin_name}${history.comment ? ` - ${history.comment}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    Sin solicitudes de cambio de nivel API registradas.
                  </Typography>
                )}
              </Paper>


            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje de éxito */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
} 