import { Box, Paper, Typography } from '@mui/material';

export const CompanyDashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Empresa (Empresa)
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Resumen de Proyectos Activos */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Proyectos Activos
            </Typography>
            <Typography variant="h4">5</Typography>
            <Typography variant="body2">
              Proyectos en desarrollo
            </Typography>
          </Paper>
        </Box>

        {/* Resumen de Postulantes */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'secondary.contrastText',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Postulantes
            </Typography>
            <Typography variant="h4">15</Typography>
            <Typography variant="body2">
              Nuevas solicitudes pendientes
            </Typography>
          </Paper>
        </Box>

        {/* Resumen de Estudiantes Activos */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Estudiantes Activos
            </Typography>
            <Typography variant="h4">8</Typography>
            <Typography variant="body2">
              Participando en proyectos
            </Typography>
          </Paper>
        </Box>

        {/* Resumen de Evaluaciones Pendientes */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Evaluaciones Pendientes
            </Typography>
            <Typography variant="h4">3</Typography>
            <Typography variant="body2">
              Por completar este mes
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Próximas Evaluaciones */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Evaluaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay evaluaciones programadas
            </Typography>
          </Paper>
        </Box>

        {/* Últimas Actividades */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Últimas Actividades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay actividades recientes
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Proyectos Recientes */}
      <Box sx={{ flex: '1 1 100%' }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Proyectos Recientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay proyectos recientes
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default CompanyDashboard;
