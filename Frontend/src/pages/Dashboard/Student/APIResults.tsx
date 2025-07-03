import {
  Box,
  Typography,
  Paper,

  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Quiz as QuizIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api.service';

interface APIResult {
  id: string;
  date: string;
  score: number;
  level: number;
  questionsAnswered: number;
  timeSpent: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

const apiLevelDescriptions = {
  1: {
    title: 'Nivel API 1: Asesoría',
    description: 'Puedes comprender conceptos básicos y trabajar bajo supervisión directa. Hasta 20 horas de práctica.',
    capabilities: [
      'Comprender problemas simples',
      'Trabajar con supervisión constante',
      'Aplicar conocimientos básicos',
      'Seguir instrucciones detalladas',
    ],
    icon: <PsychologyIcon />,
    color: 'info' as const,
  },
  2: {
    title: 'Nivel API 2: Asesoría + Propuesta',
    description: 'Puedes trabajar en tareas prácticas con guía y supervisión. Hasta 40 horas de práctica.',
    capabilities: [
      'Analizar problemas con guía',
      'Implementar soluciones básicas',
      'Trabajar en equipo con supervisión',
      'Aplicar metodologías establecidas',
    ],
    icon: <CodeIcon />,
    color: 'primary' as const,
  },
  3: {
    title: 'Nivel API 3: Asesoría + Propuesta + Implementación',
    description: 'Puedes trabajar de forma independiente en proyectos complejos. Hasta 80 horas de práctica.',
    capabilities: [
      'Analizar problemas complejos',
      'Diseñar soluciones técnicas',
      'Trabajar de forma autónoma',
      'Liderar aspectos del proyecto',
    ],
    icon: <TrendingUpIcon />,
    color: 'success' as const,
  },
  4: {
    title: 'Nivel API 4: Asesoría + Propuesta + Implementación + Upgrade',
    description: 'Puedes liderar proyectos complejos e innovar en soluciones. Hasta 160 horas de práctica.',
    capabilities: [
      'Liderar proyectos complejos',
      'Innovar en soluciones técnicas',
      'Mentorear a otros desarrolladores',
      'Optimizar y escalar sistemas',
    ],
    icon: <EmojiEventsIcon />,
    color: 'warning' as const,
  },
};

export const APIResults = () => {
  const [results, setResults] = useState<APIResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<APIResult | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/questionnaires/');
      const formattedResults = Array.isArray(data) ? data.map((result: any) => ({
        id: result.id,
        date: result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'N/A',
        score: result.average_score || 0,
        level: result.calculated_level || 0,
        questionsAnswered: 4, // Siempre 4 preguntas en el cuestionario
        timeSpent: '5 minutos', // Mock time
        status: result.status || 'pending',
        feedback: result.feedback,
      })) : [];
      
      setResults(formattedResults);
      
      // Establecer el nivel actual (el más reciente aprobado o el más reciente si no hay aprobados)
      if (formattedResults.length > 0) {
        const approvedResults = formattedResults.filter(r => r.status === 'approved');
        if (approvedResults.length > 0) {
          setCurrentLevel(approvedResults[0].level);
          setCurrentResult(approvedResults[0]);
        } else {
          setCurrentLevel(formattedResults[0].level);
          setCurrentResult(formattedResults[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching API results:', error);
      setError('Error al cargar los resultados del cuestionario API');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'warning';
      default: return 'default';
    }
  };

  const getProgressToNextLevel = (currentScore: number) => {
    const levelThresholds = { 1: 1.5, 2: 2.5, 3: 3.5, 4: 4.0 };
    const currentThreshold = levelThresholds[currentLevel as keyof typeof levelThresholds];
    const nextThreshold = currentLevel < 4 ? levelThresholds[(currentLevel + 1) as keyof typeof levelThresholds] : 4.0;
    
    const progress = ((currentScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
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
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleRequestNewLevel = async () => {
    try {
      setRequestSent(true);
      // Aquí se podría enviar una solicitud para un nuevo cuestionario
      setShowSuccess(true);
      setRequestDialogOpen(false);
    } catch (error) {
      console.error('Error requesting new level:', error);
      setError('Error al solicitar nuevo nivel');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Resultados del Nivel API
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Nivel API Actual */}
      {currentLevel > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].icon}
              <Box sx={{ ml: 2 }}>
                <Typography variant="h5">
                  {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].title}
                </Typography>
                <Chip 
                  label={`Nivel API ${currentLevel}`} 
                  color={apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].color}
                  size="small"
                />
              </Box>
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/dashboard/student/api-questionnaire')}
            >
              Hacer cuestionario
            </Button>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].description}
          </Typography>

          {/* Progreso hacia el siguiente nivel */}
          {currentLevel < 4 && currentResult && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso hacia Nivel {currentLevel + 1}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getProgressToNextLevel(currentResult.score).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgressToNextLevel(currentResult.score)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Capacidades del nivel actual */}
          <Typography variant="h6" gutterBottom>
            Capacidades de tu nivel:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
              <Chip
                key={index}
                label={capability}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Historial de Resultados */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            Historial de Cuestionarios
          </Typography>
        </Box>

        {results.length === 0 ? (
          <Alert severity="info">
            No tienes cuestionarios realizados. Haz tu primer cuestionario para obtener tu nivel API.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Puntuación</TableCell>
                  <TableCell>Nivel Calculado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{result.score.toFixed(1)}</Typography>
                        <Chip 
                          label={`Nivel ${result.level}`} 
                          color={getLevelColor(result.level) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`Nivel API ${result.level}`} 
                        color={getLevelColor(result.level) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(result.status)} 
                        color={getStatusColor(result.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setCurrentResult(result);
                          setRequestDialogOpen(true);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog para detalles del resultado */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Detalles del Cuestionario
          </Typography>
        </DialogTitle>
        <DialogContent>
          {currentResult && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {currentResult.date}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Puntuación:</strong> {currentResult.score.toFixed(1)} / 4.0
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Nivel Calculado:</strong> API {currentResult.level}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Estado:</strong> {getStatusText(currentResult.status)}
              </Typography>
              {currentResult.feedback && (
                <Typography variant="body1" gutterBottom>
                  <strong>Comentarios:</strong> {currentResult.feedback}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>
            Cerrar
          </Button>
          {currentResult?.status === 'rejected' && (
            <Button
              variant="contained"
              onClick={handleRequestNewLevel}
              disabled={requestSent}
            >
              Solicitar Nuevo Nivel
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        message="Solicitud enviada exitosamente"
      />
    </Box>
  );
};

export default APIResults; 