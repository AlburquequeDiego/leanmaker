import { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Evaluation {
  id: string;
  student_name: string;
  student_id: string;
  company_name: string;
  company_id: string;
  project_title: string;
  project_id: string;
  score: number;
  comments: string;
  evaluation_date: string;
  status: 'pending' | 'approved' | 'rejected';
  evaluator_name: string;
  evaluator_type: 'company' | 'admin';
  criteria_scores?: {
    [key: string]: number;
  };
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
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

  const [successMessage, setSuccessMessage] = useState('');

  // Estados para límite de registros por sección
  const [evaluationsLimit, setEvaluationsLimit] = useState<number | 'all'>(10);
  const [usersLimit, setUsersLimit] = useState<number | 'all'>(10);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    project_id: '',
    score: 0,
    comments: '',
    criteria_scores: {} as { [key: string]: number },
  });

  useEffect(() => {
    fetchEvaluations();
    fetchCriteria();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/evaluations/');
      const formattedEvaluations = Array.isArray(data) ? data.map((evaluation: any) => ({
        id: evaluation.id,
        student_name: evaluation.student_name || 'Estudiante',
        student_id: evaluation.student_id,
        company_name: evaluation.company_name || 'Empresa',
        company_id: evaluation.company_id,
        project_title: evaluation.project_title || 'Proyecto',
        project_id: evaluation.project_id,
        score: evaluation.score || 0,
        comments: evaluation.comments || '',
        evaluation_date: evaluation.evaluation_date || evaluation.created_at,
        status: evaluation.status || 'pending',
        evaluator_name: evaluation.evaluator_name || 'Admin',
        evaluator_type: evaluation.evaluator_type || 'admin',
        criteria_scores: evaluation.criteria_scores || {},
      })) : [];
      
      setEvaluations(formattedEvaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const data = await apiService.get('/api/evaluation-criteria/');
      const formattedCriteria = Array.isArray(data) ? data.map((criterion: any) => ({
        id: criterion.id,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight || 1,
        category: criterion.category || 'General',
      })) : [];
      
      setCriteria(formattedCriteria);
    } catch (error) {
      console.error('Error fetching criteria:', error);
      // No mostrar error para criteria ya que es opcional
    }
  };

  const handleCreateEvaluation = async () => {
    try {
      const evaluationData = {
        ...formData,
        status: 'pending',
        evaluator_type: 'admin',
      };

      await apiService.post('/api/evaluations/', evaluationData);
      
      setSuccessMessage('Evaluación creada exitosamente');
      setShowCreateDialog(false);
      resetForm();
      await fetchEvaluations();
    } catch (error) {
      console.error('Error creating evaluation:', error);
    }
  };

  const handleDeleteEvaluation = async () => {
    if (!evaluationToDelete) return;
    
    try {
      setLoading(true);
      await apiService.delete(`/api/evaluations/${evaluationToDelete.id}/`);
      setSuccessMessage('Evaluación eliminada exitosamente');
      fetchEvaluations();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setEvaluationToDelete(null);
    }
  };

  const handleApproveEvaluation = async (evaluationId: string) => {
    try {
      await apiService.patch(`/api/evaluations/${evaluationId}/`, {
        status: 'approved',
      });
      
      setSuccessMessage('Evaluación aprobada exitosamente');
      await fetchEvaluations();
    } catch (error) {
      console.error('Error approving evaluation:', error);
    }
  };

  const handleRejectEvaluation = async (evaluationId: string) => {
    try {
      await apiService.patch(`/api/evaluations/${evaluationId}/`, {
        status: 'rejected',
      });
      
      setSuccessMessage('Evaluación rechazada exitosamente');
      await fetchEvaluations();
    } catch (error) {
      console.error('Error rejecting evaluation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      project_id: '',
      score: 0,
      comments: '',
      criteria_scores: {},
    });
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
            {selectedEvaluation.project_title}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Información General:</Typography>
            <Typography><strong>De:</strong> {selectedEvaluation.student_name} ({selectedEvaluation.student_name === 'Estudiante' ? 'Estudiante' : 'Empresa'})</Typography>
            <Typography><strong>Para:</strong> {selectedEvaluation.company_name} ({selectedEvaluation.company_name === 'Empresa' ? 'Empresa' : 'Estudiante'})</Typography>
            <Typography><strong>Fecha:</strong> {new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}</Typography>
            <Typography><strong>Categoría:</strong> {selectedEvaluation.criteria_scores ? 'Evaluación Completa' : 'Evaluación Parcial'}</Typography>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Calificación:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating value={selectedEvaluation.score} readOnly size="large" />
              <Typography variant="h6" fontWeight={600}>
                {selectedEvaluation.score}/5
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Comentario:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2">
                {selectedEvaluation.comments}
              </Typography>
            </Paper>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Evaluación: {selectedEvaluation.project_title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          De: {selectedEvaluation.student_name} → Para: {selectedEvaluation.company_name}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Estado actual: <strong>{selectedEvaluation.status === 'approved' ? 'Aprobada' : selectedEvaluation.status === 'rejected' ? 'Rechazada' : 'Pendiente'}</strong>
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

  const getEvaluatorTypeText = (type: string) => {
    switch (type) {
      case 'company': return 'Empresa';
      case 'admin': return 'Administrador';
      default: return type;
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation =>
    (evaluation.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     evaluation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     evaluation.project_title.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? evaluation.status === statusFilter : true) &&
    (typeFilter ? evaluation.evaluator_type === typeFilter : true)
  );

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
        message = `Evaluación de ${selectedEvaluation?.student_name} actualizada exitosamente`;
        break;
      case 'delete':
        message = `Evaluación de ${selectedEvaluation?.student_name} eliminada`;
        break;
      case 'view':
        message = `Viendo detalles de la evaluación`;
        break;
    }
    setSuccessMessage(message);
    setActionDialog(false);
    setActionReason('');
  };

  const handleConfirmDelete = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setShowDeleteDialog(true);
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
                <InputLabel>Buscar</InputLabel>
                <TextField
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="approved">Aprobadas</MenuItem>
                  <MenuItem value="rejected">Rechazadas</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Evaluador</InputLabel>
                <Select
                  value={typeFilter}
                  label="Evaluador"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="company">Empresas</MenuItem>
                  <MenuItem value="admin">Administradores</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
              >
                Nueva Evaluación
              </Button>
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
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiante</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Empresa</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proyecto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Calificación</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Evaluador</TableCell>
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
                        <Avatar sx={{ width: 32, height: 32, bgcolor: evaluation.student_name === 'Estudiante' ? 'primary.main' : 'secondary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {evaluation.student_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.student_name === 'Estudiante' ? 'Estudiante' : 'Empresa'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: evaluation.company_name === 'Empresa' ? 'primary.main' : 'secondary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {evaluation.company_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evaluation.company_name === 'Empresa' ? 'Empresa' : 'Estudiante'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {evaluation.project_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={evaluation.score} readOnly size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {evaluation.score.toFixed(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getEvaluatorTypeText(evaluation.evaluator_type)} 
                        color={evaluation.evaluator_type === 'admin' ? 'error' : 'primary'}
                        size="small"
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
                    <TableCell>{new Date(evaluation.evaluation_date).toLocaleDateString()}</TableCell>
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
                      {evaluation.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveEvaluation(evaluation.id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectEvaluation(evaluation.id)}
                          >
                            <WarningIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        color="error" 
                        title="Eliminar evaluación"
                        onClick={() => handleConfirmDelete(evaluation)}
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
            {(usersLimit === 'all' ? evaluations : evaluations.slice(0, usersLimit)).map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: evaluation.student_name === 'Estudiante' ? 'primary.main' : 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{evaluation.student_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {evaluation.student_name === 'Estudiante' ? 'Estudiante' : 'Empresa'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Evaluaciones recibidas:</Typography>
                    <Typography variant="body2" fontWeight="bold">{evaluations.filter(e => e.student_name === evaluation.student_name).length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Total:</Typography>
                    <Typography variant="body2" fontWeight="bold">{evaluations.filter(e => e.student_name === evaluation.student_name).length}</Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Última actividad: {new Date(evaluation.evaluation_date).toLocaleDateString()}
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

      {/* Dialog para crear evaluación */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Evaluación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="ID del Estudiante"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
                sx={{ minWidth: { xs: '100%', md: '48%' } }}
              />
              <TextField
                label="ID del Proyecto"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                required
                sx={{ minWidth: { xs: '100%', md: '48%' } }}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon color="primary" />
                <Typography variant="subtitle1">Puntuación General</Typography>
              </Box>
              <Rating
                value={formData.score}
                onChange={(_, value) => setFormData({ ...formData, score: value || 0 })}
                precision={0.5}
                size="large"
              />
            </Box>
            {criteria.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Criterios de Evaluación
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {criteria.map((criterion) => (
                    <Box key={criterion.id} sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                      <Typography variant="body2" fontWeight="bold">
                        {criterion.name}
                      </Typography>
                      <Rating
                        value={formData.criteria_scores[criterion.id] || 0}
                        onChange={(_, value) => setFormData({
                          ...formData,
                          criteria_scores: {
                            ...formData.criteria_scores,
                            [criterion.id]: value || 0
                          }
                        })}
                        precision={0.5}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              label="Comentarios"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateEvaluation}
            disabled={!formData.student_id || !formData.project_id}
          >
            Crear Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver evaluación */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        {selectedEvaluation && (
          <>
            <DialogTitle>Detalles de la Evaluación</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Estudiante</Typography>
                    <Typography variant="body1">{selectedEvaluation.student_name}</Typography>
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Empresa</Typography>
                    <Typography variant="body1">{selectedEvaluation.company_name}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Proyecto</Typography>
                  <Typography variant="body1">{selectedEvaluation.project_title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Puntuación</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={selectedEvaluation.score} precision={0.5} readOnly />
                      <Typography variant="body1">{selectedEvaluation.score.toFixed(1)}/5.0</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Estado</Typography>
                    <Chip 
                      label={getStatusText(selectedEvaluation.status)} 
                      color={getStatusColor(selectedEvaluation.status) as any}
                    />
                  </Box>
                </Box>
                {Object.keys(selectedEvaluation.criteria_scores || {}).length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Criterios Evaluados
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {Object.entries(selectedEvaluation.criteria_scores || {}).map(([criterionId, score]) => {
                        const criterion = criteria.find(c => c.id === criterionId);
                        return (
                          <Box key={criterionId} sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                            <Typography variant="body2" fontWeight="bold">
                              {criterion?.name || criterionId}
                            </Typography>
                            <Rating value={score} precision={0.5} readOnly size="small" />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Comentarios</Typography>
                  <Typography variant="body1">{selectedEvaluation.comments}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Evaluador</Typography>
                    <Typography variant="body1">{selectedEvaluation.evaluator_name}</Typography>
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">Fecha</Typography>
                    <Typography variant="body1">
                      {new Date(selectedEvaluation.evaluation_date).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowViewDialog(false)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la evaluación de "{selectedEvaluation?.student_name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteEvaluation}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 