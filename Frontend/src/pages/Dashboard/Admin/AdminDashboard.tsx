import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Panel de Administración
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* TODO: Implementar creación de usuario */}}
          >
            Nuevo Usuario Admin
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Resumen de Usuarios */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
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
                Total Usuarios
              </Typography>
              <Typography variant="h4">150</Typography>
              <Typography variant="body2">
                Usuarios registrados
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Empresas */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
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
                Empresas
              </Typography>
              <Typography variant="h4">25</Typography>
              <Typography variant="body2">
                Empresas activas
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Estudiantes */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
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
                Estudiantes
              </Typography>
              <Typography variant="h4">120</Typography>
              <Typography variant="body2">
                Estudiantes activos
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Proyectos */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'info.light',
                color: 'info.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Proyectos
              </Typography>
              <Typography variant="h4">45</Typography>
              <Typography variant="body2">
                Proyectos activos
              </Typography>
            </Paper>
          </Grid>

          {/* Últimos Usuarios Registrados */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Últimos Usuarios Registrados
              </Typography>
              {/* Aquí irá la tabla de últimos usuarios */}
              <Typography variant="body2" color="text.secondary">
                No hay usuarios recientes
              </Typography>
            </Paper>
          </Grid>

          {/* Actividad del Sistema */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actividad del Sistema
              </Typography>
              {/* Aquí irá el componente de actividad del sistema */}
              <Typography variant="body2" color="text.secondary">
                No hay actividad reciente
              </Typography>
            </Paper>
          </Grid>

          {/* Estadísticas de Proyectos */}
          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas de Proyectos
              </Typography>
              {/* Aquí irá el gráfico de estadísticas */}
              <Typography variant="body2" color="text.secondary">
                No hay estadísticas disponibles
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard; 