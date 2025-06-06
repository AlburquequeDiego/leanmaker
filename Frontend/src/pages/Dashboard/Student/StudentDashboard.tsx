import { Box, Paper, Typography, Grid } from '@mui/material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export const StudentDashboard = () => {
  return (
    <DashboardLayout userRole="student">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido a tu Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Resumen de Proyectos Disponibles */}
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
                Proyectos Disponibles
              </Typography>
              <Typography variant="h4">12</Typography>
              <Typography variant="body2">
                Nuevas oportunidades para ti
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Aplicaciones */}
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
                Mis Aplicaciones
              </Typography>
              <Typography variant="h4">3</Typography>
              <Typography variant="body2">
                Aplicaciones en proceso
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Proyectos Activos */}
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
                Proyectos Activos
              </Typography>
              <Typography variant="h4">2</Typography>
              <Typography variant="body2">
                Proyectos en curso
              </Typography>
            </Paper>
          </Grid>

          {/* Próximas Fechas */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Próximas Fechas
              </Typography>
              {/* Aquí irá el componente de próximas fechas */}
              <Typography variant="body2" color="text.secondary">
                No hay fechas próximas
              </Typography>
            </Paper>
          </Grid>

          {/* Últimas Evaluaciones */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Últimas Evaluaciones
              </Typography>
              {/* Aquí irá el componente de evaluaciones */}
              <Typography variant="body2" color="text.secondary">
                No hay evaluaciones recientes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboard; 