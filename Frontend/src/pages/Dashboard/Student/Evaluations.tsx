import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useDashboardStats } from '../../../hooks/useRealTimeData';

interface Evaluation {
  id: string;
  projectTitle: string;
  company: string;
  evaluator: string;
  evaluatorRole: string;
  date: string;
  status: 'completed' | 'pending';
  type: 'intermediate' | 'final';
  overallRating: number | null;
  categories: Array<{
    name: string;
    rating: number | null;
    icon: React.ReactNode;
  }>;
  comments: string | null;
  strengths: string[] | null;
  areasForImprovement: string[] | null;
  projectDuration: string;
  technologies: string[];
  deliverables: string[];
}

interface CompanyRating {
  id: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
}

const typeConfig = {
  intermediate: {
    label: 'Intermedia',
    color: 'info',
  },
  final: {
    label: 'Final',
    color: 'primary',
  },
};

// Adaptador para asegurar que evaluation.technologies siempre sea un array
function adaptEvaluation(raw: any): Evaluation {
  return {
    id: raw.id || '',
    projectTitle: raw.project_title || raw.projectTitle || 'Sin título',
    company: raw.project?.company?.company_name || 'Sin empresa',
    evaluator: raw.evaluator_name || raw.evaluator || 'Sin evaluador',
    evaluatorRole: raw.evaluator_role || raw.evaluatorRole || 'Sin rol',
    date: raw.evaluation_date || raw.date || raw.created_at || '',
    status: raw.status || 'completed',
    type: raw.type || 'final',
    overallRating: typeof raw.score === 'number' ? raw.score : (typeof raw.overall_rating === 'number' ? raw.overall_rating : null),
    categories: Array.isArray(raw.category_scores) ? raw.category_scores.map((cat: any) => ({
      name: cat.category_name || 'Sin categoría',
      rating: cat.rating || null,
      icon: <StarIcon />
    })) : [],
    comments: raw.comments || null,
    strengths: typeof raw.strengths === 'string' ? raw.strengths.split(',').map(s => s.trim()).filter(s => s) : [],
    areasForImprovement: typeof raw.areas_for_improvement === 'string' ? raw.areas_for_improvement.split(',').map(a => a.trim()).filter(a => a) : [],
    projectDuration: raw.project_duration || raw.projectDuration || '',
    technologies: Array.isArray(raw.technologies)
      ? raw.technologies
      : (typeof raw.technologies === 'string' && raw.technologies)
        ? raw.technologies.split(',').map(t => t.trim()).filter(t => t)
        : [],
    deliverables: typeof raw.deliverables === 'string' ? raw.deliverables.split(',').map(d => d.trim()).filter(d => d) : [],
  };
}

