import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface Evaluation {
  id: string;
  fromUser: string;
  fromUserType: 'student' | 'company';
  toUser: string;
  toUserType: 'student' | 'company';
  projectTitle: string;
  rating: number;
  comment: string;
  date: string;
  category: 'technical' | 'soft_skills' | 'punctuality' | 'teamwork' | 'communication' | 'overall';
  status: 'active' | 'flagged' | 'deleted';
}

interface UserSummary {
  id: string;
  name: string;
  type: 'student' | 'company';
  totalEvaluations: number;
  averageRating: number;
  evaluationsReceived: number;
  evaluationsGiven: number;
  lastActivity: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GestionEvaluacionesAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'delete' | 'view' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const evaluations: Evaluation[] = [
    {
      id: '1',
      fromUser: 'María González',
      fromUserType: 'student',
      toUser: 'TechCorp Solutions',
      toUserType: 'company',
      projectTitle: 'Sistema de Gestión de Inventarios',
      rating: 4.5,
      comment: 'Excelente experiencia, aprendí mucho sobre desarrollo backend y el equipo fue muy colaborativo.',
      date: '2023-12-20',
      category: 'overall',
      status: 'active',
    },
    {
      id: '2',
      fromUser: 'TechCorp Solutions',
      fromUserType: 'company',
      toUser: 'María González',
      toUserType: 'student',
      projectTitle: 'Sistema de Gestión de Inventarios',
      rating: 4.8,
      comment: 'María demostró excelentes habilidades técnicas y fue muy puntual en todas las entregas.',
      date: '2023-12-20',
      category: 'technical',
      status: 'active',
    },
    {
      id: '3',
      fromUser: 'Carlos Ruiz',
      fromUserType: 'student',
      toUser: 'Digital Dynamics',
      toUserType: 'company',
      projectTitle: 'Aplicación Móvil de Delivery',
      rating: 3.5,
      comment: 'El proyecto fue interesante pero la comunicación con el equipo podría mejorar.',
      date: '2024-01-15',
      category: 'communication',
      status: 'flagged',
    },
    {
      id: '4',
      fromUser: 'Digital Dynamics',
      fromUserType: 'company',
      toUser: 'Carlos Ruiz',
      toUserType: 'student',
      projectTitle: 'Aplicación Móvil de Delivery',
      rating: 4.0,
      comment: 'Carlos tiene buenas habilidades técnicas pero necesita mejorar la puntualidad.',
      date: '2024-01-15',
      category: 'punctuality',
      status: 'active',
    },
  ];

