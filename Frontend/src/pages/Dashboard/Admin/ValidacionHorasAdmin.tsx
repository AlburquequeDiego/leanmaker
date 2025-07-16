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

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'ultimos'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadWorkHours();
  }, [pageSize, currentPage, filters]);

  const loadWorkHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      if (filters.status) params.append('status', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await apiService.get(`/api/admin/work-hours/?${params.toString()}`);
      
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
      await apiService.post(`/api/admin/work-hours/${selectedHour.id}/approve/`, {
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

  const columns = [
    {
      key: 'student_name',
      label: 'Estudiante',
      render: (value: string, row: WorkHour) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.student_email}
            </Typography>
          </Box>
        </Box>
      ),
      width: '250px'
    },
    {
      key: 'project_title',
      label: 'Proyecto',
      render: (value: string) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
      width: '200px'
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (value: string) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'hours_worked',
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
      key: 'description',
      label: 'Descripción',
      render: (value: string) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          size="small"
          variant="filled"
        />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'created_at',
      label: 'Registrado',
      render: (value: string) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'student_api_level',
      label: 'Nivel API Est.',
      render: (value: number) => (
        <Chip label={`API ${value || '-'}`} color="info" size="small" />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'project_api_level',
      label: 'Nivel API Proy.',
      render: (value: number) => (
        <Chip label={`API ${value || '-'}`} color="secondary" size="small" />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'project_hours',
      label: 'Horas Proyecto',
      render: (value: number) => (
        <Typography variant="body2">{value || '-'}</Typography>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'max_api_hours',
      label: 'Máx. API',
      render: (value: number) => (
        <Typography variant="body2">{value || '-'}</Typography>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'horas_validadas',
      label: 'Validadas',
      render: (value: number) => (
        <Typography variant="body2">{value || 0}</Typography>
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'empresa_gpa',
      label: 'GPA Empresa',
      render: (value: number) => (
        <Chip label={typeof value === 'number' ? `${value.toFixed(2)} ★` : '-'} color="primary" size="small" />
      ),
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'estudiante_gpa',
      label: 'GPA Estudiante',
      render: (value: number) => (
        <Chip label={typeof value === 'number' ? `${value.toFixed(2)} ★` : '-'} color="success" size="small" />
      ),
      width: '100px',
      align: 'center' as const
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

  const actions = (row: WorkHour) => (
    row.status === 'pending' ? (
      <Button
        variant="contained"
        size="small"
        onClick={() => handleOpenModal(row)}
        startIcon={<WorkIcon />}
      >
        Validar
      </Button>
    ) : (
      <Typography variant="caption" color="text.secondary">
        Ya validada
      </Typography>
    )
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        VALIDACION DE HORAS
      </Typography>

      <DataTable
        title="Horas Pendientes de Validación"
        data={workHours}
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
        showPagination={pageSize !== 'ultimos'}
        actions={actions}
        emptyMessage="No hay horas trabajadas pendientes de validación"
      />

      {/* Modal de validación */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon />
            <Typography variant="h6">
              Validar Hora Trabajada
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedHour && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles de la Hora Trabajada
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Estudiante:</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedHour.student_name}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Proyecto:</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedHour.project_title}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                    <Typography variant="body1">{new Date(selectedHour.date).toLocaleDateString()}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Horas:</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedHour.hours_worked} hrs</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                    <Typography variant="body1" sx={{ maxWidth: 300, textAlign: 'right' }}>
                      {selectedHour.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <TextField
                label="Comentario del administrador (opcional)"
                value={adminComment}
                onChange={e => setAdminComment(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                placeholder="Agregue un comentario sobre la validación..."
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleValidate}
            disabled={actionLoading}
            startIcon={<CheckCircleIcon />}
          >
            {actionLoading ? 'Procesando...' : 'Aprobar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje de éxito */}
      {successMsg && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMsg}
        </Alert>
      )}
    </Box>
  );
} 