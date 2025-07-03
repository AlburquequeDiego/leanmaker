import React, { useState, useEffect } from 'react';
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

} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Strike {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  project_id: string;
  project_title: string;
  type: 'attendance' | 'quality' | 'deadline' | 'behavior' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  date: string;
  status: 'active' | 'resolved' | 'appealed';
  evidence?: string;
  resolution?: string;
  resolved_date?: string;
}

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
  const [strikes, setStrikes] = useState<Strike[]>([]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedStrike, setSelectedStrike] = useState<Strike | null>(null);
  const [newStrike, setNewStrike] = useState<Partial<Strike>>({
    student_name: '',
    project_title: '',
    type: 'other',
    severity: 'medium',
    description: '',
    evidence: '',
  });
  const [resolutionText, setResolutionText] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  // Filtros de cantidad por tab
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5]);

  useEffect(() => {
    async function fetchStrikes() {
      try {
        const data = await apiService.get('/api/strikes/');
        setStrikes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching strikes:', error);
        setStrikes([]);
      }
    }
    fetchStrikes();
  }, []);

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

  const handleAddStrike = async () => {
    try {
      const strikeData = {
        student_name: newStrike.student_name,
        project_title: newStrike.project_title,
        type: newStrike.type,
        severity: newStrike.severity,
        description: newStrike.description,
        evidence: newStrike.evidence,
        date: new Date().toISOString().split('T')[0],
        status: 'active',
      };

      const createdStrike = await apiService.post('/api/strikes/', strikeData);
      setStrikes(prev => [createdStrike as Strike, ...prev]);
      setShowAddDialog(false);
      setNewStrike({
        student_name: '',
        project_title: '',
        type: 'other',
        severity: 'medium',
        description: '',
        evidence: '',
      });
    } catch (error) {
      console.error('Error creating strike:', error);
    }
  };

  const handleResolveStrike = async () => {
    if (selectedStrike) {
      try {
        const updatedStrike = await apiService.patch(`/api/strikes/${selectedStrike.id}/`, {
          status: 'resolved',
          resolution: resolutionText,
          resolved_date: new Date().toISOString().split('T')[0],
        });

        setStrikes(prev =>
          prev.map(strike =>
            strike.id === selectedStrike.id ? (updatedStrike as Strike) : strike
          )
        );
        setShowResolveDialog(false);
        setSelectedStrike(null);
        setResolutionText('');
      } catch (error) {
        console.error('Error resolving strike:', error);
      }
    }
  };

  const handleDeleteStrike = async (strikeId: string) => {
    try {
      await apiService.delete(`/api/strikes/${strikeId}/`);
      setStrikes(prev => prev.filter(strike => strike.id !== strikeId));
    } catch (error) {
      console.error('Error deleting strike:', error);
    }
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
          {tabLabels.map((label) => (
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
                      {strike.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strike.student_email}
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
                  <strong>Proyecto:</strong> {strike.project_title}
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
                      Resuelto el {new Date(strike.resolved_date!).toLocaleDateString()}
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
                value={newStrike.student_name}
                onChange={(e) => setNewStrike(prev => ({ ...prev, student_name: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Proyecto"
                value={newStrike.project_title}
                onChange={(e) => setNewStrike(prev => ({ ...prev, project_title: e.target.value }))}
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
                <strong>Estudiante:</strong> {selectedStrike.student_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Proyecto:</strong> {selectedStrike.project_title}
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