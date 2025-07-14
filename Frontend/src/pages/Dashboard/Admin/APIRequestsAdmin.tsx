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
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/students/admin/api-level-requests/');
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
      await apiService.post(`/api/students/admin/api-level-request/${selectedRequest.id}/action/`, {
        action,
        feedback: feedback,
      });
      setSuccessMsg(`Petición ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente`);
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
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Peticiones de Subida de Nivel API
        </Typography>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Nivel Actual</TableCell>
                  <TableCell>Nivel Solicitado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
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
                    <TableCell>{new Date(req.submitted_at).toLocaleDateString()}</TableCell>
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
        <DialogTitle>Revisar Petición de Subida de Nivel API</DialogTitle>
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