import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';

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

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
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

  const handleSubmit = () => {
    const level = calculateAPILevel();
    if (level) {
      setCalculatedLevel(level);
      setShowResults(true);
      setPendingApproval(true);
    }
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const canSubmit = Object.keys(answers).length === questions.length && !pendingApproval;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <QuizIcon sx={{ mr: 2, color: 'primary.main' }} />
        Cuestionario de Nivelación API
      </Typography>
      {pendingApproval && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Tu cuestionario fue enviado y está pendiente de aprobación por administración. No puedes volver a responder hasta que sea aprobado.
        </Alert>
      )}
      {/* Barra de progreso */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progreso del cuestionario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.keys(answers).length} de {questions.length} preguntas
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
        />
      </Box>
      {/* Preguntas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {questions.map((q) => (
          <Box key={q.id} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {q.icon} {q.question}
            </Typography>
            <RadioGroup
              value={answers[q.id] || ''}
              onChange={(_, value) => !pendingApproval && handleAnswerChange(q.id, Number(value))}
            >
              {q.options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio disabled={pendingApproval} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {opt.text}
                      <Chip
                        label={`API ${opt.apiLevel}`}
                        size="small"
                        color={getChipColor(opt.apiLevel) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  disabled={pendingApproval}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </Box>
        ))}
      </Paper>
      <Button
        variant="contained"
        color="primary"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Enviar respuestas
      </Button>
      {/* Dialog de resultados */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              Resultados del Cuestionario API
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {calculatedLevel > 0 && (
            <Box>
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom>
                    {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].title}
                  </Typography>
                  <Typography variant="h6">
                    Nivel API {calculatedLevel}
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Capacidades de tu nivel:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {apiLevelDescriptions[calculatedLevel as keyof typeof apiLevelDescriptions].capabilities.map((capability, index) => (
                  <Chip
                    key={index}
                    label={capability}
                    color="success"
                    variant="outlined"
                    icon={<CheckCircleIcon />}
                  />
                ))}
              </Box>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>¡Felicitaciones!</strong> Tu nivel API ha sido evaluado. Este nivel te permitirá acceder a proyectos 
                  acordes a tus capacidades actuales. Recuerda que puedes mejorar tu nivel realizando más proyectos y 
                  adquiriendo experiencia práctica.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowResults(false);
              // Aquí se podría guardar el resultado en la base de datos
              console.log('Nivel API calculado:', calculatedLevel);
            }}
          >
            Confirmar Nivel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APIQuestionnaire; 