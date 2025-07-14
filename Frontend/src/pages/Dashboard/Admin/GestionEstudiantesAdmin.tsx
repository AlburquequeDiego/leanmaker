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
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { DataTable } from '../../../components/common/DataTable';

interface Student {
  id: string;
  name: string;
  email: string;
  api_level: number;
  trl_level: number;
  total_hours: number;
  company_name?: string;
  status: 'active' | 'inactive' | 'suspended';
  strikes: number;
  created_at: string;
  last_activity: string;
}

interface ApiHistory {
  id: string;
  old_level: number;
  new_level: number;
  admin_name: string;
  comment?: string;
  date: string;
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

  // Estados para paginación y filtros
  const [pageSize, setPageSize] = useState<number | 'ultimos'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadStudents();
  }, [pageSize, currentPage, filters]);

  const loadStudents = async () => {
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
      if (filters.company) params.append('company', filters.company);
      if (filters.api_level) params.append('api_level', filters.api_level);
      if (filters.status) params.append('status', filters.status);

      const response = await apiService.get(`/api/admin/students/?${params.toString()}`);
      
      setStudents(response.results || []);
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
      const [qRes, hRes] = await Promise.all([
        apiService.get(`/api/admin/students/${student.id}/api-questionnaire/`),
        apiService.get(`/api/admin/students/${student.id}/api-history/`)
      ]);
      
      setApiQuestionnaire(qRes);
      setApiHistory(hRes || []);
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
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Estudiante',
      render: (value: string, row: Student) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
      width: '250px'
    },
    {
      key: 'company_name',
      label: 'Empresa',
      render: (value: string) => value || 'Sin empresa',
      width: '150px'
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
        />
      ),
      width: '100px',
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
    }
  ];

  const tableFilters = [
    {
      key: 'search',
      label: 'Buscar por nombre o email',
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
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'suspended', label: 'Suspendido' }
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

  const actions = (row: Student) => (
    <Button
      variant="contained"
      size="small"
      onClick={() => handleOpenModal(row)}
      startIcon={<SchoolIcon />}
    >
      Ver Cuestionario
    </Button>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Gestión de Estudiantes
      </Typography>

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
        showPagination={pageSize !== 'ultimos'}
        actions={actions}
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
              {selectedStudent?.name} - Cuestionario API
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

              {/* Cuestionario API */}
              {apiQuestionnaire ? (
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SchoolIcon />
                    <Typography variant="h6">Cuestionario API</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Puntaje: {apiQuestionnaire.total_score}/{apiQuestionnaire.max_score} 
                      ({((apiQuestionnaire.total_score / apiQuestionnaire.max_score) * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completado: {new Date(apiQuestionnaire.completed_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List>
                    {apiQuestionnaire.answers.map((answer, index) => (
                      <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={`Pregunta ${index + 1}: ${answer.question}`}
                          secondary={`Respuesta: ${answer.answer}`}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`${answer.score} pts`}
                            color={answer.score > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No hay cuestionario API disponible para este estudiante.
                </Alert>
              )}

              {/* Historial de cambios */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon />
                  <Typography variant="h6">Historial de Cambios de API</Typography>
                </Box>
                
                {apiHistory.length > 0 ? (
                  <List>
                    {apiHistory.map((history, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`API ${history.old_level} → API ${history.new_level}`}
                          secondary={`${new Date(history.date).toLocaleDateString()} - ${history.admin_name}${history.comment ? ` - ${history.comment}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    Sin cambios registrados.
                  </Typography>
                )}
              </Paper>

              {/* Comentario para subir de nivel */}
              <TextField
                label="Comentario del administrador (opcional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />

              {/* Indicador de elegibilidad */}
              {apiQuestionnaire && (
                <Alert 
                  severity={canUpgrade() ? 'success' : 'warning'}
                  icon={canUpgrade() ? <CheckCircleIcon /> : <WarningIcon />}
                  sx={{ mb: 2 }}
                >
                  {canUpgrade() 
                    ? 'El estudiante cumple los requisitos para subir de nivel API.'
                    : 'El estudiante no cumple los requisitos para subir de nivel (mínimo 80% en el cuestionario).'
                  }
                </Alert>
              )}
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
            onClick={handleUpgrade}
            disabled={!canUpgrade() || actionLoading}
            startIcon={<TrendingUpIcon />}
          >
            {actionLoading ? 'Procesando...' : 'Subir de Nivel'}
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