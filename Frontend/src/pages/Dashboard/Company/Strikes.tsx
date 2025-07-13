import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,

} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import type { Strike } from '../../../types';



// Interfaz extendida para el formulario
interface StrikeFormData {
  student: string;
  project?: string;
  reason: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
}

export const CompanyStrikes: React.FC = () => {
  const api = useApi();
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStrike, setSelectedStrike] = useState<Strike | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5, 5]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [newStrike, setNewStrike] = useState<StrikeFormData>({
    student: '',
    project: '',
    reason: '',
    description: '',
    severity: 'medium',
  });

  useEffect(() => {
    loadStrikes();
  }, []);

  const loadStrikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/strikes/');
      setStrikes(response);
      
    } catch (err: any) {
      console.error('Error cargando strikes:', err);
      setError(err.response?.data?.error || 'Error al cargar strikes');
    } finally {
      setLoading(false);
    }
  };



  const getStatusFilter = (tabIdx: number) => {
    switch (tabIdx) {
      case 0: return undefined; // Todas
      case 1: return true; // Activas
      case 2: return false; // Resueltas
      case 3: return undefined; // Apeladas (no implementado)
      case 4: return undefined; // Expiradas
      default: return undefined;
    }
  };

  const filteredStrikes = strikes.filter(strike => {
    const status = getStatusFilter(selectedTab);
    if (status !== undefined) {
      return strike.is_active === status;
    }
    return true;
  });

  const cantidadActual = cantidadPorTab[selectedTab];
  const strikesMostrados = cantidadActual === 'todas' ? filteredStrikes : filteredStrikes.slice(0, Number(cantidadActual));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      case 'low':
        return 'Bajo';
      default:
        return severity;
    }
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Resuelto';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'error' : 'success';
  };

  const handleCreateStrike = async () => {
    try {
      setUpdatingStatus('creating');
      
      const response = await api.post('/api/strikes/', {
        student: newStrike.student,
        project: newStrike.project || null,
        reason: newStrike.reason,
        description: newStrike.description || '',
        severity: newStrike.severity,
      });

      setStrikes(prev => [response, ...prev]);
      setShowCreateDialog(false);
      setNewStrike({
        student: '',
        project: '',
        reason: '',
        description: '',
        severity: 'medium',
      });
    } catch (error: any) {
      console.error('Error creando strike:', error);
      setError(error.response?.data?.error || 'Error al crear strike');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateStrike = async () => {
    if (!selectedStrike) return;
    
    try {
      setUpdatingStatus(selectedStrike.id);
      
      const response = await api.patch(`/api/strikes/${selectedStrike.id}/`, {
        reason: newStrike.reason,
        description: newStrike.description || '',
        severity: newStrike.severity,
      });

      setStrikes(prev =>
        prev.map(strike =>
          strike.id === selectedStrike.id ? response : strike
        )
      );
      setShowEditDialog(false);
      setSelectedStrike(null);
    } catch (error: any) {
      console.error('Error actualizando strike:', error);
      setError(error.response?.data?.error || 'Error al actualizar strike');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteStrike = async (strikeId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este strike?')) return;
    
    try {
      setUpdatingStatus(strikeId);
      await api.delete(`/api/strikes/${strikeId}/`);
      setStrikes(prev => prev.filter(strike => strike.id !== strikeId));
    } catch (error: any) {
      console.error('Error eliminando strike:', error);
      setError(error.response?.data?.error || 'Error al eliminar strike');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (strike: Strike) => {
    setSelectedStrike(strike);
    setShowDetailDialog(true);
  };

  const handleEditStrike = (strike: Strike) => {
    setSelectedStrike(strike);
    setNewStrike({
      student: strike.student,
      project: strike.project || '',
      reason: strike.reason,
      description: strike.description || '',
      severity: strike.severity,
    });
    setShowEditDialog(true);
  };

  const stats = {
    total: strikes.length,
    active: strikes.filter(strike => strike.is_active).length,
    resolved: strikes.filter(strike => !strike.is_active).length,
    appealed: 0, // No implementado
    expired: 0, // No implementado
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadStrikes} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Amonestaciones (Strikes)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra las amonestaciones de los estudiantes en tus proyectos
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Activas
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Resueltas
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.resolved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Apeladas
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.appealed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Controles */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Crear Amonestación
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          {['Todas', 'Activas', 'Resueltas', 'Apeladas', 'Expiradas'].map((tab, index) => (
            <Grid item key={index}>
              <Button
                variant={selectedTab === index ? 'contained' : 'outlined'}
                onClick={() => setSelectedTab(index)}
                sx={{ minWidth: 100 }}
              >
                {tab}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Lista de Strikes */}
      <Box>
        {strikesMostrados.map((strike) => (
          <Paper key={strike.id} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Estudiante ID: {strike.student}
                  </Typography>
                  <Chip
                    label={getStatusLabel(strike.is_active)}
                    color={getStatusColor(strike.is_active) as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={getSeverityLabel(strike.severity)}
                    color={getSeverityColor(strike.severity) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Motivo:</strong> {strike.reason}
                </Typography>
                
                {strike.project && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Proyecto ID:</strong> {strike.project}
                  </Typography>
                )}
                
                {strike.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Descripción:</strong> {strike.description}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha:</strong> {new Date(strike.issued_at).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleViewDetails(strike)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditStrike(strike)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteStrike(strike.id)}
                  color="error"
                  disabled={updatingStatus === strike.id}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
        
        {strikesMostrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No hay amonestaciones en esta categoría
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog de Detalles */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de la Amonestación</DialogTitle>
        <DialogContent>
          {selectedStrike && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Estudiante ID: {selectedStrike.student}
              </Typography>
              
              {selectedStrike.project && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Proyecto ID:</strong> {selectedStrike.project}
                </Typography>
              )}
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Motivo:</strong> {selectedStrike.reason}
              </Typography>
              
              {selectedStrike.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Descripción:</strong> {selectedStrike.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={getStatusLabel(selectedStrike.is_active)}
                  color={getStatusColor(selectedStrike.is_active) as any}
                />
                <Chip
                  label={getSeverityLabel(selectedStrike.severity)}
                  color={getSeverityColor(selectedStrike.severity) as any}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha de emisión:</strong> {new Date(selectedStrike.issued_at).toLocaleString()}
              </Typography>
              
              {selectedStrike.expires_at && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha de expiración:</strong> {new Date(selectedStrike.expires_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Crear */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nueva Amonestación</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="ID del Estudiante"
              value={newStrike.student}
              onChange={(e) => setNewStrike(prev => ({ ...prev, student: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="ID del Proyecto (opcional)"
              value={newStrike.project}
              onChange={(e) => setNewStrike(prev => ({ ...prev, project: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Motivo"
              value={newStrike.reason}
              onChange={(e) => setNewStrike(prev => ({ ...prev, reason: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={newStrike.description}
              onChange={(e) => setNewStrike(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Severidad</InputLabel>
              <Select
                value={newStrike.severity}
                label="Severidad"
                onChange={(e) => setNewStrike(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' }))}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateStrike}
            variant="contained"
            disabled={updatingStatus === 'creating' || !newStrike.student || !newStrike.reason}
          >
            {updatingStatus === 'creating' ? <CircularProgress size={20} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Editar */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Amonestación</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Motivo"
              value={newStrike.reason}
              onChange={(e) => setNewStrike(prev => ({ ...prev, reason: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={newStrike.description}
              onChange={(e) => setNewStrike(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Severidad</InputLabel>
              <Select
                value={newStrike.severity}
                label="Severidad"
                onChange={(e) => setNewStrike(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' }))}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateStrike}
            variant="contained"
            disabled={updatingStatus === selectedStrike?.id || !newStrike.reason}
          >
            {updatingStatus === selectedStrike?.id ? <CircularProgress size={20} /> : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyStrikes; 