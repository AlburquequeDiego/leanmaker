import { Box, Paper, Typography, Grid } from '@mui/material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export const CompanyDashboard = () => {
  return (
    <DashboardLayout userRole="company">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard de Empresa
        </Typography>
        
        <Grid container spacing={3}>
          {/* Resumen de Proyectos Activos */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
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
          </Grid>

          {/* Resumen de Postulantes */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
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
          </Grid>

          {/* Resumen de Estudiantes Activos */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
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
          </Grid>

          {/* Próximas Evaluaciones */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Próximas Evaluaciones
              </Typography>
              {/* Aquí irá el componente de próximas evaluaciones */}
              <Typography variant="body2" color="text.secondary">
                No hay evaluaciones programadas
              </Typography>
            </Paper>
          </Grid>

          {/* Últimas Actividades */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Últimas Actividades
              </Typography>
              {/* Aquí irá el componente de actividades recientes */}
              <Typography variant="body2" color="text.secondary">
                No hay actividades recientes
              </Typography>
            </Paper>
          </Grid>

          {/* Proyectos Recientes */}
          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Proyectos Recientes
              </Typography>
              {/* Aquí irá la lista de proyectos recientes */}
              <Typography variant="body2" color="text.secondary">
                No hay proyectos recientes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default CompanyDashboard; 