  const userSummaries: UserSummary[] = [
    {
      id: '1',
      name: 'María González',
      type: 'student',
      totalEvaluations: 8,
      averageRating: 4.6,
      evaluationsReceived: 5,
      evaluationsGiven: 3,
      lastActivity: '2024-01-20',
    },
    {
      id: '2',
      name: 'TechCorp Solutions',
      type: 'company',
      totalEvaluations: 12,
      averageRating: 4.3,
      evaluationsReceived: 8,
      evaluationsGiven: 4,
      lastActivity: '2024-01-22',
    },
    {
      id: '3',
      name: 'Carlos Ruiz',
      type: 'student',
      totalEvaluations: 6,
      averageRating: 3.8,
      evaluationsReceived: 3,
      evaluationsGiven: 3,
      lastActivity: '2024-01-18',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (evaluation: Evaluation, type: 'edit' | 'delete' | 'view') => {
    setSelectedEvaluation(evaluation);
    setActionType(type);
    setActionDialog(true);
  };

  const handleActionConfirm = () => {
    console.log(`Aplicando acción ${actionType} a evaluación ${selectedEvaluation?.id}`, actionReason);
    setActionDialog(false);
    setActionReason('');
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Técnico';
      case 'soft_skills':
        return 'Habilidades Blandas';
      case 'punctuality':
        return 'Puntualidad';
      case 'teamwork':
        return 'Trabajo en Equipo';
      case 'communication':
        return 'Comunicación';
      case 'overall':
        return 'General';
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'flagged':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'flagged':
        return 'Marcada';
      case 'deleted':
        return 'Eliminada';
      default:
        return status;
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filterType !== 'all' && evaluation.fromUserType !== filterType && evaluation.toUserType !== filterType) {
      return false;
    }
    if (filterCategory !== 'all' && evaluation.category !== filterCategory) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Evaluaciones
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="evaluation management tabs">
          <Tab label="Evaluaciones" />
          <Tab label="Resumen por Usuario" />
          <Tab label="Estadísticas" />
        </Tabs>

        {/* Tab: Evaluaciones */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por Tipo</InputLabel>
              <Select
                value={filterType}
                label="Filtrar por Tipo"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="student">Estudiantes</MenuItem>
                <MenuItem value="company">Empresas</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por Categoría</InputLabel>
              <Select
                value={filterCategory}
                label="Filtrar por Categoría"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="technical">Técnico</MenuItem>
                <MenuItem value="soft_skills">Habilidades Blandas</MenuItem>
                <MenuItem value="punctuality">Puntualidad</MenuItem>
                <MenuItem value="teamwork">Trabajo en Equipo</MenuItem>
                <MenuItem value="communication">Comunicación</MenuItem>
                <MenuItem value="overall">General</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>De</TableCell>
                  <TableCell>Para</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                          {evaluation.fromUserType === 'student' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {evaluation.fromUser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.fromUserType === 'student' ? 'Estudiante' : 'Empresa'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'secondary.main', width: 24, height: 24 }}>
                          {evaluation.toUserType === 'student' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {evaluation.toUser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.toUserType === 'student' ? 'Estudiante' : 'Empresa'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{evaluation.projectTitle}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryText(evaluation.category)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={evaluation.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({evaluation.rating})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(evaluation.status)}
                        color={getStatusColor(evaluation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{evaluation.date}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(evaluation, 'view')}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAction(evaluation, 'edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleAction(evaluation, 'delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Resumen por Usuario */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {userSummaries.map((user) => (
              <Card key={user.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: user.type === 'student' ? 'primary.main' : 'secondary.main' }}>
                      {user.type === 'student' ? <PersonIcon /> : <BusinessIcon />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.type === 'student' ? 'Estudiante' : 'Empresa'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={user.averageRating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({user.averageRating})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Evaluaciones recibidas:</Typography>
                    <Typography variant="body2" fontWeight="bold">{user.evaluationsReceived}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Evaluaciones dadas:</Typography>
                    <Typography variant="body2" fontWeight="bold">{user.evaluationsGiven}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Total:</Typography>
                    <Typography variant="body2" fontWeight="bold">{user.totalEvaluations}</Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Última actividad: {user.lastActivity}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button size="small" variant="outlined" color="primary" fullWidth>
                      Ver Detalles
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Tab: Estadísticas */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Evaluaciones
                </Typography>
                <Typography variant="h3" color="primary">
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Evaluaciones en el sistema
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Promedio General
                </Typography>
                <Typography variant="h3" color="success.main">
                  4.2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calificación promedio
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Evaluaciones Marcadas
                </Typography>
                <Typography variant="h3" color="warning.main">
                  8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requieren revisión
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tasa de Participación
                </Typography>
                <Typography variant="h3" color="info.main">
                  87%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios que evalúan
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog para acciones */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'edit' && 'Editar Evaluación'}
          {actionType === 'delete' && 'Eliminar Evaluación'}
          {actionType === 'view' && 'Ver Evaluación'}
        </DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>De:</strong> {selectedEvaluation.fromUser} ({selectedEvaluation.fromUserType === 'student' ? 'Estudiante' : 'Empresa'})
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Para:</strong> {selectedEvaluation.toUser} ({selectedEvaluation.toUserType === 'student' ? 'Estudiante' : 'Empresa'})
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Proyecto:</strong> {selectedEvaluation.projectTitle}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Categoría:</strong> {getCategoryText(selectedEvaluation.category)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Calificación:</strong> {selectedEvaluation.rating}/5
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Comentario:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{selectedEvaluation.comment}"
              </Typography>
              {actionType !== 'view' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Motivo"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancelar</Button>
          {actionType !== 'view' && (
            <Button onClick={handleActionConfirm} variant="contained" color="primary">
              Confirmar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 