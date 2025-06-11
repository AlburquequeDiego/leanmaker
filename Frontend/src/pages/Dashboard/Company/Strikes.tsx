import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Strike {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  projectId: string;
  projectTitle: string;
  type: 'attendance' | 'quality' | 'deadline' | 'behavior' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  date: string;
  status: 'active' | 'resolved' | 'appealed';
  evidence?: string;
  resolution?: string;
  resolvedDate?: string;
}

const mockStrikes: Strike[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Juan Pérez',
    studentEmail: 'juan.perez@email.com',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    type: 'attendance',
    severity: 'medium',
    description: 'Falta injustificada a reunión de seguimiento del proyecto',
    date: '2024-01-15',
    status: 'active',
    evidence: 'Registro de asistencia y comunicación con el estudiante',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'María González',
    studentEmail: 'maria.gonzalez@email.com',
    projectId: '2',
    projectTitle: 'API REST con Django',
    type: 'deadline',
    severity: 'high',
    description: 'Entrega tardía de milestone crítico sin justificación previa',
    date: '2024-01-10',
    status: 'resolved',
    evidence: 'Documentación de fechas de entrega y comunicación',
    resolution: 'El estudiante presentó justificación médica válida',
    resolvedDate: '2024-01-12',
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Carlos Rodríguez',
    studentEmail: 'carlos.rodriguez@email.com',
    projectId: '3',
    projectTitle: 'App Móvil React Native',
    type: 'quality',
    severity: 'low',
    description: 'Código entregado no cumple con estándares de calidad establecidos',
    date: '2024-01-18',
    status: 'active',
    evidence: 'Revisión de código y documentación de estándares',
  },
];

export const CompanyStrikes: React.FC = () => {
  const [strikes, setStrikes] = useState<Strike[]>(mockStrikes);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedStrike, setSelectedStrike] = useState<Strike | null>(null);
  const [newStrike, setNewStrike] = useState<Partial<Strike>>({
    studentName: '',
    projectTitle: '',
    type: 'other',
    severity: 'medium',
    description: '',
    evidence: '',
  });
  const [resolutionText, setResolutionText] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'warning';
      case 'medium':
        return 'info';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'Asistencia';
      case 'quality':
        return 'Calidad';
      case 'deadline':
        return 'Deadline';
      case 'behavior':
        return 'Comportamiento';
      case 'other':
        return 'Otro';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'resolved':
        return 'success';
      case 'appealed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'resolved':
        return 'Resuelto';
      case 'appealed':
        return 'Apelado';
      default:
        return status;
    }
  };

  const handleAddStrike = () => {
    const strike: Strike = {
      ...newStrike as Strike,
      id: Date.now().toString(),
      studentId: 'temp',
      studentEmail: 'temp@email.com',
      projectId: 'temp',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setStrikes(prev => [strike, ...prev]);
    setShowAddDialog(false);
    setNewStrike({
      studentName: '',
      projectTitle: '',
      type: 'other',
      severity: 'medium',
      description: '',
      evidence: '',
    });
  };

  const handleResolveStrike = () => {
    if (selectedStrike) {
      setStrikes(prev =>
        prev.map(strike =>
          strike.id === selectedStrike.id
            ? {
                ...strike,
                status: 'resolved',
                resolution: resolutionText,
                resolvedDate: new Date().toISOString().split('T')[0],
              }
            : strike
        )
      );
      setShowResolveDialog(false);
      setSelectedStrike(null);
      setResolutionText('');
    }
  };

  const handleDeleteStrike = (strikeId: string) => {
    setStrikes(prev => prev.filter(strike => strike.id !== strikeId));
  };

  const stats = {
    total: strikes.length,
    active: strikes.filter(s => s.status === 'active').length,
    resolved: strikes.filter(s => s.status === 'resolved').length,
    appealed: strikes.filter(s => s.status === 'appealed').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Strikes
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Nuevo Strike
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.active}</Typography>
                  <Typography variant="body2">Activos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.resolved}</Typography>
                  <Typography variant="body2">Resueltos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.appealed}</Typography>
                  <Typography variant="body2">Apelados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Lista de Strikes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {strikes.map((strike) => (
          <Box key={strike.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'error.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {strike.studentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strike.studentEmail}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={getStatusLabel(strike.status)}
                      color={getStatusColor(strike.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" gutterBottom>
                  <strong>Proyecto:</strong> {strike.projectTitle}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getTypeLabel(strike.type)}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={strike.severity}
                    color={getSeverityColor(strike.severity) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {strike.description}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha:</strong> {new Date(strike.date).toLocaleDateString()}
                </Typography>

                {strike.evidence && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Evidencia:</strong> {strike.evidence}
                  </Typography>
                )}

                {strike.resolution && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Resolución:</strong> {strike.resolution}
                    </Typography>
                    <Typography variant="caption">
                      Resuelto el {new Date(strike.resolvedDate!).toLocaleDateString()}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                {strike.status === 'active' && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedStrike(strike);
                      setShowResolveDialog(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Resolver
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteStrike(strike.id)}
                >
                  Eliminar
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog para agregar strike */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Strike</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nombre del Estudiante"
                value={newStrike.studentName}
                onChange={(e) => setNewStrike(prev => ({ ...prev, studentName: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Proyecto"
                value={newStrike.projectTitle}
                onChange={(e) => setNewStrike(prev => ({ ...prev, projectTitle: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newStrike.type}
                  label="Tipo"
                  onChange={(e) => setNewStrike(prev => ({ ...prev, type: e.target.value as Strike['type'] }))}
                >
                  <MenuItem value="attendance">Asistencia</MenuItem>
                  <MenuItem value="quality">Calidad</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="behavior">Comportamiento</MenuItem>
                  <MenuItem value="other">Otro</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Severidad</InputLabel>
                <Select
                  value={newStrike.severity}
                  label="Severidad"
                  onChange={(e) => setNewStrike(prev => ({ ...prev, severity: e.target.value as Strike['severity'] }))}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={newStrike.description}
                onChange={(e) => setNewStrike(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Evidencia"
                value={newStrike.evidence}
                onChange={(e) => setNewStrike(prev => ({ ...prev, evidence: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddStrike} variant="contained" color="error">
            Crear Strike
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para resolver strike */}
      <Dialog open={showResolveDialog} onClose={() => setShowResolveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resolver Strike</DialogTitle>
        <DialogContent>
          {selectedStrike && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Estudiante:</strong> {selectedStrike.studentName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Proyecto:</strong> {selectedStrike.projectTitle}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Descripción:</strong> {selectedStrike.description}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Resolución"
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  margin="normal"
                  placeholder="Describe cómo se resolvió el strike..."
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResolveDialog(false)}>Cancelar</Button>
          <Button onClick={handleResolveStrike} variant="contained" color="success">
            Resolver Strike
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyStrikes; 