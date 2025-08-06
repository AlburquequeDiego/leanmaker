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
import { useTheme } from '../../../contexts/ThemeContext';

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
  const { themeMode } = useTheme();
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [calculatedLevel, setCalculatedLevel] = useState<number>(0);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentApiLevel, setCurrentApiLevel] = useState<number | null>(null);
  const [loadingApiLevel, setLoadingApiLevel] = useState(true);

  // Obtener el nivel API actual del estudiante al cargar el componente
  useEffect(() => {
    const fetchCurrentApiLevel = async () => {
      try {
        setLoadingApiLevel(true);
        const data = await apiService.get('/api/students/me/');
        const apiLevel = Number(data.api_level);
        if (apiLevel && apiLevel > 0) {
          setCurrentApiLevel(apiLevel);
        } else {
          console.error('Nivel API no válido recibido:', data.api_level);
          setCurrentApiLevel(null);
        }
      } catch (error) {
        console.error('Error fetching current API level:', error);
        setCurrentApiLevel(null);
      } finally {
        setLoadingApiLevel(false);
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
    if (level && currentApiLevel !== null) {
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
  const canSubmit = Object.keys(answers).length === questions.length && !pendingApproval && currentApiLevel !== null;

  // Mostrar loading mientras se obtiene el nivel API
  if (loadingApiLevel) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5'
      }}>
        <CircularProgress sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
      </Box>
    );
  }

  // Si no se pudo obtener el nivel API, mostrar error
  if (currentApiLevel === null) {
    return (
      <Box sx={{ 
        flexGrow: 1, 
        p: 3,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5',
        minHeight: '100vh'
      }}>
        {/* Banner superior con gradiente y contexto */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-30%',
              right: '-30%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  Cuestionario de Nivelación API
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Evalúa tu nivel de competencia y mejora tu perfil profesional
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Alert severity="error" sx={{ 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            Error al cargar tu nivel API
          </Typography>
          <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
            No se pudo obtener tu nivel API actual. Por favor, recarga la página o contacta al administrador si el problema persiste.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Mostrar loading mientras se procesa el cuestionario
  if (loading && !showResults) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5'
      }}>
        <CircularProgress sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
      </Box>
    );
  }

  // Si el estudiante ya tiene el nivel máximo (API 4), mostrar mensaje de que no puede hacer el cuestionario
  if (currentApiLevel >= 4) {
    return (
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        backgroundColor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5', 
        minHeight: '100vh' 
      }}>
        {/* Banner superior con gradiente y contexto */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-30%',
              right: '-30%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  Cuestionario de Nivelación API
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Evalúa tu nivel de competencia y mejora tu perfil profesional
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tarjeta de felicitación con gradiente */}
        <Card sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              🎉 ¡Felicidades! Nivel Máximo Alcanzado
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
              API Nivel {currentApiLevel}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
              Has demostrado competencia máxima en todas las áreas evaluadas por el cuestionario.
              Ya no puedes realizar este cuestionario porque has alcanzado la máxima competencia en el sistema.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
              Puedes continuar participando en proyectos y mejorando tus habilidades, pero tu nivel API ya está en su máximo.
            </Typography>
          </CardContent>
        </Card>

        {/* Tarjeta de capacidades */}
        <Card sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                {apiLevelDescriptions[4].title}
              </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, fontSize: '1.1rem' }}>
                {apiLevelDescriptions[4].description}
              </Typography>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Tus Capacidades:
            </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {apiLevelDescriptions[4].capabilities.map((capability, index) => (
                <Chip 
                  key={index} 
                  label={capability} 
                  size="medium" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }} 
                />
                ))}
              </Box>
            </CardContent>
          </Card>

        {/* Tarjeta de estado */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              ✅ Cuestionario Deshabilitado
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Ya tienes el nivel máximo disponible en el sistema.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      backgroundColor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Cuestionario de Nivelación API
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Evalúa tu nivel de competencia y mejora tu perfil profesional
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}>
          {success}
        </Alert>
      )}

      {/* Tarjeta de información principal */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            💡 Información Importante
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Recuerda que no hay respuestas correctas o incorrectas, lo importante es que respondas con sinceridad y reflexión.
          </Typography>
        </CardContent>
      </Card>

             {/* Tarjeta de nivel actual con descripción completa */}
       {currentApiLevel !== null && (
         <Card sx={{ 
           mb: 3, 
           background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
           color: 'white',
           boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
         }}>
           <CardContent sx={{ p: 4 }}>
             <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
               📊 Tu Nivel Actual: API {currentApiLevel}
             </Typography>
             
             <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
               {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions].title}
             </Typography>
             
             <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, fontSize: '1.1rem' }}>
               {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions].description}
             </Typography>
             
             <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
               Puedes hacer esto en proyectos:
             </Typography>
             
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
               {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
                 <Chip 
                   key={index} 
                   label={capability} 
                   size="medium" 
                   sx={{ 
                     bgcolor: 'rgba(255,255,255,0.2)', 
                     color: 'white',
                     fontWeight: 'bold',
                     '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                   }} 
                 />
               ))}
             </Box>
             
             {currentApiLevel < 4 && (
               <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                 💡 Puedes subir hasta el nivel máximo (API 4) completando este cuestionario.
               </Typography>
             )}
           </CardContent>
         </Card>
      )}

      {pendingApproval && (
        <Card sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              ⏳ Pendiente de Aprobación
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          Tu cuestionario ha sido enviado y está pendiente de aprobación por un administrador.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!showResults ? (
        <Card sx={{ 
          maxWidth: 800, 
          mx: 'auto',
          background: themeMode === 'dark' ? '#1e293b' : 'white',
          boxShadow: themeMode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Barra de progreso mejorada */}
          <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main', 
                  fontWeight: 'bold' 
                }}>
                  📊 Progreso: {Object.keys(answers).length} de {questions.length} preguntas
              </Typography>
                <Typography variant="h6" sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : 'primary.main', 
                  fontWeight: 'bold' 
                }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  bgcolor: themeMode === 'dark' ? '#475569' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 6
                  }
                }} 
              />
          </Box>

          {/* Pregunta actual */}
          {questions[currentQuestion] && (
            <Box>
                

                <Typography variant="h5" gutterBottom sx={{ 
                  mb: 4, 
                  color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary', 
                  fontWeight: 'bold' 
                }}>
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
                      control={<Radio sx={{ 
                        color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                        '&.Mui-checked': {
                          color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                        }
                      }} />}
                    label={
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                           <Typography variant="body1" sx={{ 
                             fontWeight: 'medium',
                             color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
                           }}>
                             {option.text}
                           </Typography>
                        <Chip 
                          label={`Nivel ${option.apiLevel}`} 
                          size="small" 
                          color={getChipColor(option.apiLevel) as any}
                             sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    }
                    sx={{ 
                        mb: 3, 
                        p: 3, 
                        border: themeMode === 'dark' ? '2px solid #475569' : '2px solid #e0e0e0', 
                        borderRadius: 3,
                        bgcolor: themeMode === 'dark' ? '#334155' : 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: themeMode === 'dark' ? '#475569' : '#f8f9fa',
                          borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: themeMode === 'dark' 
                            ? '0 4px 12px rgba(96, 165, 250, 0.2)' 
                            : '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        '&.Mui-checked': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                          bgcolor: themeMode === 'dark' ? '#1e3a8a' : 'primary.light',
                          color: themeMode === 'dark' ? '#f1f5f9' : 'primary.contrastText'
                        }
                    }}
                  />
                ))}
              </RadioGroup>

                {/* Navegación mejorada */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                      color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
                      '&:hover': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                        bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    ← Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                >
                  {loading ? 'Enviando...' : 'Enviar Cuestionario'}
                </Button>
              </Box>
            </Box>
          )}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ 
          maxWidth: 800, 
          mx: 'auto',
          background: themeMode === 'dark' ? '#1e293b' : 'white',
          boxShadow: themeMode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: '50%', 
                bgcolor: 'success.main', 
                color: 'white',
                display: 'inline-flex',
                mb: 2
              }}>
                <CheckCircleIcon sx={{ fontSize: 64 }} />
              </Box>
              <Typography variant="h3" gutterBottom sx={{ 
                color: 'success.main', 
                fontWeight: 'bold' 
              }}>
              ¡Cuestionario Completado!
            </Typography>
              <Typography variant="h5" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', 
                fontWeight: 'medium' 
              }}>
              Tu nivel calculado es:
            </Typography>
          </Box>

            <Card sx={{ 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].title}
              </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].description}
              </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                  Capacidades de este nivel:
                </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
                    <Chip 
                      key={index} 
                      label={capability} 
                      size="medium" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }} 
                    />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Button
                variant="contained"
              onClick={() => {
                setShowResults(false);
                setAnswers({});
                setCurrentQuestion(0);
                setPendingApproval(false);
                setError(null);
                setSuccess(null);
              }}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f8a7d 0%, #2dd66c 100%)'
                  }
                }}
            >
              Hacer Otro Cuestionario
            </Button>
          </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default APIQuestionnaire; 