import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  Visibility as VisibilityIcon, 
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const mockHorasPendientes = [
  { 
    id: 1, 
    estudiante: 'Juan Pérez', 
    empresa: 'Empresa ACME', 
    proyecto: 'Desarrollo App Web', 
    horas: 120, 
    fechaReporte: '2024-01-15', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Software'
  },
  { 
    id: 2, 
    estudiante: 'María García', 
    empresa: 'Tech Solutions', 
    proyecto: 'Sistema de Inventario', 
    horas: 80, 
    fechaReporte: '2024-01-14', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Sistemas'
  },
  { 
    id: 3, 
    estudiante: 'Carlos López', 
    empresa: 'Digital Corp', 
    proyecto: 'App Móvil', 
    horas: 150, 
    fechaReporte: '2024-01-13', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Software'
  },
];

export default function ValidacionHorasAdmin() {
  const [search, setSearch] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [estado, setEstado] = useState('');
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredHoras = mockHorasPendientes.filter(registro =>
    (registro.estudiante.toLowerCase().includes(search.toLowerCase()) || 
     registro.empresa.toLowerCase().includes(search.toLowerCase()) ||
     registro.proyecto.toLowerCase().includes(search.toLowerCase())) &&
    (empresa ? registro.empresa === empresa : true) &&
    (estado ? registro.estado === estado : true)
  );

  const empresas = [...new Set(mockHorasPendientes.map(r => r.empresa))];

  const handleAction = (record: any, type: 'approve' | 'reject' | 'view') => {
    setSelectedRecord(record);
    setActionType(type);
    setActionDialog(true);
    setComment('');
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve' || actionType === 'reject') {
      setSuccessMessage(
        actionType === 'approve' 
          ? `Horas aprobadas para ${selectedRecord.estudiante}` 
          : `Horas rechazadas para ${selectedRecord.estudiante}`
      );
      setShowSuccess(true);
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
          <Typography><strong>Nombre:</strong> {selectedRecord.estudiante}</Typography>
          <Typography><strong>Carrera:</strong> {selectedRecord.carrera}</Typography>
          <Typography><strong>Empresa:</strong> {selectedRecord.empresa}</Typography>
          <Typography><strong>Proyecto:</strong> {selectedRecord.proyecto}</Typography>
          <Typography><strong>Horas Reportadas:</strong> {selectedRecord.horas}</Typography>
          <Typography><strong>Fecha de Reporte:</strong> {new Date(selectedRecord.fechaReporte).toLocaleDateString()}</Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          {actionType === 'approve' 
            ? `¿Estás seguro de que deseas aprobar ${selectedRecord.horas} horas para ${selectedRecord.estudiante}?`
            : `¿Estás seguro de que deseas rechazar ${selectedRecord.horas} horas para ${selectedRecord.estudiante}?`
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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AccessTimeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Validación de Horas de Práctica Profesional</Typography>
      </Box>
      
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
              value={empresa}
              label="Empresa"
              onChange={e => setEmpresa(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {empresas.map(emp => (
                <MenuItem key={emp} value={emp}>{emp}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              label="Estado"
              onChange={e => setEstado(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aprobado">Aprobado</MenuItem>
              <MenuItem value="Rechazado">Rechazado</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2 }}
          >
            Descargar Reporte
          </Button>
        </Stack>
      </Paper>

      {/* Tabla de registros */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiante</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Carrera</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Empresa</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proyecto</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Horas</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Reporte</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHoras.map(registro => (
              <TableRow key={registro.id} hover>
                <TableCell>{registro.estudiante}</TableCell>
                <TableCell>{registro.carrera}</TableCell>
                <TableCell>{registro.empresa}</TableCell>
                <TableCell>{registro.proyecto}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${registro.horas} hrs`} 
                    color="primary" 
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{new Date(registro.fechaReporte).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={registro.estado} 
                    color={registro.estado === 'Pendiente' ? 'warning' : 
                           registro.estado === 'Aprobado' ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="info" 
                    title="Ver detalles"
                    onClick={() => handleAction(registro, 'view')}
                    sx={{ mr: 1 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="success" 
                    title="Aprobar horas"
                    onClick={() => handleAction(registro, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    title="Rechazar horas"
                    onClick={() => handleAction(registro, 'reject')}
                  >
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'approve' && <CheckCircleIcon color="success" />}
          {actionType === 'reject' && <CancelIcon color="error" />}
          {actionType === 'view' && <VisibilityIcon color="info" />}
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setActionDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          {actionType !== 'view' && (
            <Button 
              onClick={handleConfirmAction}
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              sx={{ borderRadius: 2 }}
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
} 