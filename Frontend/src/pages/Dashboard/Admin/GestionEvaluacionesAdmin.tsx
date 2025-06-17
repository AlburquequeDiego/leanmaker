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
  Stack,
  Snackbar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para límite de registros por sección
  const [evaluationsLimit, setEvaluationsLimit] = useState<number | 'all'>(10);
  const [usersLimit, setUsersLimit] = useState<number | 'all'>(10);

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
    setActionReason('');
  };

  const handleActionConfirm = () => {
    let message = '';
    switch (actionType) {
      case 'edit':
        message = `Evaluación de ${selectedEvaluation?.fromUser} actualizada exitosamente`;
        break;
      case 'delete':
        message = `Evaluación de ${selectedEvaluation?.fromUser} eliminada`;
        break;
      case 'view':
        message = `Viendo detalles de la evaluación`;
        break;
    }
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionDialog(false);
    setActionReason('');
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'edit': return 'Editar Evaluación';
      case 'delete': return 'Eliminar Evaluación';
      case 'view': return 'Detalles de Evaluación';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedEvaluation) return null;

    if (actionType === 'view') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Evaluación del Proyecto</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedEvaluation.projectTitle}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Información General:</Typography>
            <Typography><strong>De:</strong> {selectedEvaluation.fromUser} ({selectedEvaluation.fromUserType === 'student' ? 'Estudiante' : 'Empresa'})</Typography>
            <Typography><strong>Para:</strong> {selectedEvaluation.toUser} ({selectedEvaluation.toUserType === 'student' ? 'Estudiante' : 'Empresa'})</Typography>
            <Typography><strong>Fecha:</strong> {new Date(selectedEvaluation.date).toLocaleDateString()}</Typography>
            <Typography><strong>Categoría:</strong> {selectedEvaluation.category === 'technical' ? 'Técnica' : 
                                                      selectedEvaluation.category === 'soft_skills' ? 'Habilidades Blandas' :
                                                      selectedEvaluation.category === 'punctuality' ? 'Puntualidad' :
                                                      selectedEvaluation.category === 'teamwork' ? 'Trabajo en Equipo' :
                                                      selectedEvaluation.category === 'communication' ? 'Comunicación' : 'General'}</Typography>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Calificación:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating value={selectedEvaluation.rating} readOnly size="large" />
              <Typography variant="h6" fontWeight={600}>
                {selectedEvaluation.rating}/5
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Comentario:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2">
                {selectedEvaluation.comment}
              </Typography>
            </Paper>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Evaluación: {selectedEvaluation.projectTitle}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          De: {selectedEvaluation.fromUser} → Para: {selectedEvaluation.toUser}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Estado actual: <strong>{selectedEvaluation.status === 'active' ? 'Activa' : 
                                  selectedEvaluation.status === 'flagged' ? 'Marcada' : 'Eliminada'}</strong>
        </Typography>
        
        {actionType === 'delete' && (
          <>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Razón de eliminación"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              sx={{ mt: 2, borderRadius: 2 }}
              required
            />
            <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
              ⚠️ Esta acción es irreversible. La evaluación será eliminada permanentemente.
            </Typography>
          </>
        )}
      </Box>
    );
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Evaluaciones</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Evaluaciones" />
          <Tab label="Resumen de Usuarios" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Filtros */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Usuario</InputLabel>
                <Select
                  value={filterType}
                  label="Tipo de Usuario"
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="student">Estudiantes</MenuItem>
                  <MenuItem value="company">Empresas</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filterCategory}
                  label="Categoría"
                  onChange={(e) => setFilterCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="technical">Técnica</MenuItem>
                  <MenuItem value="soft_skills">Habilidades Blandas</MenuItem>
                  <MenuItem value="punctuality">Puntualidad</MenuItem>
                  <MenuItem value="teamwork">Trabajo en Equipo</MenuItem>
                  <MenuItem value="communication">Comunicación</MenuItem>
                  <MenuItem value="overall">General</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Selector de cantidad de registros para evaluaciones */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, px: 3 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={evaluationsLimit}
              onChange={e => setEvaluationsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Evaluador</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Evaluado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proyecto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Calificación</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Categoría</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(evaluationsLimit === 'all' ? filteredEvaluations : filteredEvaluations.slice(0, evaluationsLimit)).map(evaluation => (
                  <TableRow key={evaluation.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: evaluation.fromUserType === 'student' ? 'primary.main' : 'secondary.main' }}>
                          {evaluation.fromUserType === 'student' ? <PersonIcon /> : <BusinessIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {evaluation.fromUser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.fromUserType === 'student' ? 'Estudiante' : 'Empresa'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: evaluation.toUserType === 'student' ? 'primary.main' : 'secondary.main' }}>
                          {evaluation.toUserType === 'student' ? <PersonIcon /> : <BusinessIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {evaluation.toUser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.toUserType === 'student' ? 'Estudiante' : 'Empresa'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {evaluation.projectTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={evaluation.rating} readOnly size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {evaluation.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryText(evaluation.category)} 
                        color="primary" 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(evaluation.status)} 
                        color={getStatusColor(evaluation.status) as any}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{new Date(evaluation.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="info" 
                        title="Ver detalles"
                        onClick={() => handleAction(evaluation, 'view')}
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        title="Editar evaluación"
                        onClick={() => handleAction(evaluation, 'edit')}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        title="Eliminar evaluación"
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
          {/* Selector de cantidad de registros para resumen de usuarios */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={usersLimit}
              onChange={e => setUsersLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {(usersLimit === 'all' ? userSummaries : userSummaries.slice(0, usersLimit)).map((user) => (
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
      </Paper>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'edit' && <EditIcon color="primary" />}
          {actionType === 'delete' && <DeleteIcon color="error" />}
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
              onClick={handleActionConfirm}
              variant="contained"
              color={actionType === 'edit' ? 'primary' : 'error'}
              sx={{ borderRadius: 2 }}
              disabled={actionType === 'delete' && !actionReason.trim()}
            >
              {actionType === 'edit' ? 'Actualizar' : 'Eliminar'}
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
};

export default GestionEvaluacionesAdmin; 