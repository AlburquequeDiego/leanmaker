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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
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

// Mock de datos para el resumen de 4 indicadores
const resumen = [
  { label: 'Total', value: 3, icon: <WarningIcon color="primary" />, color: '#42A5F5' },
  { label: 'Activos', value: 2, icon: <WarningIcon color="error" />, color: '#EF5350' },
  { label: 'Resueltos', value: 1, icon: <CheckCircleIcon color="success" />, color: '#66BB6A' },
  { label: 'Apelados', value: 0, icon: <WarningIcon color="warning" />, color: '#FFA726' },
];

const cantidadOpciones = [5, 10, 20, 50, 'todas'];
const tabLabels = ['Todos', 'Activos', 'Resueltos', 'Apelados'];

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
  const [selectedTab, setSelectedTab] = useState(0);
  // Filtros de cantidad por tab
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5]);

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

  const handleCantidadChange = (tabIdx: number, value: number | string) => {
    setCantidadPorTab(prev => prev.map((v, i) => (i === tabIdx ? value : v)));
  };

  const filteredStrikes = strikes.filter(strike => {
    switch (selectedTab) {
      case 0: return true; // Todos
      case 1: return strike.status === 'active';
      case 2: return strike.status === 'resolved';
      case 3: return strike.status === 'appealed';
      default: return true;
    }
  });
  const cantidadActual = cantidadPorTab[selectedTab];
  const strikesMostrados = cantidadActual === 'todas' ? filteredStrikes : filteredStrikes.slice(0, Number(cantidadActual));

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

      {/* Resumen superior: 4 cards en una sola fila */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {resumen.map((item, idx) => (
          <Box key={idx} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ bgcolor: item.color, color: '#fff', borderRadius: 3, boxShadow: 1, minHeight: 100 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{item.label}</Typography>
                <Box>{item.icon}</Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Tabs de subsecciones */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          {tabLabels.map((label, idx) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Filtro de cantidad por tab */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="cantidad-label">Mostrar</InputLabel>
          <Select
            labelId="cantidad-label"
            value={cantidadActual}
            label="Mostrar"
            onChange={e => handleCantidadChange(selectedTab, e.target.value)}
          >
            {cantidadOpciones.map(opt => (
              <MenuItem key={opt} value={opt}>{opt === 'todas' ? 'Todas' : opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista de Strikes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {strikesMostrados.map((strike) => (
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