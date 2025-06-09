import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
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

interface APIResult {
  id: string;
  date: string;
  score: number;
  level: number;
  questionsAnswered: number;
  timeSpent: string;
}

const mockResults: APIResult[] = [
  {
    id: '1',
    date: '2024-01-15',
    score: 3.5,
    level: 3,
    questionsAnswered: 4,
    timeSpent: '15 minutos',
  },
  {
    id: '2',
    date: '2023-12-10',
    score: 2.8,
    level: 2,
    questionsAnswered: 4,
    timeSpent: '18 minutos',
  },
  {
    id: '3',
    date: '2023-11-05',
    score: 2.2,
    level: 2,
    questionsAnswered: 4,
    timeSpent: '20 minutos',
  },
];

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
  const currentLevel = 3; // Nivel actual del estudiante
  const currentResult = mockResults[0]; // Resultado más reciente

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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Resultados del Nivel API
      </Typography>

      {/* Nivel API Actual */}
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
            onClick={() => {
              // Aquí se redirigiría al cuestionario
              console.log('Redirigiendo al cuestionario...');
            }}
          >
            Rendir Nuevo Test
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].description}
        </Typography>

        {/* Progreso hacia el siguiente nivel */}
        {currentLevel < 4 && (
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {apiLevelDescriptions[currentLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
            <Box key={index} sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <Chip
                label={capability}
                color="success"
                variant="outlined"
                sx={{ width: '100%', justifyContent: 'flex-start' }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {mockResults.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tests Realizados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {currentResult.score.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Último Puntaje
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {currentResult.timeSpent}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tiempo Promedio
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {currentLevel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nivel Actual
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Historial de rendiciones */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          Historial de Rendiciones
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Puntaje</TableCell>
                <TableCell>Nivel Obtenido</TableCell>
                <TableCell>Preguntas</TableCell>
                <TableCell>Tiempo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    {new Date(result.date).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {result.score.toFixed(1)}/4.0
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`API ${result.level}`}
                      color={getLevelColor(result.level) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {result.questionsAnswered}/4
                  </TableCell>
                  <TableCell>
                    {result.timeSpent}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Completado"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recomendaciones */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Recomendación:</strong> Para mejorar tu nivel API, considera participar en más proyectos prácticos, 
          tomar cursos especializados, y practicar las habilidades específicas de tu nivel actual. 
          Puedes rendir un nuevo test cada 30 días para evaluar tu progreso.
        </Typography>
      </Alert>
    </Box>
  );
};

export default APIResults; 