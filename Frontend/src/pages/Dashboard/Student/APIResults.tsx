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

interface ApiLevelRequest {
  id: number;
  requested_level: number;
  current_level: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
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
  const [apiRequests, setApiRequests] = useState<ApiLevelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcular el nivel actual según la última petición aprobada
  const currentLevel = apiRequests.find(r => r.status === 'approved')?.requested_level || 1;

  useEffect(() => {
    fetchApiRequests();
  }, []);

  const fetchApiRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/students/api-level-requests/');
      setApiRequests(data.results || []);
    } catch (error) {
      console.error('Error fetching API level requests:', error);
      setError('Error al cargar las peticiones de subida de nivel API');
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          Nivel API Actual: <Chip label={`Nivel ${currentLevel}`} color={getLevelColor(currentLevel) as any} size="small" sx={{ ml: 2 }} />
        </Typography>
      </Paper>

      {/* Historial de Peticiones de Subida de Nivel API */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          Historial de Peticiones de Subida de Nivel API
        </Typography>
        {apiRequests.length === 0 ? (
          <Alert severity="info">
            No tienes peticiones de subida de nivel API.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nivel Actual</TableCell>
                  <TableCell>Nivel Solicitado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{new Date(req.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={`Nivel ${req.current_level}`} color={getLevelColor(req.current_level) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`Nivel ${req.requested_level}`} color={getLevelColor(req.requested_level) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusText(req.status)} color={getStatusColor(req.status) as any} size="small" />
                    </TableCell>
                    <TableCell>
                      {req.feedback || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default APIResults; 