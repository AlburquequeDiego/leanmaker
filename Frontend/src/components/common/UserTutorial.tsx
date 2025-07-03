import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,

  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface UserTutorialProps {
  userRole: 'student' | 'company';
  onClose: () => void;
}

const studentInstructions = [
  {
    step: 1,
    title: 'Completa tu perfil',
    description: 'Añade tu información académica, habilidades y experiencia para que las empresas te conozcan mejor.',
    action: 'Ir a Perfil',
    icon: <PersonIcon color="primary" />,
  },
  {
    step: 2,
    title: 'Explora proyectos disponibles',
    description: 'Busca proyectos que se ajusten a tus habilidades y nivel de API actual.',
    action: 'Ver Proyectos',
    icon: <AssignmentIcon color="primary" />,
  },
  {
    step: 3,
    title: 'Aplica a proyectos',
    description: 'Envía tu aplicación explicando por qué eres el candidato ideal para el proyecto.',
    action: 'Aplicar',
    icon: <CheckCircleIcon color="primary" />,
  },
  {
    step: 4,
    title: 'Completa proyectos exitosamente',
    description: 'Demuestra tus habilidades y obtén buenas evaluaciones para subir de nivel.',
    action: 'Ver Niveles',
    icon: <TrendingUpIcon color="primary" />,
  },
];

const companyInstructions = [
  {
    step: 1,
    title: 'Completa tu perfil empresarial',
    description: 'Añade información de tu empresa, proyectos anteriores y áreas de especialización.',
    action: 'Ir a Perfil',
    icon: <BusinessIcon color="primary" />,
  },
  {
    step: 2,
    title: 'Publica tu primer proyecto',
    description: 'Define claramente los objetivos, tecnologías requeridas y nivel de API necesario.',
    action: 'Crear Proyecto',
    icon: <AssignmentIcon color="primary" />,
  },
  {
    step: 3,
    title: 'Revisa candidatos',
    description: 'Evalúa los perfiles de los estudiantes que aplican a tu proyecto.',
    action: 'Ver Candidatos',
    icon: <PersonIcon color="primary" />,
  },
  {
    step: 4,
    title: 'Gestiona colaboraciones',
    description: 'Seguimiento del proyecto, evaluaciones y retroalimentación a los estudiantes.',
    action: 'Gestionar',
    icon: <StarIcon color="primary" />,
  },
];

export const UserTutorial: React.FC<UserTutorialProps> = ({ userRole, onClose }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const instructions = userRole === 'student' ? studentInstructions : companyInstructions;

  const handleStepToggle = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {userRole === 'student' ? <SchoolIcon /> : <BusinessIcon />}
          <Typography variant="h6" fontWeight={600}>
            Guía de inicio - {userRole === 'student' ? 'Estudiante' : 'Empresa'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
        Sigue estos pasos para aprovechar al máximo LeanMaker:
      </Typography>

      {/* Instrucciones paso a paso */}
      <List sx={{ p: 0 }}>
        {instructions.map((instruction) => (
          <ListItem
            key={instruction.step}
            sx={{
              p: 0,
              mb: 1,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <ListItem
                button
                onClick={() => handleStepToggle(instruction.step)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {instruction.step}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {instruction.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {instruction.description}
                    </Typography>
                  }
                />
                <Chip
                  label={instruction.action}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mr: 1,
                  }}
                />
                {expandedStep === instruction.step ? (
                  <ExpandLessIcon sx={{ color: 'white' }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: 'white' }} />
                )}
              </ListItem>
              
              <Collapse in={expandedStep === instruction.step}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {instruction.icon}
                    <Typography variant="body2" fontWeight={600}>
                      Consejo:
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {userRole === 'student' 
                      ? `Para el paso ${instruction.step}: ${instruction.step === 1 
                          ? 'Incluye todas tus habilidades técnicas y proyectos anteriores.'
                          : instruction.step === 2
                          ? 'Filtra por tecnologías que conozcas y nivel de API apropiado.'
                          : instruction.step === 3
                          ? 'Personaliza cada aplicación explicando tu motivación.'
                          : 'Mantén comunicación constante y entrega a tiempo.'}`
                      : `Para el paso ${instruction.step}: ${instruction.step === 1 
                          ? 'Describe tu empresa y el tipo de proyectos que desarrollas.'
                          : instruction.step === 2
                          ? 'Sé específico con los requisitos y expectativas del proyecto.'
                          : instruction.step === 3
                          ? 'Revisa portafolios y evaluaciones anteriores.'
                          : 'Proporciona retroalimentación constructiva y oportuna.'}`
                    }
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
          💡 <strong>Tip:</strong> Siempre puedes acceder a ayuda desde el icono de interrogación (?) en la barra superior
        </Typography>
      </Box>
    </Paper>
  );
}; 