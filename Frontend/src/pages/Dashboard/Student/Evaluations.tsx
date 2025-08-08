import { useState } from 'react';
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
import { useTheme } from '../../../contexts/ThemeContext';

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

export const Evaluations = () => {
  const { themeMode } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [calificarModalOpen, setCalificarModalOpen] = useState(false);
  const [showLatest, setShowLatest] = useState(5);

  const handleAction = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setDialogOpen(true);
  };

  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
  const averageRating = '0';

  const gpa = '0.00';

  const handleCalificarEmpresa = async () => {
    // Función vacía - no hace nada
  };

  const handleCloseCalificarModal = () => {
    setCalificarModalOpen(false);
    setSelectedProject(null);
    setCalificacion(null);
    setComentario('');
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
      {/* Header con tarjeta morada */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <RateReviewIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Mis Evaluaciones
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Gestiona tus evaluaciones recibidas y califica a las empresas
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#1e40af',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(59, 130, 246, 0.3)' 
              : '0 4px 20px rgba(59, 130, 246, 0.15)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(59, 130, 246, 0.4)' 
                : '0 8px 32px rgba(59, 130, 246, 0.25)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedEvaluations.length}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Evaluaciones Recibidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)' 
              : 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#ea580c',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(251, 146, 60, 0.3)' 
              : '0 4px 20px rgba(251, 146, 60, 0.15)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(251, 146, 60, 0.4)' 
                : '0 8px 32px rgba(251, 146, 60, 0.25)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {pendingEvaluations.length}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Evaluaciones Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
              : 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#16a34a',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(34, 197, 94, 0.3)' 
              : '0 4px 20px rgba(34, 197, 94, 0.15)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(34, 197, 94, 0.4)' 
                : '0 8px 32px rgba(34, 197, 94, 0.25)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {gpa}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Promedio General
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' 
              : 'linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%)',
            color: themeMode === 'dark' ? '#ffffff' : '#0891b2',
            boxShadow: themeMode === 'dark' 
              ? '0 8px 32px rgba(6, 182, 212, 0.3)' 
              : '0 4px 20px rgba(6, 182, 212, 0.15)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: themeMode === 'dark' 
                ? '0 12px 40px rgba(6, 182, 212, 0.4)' 
                : '0 8px 32px rgba(6, 182, 212, 0.25)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedProjects.length}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Proyectos Completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Evaluaciones de Empresas */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <RateReviewIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700}>
              Evaluar Empresas ({completedProjects.length} proyectos completados)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Califica a las empresas con las que has trabajado en proyectos completados
          </Typography>
        </Box>

        {loadingProjects ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : completedProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BusinessIcon sx={{ fontSize: 48, color: themeMode === 'dark' ? '#64748b' : '#94a3b8', mb: 2 }} />
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
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative',
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
                  boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(96, 165, 250, 0.3)' 
                      : '0 8px 32px rgba(59, 130, 246, 0.15)',
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {project.project_title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6', width: 24, height: 24 }}>
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
                          sx={{ 
                            bgcolor: themeMode === 'dark' ? '#16a34a' : '#bbf7d0',
                            color: themeMode === 'dark' ? '#ffffff' : '#16a34a',
                            fontWeight: 600
                          }}
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
                          sx={{
                            bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                            '&:hover': {
                              bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                            }
                          }}
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
      </Card>

      {/* Evaluaciones Recibidas */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" fontWeight={700}>
                Evaluaciones Realizadas ({completedEvaluations.length})
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              value={showLatest}
              onChange={e => setShowLatest(Number(e.target.value))}
              sx={{ 
                minWidth: 110,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={15}>Últimos 15</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={completedEvaluations.length}>Todos</MenuItem>
            </TextField>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Revisa las evaluaciones que has recibido de las empresas
          </Typography>
        </Box>
        {completedEvaluations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay evaluaciones recibidas aún
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {completedEvaluations.slice(0, showLatest).map((evaluation) => (
              <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
                <Card sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
                  boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(96, 165, 250, 0.3)' 
                      : '0 8px 32px rgba(59, 130, 246, 0.15)',
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                  }
                }} onClick={() => handleAction(evaluation)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6', width: 24, height: 24 }}>
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
                        sx={{ fontWeight: 600 }}
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
      </Card>

      {/* Evaluaciones Pendientes */}
      {pendingEvaluations.length > 0 && (
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#fb923c' : '#ea580c' }} />
              Evaluaciones Pendientes ({pendingEvaluations.length})
            </Typography>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={showLatest}
              onChange={e => setShowLatest(Number(e.target.value))}
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
            {pendingEvaluations.slice(0, showLatest).map((evaluation) => (
              <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
                <Card sx={{ 
                  height: '100%', 
                  opacity: 0.8,
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
                  boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(251, 146, 60, 0.3)' 
                      : '0 8px 32px rgba(251, 146, 60, 0.15)',
                    borderColor: themeMode === 'dark' ? '#fb923c' : '#ea580c'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: themeMode === 'dark' ? '#fb923c' : '#ea580c', width: 24, height: 24 }}>
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
                        sx={{ 
                          bgcolor: themeMode === 'dark' ? '#ea580c' : '#fed7aa',
                          color: themeMode === 'dark' ? '#ffffff' : '#ea580c',
                          fontWeight: 600
                        }}
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