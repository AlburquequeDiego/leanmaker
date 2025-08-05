import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  History as HistoryIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useNavigate } from 'react-router-dom';

interface ApiLevelRequest {
  id: number;
  student_id: number;
  student_name: string;
  requested_level: number;
  current_level: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export default function APIRequestsAdmin() {
  const [requests, setRequests] = useState<ApiLevelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiLevelRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [pageSize]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(`/api/students/admin/api-level-requests/?limit=${pageSize}`) as any;
      setRequests(data.results || []);
    } catch (err) {
      setError('Error al cargar las peticiones');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const response = await apiService.post(`/api/students/admin/api-level-request/${selectedRequest.id}/action/`, {
        action,
        feedback: feedback,
      });
      
      if (action === 'approve') {
        // Calcular los cambios que se aplicarán
        const apiLevelAnterior = selectedRequest.current_level;
        const apiLevelNuevo = selectedRequest.requested_level;
        const trlAnterior = apiLevelAnterior <= 2 ? apiLevelAnterior * 2 : apiLevelAnterior <= 4 ? 4 : apiLevelAnterior <= 6 ? 6 : 9;
        const trlNuevo = apiLevelNuevo <= 2 ? apiLevelNuevo * 2 : apiLevelNuevo <= 4 ? 4 : apiLevelNuevo <= 6 ? 6 : 9;
        const horasAnterior = apiLevelAnterior === 1 ? 20 : apiLevelAnterior === 2 ? 40 : apiLevelAnterior === 3 ? 80 : 160;
        const horasNuevo = apiLevelNuevo === 1 ? 20 : apiLevelNuevo === 2 ? 40 : apiLevelNuevo === 3 ? 80 : 160;
        
        setSuccessMsg(`✅ Solicitud aprobada: ${selectedRequest.student_name} - API ${apiLevelAnterior} → ${apiLevelNuevo}, TRL ${trlAnterior} → ${trlNuevo}, Horas ${horasAnterior} → ${horasNuevo} hrs`);
      } else {
        setSuccessMsg(`❌ Solicitud rechazada: ${selectedRequest.student_name} - Nivel API ${selectedRequest.requested_level}`);
      }
      
      setSelectedRequest(null);
      setFeedback('');
      fetchRequests();
    } catch (err) {
      setError('Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'warning';
      default: return 'default';
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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3
    }}>
      {/* Header Principal */}
      <Card sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 1.5,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HistoryIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                Gestión de Solicitudes de Nivel API
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Administración y revisión de solicitudes de cambio de nivel API de estudiantes
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Actualizar datos">
              <IconButton 
                onClick={fetchRequests}
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              Volver
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          {successMsg}
        </Alert>
      )}

      {/* Contenido Principal */}
      {loading ? (
        <Card sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 3
        }}>
          <CircularProgress size={60} />
        </Card>
      ) : (
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {/* Header de la tabla */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HistoryIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Registro de Solicitudes
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {requests.length} solicitudes encontradas
                </Typography>
              </Box>
            </Box>
            
            {/* Selector de cantidad a mostrar */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: '#64748b' }}>Mostrar</InputLabel>
              <Select
                value={pageSize}
                label="Mostrar"
                onChange={(e) => setPageSize(e.target.value === 'todos' ? 1000000 : Number(e.target.value))}
                sx={{
                  background: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <MenuItem value={20}>20 registros</MenuItem>
                <MenuItem value={50}>50 registros</MenuItem>
                <MenuItem value={100}>100 registros</MenuItem>
                <MenuItem value={150}>150 registros</MenuItem>
                <MenuItem value={200}>200 registros</MenuItem>
                <MenuItem value={'todos'}>Todos los registros</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Tabla */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Estudiante</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Nivel Actual</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Nivel Solicitado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Fecha de Solicitud</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Feedback</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req, index) => (
                  <TableRow 
                    key={req.id}
                    sx={{ 
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.05)',
                        transform: 'scale(1.001)',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:nth-of-type(even)': {
                        background: 'rgba(248, 250, 252, 0.3)'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {req.student_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`API ${req.current_level}`} 
                        color={getLevelColor(req.current_level) as any} 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`API ${req.requested_level}`} 
                        color={getLevelColor(req.requested_level) as any} 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(req.status)} 
                        color={getStatusColor(req.status) as any} 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {new Date(req.submitted_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {new Date(req.submitted_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: req.feedback ? '#1e293b' : '#64748b' }}>
                        {req.feedback || 'Sin feedback'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {req.status === 'pending' ? (
                        <Tooltip title="Revisar solicitud">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => { setSelectedRequest(req); setFeedback(''); }}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                              }
                            }}
                          >
                            Revisar
                          </Button>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                          {req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialogo para aprobar/rechazar */}
      <Dialog 
        open={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUpIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Revisar Solicitud de Nivel API
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
              <strong>Estudiante:</strong> {selectedRequest?.student_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                label={`Nivel Actual: API ${selectedRequest?.current_level}`} 
                color={getLevelColor(selectedRequest?.current_level || 1) as any}
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                label={`Nivel Solicitado: API ${selectedRequest?.requested_level}`} 
                color={getLevelColor(selectedRequest?.requested_level || 1) as any}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>
          <TextField
            label="Feedback (opcional)"
            fullWidth
            multiline
            minRows={3}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setSelectedRequest(null)} 
            color="inherit"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction('approve')}
            disabled={actionLoading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)'
              }
            }}
          >
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 