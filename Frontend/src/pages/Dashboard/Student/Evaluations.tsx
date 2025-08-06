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
  Grid,
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
  RateReview as RateReviewIcon,
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
  project_title?: string;
}

interface CompletedProject {
  project_id: string;
  project_title: string;
  project_description: string;
  company_id: string;
  company_name: string;
  completion_date: string;
  already_rated: boolean;
  rating?: number;
  rating_id?: string;
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
    company: raw.company_name || raw.project?.company?.company_name || 'Sin empresa',
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
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedLimit, setCompletedLimit] = useState(5);
  const [pendingLimit, setPendingLimit] = useState(5);
  
  // Estados para el modal de calificar empresa
  const [calificarModalOpen, setCalificarModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
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
    fetchCompletedProjects();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/evaluations/');
      console.log('[Evaluations] Respuesta real del backend:', response);

      let evaluationsData: any[] = [];
      if (response?.data?.results) {
        evaluationsData = response.data.results;
      } else if (response?.results) {
        evaluationsData = response.results;
      } else if (Array.isArray(response)) {
        evaluationsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        evaluationsData = response.data;
      } else {
        console.log('Formato inesperado de respuesta:', response);
        setEvaluations([]);
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(evaluationsData)) {
        console.log('Evaluations no es un array:', evaluationsData);
        setEvaluations([]);
        setLoading(false);
        return;
      }
      setEvaluations(evaluationsData.map(adaptEvaluation));
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setSnackbar({ open: true, message: 'Error al cargar evaluaciones.', severity: 'error' });
      setEvaluations([]);
    }
    setLoading(false);
  };

  const fetchCompletedProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await apiService.get('/api/companies/student/completed-projects/');
      console.log('[Evaluations] Completed projects response:', response);
      
      if (response?.projects) {
        setCompletedProjects(response.projects);
      } else if (Array.isArray(response)) {
        setCompletedProjects(response);
      } else {
        setCompletedProjects([]);
      }
    } catch (error) {
      console.error('Error fetching completed projects:', error);
      setCompletedProjects([]);
    }
    setLoadingProjects(false);
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
    if (!selectedProject || !calificacion) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor completa todos los campos', 
        severity: 'error' 
      });
      return;
    }

    try {
      const payload = {
        company_id: selectedProject.company_id,
        project_id: selectedProject.project_id,
        rating: calificacion,
        comments: comentario || `Evaluación de ${calificacion} estrellas para ${selectedProject.company_name}`
      };

      console.log('Payload enviado a /api/companies/ratings/:', payload);
      
      const response = await apiService.post('/api/companies/ratings/', payload);
      
      setSnackbar({ 
        open: true, 
        message: '¡Evaluación enviada con éxito!', 
        severity: 'success' 
      });

      // Actualizar la lista de proyectos completados
      await fetchCompletedProjects();
      
      // Limpiar el formulario
      setSelectedProject(null);
      setCalificacion(null);
      setComentario('');
      setCalificarModalOpen(false);
      
    } catch (error: any) {
      console.error('Error submitting company rating:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error al enviar la evaluación', 
        severity: 'error' 
      });
    }
  };

  const handleCloseCalificarModal = () => {
    setSelectedProject(null);
    setCalificacion(null);
    setComentario('');
    setCalificarModalOpen(false);
  };

  const handleOpenCalificarModal = (project: CompletedProject) => {
    setSelectedProject(project);
    setCalificarModalOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mis Evaluaciones
      </Typography>

      {/* Estadísticas Generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Evaluaciones Recibidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedProjects.length}
              </Typography>
              <Typography variant="body2">
                Proyectos Completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Evaluaciones de Empresas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
            <RateReviewIcon sx={{ mr: 1, color: 'primary.main' }} />
            Evaluar Empresas ({completedProjects.length} proyectos completados)
          </Typography>
        </Box>

        {loadingProjects ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : completedProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes proyectos completados aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Una vez que completes proyectos, podrás evaluar a las empresas.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {completedProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {project.project_title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {project.company_name}
                          </Typography>
                        </Box>
                      </Box>
                      {project.already_rated && (
                        <Chip
                          label="Ya evaluada"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.project_description?.substring(0, 100)}...
                    </Typography>

                    {project.already_rated && project.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={project.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {project.rating}/5
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Completado: {new Date(project.completion_date).toLocaleDateString()}
                      </Typography>
                      {!project.already_rated && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<StarIcon />}
                          onClick={() => handleOpenCalificarModal(project)}
                        >
                          Evaluar
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Evaluaciones Recibidas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Evaluaciones Recibidas ({completedEvaluations.length})
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
              No hay evaluaciones recibidas aún
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {completedEvaluations.slice(0, completedLimit).map((evaluation) => (
              <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
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
              </Grid>
            ))}
          </Grid>
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
          <Grid container spacing={2}>
            {pendingEvaluations.slice(0, pendingLimit).map((evaluation) => (
              <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
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

                    <Typography variant="caption" color="text.secondary">
                      {evaluation.date} • {evaluation.projectDuration}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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

                        {selectedEvaluation.strengths && selectedEvaluation.strengths.length > 0 && (
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

                        {selectedEvaluation.areasForImprovement && selectedEvaluation.areasForImprovement.length > 0 && (
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
          {selectedProject && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Información del proyecto */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Proyecto: {selectedProject.project_title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Empresa: {selectedProject.company_name}
                </Typography>
              </Box>

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

              {/* Comentario opcional */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comentario (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comparte tu experiencia con esta empresa..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalificarModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCalificarEmpresa} 
            variant="contained" 
            color="primary"
            disabled={!selectedProject || !calificacion}
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