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
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, History as HistoryIcon } from '@mui/icons-material';
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Historial de Solicitudes de Nivel API
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Volver a Gestión de Estudiantes
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" color="primary">
                Registro de Solicitudes
              </Typography>
            </Box>
            
            {/* Selector de cantidad a mostrar */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={pageSize}
                label="Mostrar"
                onChange={(e) => setPageSize(e.target.value as number)}
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={150}>150</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Nivel Actual</TableCell>
                  <TableCell>Nivel Solicitado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Solicitud</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.student_name}</TableCell>
                    <TableCell>
                      <Chip label={`Nivel ${req.current_level}`} color={getLevelColor(req.current_level) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`Nivel ${req.requested_level}`} color={getLevelColor(req.requested_level) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusText(req.status)} color={getStatusColor(req.status) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(req.submitted_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(req.submitted_at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{req.feedback || '-'}</TableCell>
                    <TableCell>
                      {req.status === 'pending' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          sx={{ mr: 1 }}
                          onClick={() => { setSelectedRequest(req); setFeedback(''); }}
                        >
                          Revisar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialogo para aprobar/rechazar */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">
              Revisar Solicitud de Nivel API
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <strong>Estudiante:</strong> {selectedRequest?.student_name}
          </Typography>
          <Typography gutterBottom>
            <strong>Nivel Actual:</strong> {selectedRequest?.current_level}
          </Typography>
          <Typography gutterBottom>
            <strong>Nivel Solicitado:</strong> {selectedRequest?.requested_level}
          </Typography>
          <TextField
            label="Feedback (opcional)"
            fullWidth
            multiline
            minRows={2}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)} color="inherit">Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAction('approve')}
            disabled={actionLoading}
          >
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 