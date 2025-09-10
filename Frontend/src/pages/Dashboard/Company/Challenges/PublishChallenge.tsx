import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { ChallengeCreateForm } from './ChallengeCreateForm';

interface PublishChallengeProps {
  onChallengeCreated?: (challengeId: string) => void;
}

export const PublishChallenge: React.FC<PublishChallengeProps> = ({
  onChallengeCreated
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuccess = (challengeId: string) => {
    setShowCreateForm(false);
    setError(null);
    if (onChallengeCreated) {
      onChallengeCreated(challengeId);
    }
  };

  const handleCreateError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Publicar Desafío Colectivo
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEventsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            🚀 Resuelve Tus Desafíos Empresariales con Mentes Innovadoras
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            fontSize: '1.1rem', 
            mb: 2,
            color: 'text.primary',
            fontWeight: 400,
            lineHeight: 1.6
          }}>
            <strong style={{ color: 'text.primary' }}>¿Tienes problemas complejos que resolver?</strong> ¿Necesitas soluciones innovadoras para tus desafíos empresariales? 
            Los Desafíos Colectivos te permiten <strong style={{ color: 'text.primary' }}>delegar tus retos más importantes</strong> a equipos de estudiantes talentosos 
            que trabajarán con <strong style={{ color: 'text.primary' }}>mentalidad fresca y enfoques creativos</strong> para encontrar soluciones que tu empresa puede implementar.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: '25px',
            }}
          >
            Crear Desafío para Mi Empresa
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Información adicional */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            💡 ¿Cómo Funciona para Tu Empresa?
          </Typography>
          
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: 3, 
            mb: 3,
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: 2
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 2, 
                  py: 1, 
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  1
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <strong>🎯 Identifica tu problema:</strong> Define el desafío específico que enfrenta tu empresa
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 2, 
                  py: 1, 
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  2
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <strong>👥 Equipos trabajando para ti:</strong> Múltiples equipos de estudiantes compiten para resolver tu problema
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 2, 
                  py: 1, 
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  3
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <strong>💼 Soluciones listas para implementar:</strong> Recibe propuestas concretas que puedes usar en tu empresa
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 2, 
                  py: 1, 
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  4
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <strong>🏆 Selecciona la mejor:</strong> Evalúa todas las soluciones y elige la que mejor se adapte a tus necesidades
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
            📅 Duración de los Desafíos
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'success.light', 
                color: 'success.dark', 
                px: 2, 
                py: 1, 
                borderRadius: 2,
                fontWeight: 600,
                minWidth: '120px',
                textAlign: 'center'
              }}>
                Trimestral
              </Box>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>3 meses:</strong> Ideal para problemas específicos que necesitan solución rápida
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'warning.light', 
                color: 'warning.dark', 
                px: 2, 
                py: 1, 
                borderRadius: 2,
                fontWeight: 600,
                minWidth: '120px',
                textAlign: 'center'
              }}>
                Semestral
              </Box>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>6 meses:</strong> Perfecto para proyectos complejos que requieren desarrollo profundo
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ 
            fontWeight: 500, 
            color: 'text.primary',
            backgroundColor: 'background.paper',
            padding: 2,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            mt: 2,
            boxShadow: 1,
          }}>
            <strong>🎯 Evaluación Final:</strong> Los desafíos que lleguen a completarse 
            completamente por los estudiantes se presentarán en reuniones especiales donde 
            las empresas podrán evaluar las propuestas y seleccionar las mejores soluciones 
            para implementar en sus proyectos reales.
          </Typography>
        </CardContent>
      </Card>

      {/* Formulario de creación */}
      {showCreateForm && (
        <Dialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Desafío Colectivo</DialogTitle>
          <DialogContent>
            <ChallengeCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};