export const Evaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [companyRatings, setCompanyRatings] = useState<CompanyRating[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedLimit, setCompletedLimit] = useState(5);
  const [pendingLimit, setPendingLimit] = useState(5);
  
  // Estados para el modal de calificar empresa
  const [calificarModalOpen, setCalificarModalOpen] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const { data: stats } = useDashboardStats('student');

  useEffect(() => {
    fetchEvaluations();
    fetchCompanyRatings();
    fetchAvailableCompanies();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/evaluations/');
      console.log('[Evaluations] Response:', response);
      // El backend puede devolver {success: true, data: Array, ...} o un array directo
      let evaluationsData = response.data || response;
      if (!Array.isArray(evaluationsData)) {
        // Si viene paginado o con otra estructura
        evaluationsData = evaluationsData.results || evaluationsData.data || [];
      }
      // Adaptar cada evaluación
      setEvaluations(evaluationsData.map(adaptEvaluation));
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setEvaluations([]);
    }
    setLoading(false);
  };

  const fetchCompanyRatings = async () => {
    try {
      // Este endpoint no existe en el backend, por ahora lo deshabilitamos
      console.log('[Evaluations] Company ratings endpoint not available');
      setCompanyRatings([]);
    } catch (error) {
      console.error('Error fetching company ratings:', error);
      setCompanyRatings([]);
    }
  };

  const fetchAvailableCompanies = async () => {
    try {
      const response = await apiService.get('/api/companies/');
      console.log('[Evaluations] Companies response:', response);
      
      // El backend devuelve {message: 'companies_list placeholder'}
      // Por ahora usamos un array vacío hasta que se implemente el endpoint
      setAvailableCompanies([]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setAvailableCompanies([]);
    }
  };

  const handleAction = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setDialogOpen(true);
  };

  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
  const averageRating = completedEvaluations.length > 0 
    ? (completedEvaluations.reduce((acc, e) => acc + (e.overallRating ?? 0), 0) / completedEvaluations.length).toFixed(1)
    : '0';

  // Usar el GPA real del backend si está disponible
  const gpa = stats?.gpa !== undefined ? Number(stats.gpa).toFixed(2) : '0.00';

  const handleCalificarEmpresa = async () => {
    if (!empresaSeleccionada || !calificacion || !comentario.trim()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa todos los campos', 
        severity: 'error' 
      });
      return;
    }

    try {
      const newRating = await apiService.post('/api/company-ratings/', {
        company: empresaSeleccionada,
        rating: calificacion,
        comment: comentario.trim()
      });

      setCompanyRatings(prev => [...prev, newRating as CompanyRating]);

      // Limpiar el formulario
      setEmpresaSeleccionada('');
      setCalificacion(null);
      setComentario('');
      setCalificarModalOpen(false);

      setSnackbar({ 
        open: true, 
        message: '¡Evaluación enviada con éxito!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error submitting company rating:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al enviar la evaluación', 
        severity: 'error' 
      });
    }
  };

  const handleCloseCalificarModal = () => {
    setEmpresaSeleccionada('');
    setCalificacion(null);
    setComentario('');
    setCalificarModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(evaluations)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">La estructura de los datos de evaluaciones no es válida.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mis Evaluaciones
      </Typography>

      {/* Estadísticas Generales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Evaluaciones Completadas
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {pendingEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Evaluaciones Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {gpa}
              </Typography>
              <Typography variant="body2">
                Promedio General
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {evaluations.length}
              </Typography>
              <Typography variant="body2">
                Total Proyectos
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Evaluaciones Completadas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Evaluaciones Completadas ({completedEvaluations.length})
          </Typography>
          <TextField
            select
            size="small"
            label="Mostrar"
            value={completedLimit}
            onChange={e => setCompletedLimit(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            <MenuItem value={5}>Últimos 5</MenuItem>
            <MenuItem value={10}>Últimos 10</MenuItem>
            <MenuItem value={15}>Últimos 15</MenuItem>
            <MenuItem value={20}>Últimos 20</MenuItem>
            <MenuItem value={completedEvaluations.length}>Todos</MenuItem>
          </TextField>
        </Box>
        {completedEvaluations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay evaluaciones completadas aún
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {completedEvaluations.slice(0, completedLimit).map((evaluation) => (
              <Box key={evaluation.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleAction(evaluation)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={typeConfig[evaluation.type as keyof typeof typeConfig].label}
                        color={typeConfig[evaluation.type as keyof typeof typeConfig].color as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={evaluation.overallRating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {evaluation.overallRating}/5
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {evaluation.comments?.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {evaluation.technologies?.slice(0, 3).map((tech: string) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {evaluation.technologies?.length > 3 && (
                        <Chip label={`+${evaluation.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {evaluation.date} • {evaluation.projectDuration}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Evaluaciones Pendientes */}
      {pendingEvaluations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'warning.main' }} />
              Evaluaciones Pendientes ({pendingEvaluations.length})
            </Typography>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={pendingLimit}
              onChange={e => setPendingLimit(Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={15}>Últimos 15</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={pendingEvaluations.length}>Todos</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {pendingEvaluations.slice(0, pendingLimit).map((evaluation) => (
              <Box key={evaluation.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', opacity: 0.7 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="Pendiente"
                        color="warning"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Evaluación en proceso...
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {evaluation.technologies?.slice(0, 3).map((tech: string) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {evaluation.date} • {evaluation.projectDuration}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Dialog para mostrar detalles de la evaluación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles de la Evaluación
            </Typography>
            <Chip
              label={selectedEvaluation?.status === 'completed' ? 'Completada' : 'Pendiente'}
              color={selectedEvaluation?.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedEvaluation.projectTitle}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Información General y Calificación */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Información General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Información del Proyecto
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <BusinessIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Empresa"
                              secondary={selectedEvaluation.company}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Evaluador"
                              secondary={`${selectedEvaluation.evaluator} - ${selectedEvaluation.evaluatorRole}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Fecha"
                              secondary={selectedEvaluation.date}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Duración"
                              secondary={selectedEvaluation.projectDuration}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Calificación General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Calificación General
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating value={selectedEvaluation.overallRating} readOnly size="large" />
                          <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
                            {selectedEvaluation.overallRating}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Evaluación {typeConfig[selectedEvaluation.type as keyof typeof typeConfig].label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Categorías de Evaluación */}
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Evaluación por Categorías
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {selectedEvaluation.categories?.map((category: any, index: number) => (
                          <Box key={index} sx={{ flex: '1 1 250px', minWidth: 0 }}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {category.icon}
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                  {category.name}
                                </Typography>
                              </Box>
                              <Rating value={category.rating} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                {category.rating}/5
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Tecnologías y Entregables */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Tecnologías Utilizadas
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedEvaluation.technologies?.map((tech: string) => (
                            <Chip key={tech} label={tech} color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Entregables
                        </Typography>
                        <List dense>
                          {selectedEvaluation.deliverables?.map((deliverable: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircleIcon color="success" />
                              </ListItemIcon>
                              <ListItemText primary={deliverable} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Comentarios */}
                {selectedEvaluation.comments && (
                  <Box>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Comentarios del Evaluador
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3 }}>
                          "{selectedEvaluation.comments}"
                        </Typography>

                        {selectedEvaluation.strengths && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main' }}>
                              Fortalezas
                            </Typography>
                            <List dense>
                              {selectedEvaluation.strengths.map((strength: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckCircleIcon color="success" />
                                  </ListItemIcon>
                                  <ListItemText primary={strength} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {selectedEvaluation.areasForImprovement && (
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'warning.main' }}>
                              Áreas de Mejora
                            </Typography>
                            <List dense>
                              {selectedEvaluation.areasForImprovement.map((area: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <AccessTimeIcon color="warning" />
                                  </ListItemIcon>
                                  <ListItemText primary={area} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ my: 4 }} />
      
      {/* Sección de Evaluaciones dadas a empresas */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Evaluaciones que diste a la empresa
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCalificarModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Calificar Nueva Empresa
        </Button>
      </Box>

      {companyRatings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
          <StarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no has evaluado a ninguna empresa
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comparte tu experiencia con las empresas donde has trabajado para ayudar a otros estudiantes.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCalificarModalOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Calificar Mi Primera Empresa
          </Button>
        </Paper>
      ) : (
        companyRatings.map((ev, idx) => (
          <Paper key={idx} sx={{ p: 3, mb: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {ev.company}
                </Typography>
                <Rating 
                  value={ev.rating} 
                  readOnly 
                  size="medium"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {ev.rating} de 5 estrellas
                </Typography>
              </Box>
              <Chip 
                label="Evaluación enviada" 
                color="success" 
                size="small" 
                icon={<CheckCircleIcon />}
              />
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              "{ev.comment}"
            </Typography>
          </Paper>
        ))
      )}

      {/* Modal para calificar empresa */}
      <Dialog 
        open={calificarModalOpen} 
        onClose={handleCloseCalificarModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            <Typography variant="h6">
              Calificar Empresa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Selección de empresa */}
            <FormControl fullWidth>
              <InputLabel>Empresa a calificar</InputLabel>
              <Select
                value={empresaSeleccionada}
                label="Empresa a calificar"
                onChange={(e) => setEmpresaSeleccionada(e.target.value)}
              >
                {availableCompanies.map((empresa) => (
                  <MenuItem key={empresa} value={empresa}>
                    {empresa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Calificación con estrellas */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                ¿Cómo calificarías tu experiencia con esta empresa?
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Rating
                  value={calificacion}
                  onChange={(_, newValue) => setCalificacion(newValue)}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {calificacion ? `${calificacion} de 5 estrellas` : 'Selecciona una calificación'}
                </Typography>
              </Box>
            </Box>

            {/* Comentario */}
            <TextField
              label="Comparte tu experiencia"
              multiline
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Describe tu experiencia trabajando con esta empresa. ¿Qué te gustó? ¿Qué podría mejorar?"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalificarModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCalificarEmpresa} 
            variant="contained" 
            color="primary"
            disabled={!empresaSeleccionada || !calificacion || !comentario.trim()}
          >
            Enviar Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Evaluations; 