import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Rating, CircularProgress, Alert
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon, 
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface WorkHoursRecord {
  id: string;
  student_name: string;
  student_id: string;
  company_name: string;
  company_id: string;
  project_title: string;
  project_id: string;
  hours: number;
  report_date: string;
  status: 'pending' | 'approved' | 'rejected';
  career: string;
  company_score: number;
  student_score: number;
  company_comments: string[];
  student_comments: string[];
  admin_comments?: string;
}

export default function ValidacionHorasAdmin() {
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('');
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkHoursRecord | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [hoursLimit, setHoursLimit] = useState<number | 'all'>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workHoursRecords, setWorkHoursRecords] = useState<WorkHoursRecord[]>([]);

  useEffect(() => {
    fetchWorkHoursRecords();
  }, []);

  const fetchWorkHoursRecords = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/work-hours/');
      const formattedRecords = Array.isArray(data) ? data.map((record: any) => ({
        id: record.id,
        student_name: record.student_name || 'Estudiante',
        student_id: record.student_id,
        company_name: record.company_name || 'Empresa',
        company_id: record.company_id,
        project_title: record.project_title || 'Proyecto',
        project_id: record.project_id,
        hours: record.hours || 0,
        report_date: record.report_date || record.created_at,
        status: record.status || 'pending',
        career: record.career || 'Ingeniería',
        company_score: record.company_score || 0,
        student_score: record.student_score || 0,
        company_comments: record.company_comments || [],
        student_comments: record.student_comments || [],
        admin_comments: record.admin_comments,
      })) : [];
      
      setWorkHoursRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching work hours records:', error);
      setError('Error al cargar los registros de horas de práctica');
    } finally {
      setLoading(false);
    }
  };

  const filteredHours = workHoursRecords.filter(registro =>
    (registro.student_name.toLowerCase().includes(search.toLowerCase()) || 
     registro.company_name.toLowerCase().includes(search.toLowerCase()) ||
     registro.project_title.toLowerCase().includes(search.toLowerCase())) &&
    (company ? registro.company_name === company : true) &&
    (status ? registro.status === status : true)
  );

  const companies = [...new Set(workHoursRecords.map(r => r.company_name))];

  const handleAction = (record: WorkHoursRecord, type: 'approve' | 'reject' | 'view') => {
    setSelectedRecord(record);
    setActionType(type);
    setActionDialog(true);
    setComment('');
  };

  const handleConfirmAction = async () => {
    if (!selectedRecord || !actionType) return;

    try {
      const updateData = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        admin_comments: comment,
        reviewed_at: new Date().toISOString(),
      };

      await apiService.patch(`/api/work-hours/${selectedRecord.id}/`, updateData);
      
      setSuccessMessage(
        actionType === 'approve' 
          ? `Horas aprobadas para ${selectedRecord.student_name}` 
          : `Horas rechazadas para ${selectedRecord.student_name}`
      );
      setShowSuccess(true);
      
      // Actualizar la lista
      await fetchWorkHoursRecords();
    } catch (error) {
      console.error('Error updating work hours record:', error);
      setError('Error al procesar la acción. Inténtalo de nuevo.');
    }
    
    setActionDialog(false);
    setComment('');
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'approve': return 'Aprobar Horas de Práctica';
      case 'reject': return 'Rechazar Horas de Práctica';
      case 'view': return 'Detalles del Registro';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedRecord) return null;

    if (actionType === 'view') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Información del Estudiante</Typography>
          <Typography><strong>Nombre:</strong> {selectedRecord.student_name}</Typography>
          <Typography><strong>Carrera:</strong> {selectedRecord.career}</Typography>
          <Typography><strong>Empresa:</strong> {selectedRecord.company_name}</Typography>
          <Typography><strong>Proyecto:</strong> {selectedRecord.project_title}</Typography>
          <Typography><strong>Horas Reportadas:</strong> {selectedRecord.hours}</Typography>
          <Typography><strong>Fecha de Reporte:</strong> {new Date(selectedRecord.report_date).toLocaleDateString()}</Typography>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Puntaje de la Relación</Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Empresa (según estudiante):</Typography>
                <Rating value={selectedRecord.company_score} precision={0.5} readOnly size="medium" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Estudiante (según empresa):</Typography>
                <Rating value={selectedRecord.student_score} precision={0.5} readOnly size="medium" />
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          {actionType === 'approve' 
            ? `¿Estás seguro de que deseas aprobar ${selectedRecord.hours} horas para ${selectedRecord.student_name}?`
            : `¿Estás seguro de que deseas rechazar ${selectedRecord.hours} horas para ${selectedRecord.student_name}?`
          }
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    );
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
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleOpenScoreDialog = (type: 'company' | 'student', record: WorkHoursRecord) => {
    // Esta función se puede implementar para mostrar detalles de puntuación
    console.log(`${type} score for ${record.student_name}:`, type === 'company' ? record.company_score : record.student_score);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AccessTimeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Validación de Horas de Práctica Profesional</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filtros y búsqueda */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Buscar por estudiante, empresa o proyecto"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 300, borderRadius: 2 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={company}
              label="Empresa"
              onChange={e => setCompany(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {companies.map(emp => (
                <MenuItem key={emp} value={emp}>{emp}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={status}
              label="Estado"
              onChange={e => setStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="approved">Aprobado</MenuItem>
              <MenuItem value="rejected">Rechazado</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select
              value={hoursLimit}
              label="Mostrar"
              onChange={e => setHoursLimit(e.target.value as number | 'all')}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={50}>Últimos 50</MenuItem>
              <MenuItem value="all">Todos</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Tabla de registros */}
      <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estudiante</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empresa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proyecto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Horas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Puntuación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(hoursLimit === 'all' ? filteredHours : filteredHours.slice(0, hoursLimit)).map((registro) => (
                <TableRow key={registro.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {registro.student_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registro.career}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{registro.company_name}</TableCell>
                  <TableCell>{registro.project_title}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {registro.hours}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(registro.report_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(registro.status)} 
                      color={getStatusColor(registro.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Rating 
                        value={registro.company_score} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                        onClick={() => handleOpenScoreDialog('company', registro)}
                        sx={{ cursor: 'pointer' }}
                      />
                      <Rating 
                        value={registro.student_score} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                        onClick={() => handleOpenScoreDialog('student', registro)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(registro, 'view')}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {registro.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAction(registro, 'approve')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAction(registro, 'reject')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de acción */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancelar</Button>
          {(actionType === 'approve' || actionType === 'reject') && (
            <Button 
              variant="contained" 
              color={actionType === 'approve' ? 'success' : 'error'}
              onClick={handleConfirmAction}
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 