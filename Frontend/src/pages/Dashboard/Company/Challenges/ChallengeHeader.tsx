import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Animaciones para las figuras
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Componentes estilizados
const AnimatedContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  borderRadius: '20px',
  padding: '40px 20px',
  marginBottom: '30px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}15, transparent, ${theme.palette.secondary.main}15)`,
    borderRadius: '20px',
  }
}));

const FloatingShape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  animation: `${float} 6s ease-in-out infinite`,
  opacity: 0.1,
}));

const PulsingShape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '20px',
  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  animation: `${pulse} 4s ease-in-out infinite`,
  opacity: 0.15,
}));

const RotatingShape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '60px',
  height: '60px',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '10px',
  animation: `${rotate} 8s linear infinite`,
  opacity: 0.1,
}));

interface ChallengeHeaderProps {
  title: string;
  subtitle: string;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ title, subtitle }) => {
  const theme = useTheme();

  return (
    <AnimatedContainer maxWidth="lg">
      {/* Figuras animadas */}
      <FloatingShape
        sx={{
          width: '80px',
          height: '80px',
          top: '10%',
          left: '5%',
          animationDelay: '0s',
        }}
      />
      <FloatingShape
        sx={{
          width: '60px',
          height: '60px',
          top: '20%',
          right: '10%',
          animationDelay: '2s',
        }}
      />
      <PulsingShape
        sx={{
          width: '100px',
          height: '100px',
          bottom: '15%',
          left: '15%',
          animationDelay: '1s',
        }}
      />
      <PulsingShape
        sx={{
          width: '70px',
          height: '70px',
          bottom: '25%',
          right: '20%',
          animationDelay: '3s',
        }}
      />
      <RotatingShape
        sx={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          animationDelay: '1s',
        }}
      />
      <RotatingShape
        sx={{
          bottom: '30%',
          right: '30%',
          animationDelay: '4s',
        }}
      />

      {/* Contenido principal */}
      <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </AnimatedContainer>
  );
};
