import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,

  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Question {
  id: number;
  question: string;
  options: {
    value: number;
    text: string;
    apiLevel: number;
  }[];
  icon: React.ReactNode;
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿Puedes analizar y comprender un problema real de una empresa?',
    options: [
      { value: 1, text: 'No, necesito ayuda completa.', apiLevel: 1 },
      { value: 2, text: 'Sí, con guía puedo comprenderlo.', apiLevel: 2 },
      { value: 3, text: 'Sí, puedo comprenderlo y diseñar una solución.', apiLevel: 3 },
      { value: 4, text: 'Sí, puedo además implementarla y mejorarla.', apiLevel: 4 },
    ],
    icon: <PsychologyIcon color="primary" />,
  },
  {
    id: 2,
    question: '¿Te sientes capaz de proponer soluciones técnicas o metodológicas?',
    options: [
      { value: 1, text: 'No, necesito que me den la solución.', apiLevel: 1 },
      { value: 2, text: 'Sí, pero necesito validación constante.', apiLevel: 2 },
      { value: 3, text: 'Sí, puedo proponer y justificar mis soluciones.', apiLevel: 3 },
      { value: 4, text: 'Sí, puedo innovar y crear nuevas metodologías.', apiLevel: 4 },
    ],
    icon: <TrendingUpIcon color="primary" />,
  },
  {
    id: 3,
    question: '¿Has implementado alguna solución en un entorno real?',
    options: [
      { value: 1, text: 'No, solo he trabajado en proyectos académicos.', apiLevel: 1 },
      { value: 2, text: 'Sí, pero con supervisión constante.', apiLevel: 2 },
      { value: 3, text: 'Sí, de forma independiente en proyectos reales.', apiLevel: 3 },
      { value: 4, text: 'Sí, he liderado implementaciones complejas.', apiLevel: 4 },
    ],
    icon: <CodeIcon color="primary" />,
  },
  {
    id: 4,
    question: '¿Eres capaz de mejorar o actualizar una solución después de implementarla?',
    options: [
      { value: 1, text: 'No, necesito ayuda para cualquier cambio.', apiLevel: 1 },
      { value: 2, text: 'Sí, pero solo cambios menores y simples.', apiLevel: 2 },
      { value: 3, text: 'Sí, puedo optimizar y mejorar funcionalidades.', apiLevel: 3 },
      { value: 4, text: 'Sí, puedo reestructurar y escalar soluciones.', apiLevel: 4 },
    ],
    icon: <EmojiEventsIcon color="primary" />,
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
  },
};

const getChipColor = (apiLevel: number) => {
  switch (apiLevel) {
    case 1: return 'info';
    case 2: return 'primary';
    case 3: return 'success';
    case 4: return 'warning';
    default: return 'default';
  }
};

export const APIQuestionnaire = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [calculatedLevel, setCalculatedLevel] = useState<number>(0);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentApiLevel, setCurrentApiLevel] = useState<number>(1);

  // Obtener el nivel API actual del estudiante al cargar el componente
  useEffect(() => {
    const fetchCurrentApiLevel = async () => {
      try {
        const data = await apiService.get('/api/students/me/');
        setCurrentApiLevel(Number(data.api_level) || 1);
      } catch (error) {
        console.error('Error fetching current API level:', error);
        setCurrentApiLevel(1);
      }
    };
    fetchCurrentApiLevel();
  }, []);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
    // Avanzar automáticamente si no es la última pregunta
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(idx + 1), 250);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateAPILevel = () => {
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < questions.length) {
      return null;
    }
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const averageScore = totalScore / questions.length;
    if (averageScore <= 1.5) return 1;
    if (averageScore <= 2.5) return 2;
    if (averageScore <= 3.5) return 3;
    return 4;
  };

  const handleSubmit = async () => {
    const level = calculateAPILevel();
    if (level) {
      setCalculatedLevel(level);
      setShowResults(true);
      setPendingApproval(false); // Inicialmente no está pendiente hasta confirmar
      setError(null);
      setSuccess(null);

      try {
        setLoading(true);
        // Enviar petición de subida de nivel API con el nivel actual real
        await apiService.requestApiLevelUpgrade(level, currentApiLevel);
        setSuccess('La petición de tu cuestionario requiere la aprobación del administrador. Por favor, espera un momento.');
        setPendingApproval(true);
      } catch (error: any) {
        console.error('Error enviando petición de subida de nivel API:', error);
        
        // Verificar si el error es por petición pendiente
        // El error puede venir en diferentes formatos dependiendo de cómo se lance
        let errorMessage = '';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Buscar el mensaje específico del backend
        if (errorMessage.includes('Ya tienes una petición pendiente') || 
            errorMessage.includes('Ya tienes una petición pendiente.')) {
          setError('Ya tienes una petición pendiente de aprobación. Por favor, espera a que el administrador la revise antes de enviar otra.');
        } else {
          setError('Error al enviar la petición. Por favor, inténtalo de nuevo.');
        }
        
        // No mostrar resultados si hay error
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const canSubmit = Object.keys(answers).length === questions.length && !pendingApproval;

  if (loading && !showResults) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <QuizIcon sx={{ mr: 2, color: 'primary.main' }} />
        Cuestionario de Nivelación API
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        "Recuerda que no hay respuestas correctas o incorrectas, lo importante es que respondas con sinceridad y reflexión."
      </Alert>

      {pendingApproval && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Tu cuestionario ha sido enviado y está pendiente de aprobación por un administrador.
        </Alert>
      )}

      {!showResults ? (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          {/* Barra de progreso */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progreso: {Object.keys(answers).length} de {questions.length} preguntas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>

          {/* Pregunta actual */}
          {questions[currentQuestion] && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {questions[currentQuestion].icon}
                <Typography variant="h5" sx={{ ml: 2 }}>
                  Pregunta {currentQuestion + 1} de {questions.length}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {questions[currentQuestion].question}
              </Typography>

              <RadioGroup
                value={answers[questions[currentQuestion].id] || ''}
                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, Number(e.target.value))}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{option.text}</Typography>
                        <Chip 
                          label={`Nivel ${option.apiLevel}`} 
                          size="small" 
                          color={getChipColor(option.apiLevel) as any}
                        />
                      </Box>
                    }
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  />
                ))}
              </RadioGroup>

              {/* Navegación */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Enviando...' : 'Enviar Cuestionario'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              ¡Cuestionario Completado!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tu nivel calculado es:
            </Typography>
          </Box>

          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h3" gutterBottom>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
                  <Chip key={index} label={capability} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowResults(false);
                setAnswers({});
                setCurrentQuestion(0);
                setPendingApproval(false);
                setError(null);
                setSuccess(null);
              }}
            >
              Hacer Otro Cuestionario
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default APIQuestionnaire; 