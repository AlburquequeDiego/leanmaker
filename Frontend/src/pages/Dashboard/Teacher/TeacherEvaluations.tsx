import { useState, useEffect } from 'react';
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
  CircularProgress, 
  Alert, 
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Grid,
  Rating,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';

interface Evaluation {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  project_id: string;
  project_title: string;
  company_name: string;
  score: number;
  comments: string;
  status: 'draft' | 'pending' | 'completed' | 'reviewed';
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export default function TeacherEvaluations() {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [evaluationForm, setEvaluationForm] = useState({
    student_id: '',
    project_id: '',
    score: 0,
    comments: '',
  });

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data para evaluaciones
      const mockEvaluations: Evaluation[] = [
        {
          id: '1',
          student_id: '1',
          student_name: 'Ana García',
          student_email: 'ana.garcia@estudiante.cl',
          project_id: '1',
          project_title: 'Sistema de Gestión Empresarial',
          company_name: 'TechCorp',
          score: 8.5,
          comments: 'Excelente trabajo en el desarrollo del sistema. Muestra gran iniciativa y capacidad técnica.',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          student_id: '2',
          student_name: 'Carlos López',
          student_email: 'carlos.lopez@estudiante.cl',
          project_id: '1',
          project_title: 'Sistema de Gestión Empresarial',
          company_name: 'TechCorp',
          score: 7.2,
          comments: 'Buen desempeño general. Necesita mejorar en comunicación y puntualidad.',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '3',
          student_id: '3',
          student_name: 'María Rodríguez',
          student_email: 'maria.rodriguez@estudiante.cl',
          project_id: '3',
          project_title: 'Análisis de Datos con Python',
          company_name: 'DataCorp',
          score: 0,
          comments: '',
          status: 'draft',
          created_at: '2024-01-20T11:00:00Z',
          updated_at: '2024-01-20T11:00:00Z',
          due_date: '2024-02-20T23:59:59Z',
        }
      ];
      
      setEvaluations(mockEvaluations);
      
    } catch (err: any) {
      setError('Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const openEvaluationModal = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvaluationModal(true);
  };

  const openCreateModal = () => {
    setEvaluationForm({
      student_id: '',
      project_id: '',
      score: 0,
      comments: '',
    });
    setShowCreateModal(true);
  };

  const createEvaluation = async () => {
    try {
      setActionLoading(true);
      
      console.log('🎓 [TEACHER EVALUATIONS] Creando evaluación:', evaluationForm);
      
      setSuccessMsg('Evaluación creada exitosamente');
      setShowCreateModal(false);
      
      await loadEvaluations();
      
    } catch (err: any) {
      console.error('Error creando evaluación:', err);
      setError('Error al crear evaluación');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || evaluation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      case 'reviewed': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'draft': return 'Borrador';
      case 'reviewed': return 'Revisada';
      default: return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando evaluaciones...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          📊 Evaluaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Crea y gestiona evaluaciones de tus estudiantes en los proyectos asignados.
        </Typography>
      </Box>

      {/* Acciones principales */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ mr: 2 }}
        >
          Nueva Evaluación
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Buscar evaluaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="completed">Completadas</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="draft">Borradores</MenuItem>
              <MenuItem value="reviewed">Revisadas</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadEvaluations}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Lista de evaluaciones */}
      <Grid container spacing={3}>
        {filteredEvaluations.map((evaluation) => (
          <Grid item xs={12} md={6} lg={4} key={evaluation.id}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => openEvaluationModal(evaluation)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {evaluation.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.project_title}
                    </Typography>
                  </Box>
                  <Chip 
                    label={getStatusLabel(evaluation.status)}
                    color={getStatusColor(evaluation.status) as any}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Empresa:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {evaluation.company_name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Puntuación:
                    </Typography>
                    <Chip 
                      label={evaluation.score > 0 ? `${evaluation.score.toFixed(1)}/10` : 'Sin calificar'}
                      color={evaluation.score > 0 ? getScoreColor(evaluation.score) as any : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(evaluation.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ color: 'warning.main', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" fontWeight={500}>
                      {evaluation.score > 0 ? `${evaluation.score.toFixed(1)}/10` : 'Pendiente'}
                    </Typography>
                  </Box>
                  
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEvaluationModal(evaluation);
                    }}
                  >
                    {evaluation.status === 'draft' ? 'Continuar' : 'Ver detalles'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal de detalles de evaluación */}
      <Dialog 
        open={showEvaluationModal} 
        onClose={() => setShowEvaluationModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Evaluación de {selectedEvaluation?.student_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEvaluation?.project_title} - {selectedEvaluation?.company_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📋 Información de la Evaluación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Estado:</Typography>
                    <Chip 
                      label={getStatusLabel(selectedEvaluation.status)}
                      color={getStatusColor(selectedEvaluation.status) as any}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Puntuación general:</Typography>
                    <Typography variant="h6" color="primary.main">
                      {selectedEvaluation.score > 0 ? `${selectedEvaluation.score.toFixed(1)}/10` : 'Sin calificar'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  💬 Comentarios
                </Typography>
                <Typography variant="body2">
                  {selectedEvaluation.comments || 'Sin comentarios'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowEvaluationModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de nueva evaluación */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          📊 Nueva Evaluación
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Estudiante</InputLabel>
              <Select
                value={evaluationForm.student_id}
                onChange={(e) => setEvaluationForm({...evaluationForm, student_id: e.target.value})}
                label="Estudiante"
              >
                <MenuItem value="1">Ana García</MenuItem>
                <MenuItem value="2">Carlos López</MenuItem>
                <MenuItem value="3">María Rodríguez</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={evaluationForm.project_id}
                onChange={(e) => setEvaluationForm({...evaluationForm, project_id: e.target.value})}
                label="Proyecto"
              >
                <MenuItem value="1">Sistema de Gestión Empresarial</MenuItem>
                <MenuItem value="2">Aplicación Mobile React Native</MenuItem>
                <MenuItem value="3">Análisis de Datos con Python</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Puntuación (1-10)"
              type="number"
              value={evaluationForm.score}
              onChange={(e) => setEvaluationForm({...evaluationForm, score: Number(e.target.value)})}
              inputProps={{ min: 1, max: 10 }}
            />
            
            <TextField
              fullWidth
              label="Comentarios"
              multiline
              rows={4}
              value={evaluationForm.comments}
              onChange={(e) => setEvaluationForm({...evaluationForm, comments: e.target.value})}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={createEvaluation}
            disabled={actionLoading || !evaluationForm.student_id || !evaluationForm.project_id}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Crear Evaluación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Box>
  );
}