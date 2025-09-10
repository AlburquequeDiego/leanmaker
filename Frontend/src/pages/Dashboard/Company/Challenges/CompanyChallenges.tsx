import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { ChallengeHeader } from './ChallengeHeader';
import { PublishChallenge } from './PublishChallenge';
import { ChallengeHistory } from './ChallengeHistory';
import { CollectiveChallenge } from '../../../../types';

export const CompanyChallenges: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState<CollectiveChallenge | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChallengeCreated = (challengeId: string) => {
    // Cambiar a la pestaña de historial para mostrar el nuevo desafío
    setTabValue(2);
  };

  const handleEditChallenge = (challenge: CollectiveChallenge) => {
    setSelectedChallenge(challenge);
    // Aquí podrías abrir un modal de edición o navegar a una página de edición
  };

  const handleDeleteChallenge = (challengeId: string) => {
    // El historial se actualizará automáticamente
    console.log('Desafío eliminado:', challengeId);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header con diseño mejorado */}
        <ChallengeHeader
          title="Desafíos Colectivos"
          subtitle="Conecta con la academia a través de desafíos innovadores que impulsen el desarrollo de proyectos colaborativos"
        />

        {/* Tabs para las 3 secciones */}
        <Paper elevation={2} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontSize: '1rem',
                fontWeight: 600,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
            }}
          >
            <Tab label="Publicar Desafío" />
            <Tab label="Desafíos en Marcha" />
            <Tab label="Historial Completo" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tabValue === 0 && (
              <PublishChallenge onChallengeCreated={handleChallengeCreated} />
            )}

            {tabValue === 1 && (
              <ChallengeHistory
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
              />
            )}

            {tabValue === 2 && (
              <ChallengeHistory
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
